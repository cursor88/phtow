<template>
  <view class="page">
    <view class="container" v-if="classicsData">
      <view class="hero-section">
        <view class="hero-title">{{ classicsData.herbName }}</view>
        <view class="hero-subtitle">典籍溯源</view>
      </view>

      <view class="classics-list">
        <view class="classics-card" v-for="(item, index) in classicsData.classics" :key="index">
          <view class="card-header">
            <text class="book-icon">📖</text>
            <text class="book-name">{{ item.book }}</text>
          </view>
          <view class="card-content">
            <text class="quote-mark left">"</text>
            {{ item.content }}
            <text class="quote-mark right">"</text>
          </view>
          <view class="card-footer">
            <view class="book-mark"></view>
          </view>
        </view>
      </view>

      <view class="intro-section card">
        <view class="section-title">关于典籍</view>
        <view class="intro-text">
          中医典籍是中华民族几千年医学智慧的结晶，记录了无数医家的临床经验和理论总结。
          从《神农本草经》到《本草纲目》，每一部典籍都承载着中医药文化的深厚底蕴。
        </view>
        <view class="intro-text">
          通过阅读典籍原文，我们可以更深入地理解药材的性味归经、功效主治，
          感受中医药文化的博大精深。
        </view>
      </view>
    </view>

    <view class="loading" v-else>
      <view class="loading-spinner"></view>
      <text>加载中...</text>
    </view>
  </view>
</template>

<script>
import { herbApi } from '@/api/index.js'

export default {
  data() {
    return {
      herbId: null,
      classicsData: null
    }
  },
  onLoad(options) {
    this.herbId = options.id
    this.loadClassics()
  },
  methods: {
    async loadClassics() {
      try {
        this.classicsData = await herbApi.getClassics(this.herbId)
      } catch (e) {
        console.error('加载典籍失败', e)
      }
    }
  }
}
</script>

<style lang="scss">
.page {
  min-height: 100vh;
  background: linear-gradient(180deg, #fef7e6 0%, #fffbf0 30%, #f5f7fa 100%);
}

.container {
  padding: 24rpx;
}

.hero-section {
  text-align: center;
  padding: 60rpx 0 40rpx;
}

.hero-title {
  font-size: 52rpx;
  font-weight: 700;
  color: #92400e;
  margin-bottom: 12rpx;
  font-family: 'KaiTi', 'STKaiti', serif;
}

.hero-subtitle {
  font-size: 28rpx;
  color: #b45309;
  letter-spacing: 8rpx;
}

.classics-list {
  margin-bottom: 24rpx;
}

.classics-card {
  background: #fff;
  border-radius: 20rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(146, 64, 14, 0.08);
  overflow: hidden;
  position: relative;
}

.card-header {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  padding: 24rpx 32rpx;
  display: flex;
  align-items: center;
  border-bottom: 2rpx solid #fcd34d;
}

.book-icon {
  font-size: 36rpx;
  margin-right: 16rpx;
}

.book-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #78350f;
  font-family: 'KaiTi', 'STKaiti', serif;
}

.card-content {
  padding: 32rpx;
  font-size: 28rpx;
  color: #555;
  line-height: 2;
  position: relative;
  font-family: 'KaiTi', 'STKaiti', serif;
  text-indent: 2em;
}

.quote-mark {
  font-size: 48rpx;
  color: #d97706;
  position: absolute;
  font-family: serif;
  opacity: 0.3;
  
  &.left {
    top: 20rpx;
    left: 20rpx;
  }
  
  &.right {
    bottom: 20rpx;
    right: 20rpx;
  }
}

.card-footer {
  padding: 16rpx 32rpx;
  background: #fffbeb;
  display: flex;
  justify-content: flex-end;
}

.book-mark {
  width: 20rpx;
  height: 40rpx;
  background: linear-gradient(180deg, #d97706, #b45309);
  border-radius: 0 0 10rpx 10rpx;
}

.card {
  background: #fff;
  border-radius: 20rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #92400e;
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
}

.section-title::before {
  content: '';
  width: 6rpx;
  height: 28rpx;
  background: linear-gradient(180deg, #d97706, #b45309);
  border-radius: 3rpx;
  margin-right: 12rpx;
}

.intro-section {
  .intro-text {
    font-size: 26rpx;
    color: #666;
    line-height: 1.9;
    margin-bottom: 16rpx;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  color: #999;
  font-size: 28rpx;
}

.loading-spinner {
  width: 50rpx;
  height: 50rpx;
  border: 4rpx solid #fef3c7;
  border-top-color: #d97706;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20rpx;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
