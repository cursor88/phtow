<template>
  <view class="page">
    <view class="detail-container" v-if="herb">
      <view class="herb-hero">
        <image class="herb-image" :src="userImage || herb.image" mode="aspectFill"></image>
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
          <view class="more-btn" @click="goToClassics">
            查看更多典籍记载 →
          </view>
        </view>

        <view class="section card food-match-section">
          <view class="section-title food-title">
            <text class="title-icon">🍲</text>
            药食同源
          </view>
          <view class="food-desc">以下是{{ herb.name }}的养生搭配推荐</view>
          <view class="food-list">
            <view class="food-item" v-for="item in foodMatches" :key="item.id" @click="goToMatchDetail(item.id)">
              <image class="food-img" :src="item.image" mode="aspectFill"></image>
              <view class="food-info">
                <view class="food-name">{{ item.name }}</view>
                <view class="food-effect">{{ item.effect }}</view>
                <view class="food-ingredients">
                  <text class="ingredient-tag" v-for="(ing, idx) in item.ingredients.slice(0, 4)" :key="idx">{{ ing }}</text>
                </view>
              </view>
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
  </view>
</template>

<script>
import { herbApi } from '@/api/index.js'

export default {
  data() {
    return {
      herbId: null,
      userImage: '',
      herb: null,
      foodMatches: [],
      isFavorite: false,
      favorites: []
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
    goToClassics() {
      uni.navigateTo({
        url: `/pages/classics/classics?id=${this.herbId}`
      })
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
    width: 180rpx;
    height: 180rpx;
    flex-shrink: 0;
  }
  
  .food-info {
    flex: 1;
    padding: $spacing-md;
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
    color: $text-secondary;
    background: $bg-secondary;
    padding: 4rpx 12rpx;
    border-radius: $radius-sm;
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
</style>
