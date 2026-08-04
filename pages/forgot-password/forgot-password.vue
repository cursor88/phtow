<template>
  <view class="page">
    <view class="auth-wrap">
      <view class="auth-header">
        <view class="auth-icon">🔐</view>
        <view class="auth-title">找回密码</view>
        <view class="auth-subtitle">回答安全问题后即可重置密码</view>
      </view>

      <view class="auth-form">
        <!-- 第一步：输入用户名 -->
        <view v-if="step === 1">
          <view class="form-item">
            <view class="form-label">用户名</view>
            <input class="form-input" type="text" v-model="username" placeholder="请输入用户名" />
          </view>
          <button class="form-btn" :disabled="loading" @click="handleStep1">{{ loading ? '查询中...' : '下一步' }}</button>
          <view class="auth-link-center">
            <text class="link" @click="backToLogin">返回登录</text>
          </view>
        </view>

        <!-- 第二步：回答安全问题并重置密码 -->
        <view v-else>
          <view class="form-item">
            <view class="form-label">安全问题</view>
            <view class="question-box">{{ securityQuestion }}</view>
          </view>
          <view class="form-item">
            <view class="form-label">答案</view>
            <input class="form-input" type="text" v-model="answer" placeholder="请输入答案" />
          </view>
          <view class="form-item">
            <view class="form-label">新密码</view>
            <input class="form-input" password v-model="newPassword" placeholder="6-32位" />
          </view>
          <button class="form-btn" :disabled="loading" @click="handleReset">{{ loading ? '重置中...' : '重置密码' }}</button>
          <view class="auth-link-center">
            <text class="link" @click="backToStep1">上一步</text>
            <text class="divider">|</text>
            <text class="link" @click="backToLogin">返回登录</text>
          </view>
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
      username: '',
      securityQuestion: '',
      answer: '',
      newPassword: ''
    }
  },
  methods: {
    async handleStep1() {
      if (!this.username) {
        uni.showToast({ title: '请输入用户名', icon: 'none' })
        return
      }
      this.loading = true
      try {
        const res = await authApi.forgotStep1(this.username)
        this.securityQuestion = res.question
        this.step = 2
      } catch (e) {
        console.error('查询安全问题失败', e)
      } finally {
        this.loading = false
      }
    },
    async handleReset() {
      if (!this.answer) {
        uni.showToast({ title: '请输入答案', icon: 'none' })
        return
      }
      if (!this.newPassword) {
        uni.showToast({ title: '请输入新密码', icon: 'none' })
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
      this.answer = ''
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

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f0f9f4;
}

.auth-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 80rpx 40rpx;
  box-sizing: border-box;
}

.auth-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 64rpx;
}

.auth-icon {
  font-size: 96rpx;
  margin-bottom: 32rpx;
}

.auth-title {
  font-size: 44rpx;
  font-weight: 700;
  color: #333;
  margin-bottom: 16rpx;
}

.auth-subtitle {
  font-size: 26rpx;
  color: #999;
}

.auth-form {
  width: 100%;
  max-width: 640rpx;
}

.form-item {
  margin-bottom: 32rpx;
}

.form-label {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
}

.form-input {
  width: 100%;
  padding: 24rpx 32rpx;
  border: 1rpx solid #e5e7eb;
  border-radius: 20rpx;
  font-size: 30rpx;
  background: #fff;
  box-sizing: border-box;
}

.question-box {
  padding: 24rpx 32rpx;
  background: #f3f4f6;
  border-radius: 20rpx;
  font-size: 28rpx;
  color: #555;
  line-height: 1.5;
}

.form-btn {
  width: 100%;
  padding: 28rpx 0;
  background: #2d8b5e;
  color: #fff;
  border: none;
  border-radius: 20rpx;
  font-size: 32rpx;
  font-weight: 600;
  margin-top: 16rpx;
  margin-bottom: 32rpx;
  line-height: 1;

  &::after {
    border: none;
  }

  &[disabled] {
    background: rgba(45, 139, 94, 0.6);
    color: #fff;
  }
}

.auth-link-center {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24rpx;
  font-size: 26rpx;
  color: #666;
}

.link {
  color: #2d8b5e;
}

.divider {
  color: #ccc;
}
</style>
