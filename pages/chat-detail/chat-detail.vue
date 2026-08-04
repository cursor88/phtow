<template>
  <view class="page">
    <scroll-view class="chat-scroll" scroll-y :scroll-into-view="lastMsgId" scroll-with-animation>
      <view class="chat-container" v-if="messages.length > 0">
        <view class="session-header" v-if="createdAt">
          <text class="session-time">{{ formatDate(createdAt) }}</text>
        </view>

        <view
          class="msg-item"
          :class="msg.role === 'user' ? 'msg-right' : 'msg-left'"
          v-for="(msg, index) in messages"
          :key="index"
          :id="'msg-' + index"
        >
          <view class="avatar" :class="msg.role === 'user' ? 'avatar-user' : 'avatar-assistant'">
            <text class="avatar-text">{{ msg.role === 'user' ? '我' : '医' }}</text>
          </view>
          <view class="bubble" :class="msg.role === 'user' ? 'bubble-user' : 'bubble-assistant'">
            <text class="bubble-text" :class="msg.role === 'user' ? 'bubble-text-user' : 'bubble-text-assistant'">{{ msg.content }}</text>
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
      loading: false
    }
  },
  onLoad(options) {
    this.sessionId = options.sessionId
    this.loadDetail(options.sessionId)
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
          this.createdAt = result.createdAt || ''
          let history = result.history || []
          this.messages = history.map(h => ({
            role: h.role,
            content: h.content,
            time: h.time || h.timestamp || ''
          }))
          this.$nextTick(() => {
            if (this.messages.length > 0) {
              this.lastMsgId = 'msg-' + (this.messages.length - 1)
            }
          })
        }
      } catch (e) {
        console.error('加载问诊详情失败', e)
      } finally {
        this.loading = false
      }
    },
    formatDate(date) {
      if (!date) return ''
      const d = new Date(date)
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      const h = String(d.getHours()).padStart(2, '0')
      const min = String(d.getMinutes()).padStart(2, '0')
      return `${y}年${m}月${day}日 ${h}:${min}`
    }
  }
}
</script>

<style lang="scss">
.page {
  height: 100vh;
  background: #f0f9f4;
  display: flex;
  flex-direction: column;
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

  &.msg-right {
    flex-direction: row-reverse;
  }
}

.avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-user {
  background: linear-gradient(135deg, #2d8b5e 0%, #36a06d 100%);
  margin-left: 16rpx;
}

.avatar-assistant {
  background: linear-gradient(135deg, #ffffff 0%, #f0f9f4 100%);
  border: 2rpx solid #d1fae5;
  margin-right: 16rpx;
}

.avatar-text {
  font-size: 28rpx;
  font-weight: 600;
}

.avatar-user .avatar-text {
  color: #ffffff;
}

.avatar-assistant .avatar-text {
  color: #2d8b5e;
}

.bubble {
  max-width: 70%;
  padding: 20rpx 24rpx;
  border-radius: 20rpx;
  position: relative;
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

.bubble-text-user {
  color: #ffffff;
}

.bubble-text-assistant {
  color: #1f3a2e;
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
  animation: spin 1s linear infinite;
  margin-bottom: 20rpx;
}

.loading-text {
  font-size: 26rpx;
  color: #6b7280;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
