<template>
  <view class="page">
    <view class="banner">
      <view class="banner-title">草木有方</view>
      <view class="banner-subtitle">AI经方中医问诊与中药学习平台</view>
    </view>

    <!-- LLM 状态栏 -->
    <view class="llm-status-bar" :class="{ disabled: !llmEnabled }" @click="goToLlmConfig">
      <view class="llm-status-dot" :class="{ disabled: !llmEnabled }"></view>
      <view class="llm-status-text" :class="{ disabled: !llmEnabled }">{{ llmStatusText }}</view>
      <view class="llm-status-arrow" :class="{ disabled: !llmEnabled }">→</view>
    </view>

    <view class="container">
      <!-- 快速识别 -->
      <view class="card">
        <view class="section-title">快速识别</view>
        <view class="action-btns">
          <view class="action-btn" @click="takePhoto">
            <view class="action-icon cam">📷</view>
            <text class="action-text">拍照识别</text>
          </view>
          <view class="action-btn" @click="chooseImage">
            <view class="action-icon alb">🖼️</view>
            <text class="action-text">相册选择</text>
          </view>
          <view class="action-btn" @click="goToQuiz">
            <view class="action-icon qz">📝</view>
            <text class="action-text">趣味问答</text>
          </view>
        </view>
      </view>

      <!-- 今日一题 -->
      <view class="card daily-quiz-card" @click="goToQuizDetail">
        <view class="quiz-header">
          <view class="section-title">今日一题</view>
          <view class="quiz-tag">{{ dailyQuestion.difficulty || '加载中' }}</view>
        </view>
        <view class="quiz-question" v-if="dailyQuestion">{{ dailyQuestion.question }}</view>
        <view class="quiz-question" v-else>加载题目中...</view>
        <view class="quiz-footer">
          <text class="quiz-category">{{ dailyQuestion.category || '' }}</text>
          <text class="quiz-go">去答题 →</text>
        </view>
      </view>

      <!-- 今日药材 -->
      <view class="card daily-herb-card" @click="goToHerbDetail">
        <view class="daily-herb-header">
          <view class="section-title">🌿 今日药材</view>
          <view class="daily-herb-status" :class="{ checked: dailyHerbChecked }">
            {{ dailyHerbChecked ? '✓ 已学习' : '去学习' }}
          </view>
        </view>
        <view class="daily-herb-content" v-if="dailyHerb">
          <image class="daily-herb-img" :src="getImg(dailyHerb.image)" mode="aspectFill" @error="onImgError($event)"></image>
          <view class="daily-herb-info">
            <view class="daily-herb-name">{{ dailyHerb.name }}</view>
            <view class="daily-herb-effect">{{ dailyHerb.effect }}</view>
          </view>
        </view>
        <view class="daily-herb-loading" v-else>
          <view class="loading-spinner"></view>
          <text>加载中...</text>
        </view>
        <view class="daily-herb-footer">
          <text class="daily-herb-tip">每日学习一种药材，打卡赢积分</text>
          <view class="checkin-btn" v-if="!dailyHerbChecked" @click.stop="handleDailyCheckin">
            <text>立即打卡</text>
          </view>
        </view>
      </view>

      <!-- 经方问诊入口 -->
      <view class="card consult-card" @click="goToConsult">
        <view class="consult-header">
          <view class="section-title consult-title">🏥 经方问诊</view>
          <view class="consult-badge">倪海厦视角</view>
        </view>
        <view class="consult-body">
          <view class="consult-icon">📖</view>
          <view class="consult-info">
            <view class="consult-name">倪师经方辨证论治</view>
            <view class="consult-desc">伤寒论 · 金匮要略 · 黄帝内经</view>
          </view>
          <view class="consult-arrow">→</view>
        </view>
        <view class="consult-note">基于倪海厦人纪系列教学内容，提供六经辨证、经方建议、养生指导</view>
      </view>

      <!-- 体质测评入口 -->
      <view class="card constitution-card" @click="goToConstitution">
        <view class="constitution-header">
          <view class="section-title constitution-title">🧬 体质测评</view>
          <view class="constitution-badge">了解你的身体</view>
        </view>
        <view class="constitution-body">
          <view class="constitution-icon">🩺</view>
          <view class="constitution-info">
            <view class="constitution-name">中医体质辨识</view>
            <view class="constitution-desc">依据国家标准 GB/T 46939-2025</view>
          </view>
          <view class="constitution-arrow">→</view>
        </view>
        <view class="constitution-btns">
          <view class="constitution-btn" @click.stop="goToConstitutionMode('standard')">标准测评 (60题)</view>
          <view class="constitution-btn" @click.stop="goToConstitutionMode('quick')">快速测评(18题)</view>
        </view>
      </view>

      <!-- 药材图鉴 -->
      <view class="card">
        <view class="section-title">药材图鉴</view>
        <view class="herb-list">
          <view class="herb-item" v-for="item in showcaseHerbs" :key="item.id" @click="goToDetail(item.id)">
            <image class="herb-img" :src="getImg(item.image)" mode="aspectFill" @error="onImgError($event)"></image>
            <view class="herb-info">
              <view class="herb-name">{{ item.name }}</view>
              <view class="herb-category">{{ item.category }}</view>
            </view>
          </view>
        </view>
      </view>
    </view>
    <custom-tabbar current="home"></custom-tabbar>
  </view>
</template>

<script>
import { quizApi, herbApi, checkinApi, llmConfigApi, getImageUrl } from '@/api/index.js'
import customTabbar from '@/components/custom-tabbar/custom-tabbar.vue'

export default {
  components: { customTabbar },
  data() {
    return {
      dailyQuestion: null,
      showcaseHerbs: [],
      dailyHerb: null,
      dailyHerbChecked: false,
      llmEnabled: false,
      llmStatusText: '加载中...'
    }
  },
  onLoad() {
    this.loadDailyQuestion()
    this.loadShowcaseHerbs()
    this.loadDailyHerb()
    this.loadLlmStatus()
  },
  onShow() {
    uni.hideTabBar()
    this.loadLlmStatus()
  },
  onPullDownRefresh() {
    this.loadDailyQuestion()
    this.loadShowcaseHerbs()
    this.loadDailyHerb()
    this.loadLlmStatus()
    setTimeout(() => {
      uni.stopPullDownRefresh()
    }, 500)
  },
  methods: {
    getImg(url) {
      return getImageUrl(url)
    },
    onImgError(e) {
      console.warn('Image load failed')
    },
    async loadDailyQuestion() {
      try {
        this.dailyQuestion = await quizApi.getDailyQuestion()
      } catch (e) {
        console.error('获取今日题目失败', e)
      }
    },
    async loadShowcaseHerbs() {
      try {
        const res = await herbApi.getList({ page: 1, pageSize: 6 })
        this.showcaseHerbs = res.list
      } catch (e) {
        console.error('获取药材列表失败', e)
      }
    },
    async loadDailyHerb() {
      try {
        const result = await checkinApi.getDailyHerb()
        this.dailyHerb = result.herb
        const stats = await checkinApi.getStats()
        this.dailyHerbChecked = stats.todayChecked
      } catch (e) {
        console.error('获取今日药材失败', e)
      }
    },
    async loadLlmStatus() {
      try {
        const res = await llmConfigApi.getStatus()
        this.llmEnabled = res.enabled
        if (res.enabled) {
          this.llmStatusText = `AI增强模式 - ${res.provider || ''} ${res.model || ''}`
        } else {
          this.llmStatusText = '本地知识库模式 - 配置API Key解锁AI增强'
        }
      } catch (e) {
        this.llmEnabled = false
        this.llmStatusText = '本地知识库模式 - 配置API Key解锁AI增强'
      }
    },
    async handleDailyCheckin() {
      if (!this.dailyHerb) return
      try {
        await checkinApi.checkin(this.dailyHerb.id)
        this.dailyHerbChecked = true
        uni.showToast({ title: '打卡成功', icon: 'success' })
      } catch (e) {
        console.error('打卡失败', e)
      }
    },
    takePhoto() {
      uni.chooseImage({
        count: 1,
        sourceType: ['camera'],
        success: (res) => {
          this.identifyHerb(res.tempFilePaths[0])
        }
      })
    },
    chooseImage() {
      uni.chooseImage({
        count: 1,
        sourceType: ['album'],
        success: (res) => {
          this.identifyHerb(res.tempFilePaths[0])
        }
      })
    },
    identifyHerb(filePath) {
      uni.navigateTo({
        url: `/pages/identify/identify?image=${encodeURIComponent(filePath)}`
      })
    },
    goToQuiz() {
      uni.navigateTo({ url: '/pages/quiz/quiz' })
    },
    goToQuizDetail() {
      uni.navigateTo({ url: '/pages/quiz/quiz?mode=daily' })
    },
    goToDetail(id) {
      uni.navigateTo({ url: `/pages/detail/detail?id=${id}` })
    },
    goToConsult() {
      uni.navigateTo({ url: '/pages/consult/consult' })
    },
    goToLlmConfig() {
      uni.navigateTo({ url: '/pages/llm-config/llm-config' })
    },
    goToConstitution() {
      uni.showActionSheet({
        itemList: ['标准测评 (60题)', '快速测评 (18题)'],
        success: (res) => {
          const mode = res.tapIndex === 0 ? 'standard' : 'quick'
          uni.navigateTo({ url: `/pages/constitution/constitution?mode=${mode}` })
        }
      })
    },
    goToConstitutionMode(mode) {
      uni.navigateTo({ url: `/pages/constitution/constitution?mode=${mode}` })
    },
    goToHerbDetail() {
      if (this.dailyHerb) {
        uni.navigateTo({ url: `/pages/detail/detail?id=${this.dailyHerb.id}` })
      }
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

.banner {
  background: linear-gradient(135deg, #2d8b5e 0%, #3da878 100%);
  padding: 60rpx 32rpx 60rpx;
}

.banner-title {
  font-size: 48rpx;
  font-weight: bold;
  color: #FFFFFF;
  margin-bottom: 12rpx;
}

.banner-subtitle {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.9);
}

/* LLM 状态栏 */
.llm-status-bar {
  display: flex;
  align-items: center;
  padding: 20rpx 32rpx;
  background: rgba(45, 139, 94, 0.08);
  border-bottom: 1rpx solid rgba(45, 139, 94, 0.15);

  &.disabled {
    background: rgba(245, 158, 11, 0.08);
    border-bottom-color: rgba(245, 158, 11, 0.15);
  }
}

.llm-status-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: #2d8b5e;
  margin-right: 16rpx;
  flex-shrink: 0;

  &.disabled {
    background: #F59E0B;
  }
}

.llm-status-text {
  flex: 1;
  font-size: 24rpx;
  color: #2d8b5e;

  &.disabled {
    color: #F59E0B;
  }
}

.llm-status-arrow {
  font-size: 28rpx;
  color: #2d8b5e;

  &.disabled {
    color: #F59E0B;
  }
}

.container {
  padding: 24rpx;
}

.card {
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 24rpx;
  display: flex;
  align-items: center;
}

.section-title::before {
  content: '';
  width: 8rpx;
  height: 32rpx;
  background: #2d8b5e;
  border-radius: 4rpx;
  margin-right: 16rpx;
}

/* 快速识别 */
.action-btns {
  display: flex;
  justify-content: space-around;
  padding: 16rpx 0;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;

  &:active {
    transform: scale(0.95);
  }
}

.action-icon {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 44rpx;
  margin-bottom: 12rpx;

  &.cam { background: rgba(45, 139, 94, 0.1); }
  &.alb { background: rgba(45, 139, 94, 0.1); }
  &.qz { background: rgba(245, 158, 11, 0.1); }
}

.action-text {
  font-size: 24rpx;
  color: #333;
}

/* 今日一题 */
.daily-quiz-card {
  &:active { box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08); }
}

.quiz-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.quiz-tag {
  font-size: 22rpx;
  color: #F59E0B;
  background: rgba(245, 158, 11, 0.1);
  padding: 4rpx 20rpx;
  border-radius: 20rpx;
}

.quiz-question {
  font-size: 30rpx;
  color: #333;
  line-height: 1.6;
  margin-bottom: 24rpx;
  font-weight: 500;
}

.quiz-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16rpx;
  border-top: 1rpx solid #f0f0f0;
}

.quiz-category {
  font-size: 24rpx;
  color: #999;
}

.quiz-go {
  font-size: 24rpx;
  color: #2d8b5e;
  font-weight: 500;
}

/* 今日药材 */
.daily-herb-card {
  background: linear-gradient(135deg, #f0f9f4 0%, rgba(45, 139, 94, 0.08) 100%);
  border: 1rpx solid rgba(45, 139, 94, 0.2);
}

.daily-herb-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.daily-herb-status {
  font-size: 24rpx;
  color: #F59E0B;
  background: rgba(245, 158, 11, 0.1);
  padding: 6rpx 20rpx;
  border-radius: 20rpx;

  &.checked {
    color: #2d8b5e;
    background: rgba(45, 139, 94, 0.15);
  }
}

.daily-herb-content {
  display: flex;
  align-items: center;
}

.daily-herb-img {
  width: 160rpx;
  height: 160rpx;
  border-radius: 16rpx;
  margin-right: 24rpx;
  flex-shrink: 0;
}

.daily-herb-info {
  flex: 1;
  min-width: 0;
}

.daily-herb-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 12rpx;
}

.daily-herb-effect {
  font-size: 26rpx;
  color: #2d8b5e;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.daily-herb-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx;
  color: #999;
}

.loading-spinner {
  width: 40rpx;
  height: 40rpx;
  border: 3rpx solid rgba(45, 139, 94, 0.2);
  border-top-color: #2d8b5e;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16rpx;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.daily-herb-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 24rpx;
  margin-top: 24rpx;
  border-top: 1rpx dashed rgba(45, 139, 94, 0.2);
}

.daily-herb-tip {
  font-size: 22rpx;
  color: #999;
}

.checkin-btn {
  padding: 12rpx 32rpx;
  background: linear-gradient(135deg, #2d8b5e, #3da878);
  color: #FFFFFF;
  border-radius: 30rpx;
  font-size: 24rpx;
  font-weight: 500;

  &:active {
    opacity: 0.8;
    transform: scale(0.98);
  }
}

/* 经方问诊入口 */
.consult-card {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(168, 85, 247, 0.15) 100%);
  border: 1rpx solid rgba(168, 85, 247, 0.2);
}

.consult-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.consult-title {
  margin-bottom: 0;
}

.consult-badge {
  font-size: 22rpx;
  color: #a855f7;
  background: rgba(168, 85, 247, 0.1);
  padding: 4rpx 20rpx;
  border-radius: 20rpx;
}

.consult-body {
  display: flex;
  align-items: center;
}

.consult-icon {
  width: 120rpx;
  height: 120rpx;
  background: rgba(168, 85, 247, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 56rpx;
  margin-right: 24rpx;
}

.consult-info {
  flex: 1;
}

.consult-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.consult-desc {
  font-size: 24rpx;
  color: #a855f7;
  margin-top: 8rpx;
}

.consult-arrow {
  font-size: 40rpx;
  color: #a855f7;
}

.consult-note {
  font-size: 24rpx;
  color: #666;
  margin-top: 24rpx;
  line-height: 1.6;
}

/* 体质测评入口 */
.constitution-card {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(245, 158, 11, 0.15) 100%);
  border: 1rpx solid rgba(245, 158, 11, 0.2);
}

.constitution-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.constitution-title {
  margin-bottom: 0;
}

.constitution-badge {
  font-size: 22rpx;
  color: #F59E0B;
  background: rgba(245, 158, 11, 0.1);
  padding: 4rpx 20rpx;
  border-radius: 20rpx;
}

.constitution-body {
  display: flex;
  align-items: center;
}

.constitution-icon {
  width: 120rpx;
  height: 120rpx;
  background: rgba(245, 158, 11, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 56rpx;
  margin-right: 24rpx;
}

.constitution-info {
  flex: 1;
}

.constitution-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.constitution-desc {
  font-size: 24rpx;
  color: #F59E0B;
  margin-top: 8rpx;
}

.constitution-arrow {
  font-size: 40rpx;
  color: #F59E0B;
}

.constitution-btns {
  display: flex;
  gap: 16rpx;
  margin-top: 24rpx;
}

.constitution-btn {
  flex: 1;
  padding: 16rpx;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12rpx;
  font-size: 24rpx;
  color: #F59E0B;
  text-align: center;

  &:active {
    opacity: 0.7;
  }
}

/* 药材图鉴 */
.herb-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.herb-item {
  width: 31%;
  margin-bottom: 24rpx;
  border-radius: 12rpx;
  overflow: hidden;
  background: #f9f9f9;

  &:active {
    transform: scale(0.98);
  }
}

.herb-img {
  width: 100%;
  height: 160rpx;
}

.herb-info {
  padding: 12rpx 8rpx;
  text-align: center;
}

.herb-name {
  font-size: 24rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 4rpx;
}

.herb-category {
  font-size: 20rpx;
  color: #999;
}
</style>
