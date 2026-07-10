<template>
  <view class="page">
    <view class="identify-container">
      <view class="preview-area" v-if="imagePath">
        <image class="preview-img" :src="imagePath" mode="aspectFit"></image>
        <view class="preview-mask" v-if="identifying">
          <view class="loading-spinner"></view>
          <text class="loading-text">AI识别中...</text>
        </view>
      </view>
      <view class="placeholder-area" v-else>
        <view class="placeholder-icon">📸</view>
        <view class="placeholder-text">选择图片开始识别</view>
        <view class="placeholder-desc">支持拍照或从相册选择药材图片</view>
      </view>

      <view class="action-area">
        <view class="action-btns" v-if="!imagePath || !identifying">
          <button class="primary-btn" @click="takePhoto">
            <text class="btn-icon">📷</text>
            拍照识别
          </button>
          <button class="secondary-btn" @click="chooseImage">
            <text class="btn-icon">🖼️</text>
            从相册选择
          </button>
        </view>
        <view class="result-area" v-if="result && !identifying">
          <view class="result-card">
            <view class="result-header">
              <view class="result-name">{{ result.name }}</view>
              <view class="result-accuracy">相似度 {{ (result.accuracy * 100).toFixed(1) }}%</view>
            </view>
            <view class="result-pinyin">{{ result.pinyin }}</view>
            <view class="result-category">
              <text class="tag">{{ result.category }}</text>
            </view>
            <view class="result-effect">
              <view class="result-label">功效</view>
              <view class="result-value">{{ result.effect }}</view>
            </view>
            <button class="primary-btn detail-btn" @click="goToDetail">查看详情</button>
          </view>
        </view>
      </view>

      <view class="tips-area card" v-if="!imagePath">
        <view class="section-title">识别小贴士</view>
        <view class="tip-list">
          <view class="tip-item">
            <text class="tip-num">1</text>
            <text class="tip-text">确保光线充足，药材清晰可见</text>
          </view>
          <view class="tip-item">
            <text class="tip-num">2</text>
            <text class="tip-text">尽量拍摄药材完整形态</text>
          </view>
          <view class="tip-item">
            <text class="tip-num">3</text>
            <text class="tip-text">背景简洁，避免杂物干扰</text>
          </view>
          <view class="tip-item">
            <text class="tip-num">4</text>
            <text class="tip-text">仅供参考，用药请遵医嘱</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { herbApi } from '@/api/index.js'

export default {
  data() {
    return {
      imagePath: '',
      identifying: false,
      result: null
    }
  },
  onLoad(options) {
    if (options.image) {
      this.imagePath = decodeURIComponent(options.image)
      setTimeout(() => {
        this.doIdentify()
      }, 300)
    }
  },
  onShow() {
    if (this.result && !this.identifying) {
      this.imagePath = ''
      this.result = null
    }
  },
  methods: {
    takePhoto() {
      uni.chooseImage({
        count: 1,
        sourceType: ['camera'],
        success: (res) => {
          this.imagePath = res.tempFilePaths[0]
          this.doIdentify()
        }
      })
    },
    chooseImage() {
      uni.chooseImage({
        count: 1,
        sourceType: ['album'],
        success: (res) => {
          this.imagePath = res.tempFilePaths[0]
          this.doIdentify()
        }
      })
    },
    async doIdentify() {
      this.identifying = true
      this.result = null
      
      try {
        const res = await herbApi.identify(this.imagePath)
        this.result = res
      } catch (e) {
        console.error('识别失败', e)
      } finally {
        this.identifying = false
      }
    },
    goToDetail() {
      if (this.result) {
        uni.navigateTo({
          url: `/pages/detail/detail?id=${this.result.id}&image=${encodeURIComponent(this.imagePath)}`
        })
      }
    }
  }
}
</script>

<style lang="scss">
.page {
  min-height: 100vh;
  background: #f5f7fa;
}

.identify-container {
  padding: 24rpx;
}

.preview-area {
  position: relative;
  width: 100%;
  height: 500rpx;
  background: #000;
  border-radius: 20rpx;
  overflow: hidden;
  margin-bottom: 32rpx;
}

.preview-img {
  width: 100%;
  height: 100%;
}

.preview-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
  border-top-color: #2d8b5e;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20rpx;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  color: #fff;
  font-size: 28rpx;
}

.placeholder-area {
  width: 100%;
  height: 500rpx;
  background: linear-gradient(135deg, #e8f5ee 0%, #d4efdf 100%);
  border-radius: 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 32rpx;
  border: 3rpx dashed #2d8b5e;
  border-style: dashed;
}

.placeholder-icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
}

.placeholder-text {
  font-size: 32rpx;
  color: #2d8b5e;
  font-weight: 500;
  margin-bottom: 12rpx;
}

.placeholder-desc {
  font-size: 24rpx;
  color: #666;
}

.action-area {
  margin-bottom: 24rpx;
}

.action-btns {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.primary-btn {
  background: linear-gradient(135deg, #2d8b5e 0%, #3da878 100%);
  color: #fff;
  border-radius: 50rpx;
  font-size: 32rpx;
  padding: 24rpx 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
}

.primary-btn::after {
  border: none;
}

.btn-icon {
  margin-right: 12rpx;
  font-size: 32rpx;
}

.secondary-btn {
  background: #fff;
  color: #2d8b5e;
  border: 2rpx solid #2d8b5e;
  border-radius: 50rpx;
  font-size: 32rpx;
  padding: 22rpx 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.secondary-btn::after {
  border: none;
}

.result-area {
  margin-top: 24rpx;
}

.result-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.result-name {
  font-size: 40rpx;
  font-weight: 700;
  color: #2d8b5e;
}

.result-accuracy {
  font-size: 26rpx;
  color: #f59e0b;
  background: #fef3c7;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
}

.result-pinyin {
  font-size: 26rpx;
  color: #999;
  margin-bottom: 16rpx;
}

.result-category {
  margin-bottom: 24rpx;
}

.tag {
  display: inline-block;
  padding: 8rpx 20rpx;
  background: #e8f5ee;
  color: #2d8b5e;
  border-radius: 20rpx;
  font-size: 24rpx;
}

.result-effect {
  background: #f9fafb;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 32rpx;
}

.result-label {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 8rpx;
  font-weight: 500;
}

.result-value {
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
}

.detail-btn {
  width: 100%;
}

.tips-area {
  background: #fff;
  border-radius: 20rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #2d8b5e;
  margin-bottom: 24rpx;
  display: flex;
  align-items: center;
}

.section-title::before {
  content: '';
  width: 6rpx;
  height: 28rpx;
  background: linear-gradient(180deg, #2d8b5e, #3da878);
  border-radius: 3rpx;
  margin-right: 12rpx;
}

.tip-list {
  .tip-item {
    display: flex;
    align-items: flex-start;
    margin-bottom: 20rpx;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  .tip-num {
    width: 40rpx;
    height: 40rpx;
    border-radius: 50%;
    background: #e8f5ee;
    color: #2d8b5e;
    font-size: 24rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16rpx;
    flex-shrink: 0;
    font-weight: 500;
  }
  
  .tip-text {
    font-size: 28rpx;
    color: #666;
    line-height: 1.5;
    flex: 1;
  }
}
</style>
