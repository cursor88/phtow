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
    this.herbId = options.id
    if (options.image) {
      this.userImage = decodeURIComponent(options.image)
    }
    this.loadFavorites()
    this.loadDetail()
    this.loadFoodMatch()
  },
  methods: {
    loadFavorites() {
      const fav = uni.getStorageSync('favorites')
      this.favorites = fav ? JSON.parse(fav) : []
      this.isFavorite = this.favorites.includes(parseInt(this.herbId))
    },
    async toggleFavorite() {
      if (this.isFavorite) {
        this.favorites = this.favorites.filter(id => id !== parseInt(this.herbId))
        this.isFavorite = false
        uni.showToast({ title: '已取消收藏', icon: 'none' })
      } else {
        this.favorites.push(parseInt(this.herbId))
        this.isFavorite = true
        uni.showToast({ title: '已收藏', icon: 'success' })
      }
      uni.setStorageSync('favorites', JSON.stringify(this.favorites))
    },
    async loadDetail() {
      try {
        this.herb = await herbApi.getDetail(this.herbId)
      } catch (e) {
        console.error('加载详情失败', e)
      }
    },
    async loadFoodMatch() {
      try {
        this.foodMatches = await herbApi.getFoodMatch(this.herbId)
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
  background: #f5f7fa;
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
  border: 4rpx solid #e8f5ee;
  border-top-color: #2d8b5e;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20rpx;
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
  bottom: 32rpx;
  left: 32rpx;
  right: 100rpx;
  color: #fff;
}

.favorite-btn {
  position: absolute;
  top: 32rpx;
  right: 32rpx;
  width: 80rpx;
  height: 80rpx;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  transition: transform 0.2s;
}

.favorite-btn:active {
  transform: scale(0.9);
}

.fav-icon {
  color: #d1d5db;
  transition: color 0.2s;
}

.fav-icon.favorited {
  color: #ef4444;
}

.herb-name {
  font-size: 48rpx;
  font-weight: 700;
  margin-bottom: 8rpx;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.3);
}

.herb-pinyin {
  font-size: 26rpx;
  opacity: 0.9;
  margin-bottom: 8rpx;
}

.herb-alias {
  font-size: 24rpx;
  opacity: 0.8;
}

.content-area {
  padding: 24rpx;
  margin-top: -20rpx;
  position: relative;
  z-index: 10;
}

.card {
  background: #fff;
  border-radius: 20rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.basic-info {
  .info-row {
    display: flex;
    margin-bottom: 20rpx;
  }
  
  .info-item {
    flex: 1;
  }
  
  .info-label {
    font-size: 24rpx;
    color: #999;
    margin-bottom: 8rpx;
  }
  
  .info-value {
    font-size: 28rpx;
    color: #333;
    font-weight: 500;
  }
}

.info-tags {
  .tag {
    display: inline-block;
    padding: 8rpx 20rpx;
    background: #e8f5ee;
    color: #2d8b5e;
    border-radius: 20rpx;
    font-size: 24rpx;
  }
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #2d8b5e;
  margin-bottom: 20rpx;
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

.section-content {
  font-size: 28rpx;
  color: #444;
  line-height: 1.8;
}

.caution-card {
  background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
  border: 2rpx solid #fed7aa;
}

.caution-title {
  color: #c2410c;
}

.caution-title::before {
  background: linear-gradient(180deg, #f59e0b, #d97706);
}

.caution-icon {
  margin-right: 8rpx;
}

.title-icon {
  margin-right: 8rpx;
  font-size: 32rpx;
}

.classics-section {
  background: linear-gradient(135deg, #fefdf8 0%, #fdf6e3 100%);
  border: 2rpx solid #f5e6c8;
}

.classics-title {
  color: #92400e;
}

.classics-title::before {
  background: linear-gradient(180deg, #d97706, #b45309);
}

.classics-list {
  .classics-item {
    background: rgba(255, 255, 255, 0.7);
    border-radius: 12rpx;
    padding: 20rpx;
    margin-bottom: 16rpx;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  .classics-book {
    font-size: 26rpx;
    color: #92400e;
    font-weight: 600;
    margin-bottom: 12rpx;
    display: flex;
    align-items: center;
  }
  
  .book-icon {
    margin-right: 8rpx;
  }
  
  .classics-content {
    font-size: 26rpx;
    color: #666;
    line-height: 1.8;
    font-style: italic;
    padding-left: 16rpx;
    border-left: 3rpx solid #f5e6c8;
  }
}

.food-match-section {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border: 2rpx solid #bbf7d0;
}

.food-title {
  color: #166534;
}

.food-title::before {
  background: linear-gradient(180deg, #22c55e, #16a34a);
}

.food-desc {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 24rpx;
}

.food-list {
  .food-item {
    display: flex;
    background: #fff;
    border-radius: 16rpx;
    overflow: hidden;
    margin-bottom: 20rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  .food-img {
    width: 180rpx;
    height: 180rpx;
    flex-shrink: 0;
  }
  
  .food-info {
    flex: 1;
    padding: 20rpx;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  
  .food-name {
    font-size: 30rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 8rpx;
  }
  
  .food-effect {
    font-size: 24rpx;
    color: #2d8b5e;
    margin-bottom: 12rpx;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .food-ingredients {
    display: flex;
    flex-wrap: wrap;
    gap: 8rpx;
  }
  
  .ingredient-tag {
    font-size: 20rpx;
    color: #666;
    background: #f5f5f5;
    padding: 4rpx 12rpx;
    border-radius: 12rpx;
  }
}

.more-btn {
  text-align: center;
  padding-top: 24rpx;
  margin-top: 16rpx;
  border-top: 1rpx solid rgba(0, 0, 0, 0.06);
  font-size: 26rpx;
  color: #2d8b5e;
  font-weight: 500;
}
</style>
