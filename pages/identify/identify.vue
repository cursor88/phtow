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
    <custom-tabbar current="identify"></custom-tabbar>
  </view>
</template>

<script>
import { herbApi, identifyApi } from '@/api/index.js'
import customTabbar from '@/components/custom-tabbar/custom-tabbar.vue'

export default {
  components: { customTabbar },
  data() {
    return {
      imagePath: '',
      identifying: false,
      result: null,
      _saveLock: false
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
    uni.hideTabBar()
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
        const res = await identifyApi.identify(this.imagePath)
        this.result = res
        
        if (res && res.id) {
          try {
            if (this._saveLock) return
            this._saveLock = true
            await identifyApi.addRecord({
              herbId: res.id,
              herbName: res.name,
              accuracy: res.accuracy,
              source: res.source || 'local'
            })
            uni.showToast({ title: '记录已保存', icon: 'success' })
          } catch (e) {
            console.warn('保存识别记录失败', e)
          } finally {
            setTimeout(() => { this._saveLock = false }, 2000)
          }
        }
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
  background: $bg-primary;
  padding-bottom: 70px;
}

.identify-container {
  padding: $spacing-lg;
}

.preview-area {
  position: relative;
  width: 100%;
  height: 500rpx;
  background: #000000;
  border-radius: $radius-xl;
  overflow: hidden;
  margin-bottom: $spacing-xl;
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
  border-top-color: $cta-color;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: $spacing-md;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  color: #FFFFFF;
  font-size: $font-size-base;
}

.placeholder-area {
  width: 100%;
  height: 500rpx;
  background: linear-gradient(135deg, rgba($cta-color, 0.1) 0%, rgba($cta-color, 0.06) 100%);
  border-radius: $radius-xl;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: $spacing-xl;
  border: 3rpx dashed $cta-color;
  border-style: dashed;
}

.placeholder-icon {
  font-size: 80rpx;
  margin-bottom: $spacing-lg;
}

.placeholder-text {
  font-size: $font-size-lg;
  color: $cta-color;
  font-weight: $font-weight-medium;
  margin-bottom: $spacing-sm;
}

.placeholder-desc {
  font-size: $font-size-sm;
  color: $text-secondary;
}

.action-area {
  margin-bottom: $spacing-lg;
}

.action-btns {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.primary-btn {
  width: 100%;
  background: linear-gradient(135deg, $cta-color 0%, lighten($cta-color, 8%) 100%);
  color: #FFFFFF;
  border-radius: $radius-full;
  font-size: $font-size-lg;
  padding: $spacing-lg 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: opacity $transition-normal, transform $transition-normal;
  
  &:active {
    opacity: 0.8;
    transform: scale(0.98);
  }
}

.primary-btn::after {
  border: none;
}

.btn-icon {
  margin-right: $spacing-sm;
  font-size: $font-size-lg;
}

.secondary-btn {
  width: 100%;
  background: $bg-card;
  color: $cta-color;
  border: 2rpx solid $cta-color;
  border-radius: $radius-full;
  font-size: $font-size-lg;
  padding: $spacing-lg 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all $transition-normal;
  
  &:active {
    background: rgba($cta-color, 0.05);
    transform: scale(0.98);
  }
}

.secondary-btn::after {
  border: none;
}

.result-area {
  margin-top: $spacing-lg;
}

.result-card {
  background: $bg-card;
  border-radius: $radius-xl;
  padding: $spacing-lg;
  box-shadow: $shadow-md;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-xs;
}

.result-name {
  font-size: $font-size-xxl;
  font-weight: $font-weight-bold;
  color: $cta-color;
}

.result-accuracy {
  font-size: $font-size-sm;
  color: $warning-color;
  background: rgba($warning-color, 0.1);
  padding: 6rpx 16rpx;
  border-radius: $radius-full;
}

.result-pinyin {
  font-size: $font-size-sm;
  color: $text-muted;
  margin-bottom: $spacing-md;
}

.result-category {
  margin-bottom: $spacing-lg;
}

.tag {
  display: inline-block;
  padding: 8rpx 20rpx;
  background: rgba($cta-color, 0.1);
  color: $cta-color;
  border-radius: $radius-full;
  font-size: $font-size-sm;
}

.result-effect {
  background: $bg-secondary;
  border-radius: $radius-md;
  padding: $spacing-md;
  margin-bottom: $spacing-xl;
}

.result-label {
  font-size: $font-size-sm;
  color: $text-secondary;
  margin-bottom: $spacing-xs;
  font-weight: $font-weight-medium;
}

.result-value {
  font-size: $font-size-base;
  color: $text-primary;
  line-height: 1.6;
}

.detail-btn {
  width: 100%;
}

.tips-area {
  background: $bg-card;
  border-radius: $radius-xl;
  padding: $spacing-lg;
  box-shadow: $shadow-card;
}

.section-title {
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  color: $cta-color;
  margin-bottom: $spacing-lg;
  display: flex;
  align-items: center;
}

.section-title::before {
  content: '';
  width: 6rpx;
  height: 28rpx;
  background: linear-gradient(180deg, $cta-color, lighten($cta-color, 8%));
  border-radius: $radius-sm;
  margin-right: $spacing-sm;
}

.tip-list {
  .tip-item {
    display: flex;
    align-items: flex-start;
    margin-bottom: $spacing-md;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  .tip-num {
    width: 40rpx;
    height: 40rpx;
    border-radius: 50%;
    background: rgba($cta-color, 0.1);
    color: $cta-color;
    font-size: $font-size-sm;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: $spacing-md;
    flex-shrink: 0;
    font-weight: $font-weight-medium;
  }
  
  .tip-text {
    font-size: $font-size-base;
    color: $text-secondary;
    line-height: 1.5;
    flex: 1;
  }
}
</style>
