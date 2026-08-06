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
            :class="{ active: currentCategory === item }"
            v-for="item in categories"
            :key="item"
            @click="switchCategory(item)"
          >{{ item === '药食同源' ? '🌿 ' + item : item }}</view>
        </view>
      </scroll-view>
    </view>

    <view class="herb-list" v-if="herbList.length > 0">
      <view class="herb-card" v-for="item in herbList" :key="item.id">
        <image
          class="herb-img"
          :src="getHerbImageUrl(item)"
          mode="aspectFill"
          @click.stop="previewHerbImage(item)"
        ></image>
        <view class="herb-content" @click="goToDetail(item.id)">
          <view class="herb-header">
            <view class="herb-name">{{ item.name }}</view>
            <view class="favorite-btn" @click.stop="toggleFavorite(item)">
              <text class="fav-icon" :class="{ favorited: isFavorite(item.id) }">♥</text>
            </view>
          </view>
          <view class="herb-pinyin">{{ item.pinyin }}</view>
          <view class="herb-tags">
            <view class="herb-category-tag">{{ item.category }}</view>
            <view class="food-medicine-tag" v-if="item.is_food_medicine === 1">🌿 药食同源</view>
          </view>
          <view class="herb-effect">{{ item.effect }}</view>
        </view>
      </view>
    </view>

    <view class="empty-state" v-else-if="!loading">
      <view class="empty-icon">🔍</view>
      <view class="empty-title">未找到相关药材</view>
      <view class="empty-desc">试试其他关键词或分类</view>
    </view>

    <view class="loading" v-else>
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

    <view class="page-info" v-if="total > 0">共 {{ total }} 味药材</view>

    <!-- 图片预览 -->
    <view class="image-preview-overlay" v-if="previewVisible" @click="closePreview">
      <image class="preview-img" :src="previewUrl" mode="aspectFit"></image>
      <view class="image-preview-close" @click.stop="closePreview">×</view>
      <view class="image-preview-hint">点击任意位置关闭</view>
    </view>

    <custom-tabbar current="herb"></custom-tabbar>
  </view>
</template>

<script>
import { herbApi, favoriteApi, getHerbImageUrl } from '@/api/index.js'
import customTabbar from '@/components/custom-tabbar/custom-tabbar.vue'

export default {
  components: { customTabbar },
  data() {
    return {
      searchKeyword: '',
      currentCategory: '全部',
      categories: ['全部', '药食同源', '解表药', '清热药', '泻下药', '祛风湿药', '利水渗湿药', '温里药', '理气药', '消食药', '驱虫药', '止血药', '活血化瘀药', '化痰止咳平喘药', '安神药', '平肝息风药', '开窍药', '补虚药', '收涩药', '涌吐药'],
      herbList: [],
      loading: false,
      currentPage: 1,
      pageSize: 10,
      total: 0,
      totalPages: 0,
      favorites: [],
      previewVisible: false,
      previewUrl: ''
    }
  },
  computed: {
    // 数字分页按钮列表（带省略号，参考 demo.html 逻辑）
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
  onLoad() {
    uni.hideTabBar()
    this.loadFavorites()
    this.loadList()
  },
  onShow() {
    uni.hideTabBar()
    this.loadFavorites()
  },
  methods: {
    getHerbImageUrl,
    async loadFavorites() {
      const token = uni.getStorageSync('token')
      if (!token) {
        this.favorites = []
        return
      }
      try {
        const list = await favoriteApi.getHerbs()
        this.favorites = (list || []).map(h => h.id)
      } catch (e) {
        console.error('加载收藏失败', e)
        this.favorites = []
      }
    },
    isFavorite(id) {
      return this.favorites.includes(id)
    },
    async toggleFavorite(item) {
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
      console.log('[herb-list] 切换收藏, herbId:', item.id, '当前已收藏:', this.favorites.includes(item.id))
      try {
        const result = await favoriteApi.toggleHerb(item.id)
        console.log('[herb-list] toggleHerb 返回:', result)
        const isFav = result.isFavorited
        if (isFav) {
          if (!this.favorites.includes(item.id)) {
            this.favorites.push(item.id)
          }
          uni.showToast({ title: '已收藏', icon: 'success' })
        } else {
          this.favorites = this.favorites.filter(id => id !== item.id)
          uni.showToast({ title: '已取消收藏', icon: 'none' })
        }
        console.log('[herb-list] 收藏列表更新为:', this.favorites)
        uni.$emit('favoritesChanged')
      } catch (e) {
        console.error('收藏操作失败', e)
        const errCode = e?.code || e?.data?.code
        if (errCode === 401) {
          uni.removeStorageSync('token')
          uni.showModal({
            title: '登录已过期',
            content: '请重新登录',
            confirmText: '去登录',
            success: (res) => {
              if (res.confirm) {
                uni.navigateTo({ url: '/pages/login/login' })
              }
            }
          })
        } else {
          uni.showToast({ title: e?.message || e?.data?.message || '操作失败', icon: 'none' })
        }
      }
    },
    handleSearch() {
      this.currentPage = 1
      this.loadList()
    },
    clearSearch() {
      this.searchKeyword = ''
      this.currentPage = 1
      this.loadList()
    },
    switchCategory(category) {
      this.currentCategory = category
      this.currentPage = 1
      this.loadList()
    },
    goToPage(page) {
      if (page < 1 || page > this.totalPages || page === this.currentPage) return
      this.currentPage = page
      this.loadList()
      uni.pageScrollTo({ scrollTop: 0, duration: 200 })
    },
    async loadList() {
      if (this.loading) return
      this.loading = true
      try {
        const params = {
          page: this.currentPage,
          pageSize: this.pageSize,
          keyword: this.searchKeyword
        }
        if (this.currentCategory === '药食同源') {
          params.foodMedicine = '1'
        } else if (this.currentCategory !== '全部') {
          params.category = this.currentCategory
        }
        const res = await herbApi.getList(params)
        this.herbList = res.list || []
        this.total = res.total || 0
        this.totalPages = Math.ceil(this.total / this.pageSize)
      } catch (e) {
        console.error('加载列表失败', e)
      } finally {
        this.loading = false
      }
    },
    goToDetail(id) {
      uni.navigateTo({
        url: `/pages/detail/detail?id=${id}`
      })
    },
    // 图片预览：使用 uni.previewImage 原生组件，支持双指缩放和滑动关闭
    previewHerbImage(item) {
      const url = getHerbImageUrl(item)
      // 收集当前列表所有图片，支持左右滑动预览
      const urls = this.herbList.map(h => getHerbImageUrl(h))
      const current = urls.indexOf(url)
      uni.previewImage({
        current: current >= 0 ? url : 0,
        urls: urls,
        indicator: 'number'
      })
    },
    closePreview() {
      this.previewVisible = false
      this.previewUrl = ''
    }
  }
}
</script>

<style lang="css">
.page {
  min-height: 100vh;
  background: #F5F1E8;
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", "Microsoft YaHei", sans-serif;
  padding-bottom: 140rpx;
}

.search-header {
  background: rgba(245, 241, 232, 0.92);
  backdrop-filter: blur(20px);
  padding: 20rpx 24rpx;
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1rpx solid rgba(180, 170, 150, 0.15);
}

.search-bar {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.75);
  border: 1rpx solid rgba(180, 170, 150, 0.2);
  border-radius: 50rpx;
  padding: 0 24rpx;
  height: 80rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.03);
}

.search-icon {
  font-size: 32rpx;
  margin-right: 16rpx;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #3D3D3D;
  background: transparent;
}

.clear-btn {
  font-size: 28rpx;
  color: #999;
  padding: 8rpx;
}

.category-tabs {
  background: rgba(245, 241, 232, 0.92);
  backdrop-filter: blur(20px);
  padding: 16rpx 0;
  border-bottom: 1rpx solid rgba(180, 170, 150, 0.15);
}

.tabs-scroll {
  white-space: nowrap;
}

.tabs-container {
  display: inline-flex;
  padding: 0 24rpx;
  gap: 12rpx;
}

.tab-item {
  padding: 14rpx 28rpx;
  font-size: 26rpx;
  color: #666;
  background: rgba(255, 255, 255, 0.6);
  border: 1rpx solid rgba(180, 170, 150, 0.2);
  border-radius: 32rpx;
  margin-right: 0;
  display: inline-flex;
  transition: all 0.25s ease;
}

.tab-item.active {
  background: linear-gradient(135deg, #8CA082 0%, #A8B89E 100%);
  color: #fff;
  font-weight: 600;
  border-color: transparent;
  box-shadow: 0 4rpx 12rpx rgba(140, 160, 130, 0.3);
}

.herb-list {
  padding: 24rpx;
}

.herb-card {
  display: flex;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border: 1rpx solid rgba(180, 170, 150, 0.25);
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(180, 170, 150, 0.08);
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
  color: #3D3D3D;
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

.herb-tags {
  display: flex;
  flex-wrap: wrap;
  margin-top: 12rpx;
}

.herb-category-tag {
  padding: 6rpx 16rpx;
  background: #e8f5ee;
  color: #8CA082;
  border-radius: 16rpx;
  font-size: 22rpx;
  margin-right: 8rpx;
  margin-bottom: 8rpx;
}

.food-medicine-tag {
  padding: 6rpx 16rpx;
  background: #e7faee;
  color: #22c55e;
  border-radius: 16rpx;
  font-size: 22rpx;
  font-weight: 500;
  margin-right: 8rpx;
  margin-bottom: 8rpx;
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
  padding: 120rpx 0;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
  opacity: 0.5;
}

.empty-title {
  font-size: 30rpx;
  color: #3D3D3D;
  margin-bottom: 8rpx;
  font-weight: 500;
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
  font-size: 26rpx;
}

.loading-spinner {
  width: 40rpx;
  height: 40rpx;
  border: 4rpx solid #e8f5ee;
  border-top-color: #8CA082;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16rpx;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 数字分页（参考 demo.html） */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx 0 16rpx;
  flex-wrap: wrap;
}

.pagination-btn {
  min-width: 72rpx;
  height: 72rpx;
  border-radius: 12rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: 2rpx solid #e5e7eb;
  font-size: 28rpx;
  color: #666;
  padding: 0 16rpx;
  margin: 0 6rpx;
}

.pagination-btn.active {
  background: #8CA082;
  color: #fff;
  border-color: #8CA082;
  font-weight: 600;
}

.pagination-btn.disabled {
  opacity: 0.4;
}

.pagination-dot {
  color: #999;
  font-size: 28rpx;
  padding: 0 8rpx;
}

.page-info {
  text-align: center;
  font-size: 24rpx;
  color: #999;
  padding: 8rpx 0 32rpx;
}

/* 图片预览（兜底 UI，主要走 uni.previewImage） */
.image-preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-img {
  width: 95%;
  max-height: 85vh;
}

.image-preview-close {
  position: absolute;
  top: 32rpx;
  right: 32rpx;
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  font-size: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.image-preview-hint {
  position: absolute;
  bottom: 48rpx;
  left: 0;
  right: 0;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  font-size: 24rpx;
}
</style>
