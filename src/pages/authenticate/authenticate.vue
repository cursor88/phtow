<template>
  <view class="page">
    <view class="container">
      <!-- 搜索区 -->
      <view class="search-section card">
        <view class="search-input-wrap">
          <text class="search-icon">🔍</text>
          <input
            class="search-input"
            type="text"
            placeholder="输入药材名或冒充物，如：茯苓、木薯、染色"
            v-model="keyword"
            @confirm="handleSearch"
          />
          <view class="search-clear" v-if="keyword" @click="clearKeyword">
            <text>✕</text>
          </view>
        </view>
        <view class="quick-tags" v-if="fraudTypes.length > 0">
          <view
            class="quick-tag"
            :class="{ active: activeFraudType === '' }"
            @click="filterByType('')"
          >全部</view>
          <view
            class="quick-tag"
            :class="{ active: activeFraudType === t }"
            v-for="t in fraudTypes"
            :key="t"
            @click="filterByType(t)"
          >{{ t }}</view>
        </view>
      </view>

      <!-- 列表 -->
      <view class="auth-list" v-if="list.length > 0">
        <view class="list-header">
          <text class="list-title">真伪鉴别指南</text>
          <text class="result-count">共 {{ total }} 条</text>
        </view>
        <view
          class="auth-card"
          v-for="item in list"
          :key="item.id"
          @click="goToDetail(item)"
        >
          <view class="auth-card-head">
            <view class="auth-herb-name">{{ item.herbName }}</view>
            <view class="auth-fraud-tag" :class="fraudClass(item.fraudType)">{{ item.fraudType }}</view>
          </view>
          <view class="auth-counterfeiter">冒充物/手法：{{ item.counterfeiter }}</view>
          <view class="auth-summary">{{ item.summary }}</view>
          <view class="auth-keypoints" v-if="item.keyPoints && item.keyPoints.length">
            <view class="keypoint-item" v-for="(kp, idx) in item.keyPoints.slice(0, 3)" :key="idx">
              <text class="keypoint-label">{{ kp.label }}</text>
              <view class="keypoint-compare">
                <text class="keypoint-genuine">真：{{ kp.genuine }}</text>
                <text class="keypoint-fake">假：{{ kp.fake }}</text>
              </view>
            </view>
          </view>
          <view class="auth-arrow">查看详情 →</view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-if="list.length === 0 && !loading">
        <text class="empty-icon">🔍</text>
        <text class="empty-title">未找到相关鉴别数据</text>
        <text class="empty-desc">试试其他关键词或查看全部</text>
      </view>

      <!-- 加载中 -->
      <view class="loading" v-if="loading">
        <view class="loading-spinner"></view>
        <text>加载中...</text>
      </view>

      <!-- 数字分页 -->
      <view class="pagination" v-if="total > pageSize">
        <view
          class="pagination-btn"
          :class="{ disabled: currentPage <= 1 }"
          @click="goToPage(currentPage - 1)"
        >←</view>
        <template v-for="(p, idx) in pageList" :key="idx">
          <view v-if="p === -1" class="pagination-dot">...</view>
          <view
            v-else
            class="pagination-btn"
            :class="{ active: p === currentPage }"
            @click="goToPage(p)"
          >{{ p }}</view>
        </template>
        <view
          class="pagination-btn"
          :class="{ disabled: currentPage >= totalPages }"
          @click="goToPage(currentPage + 1)"
        >→</view>
      </view>
    </view>
  </view>
</template>

<script>
import { authenticateApi } from '@/api/index.js'

export default {
  data() {
    return {
      keyword: '',
      list: [],
      currentPage: 1,
      pageSize: 10,
      total: 0,
      totalPages: 0,
      loading: false,
      fraudTypes: [],
      activeFraudType: ''
    }
  },
  computed: {
    pageList() {
      const pages = []
      const total = this.totalPages
      const cur = this.currentPage
      for (let i = 1; i <= total; i++) {
        if (i === 1 || i === total || (i >= cur - 1 && i <= cur + 1)) {
          pages.push(i)
        } else if (pages.length > 0 && pages[pages.length - 1] !== -1) {
          pages.push(-1)
        }
      }
      return pages
    }
  },
  onLoad(options) {
    // 支持从首页搜索框带关键词跳转
    if (options && options.keyword) {
      this.keyword = decodeURIComponent(options.keyword)
    }
  },
  onShow() {
    this.loadTypes()
    this.loadList()
  },
  methods: {
    async loadTypes() {
      try {
        const types = await authenticateApi.getTypes()
        this.fraudTypes = types || []
      } catch (e) {
        console.error('加载分类失败', e)
      }
    },
    async loadList() {
      this.loading = true
      try {
        const params = {
          page: this.currentPage,
          pageSize: this.pageSize
        }
        if (this.activeFraudType) params.fraudType = this.activeFraudType
        if (this.keyword.trim()) params.keyword = this.keyword.trim()
        const res = await authenticateApi.getList(params)
        this.list = (res && res.list) || []
        this.total = (res && res.total) || 0
        this.totalPages = Math.ceil(this.total / this.pageSize)
      } catch (e) {
        console.error('加载列表失败', e)
      } finally {
        this.loading = false
      }
    },
    handleSearch() {
      this.currentPage = 1
      this.loadList()
    },
    clearKeyword() {
      this.keyword = ''
      this.currentPage = 1
      this.loadList()
    },
    filterByType(type) {
      this.activeFraudType = type
      this.currentPage = 1
      this.loadList()
    },
    goToPage(page) {
      if (page < 1 || page > this.totalPages || page === this.currentPage) return
      this.currentPage = page
      this.loadList()
      uni.pageScrollTo({ scrollTop: 0, duration: 200 })
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
    goToDetail(item) {
      uni.navigateTo({
        url: `/pages/authenticate/authenticate-detail?id=${item.id}`
      })
    }
  }
}
</script>

<style>
.page {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 160rpx;
}

.container {
  padding: 24rpx;
}

.card {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.search-section {
  background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
  border: 2rpx solid #e8f5ee;
}

.search-input-wrap {
  display: flex;
  align-items: center;
  background: #ffffff;
  border-radius: 44rpx;
  padding: 0 28rpx;
  height: 96rpx;
  border: 2rpx solid #e8f5ee;
}

.search-icon {
  font-size: 32rpx;
  margin-right: 16rpx;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  height: 96rpx;
  line-height: 96rpx;
}

.search-clear {
  width: 44rpx;
  height: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 28rpx;
  flex-shrink: 0;
}

.quick-tags {
  display: flex;
  flex-wrap: wrap;
  margin-top: 24rpx;
}

.quick-tag {
  font-size: 24rpx;
  color: #2d8b5e;
  background: rgba(45, 139, 94, 0.08);
  border: 1rpx solid rgba(45, 139, 94, 0.2);
  padding: 10rpx 24rpx;
  border-radius: 24rpx;
  margin-right: 16rpx;
  margin-bottom: 12rpx;
  transition: all 0.2s;
}

.quick-tag.active {
  background: #2d8b5e;
  color: #ffffff;
  border-color: #2d8b5e;
}

.auth-list {
  margin-top: 8rpx;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 8rpx 20rpx;
}

.list-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.result-count {
  font-size: 24rpx;
  color: #999;
}

.auth-card {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 28rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
  border-left: 8rpx solid #2d8b5e;
  transition: all 0.2s;
}

.auth-card:active {
  transform: scale(0.98);
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.08);
}

.auth-card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.auth-herb-name {
  font-size: 34rpx;
  font-weight: 700;
  color: #2d8b5e;
}

.auth-fraud-tag {
  font-size: 22rpx;
  padding: 6rpx 20rpx;
  border-radius: 20rpx;
  font-weight: 500;
}

.fraud-maoc {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  border: 1rpx solid rgba(239, 68, 68, 0.2);
}

.fraud-jiu {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
  border: 1rpx solid rgba(245, 158, 11, 0.2);
}

.fraud-ran {
  background: rgba(168, 85, 247, 0.1);
  color: #9333ea;
  border: 1rpx solid rgba(168, 85, 247, 0.2);
}

.fraud-liu {
  background: rgba(234, 179, 8, 0.1);
  color: #a16207;
  border: 1rpx solid rgba(234, 179, 8, 0.2);
}

.fraud-default {
  background: rgba(45, 139, 94, 0.1);
  color: #2d8b5e;
  border: 1rpx solid rgba(45, 139, 94, 0.2);
}

.auth-counterfeiter {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 8rpx;
}

.auth-summary {
  font-size: 26rpx;
  color: #333;
  line-height: 1.6;
  margin-bottom: 20rpx;
}

.auth-keypoints {
  background: #f8fafc;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 16rpx;
}

.keypoint-item {
  margin-bottom: 14rpx;
}

.keypoint-item:last-child {
  margin-bottom: 0;
}

.keypoint-label {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 6rpx;
  display: block;
}

.keypoint-compare {
  display: flex;
  flex-direction: column;
}

.keypoint-genuine {
  font-size: 24rpx;
  color: #2d8b5e;
  margin-bottom: 4rpx;
}

.keypoint-fake {
  font-size: 24rpx;
  color: #dc2626;
}

.auth-arrow {
  text-align: right;
  font-size: 24rpx;
  color: #2d8b5e;
  font-weight: 500;
}

.empty-state {
  text-align: center;
  padding: 120rpx 32rpx;
}

.empty-icon {
  font-size: 80rpx;
  display: block;
  margin-bottom: 16rpx;
}

.empty-title {
  font-size: 30rpx;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.empty-desc {
  font-size: 24rpx;
  color: #999;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 0;
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

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx 0;
  flex-wrap: wrap;
}

.pagination-btn {
  min-width: 64rpx;
  height: 64rpx;
  line-height: 64rpx;
  text-align: center;
  background: #ffffff;
  color: #2d8b5e;
  border: 2rpx solid #e8f5ee;
  border-radius: 12rpx;
  margin: 0 6rpx 12rpx;
  padding: 0 16rpx;
  font-size: 26rpx;
}

.pagination-btn.active {
  background: #2d8b5e;
  color: #ffffff;
  border-color: #2d8b5e;
}

.pagination-btn.disabled {
  opacity: 0.4;
  pointer-events: none;
}

.pagination-dot {
  width: 40rpx;
  text-align: center;
  color: #999;
  font-size: 24rpx;
  line-height: 64rpx;
}
</style>
