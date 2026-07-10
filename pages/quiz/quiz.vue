<template>
  <view class="page">
    <view class="quiz-container">
      <view class="quiz-header card">
        <view class="quiz-stats">
          <view class="stat-item">
            <view class="stat-num">{{ correctCount }}</view>
            <view class="stat-label">答对</view>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item">
            <view class="stat-num">{{ totalCount }}</view>
            <view class="stat-label">总题数</view>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item">
            <view class="stat-num">{{ accuracy }}%</view>
            <view class="stat-label">正确率</view>
          </view>
        </view>
      </view>

      <view class="quiz-card card" v-if="currentQuestion">
        <view class="quiz-meta">
          <view class="quiz-category">{{ currentQuestion.category }}</view>
          <view class="quiz-difficulty" :class="'diff-' + currentQuestion.difficulty">
            {{ currentQuestion.difficulty }}
          </view>
        </view>
        
        <view class="question-number">
          第 {{ questionIndex + 1 }} 题
        </view>
        
        <view class="question-text">
          {{ currentQuestion.question }}
        </view>

        <view class="options-list">
          <view 
            class="option-item" 
            v-for="(option, index) in currentQuestion.options" 
            :key="index"
            :class="getOptionClass(index)"
            @click="selectOption(index)"
          >
            <view class="option-letter">{{ String.fromCharCode(65 + index) }}</view>
            <view class="option-text">{{ option.substring(3) }}</view>
            <view class="option-icon" v-if="answered">
              <text v-if="isCorrectOption(index)">✓</text>
              <text v-else-if="selectedIndex === index">✗</text>
            </view>
          </view>
        </view>

        <view class="explanation-area" v-if="answered">
          <view class="explanation-title">
            <text class="explanation-icon">💡</text>
            答案解析
          </view>
          <view class="explanation-content">
            {{ explanation }}
          </view>
        </view>

        <view class="action-row">
          <button class="secondary-btn" v-if="answered" @click="nextQuestion">
            下一题
          </button>
          <button class="primary-btn" v-else :disabled="selectedIndex === null" @click="submitAnswer">
            提交答案
          </button>
        </view>
      </view>

      <view class="loading" v-else>
        <view class="loading-spinner"></view>
        <text>加载题目中...</text>
      </view>

      <view class="quiz-tips card" v-if="!answered">
        <view class="section-title">答题小贴士</view>
        <view class="tip-text">认真阅读题目，选择你认为正确的答案。提交后即可查看答案和解析，帮助你更好地学习中药知识。</view>
      </view>
    </view>
  </view>
</template>

<script>
import { quizApi } from '@/api/index.js'
import utils from '@/utils/index.js'

export default {
  data() {
    return {
      currentQuestion: null,
      selectedIndex: null,
      answered: false,
      isCorrect: false,
      correctAnswer: '',
      explanation: '',
      questionIndex: 0,
      correctCount: 0,
      totalCount: 0,
      mode: 'random'
    }
  },
  computed: {
    accuracy() {
      if (this.totalCount === 0) return 0
      return Math.round((this.correctCount / this.totalCount) * 100)
    }
  },
  onLoad(options) {
    if (options.mode === 'daily') {
      this.mode = 'daily'
      this.loadDailyQuestion()
    } else {
      this.loadRandomQuestion()
    }
    
    const stats = utils.storage.get('quiz_stats')
    if (stats) {
      this.correctCount = stats.correctCount || 0
      this.totalCount = stats.totalCount || 0
    }
  },
  methods: {
    async loadDailyQuestion() {
      try {
        this.currentQuestion = await quizApi.getDailyQuestion()
      } catch (e) {
        console.error('加载每日题目失败', e)
      }
    },
    async loadRandomQuestion() {
      try {
        this.currentQuestion = await quizApi.getRandomQuestion()
        this.resetQuestion()
      } catch (e) {
        console.error('加载题目失败', e)
      }
    },
    resetQuestion() {
      this.selectedIndex = null
      this.answered = false
      this.isCorrect = false
      this.correctAnswer = ''
      this.explanation = ''
    },
    getOptionClass(index) {
      const classes = []
      
      if (this.answered) {
        if (this.isCorrectOption(index)) {
          classes.push('correct')
        } else if (this.selectedIndex === index) {
          classes.push('wrong')
        } else {
          classes.push('disabled')
        }
      } else if (this.selectedIndex === index) {
        classes.push('selected')
      }
      
      return classes
    },
    isCorrectOption(index) {
      const letter = String.fromCharCode(65 + index)
      return letter === this.correctAnswer
    },
    selectOption(index) {
      if (this.answered) return
      this.selectedIndex = index
    },
    async submitAnswer() {
      if (this.selectedIndex === null) return
      
      const answer = String.fromCharCode(65 + this.selectedIndex)
      
      try {
        const res = await quizApi.submitAnswer(this.currentQuestion.id, answer)
        this.answered = true
        this.isCorrect = res.isCorrect
        this.correctAnswer = res.correctAnswer
        this.explanation = res.explanation
        
        this.totalCount++
        if (res.isCorrect) {
          this.correctCount++
        }
        
        utils.storage.set('quiz_stats', {
          correctCount: this.correctCount,
          totalCount: this.totalCount
        })
      } catch (e) {
        console.error('提交答案失败', e)
      }
    },
    nextQuestion() {
      this.questionIndex++
      this.loadRandomQuestion()
    }
  }
}
</script>

<style lang="scss">
.page {
  min-height: 100vh;
  background: #f5f7fa;
}

.quiz-container {
  padding: 24rpx;
}

.card {
  background: #fff;
  border-radius: 20rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.quiz-stats {
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.stat-item {
  text-align: center;
}

.stat-num {
  font-size: 40rpx;
  font-weight: 700;
  color: #2d8b5e;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #999;
}

.stat-divider {
  width: 1rpx;
  height: 60rpx;
  background: #eee;
}

.quiz-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.quiz-category {
  font-size: 24rpx;
  color: #666;
  background: #f5f5f5;
  padding: 6rpx 16rpx;
  border-radius: 16rpx;
}

.quiz-difficulty {
  font-size: 22rpx;
  padding: 6rpx 16rpx;
  border-radius: 16rpx;
  
  &.diff-简单 {
    color: #059669;
    background: #d1fae5;
  }
  
  &.diff-中等 {
    color: #d97706;
    background: #fef3c7;
  }
  
  &.diff-困难 {
    color: #dc2626;
    background: #fee2e2;
  }
}

.question-number {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 16rpx;
}

.question-text {
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
  line-height: 1.6;
  margin-bottom: 32rpx;
}

.options-list {
  margin-bottom: 32rpx;
}

.option-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  border: 2rpx solid #e5e7eb;
  border-radius: 16rpx;
  margin-bottom: 16rpx;
  background: #fff;
  transition: all 0.2s;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  &.selected {
    border-color: #2d8b5e;
    background: #f0fdf4;
  }
  
  &.correct {
    border-color: #10b981;
    background: #ecfdf5;
  }
  
  &.wrong {
    border-color: #ef4444;
    background: #fef2f2;
  }
  
  &.disabled {
    opacity: 0.6;
  }
}

.option-letter {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  font-weight: 600;
  color: #6b7280;
  margin-right: 20rpx;
  flex-shrink: 0;
  
  .selected & {
    background: #2d8b5e;
    color: #fff;
  }
  
  .correct & {
    background: #10b981;
    color: #fff;
  }
  
  .wrong & {
    background: #ef4444;
    color: #fff;
  }
}

.option-text {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  line-height: 1.5;
}

.option-icon {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: bold;
  margin-left: 12rpx;
  
  .correct & {
    color: #10b981;
  }
  
  .wrong & {
    color: #ef4444;
  }
}

.explanation-area {
  background: #fefce8;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 32rpx;
  border: 1rpx solid #fef08a;
}

.explanation-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #854d0e;
  margin-bottom: 12rpx;
  display: flex;
  align-items: center;
}

.explanation-icon {
  margin-right: 8rpx;
}

.explanation-content {
  font-size: 26rpx;
  color: #713f12;
  line-height: 1.8;
}

.action-row {
  display: flex;
  gap: 20rpx;
}

.primary-btn {
  flex: 1;
  background: linear-gradient(135deg, #2d8b5e 0%, #3da878 100%);
  color: #fff;
  border-radius: 50rpx;
  font-size: 30rpx;
  padding: 22rpx 0;
  border: none;
}

.primary-btn::after {
  border: none;
}

.primary-btn[disabled] {
  opacity: 0.5;
}

.secondary-btn {
  flex: 1;
  background: #fff;
  color: #2d8b5e;
  border: 2rpx solid #2d8b5e;
  border-radius: 50rpx;
  font-size: 30rpx;
  padding: 20rpx 0;
}

.secondary-btn::after {
  border: none;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  color: #999;
  font-size: 28rpx;
}

.loading-spinner {
  width: 50rpx;
  height: 50rpx;
  border: 4rpx solid #e8f5ee;
  border-top-color: #2d8b5e;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20rpx;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
}

.tip-text {
  font-size: 26rpx;
  color: #666;
  line-height: 1.7;
}
</style>
