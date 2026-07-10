<template>
  <view class="page">
    <view class="container">
      <view class="search-section card">
        <view class="search-input-wrap">
          <text class="search-icon">🔍</text>
          <input 
            class="search-input" 
            type="text"
            placeholder="输入症状，如：口干舌燥、失眠、湿气重" 
            v-model="searchKeyword"
            @confirm="handleSearch"
          />
          <view class="search-clear" v-if="searchKeyword" @click="clearSearch">
            <text>✕</text>
          </view>
        </view>
        <view class="quick-tags">
          <view 
            class="quick-tag" 
            v-for="tag in quickTags" 
            :key="tag"
            @click="quickSearch(tag)"
          >
            {{ tag }}
          </view>
        </view>
      </view>

      <view class="herb-section card" v-if="!isSearching">
        <view class="section-title">选择药材查看搭配</view>
        <view class="herb-selector">
          <view 
            class="herb-chip" 
            v-for="herb in herbList" 
            :key="herb.id"
            :class="{ active: selectedHerbId === herb.id }"
            @click="selectHerb(herb.id)"
          >
            {{ herb.name }}
          </view>
        </view>
      </view>

      <view class="search-result" v-if="isSearching && searchResults.length > 0">
        <view class="result-header">
          <text class="result-title">🔍 相关搭配推荐</text>
          <text class="result-count">共 {{ searchResults.length }} 个</text>
        </view>
        <view 
          class="match-card result-card" 
          v-for="item in searchResults" 
          :key="item.id" 
          @click="showDetail(item)"
        >
          <image class="match-img" :src="item.image" mode="aspectFill"></image>
          <view class="match-info">
            <view class="match-name">{{ item.name }}</view>
            <view class="match-effect">{{ item.effect }}</view>
            <view class="result-meta">
              <text class="result-score">推荐度 {{ Math.min(Math.round(item.score * 10), 100) }}%</text>
              <text class="result-herb">{{ item.herbName || '' }}</text>
            </view>
          </view>
          <view class="match-arrow">→</view>
        </view>
      </view>

      <view class="match-list" v-if="!isSearching && matchList.length > 0">
        <view class="match-card" v-for="item in matchList" :key="item.id" @click="showDetail(item)">
          <image class="match-img" :src="item.image" mode="aspectFill"></image>
          <view class="match-info">
            <view class="match-name">{{ item.name }}</view>
            <view class="match-effect">{{ item.effect }}</view>
            <view class="match-tags">
              <text class="match-tag" v-for="(ing, idx) in item.ingredients.slice(0, 3)" :key="idx">
                {{ ing }}
              </text>
            </view>
          </view>
          <view class="match-arrow">→</view>
        </view>
      </view>

      <view class="empty-state" v-if="isSearching && searchResults.length === 0 && !searchLoading">
        <text class="empty-icon">🍲</text>
        <text class="empty-title">未找到相关搭配</text>
        <text class="empty-desc">试试其他症状关键词</text>
      </view>

      <view class="empty-state" v-if="!isSearching && matchList.length === 0">
        <text class="empty-icon">🍲</text>
        <text class="empty-text">请选择药材查看搭配</text>
      </view>

      <view class="loading" v-if="searchLoading">
        <view class="loading-spinner"></view>
        <text>搜索中...</text>
      </view>

      <view class="detail-modal" v-if="showDetailModal" @click="closeDetail">
        <view class="detail-content" @click.stop>
          <view class="detail-header">
            <image class="detail-img" :src="currentDetail.image" mode="aspectFill"></image>
            <view class="detail-close" @click="closeDetail">×</view>
          </view>
          <view class="detail-body">
            <view class="detail-name">{{ currentDetail.name }}</view>
            
            <view class="detail-section">
              <view class="detail-label">主要食材</view>
              <view class="detail-ingredients">
                <text class="ingredient-item" v-for="(ing, idx) in currentDetail.ingredients" :key="idx">
                  {{ ing }}
                </text>
              </view>
            </view>
            
            <view class="detail-section">
              <view class="detail-label">功效</view>
              <view class="detail-text">{{ currentDetail.effect }}</view>
            </view>
            
            <view class="detail-section">
              <view class="detail-label">适宜人群</view>
              <view class="detail-text">{{ currentDetail.suitable }}</view>
            </view>
            
            <view class="detail-section caution-section">
              <view class="detail-label caution-label">禁忌</view>
              <view class="detail-text">{{ currentDetail.taboo }}</view>
            </view>
            
            <view class="detail-section">
              <view class="detail-label">做法</view>
              <view class="detail-method">{{ currentDetail.method }}</view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { matchApi, herbApi } from '@/api/index.js'

export default {
  data() {
    return {
      herbList: [],
      selectedHerbId: null,
      matchList: [],
      showDetailModal: false,
      currentDetail: null,
      searchKeyword: '',
      searchResults: [],
      isSearching: false,
      searchLoading: false,
      searchTimer: null,
      quickTags: ['口干舌燥', '失眠', '湿气重', '疲劳乏力', '上火', '眼睛干涩']
    }
  },
  onLoad(options) {
    if (options.id) {
      this.loadMatchDetail(options.id)
    }
    if (options.herbId) {
      this.selectedHerbId = parseInt(options.herbId)
    }
    this.loadHerbList()
  },
  onShow() {
    if (!this.isSearching && this.selectedHerbId) {
      this.loadMatchList(this.selectedHerbId)
    }
  },
  methods: {
    async loadHerbList() {
      try {
        const res = await herbApi.getList({ page: 1, pageSize: 20 })
        this.herbList = res.list
        if (!this.selectedHerbId && this.herbList.length > 0) {
          this.selectHerb(this.herbList[0].id)
        }
      } catch (e) {
        console.error('加载药材列表失败', e)
      }
    },
    selectHerb(id) {
      this.selectedHerbId = id
      this.loadMatchList(id)
    },
    async loadMatchList(herbId) {
      try {
        this.matchList = await matchApi.getMatchList(herbId)
      } catch (e) {
        console.error('加载搭配列表失败', e)
      }
    },
    async loadMatchDetail(id) {
      try {
        const detail = await matchApi.getMatchDetail(id)
        this.showDetail(detail)
      } catch (e) {
        console.error('加载搭配详情失败', e)
      }
    },
    handleSearch() {
      const keyword = this.searchKeyword.trim()
      if (keyword) {
        this.performSearch(keyword)
      } else {
        this.clearSearch()
      }
    },
    quickSearch(tag) {
      this.searchKeyword = tag
      this.performSearch(tag)
    },
    clearSearch() {
      this.searchKeyword = ''
      this.isSearching = false
      this.searchResults = []
      if (this.searchTimer) {
        clearTimeout(this.searchTimer)
        this.searchTimer = null
      }
    },
    performSearch(keyword) {
      if (this.searchTimer) {
        clearTimeout(this.searchTimer)
      }
      
      this.isSearching = true
      this.searchLoading = true
      
      this.searchTimer = setTimeout(async () => {
        try {
          const result = await matchApi.searchMatches(keyword)
          this.searchResults = result.list || []
        } catch (e) {
          console.error('搜索失败', e)
          this.searchResults = []
        } finally {
          this.searchLoading = false
        }
      }, 300)
    },
    showDetail(item) {
      this.currentDetail = item
      this.showDetailModal = true
    },
    closeDetail() {
      this.showDetailModal = false
    }
  }
}
</script>

<style lang="scss">
.page {
  min-height: 100vh;
  background: #f5f7fa;
}

.container {
  padding: 24rpx;
}

.card {
  background: #fff;
  border-radius: 20rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.search-input-wrap {
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 50rpx;
  padding: 0 24rpx;
  height: 80rpx;
  margin-bottom: 20rpx;
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

.search-clear {
  font-size: 28rpx;
  color: #999;
  padding: 8rpx;
}

.quick-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.quick-tag {
  padding: 10rpx 24rpx;
  background: #f0f9f4;
  color: #2d8b5e;
  border-radius: 40rpx;
  font-size: 24rpx;
  border: 2rpx solid #c8e6d4;
  transition: all 0.2s;
}

.quick-tag:active {
  transform: scale(0.95);
  background: #2d8b5e;
  color: #fff;
}

.herb-section {
  .section-title {
    font-size: 30rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 20rpx;
  }
}

.herb-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.herb-chip {
  padding: 12rpx 28rpx;
  background: #f5f5f5;
  color: #666;
  border-radius: 40rpx;
  font-size: 26rpx;
  border: 2rpx solid transparent;
  transition: all 0.2s;
  
  &.active {
    background: #e8f5ee;
    color: #2d8b5e;
    border-color: #2d8b5e;
    font-weight: 500;
  }
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 8rpx;
  margin-bottom: 16rpx;
}

.result-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.result-count {
  font-size: 24rpx;
  color: #999;
}

.result-card {
  .result-meta {
    display: flex;
    align-items: center;
    gap: 12rpx;
    margin-top: 8rpx;
  }
  
  .result-score {
    font-size: 20rpx;
    color: #f59e0b;
    background: #fef3c7;
    padding: 4rpx 12rpx;
    border-radius: 12rpx;
  }
  
  .result-herb {
    font-size: 20rpx;
    color: #999;
  }
}

.match-list, .search-result {
  .match-card {
    display: flex;
    align-items: center;
    background: #fff;
    border-radius: 20rpx;
    padding: 24rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
  }
  
  .match-img {
    width: 140rpx;
    height: 140rpx;
    border-radius: 16rpx;
    margin-right: 24rpx;
    flex-shrink: 0;
  }
  
  .match-info {
    flex: 1;
    min-width: 0;
  }
  
  .match-name {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 8rpx;
  }
  
  .match-effect {
    font-size: 24rpx;
    color: #2d8b5e;
    margin-bottom: 12rpx;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .match-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8rpx;
  }
  
  .match-tag {
    font-size: 20rpx;
    color: #666;
    background: #f5f5f5;
    padding: 4rpx 12rpx;
    border-radius: 12rpx;
  }
  
  .match-arrow {
    color: #ccc;
    font-size: 32rpx;
    margin-left: 16rpx;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
  opacity: 0.5;
}

.empty-title {
  font-size: 30rpx;
  color: #333;
  margin-bottom: 8rpx;
  font-weight: 500;
}

.empty-desc {
  font-size: 24rpx;
  color: #999;
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
  padding: 80rpx 0;
  color: #999;
  font-size: 26rpx;
}

.loading-spinner {
  width: 40rpx;
  height: 40rpx;
  border: 4rpx solid #e8f5ee;
  border-top-color: #2d8b5e;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16rpx;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.detail-modal {
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

.detail-content {
  width: 100%;
  max-height: 85vh;
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.detail-header {
  position: relative;
  height: 300rpx;
}

.detail-img {
  width: 100%;
  height: 100%;
}

.detail-close {
  position: absolute;
  top: 24rpx;
  right: 24rpx;
  width: 60rpx;
  height: 60rpx;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  line-height: 1;
}

.detail-body {
  padding: 32rpx;
  max-height: calc(85vh - 300rpx);
  overflow-y: auto;
}

.detail-name {
  font-size: 40rpx;
  font-weight: 700;
  color: #333;
  margin-bottom: 32rpx;
}

.detail-section {
  margin-bottom: 28rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.detail-label {
  font-size: 28rpx;
  font-weight: 600;
  color: #2d8b5e;
  margin-bottom: 12rpx;
  display: flex;
  align-items: center;
}

.detail-label::before {
  content: '';
  width: 6rpx;
  height: 24rpx;
  background: #2d8b5e;
  border-radius: 3rpx;
  margin-right: 10rpx;
}

.caution-label {
  color: #dc2626;
}

.caution-label::before {
  background: #dc2626;
}

.detail-text {
  font-size: 26rpx;
  color: #555;
  line-height: 1.8;
  padding-left: 16rpx;
}

.detail-ingredients {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  padding-left: 16rpx;
}

.ingredient-item {
  padding: 8rpx 20rpx;
  background: #e8f5ee;
  color: #2d8b5e;
  border-radius: 20rpx;
  font-size: 24rpx;
}

.detail-method {
  font-size: 26rpx;
  color: #555;
  line-height: 2;
  padding-left: 16rpx;
  white-space: pre-line;
}
</style>
