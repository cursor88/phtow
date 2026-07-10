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
  </view>
</template>

<script>
import { quizApi, herbApi } from '@/api/index.js'

export default {
  data() {
    return {
      dailyQuestion: null,
      showcaseHerbs: []
    }
  },
  onLoad() {
    this.loadDailyQuestion()
    this.loadShowcaseHerbs()
  },
  onPullDownRefresh() {
    this.loadDailyQuestion()
    this.loadShowcaseHerbs()
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
</style>
