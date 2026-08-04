<template>
  <view class="page">
    <view class="header">
      <view class="header-icon">🌿</view>
      <view class="header-title">草木有方</view>
      <view class="header-subtitle">AI经方中医问诊与中药学习平台</view>
    </view>

    <view class="form-card">
      <view class="form-item">
        <view class="form-label">用户名</view>
        <input class="form-input" type="text" v-model="loginForm.username" placeholder="请输入用户名" placeholder-class="placeholder" />
      </view>
      <view class="form-item">
        <view class="form-label">密码</view>
        <input class="form-input" password v-model="loginForm.password" placeholder="请输入密码" placeholder-class="placeholder" />
      </view>

      <button class="form-btn" :disabled="loading" @click="handleLogin">{{ loading ? '登录中...' : '登录' }}</button>

      <view class="links">
        <text class="link" @click="goForgotPassword">忘记密码</text>
      </view>
    </view>
  </view>
</template>

<script>
import { authApi } from '@/api/index.js'

export default {
  data() {
    return {
      loading: false,
      loginForm: {
        username: '',
        password: ''
      }
    }
  },
  methods: {
    goForgotPassword() {
      uni.navigateTo({
        url: '/pages/forgot-password/forgot-password'
      })
    },
    async handleLogin() {
      const { username, password } = this.loginForm
      if (!username) {
        uni.showToast({ title: '请输入用户名', icon: 'none' })
        return
      }
      if (!password) {
        uni.showToast({ title: '请输入密码', icon: 'none' })
        return
      }
      this.loading = true
      try {
        const res = await authApi.login(username, password)
        uni.setStorageSync('token', JSON.stringify(res.token))
        uni.setStorageSync('userInfo', JSON.stringify(res.user))
        uni.showToast({ title: '登录成功', icon: 'success' })
        setTimeout(() => {
          uni.reLaunch({ url: '/pages/index/index' })
        }, 1000)
      } catch (e) {
        console.error('登录失败', e)
      } finally {
        this.loading = false
      }
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
  font-size: 120rpx;
  margin-bottom: 32rpx;
}

.header-title {
  font-size: 56rpx;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 16rpx;
}

.header-subtitle {
  font-size: 28rpx;
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
}

.link {
  color: #2d8b5e;
}
</style>
