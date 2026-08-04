<template>
  <view class="page">
    <view class="auth-wrap">
      <view class="auth-header">
        <view class="auth-icon">🌿</view>
        <view class="auth-title">草木有方</view>
        <view class="auth-subtitle">AI经方中医问诊与中药学习平台</view>
      </view>

      <view class="auth-form">
        <!-- 登录模式 -->
        <view v-if="mode === 'login'">
          <view class="form-item">
            <view class="form-label">用户名</view>
            <input class="form-input" type="text" v-model="loginForm.username" placeholder="请输入用户名" />
          </view>
          <view class="form-item">
            <view class="form-label">密码</view>
            <input class="form-input" password v-model="loginForm.password" placeholder="请输入密码" />
          </view>
          <button class="form-btn" :disabled="loading" @click="handleLogin">{{ loading ? '登录中...' : '登录' }}</button>
        </view>

        <!-- 注册模式 -->
        <view v-else>
          <view class="form-item">
            <view class="form-label">用户名</view>
            <input class="form-input" type="text" v-model="registerForm.username" placeholder="请输入用户名" />
          </view>
          <view class="form-item">
            <view class="form-label">密码</view>
            <input class="form-input" password v-model="registerForm.password" placeholder="6-32位" />
          </view>
          <view class="form-item">
            <view class="form-label">确认密码</view>
            <input class="form-input" password v-model="registerForm.confirmPassword" placeholder="请再次输入密码" />
          </view>
          <view class="form-item">
            <view class="form-label">安全问题</view>
            <picker class="form-picker" :range="securityQuestions" :value="registerForm.questionIndex" @change="onQuestionChange">
              <view class="picker-text">{{ securityQuestions[registerForm.questionIndex] }}</view>
            </picker>
          </view>
          <view class="form-item">
            <view class="form-label">安全问题答案</view>
            <input class="form-input" type="text" v-model="registerForm.answer" placeholder="请输入答案" />
          </view>
          <button class="form-btn" :disabled="loading" @click="handleRegister">{{ loading ? '注册中...' : '注册' }}</button>
        </view>

        <view class="auth-links">
          <text class="link" v-if="mode === 'login'" @click="showRegister">注册账号</text>
          <text class="link" v-else @click="showLogin">返回登录</text>
          <text class="divider">|</text>
          <text class="link" @click="showForgotPassword">忘记密码</text>
          <text class="divider">|</text>
          <text class="link" @click="showGuestMode">访客模式</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { authApi } from '@/api/index.js'
import utils from '@/utils/index.js'

export default {
  data() {
    return {
      mode: 'login',
      loading: false,
      loginForm: {
        username: '',
        password: ''
      },
      registerForm: {
        username: '',
        password: '',
        confirmPassword: '',
        questionIndex: 0,
        answer: ''
      },
      securityQuestions: [
        '您的昵称是什么？',
        '您的母亲叫什么名字？',
        '您的出生城市是哪里？',
        '您最喜欢的药材是什么？'
      ]
    }
  },
  methods: {
    showRegister() {
      this.mode = 'register'
      this.resetRegisterForm()
    },
    showLogin() {
      this.mode = 'login'
      this.resetLoginForm()
    },
    showForgotPassword() {
      uni.navigateTo({
        url: '/pages/forgot-password/forgot-password'
      })
    },
    showGuestMode() {
      uni.switchTab({
        url: '/pages/index/index'
      })
    },
    resetLoginForm() {
      this.loginForm.username = ''
      this.loginForm.password = ''
    },
    resetRegisterForm() {
      this.registerForm.username = ''
      this.registerForm.password = ''
      this.registerForm.confirmPassword = ''
      this.registerForm.questionIndex = 0
      this.registerForm.answer = ''
    },
    onQuestionChange(e) {
      this.registerForm.questionIndex = e.detail.value
    },
    async handleLogin() {
      const { username, password } = this.loginForm
      if (!username) {
        utils.showToast('请输入用户名')
        return
      }
      if (!password) {
        utils.showToast('请输入密码')
        return
      }
      this.loading = true
      try {
        const res = await authApi.login(username, password)
        utils.storage.set('token', res.token)
        utils.storage.set('userInfo', res.user)
        utils.showToast('登录成功', 'success')
        setTimeout(() => {
          uni.switchTab({
            url: '/pages/index/index'
          })
        }, 1000)
      } catch (e) {
        console.error('登录失败', e)
      } finally {
        this.loading = false
      }
    },
    async handleRegister() {
      const { username, password, confirmPassword, questionIndex, answer } = this.registerForm
      if (!username) {
        utils.showToast('请输入用户名')
        return
      }
      if (!password) {
        utils.showToast('请输入密码')
        return
      }
      if (password !== confirmPassword) {
        utils.showToast('两次密码输入不一致')
        return
      }
      if (!answer) {
        utils.showToast('请输入安全问题答案')
        return
      }
      this.loading = true
      try {
        await authApi.register({
          username,
          password,
          nickname: username,
          securityQuestion: this.securityQuestions[questionIndex],
          securityAnswer: answer
        })
        utils.showToast('注册成功', 'success')
        setTimeout(() => {
          this.mode = 'login'
          this.loginForm.username = username
          this.loginForm.password = ''
          this.resetRegisterForm()
        }, 1000)
      } catch (e) {
        console.error('注册失败', e)
      } finally {
        this.loading = false
      }
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
  margin-bottom: 80rpx;
}

.auth-icon {
  font-size: 120rpx;
  margin-bottom: 40rpx;
}

.auth-title {
  font-size: 56rpx;
  font-weight: 700;
  color: #2d8b5e;
  margin-bottom: 16rpx;
}

.auth-subtitle {
  font-size: 28rpx;
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
  min-height: 96rpx;
  height: 96rpx;
  padding: 24rpx 32rpx;
  border: 1rpx solid #e5e7eb;
  border-radius: 20rpx;
  font-size: 30rpx;
  line-height: 96rpx;
  background: #fff;
  box-sizing: border-box;
}

.form-picker {
  width: 100%;
  min-height: 96rpx;
  height: 96rpx;
  padding: 24rpx 32rpx;
  border: 1rpx solid #e5e7eb;
  border-radius: 20rpx;
  font-size: 30rpx;
  line-height: 96rpx;
  background: #fff;
  box-sizing: border-box;
}

.picker-text {
  font-size: 30rpx;
  color: #333;
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

.auth-links {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 48rpx;
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
