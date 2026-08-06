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
        <view class="herb-section-title">搜索药材查看搭配</view>
        <view class="herb-search-wrap">
          <text class="herb-search-icon">🌿</text>
          <input
            class="herb-search-input"
            type="text"
            placeholder="输入药材名称，如：人参、枸杞"
            v-model="herbSearchKeyword"
            @input="onHerbSearchInput"
          />
          <view class="herb-search-clear" v-if="herbSearchKeyword" @click="clearHerbSearch">
            <text>✕</text>
          </view>
        </view>
      </view>

      <!-- 搜索结果 -->
      <view class="search-result" v-if="isSearching && searchResults.length > 0">
        <view class="result-header">
          <text class="result-title">🔍 相关搭配推荐</text>
          <text class="result-count">共 {{ searchResults.length }} 个</text>
        </view>
        <view
          class="match-card result-card"
          v-for="item in searchResults"
          :key="item.id"
          @click="goToMatchDetail(item.id)"
        >
          <image
            class="match-img"
            :src="getMatchImageUrl(item)"
            mode="aspectFill"
            @click.stop="previewMatchImage(item)"
          ></image>
          <view class="match-info">
            <view class="match-name-row">
              <view class="match-name">{{ item.name }}</view>
              <view class="favorite-btn" @click.stop="toggleMatchFavorite(item)">
                <text class="fav-icon" :class="{ favorited: favMatchIds.includes(item.id) }">♥</text>
              </view>
            </view>
            <view class="match-effect">{{ item.effect }}</view>
            <view class="result-meta">
              <text class="result-score">推荐度 {{ Math.min(Math.round(item.score * 10), 100) }}%</text>
              <text class="result-herb">{{ item.herbName || '' }}</text>
            </view>
          </view>
          <view class="match-arrow">→</view>
        </view>
      </view>

      <!-- 搭配列表（带分页） -->
      <view class="match-list" v-if="!isSearching && matchList.length > 0">
        <view class="list-header" v-if="selectedHerbName">
          <text class="list-title">{{ selectedHerbName }} 的搭配</text>
          <text class="result-count">共 {{ total }} 个</text>
        </view>
        <view class="list-header" v-else>
          <text class="list-title">全部药食同源搭配</text>
          <text class="result-count">共 {{ total }} 个</text>
        </view>
        <view class="match-card" v-for="item in matchList" :key="item.id" @click="goToMatchDetail(item.id)">
          <image
            class="match-img"
            :src="getMatchImageUrl(item)"
            mode="aspectFill"
            @click.stop="previewMatchImage(item)"
          ></image>
          <view class="match-info">
            <view class="match-name-row">
              <view class="match-name">{{ item.name }}</view>
              <view class="favorite-btn" @click.stop="toggleMatchFavorite(item)">
                <text class="fav-icon" :class="{ favorited: favMatchIds.includes(item.id) }">♥</text>
              </view>
            </view>
            <view class="match-effect">{{ item.effect }}</view>
            <view class="match-tags">
              <text class="match-tag" v-for="(ing, idx) in (item.ingredients || []).slice(0, 3)" :key="idx">
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

      <view class="empty-state" v-if="!isSearching && matchList.length === 0 && !loading">
        <text class="empty-icon">🍲</text>
        <text class="empty-text">暂无搭配数据</text>
      </view>

      <view class="loading" v-if="searchLoading || loading">
        <view class="loading-spinner"></view>
        <text>{{ searchLoading ? '搜索中...' : '加载中...' }}</text>
      </view>

      <!-- 数字分页 -->
      <view class="pagination" v-if="!isSearching && total > pageSize">
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
    <custom-tabbar current="match"></custom-tabbar>
  </view>
</template>

<script>
import { matchApi, herbApi, favoriteApi, getImageUrl, resolveHerbImage } from '@/api/index.js'
import customTabbar from '@/components/custom-tabbar/custom-tabbar.vue'

export default {
  components: { customTabbar },
  data() {
    return {
      herbList: [],
      herbSearchKeyword: '',
      selectedHerbId: null,
      matchList: [],
      currentPage: 1,
      pageSize: 10,
      total: 0,
      totalPages: 0,
      loading: false,
      searchKeyword: '',
      searchResults: [],
      isSearching: false,
      searchLoading: false,
      searchTimer: null,
      quickTags: ['口干舌燥', '失眠', '湿气重', '疲劳乏力', '上火', '眼睛干涩'],
      favMatchIds: []
    }
  },
  computed: {
    selectedHerbName() {
      const herb = this.herbList.find(h => h.id === this.selectedHerbId)
      return herb ? herb.name : ''
    },
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
    if (options.id) {
      this.loadMatchDetail(options.id)
    }
    if (options.herbId) {
      this.selectedHerbId = parseInt(options.herbId)
    }
    this.loadHerbList()
  },
  onShow() {
    uni.hideTabBar()
    this.loadFavorites()
    // 检查是否有来自体质测评页的待查看搭配名称
    const pendingMatchName = uni.getStorageSync('pendingMatchName')
    if (pendingMatchName) {
      uni.removeStorageSync('pendingMatchName')
      this.searchAndShowMatch(pendingMatchName)
      return
    }
    // 非搜索状态下，重新加载当前页搭配列表
    if (!this.isSearching) {
      this.loadMatchList()
    }
  },
  methods: {
    async loadFavorites() {
      const token = uni.getStorageSync('token')
      if (!token) {
        this.favMatchIds = []
        return
      }
      try {
        const list = await favoriteApi.getMatches()
        this.favMatchIds = (list || []).map(m => m.id)
      } catch (e) {
        console.error('加载收藏失败', e)
        this.favMatchIds = []
      }
    },
    async searchAndShowMatch(name) {
      // 根据搭配名称搜索并跳转到详情页
      uni.showLoading({ title: '查找搭配...' })
      try {
        const result = await matchApi.searchMatches(name)
        const list = (result && result.list) || []
        const matched = list.find(m => m.name === name) ||
          list.find(m => (m.name || '').indexOf(name) >= 0 || name.indexOf(m.name || '') >= 0)
        uni.hideLoading()
        if (matched) {
          this.goToMatchDetail(matched.id)
        } else {
          uni.showToast({ title: `未找到搭配「${name}」`, icon: 'none' })
          this.loadMatchList()
        }
      } catch (e) {
        uni.hideLoading()
        console.error('查找搭配失败', e)
        this.loadMatchList()
      }
    },
    async toggleMatchFavorite(item) {
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
      console.log('[match] 切换收藏, matchId:', item.id, '当前已收藏:', this.favMatchIds.includes(item.id))
      try {
        const result = await favoriteApi.toggleMatch(item.id)
        console.log('[match] toggleMatch 返回:', result)
        const isFav = result.isFavorited
        if (isFav) {
          if (!this.favMatchIds.includes(item.id)) {
            this.favMatchIds.push(item.id)
          }
          uni.showToast({ title: '已收藏', icon: 'success' })
        } else {
          this.favMatchIds = this.favMatchIds.filter(id => id !== item.id)
          uni.showToast({ title: '已取消收藏', icon: 'none' })
        }
        console.log('[match] 收藏列表更新为:', this.favMatchIds)
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
    async loadHerbList() {
      try {
        const res = await herbApi.getList({ page: 1, pageSize: 500 })
        this.herbList = res.list || []
        // 若未指定药材，默认加载全部搭配列表
        if (!this.selectedHerbId) {
          this.loadMatchList()
        } else {
          this.loadMatchList()
        }
      } catch (e) {
        console.error('加载药材列表失败', e)
      }
    },
    onHerbSearchInput() {
      const kw = (this.herbSearchKeyword || '').trim().toLowerCase()
      if (!kw) {
        this.selectedHerbId = null
        this.currentPage = 1
        this.loadMatchList()
        return
      }
      const matched = this.herbList.find(h => {
        if ((h.name || '').toLowerCase().indexOf(kw) >= 0) return true
        if ((h.pinyin || '').toLowerCase().indexOf(kw) >= 0) return true
        if (h.alias && Array.isArray(h.alias)) {
          return h.alias.some(a => (a || '').toLowerCase().indexOf(kw) >= 0)
        }
        return false
      })
      if (matched) {
        this.selectedHerbId = matched.id
        this.currentPage = 1
        this.loadMatchList()
      }
    },
    clearHerbSearch() {
      this.herbSearchKeyword = ''
      this.selectedHerbId = null
      this.currentPage = 1
      this.loadMatchList()
    },
    selectHerb(id) {
      this.selectedHerbId = id
      this.currentPage = 1
      this.loadMatchList()
    },
    goToPage(page) {
      if (page < 1 || page > this.totalPages || page === this.currentPage) return
      this.currentPage = page
      this.loadMatchList()
      uni.pageScrollTo({ scrollTop: 0, duration: 200 })
    },
    async loadMatchList() {
      this.loading = true
      try {
        const params = {
          page: this.currentPage,
          pageSize: this.pageSize
        }
        if (this.selectedHerbId) {
          params.herbId = this.selectedHerbId
        }
        const res = await matchApi.getMatchList(params)
        this.matchList = res.list || []
        this.total = res.total || 0
        this.totalPages = Math.ceil(this.total / this.pageSize)
      } catch (e) {
        console.error('加载搭配列表失败', e)
      } finally {
        this.loading = false
      }
    },
    async loadMatchDetail(id) {
      this.goToMatchDetail(id)
    },
    goToMatchDetail(id) {
      if (id) {
        uni.navigateTo({ url: `/pages/match-detail/match-detail?id=${id}` })
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
      this.goToMatchDetail(item.id)
    },
    // 搭配图片：优先用 item.image，兜底用关联药材的 cover_image_url
    getMatchImageUrl(item) {
      if (!item) return ''
      // 直接挂在搭配上的 image
      if (item.image) return getImageUrl(item.image)
      if (item.cover_image_url) return getImageUrl(item.cover_image_url)
      // 从已加载的药材列表里找对应药材的封面图
      if (item.herb_id) {
        const herb = this.herbList.find(h => h.id === item.herb_id)
        if (herb) {
          const url = resolveHerbImage(herb)
          if (url) return getImageUrl(url)
        }
      }
      if (item.herbName) {
        const herb = this.herbList.find(h => h.name === item.herbName)
        if (herb) {
          const url = resolveHerbImage(herb)
          if (url) return getImageUrl(url)
        }
      }
      return ''
    },
    // 图片预览：使用 uni.previewImage 原生组件
    previewMatchImage(item) {
      const url = this.getMatchImageUrl(item)
      if (!url) {
        uni.showToast({ title: '暂无图片', icon: 'none' })
        return
      }
      // 收集当前列表的所有图片，支持左右滑动预览
      const list = this.isSearching ? this.searchResults : this.matchList
      const urls = list.map(m => this.getMatchImageUrl(m)).filter(u => u)
      const current = urls.indexOf(url)
      uni.previewImage({
        current: current >= 0 ? url : 0,
        urls: urls.length ? urls : [url],
        indicator: 'number'
      })
    }
  }
}
</script>

<style lang="css">
.page {
  min-height: 100vh;
  background: #F5F1E8;
  padding-bottom: 140rpx;
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", "Microsoft YaHei", sans-serif;
}

.container {
  padding: 24rpx;
}

.card {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
  backdrop-filter: blur(10px);
  border: 1rpx solid rgba(180, 170, 150, 0.25);
}

.search-input-wrap {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 50rpx;
  padding: 0 24rpx;
  height: 80rpx;
  margin-bottom: 20rpx;
  border: 1rpx solid #E5DFD4;
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

.search-clear {
  font-size: 28rpx;
  color: #999;
  padding: 8rpx;
}

.quick-tags {
  display: flex;
  flex-wrap: wrap;
}

.quick-tag {
  padding: 10rpx 24rpx;
  background: #F5F1E8;
  color: #8CA082;
  border-radius: 40rpx;
  font-size: 24rpx;
  border: 2rpx solid #D4CFC4;
  margin-right: 12rpx;
  margin-bottom: 12rpx;
  transition: all 0.2s;
}

.quick-tag:active {
  transform: scale(0.95);
  background: #8CA082;
  color: #fff;
}

.herb-section .section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #3D3D3D;
  margin-bottom: 20rpx;
}

.herb-section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #3D3D3D;
  margin-bottom: 20rpx;
}

.herb-search-wrap {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 40rpx;
  padding: 12rpx 24rpx;
  margin-bottom: 24rpx;
  border: 1rpx solid #E5DFD4;
}

.herb-search-icon {
  font-size: 28rpx;
  margin-right: 12rpx;
  color: #999;
}

.herb-search-input {
  flex: 1;
  height: 48rpx;
  font-size: 26rpx;
  color: #3D3D3D;
  background: transparent;
}

.herb-search-clear {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  background: #ccc;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
  margin-left: 12rpx;
}

.herb-selector {
  display: flex;
  flex-wrap: wrap;
}

.herb-chip {
  padding: 12rpx 28rpx;
  background: #f5f5f5;
  color: #666;
  border-radius: 40rpx;
  font-size: 26rpx;
  border: 2rpx solid transparent;
  margin-right: 16rpx;
  margin-bottom: 16rpx;
}

.herb-chip.active {
  background: #F5F1E8;
  color: #8CA082;
  border-color: #8CA082;
  font-weight: 500;
}

.herb-empty {
  font-size: 24rpx;
  color: #999;
  padding: 20rpx 0;
  text-align: center;
}

.list-header,
.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 8rpx;
  margin-bottom: 16rpx;
}

.list-title,
.result-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #3D3D3D;
}

.result-count {
  font-size: 24rpx;
  color: #999;
}

.result-card .result-meta {
  display: flex;
  align-items: center;
  margin-top: 8rpx;
}

.result-card .result-score {
  font-size: 20rpx;
  color: #f59e0b;
  background: #fef3c7;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  margin-right: 12rpx;
}

.result-card .result-herb {
  font-size: 20rpx;
  color: #999;
}

.match-card {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.04);
  backdrop-filter: blur(10px);
  border: 1rpx solid rgba(180, 170, 150, 0.25);
}

.match-name-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8rpx;
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
  color: #3D3D3D;
  margin-bottom: 8rpx;
}

.match-effect {
  font-size: 24rpx;
  color: #8CA082;
  margin-bottom: 12rpx;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.match-tags {
  display: flex;
  flex-wrap: wrap;
}

.match-tag {
  font-size: 20rpx;
  color: #666;
  background: #f5f5f5;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  margin-right: 8rpx;
  margin-bottom: 8rpx;
}

.match-arrow {
  color: #ccc;
  font-size: 32rpx;
  margin-left: 16rpx;
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
  border: 4rpx solid #E5DFD4;
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
  flex-wrap: nowrap;
  overflow: hidden;
}

.pagination-btn {
  min-width: 64rpx;
  height: 64rpx;
  border-radius: 12rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: 2rpx solid #e5e7eb;
  font-size: 26rpx;
  color: #666;
  padding: 0 12rpx;
  margin: 0 4rpx;
  flex-shrink: 0;
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
</style>
