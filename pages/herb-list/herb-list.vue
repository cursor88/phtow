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

    <view class="checkin-calendar card">
      <view class="calendar-header">
        <view class="section-title">📅 打卡日历</view>
        <view class="calendar-nav">
          <view class="nav-btn" @click="prevMonth">‹</view>
          <view class="nav-text">{{ currentYear }}年{{ currentMonth }}月</view>
          <view class="nav-btn" @click="nextMonth">›</view>
        </view>
      </view>
      <view class="calendar-weekdays">
        <view class="weekday" v-for="day in weekdays" :key="day">{{ day }}</view>
      </view>
      <view class="calendar-grid">
        <view 
          class="calendar-day" 
          v-for="(day, idx) in calendarDays" 
          :key="idx"
          :class="{ 
            'other-month': !day.currentMonth, 
            'today': day.isToday,
            'checked': day.hasRecord,
            'empty': !day.date
          }"
          @click="handleDayClick(day)"
        >
          <text v-if="day.date">{{ day.day }}</text>
          <view class="checkin-dot" v-if="day.hasRecord"></view>
        </view>
      </view>
      <view class="calendar-stats">
        <view class="stat-item">
          <text class="stat-value">{{ monthStats.checkedDays }}</text>
          <text class="stat-label">本月打卡</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-value">{{ stats.consecutiveDays }}</text>
          <text class="stat-label">连续打卡</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-value">{{ stats.totalCount }}</text>
          <text class="stat-label">累计打卡</text>
        </view>
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
        <image class="herb-img" :src="item.image" mode="aspectFill" @click.stop="previewImage(item.image)"></image>
        <view class="herb-content">
          <view class="herb-header">
            <view class="herb-name">{{ item.name }}</view>
            <view class="herb-actions">
              <view class="checkin-btn" :class="{ checked: isChecked(item.id) }" @click.stop="handleCheckin(item)">
                <text>{{ isChecked(item.id) ? '已打卡' : '打卡' }}</text>
              </view>
              <view class="favorite-btn" @click.stop="toggleFavorite(item)">
                <text class="fav-icon" :class="{ favorited: isFavorite(item.id) }">♥</text>
              </view>
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

    <view class="day-detail-modal" v-if="showDayDetail" @click="closeDayDetail">
      <view class="day-detail-content" @click.stop>
        <view class="day-detail-header">
          <view class="day-detail-title">{{ selectedDate }}</view>
          <view class="day-detail-close" @click="closeDayDetail">×</view>
        </view>
        <view class="day-detail-body" v-if="dayRecords.length > 0">
          <view class="day-record-item" v-for="record in dayRecords" :key="record.id">
            <image class="record-img" :src="record.herb.image" mode="aspectFill"></image>
            <view class="record-info">
              <view class="record-name">{{ record.herb.name }}</view>
              <view class="record-effect">{{ record.herb.effect }}</view>
            </view>
          </view>
        </view>
        <view class="day-detail-empty" v-else>
          <text>当日未打卡</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { herbApi, checkinApi } from '@/api/index.js'

export default {
  data() {
    return {
      searchKeyword: '',
      currentCategory: '',
      showFoodMedicine: false,
      categories: ['解表药', '清热药', '泻下药', '祛风湿药', '利水渗湿药', '温里药', '理气药', '消食药', '驱虫药', '止血药', '活血化瘀药', '化痰止咳平喘药', '安神药', '平肝息风药', '开窍药', '补虚药', '收涩药', '涌吐药'],
      herbList: [],
      loading: false,
      page: 1,
      pageSize: 10,
      hasMore: true,
      favorites: [],
      checkedHerbs: [],
      stats: {
        totalCount: 0,
        todayChecked: false,
        consecutiveDays: 0
      },
      monthStats: {
        month: 0,
        year: 0,
        checkedDays: 0,
        totalDays: 0
      },
      currentYear: new Date().getFullYear(),
      currentMonth: new Date().getMonth() + 1,
      weekdays: ['日', '一', '二', '三', '四', '五', '六'],
      calendarDays: [],
      showDayDetail: false,
      selectedDate: '',
      dayRecords: [],
      allRecords: []
    }
  },
  onLoad() {
    this.loadFavorites()
    this.loadList()
    this.loadStats()
    this.loadCalendar()
  },
  onShow() {
    this.loadFavorites()
    this.loadStats()
    this.loadCalendar()
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
    isChecked(id) {
      return this.checkedHerbs.includes(id)
    },
    async handleCheckin(item) {
      if (this.isChecked(item.id)) {
        uni.showToast({ title: '今日已打卡', icon: 'none' })
        return
      }
      
      try {
        const result = await checkinApi.checkin(item.id)
        if (result.alreadyChecked) {
          uni.showToast({ title: '今日已打卡', icon: 'none' })
        } else {
          this.checkedHerbs.push(item.id)
          uni.showToast({ title: '打卡成功', icon: 'success' })
          this.loadStats()
          this.loadCalendar()
        }
      } catch (e) {
        console.error('打卡失败', e)
      }
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
    previewImage(url) {
      if (!url) return
      uni.previewImage({
        urls: [url],
        current: url
      })
    },
    goToDetail(id) {
      uni.navigateTo({
        url: `/pages/detail/detail?id=${id}`
      })
    },
    async loadStats() {
      try {
        const result = await checkinApi.getStats()
        this.stats = result
        
        const today = new Date()
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
        
        const recordsResult = await checkinApi.getRecords()
        this.allRecords = recordsResult.list || []
        
        const todayRecords = this.allRecords.filter(r => r.date === todayStr)
        this.checkedHerbs = todayRecords.map(r => r.herbId)
      } catch (e) {
        console.error('加载统计失败', e)
      }
    },
    async loadCalendar() {
      try {
        const result = await checkinApi.getCalendar(this.currentYear, this.currentMonth)
        this.monthStats = result
        
        this.generateCalendar(result.records)
      } catch (e) {
        console.error('加载日历失败', e)
      }
    },
    generateCalendar(records) {
      const year = this.currentYear
      const month = this.currentMonth
      
      const firstDay = new Date(year, month - 1, 1)
      const lastDay = new Date(year, month, 0)
      const startWeekday = firstDay.getDay()
      const totalDays = lastDay.getDate()
      
      const today = new Date()
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
      
      const days = []
      
      for (let i = startWeekday - 1; i >= 0; i--) {
        const d = new Date(year, month - 1, -i)
        days.push({
          date: null,
          day: d.getDate(),
          currentMonth: false
        })
      }
      
      for (let i = 1; i <= totalDays; i++) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`
        const hasRecord = records.some(r => r.date === dateStr)
        
        days.push({
          date: dateStr,
          day: i,
          currentMonth: true,
          isToday: dateStr === todayStr,
          hasRecord
        })
      }
      
      const remainingDays = 42 - days.length
      for (let i = 1; i <= remainingDays; i++) {
        const d = new Date(year, month, i)
        days.push({
          date: null,
          day: d.getDate(),
          currentMonth: false
        })
      }
      
      this.calendarDays = days
    },
    prevMonth() {
      if (this.currentMonth === 1) {
        this.currentYear--
        this.currentMonth = 12
      } else {
        this.currentMonth--
      }
      this.loadCalendar()
    },
    nextMonth() {
      if (this.currentMonth === 12) {
        this.currentYear++
        this.currentMonth = 1
      } else {
        this.currentMonth++
      }
      this.loadCalendar()
    },
    async handleDayClick(day) {
      if (!day.date) return
      
      this.selectedDate = day.date
      this.dayRecords = this.allRecords.filter(r => r.date === day.date)
      this.showDayDetail = true
    },
    closeDayDetail() {
      this.showDayDetail = false
    }
  }
}
</script>

<style lang="scss">
.page {
  min-height: 100vh;
  background: $bg-primary;
}

.search-header {
  background: $bg-card;
  padding: $spacing-sm $spacing-lg;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: $shadow-sm;
}

.search-bar {
  display: flex;
  align-items: center;
  background: $bg-secondary;
  border-radius: $radius-full;
  padding: 0 $spacing-lg;
  height: 80rpx;
  border: 2rpx solid transparent;
  transition: border-color $transition-normal, box-shadow $transition-normal;
}

.search-bar:focus-within {
  border-color: $primary-color;
  box-shadow: 0 0 0 4rpx rgba($primary-color, 0.1);
}

.search-icon {
  font-size: $font-size-lg;
  margin-right: $spacing-sm;
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

.clear-btn {
  font-size: $font-size-base;
  color: $text-muted;
  padding: $spacing-xs;
  cursor: pointer;
  
  &:active {
    color: $text-secondary;
  }
}

.checkin-calendar {
  margin: $spacing-lg;
  background: $bg-card;
  border-radius: $radius-lg;
  padding: $spacing-lg;
  box-shadow: $shadow-card;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-md;
}

.section-title {
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  color: $text-primary;
}

.calendar-nav {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.nav-btn {
  width: 56rpx;
  height: 56rpx;
  background: $bg-secondary;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $font-size-lg;
  color: $text-secondary;
  cursor: pointer;
  transition: background-color $transition-normal;
  
  &:active {
    background: rgba($primary-color, 0.1);
  }
}

.nav-text {
  font-size: $font-size-base;
  color: $text-primary;
  font-weight: $font-weight-medium;
}

.calendar-weekdays {
  display: flex;
  margin-bottom: $spacing-sm;
}

.weekday {
  flex: 1;
  text-align: center;
  font-size: $font-size-sm;
  color: $text-muted;
  padding: $spacing-sm 0;
}

.calendar-grid {
  display: flex;
  flex-wrap: wrap;
}

.calendar-day {
  width: calc(100% / 7);
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: $font-size-sm;
  color: $text-primary;
  position: relative;
  cursor: pointer;
  
  &.other-month {
    color: $text-disabled;
  }
  
  &.today {
    background: rgba($cta-color, 0.1);
    border-radius: 50%;
    color: $cta-color;
    font-weight: $font-weight-semibold;
  }
  
  &.checked {
    &::before {
      content: '';
      position: absolute;
      width: 60rpx;
      height: 60rpx;
      background: rgba($cta-color, 0.1);
      border-radius: 50%;
      z-index: -1;
    }
  }
  
  &.empty {
    pointer-events: none;
  }
}

.checkin-dot {
  width: 8rpx;
  height: 8rpx;
  background: $cta-color;
  border-radius: 50%;
  position: absolute;
  bottom: 8rpx;
}

.calendar-stats {
  display: flex;
  justify-content: space-around;
  margin-top: $spacing-lg;
  padding-top: $spacing-lg;
  border-top: 1rpx solid $border-light;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 40rpx;
  font-weight: $font-weight-bold;
  color: $cta-color;
}

.stat-label {
  font-size: $font-size-xs;
  color: $text-muted;
  margin-top: $spacing-xs;
}

.stat-divider {
  width: 1rpx;
  background: $border-light;
}

.category-tabs {
  background: $bg-card;
  padding: $spacing-md 0;
  border-bottom: 1rpx solid $border-light;
}

.tabs-scroll {
  white-space: nowrap;
}

.tabs-container {
  display: inline-flex;
  padding: 0 $spacing-lg;
}

.tab-item {
  padding: $spacing-sm $spacing-lg;
  font-size: $font-size-sm;
  color: $text-secondary;
  background: $bg-secondary;
  border-radius: $radius-full;
  margin-right: $spacing-sm;
  cursor: pointer;
  transition: all $transition-normal;
  
  &.active {
    background: $primary-color;
    color: #FFFFFF;
  }
  
  &:active {
    transform: scale(0.98);
  }
}

.herb-list {
  padding: $spacing-lg;
}

.herb-card {
  display: flex;
  background: $bg-card;
  border-radius: $radius-lg;
  overflow: hidden;
  margin-bottom: $spacing-lg;
  box-shadow: $shadow-card;
  cursor: pointer;
  transition: transform $transition-normal;
  
  &:active {
    transform: scale(0.98);
  }
}

.herb-img {
  width: 240rpx;
  height: 240rpx;
  flex-shrink: 0;
}

.herb-content {
  flex: 1;
  padding: $spacing-lg;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
}

.herb-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.herb-name {
  font-size: $font-size-xl;
  font-weight: $font-weight-semibold;
  color: $text-primary;
}

.herb-actions {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.checkin-btn {
  padding: 8rpx 20rpx;
  background: rgba($cta-color, 0.08);
  color: $cta-color;
  border-radius: $radius-full;
  font-size: $font-size-xs;
  border: 1rpx solid rgba($cta-color, 0.2);
  cursor: pointer;
  transition: all $transition-normal;
  
  &.checked {
    background: $cta-color;
    color: #FFFFFF;
    border-color: $cta-color;
  }
  
  &:active {
    transform: scale(0.95);
  }
}

.favorite-btn {
  font-size: 40rpx;
  padding: 4rpx;
  transition: transform $transition-normal;
  cursor: pointer;
}

.favorite-btn:active {
  transform: scale(0.9);
}

.fav-icon {
  color: $text-disabled;
  transition: color $transition-normal;
}

.fav-icon.favorited {
  color: $error-color;
}

.herb-pinyin {
  font-size: $font-size-sm;
  color: $text-muted;
  margin-top: $spacing-xs;
}

.herb-category-tag {
  display: inline-block;
  padding: 6rpx 16rpx;
  background: rgba($primary-color, 0.08);
  color: $primary-color;
  border-radius: $radius-sm;
  font-size: $font-size-xs;
  margin-top: $spacing-sm;
  align-self: flex-start;
}

.food-medicine-tag {
  display: inline-block;
  padding: 6rpx 16rpx;
  background: rgba(#22c55e, 0.1);
  color: #22c55e;
  border-radius: $radius-sm;
  font-size: $font-size-xs;
  margin-top: $spacing-xs;
  align-self: flex-start;
  font-weight: $font-weight-medium;
}

.herb-effect {
  font-size: $font-size-sm;
  color: $text-secondary;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-top: $spacing-xs;
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
  margin-bottom: $spacing-lg;
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
  padding: 60rpx 0;
  color: $text-muted;
  font-size: $font-size-sm;
}

.loading-spinner {
  width: 40rpx;
  height: 40rpx;
  border: 3rpx solid rgba($primary-color, 0.2);
  border-top-color: $primary-color;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: $spacing-md;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.load-more {
  padding: $spacing-xl 0;
  text-align: center;
}

.load-more-btn {
  display: inline-block;
  padding: $spacing-md $spacing-xl;
  background: $bg-card;
  color: $primary-color;
  border-radius: $radius-full;
  font-size: $font-size-base;
  border: 1rpx solid $primary-color;
  cursor: pointer;
  transition: all $transition-normal;
  
  &:active {
    background: rgba($primary-color, 0.05);
    transform: scale(0.98);
  }
}

.day-detail-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.day-detail-content {
  width: 80%;
  background: $bg-card;
  border-radius: $radius-xl;
  overflow: hidden;
}

.day-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-lg;
  border-bottom: 1rpx solid $border-light;
}

.day-detail-title {
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  color: $text-primary;
}

.day-detail-close {
  width: 56rpx;
  height: 56rpx;
  background: $bg-secondary;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $font-size-xl;
  color: $text-secondary;
  cursor: pointer;
  
  &:active {
    background: rgba($primary-color, 0.1);
  }
}

.day-detail-body {
  padding: $spacing-lg;
}

.day-record-item {
  display: flex;
  align-items: center;
  padding: $spacing-md;
  background: $bg-secondary;
  border-radius: $radius-md;
  margin-bottom: $spacing-md;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.record-img {
  width: 100rpx;
  height: 100rpx;
  border-radius: $radius-md;
  margin-right: $spacing-md;
}

.record-info {
  flex: 1;
}

.record-name {
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  margin-bottom: $spacing-xs;
}

.record-effect {
  font-size: $font-size-xs;
  color: $text-secondary;
}

.day-detail-empty {
  padding: 60rpx;
  text-align: center;
  color: $text-muted;
  font-size: $font-size-base;
}
</style>
