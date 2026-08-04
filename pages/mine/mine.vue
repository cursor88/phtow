<template>
  <view class="page">
    <view class="profile-header">
      <view class="profile-bg"></view>
      <view class="profile-info" @click="handleProfileClick">
        <view class="avatar">👤</view>
        <view class="user-name">{{ userInfo ? userInfo.username : '点击登录' }}</view>
        <view class="user-title">{{ userInfo ? '欢迎回来' : '登录后享受更多功能' }}</view>
      </view>
      <view class="profile-stats">
        <view class="stat-item">
          <text class="stat-value">{{ stats.totalCount }}</text>
          <text class="stat-label">累计打卡</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-value">{{ stats.consecutiveDays }}</text>
          <text class="stat-label">连续天数</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-value">{{ monthStats.checkedDays }}/{{ monthStats.totalDays }}</text>
          <text class="stat-label">本月打卡</text>
        </view>
      </view>
    </view>

    <view class="container">
      <view class="section card">
        <view class="section-header">
          <view class="section-title">🌿 我的收藏药材</view>
          <view class="section-more" @click="goToFavHerbs">查看全部</view>
        </view>
        <view class="record-list" v-if="favHerbs.length > 0">
          <view class="record-item" v-for="item in favHerbs.slice(0, 2)" :key="item.id" @click="goToHerbDetail(item.id)">
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
          <view class="section-more" @click="goToFavMatches">查看全部</view>
        </view>
        <view class="record-list" v-if="favMatches.length > 0">
          <view class="record-item" v-for="item in favMatches.slice(0, 2)" :key="item.id">
            <view class="record-img placeholder-img">
              <text>🍲</text>
            </view>
            <view class="record-info">
              <view class="record-name">{{ item.name }}</view>
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
          <view class="nav-btn" @click="prevMonth">‹</view>
          <view class="nav-text">{{ currentYear }}年{{ currentMonth }}月</view>
          <view class="nav-btn" @click="nextMonth">›</view>
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
              'checked': day.hasRecord
            }"
            @click="handleDayClick(day)"
          >
            <text v-if="day.date" class="cal-day-num">{{ day.day }}</text>
            <view class="cal-herb-name" v-if="day.hasRecord && day.herbName">{{ day.herbName }}</view>
          </view>
        </view>
      </view>

      <view class="section card">
        <view class="section-title">🔍 我的识别记录</view>
        <view class="record-list" :class="{ 'scroll-list': identifyRecords.length > 3 }" v-if="identifyRecords.length > 0">
          <view 
            class="record-item identify-record" 
            v-for="item in identifyRecords" 
            :key="item.id"
            @click="goToHerbDetail(item.herbId)"
          >
            <image
              class="record-img"
              :src="getImg(item.herb ? item.herb.image : '')"
              mode="aspectFill"
              v-if="item.herb"
            ></image>
            <view class="record-img placeholder-img" v-else>
              <text>🌿</text>
            </view>
            <view class="record-info">
              <view class="record-name">{{ item.herb ? item.herb.name : (item.herbName || '未知药材') }}</view>
              <view class="record-effect" v-if="item.herb">{{ item.herb.effect }}</view>
              <view class="record-date">
                {{ formatDate(item.date) }} · 相似度 {{ (item.accuracy * 100).toFixed(1) }}%
              </view>
            </view>
            <view class="identify-actions">
              <view class="accuracy-badge">{{ (item.accuracy * 100).toFixed(0) }}%</view>
              <view class="delete-btn" @click.stop="deleteIdentifyRecord(item.id)">
                <text>删除</text>
              </view>
            </view>
          </view>
        </view>
        <view class="empty-state" v-else>
          <text class="empty-icon">🔍</text>
          <text class="empty-text">暂无识别记录</text>
          <text class="empty-tip">拍摄药材图片开始识别</text>
        </view>
        <view class="scroll-tip" v-if="identifyRecords.length > 3">滑动查看更多</view>
      </view>

      <view class="section card">
        <view class="section-header">
          <view class="section-title">🏥 我的问诊记录</view>
          <view class="section-more" @click="goToChatHistory">查看全部</view>
        </view>
        <view class="record-list" v-if="chatRecords.length > 0">
          <view class="record-item" v-for="item in chatRecords" :key="item.sessionId" @click="goToChatDetail(item.sessionId)">
            <view class="record-img placeholder-img">
              <text>🏥</text>
            </view>
            <view class="record-info">
              <view class="record-name">{{ item.summary || '问诊记录' }}</view>
              <view class="record-date">{{ formatDate(item.createdAt) }} · {{ item.diagnosis || '未辨证' }}</view>
            </view>
          </view>
        </view>
        <view class="empty-state" v-else>
          <text class="empty-icon">🏥</text>
          <text class="empty-text">暂无问诊记录</text>
        </view>
      </view>

      <view class="section card">
        <view class="section-title">🧬 体质测评记录</view>
        <view class="record-list" :class="{ 'scroll-list': constitutionRecords.length > 3 }" v-if="constitutionRecords.length > 0">
          <view class="record-item constitution-record" v-for="item in constitutionRecords" :key="item.id" @click="viewConstitutionDetail(item)">
            <view class="record-img" :style="{ background: getConstitutionColor(item.mainType) }">🧬</view>
            <view class="record-info">
              <view class="record-name" :style="{ color: getConstitutionColor(item.mainType) }">{{ item.mainTypeName }}</view>
              <view class="record-effect">{{ item.mode === 'quick' ? '快速测评' : '标准测评' }} · 得分 {{ item.mainScore }}%</view>
              <view class="record-date">{{ formatDate(item.date) }}</view>
            </view>
            <view class="mixed-tags" v-if="item.mixedTypes && item.mixedTypes.length > 0">
              <view class="mixed-tag" v-for="t in item.mixedTypes.slice(0, 2)" :key="t.type">{{ t.name }}</view>
            </view>
            <view class="delete-btn" @click.stop="deleteConstitutionRecord(item.id)">
              <text>删除</text>
            </view>
          </view>
        </view>
        <view class="empty-state" v-else>
          <text class="empty-icon">🧬</text>
          <text class="empty-text">暂无测评记录</text>
          <text class="empty-tip">去首页进行体质测评</text>
        </view>
        <view class="scroll-tip" v-if="constitutionRecords.length > 3">滑动查看更多</view>
      </view>

      <view class="section card">
        <view class="section-title">🏆 成就</view>
        <view class="achievement-list">
          <view 
            class="achievement-item" 
            :class="{ unlocked: stats.totalCount >= 1 }"
            @click="showAchievement('初识本草', '完成第一次药材学习打卡')"
          >
            <view class="achievement-icon">🌱</view>
            <view class="achievement-info">
              <view class="achievement-name">初识本草</view>
              <view class="achievement-desc">完成第一次打卡</view>
            </view>
            <view class="achievement-status" v-if="stats.totalCount >= 1">✓</view>
          </view>
          <view 
            class="achievement-item" 
            :class="{ unlocked: stats.consecutiveDays >= 7 }"
            @click="showAchievement('七日坚持', '连续打卡7天')"
          >
            <view class="achievement-icon">🔥</view>
            <view class="achievement-info">
              <view class="achievement-name">七日坚持</view>
              <view class="achievement-desc">连续打卡7天</view>
            </view>
            <view class="achievement-status" v-if="stats.consecutiveDays >= 7">✓</view>
          </view>
          <view 
            class="achievement-item" 
            :class="{ unlocked: stats.totalCount >= 30 }"
            @click="showAchievement('月满花开', '累计打卡30天')"
          >
            <view class="achievement-icon">🌕</view>
            <view class="achievement-info">
              <view class="achievement-name">月满花开</view>
              <view class="achievement-desc">累计打卡30天</view>
            </view>
            <view class="achievement-status" v-if="stats.totalCount >= 30">✓</view>
          </view>
          <view 
            class="achievement-item" 
            :class="{ unlocked: stats.totalCount >= 100 }"
            @click="showAchievement('百炼成药', '累计打卡100天')"
          >
            <view class="achievement-icon">💎</view>
            <view class="achievement-info">
              <view class="achievement-name">百炼成药</view>
              <view class="achievement-desc">累计打卡100天</view>
            </view>
            <view class="achievement-status" v-if="stats.totalCount >= 100">✓</view>
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
            <view class="menu-text">问诊记录</view>
            <view class="menu-arrow">→</view>
          </view>
          <view class="menu-item" @click="goToHerbList">
            <view class="menu-icon">📚</view>
            <view class="menu-text">药材图鉴</view>
            <view class="menu-arrow">→</view>
          </view>
          <view class="menu-item" v-if="userInfo && userInfo.role === 'admin'" @click="goToReview">
            <view class="menu-icon">🔧</view>
            <view class="menu-text">识别纠错审核</view>
            <view class="review-badge" v-if="reviewPendingCount > 0">{{ reviewPendingCount }}</view>
            <view class="menu-arrow">→</view>
          </view>
          <view class="menu-item logout-item" v-if="userInfo" @click="handleLogout">
            <view class="menu-icon">🚪</view>
            <view class="menu-text">退出登录</view>
            <view class="menu-arrow">→</view>
          </view>
        </view>
      </view>
    </view>

    <view class="achievement-modal" v-if="showAchievementModal" @click="closeAchievementModal">
      <view class="achievement-modal-content" @click.stop>
        <view class="achievement-modal-icon">{{ achievementDetail.icon }}</view>
        <view class="achievement-modal-name">{{ achievementDetail.name }}</view>
        <view class="achievement-modal-desc">{{ achievementDetail.desc }}</view>
        <view class="achievement-modal-btn" @click="closeAchievementModal">知道了</view>
      </view>
    </view>
    <custom-tabbar current="mine"></custom-tabbar>
  </view>
</template>

<script>
import { checkinApi, identifyApi, constitutionApi, favoriteApi, chatApi, authApi, reviewApi, getImageUrl } from '@/api/index.js'
import utils from '@/utils/index.js'
import customTabbar from '@/components/custom-tabbar/custom-tabbar.vue'

export default {
  components: { customTabbar },
  data() {
    return {
      userInfo: null,
      favHerbs: [],
      favMatches: [],
      chatRecords: [],
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
      checkinRecords: [],
      identifyRecords: [],
      constitutionRecords: [],
      showDayDetail: false,
      selectedDate: '',
      dayRecords: [],
      reviewPendingCount: 0,
      showAchievementModal: false,
      achievementDetail: {
        name: '',
        desc: '',
        icon: ''
      }
    }
  },
  onLoad() {
    this.userInfo = utils.storage.get('userInfo')
    this.loadStats()
    this.loadCalendar()
    this.loadRecords()
    this.loadFavorites()
    this.loadChatRecords()
  },
  onShow() {
    uni.hideTabBar()
    this.userInfo = utils.storage.get('userInfo')
    this.loadStats()
    this.loadCalendar()
    this.loadRecords()
    this.loadFavorites()
    this.loadChatRecords()
    this.loadReviewPending()
  },
  methods: {
    getImg(url) {
      return getImageUrl(url)
    },
    async loadReviewPending() {
      if (!this.userInfo || this.userInfo.role !== 'admin') return
      try {
        const res = await reviewApi.getStats()
        this.reviewPendingCount = res.pendingCount || res.pending || 0
      } catch (e) {
        console.error('加载审核统计失败', e)
      }
    },
    async loadStats() {
      try {
        const result = await checkinApi.getStats()
        this.stats = result
        this.monthStats = result.monthStats
      } catch (e) {
        console.error('加载统计失败', e)
      }
    },
    async loadCalendar() {
      try {
        const result = await checkinApi.getCalendar(this.currentYear, this.currentMonth)
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
    async loadRecords() {
      try {
        const result = await checkinApi.getRecords()
        this.checkinRecords = (result.list || []).reverse()
        
        const idResult = await identifyApi.getRecords(1, 20)
        this.identifyRecords = (idResult.list || [])
        
        const constitutionResult = await constitutionApi.getRecords()
        this.constitutionRecords = (constitutionResult.list || [])
      } catch (e) {
        console.error('加载记录失败', e)
      }
    },
    async loadFavorites() {
      try {
        const [herbs, matches] = await Promise.all([
          favoriteApi.getHerbs(),
          favoriteApi.getMatches()
        ])
        this.favHerbs = herbs || []
        this.favMatches = matches || []
      } catch (e) {
        console.error('加载收藏失败', e)
      }
    },
    async loadChatRecords() {
      try {
        const result = await chatApi.getHistory(1)
        const list = Array.isArray(result) ? result : (result.list || [])
        this.chatRecords = list.slice(0, 3)
      } catch (e) {
        console.error('加载问诊记录失败', e)
      }
    },
    getConstitutionColor(type) {
      const colors = {
        pinghe: '#10b981',
        qixu: '#f59e0b',
        yangxu: '#3b82f6',
        yinxu: '#ef4444',
        tanshi: '#84cc16',
        shire: '#a855f7',
        xueyu: '#7c3aed',
        qiyu: '#06b6d4',
        tebing: '#ec4899'
      }
      return colors[type] || '#666'
    },
    formatDate(dateStr) {
      const d = new Date(dateStr)
      return `${d.getMonth() + 1}月${d.getDate()}日`
    },
    handleDayClick(day) {
      if (!day.date || !day.herbId) return
      uni.navigateTo({
        url: `/pages/detail/detail?id=${day.herbId}`
      })
    },
    closeDayDetail() {
      this.showDayDetail = false
    },
    showAchievement(name, desc) {
      const icons = {
        '初识本草': '🌱',
        '七日坚持': '🔥',
        '月满花开': '🌕',
        '百炼成药': '💎'
      }
      this.achievementDetail = {
        name,
        desc,
        icon: icons[name] || '🏆'
      }
      this.showAchievementModal = true
    },
    closeAchievementModal() {
      this.showAchievementModal = false
    },
    goToHerbDetail(id) {
      if (id) {
        uni.navigateTo({
          url: `/pages/detail/detail?id=${id}`
        })
      }
    },
    async deleteIdentifyRecord(id) {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这条识别记录吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              await identifyApi.deleteRecord(id)
              uni.showToast({ title: '已删除', icon: 'success' })
              this.loadRecords()
            } catch (e) {
              uni.showToast({ title: '删除失败', icon: 'none' })
            }
          }
        }
      })
    },
    viewConstitutionDetail(item) {
      uni.navigateTo({
        url: `/pages/constitution/constitution-result?data=${encodeURIComponent(JSON.stringify(item))}`
      })
    },
    async deleteConstitutionRecord(id) {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这条测评记录吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              await constitutionApi.deleteRecord(id)
              uni.showToast({ title: '已删除', icon: 'success' })
              this.loadRecords()
            } catch (e) {
              uni.showToast({ title: '删除失败', icon: 'none' })
            }
          }
        }
      })
    },
    handleProfileClick() {
      if (!this.userInfo) {
        this.goToLogin()
      }
    },
    goToFavHerbs() {
      uni.switchTab({
        url: '/pages/herb-list/herb-list'
      })
    },
    goToFavMatches() {
      uni.switchTab({
        url: '/pages/match/match'
      })
    },
    goToLlmConfig() {
      uni.navigateTo({
        url: '/pages/llm-config/llm-config'
      })
    },
    goToChatHistory() {
      uni.navigateTo({
        url: '/pages/chat-history/chat-history'
      })
    },
    goToChatDetail(sessionId) {
      uni.navigateTo({
        url: `/pages/chat-detail/chat-detail?sessionId=${sessionId}`
      })
    },
    goToReview() {
      uni.navigateTo({
        url: '/pages/review/review'
      })
    },
    goToLogin() {
      uni.navigateTo({
        url: '/pages/login/login'
      })
    },
    goToHerbList() {
      uni.switchTab({
        url: '/pages/herb-list/herb-list'
      })
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
            utils.storage.remove('token')
            utils.storage.remove('userInfo')
            uni.showToast({
              title: '已退出登录',
              icon: 'success'
            })
            setTimeout(() => {
              uni.reLaunch({
                url: '/pages/index/index'
              })
            }, 1500)
          }
        }
      })
    }
  }
}
</script>

<style lang="scss">
.page {
  min-height: 100vh;
  background: #f0f9f4;
  padding-bottom: 70px;
}

.profile-header {
  position: relative;
  padding-bottom: 40rpx;
}

.profile-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 300rpx;
  background: linear-gradient(135deg, #2d8b5e 0%, #3da878 100%);
}

.profile-info {
  position: relative;
  padding: 80rpx $spacing-lg $spacing-lg;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar {
  width: 140rpx;
  height: 140rpx;
  background: $bg-card;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 60rpx;
  margin-bottom: $spacing-md;
  box-shadow: $shadow-md;
}

.user-name {
  font-size: $font-size-xl;
  font-weight: $font-weight-bold;
  color: #FFFFFF;
  margin-bottom: $spacing-xs;
}

.user-title {
  font-size: $font-size-sm;
  color: rgba(255, 255, 255, 0.8);
}

.profile-stats {
  position: relative;
  display: flex;
  justify-content: space-around;
  background: $bg-card;
  margin: 0 $spacing-lg;
  border-radius: $radius-xl;
  padding: $spacing-lg;
  box-shadow: $shadow-md;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 44rpx;
  font-weight: $font-weight-bold;
  color: #2d8b5e;
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

.container {
  padding: $spacing-lg;
  margin-top: $spacing-lg;
}

.card {
  background: $bg-card;
  border-radius: $radius-lg;
  padding: $spacing-lg;
  margin-bottom: $spacing-lg;
  box-shadow: $shadow-card;
}

.section-title {
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  margin-bottom: $spacing-lg;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-lg;

  .section-title {
    margin-bottom: 0;
  }
}

.section-more {
  font-size: $font-size-sm;
  color: #2d8b5e;
}

.stats-row {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: $spacing-md 0;
}

.stats-col {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stats-num {
  font-size: 44rpx;
  font-weight: $font-weight-bold;
  color: #2d8b5e;
}

.stats-label {
  font-size: $font-size-xs;
  color: $text-muted;
  margin-top: $spacing-xs;
}

.stats-divider {
  width: 1rpx;
  height: 60rpx;
  background: $border-light;
}

.calendar-nav {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: $spacing-md;
  margin-bottom: $spacing-md;
}

.nav-btn {
  width: 60rpx;
  height: 60rpx;
  background: $bg-secondary;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $font-size-xl;
  color: $text-secondary;
  cursor: pointer;
  transition: background-color $transition-normal;
  
  &:active {
    background: rgba(#2d8b5e, 0.1);
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
  padding: 4rpx 2rpx;

  &.other-month {
    color: $text-disabled;
  }

  &.today {
    background: rgba(#2d8b5e, 0.1);
    border-radius: 8rpx;
    color: #2d8b5e;
    font-weight: $font-weight-semibold;
  }

  &.checked {
    &::before {
      content: '';
      position: absolute;
      width: 60rpx;
      height: 60rpx;
      background: rgba(#2d8b5e, 0.1);
      border-radius: 50%;
      z-index: -1;
    }
  }
}

.cal-day-num {
  font-size: 24rpx;
  line-height: 1;
}

.cal-herb-name {
  font-size: 16rpx;
  color: #2d8b5e;
  margin-top: 4rpx;
  line-height: 1.2;
  max-width: 90%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.checkin-dot {
  width: 8rpx;
  height: 8rpx;
  background: #2d8b5e;
  border-radius: 50%;
  position: absolute;
  bottom: 8rpx;
}

.review-badge {
  background: #dc2626;
  color: #fff;
  font-size: 22rpx;
  padding: 2rpx 12rpx;
  border-radius: 20rpx;
  margin-left: auto;
  margin-right: 8rpx;
  min-width: 32rpx;
  text-align: center;
}

.record-list {
  padding-top: $spacing-xs;
}

.record-item {
  display: flex;
  align-items: center;
  padding: $spacing-lg 0;
  border-bottom: 1rpx solid $border-light;
  
  &:last-child {
    border-bottom: none;
  }
}

.record-img {
  width: 100rpx;
  height: 100rpx;
  border-radius: $radius-md;
  margin-right: $spacing-lg;
  flex-shrink: 0;
}

.record-info {
  flex: 1;
  min-width: 0;
}

.record-name {
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  margin-bottom: $spacing-xs;
}

.record-effect {
  font-size: $font-size-sm;
  color: #2d8b5e;
  margin-bottom: $spacing-xs;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.record-date {
  font-size: $font-size-xs;
  color: $text-muted;
}

.record-badge {
  width: 48rpx;
  height: 48rpx;
  background: rgba(#2d8b5e, 0.1);
  color: #2d8b5e;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
}

.identify-record {
  cursor: pointer;
  transition: background-color $transition-normal;
  
  &:active {
    background: $bg-hover;
  }
}

.accuracy-badge {
  font-size: $font-size-sm;
  color: $warning-color;
  background: rgba($warning-color, 0.1);
  padding: 8rpx 20rpx;
  border-radius: $radius-full;
  font-weight: $font-weight-semibold;
}

.placeholder-img {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(#2d8b5e, 0.08);
  font-size: 48rpx;
}

.empty-tip {
  font-size: $font-size-xs;
  color: $text-muted;
  margin-top: $spacing-xs;
}

.scroll-list {
  max-height: 600rpx;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.scroll-tip {
  text-align: center;
  font-size: $font-size-xs;
  color: $text-muted;
  padding: $spacing-md 0 0;
  border-top: 1rpx solid $border-light;
  margin-top: $spacing-md;
}

.constitution-record {
  cursor: pointer;
  position: relative;
  transition: background-color $transition-normal;
  
  &:active {
    background: $bg-hover;
  }
}

.mixed-tags {
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
  margin-right: $spacing-sm;
}

.mixed-tag {
  font-size: $font-size-xs;
  color: $text-secondary;
  background: $bg-secondary;
  padding: 4rpx 10rpx;
  border-radius: $radius-sm;
  white-space: nowrap;
}

.identify-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-xs;
  margin-left: $spacing-xs;
}

.delete-btn {
  font-size: $font-size-xs;
  color: $error-color;
  background: rgba($error-color, 0.08);
  padding: 6rpx 16rpx;
  border-radius: $radius-md;
  border: 1rpx solid rgba($error-color, 0.2);
  flex-shrink: 0;
  align-self: center;
  cursor: pointer;
  transition: all $transition-normal;
  
  &:active {
    background: rgba($error-color, 0.15);
    transform: scale(0.95);
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: $spacing-md;
}

.empty-text {
  font-size: $font-size-base;
  color: $text-muted;
}

.achievement-list {
  padding-top: $spacing-xs;
}

.achievement-item {
  display: flex;
  align-items: center;
  padding: $spacing-lg 0;
  border-bottom: 1rpx solid $border-light;
  opacity: 0.5;
  cursor: pointer;
  transition: opacity $transition-normal, background-color $transition-normal;
  
  &:last-child {
    border-bottom: none;
  }
  
  &.unlocked {
    opacity: 1;
  }
  
  &:active {
    background: $bg-hover;
  }
}

.achievement-icon {
  font-size: 48rpx;
  margin-right: $spacing-md;
}

.achievement-info {
  flex: 1;
}

.achievement-name {
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  margin-bottom: $spacing-xs;
}

.achievement-desc {
  font-size: $font-size-sm;
  color: $text-muted;
}

.achievement-status {
  width: 48rpx;
  height: 48rpx;
  background: #2d8b5e;
  color: #FFFFFF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $font-size-sm;
}

.menu-list {
  padding-top: $spacing-xs;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: $spacing-lg 0;
  border-bottom: 1rpx solid $border-light;
  cursor: pointer;
  transition: background-color $transition-normal;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:active {
    background: $bg-hover;
  }
}

.menu-icon {
  font-size: 40rpx;
  margin-right: $spacing-md;
}

.menu-text {
  flex: 1;
  font-size: $font-size-base;
  color: $text-primary;
}

.menu-arrow {
  font-size: $font-size-lg;
  color: $text-disabled;
}

.logout-item {
  .menu-text {
    color: $error-color;
  }
}

.day-detail-modal, .achievement-modal {
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

.day-detail-content, .achievement-modal-content {
  width: 85%;
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
  transition: background-color $transition-normal;
  
  &:active {
    background: rgba(#2d8b5e, 0.1);
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

.day-detail-empty {
  padding: 60rpx;
  text-align: center;
  color: $text-muted;
  font-size: $font-size-base;
}

.achievement-modal-content {
  padding: $spacing-xl $spacing-lg;
  text-align: center;
}

.achievement-modal-icon {
  font-size: 120rpx;
  margin-bottom: $spacing-lg;
}

.achievement-modal-name {
  font-size: $font-size-xl;
  font-weight: $font-weight-bold;
  color: $text-primary;
  margin-bottom: $spacing-sm;
}

.achievement-modal-desc {
  font-size: $font-size-base;
  color: $text-secondary;
  margin-bottom: $spacing-xl;
}

.achievement-modal-btn {
  padding: $spacing-md $spacing-xl;
  background: linear-gradient(135deg, #2d8b5e, lighten(#2d8b5e, 8%));
  color: #FFFFFF;
  border-radius: $radius-full;
  font-size: $font-size-base;
  display: inline-block;
  cursor: pointer;
  transition: opacity $transition-normal, transform $transition-normal;
  
  &:active {
    opacity: 0.8;
    transform: scale(0.98);
  }
}
</style>
