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

      <view class="auth-entry-card card" @click="goToAuthenticate">
        <view class="auth-entry-header">
          <view class="section-title">🔍 真伪鉴别</view>
          <view class="auth-entry-tag">避坑指南</view>
        </view>
        <view class="auth-entry-content">
          <view class="auth-entry-icon">🛡️</view>
          <view class="auth-entry-info">
            <view class="auth-entry-name">常见造假中药材鉴别</view>
            <view class="auth-entry-desc">茯苓·陈皮·黄芪·天麻等真伪对比</view>
          </view>
          <view class="auth-entry-arrow">→</view>
        </view>
        <view class="auth-entry-note">按药材名搜索，查看真伪图片对比与关键鉴别点</view>
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
          this.dailyHerbChecked = true
        } else {
          uni.showToast({ title: '打卡成功！', icon: 'success' })
          this.dailyHerbChecked = true
          setTimeout(() => {
            if (herbId) {
              this.goToDetail(herbId)
            }
          }, 800)
        }
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
    goToAuthenticate() {
      uni.navigateTo({
        url: '/pages/authenticate/authenticate'
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
/* =========================================
   极简文人风 - 首页样式
   调性：留白意境、温润米色、墨色文字、竹青点缀
   ========================================= */

/* 全局字体 - 使用系统楷体/宋体，无需额外引入 */
page {
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Source Han Sans SC", sans-serif;
}

.page {
  min-height: 100vh;
  background: #F5F1E8; /* 宣纸白 */
  padding-bottom: 70px;
  position: relative;
}

/* 背景装饰 - 淡雅水墨 */
.page::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(ellipse at 20% 10%, rgba(140, 160, 130, 0.06) 0%, transparent 40%),
    radial-gradient(ellipse at 80% 80%, rgba(180, 160, 120, 0.05) 0%, transparent 40%);
  pointer-events: none;
  z-index: 0;
}

/* =========================================
   顶部 Banner - 极简留白
   ========================================= */
.banner {
  background: transparent; /* 移除彩色渐变 */
  padding: 80rpx 40rpx 60rpx;
  position: relative;
  overflow: hidden;
}

.banner-content {
  position: relative;
  z-index: 2;
}

.banner-title {
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", "Microsoft YaHei", sans-serif;
  font-size: 68rpx;
  font-weight: 700;
  color: #3D3D3D; /* 墨黑 */
  margin-bottom: 16rpx;
  letter-spacing: 20rpx;
  text-indent: 20rpx;
  line-height: 1.2;
}

.banner-subtitle {
  font-size: 26rpx;
  color: #8B8680; /* 淡墨灰 */
  letter-spacing: 6rpx;
  font-weight: 300;
}

/* 右上装饰 - 朱砂小印 */
.banner-decoration {
  position: absolute;
  right: 40rpx;
  top: 80rpx;
  width: 48rpx;
  height: 48rpx;
  background: #B5534A; /* 朱砂红 */
  border-radius: 6rpx;
  opacity: 0.85;
  transform: rotate(-5deg);
  box-shadow: 0 2rpx 8rpx rgba(181, 83, 74, 0.3);
}

/* =========================================
   LLM 状态条
   ========================================= */
.llm-status-bar {
  display: flex;
  align-items: center;
  padding: 18rpx 32rpx;
  margin: 0 32rpx 32rpx;
  border-radius: 12rpx;
  border: 1rpx solid #E5DFD4;
  background: rgba(255, 255, 255, 0.5);
  transition: all 0.2s;
  position: relative;
  z-index: 2;
}

.llm-status-bar:active {
  transform: scale(0.98);
}

.llm-status-bar.enabled {
  background: rgba(140, 160, 130, 0.08);
  border-color: #C8D0C8;
}

.llm-status-bar.disabled {
  background: rgba(200, 170, 130, 0.08);
  border-color: #D5CDBE;
}

.llm-status-dot {
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  margin-right: 16rpx;
  flex-shrink: 0;
}

.llm-status-dot.enabled {
  background: #8CA082; /* 竹青绿 */
}

.llm-status-dot.disabled {
  background: #C8A878; /* 赭石 */
}

.llm-status-text {
  flex: 1;
  font-size: 24rpx;
  font-weight: 400;
  letter-spacing: 1rpx;
}

.llm-status-text.enabled {
  color: #5A6B54;
}

.llm-status-text.disabled {
  color: #9A8A72;
}

.llm-status-arrow {
  font-size: 28rpx;
  margin-left: 12rpx;
}

.llm-status-arrow.enabled {
  color: #8CA082;
}

.llm-status-arrow.disabled {
  color: #C8A878;
}

/* =========================================
   内容区容器
   ========================================= */
.container {
  padding: 0 32rpx;
  position: relative;
  z-index: 10;
}

/* =========================================
   卡片基础样式 - 极简半透明
   ========================================= */
.card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 16rpx;
  padding: 36rpx 32rpx;
  margin-bottom: 32rpx;
  border: 1rpx solid rgba(180, 170, 150, 0.25);
  box-shadow: 
    0 2rpx 12rpx rgba(180, 170, 150, 0.08),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.8);
  transition: all 0.2s ease;
}

.card:active {
  transform: scale(0.99);
}

/* 极简卡片 - 无边框版本 */
.card.plain {
  background: rgba(255, 255, 255, 0.4);
  border: 1rpx dashed rgba(180, 170, 150, 0.3);
  box-shadow: none;
}

/* =========================================
   标题样式 - 竖线装饰
   ========================================= */
.section-title {
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", "Microsoft YaHei", sans-serif;
  font-size: 34rpx;
  font-weight: 600;
  color: #3D3D3D;
  margin-bottom: 28rpx;
  display: flex;
  align-items: center;
  letter-spacing: 4rpx;
}

.section-title::before {
  content: '';
  width: 4rpx;
  height: 32rpx;
  background: linear-gradient(180deg, #8CA082 0%, transparent 100%);
  margin-right: 16rpx;
}

/* =========================================
   快速识别 - 极简图标按钮
   ========================================= */
.quick-actions.card {
  padding: 32rpx 24rpx;
}

.action-btns {
  display: flex;
  justify-content: space-around;
  padding: 8rpx 0 4rpx;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx 24rpx;
  border-radius: 12rpx;
  transition: all 0.2s;
}

.action-btn:active {
  background: rgba(180, 170, 150, 0.08);
}

.action-icon {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  margin-bottom: 16rpx;
  background: transparent;
  border: 1rpx solid #E0D8C8;
}

.camera-icon {
  background: linear-gradient(135deg, #F5F2EC, #E8E2D5);
  border: none;
}

.album-icon {
  background: linear-gradient(135deg, #F0F2EE, #E2E6DF);
  border: none;
}

.quiz-icon {
  background: linear-gradient(135deg, #F2EFE8, #E8E2D0);
  border: none;
}

.action-text {
  font-size: 26rpx;
  color: #5A6B54; /* 竹青 */
  font-weight: 400;
  letter-spacing: 2rpx;
}

/* =========================================
   今日答题
   ========================================= */
.daily-quiz {
  background: rgba(255, 255, 255, 0.5);
  border: 1rpx solid #E5DFD4;
}

.quiz-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.quiz-tag {
  font-size: 20rpx;
  color: #B5534A;
  background: rgba(181, 83, 74, 0.08);
  padding: 6rpx 20rpx;
  border-radius: 8rpx;
  font-weight: 400;
  letter-spacing: 1rpx;
}

.quiz-question {
  font-size: 30rpx;
  color: #3D3D3D;
  line-height: 1.7;
  margin-bottom: 28rpx;
  font-weight: 400;
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", "Microsoft YaHei", sans-serif;
}

.quiz-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20rpx;
  border-top: 1rpx dashed #D0C8B8;
}

.quiz-category {
  font-size: 24rpx;
  color: #8B8680;
  letter-spacing: 1rpx;
}

.quiz-go {
  font-size: 26rpx;
  color: #8CA082;
  font-weight: 500;
  letter-spacing: 2rpx;
}

/* =========================================
   今日药材 - 重点卡片
   ========================================= */
.daily-herb {
  background: 
    linear-gradient(135deg, rgba(245, 242, 232, 0.9) 0%, rgba(232, 230, 220, 0.9) 100%);
  border: 1rpx solid #D8D0C0;
}

.daily-herb-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28rpx;
}

.daily-herb-status {
  font-size: 22rpx;
  color: #B5534A;
  background: rgba(181, 83, 74, 0.08);
  padding: 6rpx 24rpx;
  border-radius: 8rpx;
  letter-spacing: 1rpx;
}

.daily-herb-status.checked {
  color: #8CA082;
  background: rgba(140, 160, 130, 0.1);
}

.daily-herb-content {
  display: flex;
  align-items: center;
}

.daily-herb-img {
  width: 140rpx;
  height: 140rpx;
  border-radius: 12rpx;
  margin-right: 28rpx;
  background: #EDE8DC;
  flex-shrink: 0;
  border: 1rpx solid #D8D0C0;
}

.daily-herb-info {
  flex: 1;
}

.daily-herb-name {
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", "Microsoft YaHei", sans-serif;
  font-size: 36rpx;
  font-weight: 600;
  color: #3D3D3D;
  letter-spacing: 6rpx;
  text-indent: 6rpx;
}

.daily-herb-effect {
  font-size: 26rpx;
  color: #8CA082;
  margin-top: 12rpx;
  letter-spacing: 2rpx;
}

.daily-herb-loading {
  font-size: 28rpx;
  color: #B0A898;
  padding: 48rpx 0;
  text-align: center;
  width: 100%;
}

.daily-herb-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 24rpx;
  margin-top: 28rpx;
  border-top: 1rpx dashed #D0C8B8;
}

.daily-herb-tip {
  font-size: 24rpx;
  color: #8B8680;
  letter-spacing: 1rpx;
}

.checkin-btn {
  padding: 16rpx 48rpx;
  background: linear-gradient(135deg, #8CA082 0%, #6B8A6A 100%);
  color: #fff;
  border: none;
  border-radius: 32rpx;
  font-size: 26rpx;
  font-weight: 600;
  line-height: 1.4;
  letter-spacing: 4rpx;
  box-shadow: 0 4rpx 16rpx rgba(140, 160, 130, 0.35);
  transition: all 0.2s ease;
}

.checkin-btn:active {
  transform: scale(0.96);
  box-shadow: 0 2rpx 8rpx rgba(140, 160, 130, 0.25);
}

.checkin-btn::after {
  border: none;
}

.checkin-btn.checked {
  background: linear-gradient(135deg, #B0A898 0%, #A09888 100%);
  box-shadow: none;
  letter-spacing: 2rpx;
}

/* =========================================
   经方问诊 / 体质测评 / 真伪鉴别
   ========================================= */
.consult-card,
.constitution-card,
.auth-entry-card {
  background: rgba(255, 255, 255, 0.5);
  border: 1rpx solid #E5DFD4;
}

.consult-header,
.constitution-header,
.auth-entry-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.consult-tag,
.constitution-tag,
.auth-entry-tag {
  font-size: 22rpx;
  background: rgba(180, 170, 150, 0.1);
  padding: 6rpx 20rpx;
  border-radius: 8rpx;
  letter-spacing: 1rpx;
}

.consult-tag {
  color: #8B7D9B;
  background: rgba(139, 125, 155, 0.08);
}

.constitution-tag {
  color: #B08860;
  background: rgba(176, 136, 96, 0.08);
}

.auth-entry-tag {
  color: #B5534A;
  background: rgba(181, 83, 74, 0.08);
}

.consult-content,
.constitution-content,
.auth-entry-content {
  display: flex;
  align-items: center;
}

.consult-icon,
.constitution-icon,
.auth-entry-icon {
  width: 100rpx;
  height: 100rpx;
  background: #F0EDE4;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
  margin-right: 28rpx;
  flex-shrink: 0;
  border: 1rpx solid #E0D8C8;
}

.consult-info,
.constitution-info,
.auth-entry-info {
  flex: 1;
}

.consult-name,
.constitution-name,
.auth-entry-name {
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", "Microsoft YaHei", sans-serif;
  font-size: 30rpx;
  font-weight: 600;
  color: #3D3D3D;
  letter-spacing: 4rpx;
}

.consult-desc,
.constitution-desc,
.auth-entry-desc {
  font-size: 24rpx;
  margin-top: 10rpx;
  letter-spacing: 1rpx;
}

.consult-desc { color: #8B7D9B; }
.constitution-desc { color: #B08860; }
.auth-entry-desc { color: #B5534A; }

.consult-arrow,
.constitution-arrow,
.auth-entry-arrow {
  font-size: 36rpx;
  color: #C8C0B0;
}

.consult-note,
.auth-entry-note {
  font-size: 24rpx;
  color: #8B8680;
  margin-top: 20rpx;
  line-height: 1.7;
  letter-spacing: 1rpx;
}

/* 体质测评按钮 */
.constitution-btns {
  display: flex;
  gap: 20rpx;
  margin-top: 28rpx;
}

.constitution-btn {
  flex: 1;
  padding: 18rpx;
  background: rgba(255, 255, 255, 0.6);
  border: 1rpx solid #D8D0C0;
  border-radius: 8rpx;
  font-size: 24rpx;
  color: #5A6B54;
  line-height: 1.4;
  letter-spacing: 1rpx;
}

.constitution-btn::after {
  border: none;
}

/* =========================================
   药材图鉴
   ========================================= */
.herb-showcase {
  background: transparent;
  border: none;
  box-shadow: none;
  padding: 8rpx 0;
}

.herb-showcase .section-title {
  padding-left: 16rpx;
}

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
  background: rgba(255, 255, 255, 0.6);
  border: 1rpx solid #E5DFD4;
  transition: all 0.2s;
}

.herb-item:active {
  transform: scale(0.97);
}

.herb-img {
  width: 100%;
  height: 160rpx;
}

.herb-info {
  padding: 16rpx 12rpx;
  text-align: center;
}

.herb-name {
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", "Microsoft YaHei", sans-serif;
  font-size: 26rpx;
  color: #3D3D3D;
  font-weight: 500;
  margin-bottom: 6rpx;
  letter-spacing: 2rpx;
}

.herb-category {
  font-size: 20rpx;
  color: #A8A090;
  letter-spacing: 1rpx;
}

/* =========================================
   核心功能列表
   ========================================= */
.features {
  background: rgba(255, 255, 255, 0.4);
  border: 1rpx dashed #E5DFD4;
  box-shadow: none;
}

.feature-list {
  .feature-item {
    display: flex;
    align-items: center;
    padding: 28rpx 0;
    border-bottom: 1rpx dashed #E5DFD4;
    
    &:last-child {
      border-bottom: none;
    }
  }
  
  .feature-icon {
    width: 72rpx;
    height: 72rpx;
    border-radius: 8rpx;
    background: #F5F2EC;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32rpx;
    margin-right: 28rpx;
    border: 1rpx solid #E5DFD4;
  }
  
  .feature-text {
    flex: 1;
  }
  
  .feature-title {
    font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", "Microsoft YaHei", sans-serif;
    font-size: 28rpx;
    color: #3D3D3D;
    font-weight: 500;
    margin-bottom: 8rpx;
    letter-spacing: 2rpx;
  }
  
  .feature-desc {
    font-size: 24rpx;
    color: #8B8680;
    letter-spacing: 1rpx;
  }
}

/* =========================================
   底部安全区域
   ========================================= */
.safe-area-bottom {
  height: constant(safe-area-inset-bottom);
  height: env(safe-area-inset-bottom);
}
</style>
