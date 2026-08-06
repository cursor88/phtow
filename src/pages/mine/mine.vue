<template>
  <view class="page">
    <view class="profile-header">
      <view class="profile-bg"></view>
      <view class="profile-decoration deco-1"></view>
      <view class="profile-decoration deco-2"></view>
      <view class="profile-info" @click="handleProfileClick">
        <view class="avatar-wrap">
          <image class="avatar" :src="userInfo?.avatar || ''" mode="aspectFill" v-if="userInfo && userInfo.avatar"></image>
          <view class="avatar avatar-fallback" v-else>
            <text class="avatar-icon">👤</text>
          </view>
          <view class="avatar-ring"></view>
        </view>
        <view class="user-info">
          <view class="user-name-row">
            <view class="user-name">{{ userInfo ? (userInfo.nickname || userInfo.username) : '点击登录' }}</view>
            <view class="user-badge" v-if="userInfo">
              <text class="badge-icon">✓</text>
            </view>
          </view>
          <view class="user-title" v-if="userInfo">
            <text class="welcome-icon">🌿</text>
            <text>欢迎回来，继续你的本草之旅</text>
          </view>
          <view class="user-title login-hint" v-else>
            <text class="login-arrow">→</text>
            <text>点击登录，开启智能识别</text>
          </view>
        </view>
      </view>
    </view>

    <view class="container">
      <view class="section card">
        <view class="section-header">
          <view class="section-title">🌿 我的收藏药材</view>
          <view class="section-count" v-if="favHerbs.length > 0">共 {{ favHerbs.length }} 味</view>
        </view>
        <scroll-view class="record-scroll" scroll-y :show-scrollbar="false" v-if="favHerbs.length > 3">
          <view class="record-item" v-for="item in favHerbs" :key="item.id" @click="goToHerbDetail(item.id)">
            <image class="record-img" :src="getImg(item.cover_image_url)" mode="aspectFill" v-if="item.cover_image_url"></image>
            <view class="record-img placeholder-img" v-else>
              <text>🌿</text>
            </view>
            <view class="record-info">
              <view class="record-name">{{ item.name }}</view>
              <view class="record-effect">{{ item.effect }}</view>
            </view>
          </view>
        </scroll-view>
        <view class="record-list" v-else-if="favHerbs.length > 0">
          <view class="record-item" v-for="item in favHerbs" :key="item.id" @click="goToHerbDetail(item.id)">
            <image class="record-img" :src="getImg(item.cover_image_url)" mode="aspectFill" v-if="item.cover_image_url"></image>
            <view class="record-img placeholder-img" v-else>
              <text>🌿</text>
            </view>
            <view class="record-info">
              <view class="record-name">{{ item.name }}</view>
              <view class="record-effect">{{ item.effect }}</view>
            </view>
          </view>
        </view>
        <view class="empty-state" v-else>
          <text class="empty-icon">🌿</text>
          <text class="empty-text">暂无收藏药材</text>
        </view>
      </view>

      <view class="section card">
        <view class="section-header">
          <view class="section-title">🍲 我的收藏搭配</view>
          <view class="section-count" v-if="favMatches.length > 0">共 {{ favMatches.length }} 个</view>
        </view>
        <scroll-view class="record-scroll" scroll-y :show-scrollbar="false" v-if="favMatches.length > 3">
          <view class="record-item match-item" v-for="item in favMatches" :key="item.id" @click="goToMatchDetail(item.id)">
            <view class="record-img placeholder-img">
              <text>🍲</text>
            </view>
            <view class="record-info">
              <view class="record-name">{{ item.name }}</view>
              <view class="match-herbs" v-if="item.ingredients && item.ingredients.length">
                <text class="match-herbs-label">涉及药材：</text>
                <text class="match-herbs-text">{{ item.ingredients.join('、') }}</text>
              </view>
              <view class="record-effect">{{ item.effect }}</view>
            </view>
          </view>
        </scroll-view>
        <view class="record-list" v-else-if="favMatches.length > 0">
          <view class="record-item match-item" v-for="item in favMatches" :key="item.id" @click="goToMatchDetail(item.id)">
            <view class="record-img placeholder-img">
              <text>🍲</text>
            </view>
            <view class="record-info">
              <view class="record-name">{{ item.name }}</view>
              <view class="match-herbs" v-if="item.ingredients && item.ingredients.length">
                <text class="match-herbs-label">涉及药材：</text>
                <text class="match-herbs-text">{{ item.ingredients.join('、') }}</text>
              </view>
              <view class="record-effect">{{ item.effect }}</view>
            </view>
          </view>
        </view>
        <view class="empty-state" v-else>
          <text class="empty-icon">🍲</text>
          <text class="empty-text">暂无收藏搭配</text>
        </view>
      </view>

      <view class="section card">
        <view class="section-title">📊 打卡统计</view>
        <view class="stats-row">
          <view class="stats-col">
            <text class="stats-num">{{ stats.totalCount }}</text>
            <text class="stats-label">累计打卡</text>
          </view>
          <view class="stats-divider"></view>
          <view class="stats-col">
            <text class="stats-num">{{ stats.consecutiveDays }}</text>
            <text class="stats-label">连续天数</text>
          </view>
          <view class="stats-divider"></view>
          <view class="stats-col">
            <text class="stats-num">{{ monthStats.checkedDays }}/{{ monthStats.totalDays }}</text>
            <text class="stats-label">本月打卡</text>
          </view>
        </view>
      </view>

      <view class="section card">
        <view class="section-title">📅 打卡日历</view>
        <view class="calendar-nav">
          <view class="cal-nav-btn" @click="prevMonth">‹</view>
          <view class="cal-nav-text">{{ currentYear }}年{{ currentMonth }}月</view>
          <view class="cal-nav-btn" @click="nextMonth">›</view>
        </view>
        <view class="calendar-weekdays">
          <view class="weekday" v-for="(day, idx) in weekdays" :key="idx">{{ day }}</view>
        </view>
        <view class="calendar-grid">
          <view
            class="calendar-day"
            v-for="(day, idx) in calendarDays"
            :key="idx"
            :class="{
              'other-month': !day.currentMonth,
              'today': day.isToday,
              'checked': day.hasRecord
            }"
            @click="handleDayClick(day)"
          >
            <text v-if="day.currentMonth" class="cal-day-num">{{ day.day }}</text>
            <text v-if="day.hasRecord && day.herbName" class="cal-herb-name">{{ day.herbName }}</text>
            <view class="cal-check-dot" v-if="day.hasRecord && !day.herbName"></view>
          </view>
        </view>
      </view>

      <view class="section card">
        <view class="section-title">🔍 我的识别记录</view>
        <view class="record-list" v-if="identifyRecords.length > 0">
          <view
            class="record-item identify-record"
            v-for="item in identifyRecords.slice(0, 5)"
            :key="item.id"
            @click="goToHerbDetail(item.herbId)"
          >
            <image
              class="record-img"
              :src="getImg(item.herb ? item.herb.image : '')"
              mode="aspectFill"
              v-if="item.herb && item.herb.image"
            ></image>
            <view class="record-img placeholder-img" v-else>
              <text>🌿</text>
            </view>
            <view class="record-info">
              <view class="record-name">{{ item.herb ? item.herb.name : (item.herbName || '未知药材') }}</view>
              <view class="record-effect" v-if="item.herb && item.herb.effect">{{ item.herb.effect }}</view>
              <view class="record-date">{{ formatDate(item.date) }} · 相似度 {{ Math.round((item.accuracy || 0) * 100) }}%</view>
            </view>
            <view class="accuracy-badge">{{ Math.round((item.accuracy || 0) * 100) }}%</view>
          </view>
        </view>
        <view class="empty-state" v-else>
          <text class="empty-icon">🔍</text>
          <text class="empty-text">暂无识别记录</text>
        </view>
      </view>

      <view class="section card">
        <view class="section-title">🏆 成就</view>
        <view class="achievement-list">
          <view class="achievement-item" :class="{ unlocked: stats.totalCount >= 1 }">
            <view class="achievement-icon">🌱</view>
            <view class="achievement-info">
              <view class="achievement-name">初识本草</view>
              <view class="achievement-desc">完成第一次打卡</view>
            </view>
            <view class="achievement-status" v-if="stats.totalCount >= 1">✓</view>
          </view>
          <view class="achievement-item" :class="{ unlocked: stats.consecutiveDays >= 7 }">
            <view class="achievement-icon">🔥</view>
            <view class="achievement-info">
              <view class="achievement-name">七日坚持</view>
              <view class="achievement-desc">连续打卡7天</view>
            </view>
            <view class="achievement-status" v-if="stats.consecutiveDays >= 7">✓</view>
          </view>
          <view class="achievement-item" :class="{ unlocked: stats.totalCount >= 30 }">
            <view class="achievement-icon">🌕</view>
            <view class="achievement-info">
              <view class="achievement-name">月满花开</view>
              <view class="achievement-desc">累计打卡30天</view>
            </view>
            <view class="achievement-status" v-if="stats.totalCount >= 30">✓</view>
          </view>
        </view>
      </view>

      <view class="section card">
        <view class="menu-list">
          <view class="menu-item" @click="goToLlmConfig">
            <view class="menu-icon">🤖</view>
            <view class="menu-text">AI模型配置</view>
            <view class="menu-arrow">→</view>
          </view>
          <view class="menu-item" @click="goToChatHistory">
            <view class="menu-icon">🏥</view>
            <view class="menu-text">我的问诊记录</view>
            <view class="menu-arrow">→</view>
          </view>
          <view class="menu-item" @click="goToConstitution">
            <view class="menu-icon">🧬</view>
            <view class="menu-text">我的测评记录</view>
            <view class="menu-arrow">→</view>
          </view>
          <view class="menu-item" v-if="userInfo && userInfo.role === 'admin'" @click="goToReview">
            <view class="menu-icon">🔧</view>
            <view class="menu-text">识别纠错审核</view>
            <view class="menu-arrow">→</view>
          </view>
          <view class="menu-item" v-if="userInfo" @click="handleLogout">
            <view class="menu-icon">🚪</view>
            <view class="menu-text">退出登录</view>
            <view class="menu-arrow">→</view>
          </view>
        </view>
      </view>
    </view>
    <custom-tabbar current="mine"></custom-tabbar>
  </view>
</template>

<script>
import { checkinApi, identifyApi, favoriteApi, authApi, quizApi, getImageUrl } from '@/api/index.js'
import customTabbar from '@/components/custom-tabbar/custom-tabbar.vue'

export default {
  components: { customTabbar },
  data() {
    return {
      userInfo: null,
      favHerbs: [],
      favMatches: [],
      identifyRecords: [],
      quizDoneCount: 0,
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
      calendarDays: []
    }
  },
  onLoad() {
    this.userInfo = uni.getStorageSync('userInfo') ? JSON.parse(uni.getStorageSync('userInfo')) : null
    this.loadStats()
    this.loadFavorites()
    this.loadIdentifyRecords()
    this.loadQuizStats()
    this.loadCalendar()
    uni.$on('favoritesChanged', this.refreshFavorites)
  },
  onShow() {
    uni.hideTabBar()
    this.userInfo = uni.getStorageSync('userInfo') ? JSON.parse(uni.getStorageSync('userInfo')) : null
    this.loadStats()
    this.loadFavorites()
    this.loadIdentifyRecords()
    this.loadQuizStats()
    this.loadCalendar()
  },
  onUnload() {
    uni.$off('favoritesChanged', this.refreshFavorites)
  },
  methods: {
    getImg(url) {
      return getImageUrl(url)
    },
    async loadStats() {
      try {
        const result = await checkinApi.getStats()
        this.stats = result
        this.monthStats = result.monthStats || { checkedDays: 0, totalDays: 30 }
      } catch (e) {
        console.error('加载统计失败', e)
      }
    },
    async loadFavorites() {
      const token = uni.getStorageSync('token')
      if (!token) {
        console.log('[mine] 无 token，跳过加载收藏')
        this.favHerbs = []
        this.favMatches = []
        return
      }
      try {
        const herbs = await favoriteApi.getHerbs()
        console.log('[mine] 收藏药材原始数据:', herbs)
        this.favHerbs = (herbs || []).map(h => ({
          ...h,
          cover_image_url: h.cover_image_url || h.image_url || h.image || ''
        }))
        console.log('[mine] 收藏药材处理后:', this.favHerbs)
      } catch (e) {
        console.error('[mine] 加载收藏药材失败', e)
        this.favHerbs = []
      }
      try {
        const matches = await favoriteApi.getMatches()
        console.log('[mine] 收藏搭配原始数据:', matches)
        this.favMatches = (matches || []).map(m => {
          let ingredients = m.ingredients
          if (typeof ingredients === 'string') {
            try {
              ingredients = JSON.parse(ingredients)
            } catch (e) {
              ingredients = ingredients ? ingredients.split(/[、,，]/).map(s => s.trim()).filter(Boolean) : []
            }
          }
          if (!Array.isArray(ingredients)) ingredients = []
          return { ...m, ingredients }
        })
        console.log('[mine] 收藏搭配处理后:', this.favMatches)
      } catch (e) {
        console.error('[mine] 加载收藏搭配失败', e)
        this.favMatches = []
      }
    },
    refreshFavorites() {
      this.loadFavorites()
    },
    async loadIdentifyRecords() {
      try {
        const result = await identifyApi.getRecords(1, 20)
        this.identifyRecords = (result && result.list) || []
      } catch (e) {
        console.error('加载识别记录失败', e)
      }
    },
    async loadQuizStats() {
      try {
        const result = await quizApi.getStats()
        this.quizDoneCount = (result && result.total) || 0
      } catch (e) {
        console.error('加载问答统计失败', e)
      }
    },
    async loadCalendar() {
      try {
        const result = await checkinApi.getCalendar(this.currentYear, this.currentMonth)
        this.generateCalendar((result && result.records) || [])
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

      for (let i = 0; i < startWeekday; i++) {
        days.push({
          date: null,
          day: '',
          currentMonth: false
        })
      }

      for (let i = 1; i <= totalDays; i++) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`
        const dayRecord = records.find(r => r.date === dateStr)
        days.push({
          date: dateStr,
          day: i,
          currentMonth: true,
          isToday: dateStr === todayStr,
          hasRecord: !!dayRecord,
          herbId: dayRecord ? dayRecord.herbId : null,
          herbName: dayRecord ? (dayRecord.herbName || dayRecord.name || '') : ''
        })
      }

      const remaining = (7 - (days.length % 7)) % 7
      for (let i = 0; i < remaining; i++) {
        days.push({
          date: null,
          day: '',
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
    handleDayClick(day) {
      if (!day.date || !day.herbId) return
      uni.navigateTo({
        url: `/pages/detail/detail?id=${day.herbId}`
      })
    },
    formatDate(dateStr) {
      if (!dateStr) return ''
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      return `${d.getMonth() + 1}月${d.getDate()}日`
    },
    handleProfileClick() {
      if (!this.userInfo) {
        uni.navigateTo({ url: '/pages/login/login' })
      }
    },
    goToFavHerbs() {
      uni.switchTab({ url: '/pages/herb-list/herb-list' })
    },
    goToFavMatches() {
      uni.switchTab({ url: '/pages/match/match' })
    },
    goToMatchDetail(id) {
      if (id) {
        uni.navigateTo({ url: `/pages/match-detail/match-detail?id=${id}` })
      }
    },
    goToHerbDetail(id) {
      if (id) {
        uni.navigateTo({ url: `/pages/detail/detail?id=${id}` })
      }
    },
    goToLlmConfig() {
      uni.navigateTo({ url: '/pages/llm-config/llm-config' })
    },
    goToChatHistory() {
      uni.navigateTo({ url: '/pages/chat-history/chat-history' })
    },
    goToConstitution() {
      uni.navigateTo({ url: '/pages/constitution/constitution?view=records' })
    },
    goToReview() {
      uni.navigateTo({ url: '/pages/review/review' })
    },
    handleLogout() {
      uni.showModal({
        title: '确认退出',
        content: '确定要退出登录吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              await authApi.logout()
            } catch (e) {
              console.error('退出登录请求失败', e)
            }
            uni.removeStorageSync('token')
            uni.removeStorageSync('userInfo')
            uni.showToast({ title: '已退出登录', icon: 'success' })
            setTimeout(() => {
              uni.reLaunch({ url: '/pages/index/index' })
            }, 1500)
          }
        }
      })
    }
  }
}
</script>

<style>
.page {
  min-height: 100vh;
  background: #F5F1E8;
  padding-bottom: 70px;
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", "Microsoft YaHei", sans-serif;
}

.profile-header {
  position: relative;
  padding-bottom: 48rpx;
  overflow: hidden;
}

.profile-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 320rpx;
  background: linear-gradient(180deg, #6B8F6A 0%, #8CA082 40%, #B5C9A8 75%, #F5F1E8 100%);
}

.profile-bg::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60rpx;
  background: #F5F1E8;
  border-radius: 32rpx 32rpx 0 0;
}

.profile-decoration {
  position: absolute;
  border-radius: 50%;
  opacity: 0.15;
  pointer-events: none;
}

.deco-1 {
  width: 280rpx;
  height: 280rpx;
  background: #fff;
  top: -80rpx;
  right: -60rpx;
}

.deco-2 {
  width: 160rpx;
  height: 160rpx;
  background: rgba(255, 255, 255, 0.3);
  top: 100rpx;
  right: 60rpx;
}

.profile-info {
  position: relative;
  padding: 48rpx 40rpx 40rpx;
  display: flex;
  align-items: center;
  gap: 32rpx;
}

.avatar-wrap {
  position: relative;
  flex-shrink: 0;
}

.avatar {
  width: 128rpx;
  height: 128rpx;
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
  border: 4rpx solid rgba(255, 255, 255, 0.4);
}

.avatar-fallback {
  background: linear-gradient(135deg, #f0f9eb 0%, #e8f5e9 100%);
}

.avatar-icon {
  font-size: 56rpx;
}

.avatar-ring {
  position: absolute;
  top: -8rpx;
  left: -8rpx;
  right: -8rpx;
  bottom: -8rpx;
  border-radius: 50%;
  border: 2rpx dashed rgba(255, 255, 255, 0.35);
  animation: ring-rotate 20s linear infinite;
}

@keyframes ring-rotate {
  to { transform: rotate(360deg); }
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 12rpx;
}

.user-name {
  font-size: 40rpx;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
  max-width: 400rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.15);
}

.user-badge {
  width: 36rpx;
  height: 36rpx;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1rpx solid rgba(255, 255, 255, 0.4);
  flex-shrink: 0;
}

.badge-icon {
  font-size: 20rpx;
  color: #fff;
  font-weight: bold;
}

.user-title {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.5;
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.welcome-icon {
  font-size: 28rpx;
}

.login-hint {
  color: rgba(255, 255, 255, 0.95);
  font-weight: 500;
}

.login-arrow {
  font-size: 28rpx;
  font-weight: bold;
}

.container {
  padding: 24rpx;
  margin-top: 24rpx;
}

.card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border: 1rpx solid rgba(180, 170, 150, 0.25);
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 1rpx 4rpx rgba(0,0,0,0.03);
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #3D3D3D;
  margin-bottom: 24rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.section-header .section-title {
  margin-bottom: 0;
}

.section-count {
  font-size: 24rpx;
  color: #999;
}

.stats-row {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 16rpx 0;
}

.stats-col {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stats-num {
  font-size: 44rpx;
  font-weight: bold;
  color: #8CA082;
}

.stats-label {
  font-size: 22rpx;
  color: #999;
  margin-top: 8rpx;
}

.stats-divider {
  width: 1rpx;
  height: 60rpx;
  background: #eee;
}

.record-list {
  padding-top: 8rpx;
}

.record-scroll {
  max-height: 460rpx;
  padding-top: 8rpx;
}

.record-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.record-item:last-child {
  border-bottom: none;
}

.record-img {
  width: 100rpx;
  height: 100rpx;
  border-radius: 12rpx;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.record-info {
  flex: 1;
  min-width: 0;
}

.record-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #3D3D3D;
  margin-bottom: 8rpx;
}

.record-effect {
  font-size: 24rpx;
  color: #8CA082;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.record-date {
  font-size: 22rpx;
  color: #999;
  margin-top: 4rpx;
}

.match-herbs {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 6rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.match-herbs-label {
  color: #999;
}

.match-herbs-text {
  color: #666;
}

.accuracy-badge {
  font-size: 24rpx;
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
  padding: 8rpx 16rpx;
  border-radius: 16rpx;
  font-weight: 600;
  flex-shrink: 0;
  margin-left: 12rpx;
}

.placeholder-img {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(140, 160, 130, 0.08);
  font-size: 48rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 16rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

.calendar-nav {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 24rpx;
}

.cal-nav-btn {
  width: 60rpx;
  height: 60rpx;
  background: #F5F1E8;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  color: #8CA082;
  margin: 0 24rpx;
}

.cal-nav-text {
  font-size: 30rpx;
  color: #3D3D3D;
  font-weight: 600;
  min-width: 200rpx;
  text-align: center;
}

.calendar-weekdays {
  display: flex;
  margin-bottom: 4rpx;
}

.weekday {
  flex: 1;
  text-align: center;
  font-size: 22rpx;
  color: #999;
  padding: 4rpx 0;
}

.calendar-grid {
  display: flex;
  flex-wrap: wrap;
}

.calendar-day {
  width: calc(100% / 7);
  min-height: 88rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  color: #3D3D3D;
  position: relative;
  padding: 4rpx 2rpx;
  overflow: visible;
}

.calendar-day.other-month {
  color: #ccc;
}

.calendar-day.today {
  background: rgba(140, 160, 130, 0.1);
  border-radius: 8rpx;
  color: #8CA082;
  font-weight: bold;
}

.calendar-day.checked {
  background: rgba(140, 160, 130, 0.15);
  border-radius: 8rpx;
}

.calendar-day.checked .cal-day-num {
  color: #8CA082;
  font-weight: bold;
}

.cal-day-num {
  font-size: 26rpx;
  line-height: 1.2;
}

.cal-check-dot {
  width: 10rpx;
  height: 10rpx;
  background: #8CA082;
  border-radius: 50%;
  margin-top: 4rpx;
}

.cal-herb-name {
  font-size: 18rpx;
  color: #8CA082;
  margin-top: 2rpx;
  line-height: 1.1;
  max-width: 90rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.achievement-list {
  padding-top: 8rpx;
}

.achievement-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
  opacity: 0.5;
}

.achievement-item:last-child {
  border-bottom: none;
}

.achievement-item.unlocked {
  opacity: 1;
}

.achievement-icon {
  font-size: 48rpx;
  margin-right: 16rpx;
}

.achievement-info {
  flex: 1;
}

.achievement-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #3D3D3D;
  margin-bottom: 8rpx;
}

.achievement-desc {
  font-size: 24rpx;
  color: #999;
}

.achievement-status {
  width: 48rpx;
  height: 48rpx;
  background: #8CA082;
  color: #FFFFFF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
}

.menu-list {
  padding-top: 8rpx;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-icon {
  font-size: 40rpx;
  margin-right: 16rpx;
}

.menu-text {
  flex: 1;
  font-size: 28rpx;
  color: #3D3D3D;
}

.menu-arrow {
  font-size: 32rpx;
  color: #ccc;
}
</style>
