<template>
  <view class="page">
    <view class="nav-bar">
      <view class="back" @click="goBack">
        <text>←</text>
      </view>
      <text class="title">经方问诊</text>
      <view class="nav-right" @click="goHistory">
        <text class="nav-right-text">问诊记录</text>
      </view>
    </view>

    <view class="chat-container">
      <scroll-view
        class="chat-messages"
        scroll-y
        :scroll-into-view="scrollToId"
        scroll-with-animation
      >
        <view class="message-list">
          <view
            class="chat-message"
            :class="msg.role === 'user' ? 'msg-user' : 'msg-assistant'"
            v-for="msg in messages"
            :key="msg.id"
            :id="'msg-' + msg.id"
          >
            <view class="chat-avatar" v-if="msg.role === 'assistant'">🌿</view>
            <view class="chat-bubble" :class="msg.role === 'user' ? 'bubble-user' : 'bubble-assistant'">
              <view class="diagnosis-tag" v-if="msg.diagnosis">🏥 {{ msg.diagnosis }}</view>
              <text class="bubble-text">{{ msg.content }}</text>
              <view class="prescription-card" v-if="msg.prescription">
                <view class="prescription-name">📜 {{ msg.prescription.name }}</view>
                <view class="prescription-ingredients" v-if="msg.prescription.ingredients">成分：{{ prescriptionText(msg.prescription.ingredients) }}</view>
                <view class="prescription-explanation" v-if="msg.prescription.explanation">说明：{{ msg.prescription.explanation }}</view>
              </view>
              <view class="suggested-questions" v-if="msg.suggestions && msg.suggestions.length">
                <view
                  class="suggested-question"
                  v-for="(q, i) in msg.suggestions"
                  :key="i"
                  @click="sendMessage(q)"
                >
                  <text>{{ q }}</text>
                </view>
              </view>
            </view>
          </view>

          <view class="chat-message msg-assistant" id="msg-loading" v-if="loading">
            <view class="chat-avatar">🌿</view>
            <view class="chat-bubble bubble-assistant loading-bubble">
              <view class="loading-dots">
                <view class="dot"></view>
                <view class="dot"></view>
                <view class="dot"></view>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>

      <view class="chat-input-area">
        <input
          class="chat-input"
          type="text"
          v-model="inputText"
          placeholder="输入您的症状或问题..."
          confirm-type="send"
          @confirm="sendMessage()"
        />
        <view
          class="chat-send-btn"
          :class="{ disabled: loading || !inputText.trim() }"
          @click="sendMessage()"
        >
          <text class="send-icon">➤</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { chatApi } from '@/api/index.js'

export default {
  data() {
    return {
      messages: [
        {
          id: 0,
          role: 'assistant',
          content: '您好！我是倪海厦经方中医助手，深谙《伤寒论》《金匮要略》《黄帝内经》之理。请描述您的症状，我将为您辨证施治，提供经方建议。',
          diagnosis: '',
          prescription: null,
          suggestions: [
            '最近总是失眠怎么办',
            '脾胃虚弱如何调理',
            '我感冒发烧了怎么办',
            '湿气重该如何祛除'
          ]
        }
      ],
      inputText: '',
      loading: false,
      scrollToId: '',
      msgIdSeq: 1,
      sessionId: ''
    }
  },
  methods: {
    async sendMessage(text) {
      const content = (text || this.inputText || '').trim()
      if (!content || this.loading) return

      this.messages.push({
        id: this.msgIdSeq++,
        role: 'user',
        content: content
      })
      this.inputText = ''
      this.loading = true
      this.scrollToBottom()

      try {
        const result = await chatApi.sendMessage({ sessionId: this.sessionId, message: content })
        if (result && result.sessionId) {
          this.sessionId = result.sessionId
        }
        this.messages.push(this.buildAssistantMessage(result))
      } catch (e) {
        this.messages.push({
          id: this.msgIdSeq++,
          role: 'assistant',
          content: '网络异常，请稍后重试。'
        })
      } finally {
        this.loading = false
        this.scrollToBottom()
      }
    },
    buildAssistantMessage(result) {
      const msg = {
        id: this.msgIdSeq++,
        role: 'assistant',
        content: '',
        diagnosis: '',
        prescription: null,
        suggestions: []
      }
      if (typeof result === 'string') {
        msg.content = result
      } else if (result) {
        msg.content = result.text || result.content || result.reply || result.message || '抱歉，未能理解您的问题，请重新描述。'
        msg.diagnosis = result.diagnosis || ''
        msg.prescription = result.prescription || null
        msg.suggestions = result.suggestedQuestions || result.suggestions || []
      } else {
        msg.content = '抱歉，未能理解您的问题，请重新描述。'
      }
      return msg
    },
    prescriptionText(ingredients) {
      if (Array.isArray(ingredients)) return ingredients.join('、')
      return ingredients
    },
    scrollToBottom() {
      setTimeout(() => {
        if (this.loading) {
          this.scrollToId = 'msg-loading'
          return
        }
        const last = this.messages[this.messages.length - 1]
        if (last) {
          this.scrollToId = 'msg-' + last.id
        }
      }, 100)
    },
    goBack() {
      uni.navigateBack()
    },
    goHistory() {
      uni.navigateTo({
        url: '/pages/chat-history/chat-history'
      })
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
  background: #f5f7f6;
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
  min-width: 80rpx;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.nav-right-text {
  font-size: 26rpx;
  color: #ffffff;
}

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.chat-messages {
  flex: 1;
  min-height: 0;
}

.message-list {
  display: flex;
  flex-direction: column;
  padding: 24rpx;
  gap: 24rpx;
}

.chat-message {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
}

.msg-user {
  flex-direction: row-reverse;
}

.chat-avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  flex-shrink: 0;
  box-shadow: 0 2rpx 6rpx rgba(45, 139, 94, 0.15);
}

.chat-bubble {
  max-width: 540rpx;
  padding: 20rpx 28rpx;
  line-height: 1.6;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.05);
}

.bubble-user {
  background: linear-gradient(135deg, #2d8b5e, #3da878);
  color: #ffffff;
  border-radius: 24rpx 24rpx 8rpx 24rpx;
}

.bubble-assistant {
  background: #ffffff;
  color: #2d3a35;
  border-radius: 24rpx 24rpx 24rpx 8rpx;
  border: 1rpx solid #e8efe9;
}

.bubble-text {
  font-size: 28rpx;
  white-space: pre-wrap;
  word-break: break-word;
}

.diagnosis-tag {
  display: inline-block;
  font-size: 24rpx;
  color: #2d8b5e;
  background: rgba(45, 139, 94, 0.1);
  padding: 6rpx 16rpx;
  border-radius: 12rpx;
  margin-bottom: 12rpx;
}

.prescription-card {
  margin-top: 16rpx;
  padding: 20rpx;
  background: rgba(45, 139, 94, 0.06);
  border: 1rpx solid rgba(45, 139, 94, 0.15);
  border-radius: 16rpx;
}

.prescription-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #2d8b5e;
  margin-bottom: 10rpx;
}

.prescription-ingredients {
  font-size: 24rpx;
  color: #4b5563;
  margin-bottom: 8rpx;
}

.prescription-explanation {
  font-size: 24rpx;
  color: #6b7280;
}

.suggested-questions {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-top: 20rpx;
}

.suggested-question {
  background: rgba(45, 139, 94, 0.08);
  color: #2d8b5e;
  padding: 16rpx 24rpx;
  border-radius: 16rpx;
  font-size: 26rpx;
  border: 1rpx solid rgba(45, 139, 94, 0.2);
}

.suggested-question:active {
  background: rgba(45, 139, 94, 0.16);
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
  animation: consultDotPulse 1.2s infinite ease-in-out;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes consultDotPulse {
  0%, 80%, 100% {
    opacity: 0.4;
    transform: scale(0.8);
  }
  40% {
    opacity: 1;
    transform: scale(1);
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
