<template>
  <view class="page">
    <view class="detail-container" v-if="matchDetail">
      <view class="match-hero">
        <image class="match-image" :src="matchImageUrl" mode="aspectFill" v-if="matchImageUrl" @click="previewImage"></image>
        <view class="match-fallback" v-else>
          <text class="match-fallback-icon">🍲</text>
        </view>
        <view class="match-overlay"></view>
        <view class="match-title-area">
          <view class="match-name">{{ matchDetail.name }}</view>
          <view class="match-effect-tag" v-if="matchDetail.effect">{{ matchDetail.effect }}</view>
        </view>
        <view class="favorite-btn" @click="toggleFavorite">
          <text class="fav-icon" :class="{ favorited: isFavorite }">♥</text>
        </view>
      </view>

      <view class="content-area">
        <view class="section card" v-if="matchDetail.ingredients && parsedIngredients.length">
          <view class="section-title">主要食材</view>
          <view class="ingredients-list">
            <view class="ingredient-tag" v-for="(ing, idx) in parsedIngredients" :key="idx">{{ ing }}</view>
          </view>
        </view>

        <view class="section card">
          <view class="section-title">功效</view>
          <view class="section-content">{{ matchDetail.effect }}</view>
        </view>

        <view class="section card" v-if="matchDetail.suitable">
          <view class="section-title">适宜人群</view>
          <view class="section-content">{{ matchDetail.suitable }}</view>
        </view>

        <view class="section card caution-card" v-if="matchDetail.taboo">
          <view class="section-title caution-title">
            <text class="caution-icon">⚠️</text>
            禁忌
          </view>
          <view class="section-content">{{ matchDetail.taboo }}</view>
        </view>

        <view class="section card" v-if="matchDetail.method">
          <view class="section-title">做法</view>
          <view class="section-content method-content">{{ matchDetail.method }}</view>
        </view>

        <view class="section card" v-if="relatedHerb">
          <view class="section-title">关联药材</view>
          <view class="related-herb" @click="goToHerbDetail">
            <view class="related-herb-name">{{ relatedHerb.name }}</view>
            <view class="related-herb-arrow">→</view>
          </view>
        </view>
      </view>
    </view>

    <view class="loading" v-if="loading">
      <view class="loading-spinner"></view>
      <text>加载中...</text>
    </view>
  </view>
</template>

<script>
import { matchApi, favoriteApi, herbApi, getImageUrl, resolveHerbImage } from '@/api/index.js'

export default {
  data() {
    return {
      matchId: null,
      matchDetail: null,
      relatedHerb: null,
      isFavorite: false,
      favorites: [],
      loading: false
    }
  },
  computed: {
    matchImageUrl() {
      if (!this.matchDetail) return ''
      if (this.matchDetail.image) return getImageUrl(this.matchDetail.image)
      if (this.matchDetail.cover_image_url) return getImageUrl(this.matchDetail.cover_image_url)
      if (this.relatedHerb) {
        const url = resolveHerbImage(this.relatedHerb)
        if (url) return getImageUrl(url)
      }
      return ''
    },
    parsedIngredients() {
      if (!this.matchDetail || !this.matchDetail.ingredients) return []
      let ingredients = this.matchDetail.ingredients
      if (typeof ingredients === 'string') {
        try {
          ingredients = JSON.parse(ingredients)
        } catch (e) {
          ingredients = ingredients.split(/[、,，]/).map(s => s.trim()).filter(Boolean)
        }
      }
      return Array.isArray(ingredients) ? ingredients : []
    }
  },
  onLoad(options) {
    this.matchId = options.id
    this.loadDetail()
    this.loadFavorites()
  },
  methods: {
    async loadDetail() {
      this.loading = true
      try {
        this.matchDetail = await matchApi.getMatchDetail(this.matchId)
        if (this.matchDetail && this.matchDetail.herb_id) {
          this.loadRelatedHerb(this.matchDetail.herb_id)
        }
      } catch (e) {
        console.error('加载搭配详情失败', e)
        uni.showToast({ title: '加载失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },
    async loadRelatedHerb(herbId) {
      try {
        this.relatedHerb = await herbApi.getDetail(herbId)
      } catch (e) {
        console.error('加载关联药材失败', e)
      }
    },
    async loadFavorites() {
      const token = uni.getStorageSync('token')
      if (!token) {
        this.favorites = []
        this.isFavorite = false
        return
      }
      try {
        const list = await favoriteApi.getMatches()
        this.favorites = (list || []).map(m => m.id)
        this.isFavorite = this.favorites.includes(parseInt(this.matchId))
      } catch (e) {
        console.error('加载收藏状态失败', e)
      }
    },
    async toggleFavorite() {
      const token = uni.getStorageSync('token')
      if (!token) {
        uni.showModal({
          title: '提示',
          content: '请先登录后再收藏',
          confirmText: '去登录',
          success: (res) => {
            if (res.confirm) {
              uni.navigateTo({ url: '/pages/login/login' })
            }
          }
        })
        return
      }
      try {
        const result = await favoriteApi.toggleMatch(this.matchId)
        this.isFavorite = result.isFavorited
        uni.showToast({ title: this.isFavorite ? '已收藏' : '已取消收藏', icon: this.isFavorite ? 'success' : 'none' })
        uni.$emit('favoritesChanged')
      } catch (e) {
        console.error('收藏操作失败', e)
        uni.showToast({ title: '操作失败', icon: 'none' })
      }
    },
    previewImage() {
      if (!this.matchImageUrl) return
      uni.previewImage({ urls: [this.matchImageUrl] })
    },
    goToHerbDetail() {
      if (this.relatedHerb && this.relatedHerb.id) {
        uni.navigateTo({ url: `/pages/detail/detail?id=${this.relatedHerb.id}` })
      }
    }
  }
}
</script>

<style>
.page {
  min-height: 100vh;
  background: #F5F1E8;
  padding-bottom: 40rpx;
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", "Microsoft YaHei", sans-serif;
}

.detail-container {
  padding-bottom: 40rpx;
}

.match-hero {
  position: relative;
  height: 500rpx;
  background: #8CA082;
}

.match-image {
  width: 100%;
  height: 100%;
}

.match-fallback {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #a8c59a 0%, #8CA082 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.match-fallback-icon {
  font-size: 120rpx;
}

.match-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.6));
}

.match-title-area {
  position: absolute;
  bottom: 30rpx;
  left: 30rpx;
  right: 100rpx;
}

.match-name {
  font-size: 48rpx;
  font-weight: 700;
  color: #fff;
  margin-bottom: 12rpx;
  text-shadow: 0 2rpx 8rpx rgba(0,0,0,0.3);
}

.match-effect-tag {
  font-size: 26rpx;
  color: rgba(255,255,255,0.9);
  background: rgba(255,255,255,0.2);
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  display: inline-block;
  backdrop-filter: blur(6px);
}

.favorite-btn {
  position: absolute;
  top: 60rpx;
  right: 30rpx;
  width: 80rpx;
  height: 80rpx;
  background: rgba(255,255,255,0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  border: 1rpx solid rgba(255,255,255,0.3);
  transition: transform 0.2s;
}

.favorite-btn:active {
  transform: scale(0.9);
}

.fav-icon {
  font-size: 44rpx;
  color: #d1d5db;
  transition: color 0.2s;
}

.fav-icon.favorited {
  color: #ef4444;
}

.content-area {
  padding: 24rpx;
  margin-top: -20rpx;
  position: relative;
}

.card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border: 1rpx solid rgba(180, 170, 150, 0.25);
  border-radius: 20rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.05);
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #3D3D3D;
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
}

.section-title::before {
  content: '';
  width: 6rpx;
  height: 28rpx;
  background: #8CA082;
  border-radius: 3rpx;
  margin-right: 14rpx;
}

.section-content {
  font-size: 28rpx;
  color: #555;
  line-height: 1.8;
}

.method-content {
  white-space: pre-line;
  line-height: 2;
}

.ingredients-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.ingredient-tag {
  padding: 12rpx 28rpx;
  background: #F5F1E8;
  color: #8CA082;
  border-radius: 30rpx;
  font-size: 26rpx;
  font-weight: 500;
  border: 1rpx solid rgba(140, 160, 130, 0.2);
}

.caution-card {
  border-left: 6rpx solid #dc2626;
}

.caution-title {
  color: #dc2626;
}

.caution-title::before {
  background: #dc2626;
}

.caution-icon {
  margin-right: 8rpx;
}

.related-herb {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx;
  background: #F5F1E8;
  border-radius: 16rpx;
}

.related-herb-name {
  font-size: 28rpx;
  color: #3D3D3D;
  font-weight: 500;
}

.related-herb-arrow {
  font-size: 32rpx;
  color: #8CA082;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 0;
  color: #999;
  font-size: 28rpx;
}

.loading-spinner {
  width: 48rpx;
  height: 48rpx;
  border: 4rpx solid #e8f5ee;
  border-top-color: #8CA082;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20rpx;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
