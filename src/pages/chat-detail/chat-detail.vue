<template>
  <view class="page">
    <view class="nav-bar">
      <view class="back" @click="goBack">
        <text>←</text>
      </view>
      <text class="title">问诊详情</text>
      <view class="nav-right"></view>
    </view>

    <scroll-view
      class="chat-scroll"
      scroll-y
      :scroll-into-view="lastMsgId"
      scroll-with-animation
    >
      <view class="chat-container" v-if="messages.length > 0">
        <view class="session-header" v-if="createdAt">
          <text class="session-time">{{ formatDate(createdAt) }}</text>
        </view>

        <view
          class="msg-item"
          :class="msg.role === 'user' ? 'msg-right' : 'msg-left'"
          v-for="msg in messages"
          :key="msg.id"
          :id="'msg-' + msg.id"
        >
          <view class="avatar" v-if="msg.role !== 'user'">🌿</view>
          <view class="bubble" :class="msg.role === 'user' ? 'bubble-user' : 'bubble-assistant'">
            <text class="bubble-text">{{ msg.content }}</text>
          </view>
        </view>

        <view class="msg-item msg-left" id="detail-loading" v-if="sending">
          <view class="avatar">🌿</view>
          <view class="bubble bubble-assistant loading-bubble">
            <view class="loading-dots">
              <view class="dot"></view>
              <view class="dot"></view>
              <view class="dot"></view>
            </view>
          </view>
        </view>

        <view class="chat-bottom"></view>
      </view>

      <view class="empty-state" v-else-if="!loading">
        <text class="empty-icon">💬</text>
        <text class="empty-text">暂无对话记录</text>
      </view>

      <view class="loading-state" v-if="loading">
        <view class="loading-spinner"></view>
        <text class="loading-text">加载中...</text>
      </view>
    </scroll-view>

    <view class="chat-input-area">
      <input
        class="chat-input"
        type="text"
        v-model="inputText"
        placeholder="继续提问..."
        confirm-type="send"
        @confirm="sendContinue()"
      />
      <view
        class="chat-send-btn"
        :class="{ disabled: sending || !inputText.trim() }"
        @click="sendContinue()"
      >
        <text class="send-icon">➤</text>
      </view>
    </view>
  </view>
</template>

<script>
import { chatApi } from '@/api/index.js'

export default {
  data() {
    return {
      messages: [],
      sessionId: '',
      createdAt: '',
      lastMsgId: '',
      loading: false,
      sending: false,
      inputText: '',
      msgIdSeq: 0
    }
  },
  onLoad(options) {
    this.sessionId = options.id || options.sessionId || ''
    this.loadDetail(this.sessionId)
  },
  methods: {
    async loadDetail(id) {
      if (!id) {
        uni.showToast({ title: '缺少会话ID', icon: 'none' })
        return
      }
      this.loading = true
      try {
        const result = await chatApi.getDetail(id)
        if (result) {
          this.createdAt = result.createdAt || result.endedAt || ''
          const history = result.history || result.messages || []
          this.messages = history.map((h, i) => ({
            id: i,
            role: h.role || 'assistant',
            content: h.content || h.text || ''
          }))
          this.msgIdSeq = this.messages.length
          this.scrollToBottom()
        }
      } catch (e) {
        console.error('加载问诊详情失败', e)
      } finally {
        this.loading = false
      }
    },
    async sendContinue() {
      const content = (this.inputText || '').trim()
      if (!content || this.sending) return
      this.messages.push({
        id: this.msgIdSeq++,
        role: 'user',
        content: content
      })
      this.inputText = ''
      this.sending = true
      this.scrollToBottom()
      try {
        const result = await chatApi.continueChat({ sessionId: this.sessionId, message: content })
        const reply = this.buildReply(result)
        this.messages.push({
          id: this.msgIdSeq++,
          role: 'assistant',
          content: reply
        })
      } catch (e) {
        this.messages.push({
          id: this.msgIdSeq++,
          role: 'assistant',
          content: '网络异常，请稍后重试。'
        })
      } finally {
        this.sending = false
        this.scrollToBottom()
      }
    },
    buildReply(result) {
      if (typeof result === 'string') return result
      if (result) {
        return result.text || result.content || result.reply || result.message || '抱歉，未能理解您的问题，请重新描述。'
      }
      return '抱歉，未能理解您的问题，请重新描述。'
    },
    scrollToBottom() {
      setTimeout(() => {
        if (this.sending) {
          this.lastMsgId = 'detail-loading'
          return
        }
        const last = this.messages[this.messages.length - 1]
        if (last) {
          this.lastMsgId = 'msg-' + last.id
        }
      }, 100)
    },
    formatDate(date) {
      if (!date) return ''
      const d = new Date(date)
      if (isNaN(d.getTime())) return ''
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      const h = String(d.getHours()).padStart(2, '0')
      const min = String(d.getMinutes()).padStart(2, '0')
      return `${y}年${m}月${day}日 ${h}:${min}`
    },
    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 0;
  background: #f0f9f4;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 60rpx 32rpx 24rpx;
  background: linear-gradient(135deg, #2d8b5e, #3da878);
  color: #ffffff;
  box-shadow: 0 2rpx 8rpx rgba(45, 139, 94, 0.2);
}

.nav-bar .back {
  width: 80rpx;
  font-size: 40rpx;
}

.nav-bar .title {
  font-size: 36rpx;
  font-weight: 600;
}

.nav-bar .nav-right {
  width: 80rpx;
}

.chat-scroll {
  flex: 1;
  height: 0;
}

.chat-container {
  padding: 24rpx 24rpx 0;
}

.session-header {
  display: flex;
  justify-content: center;
  margin-bottom: 24rpx;
}

.session-time {
  font-size: 22rpx;
  color: #9ca3af;
  background: rgba(45, 139, 94, 0.08);
  padding: 6rpx 20rpx;
  border-radius: 20rpx;
}

.msg-item {
  display: flex;
  margin-bottom: 32rpx;
  align-items: flex-start;
}

.msg-right {
  flex-direction: row-reverse;
}

.avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: #ffffff;
  border: 2rpx solid #d1fae5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  flex-shrink: 0;
  margin-right: 16rpx;
}

.msg-right .avatar {
  margin-right: 0;
  margin-left: 16rpx;
}

.bubble {
  max-width: 70%;
  padding: 20rpx 24rpx;
  border-radius: 20rpx;
  word-break: break-word;
}

.bubble-user {
  background: linear-gradient(135deg, #2d8b5e 0%, #36a06d 100%);
  border-top-right-radius: 6rpx;
  box-shadow: 0 4rpx 12rpx rgba(45, 139, 94, 0.2);
}

.bubble-assistant {
  background: #ffffff;
  border-top-left-radius: 6rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.bubble-text {
  font-size: 28rpx;
  line-height: 1.6;
  white-space: pre-wrap;
}

.bubble-user .bubble-text {
  color: #ffffff;
}

.bubble-assistant .bubble-text {
  color: #1f3a2e;
}

.loading-bubble {
  padding: 28rpx;
}

.loading-dots {
  display: flex;
  gap: 10rpx;
  align-items: center;
}

.dot {
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  background: #2d8b5e;
  opacity: 0.5;
  animation: detailDot 1.2s infinite ease-in-out;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes detailDot {
  0%, 80%, 100% {
    opacity: 0.4;
    transform: scale(0.8);
  }
  40% {
    opacity: 1;
    transform: scale(1);
  }
}

.chat-bottom {
  height: 40rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 0;
}

.empty-icon {
  font-size: 100rpx;
  margin-bottom: 24rpx;
  opacity: 0.6;
}

.empty-text {
  font-size: 30rpx;
  color: #6b7280;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
}

.loading-spinner {
  width: 48rpx;
  height: 48rpx;
  border: 4rpx solid #d1fae5;
  border-top-color: #2d8b5e;
  border-radius: 50%;
  animation: detailSpin 1s linear infinite;
  margin-bottom: 20rpx;
}

.loading-text {
  font-size: 26rpx;
  color: #6b7280;
}

@keyframes detailSpin {
  to {
    transform: rotate(360deg);
  }
}

.chat-input-area {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx 24rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: #ffffff;
  border-top: 1rpx solid #e8efe9;
  box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.chat-input {
  flex: 1;
  height: 96rpx;
  min-height: 96rpx;
  padding: 0 28rpx;
  background: #f5f7f6;
  border-radius: 48rpx;
  font-size: 30rpx;
  line-height: 96rpx;
  color: #2d3a35;
}

.chat-send-btn {
  width: 96rpx;
  height: 96rpx;
  min-height: 96rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #2d8b5e, #3da878);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  flex-shrink: 0;
  box-shadow: 0 2rpx 8rpx rgba(45, 139, 94, 0.3);
}

.chat-send-btn:active {
  opacity: 0.85;
}

.chat-send-btn.disabled {
  opacity: 0.4;
}

.send-icon {
  color: #ffffff;
}
</style>
