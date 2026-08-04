<template>
  <view class="page">
    <view class="banner">
      <view class="banner-content">
        <view class="banner-title">草木有方</view>
        <view class="banner-subtitle">AI经方中医问诊与中药学习平台</view>
      </view>
      <view class="banner-decoration"></view>
    </view>

    <view class="llm-status-bar" :class="llmEnabled ? 'enabled' : 'disabled'" @click="goToLlmConfig">
      <view class="llm-status-dot" :class="llmEnabled ? 'enabled' : 'disabled'"></view>
      <view class="llm-status-text" :class="llmEnabled ? 'enabled' : 'disabled'">{{ llmStatusText }}</view>
      <view class="llm-status-arrow" :class="llmEnabled ? 'enabled' : 'disabled'">→</view>
    </view>

    <view class="container">
      <view class="quick-actions card">
        <view class="section-title">快速识别</view>
        <view class="action-btns">
          <view class="action-btn" @click="takePhoto">
            <view class="action-icon camera-icon">
              <text class="iconfont">📷</text>
            </view>
            <text class="action-text">拍照识别</text>
          </view>
          <view class="action-btn" @click="chooseImage">
            <view class="action-icon album-icon">
              <text class="iconfont">🖼️</text>
            </view>
            <text class="action-text">相册选择</text>
          </view>
          <view class="action-btn" @click="goToQuiz">
            <view class="action-icon quiz-icon">
              <text class="iconfont">📝</text>
            </view>
            <text class="action-text">趣味问答</text>
          </view>
        </view>
      </view>

      <view class="daily-quiz card" @click="goToQuizDetail">
        <view class="quiz-header">
          <view class="section-title">今日一测</view>
          <view class="quiz-tag">{{ dailyQuestion.difficulty || '加载中' }}</view>
        </view>
        <view class="quiz-question" v-if="dailyQuestion">
          {{ dailyQuestion.question }}
        </view>
        <view class="quiz-question" v-else>
          加载中...
        </view>
        <view class="quiz-footer">
          <text class="quiz-category">{{ dailyQuestion.category || '' }}</text>
          <text class="quiz-go">去答题 →</text>
        </view>
      </view>

      <view class="daily-herb card" @click="goToDailyHerbDetail">
        <view class="daily-herb-header">
          <view class="section-title">🌿 今日药材</view>
          <view class="daily-herb-status" :class="{ 'checked': dailyHerbChecked }">
            {{ dailyHerbChecked ? '已打卡' : '去学习' }}
          </view>
        </view>
        <view class="daily-herb-content" v-if="dailyHerb">
          <image class="daily-herb-img" :src="dailyHerbImage" mode="aspectFill"></image>
          <view class="daily-herb-info">
            <view class="daily-herb-name">{{ dailyHerb.name || '今日药材' }}</view>
            <view class="daily-herb-effect">{{ dailyHerbEffect }}</view>
          </view>
        </view>
        <view class="daily-herb-content" v-else>
          <view class="daily-herb-loading">加载中...</view>
        </view>
        <view class="daily-herb-footer">
          <text class="daily-herb-tip">每日学习一种药材，打卡赢积分</text>
          <button class="checkin-btn" :class="{ 'checked': dailyHerbChecked }" :disabled="dailyHerbChecked" @click.stop="handleDailyCheckin">
            {{ dailyHerbChecked ? '已打卡 ✓' : '立即打卡' }}
          </button>
        </view>
      </view>

      <view class="consult-card card" @click="goToConsult">
        <view class="consult-header">
          <view class="section-title">🏥 经方问诊</view>
          <view class="consult-tag">倪海厦视角</view>
        </view>
        <view class="consult-content">
          <view class="consult-icon">📖</view>
          <view class="consult-info">
            <view class="consult-name">倪师经方辨证论治</view>
            <view class="consult-desc">伤寒论 · 金匮要略 · 黄帝内经</view>
          </view>
          <view class="consult-arrow">→</view>
        </view>
        <view class="consult-note">基于倪海厦人纪系列教学内容，提供六经辨证、经方建议、养生指导</view>
      </view>

      <view class="constitution-card card" @click="goToConstitution()">
        <view class="constitution-header">
          <view class="section-title">🧬 体质测评</view>
          <view class="constitution-tag">了解你的身体</view>
        </view>
        <view class="constitution-content">
          <view class="constitution-icon">🩺</view>
          <view class="constitution-info">
            <view class="constitution-name">中医体质辨识</view>
            <view class="constitution-desc">标准版60题 / 快速版18题</view>
          </view>
          <view class="constitution-arrow">→</view>
        </view>
        <view class="constitution-btns">
          <button class="constitution-btn" @click.stop="goToConstitution('standard')">标准测评 (60题)</button>
          <button class="constitution-btn" @click.stop="goToConstitution('quick')">快速测评 (18题)</button>
        </view>
      </view>

      <view class="herb-showcase card">
        <view class="section-title">药材图鉴</view>
        <view class="herb-list">
          <view class="herb-item" v-for="item in showcaseHerbs" :key="item.id" @click="goToDetail(item.id)">
            <image class="herb-img" :src="getHerbImageUrl(item)" mode="aspectFill"></image>
            <view class="herb-info">
              <view class="herb-name">{{ item.name }}</view>
              <view class="herb-category">{{ item.category }}</view>
            </view>
          </view>
        </view>
      </view>

      <view class="features card">
        <view class="section-title">核心功能</view>
        <view class="feature-list">
          <view class="feature-item">
            <view class="feature-icon">🔬</view>
            <view class="feature-text">
              <view class="feature-title">AI识别</view>
              <view class="feature-desc">拍照秒识药材品类</view>
            </view>
          </view>
          <view class="feature-item">
            <view class="feature-icon">📚</view>
            <view class="feature-text">
              <view class="feature-title">典籍溯源</view>
              <view class="feature-desc">本草纲目等古籍记载</view>
            </view>
          </view>
          <view class="feature-item">
            <view class="feature-icon">🍲</view>
            <view class="feature-text">
              <view class="feature-title">药食同源</view>
              <view class="feature-desc">养生搭配推荐</view>
            </view>
          </view>
          <view class="feature-item">
            <view class="feature-icon">🎯</view>
            <view class="feature-text">
              <view class="feature-title">趣味学习</view>
              <view class="feature-desc">问答互动涨知识</view>
            </view>
          </view>
        </view>
      </view>
    </view>
    <custom-tabbar current="home"></custom-tabbar>
  </view>
</template>

<script>
import { quizApi, herbApi, checkinApi, llmConfigApi, getImageUrl, resolveHerbImage, getHerbImageUrl } from '@/api/index.js'
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
  computed: {
    dailyHerbImage() {
      if (!this.dailyHerb) return ''
      return getImageUrl(resolveHerbImage(this.dailyHerb))
    },
    dailyHerbEffect() {
      if (!this.dailyHerb || !this.dailyHerb.effect) return ''
      return this.dailyHerb.effect.substring(0, 30)
    }
  },
  onShow() {
    uni.hideTabBar()
  },
  onLoad() {
    this.loadDailyQuestion()
    this.loadShowcaseHerbs()
    this.loadDailyHerb()
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
    getHerbImageUrl,
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
    takePhoto() {
      uni.chooseImage({
        count: 1,
        sourceType: ['camera'],
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0]
          this.identifyHerb(tempFilePath)
        }
      })
    },
    chooseImage() {
      uni.chooseImage({
        count: 1,
        sourceType: ['album'],
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0]
          this.identifyHerb(tempFilePath)
        }
      })
    },
    identifyHerb(filePath) {
      uni.setStorageSync('pendingIdentifyImage', filePath)
      uni.switchTab({
        url: '/pages/identify/identify'
      })
    },
    goToQuiz() {
      uni.switchTab({
        url: '/pages/quiz/quiz'
      })
    },
    goToQuizDetail() {
      uni.navigateTo({
        url: '/pages/quiz/quiz?mode=daily'
      })
    },
    goToDetail(id) {
      uni.navigateTo({
        url: `/pages/detail/detail?id=${id}`
      })
    },
    async loadDailyHerb() {
      try {
        const data = await checkinApi.getDailyHerb()
        if (!data) return
        this.dailyHerb = data.herb || data
        this.dailyHerbChecked = !!data.alreadyChecked
      } catch (e) {
        console.error('获取今日药材失败', e)
      }
    },
    async handleDailyCheckin() {
      if (this.dailyHerbChecked) return
      const herbId = this.dailyHerb ? (this.dailyHerb.id || this.dailyHerb.herbId) : null
      try {
        const data = await checkinApi.checkin(herbId)
        if (data && data.alreadyChecked) {
          uni.showToast({ title: '今日已打卡', icon: 'none' })
        } else {
          uni.showToast({ title: '打卡成功！', icon: 'success' })
        }
        this.dailyHerbChecked = true
      } catch (e) {
        console.error('打卡失败', e)
      }
    },
    goToDailyHerbDetail() {
      if (this.dailyHerb && this.dailyHerb.id) {
        this.goToDetail(this.dailyHerb.id)
      }
    },
    goToConsult() {
      uni.navigateTo({
        url: '/pages/consult/consult'
      })
    },
    goToConstitution(mode) {
      if (mode) {
        uni.navigateTo({
          url: `/pages/constitution/constitution?mode=${mode}`
        })
      } else {
        uni.navigateTo({
          url: '/pages/constitution/constitution'
        })
      }
    },
    goToLlmConfig() {
      uni.navigateTo({
        url: '/pages/llm-config/llm-config'
      })
    },
    async loadLlmStatus() {
      try {
        const data = await llmConfigApi.getStatus()
        if (!data) {
          this.llmEnabled = false
          this.llmStatusText = '本地知识库模式 - 配置API Key解锁AI增强'
          return
        }
        this.llmEnabled = !!data.enabled
        if (data.enabled) {
          this.llmStatusText = 'AI增强模式 已启用 - ' + (data.provider || '') + ' ' + (data.model || '')
        } else {
          this.llmStatusText = '本地知识库模式 - 配置API Key解锁AI增强'
        }
      } catch (e) {
        this.llmEnabled = false
        this.llmStatusText = '本地知识库模式 - 配置API Key解锁AI增强'
      }
    },
    goToHerbList() {
      uni.switchTab({
        url: '/pages/herb-list/herb-list'
      })
    }
  }
}
</script>

<style lang="scss">
.page {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 70px;
}

.banner {
  background: linear-gradient(135deg, #2d8b5e 0%, #3da878 50%, #5bc494 100%);
  padding: 60rpx 40rpx 80rpx;
  position: relative;
  overflow: hidden;
}

.banner-content {
  position: relative;
  z-index: 2;
}

.banner-title {
  font-size: 52rpx;
  font-weight: 700;
  color: #fff;
  margin-bottom: 12rpx;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.banner-subtitle {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.9);
}

.banner-decoration {
  position: absolute;
  right: -40rpx;
  top: -40rpx;
  width: 200rpx;
  height: 200rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.container {
  padding: 24rpx;
  margin-top: -40rpx;
  position: relative;
  z-index: 10;
}

.card {
  background: #fff;
  border-radius: 20rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #2d8b5e;
  margin-bottom: 24rpx;
  display: flex;
  align-items: center;
}

.section-title::before {
  content: '';
  width: 8rpx;
  height: 32rpx;
  background: linear-gradient(180deg, #2d8b5e, #3da878);
  border-radius: 4rpx;
  margin-right: 16rpx;
}

.action-btns {
  display: flex;
  justify-content: space-around;
  padding: 20rpx 0;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.action-icon {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 44rpx;
  margin-bottom: 16rpx;
}

.camera-icon {
  background: linear-gradient(135deg, #e8f5ee, #d4efdf);
}

.album-icon {
  background: linear-gradient(135deg, #e8f0f5, #d4e5ef);
}

.quiz-icon {
  background: linear-gradient(135deg, #f5eee8, #efe5d4);
}

.action-text {
  font-size: 26rpx;
  color: #333;
}

.daily-quiz {
  background: linear-gradient(135deg, #fff 0%, #f8fdfb 100%);
  border: 2rpx solid #e8f5ee;
  cursor: pointer;
}

.quiz-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.quiz-tag {
  font-size: 22rpx;
  color: #f59e0b;
  background: #fef3c7;
  padding: 4rpx 16rpx;
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
  border-top: 1rpx solid #eee;
}

.quiz-category {
  font-size: 24rpx;
  color: #999;
}

.quiz-go {
  font-size: 26rpx;
  color: #2d8b5e;
  font-weight: 500;
}

.herb-showcase {
  .herb-list {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
  }
  
  .herb-item {
    width: 31%;
    margin-bottom: 20rpx;
    border-radius: 12rpx;
    overflow: hidden;
    background: #f9f9f9;
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
    font-size: 26rpx;
    color: #333;
    font-weight: 500;
    margin-bottom: 4rpx;
  }
  
  .herb-category {
    font-size: 20rpx;
    color: #999;
  }
}

.feature-list {
  .feature-item {
    display: flex;
    align-items: center;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #f5f5f5;
    
    &:last-child {
      border-bottom: none;
    }
  }
  
  .feature-icon {
    width: 80rpx;
    height: 80rpx;
    border-radius: 16rpx;
    background: #f0f9f4;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36rpx;
    margin-right: 24rpx;
  }
  
  .feature-text {
    flex: 1;
  }
  
  .feature-title {
    font-size: 30rpx;
    color: #333;
    font-weight: 500;
    margin-bottom: 6rpx;
  }
  
  .feature-desc {
    font-size: 24rpx;
    color: #999;
  }
}

/* LLM 状态条 */
.llm-status-bar {
  display: flex;
  align-items: center;
  padding: 20rpx 32rpx;
  margin: 24rpx;
  border-radius: 24rpx;
  transition: all 0.2s;
}

.llm-status-bar:active {
  transform: scale(0.98);
}

.llm-status-bar.enabled {
  background: linear-gradient(135deg, rgba(45, 139, 94, 0.08), rgba(45, 139, 94, 0.15));
  border: 2rpx solid rgba(45, 139, 94, 0.3);
}

.llm-status-bar.disabled {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(245, 158, 11, 0.15));
  border: 2rpx solid rgba(245, 158, 11, 0.3);
}

.llm-status-dot {
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.llm-status-dot.enabled {
  background: #2d8b5e;
  box-shadow: 0 0 12rpx rgba(45, 139, 94, 0.5);
}

.llm-status-dot.disabled {
  background: #f59e0b;
  box-shadow: 0 0 12rpx rgba(245, 158, 11, 0.5);
}

.llm-status-text {
  flex: 1;
  font-size: 26rpx;
  font-weight: 500;
}

.llm-status-text.enabled {
  color: #2d8b5e;
}

.llm-status-text.disabled {
  color: #f59e0b;
}

.llm-status-arrow {
  font-size: 32rpx;
  margin-left: 16rpx;
}

.llm-status-arrow.enabled {
  color: #2d8b5e;
}

.llm-status-arrow.disabled {
  color: #f59e0b;
}

/* 今日药材卡片 */
.daily-herb {
  background: linear-gradient(135deg, #f0f9f4 0%, rgba(45, 139, 94, 0.08) 100%);
  border: 2rpx solid rgba(45, 139, 94, 0.2);
  cursor: pointer;
}

.daily-herb-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.daily-herb-status {
  font-size: 22rpx;
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
  padding: 6rpx 24rpx;
  border-radius: 20rpx;
}

.daily-herb-status.checked {
  color: #2d8b5e;
  background: rgba(45, 139, 94, 0.12);
}

.daily-herb-content {
  display: flex;
  align-items: center;
}

.daily-herb-img {
  width: 120rpx;
  height: 120rpx;
  border-radius: 24rpx;
  margin-right: 28rpx;
  background: #f0f9f4;
  flex-shrink: 0;
}

.daily-herb-info {
  flex: 1;
}

.daily-herb-name {
  font-size: 34rpx;
  font-weight: 700;
  color: #333;
}

.daily-herb-effect {
  font-size: 26rpx;
  color: #2d8b5e;
  margin-top: 12rpx;
}

.daily-herb-loading {
  font-size: 28rpx;
  color: #999;
  padding: 40rpx 0;
  text-align: center;
  width: 100%;
}

.daily-herb-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 24rpx;
  margin-top: 24rpx;
  border-top: 2rpx dashed rgba(45, 139, 94, 0.2);
}

.daily-herb-tip {
  font-size: 24rpx;
  color: #999;
}

.checkin-btn {
  padding: 14rpx 40rpx;
  background: linear-gradient(135deg, #2d8b5e, #3da878);
  color: #fff;
  border: none;
  border-radius: 60rpx;
  font-size: 26rpx;
  line-height: 1.4;
}

.checkin-btn::after {
  border: none;
}

.checkin-btn.checked {
  background: #cccccc;
  color: #fff;
}

/* 经方问诊卡片 */
.consult-card {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(168, 85, 247, 0.15) 100%);
  border: 2rpx solid rgba(168, 85, 247, 0.2);
  cursor: pointer;
}

.consult-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.consult-tag {
  font-size: 22rpx;
  color: #a855f7;
  background: rgba(168, 85, 247, 0.1);
  padding: 6rpx 24rpx;
  border-radius: 20rpx;
}

.consult-content {
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
  margin-right: 28rpx;
  flex-shrink: 0;
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

/* 体质测评卡片 */
.constitution-card {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(245, 158, 11, 0.15) 100%);
  border: 2rpx solid rgba(245, 158, 11, 0.2);
}

.constitution-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.constitution-tag {
  font-size: 22rpx;
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
  padding: 6rpx 24rpx;
  border-radius: 20rpx;
}

.constitution-content {
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
  margin-right: 28rpx;
  flex-shrink: 0;
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
  color: #f59e0b;
  margin-top: 8rpx;
}

.constitution-arrow {
  font-size: 40rpx;
  color: #f59e0b;
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
  border: none;
  border-radius: 16rpx;
  font-size: 24rpx;
  color: #f59e0b;
  line-height: 1.4;
}

.constitution-btn::after {
  border: none;
}
</style>
