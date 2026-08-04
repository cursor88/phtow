<template>
  <view class="page">
    <view class="quiz-container">
      <!-- 答题模式 -->
      <block v-if="mode !== 'wrong'">
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

        <view class="quiz-entry-bar card">
          <view class="quiz-entry-btn quiz-entry-list" @click="goToQuizList">📚 题库</view>
          <view class="quiz-entry-btn quiz-entry-wrong" @click="goToWrongQuestions">📝 错题本</view>
        </view>

        <view class="quiz-card card" v-if="currentQuestion">
          <view class="quiz-meta">
            <view class="quiz-category">{{ currentQuestion.category }}</view>
            <view class="quiz-difficulty" :class="'diff-' + difficultyKey">
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
              <view class="option-text">{{ formatOption(option) }}</view>
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

        <view class="quiz-tips card" v-if="!answered && currentQuestion">
          <view class="section-title">答题小贴士</view>
          <view class="tip-text">认真阅读题目，选择你认为正确的答案。提交后即可查看答案和解析，帮助你更好地学习中药知识。答错的题目会自动加入错题本。</view>
        </view>
      </block>

      <!-- 错题本模式 -->
      <block v-else>
        <view class="wrong-header card">
          <view class="wrong-back" @click="backToQuiz">← 返回答题</view>
          <view class="wrong-title">📝 我的错题本</view>
          <view class="wrong-count" v-if="wrongQuestions.length > 0">共 {{ wrongQuestions.length }} 道错题</view>
        </view>

        <view class="loading" v-if="wrongLoading">
          <view class="loading-spinner"></view>
          <text>加载中...</text>
        </view>

        <view v-else-if="wrongQuestions.length === 0" class="empty-state card">
          <text class="empty-icon">✅</text>
          <text class="empty-text">暂无错题</text>
          <text class="empty-desc">继续答题，错题会自动收集到这里</text>
        </view>

        <view v-else class="wrong-list">
          <view class="wrong-item card" v-for="(item, idx) in wrongQuestions" :key="idx">
            <view class="wrong-item-header">
              <view class="wrong-tag">错题</view>
              <view class="wrong-category">{{ item.category || '未分类' }}</view>
              <view class="wrong-difficulty" v-if="item.difficulty">{{ item.difficulty }}</view>
            </view>
            <view class="wrong-question-text">{{ item.question }}</view>
            
            <view class="wrong-options" v-if="item.options && item.options.length">
              <view 
                class="wrong-option" 
                v-for="(opt, oi) in item.options" 
                :key="oi"
                :class="{
                  'wrong-option-correct': isCorrectAnswer(item, oi),
                  'wrong-option-user': isUserAnswer(item, oi)
                }"
              >
                <text class="wrong-option-letter">{{ String.fromCharCode(65 + oi) }}</text>
                <text class="wrong-option-text">{{ formatOption(opt) }}</text>
                <text class="wrong-option-mark" v-if="isCorrectAnswer(item, oi)">✓ 正确答案</text>
                <text class="wrong-option-mark wrong-option-mark-user" v-else-if="isUserAnswer(item, oi)">✗ 你的答案</text>
              </view>
            </view>

            <view class="wrong-explanation" v-if="item.explanation">
              <text class="wrong-explanation-label">💡 解析</text>
              <text class="wrong-explanation-text">{{ item.explanation }}</text>
            </view>

            <view class="wrong-item-footer">
              <text class="wrong-count-text">错误次数: {{ item.wrong_count || 1 }}</text>
              <view class="wrong-remove-btn" @click="removeWrongQuestion(item.id)">移除</view>
            </view>
          </view>
        </view>
      </block>
    </view>
  </view>
</template>

<script>
import { quizApi, wrongQuestionApi } from '@/api/index.js'
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
      mode: 'random',
      wrongQuestions: [],
      wrongLoading: false
    }
  },
  computed: {
    accuracy() {
      if (this.totalCount === 0) return 0
      return Math.round((this.correctCount / this.totalCount) * 100)
    },
    difficultyKey() {
      const map = { '简单': 'easy', '中等': 'medium', '困难': 'hard' }
      return map[this.currentQuestion && this.currentQuestion.difficulty] || 'easy'
    }
  },
  onLoad(options) {
    if (options.mode === 'daily') {
      this.mode = 'daily'
      this.loadDailyQuestion()
    } else if (options.mode === 'wrong') {
      this.mode = 'wrong'
      this.loadWrongQuestions()
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
    formatOption(opt) {
      if (!opt) return ''
      const str = String(opt)
      if (/^[A-D]\.\s/.test(str)) return str.substring(3)
      if (/^[A-D]\./.test(str)) return str.substring(2)
      return str
    },
    goToQuizList() {
      uni.navigateTo({ url: '/pages/quiz/quiz?mode=random' })
    },
    goToWrongQuestions() {
      this.mode = 'wrong'
      this.loadWrongQuestions()
    },
    backToQuiz() {
      this.mode = 'random'
      this.loadRandomQuestion()
    },
    async loadWrongQuestions() {
      this.wrongLoading = true
      try {
        const data = await wrongQuestionApi.getList()
        this.wrongQuestions = Array.isArray(data) ? data : (data && data.list ? data.list : [])
      } catch (e) {
        console.error('加载错题本失败', e)
        this.wrongQuestions = []
      } finally {
        this.wrongLoading = false
      }
    },
    isCorrectAnswer(item, index) {
      const answer = item.answer
      if (typeof answer === 'number') return answer === index
      if (typeof answer === 'string' && /^[A-Da-d]$/.test(answer)) {
        return answer.toUpperCase().charCodeAt(0) - 65 === index
      }
      return false
    },
    isUserAnswer(item, index) {
      const ua = item.userAnswer
      if (typeof ua === 'number') return ua === index
      if (typeof ua === 'string' && /^[A-Da-d]$/.test(ua)) {
        return ua.toUpperCase().charCodeAt(0) - 65 === index
      }
      return false
    },
    async removeWrongQuestion(id) {
      try {
        await wrongQuestionApi.remove(id)
        uni.showToast({ title: '已移除', icon: 'success' })
        this.loadWrongQuestions()
      } catch (e) {
        console.error('移除错题失败', e)
      }
    },
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
      if (typeof this.correctAnswer === 'number') {
        return index === this.correctAnswer
      }
      if (typeof this.correctAnswer === 'string' && /^[A-Da-d]$/.test(this.correctAnswer)) {
        return this.correctAnswer.toUpperCase().charCodeAt(0) - 65 === index
      }
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
        } else {
          this.saveWrongQuestion(answer)
        }
        
        utils.storage.set('quiz_stats', {
          correctCount: this.correctCount,
          totalCount: this.totalCount
        })
      } catch (e) {
        console.error('提交答案失败', e)
      }
    },
    async saveWrongQuestion(userAnswer) {
      try {
        await wrongQuestionApi.add({
          questionId: this.currentQuestion.id,
          userAnswer: userAnswer,
          correctAnswer: typeof this.correctAnswer === 'number' 
            ? String.fromCharCode(65 + this.correctAnswer) 
            : this.correctAnswer,
          question: this.currentQuestion.question,
          options: this.currentQuestion.options,
          explanation: this.explanation,
          category: this.currentQuestion.category,
          difficulty: this.currentQuestion.difficulty
        })
      } catch (e) {
        console.error('保存错题失败', e)
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

.quiz-entry-bar {
  display: flex;
  gap: 24rpx;
}

.quiz-entry-btn {
  flex: 1;
  padding: 24rpx;
  border-radius: 16rpx;
  font-size: 28rpx;
  font-weight: 500;
  text-align: center;

  &:active {
    opacity: 0.7;
  }
}

.quiz-entry-list {
  background: rgba(45, 139, 94, 0.08);
  color: #2d8b5e;
}

.quiz-entry-wrong {
  background: rgba(239, 68, 68, 0.08);
  color: #dc2626;
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
  
  &.diff-easy {
    color: #059669;
    background: #d1fae5;
  }

  &.diff-medium {
    color: #d97706;
    background: #fef3c7;
  }

  &.diff-hard {
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
    border-color: #2d8b5e;
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
    background: #2d8b5e;
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
    color: #2d8b5e;
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

/* 错题本模式样式 */
.wrong-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}

.wrong-back {
  align-self: flex-start;
  font-size: 28rpx;
  color: #2d8b5e;
  font-weight: 500;
  
  &:active {
    opacity: 0.7;
  }
}

.wrong-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #333;
}

.wrong-count {
  font-size: 24rpx;
  color: #999;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 0;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 32rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 8rpx;
}

.empty-desc {
  font-size: 24rpx;
  color: #999;
}

.wrong-list {
  margin-top: 0;
}

.wrong-item {
  border-left: 6rpx solid #ef4444;
}

.wrong-item-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.wrong-tag {
  font-size: 22rpx;
  color: #dc2626;
  background: rgba(239, 68, 68, 0.1);
  padding: 6rpx 16rpx;
  border-radius: 8rpx;
  font-weight: 500;
}

.wrong-category {
  font-size: 24rpx;
  color: #999;
}

.wrong-difficulty {
  font-size: 22rpx;
  color: #666;
  background: #f5f5f5;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.wrong-question-text {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  line-height: 1.6;
  margin-bottom: 20rpx;
}

.wrong-options {
  margin-bottom: 20rpx;
}

.wrong-option {
  display: flex;
  align-items: center;
  padding: 16rpx 20rpx;
  border: 2rpx solid #e5e7eb;
  border-radius: 12rpx;
  margin-bottom: 12rpx;
  background: #fafafa;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.wrong-option-correct {
  border-color: #2d8b5e;
  background: #ecfdf5;
}

.wrong-option-user {
  border-color: #ef4444;
  background: #fef2f2;
}

.wrong-option-letter {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: 600;
  color: #666;
  margin-right: 16rpx;
  flex-shrink: 0;
  
  .wrong-option-correct & {
    background: #2d8b5e;
    color: #fff;
  }
  
  .wrong-option-user & {
    background: #ef4444;
    color: #fff;
  }
}

.wrong-option-text {
  flex: 1;
  font-size: 26rpx;
  color: #333;
  line-height: 1.5;
}

.wrong-option-mark {
  font-size: 22rpx;
  color: #2d8b5e;
  font-weight: 500;
  margin-left: 12rpx;
  flex-shrink: 0;
}

.wrong-option-mark-user {
  color: #ef4444;
}

.wrong-explanation {
  background: #fefce8;
  border-radius: 10rpx;
  padding: 16rpx 20rpx;
  margin-bottom: 20rpx;
  border: 1rpx solid #fef08a;
}

.wrong-explanation-label {
  font-size: 26rpx;
  font-weight: 600;
  color: #854d0e;
  display: block;
  margin-bottom: 8rpx;
}

.wrong-explanation-text {
  font-size: 24rpx;
  color: #713f12;
  line-height: 1.7;
}

.wrong-item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1rpx solid #f0f0f0;
  padding-top: 16rpx;
}

.wrong-count-text {
  font-size: 24rpx;
  color: #dc2626;
}

.wrong-remove-btn {
  font-size: 24rpx;
  color: #2d8b5e;
  padding: 8rpx 24rpx;
  border: 1rpx solid #2d8b5e;
  border-radius: 20rpx;
  
  &:active {
    background: #2d8b5e;
    color: #fff;
  }
}
</style>
