<template>
  <view class="page">
    <view class="banner">
      <view class="banner-content">
        <view class="banner-title">本草智识</view>
        <view class="banner-subtitle">AI中药药材识别与学习平台</view>
      </view>
      <view class="banner-decoration"></view>
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

      <view class="daily-herb card" @click="goToHerbDetail">
        <view class="daily-herb-header">
          <view class="section-title">🌿 今日药材</view>
          <view class="daily-herb-status" :class="{ checked: dailyHerbChecked }">
            {{ dailyHerbChecked ? '✓ 已学习' : '去学习' }}
          </view>
        </view>
        <view class="daily-herb-content" v-if="dailyHerb">
          <image class="daily-herb-img" :src="dailyHerb.image" mode="aspectFill"></image>
          <view class="daily-herb-info">
            <view class="daily-herb-name">{{ dailyHerb.name }}</view>
            <view class="daily-herb-pinyin">{{ dailyHerb.pinyin }}</view>
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

      <view class="herb-showcase card">
        <view class="section-title">药材图鉴</view>
        <view class="herb-list">
          <view class="herb-item" v-for="item in showcaseHerbs" :key="item.id" @click="goToDetail(item.id)">
            <image class="herb-img" :src="item.image" mode="aspectFill"></image>
            <view class="herb-info">
              <view class="herb-name">{{ item.name }}</view>
              <view class="herb-category">{{ item.category }}</view>
            </view>
          </view>
        </view>
      </view>

      <view class="features card">
        <view class="feature-list">
          <view class="feature-item" @click="goToConstitution">
            <view class="feature-icon">🧬</view>
            <view class="feature-text">
              <view class="feature-title">体质测评</view>
              <view class="feature-desc">中医体质辨识</view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { quizApi, herbApi, checkinApi } from '@/api/index.js'

export default {
  data() {
    return {
      dailyQuestion: null,
      showcaseHerbs: [],
      dailyHerb: null,
      dailyHerbChecked: false
    }
  },
  onLoad() {
    this.loadDailyQuestion()
    this.loadShowcaseHerbs()
    this.loadDailyHerb()
  },
  onPullDownRefresh() {
    this.loadDailyQuestion()
    this.loadShowcaseHerbs()
    this.loadDailyHerb()
    setTimeout(() => {
      uni.stopPullDownRefresh()
    }, 500)
  },
  methods: {
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
      uni.navigateTo({
        url: `/pages/identify/identify?image=${encodeURIComponent(filePath)}`
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
    goToConstitution() {
      uni.showActionSheet({
        itemList: ['标准测评 (60题)', '快速测评 (18题)'],
        success: (res) => {
          const mode = res.tapIndex === 0 ? 'standard' : 'quick'
          uni.navigateTo({
            url: `/pages/constitution/constitution?mode=${mode}`
          })
        }
      })
    },
    goToHerbDetail() {
      if (this.dailyHerb) {
        uni.navigateTo({
          url: `/pages/detail/detail?id=${this.dailyHerb.id}`
        })
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
  background: $bg-primary;
}

.banner {
  background: linear-gradient(135deg, $primary-color 0%, $secondary-color 50%, lighten($secondary-color, 12%) 100%);
  padding: 60rpx 32rpx 80rpx;
  position: relative;
  overflow: hidden;
}

.banner-content {
  position: relative;
  z-index: 2;
}

.banner-title {
  font-size: 48rpx;
  font-weight: $font-weight-bold;
  color: #FFFFFF;
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
  background: $bg-card;
  border-radius: $radius-lg;
  padding: 32rpx;
  margin-bottom: $spacing-lg;
  box-shadow: $shadow-card;
}

.section-title {
  font-size: $font-size-xl;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  margin-bottom: $spacing-lg;
  display: flex;
  align-items: center;
}

.section-title::before {
  content: '';
  width: 8rpx;
  height: 32rpx;
  background: $primary-color;
  border-radius: $radius-sm;
  margin-right: $spacing-md;
}

.action-btns {
  display: flex;
  justify-content: space-around;
  padding: $spacing-md 0;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  padding: $spacing-sm;
  transition: transform $transition-normal;
  min-width: 140rpx;
  
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
  margin-bottom: $spacing-sm;
  transition: background-color $transition-normal;
}

.camera-icon {
  background: rgba($cta-color, 0.1);
}

.album-icon {
  background: rgba($primary-color, 0.1);
}

.quiz-icon {
  background: rgba($warning-color, 0.1);
}

.action-text {
  font-size: $font-size-sm;
  color: $text-primary;
}

.daily-quiz {
  background: $bg-card;
  border: 1rpx solid $border-light;
  cursor: pointer;
  transition: box-shadow $transition-normal;
  
  &:active {
    box-shadow: $shadow-md;
  }
}

.quiz-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-sm;
}

.quiz-tag {
  font-size: $font-size-xs;
  color: $warning-color;
  background: rgba($warning-color, 0.1);
  padding: 4rpx 16rpx;
  border-radius: $radius-full;
}

.quiz-question {
  font-size: $font-size-lg;
  color: $text-primary;
  line-height: 1.6;
  margin-bottom: $spacing-lg;
  font-weight: $font-weight-medium;
}

.quiz-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: $spacing-md;
  border-top: 1rpx solid $border-light;
}

.quiz-category {
  font-size: $font-size-sm;
  color: $text-muted;
}

.quiz-go {
  font-size: $font-size-sm;
  color: $primary-color;
  font-weight: $font-weight-medium;
}

.daily-herb {
  background: rgba($cta-color, 0.04);
  border: 1rpx solid rgba($cta-color, 0.2);
  cursor: pointer;
  transition: box-shadow $transition-normal;
  
  &:active {
    box-shadow: $shadow-md;
  }
}

.daily-herb-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-md;
}

.daily-herb-status {
  font-size: $font-size-sm;
  color: $warning-color;
  background: rgba($warning-color, 0.1);
  padding: 6rpx 20rpx;
  border-radius: $radius-full;
  
  &.checked {
    color: $cta-color;
    background: rgba($cta-color, 0.15);
  }
}

.daily-herb-content {
  display: flex;
  align-items: center;
}

.daily-herb-img {
  width: 160rpx;
  height: 160rpx;
  border-radius: $radius-lg;
  margin-right: $spacing-lg;
  flex-shrink: 0;
}

.daily-herb-info {
  flex: 1;
  min-width: 0;
}

.daily-herb-name {
  font-size: $font-size-xl;
  font-weight: $font-weight-bold;
  color: $text-primary;
  margin-bottom: $spacing-xs;
}

.daily-herb-pinyin {
  font-size: $font-size-sm;
  color: $text-muted;
  margin-bottom: $spacing-sm;
}

.daily-herb-effect {
  font-size: $font-size-sm;
  color: $cta-color;
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
  color: $text-muted;
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

.daily-herb-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: $spacing-md;
  margin-top: $spacing-md;
  border-top: 1rpx dashed rgba($cta-color, 0.3);
}

.daily-herb-tip {
  font-size: $font-size-xs;
  color: $text-muted;
}

.checkin-btn {
  padding: 12rpx 32rpx;
  background: linear-gradient(135deg, $cta-color, lighten($cta-color, 8%));
  color: #FFFFFF;
  border-radius: $radius-full;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  cursor: pointer;
  transition: opacity $transition-normal, transform $transition-normal;
  
  &:active {
    opacity: 0.8;
    transform: scale(0.98);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.herb-showcase {
  .herb-list {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
  }
  
  .herb-item {
    width: 31%;
    margin-bottom: $spacing-md;
    border-radius: $radius-md;
    overflow: hidden;
    background: $bg-secondary;
    cursor: pointer;
    transition: transform $transition-normal, box-shadow $transition-normal;
    
    &:active {
      transform: scale(0.98);
      box-shadow: $shadow-md;
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
    font-size: $font-size-sm;
    color: $text-primary;
    font-weight: $font-weight-medium;
    margin-bottom: 4rpx;
  }
  
  .herb-category {
    font-size: $font-size-xs;
    color: $text-muted;
  }
}

.feature-list {
  .feature-item {
    display: flex;
    align-items: center;
    padding: $spacing-md 0;
    border-bottom: 1rpx solid $border-light;
    cursor: pointer;
    transition: background-color $transition-normal;
    
    &:last-child {
      border-bottom: none;
    }
    
    &:active {
      background-color: $bg-hover;
    }
  }
  
  .feature-icon {
    width: 80rpx;
    height: 80rpx;
    border-radius: $radius-md;
    background: rgba($primary-color, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36rpx;
    margin-right: $spacing-lg;
  }
  
  .feature-text {
    flex: 1;
    min-width: 0;
  }
  
  .feature-title {
    font-size: $font-size-lg;
    color: $text-primary;
    font-weight: $font-weight-medium;
    margin-bottom: 6rpx;
  }
  
  .feature-desc {
    font-size: $font-size-sm;
    color: $text-muted;
  }
}
</style>
