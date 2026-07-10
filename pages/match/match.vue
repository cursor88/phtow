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
  background: $bg-primary;
}

.container {
  padding: $spacing-lg;
}

.card {
  background: $bg-card;
  border-radius: $radius-xl;
  padding: $spacing-lg;
  margin-bottom: $spacing-lg;
  box-shadow: $shadow-card;
}

.search-input-wrap {
  display: flex;
  align-items: center;
  background: $bg-secondary;
  border-radius: $radius-full;
  padding: 0 $spacing-lg;
  height: 80rpx;
  margin-bottom: $spacing-md;
  border: 2rpx solid transparent;
  transition: border-color $transition-normal, box-shadow $transition-normal;
}

.search-input-wrap:focus-within {
  border-color: $primary-color;
  box-shadow: 0 0 0 4rpx rgba($primary-color, 0.1);
}

.search-icon {
  font-size: $font-size-lg;
  margin-right: $spacing-md;
}

.search-input {
  flex: 1;
  font-size: $font-size-base;
  color: $text-primary;
  background: transparent;
}

.search-input::placeholder {
  color: $text-disabled;
}

.search-clear {
  font-size: $font-size-base;
  color: $text-muted;
  padding: $spacing-xs;
  cursor: pointer;
  
  &:active {
    color: $text-secondary;
  }
}

.quick-tags {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-sm;
}

.quick-tag {
  padding: $spacing-sm $spacing-lg;
  background: rgba($cta-color, 0.08);
  color: $cta-color;
  border-radius: $radius-full;
  font-size: $font-size-sm;
  border: 2rpx solid rgba($cta-color, 0.2);
  transition: all $transition-normal;
  cursor: pointer;
  
  &:active {
    transform: scale(0.95);
    background: $cta-color;
    color: #FFFFFF;
    border-color: $cta-color;
  }
}

.herb-section {
  .section-title {
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin-bottom: $spacing-md;
  }
}

.herb-selector {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-md;
}

.herb-chip {
  padding: $spacing-sm $spacing-xl;
  background: $bg-secondary;
  color: $text-secondary;
  border-radius: $radius-full;
  font-size: $font-size-sm;
  border: 2rpx solid transparent;
  transition: all $transition-normal;
  cursor: pointer;
  
  &.active {
    background: rgba($cta-color, 0.1);
    color: $cta-color;
    border-color: $cta-color;
    font-weight: $font-weight-medium;
  }
  
  &:active {
    transform: scale(0.98);
  }
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 $spacing-xs;
  margin-bottom: $spacing-sm;
}

.result-title {
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  color: $text-primary;
}

.result-count {
  font-size: $font-size-sm;
  color: $text-muted;
}

.result-card {
  .result-meta {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    margin-top: $spacing-xs;
  }
  
  .result-score {
    font-size: $font-size-xs;
    color: $warning-color;
    background: rgba($warning-color, 0.1);
    padding: 4rpx 12rpx;
    border-radius: $radius-sm;
  }
  
  .result-herb {
    font-size: $font-size-xs;
    color: $text-muted;
  }
}

.match-list, .search-result {
  .match-card {
    display: flex;
    align-items: center;
    background: $bg-card;
    border-radius: $radius-lg;
    padding: $spacing-lg;
    margin-bottom: $spacing-lg;
    box-shadow: $shadow-card;
    cursor: pointer;
    transition: transform $transition-normal;
    
    &:active {
      transform: scale(0.98);
    }
  }
  
  .match-img {
    width: 140rpx;
    height: 140rpx;
    border-radius: $radius-md;
    margin-right: $spacing-lg;
    flex-shrink: 0;
  }
  
  .match-info {
    flex: 1;
    min-width: 0;
  }
  
  .match-name {
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin-bottom: $spacing-xs;
  }
  
  .match-effect {
    font-size: $font-size-sm;
    color: $cta-color;
    margin-bottom: $spacing-sm;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .match-tags {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-xs;
  }
  
  .match-tag {
    font-size: $font-size-xs;
    color: $text-secondary;
    background: $bg-secondary;
    padding: 4rpx 12rpx;
    border-radius: $radius-sm;
  }
  
  .match-arrow {
    color: $text-disabled;
    font-size: $font-size-lg;
    margin-left: $spacing-sm;
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
  margin-bottom: $spacing-lg;
  opacity: 0.5;
}

.empty-title {
  font-size: $font-size-lg;
  color: $text-primary;
  margin-bottom: $spacing-xs;
  font-weight: $font-weight-medium;
}

.empty-desc {
  font-size: $font-size-sm;
  color: $text-muted;
}

.empty-text {
  font-size: $font-size-base;
  color: $text-muted;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 0;
  color: $text-muted;
  font-size: $font-size-sm;
}

.loading-spinner {
  width: 40rpx;
  height: 40rpx;
  border: 4rpx solid rgba($cta-color, 0.2);
  border-top-color: $cta-color;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: $spacing-md;
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
  background: $bg-card;
  border-radius: $radius-xl $radius-xl 0 0;
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
  top: $spacing-md;
  right: $spacing-md;
  width: 60rpx;
  height: 60rpx;
  background: rgba(0, 0, 0, 0.5);
  color: #FFFFFF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $font-size-xl;
  line-height: 1;
  cursor: pointer;
  
  &:active {
    background: rgba(0, 0, 0, 0.7);
  }
}

.detail-body {
  padding: $spacing-lg;
  max-height: calc(85vh - 300rpx);
  overflow-y: auto;
}

.detail-name {
  font-size: $font-size-xxl;
  font-weight: $font-weight-bold;
  color: $text-primary;
  margin-bottom: $spacing-lg;
}

.detail-section {
  margin-bottom: $spacing-lg;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.detail-label {
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  color: $cta-color;
  margin-bottom: $spacing-sm;
  display: flex;
  align-items: center;
}

.detail-label::before {
  content: '';
  width: 6rpx;
  height: 24rpx;
  background: $cta-color;
  border-radius: $radius-sm;
  margin-right: $spacing-sm;
}

.caution-label {
  color: $error-color;
}

.caution-label::before {
  background: $error-color;
}

.detail-text {
  font-size: $font-size-sm;
  color: $text-secondary;
  line-height: 1.8;
  padding-left: $spacing-sm;
}

.detail-ingredients {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-sm;
  padding-left: $spacing-sm;
}

.ingredient-item {
  padding: $spacing-xs $spacing-md;
  background: rgba($cta-color, 0.1);
  color: $cta-color;
  border-radius: $radius-full;
  font-size: $font-size-sm;
}

.detail-method {
  font-size: $font-size-sm;
  color: $text-secondary;
  line-height: 2;
  padding-left: $spacing-sm;
  white-space: pre-line;
}
</style>
