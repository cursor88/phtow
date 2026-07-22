<template>
  <view class="page">
    <view class="search-header">
      <view class="search-bar">
        <text class="search-icon">🔍</text>
        <input 
          class="search-input" 
          placeholder="搜索药材名称" 
          v-model="searchKeyword"
          @confirm="handleSearch"
        />
        <view class="clear-btn" v-if="searchKeyword" @click="clearSearch">✕</view>
      </view>
    </view>

    <view class="category-tabs">
      <scroll-view scroll-x class="tabs-scroll">
        <view class="tabs-container">
          <view 
            class="tab-item" 
            :class="{ active: currentCategory === '' }"
            @click="switchCategory('')"
          >全部</view>
          <view 
            class="tab-item" 
            :class="{ active: showFoodMedicine }"
            @click="toggleFoodMedicine"
          >🌿 药食同源</view>
          <view 
            class="tab-item" 
            :class="{ active: currentCategory === item }"
            v-for="item in categories" 
            :key="item"
            @click="switchCategory(item)"
          >{{ item }}</view>
        </view>
      </scroll-view>
    </view>

    <view class="herb-list" v-if="herbList.length > 0">
      <view class="herb-card" v-for="item in herbList" :key="item.id" @click="goToDetail(item.id)">
        <image class="herb-img" :src="item.image" mode="aspectFill"></image>
        <view class="herb-content">
          <view class="herb-header">
            <view class="herb-name">{{ item.name }}</view>
            <view class="favorite-btn" @click.stop="toggleFavorite(item)">
              <text class="fav-icon" :class="{ favorited: isFavorite(item.id) }">♥</text>
            </view>
          </view>
          <view class="herb-pinyin">{{ item.pinyin }}</view>
          <view class="herb-category-tag">{{ item.category }}</view>
          <view class="food-medicine-tag" v-if="item.is_food_medicine === 1">🌿 药食同源</view>
          <view class="herb-effect">{{ item.effect }}</view>
        </view>
      </view>
    </view>

    <view class="empty-state" v-else-if="!loading">
      <view class="empty-icon">📭</view>
      <view class="empty-text">没有找到相关药材</view>
    </view>

    <view class="loading" v-else>
      <view class="loading-spinner"></view>
      <text>加载中...</text>
    </view>

    <view class="load-more" v-if="hasMore">
      <view class="load-more-btn" @click="loadMore">加载更多</view>
    </view>
  </view>
</template>

<script>
import { herbApi } from '@/api/index.js'

export default {
  data() {
    return {
      searchKeyword: '',
      currentCategory: '',
      showFoodMedicine: false,
      categories: ['补虚药', '清热药', '利水渗湿药', '解表药', '化痰止咳平喘药', '理气药'],
      herbList: [],
      loading: false,
      page: 1,
      pageSize: 10,
      hasMore: true,
      favorites: []
    }
  },
  onLoad() {
    this.loadFavorites()
    this.loadList()
  },
  onShow() {
    this.loadFavorites()
  },
  methods: {
    loadFavorites() {
      const fav = uni.getStorageSync('favorites')
      this.favorites = fav ? JSON.parse(fav) : []
    },
    isFavorite(id) {
      return this.favorites.includes(id)
    },
    async toggleFavorite(item) {
      if (this.isFavorite(item.id)) {
        this.favorites = this.favorites.filter(id => id !== item.id)
        uni.showToast({ title: '已取消收藏', icon: 'none' })
      } else {
        this.favorites.push(item.id)
        uni.showToast({ title: '已收藏', icon: 'success' })
      }
      uni.setStorageSync('favorites', JSON.stringify(this.favorites))
    },
    handleSearch() {
      this.page = 1
      this.hasMore = true
      this.herbList = []
      this.loadList()
    },
    clearSearch() {
      this.searchKeyword = ''
      this.handleSearch()
    },
    switchCategory(category) {
      this.currentCategory = category
      this.showFoodMedicine = false
      this.page = 1
      this.hasMore = true
      this.herbList = []
      this.loadList()
    },
    toggleFoodMedicine() {
      this.showFoodMedicine = !this.showFoodMedicine
      this.currentCategory = ''
      this.page = 1
      this.hasMore = true
      this.herbList = []
      this.loadList()
    },
    async loadList() {
      if (this.loading) return
      this.loading = true
      
      try {
        const res = await herbApi.getList({
          page: this.page,
          pageSize: this.pageSize,
          keyword: this.searchKeyword,
          category: this.currentCategory,
          foodMedicine: this.showFoodMedicine ? '1' : ''
        })
        
        if (this.page === 1) {
          this.herbList = res.list
        } else {
          this.herbList = [...this.herbList, ...res.list]
        }
        
        this.hasMore = res.total > this.herbList.length
      } catch (e) {
        console.error('加载列表失败', e)
      } finally {
        this.loading = false
      }
    },
    loadMore() {
      if (this.hasMore && !this.loading) {
        this.page++
        this.loadList()
      }
    },
    goToDetail(id) {
      uni.navigateTo({
        url: `/pages/detail/detail?id=${id}`
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

.search-header {
  background: #fff;
  padding: 20rpx 24rpx;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.search-bar {
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 50rpx;
  padding: 0 24rpx;
  height: 80rpx;
}

.search-icon {
  font-size: 32rpx;
  margin-right: 16rpx;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  background: transparent;
}

.clear-btn {
  font-size: 28rpx;
  color: #999;
  padding: 8rpx;
}

.category-tabs {
  background: #fff;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.tabs-scroll {
  white-space: nowrap;
}

.tabs-container {
  display: inline-flex;
  padding: 0 24rpx;
}

.tab-item {
  padding: 16rpx 32rpx;
  font-size: 26rpx;
  color: #666;
  background: #f5f5f5;
  border-radius: 40rpx;
  margin-right: 16rpx;
  
  &.active {
    background: linear-gradient(135deg, #2d8b5e, #3da878);
    color: #fff;
  }
}

.herb-list {
  padding: 24rpx;
}

.herb-card {
  display: flex;
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.herb-img {
  width: 240rpx;
  height: 240rpx;
  flex-shrink: 0;
}

.herb-content {
  flex: 1;
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.herb-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.herb-name {
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
}

.favorite-btn {
  font-size: 40rpx;
  padding: 4rpx;
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

.herb-pinyin {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}

.herb-category-tag {
  display: inline-block;
  padding: 6rpx 16rpx;
  background: #e8f5ee;
  color: #2d8b5e;
  border-radius: 16rpx;
  font-size: 22rpx;
  margin-top: 12rpx;
  align-self: flex-start;
}

.food-medicine-tag {
  display: inline-block;
  padding: 6rpx 16rpx;
  background: rgba(#22c55e, 0.1);
  color: #22c55e;
  border-radius: 16rpx;
  font-size: 22rpx;
  margin-top: 8rpx;
  align-self: flex-start;
  font-weight: 500;
}

.herb-effect {
  font-size: 24rpx;
  color: #666;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-top: 8rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx 0;
  color: #999;
  font-size: 26rpx;
}

.loading-spinner {
  width: 40rpx;
  height: 40rpx;
  border: 3rpx solid #e8f5ee;
  border-top-color: #2d8b5e;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16rpx;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.load-more {
  padding: 40rpx 0;
  text-align: center;
}

.load-more-btn {
  display: inline-block;
  padding: 20rpx 60rpx;
  background: #fff;
  color: #2d8b5e;
  border-radius: 50rpx;
  font-size: 28rpx;
  border: 2rpx solid #2d8b5e;
}
</style>
