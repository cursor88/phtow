<template>
  <view class="page">
    <view class="detail-container" v-if="herb">
      <view class="herb-hero">
        <image class="herb-image" :src="userImage || getImg(herb.image)" mode="aspectFill" @click="previewImage(userImage || herb.image)"></image>
        <view class="herb-overlay"></view>
        <view class="herb-title-area">
          <view class="herb-name">{{ herb.name }}</view>
          <view class="herb-pinyin">{{ herb.pinyin }}</view>
          <view class="herb-alias">别名：{{ herb.alias.join('、') }}</view>
        </view>
        <view class="favorite-btn" @click="toggleFavorite">
          <text class="fav-icon" :class="{ favorited: isFavorite }">♥</text>
        </view>
      </view>

      <view class="content-area">
        <view class="basic-info card">
          <view class="info-row">
            <view class="info-item">
              <view class="info-label">性味</view>
              <view class="info-value">{{ herb.nature }}，{{ herb.taste }}</view>
            </view>
            <view class="info-item">
              <view class="info-label">归经</view>
              <view class="info-value">{{ herb.meridian }}</view>
            </view>
          </view>
          <view class="info-tags">
            <text class="tag">{{ herb.category }}</text>
          </view>
        </view>

        <view class="section card">
          <view class="section-title">功效</view>
          <view class="section-content">{{ herb.effect }}</view>
        </view>

        <view class="section card">
          <view class="section-title">主治</view>
          <view class="section-content">{{ herb.indication }}</view>
        </view>

        <view class="section card">
          <view class="section-title">用法用量</view>
          <view class="section-content">{{ herb.dosage }}</view>
        </view>

        <view class="section card caution-card">
          <view class="section-title caution-title">
            <text class="caution-icon">⚠️</text>
            使用禁忌
          </view>
          <view class="section-content">{{ herb.taboo }}</view>
        </view>

        <view class="section card">
          <view class="section-title">鉴别要点</view>
          <view class="section-content">{{ herb.identify_points }}</view>
        </view>

        <view class="section card classics-section">
          <view class="section-title classics-title">
            <text class="title-icon">📜</text>
            典籍溯源
          </view>
          <view class="classics-list">
            <view class="classics-item" v-for="(item, index) in herb.classics" :key="index">
              <view class="classics-book">
                <text class="book-icon">📖</text>
                {{ item.book }}
              </view>
              <view class="classics-content">"{{ item.content }}"</view>
            </view>
          </view>
        </view>

        <view class="section card food-match-section">
          <view class="section-title food-title">
            <text class="title-icon">🍲</text>
            药食同源
          </view>
          <view class="food-desc">以下是{{ herb.name }}的养生搭配推荐（点击食材标签可查看详情）</view>
          <view class="food-list">
            <view class="food-item" v-for="item in foodMatches" :key="item.id" @click="showMatchDetail(item)">
              <image class="food-img" :src="getImg(item.image)" mode="aspectFill"></image>
              <view class="food-info">
                <view class="food-name">{{ item.name }}</view>
                <view class="food-effect">{{ item.effect }}</view>
                <view class="food-ingredients">
                  <text 
                    class="ingredient-tag" 
                    v-for="(ing, idx) in item.ingredients.slice(0, 4)" 
                    :key="idx"
                    @click.stop="goToHerbDetail(ing)"
                  >{{ ing }}</text>
                </view>
              </view>
              <view class="food-arrow">→</view>
            </view>
          </view>
          <view class="more-btn" @click="goToMatchList">
            查看全部搭配 →
          </view>
        </view>
      </view>
    </view>

    <view class="loading" v-else>
      <view class="loading-spinner"></view>
      <text>加载中...</text>
    </view>

    <view class="match-detail-modal" v-if="showMatchModal" @click="closeMatchModal">
      <view class="match-detail-content" @click.stop>
        <view class="match-detail-header">
          <image class="match-detail-img" :src="getImg(currentMatch.image)" mode="aspectFill"></image>
          <view class="match-detail-close" @click="closeMatchModal">×</view>
        </view>
        <view class="match-detail-body">
          <view class="match-detail-name">{{ currentMatch.name }}</view>
          
          <view class="match-detail-section">
            <view class="match-detail-label">主要食材（点击查看详情）</view>
            <view class="match-detail-ingredients">
              <text 
                class="ingredient-clickable" 
                v-for="(ing, idx) in currentMatch.ingredients" 
                :key="idx"
                @click="goToHerbDetail(ing)"
              >
                {{ ing }}
              </text>
            </view>
          </view>
          
          <view class="match-detail-section">
            <view class="match-detail-label">功效</view>
            <view class="match-detail-text">{{ currentMatch.effect }}</view>
          </view>
          
          <view class="match-detail-section">
            <view class="match-detail-label">适宜人群</view>
            <view class="match-detail-text">{{ currentMatch.suitable || '暂无' }}</view>
          </view>
          
          <view class="match-detail-section match-caution-section">
            <view class="match-detail-label match-caution-label">禁忌</view>
            <view class="match-detail-text">{{ currentMatch.taboo || '暂无' }}</view>
          </view>
          
          <view class="match-detail-section">
            <view class="match-detail-label">做法</view>
            <view class="match-detail-method">{{ currentMatch.method || '暂无' }}</view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { herbApi, matchApi, getImageUrl } from '@/api/index.js'

export default {
  data() {
    return {
      herbId: null,
      userImage: '',
      herb: null,
      foodMatches: [],
      isFavorite: false,
      favorites: [],
      showMatchModal: false,
      currentMatch: {}
    }
  },
  onLoad(options) {
    this.herbId = options.id || options.name
    if (options.image) {
      this.userImage = decodeURIComponent(options.image)
    }
    this.loadDetail()
  },
  methods: {
    getImg(url) {
      return getImageUrl(url)
    },
    previewImage(url) {
      if (!url) return
      uni.previewImage({
        urls: [url],
        current: url
      })
    },
    loadFavorites() {
      const fav = uni.getStorageSync('favorites')
      this.favorites = fav ? JSON.parse(fav) : []
      const realId = this.herb ? this.herb.id : parseInt(this.herbId)
      this.isFavorite = this.favorites.includes(realId)
    },
    async toggleFavorite() {
      const realId = this.herb ? this.herb.id : parseInt(this.herbId)
      if (this.isFavorite) {
        this.favorites = this.favorites.filter(id => id !== realId)
        this.isFavorite = false
        uni.showToast({ title: '已取消收藏', icon: 'none' })
      } else {
        this.favorites.push(realId)
        this.isFavorite = true
        uni.showToast({ title: '已收藏', icon: 'success' })
      }
      uni.setStorageSync('favorites', JSON.stringify(this.favorites))
    },
    async loadDetail() {
      try {
        this.herb = await herbApi.getDetail(this.herbId)
        this.loadFavorites()
        this.loadFoodMatch()
      } catch (e) {
        console.error('加载详情失败', e)
      }
    },
    async loadFoodMatch() {
      try {
        const realId = this.herb ? this.herb.id : this.herbId
        this.foodMatches = await herbApi.getFoodMatch(realId)
      } catch (e) {
        console.error('加载搭配失败', e)
      }
    },
    goToMatchDetail(id) {
      uni.navigateTo({
        url: `/pages/match/match?id=${id}&herbId=${this.herbId}`
      })
    },
    goToMatchList() {
      uni.switchTab({
        url: '/pages/match/match'
      })
    },
    async showMatchDetail(item) {
      try {
        const detail = await matchApi.getMatchDetail(item.id)
        this.currentMatch = detail
      } catch (e) {
        console.error('加载搭配详情失败，使用列表数据', e)
        this.currentMatch = item
      }
      this.showMatchModal = true
    },
    closeMatchModal() {
      this.showMatchModal = false
    },
    goToHerbDetail(name) {
      if (!name) return
      const cleanName = String(name).trim()
      if (!cleanName) return
      this.showMatchModal = false
      uni.navigateTo({
        url: `/pages/detail/detail?name=${encodeURIComponent(cleanName)}`
      })
    }
  }
}
</script>

<style lang="scss">
.page {
  min-height: 100vh;
  background: $bg-primary;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  color: $text-muted;
  font-size: $font-size-base;
}

.loading-spinner {
  width: 50rpx;
  height: 50rpx;
  border: 4rpx solid rgba($primary-color, 0.2);
  border-top-color: $primary-color;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: $spacing-md;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.detail-container {
  padding-bottom: 40rpx;
}

.herb-hero {
  position: relative;
  height: 400rpx;
  overflow: hidden;
  background: linear-gradient(135deg, #059669 0%, #10B981 50%, #34D399 100%);
}

.herb-image {
  width: 100%;
  height: 100%;
}

.herb-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 200rpx;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
}

.herb-title-area {
  position: absolute;
  bottom: $spacing-lg;
  left: $spacing-lg;
  right: 100rpx;
  color: #FFFFFF;
}

.favorite-btn {
  position: absolute;
  top: $spacing-lg;
  right: $spacing-lg;
  width: 80rpx;
  height: 80rpx;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  transition: transform $transition-normal;
  cursor: pointer;
  
  &:active {
    transform: scale(0.9);
  }
}

.fav-icon {
  color: $text-disabled;
  transition: color $transition-normal;
}

.fav-icon.favorited {
  color: $error-color;
}

.herb-name {
  font-size: $font-size-display;
  font-weight: $font-weight-bold;
  margin-bottom: $spacing-xs;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.3);
}

.herb-pinyin {
  font-size: $font-size-sm;
  opacity: 0.9;
  margin-bottom: $spacing-xs;
}

.herb-alias {
  font-size: $font-size-xs;
  opacity: 0.8;
}

.content-area {
  padding: $spacing-lg;
  margin-top: -20rpx;
  position: relative;
  z-index: 10;
}

.card {
  background: $bg-card;
  border-radius: $radius-lg;
  padding: $spacing-lg;
  margin-bottom: $spacing-lg;
  box-shadow: $shadow-card;
}

.basic-info {
  .info-row {
    display: flex;
    margin-bottom: $spacing-md;
  }
  
  .info-item {
    flex: 1;
  }
  
  .info-label {
    font-size: $font-size-sm;
    color: $text-muted;
    margin-bottom: $spacing-xs;
  }
  
  .info-value {
    font-size: $font-size-base;
    color: $text-primary;
    font-weight: $font-weight-medium;
  }
}

.info-tags {
  .tag {
    display: inline-block;
    padding: 8rpx 20rpx;
    background: rgba($cta-color, 0.08);
    color: $cta-color;
    border-radius: $radius-full;
    font-size: $font-size-sm;
  }
}

.section-title {
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  margin-bottom: $spacing-md;
  display: flex;
  align-items: center;
}

.section-title::before {
  content: '';
  width: 6rpx;
  height: 28rpx;
  background: $primary-color;
  border-radius: $radius-sm;
  margin-right: $spacing-sm;
}

.section-content {
  font-size: $font-size-base;
  color: $text-secondary;
  line-height: 1.8;
}

.caution-card {
  background: rgba($warning-color, 0.06);
  border: 1rpx solid rgba($warning-color, 0.2);
}

.caution-title {
  color: darken($warning-color, 20%);
}

.caution-title::before {
  background: $warning-color;
}

.caution-icon {
  margin-right: $spacing-xs;
}

.title-icon {
  margin-right: $spacing-xs;
  font-size: $font-size-lg;
}

.classics-section {
  background: rgba($warning-color, 0.04);
  border: 1rpx solid rgba($warning-color, 0.15);
}

.classics-title {
  color: $text-primary;
}

.classics-title::before {
  background: $warning-color;
}

.classics-list {
  .classics-item {
    background: rgba(255, 255, 255, 0.8);
    border-radius: $radius-md;
    padding: $spacing-md;
    margin-bottom: $spacing-md;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  .classics-book {
    font-size: $font-size-sm;
    color: $text-primary;
    font-weight: $font-weight-semibold;
    margin-bottom: $spacing-sm;
    display: flex;
    align-items: center;
  }
  
  .book-icon {
    margin-right: $spacing-xs;
  }
  
  .classics-content {
    font-size: $font-size-sm;
    color: $text-secondary;
    line-height: 1.8;
    font-style: italic;
    padding-left: $spacing-md;
    border-left: 3rpx solid rgba($warning-color, 0.3);
  }
}

.food-match-section {
  background: rgba($cta-color, 0.04);
  border: 1rpx solid rgba($cta-color, 0.15);
}

.food-title {
  color: $cta-color;
}

.food-title::before {
  background: $cta-color;
}

.food-desc {
  font-size: $font-size-sm;
  color: $text-secondary;
  margin-bottom: $spacing-lg;
}

.food-list {
  .food-item {
    display: flex;
    align-items: center;
    background: $bg-card;
    border-radius: $radius-md;
    overflow: hidden;
    margin-bottom: $spacing-md;
    box-shadow: $shadow-sm;
    cursor: pointer;
    transition: transform $transition-normal;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    &:active {
      transform: scale(0.98);
    }
  }
  
  .food-img {
    width: 140rpx;
    height: 140rpx;
    flex-shrink: 0;
    border-radius: $radius-sm;
    margin: $spacing-sm;
  }
  
  .food-info {
    flex: 1;
    padding: $spacing-sm $spacing-sm $spacing-sm 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-width: 0;
  }
  
  .food-name {
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin-bottom: $spacing-xs;
  }
  
  .food-effect {
    font-size: $font-size-sm;
    color: $cta-color;
    margin-bottom: $spacing-sm;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .food-ingredients {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-xs;
  }
  
  .ingredient-tag {
    font-size: $font-size-xs;
    color: $cta-color;
    background: rgba($cta-color, 0.08);
    padding: 6rpx 16rpx;
    border-radius: $radius-full;
    transition: all $transition-fast;
    
    &:active {
      background: $cta-color;
      color: #FFFFFF;
      transform: scale(0.95);
    }
  }

  .food-arrow {
    color: $text-disabled;
    font-size: $font-size-lg;
    margin-right: $spacing-md;
    flex-shrink: 0;
  }
}

.more-btn {
  text-align: center;
  padding-top: $spacing-lg;
  margin-top: $spacing-md;
  border-top: 1rpx solid rgba(0, 0, 0, 0.06);
  font-size: $font-size-sm;
  color: $primary-color;
  font-weight: $font-weight-medium;
  cursor: pointer;
}

.match-detail-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: flex-end;
}

.match-detail-content {
  width: 100%;
  max-height: 85vh;
  background: $bg-card;
  border-radius: $radius-xl $radius-xl 0 0;
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.match-detail-header {
  position: relative;
  height: 300rpx;
}

.match-detail-img {
  width: 100%;
  height: 100%;
}

.match-detail-close {
  position: absolute;
  top: $spacing-md;
  right: $spacing-md;
  width: 64rpx;
  height: 64rpx;
  background: rgba(0, 0, 0, 0.5);
  color: #FFFFFF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $font-size-xxl;
  line-height: 1;
  cursor: pointer;
  
  &:active {
    background: rgba(0, 0, 0, 0.7);
  }
}

.match-detail-body {
  padding: $spacing-lg;
  max-height: calc(85vh - 300rpx);
  overflow-y: auto;
}

.match-detail-name {
  font-size: $font-size-xxl;
  font-weight: $font-weight-bold;
  color: $text-primary;
  margin-bottom: $spacing-lg;
}

.match-detail-section {
  margin-bottom: $spacing-lg;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.match-detail-label {
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  color: $cta-color;
  margin-bottom: $spacing-sm;
  display: flex;
  align-items: center;
}

.match-detail-label::before {
  content: '';
  width: 6rpx;
  height: 24rpx;
  background: $cta-color;
  border-radius: $radius-sm;
  margin-right: $spacing-sm;
}

.match-caution-label {
  color: $error-color;
}

.match-caution-label::before {
  background: $error-color;
}

.match-detail-text {
  font-size: $font-size-sm;
  color: $text-secondary;
  line-height: 1.8;
  padding-left: $spacing-sm;
}

.match-detail-ingredients {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-sm;
  padding-left: $spacing-sm;
}

.ingredient-clickable {
  padding: $spacing-xs $spacing-md;
  background: rgba($cta-color, 0.1);
  color: $cta-color;
  border-radius: $radius-full;
  font-size: $font-size-sm;
  transition: all $transition-fast;
  
  &:active {
    background: $cta-color;
    color: #FFFFFF;
    transform: scale(0.95);
  }
}

.match-detail-method {
  font-size: $font-size-sm;
  color: $text-secondary;
  line-height: 2;
  padding-left: $spacing-sm;
  white-space: pre-line;
}
</style>
