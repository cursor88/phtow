<template>
  <view class="page">
    <view class="header">
      <view class="header-icon">🔐</view>
      <view class="header-title">找回密码</view>
      <view class="header-subtitle">回答安全问题后即可重置密码</view>
    </view>

    <view class="form-card">
      <!-- 第一步：验证用户名 + 安全问题 -->
      <view v-if="step === 1">
        <view class="form-item">
          <view class="form-label">用户名</view>
          <input class="form-input" type="text" v-model="username" placeholder="请输入用户名" placeholder-class="placeholder" :disabled="questionFetched" />
        </view>

        <view class="form-item" v-if="questionFetched">
          <view class="form-label">安全问题</view>
          <view class="question-box">{{ securityQuestion }}</view>
        </view>

        <view class="form-item" v-if="questionFetched">
          <view class="form-label">答案</view>
          <input class="form-input" type="text" v-model="answer" placeholder="请输入答案" placeholder-class="placeholder" />
        </view>

        <button class="form-btn" :disabled="loading" @click="handleStep1">{{ step1BtnText }}</button>

        <view class="links">
          <text class="link" @click="backToLogin">返回登录</text>
        </view>
      </view>

      <!-- 第二步：重置密码 -->
      <view v-else>
        <view class="form-item">
          <view class="form-label">新密码</view>
          <input class="form-input" password v-model="newPassword" placeholder="6-32位" placeholder-class="placeholder" />
        </view>

        <button class="form-btn" :disabled="loading" @click="handleReset">{{ loading ? '重置中...' : '重置密码' }}</button>

        <view class="links">
          <text class="link" @click="backToStep1">上一步</text>
          <text class="divider">|</text>
          <text class="link" @click="backToLogin">返回登录</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { authApi } from '@/api/index.js'

export default {
  data() {
    return {
      step: 1,
      loading: false,
      questionFetched: false,
      username: '',
      securityQuestion: '',
      answer: '',
      newPassword: ''
    }
  },
  computed: {
    step1BtnText() {
      if (this.loading) return '查询中...'
      return this.questionFetched ? '下一步' : '获取安全问题'
    }
  },
  methods: {
    async handleStep1() {
      if (!this.username) {
        uni.showToast({ title: '请输入用户名', icon: 'none' })
        return
      }
      if (!this.questionFetched) {
        this.loading = true
        try {
          const res = await authApi.forgotStep1(this.username)
          this.securityQuestion = res.question
          this.questionFetched = true
        } catch (e) {
          console.error('查询安全问题失败', e)
        } finally {
          this.loading = false
        }
        return
      }
      if (!this.answer) {
        uni.showToast({ title: '请输入答案', icon: 'none' })
        return
      }
      this.step = 2
    },
    async handleReset() {
      if (!this.newPassword) {
        uni.showToast({ title: '请输入新密码', icon: 'none' })
        return
      }
      if (this.newPassword.length < 6 || this.newPassword.length > 32) {
        uni.showToast({ title: '密码长度6-32位', icon: 'none' })
        return
      }
      this.loading = true
      try {
        await authApi.forgotReset({
          username: this.username,
          answer: this.answer,
          newPassword: this.newPassword
        })
        uni.showToast({ title: '密码重置成功', icon: 'success' })
        setTimeout(() => {
          this.backToLogin()
        }, 1500)
      } catch (e) {
        console.error('重置密码失败', e)
      } finally {
        this.loading = false
      }
    },
    backToStep1() {
      this.step = 1
      this.newPassword = ''
    },
    backToLogin() {
      uni.navigateBack({
        fail: () => {
          uni.redirectTo({
            url: '/pages/login/login'
          })
        }
      })
    }
  }
}
</script>

<style>
.page {
  min-height: 100vh;
  background: #f0f9f4;
}

.header {
  background: linear-gradient(135deg, #2d8b5e 0%, #3da878 100%);
  padding: 120rpx 40rpx 140rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.header-icon {
  font-size: 96rpx;
  margin-bottom: 24rpx;
}

.header-title {
  font-size: 48rpx;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 16rpx;
}

.header-subtitle {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.85);
}

.form-card {
  margin: -80rpx 40rpx 0;
  background: #ffffff;
  border-radius: 24rpx;
  padding: 48rpx 40rpx;
  box-shadow: 0 8rpx 30rpx rgba(45, 139, 94, 0.12);
  box-sizing: border-box;
}

.form-item {
  margin-bottom: 32rpx;
}

.form-label {
  font-size: 28rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 16rpx;
}

.form-input {
  width: 100%;
  height: 96rpx;
  padding: 0 32rpx;
  border: 1rpx solid #e5e7eb;
  border-radius: 20rpx;
  font-size: 30rpx;
  color: #333333;
  background: #f9fafb;
  box-sizing: border-box;
}

.placeholder {
  color: #bbbbbb;
}

.question-box {
  min-height: 96rpx;
  padding: 24rpx 32rpx;
  background: #f3f4f6;
  border-radius: 20rpx;
  font-size: 28rpx;
  color: #555555;
  line-height: 1.5;
  box-sizing: border-box;
}

.form-btn {
  width: 100%;
  height: 96rpx;
  line-height: 96rpx;
  background: #2d8b5e;
  color: #ffffff;
  border: none;
  border-radius: 20rpx;
  font-size: 32rpx;
  font-weight: 600;
  margin-top: 16rpx;
  margin-bottom: 32rpx;
  padding: 0;
}

.form-btn::after {
  border: none;
}

.form-btn[disabled] {
  background: rgba(45, 139, 94, 0.6);
  color: #ffffff;
}

.links {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 26rpx;
  gap: 24rpx;
}

.link {
  color: #2d8b5e;
}

.divider {
  color: #cccccc;
}
</style>
