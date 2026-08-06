<template>
  <view class="page" v-if="detail">
    <!-- 顶部标题区 -->
    <view class="hero">
      <view class="hero-name">{{ detail.herbName }}</view>
      <view class="hero-subtitle">真伪鉴别指南</view>
      <view class="hero-tags">
        <view class="hero-tag fraud-tag" :class="fraudClass(detail.fraudType)">{{ detail.fraudType }}</view>
        <view class="hero-tag counterfeiter-tag">冒充：{{ detail.counterfeiter }}</view>
      </view>
    </view>

    <view class="container">
      <!-- 一句话警示 -->
      <view class="warning-card card">
        <view class="warning-icon">⚠️</view>
        <view class="warning-text">{{ detail.summary }}</view>
      </view>

      <!-- 真伪图片对比 -->
      <view class="images-section card" v-if="hasImages">
        <view class="section-title">
          <text class="title-icon">📷</text>
          真伪图片对比
        </view>
        <view class="image-compare">
          <view class="image-block">
            <image
              class="compare-img"
              :src="genuineFirstImg"
              mode="aspectFill"
              @click="previewGenuine"
            ></image>
            <view class="image-label genuine-label">真品</view>
          </view>
          <view class="image-block">
            <image
              class="compare-img"
              :src="fakeFirstImg"
              mode="aspectFill"
              @click="previewFake"
            ></image>
            <view class="image-label fake-label">伪品</view>
          </view>
        </view>
        <view class="image-tip" v-if="detail.source">图片来源：{{ detail.source }}</view>
      </view>

      <!-- 关键鉴别点对比表 -->
      <view class="section card" v-if="detail.keyPoints && detail.keyPoints.length">
        <view class="section-title">
          <text class="title-icon">🔍</text>
          关键鉴别点
        </view>
        <view class="compare-table">
          <view class="table-head">
            <view class="th th-label">项目</view>
            <view class="th th-genuine">真品</view>
            <view class="th th-fake">伪品</view>
          </view>
          <view class="table-row" v-for="(kp, idx) in detail.keyPoints" :key="idx">
            <view class="td td-label">{{ kp.label }}</view>
            <view class="td td-genuine">{{ kp.genuine }}</view>
            <view class="td td-fake">{{ kp.fake }}</view>
          </view>
        </view>
      </view>

      <!-- 真品特征详解 -->
      <view class="section card genuine-section">
        <view class="section-title genuine-title">
          <text class="title-icon">✅</text>
          真品特征详解
        </view>
        <view class="feature-list">
          <view class="feature-item" v-for="(f, idx) in detail.genuineFeatures" :key="idx">
            <text class="feature-bullet genuine-bullet">●</text>
            <text class="feature-text">{{ f }}</text>
          </view>
        </view>
      </view>

      <!-- 伪品特征详解 -->
      <view class="section card fake-section">
        <view class="section-title fake-title">
          <text class="title-icon">🚫</text>
          伪品特征详解
        </view>
        <view class="feature-list">
          <view class="feature-item" v-for="(f, idx) in detail.fakeFeatures" :key="idx">
            <text class="feature-bullet fake-bullet">●</text>
            <text class="feature-text">{{ f }}</text>
          </view>
        </view>
      </view>

      <!-- 关联药材详情入口 -->
      <view class="section card herb-link-section" v-if="detail.herbId">
        <view class="section-title herb-link-title">
          <text class="title-icon">🌿</text>
          查看药材详情
        </view>
        <view class="herb-link-desc">了解「{{ detail.herbName }}」的性味归经、功效、典籍记载</view>
        <view class="herb-link-btn" @click="goToHerbDetail">查看 {{ detail.herbName }} 详情 →</view>
      </view>

      <view class="bottom-tip">用药请遵医嘱，鉴别仅供参考</view>
    </view>
  </view>

  <!-- 加载中 -->
  <view class="page loading-page" v-else>
    <view class="loading">
      <view class="loading-spinner"></view>
      <text>加载中...</text>
    </view>
  </view>
</template>

<script>
import { authenticateApi, getImageUrl } from '@/api/index.js'

export default {
  data() {
    return {
      id: null,
      detail: null
    }
  },
  computed: {
    hasImages() {
      const d = this.detail
      if (!d) return false
      return (d.genuineImages && d.genuineImages.length > 0) || (d.fakeImages && d.fakeImages.length > 0)
    },
    genuineFirstImg() {
      const imgs = this.detail.genuineImages || []
      return imgs.length > 0 ? getImageUrl(imgs[0]) : ''
    },
    fakeFirstImg() {
      const imgs = this.detail.fakeImages || []
      return imgs.length > 0 ? getImageUrl(imgs[0]) : ''
    }
  },
  onLoad(options) {
    if (options && options.id) {
      this.id = parseInt(options.id)
      this.loadDetail()
    } else if (options && options.herbName) {
      // 支持按药材名加载（从药材详情页跳转）
      this.loadByHerb(decodeURIComponent(options.herbName))
    }
  },
  methods: {
    async loadDetail() {
      try {
        const detail = await authenticateApi.getDetail(this.id)
        this.detail = detail
        if (detail && detail.herbName) {
          uni.setNavigationBarTitle({ title: `${detail.herbName} 真伪鉴别` })
        }
      } catch (e) {
        console.error('加载详情失败', e)
        uni.showToast({ title: '加载失败', icon: 'none' })
      }
    },
    async loadByHerb(herbName) {
      try {
        const detail = await authenticateApi.getByHerb(herbName)
        if (detail) {
          this.detail = detail
          uni.setNavigationBarTitle({ title: `${detail.herbName} 真伪鉴别` })
        } else {
          uni.showToast({ title: '暂无该药材的鉴别数据', icon: 'none' })
          setTimeout(() => uni.navigateBack(), 1200)
        }
      } catch (e) {
        console.error('加载详情失败', e)
        uni.showToast({ title: '加载失败', icon: 'none' })
      }
    },
    fraudClass(type) {
      const map = {
        '冒充': 'fraud-maoc',
        '做旧': 'fraud-jiu',
        '染色': 'fraud-ran',
        '硫熏': 'fraud-liu'
      }
      return map[type] || 'fraud-default'
    },
    previewGenuine() {
      const urls = (this.detail.genuineImages || []).map(u => getImageUrl(u))
      if (urls.length > 0) {
        uni.previewImage({ current: urls[0], urls })
      }
    },
    previewFake() {
      const urls = (this.detail.fakeImages || []).map(u => getImageUrl(u))
      if (urls.length > 0) {
        uni.previewImage({ current: urls[0], urls })
      }
    },
    goToHerbDetail() {
      if (!this.detail || !this.detail.herbId) return
      uni.navigateTo({
        url: `/pages/detail/detail?id=${this.detail.herbId}`
      })
    }
  }
}
</script>

<style>
.page {
  min-height: 100vh;
  background: #F5F1E8;
  padding-bottom: 40rpx;
}

.hero {
  background: linear-gradient(135deg, #6B8F6A 0%, #8CA082 50%, #A8B89E 100%);
  padding: 48rpx 32rpx;
  color: #ffffff;
}

.hero-name {
  font-size: 44rpx;
  font-weight: 700;
  margin-bottom: 8rpx;
}

.hero-subtitle {
  font-size: 26rpx;
  opacity: 0.9;
  margin-bottom: 24rpx;
}

.hero-tags {
  display: flex;
  flex-wrap: wrap;
}

.hero-tag {
  font-size: 24rpx;
  padding: 8rpx 20rpx;
  border-radius: 24rpx;
  margin-right: 16rpx;
  background: rgba(255, 255, 255, 0.25);
  color: #ffffff;
  border: 1rpx solid rgba(255, 255, 255, 0.3);
}

.fraud-tag.fraud-maoc {
  background: rgba(239, 68, 68, 0.35);
  border-color: rgba(239, 68, 68, 0.4);
}

.fraud-tag.fraud-jiu {
  background: rgba(245, 158, 11, 0.35);
  border-color: rgba(245, 158, 11, 0.4);
}

.fraud-tag.fraud-ran {
  background: rgba(168, 85, 247, 0.35);
  border-color: rgba(168, 85, 247, 0.4);
}

.fraud-tag.fraud-liu {
  background: rgba(234, 179, 8, 0.35);
  border-color: rgba(234, 179, 8, 0.4);
}

.fraud-tag.fraud-default {
  background: rgba(255, 255, 255, 0.25);
}

.container {
  padding: 24rpx;
}

.card {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(10px);
  border-radius: 20rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(180, 170, 150, 0.08);
  border: 1rpx solid rgba(180, 170, 150, 0.25);
}

.warning-card {
  display: flex;
  align-items: flex-start;
  background: linear-gradient(135deg, rgba(255, 251, 235, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%);
  border: 1rpx solid rgba(253, 230, 138, 0.6);
}

.warning-icon {
  font-size: 40rpx;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.warning-text {
  font-size: 28rpx;
  color: #92400e;
  line-height: 1.6;
  font-weight: 500;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #3D3D3D;
  margin-bottom: 24rpx;
  display: flex;
  align-items: center;
}

.section-title::before {
  content: '';
  width: 8rpx;
  height: 30rpx;
  background: linear-gradient(180deg, #8CA082, #A8B89E);
  border-radius: 4rpx;
  margin-right: 16rpx;
}

.title-icon {
  margin-right: 10rpx;
}

.section-title .title-icon + text {
  margin-left: 0;
}

/* 图片对比 */
.images-section {
  background: linear-gradient(135deg, rgba(232, 245, 238, 0.7) 0%, rgba(255, 255, 255, 0.75) 100%);
}

.image-compare {
  display: flex;
  justify-content: space-between;
}

.image-block {
  width: 48%;
  position: relative;
}

.compare-img {
  width: 100%;
  height: 280rpx;
  border-radius: 16rpx;
  background: rgba(248, 250, 252, 0.8);
}

.image-label {
  position: absolute;
  bottom: 12rpx;
  left: 50%;
  transform: translateX(-50%);
  font-size: 24rpx;
  color: #ffffff;
  padding: 6rpx 24rpx;
  border-radius: 20rpx;
  font-weight: 600;
}

.genuine-label {
  background: rgba(140, 160, 130, 0.9);
}

.fake-label {
  background: rgba(220, 38, 38, 0.9);
}

.image-tip {
  font-size: 22rpx;
  color: #999;
  margin-top: 16rpx;
  text-align: center;
}

/* 对比表 */
.compare-table {
  border-radius: 12rpx;
  overflow: hidden;
  border: 1rpx solid rgba(232, 245, 238, 0.8);
}

.table-head {
  display: flex;
  background: rgba(232, 245, 238, 0.6);
}

.th {
  padding: 20rpx 16rpx;
  font-size: 24rpx;
  font-weight: 600;
  text-align: center;
}

.th-label {
  width: 25%;
  color: #666;
}

.th-genuine {
  width: 37.5%;
  color: #8CA082;
}

.th-fake {
  width: 37.5%;
  color: #dc2626;
}

.table-row {
  display: flex;
  border-top: 1rpx solid rgba(232, 245, 238, 0.6);
}

.td {
  padding: 20rpx 16rpx;
  font-size: 24rpx;
  line-height: 1.5;
  text-align: center;
}

.td-label {
  width: 25%;
  color: #666;
  background: rgba(248, 250, 252, 0.5);
  font-weight: 500;
}

.td-genuine {
  width: 37.5%;
  color: #5a7a54;
  background: rgba(232, 245, 238, 0.5);
}

.td-fake {
  width: 37.5%;
  color: #991b1b;
  background: rgba(254, 242, 242, 0.5);
}

/* 特征详解 */
.genuine-section {
  background: linear-gradient(135deg, rgba(232, 245, 238, 0.6) 0%, rgba(255, 255, 255, 0.75) 100%);
  border: 1rpx solid rgba(187, 247, 208, 0.5);
}

.genuine-title {
  color: #5a7a54;
}

.genuine-title::before {
  background: linear-gradient(180deg, #8CA082, #A8B89E);
}

.fake-section {
  background: linear-gradient(135deg, rgba(254, 242, 242, 0.6) 0%, rgba(255, 255, 255, 0.75) 100%);
  border: 1rpx solid rgba(254, 202, 202, 0.5);
}

.fake-title {
  color: #991b1b;
}

.fake-title::before {
  background: linear-gradient(180deg, #ef4444, #dc2626);
}

.feature-list {
  display: flex;
  flex-direction: column;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16rpx;
}

.feature-item:last-child {
  margin-bottom: 0;
}

.feature-bullet {
  font-size: 20rpx;
  margin-right: 14rpx;
  flex-shrink: 0;
  line-height: 1.8;
}

.genuine-bullet {
  color: #8CA082;
}

.fake-bullet {
  color: #ef4444;
}

.feature-text {
  font-size: 26rpx;
  color: #333;
  line-height: 1.7;
  flex: 1;
}

/* 关联药材入口 */
.herb-link-section {
  background: linear-gradient(135deg, rgba(245, 241, 232, 0.8) 0%, rgba(255, 255, 255, 0.75) 100%);
  border: 1rpx solid rgba(180, 170, 150, 0.3);
  text-align: center;
}

.herb-link-title {
  color: #6B8F6A;
  justify-content: center;
}

.herb-link-title::before {
  background: linear-gradient(180deg, #8CA082, #A8B89E);
  margin-right: 0;
}

.herb-link-desc {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 24rpx;
}

.herb-link-btn {
  display: inline-block;
  padding: 18rpx 48rpx;
  background: linear-gradient(135deg, #8CA082, #A8B89E);
  color: #ffffff;
  font-size: 28rpx;
  border-radius: 40rpx;
  font-weight: 500;
}

.herb-link-btn:active {
  opacity: 0.85;
}

.bottom-tip {
  text-align: center;
  font-size: 22rpx;
  color: #999;
  padding: 24rpx 0;
}

/* 加载状态 */
.loading-page {
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
  color: #999;
  font-size: 28rpx;
}

.loading-spinner {
  width: 50rpx;
  height: 50rpx;
  border: 4rpx solid #e8f5ee;
  border-top-color: #2d8b5e;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20rpx;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
