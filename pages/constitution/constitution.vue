<template>
  <view class="page">
    <view class="header">
      <view class="header-left" @click="goBack">
        <text>←</text>
      </view>
      <view class="header-title">{{ mode === 'quick' ? '快速测评' : '标准测评' }}</view>
      <view class="header-right"></view>
    </view>
    
    <view class="progress-bar">
      <view class="progress-fill" :style="{ width: progressPercent + '%' }"></view>
    </view>
    <view class="progress-text">{{ currentIndex + 1 }} / {{ questions.length }}</view>
    
    <view class="question-area" v-if="questions.length > 0">
      <view class="question-text">{{ currentQuestion.text }}</view>
      <view class="options-list">
        <view 
          class="option-item" 
          :class="{ selected: answers[currentQuestion.id] === idx + 1 }"
          v-for="(opt, idx) in options" 
          :key="idx"
          @click="selectOption(idx + 1)"
        >
          {{ opt }}
        </view>
      </view>
    </view>
    
    <view class="result-area" v-if="showResult">
      <view class="result-icon" :style="{ background: resultInfo.color }">🧬</view>
      <view class="result-title" :style="{ color: resultInfo.color }">{{ result.mainTypeName }}</view>
      <view class="result-desc">{{ resultInfo.desc }}</view>
      
      <view class="score-section">
        <view class="section-title">各体质得分</view>
        <view class="score-list">
          <view class="score-item" v-for="item in scoreList" :key="item.type">
            <view class="score-row">
              <text class="score-name">{{ item.name }}</text>
              <text class="score-value" :style="{ color: item.color }">{{ item.score }}%</text>
            </view>
            <view class="score-bar">
              <view class="score-fill" :style="{ width: item.score + '%', background: item.color }"></view>
            </view>
          </view>
        </view>
      </view>
      
      <view class="mixed-section" v-if="result.mixedTypes && result.mixedTypes.length > 0">
        <view class="section-title">兼夹体质</view>
        <view class="mixed-tags">
          <view class="mixed-tag" v-for="t in result.mixedTypes" :key="t.type">
            {{ t.name }} {{ t.score }}%
          </view>
        </view>
      </view>
      
      <view class="result-date">测评时间：{{ result.date }}</view>
    </view>
    
    <view class="bottom-bar">
      <view class="btn btn-secondary" v-if="currentIndex > 0 && !showResult" @click="prevQuestion">上一题</view>
      <view class="btn btn-primary" v-if="currentIndex < questions.length - 1 && !showResult" @click="nextQuestion">下一题</view>
      <view class="btn btn-success" v-if="currentIndex === questions.length - 1 && !showResult" @click="submitTest">提交测评</view>
      <view class="btn btn-primary" v-if="showResult" @click="goBack">返回</view>
    </view>
  </view>
</template>

<script>
import { constitutionApi } from '@/api/index.js'

export default {
  data() {
    return {
      mode: 'standard',
      questions: [],
      currentIndex: 0,
      answers: {},
      showResult: false,
      result: null,
      options: ['从不', '很少', '有时', '经常', '总是'],
      constitutionTypes: {
        pinghe: { name: '平和质', color: '#10b981', desc: '精力充沛，适应力强，很少不适' },
        qixu: { name: '气虚质', color: '#f59e0b', desc: '容易疲劳，稍微活动就气短' },
        yangxu: { name: '阳虚质', color: '#3b82f6', desc: '手脚冰凉，尤其怕冷' },
        yinxu: { name: '阴虚质', color: '#ef4444', desc: '感到手脚心发热，口干舌燥' },
        tanshi: { name: '痰湿质', color: '#84cc16', desc: '身体沉重，腹部肥软，痰多' },
        shire: { name: '湿热质', color: '#a855f7', desc: '面部油腻，易长痘痘或疮疡' },
        xueyu: { name: '血瘀质', color: '#7c3aed', desc: '皮肤暗沉、容易出现淤青' },
        qiyu: { name: '气郁质', color: '#06b6d4', desc: '情绪抑郁，经常叹气或失眠' },
        tebing: { name: '特禀质', color: '#ec4899', desc: '容易过敏（如鼻炎、荨麻疹）' }
      }
    }
  },
  computed: {
    currentQuestion() {
      return this.questions[this.currentIndex] || {}
    },
    progressPercent() {
      if (!this.questions.length) return 0
      return ((this.currentIndex + 1) / this.questions.length * 100).toFixed(0)
    },
    resultInfo() {
      return this.constitutionTypes[this.result?.mainType] || {}
    },
    scoreList() {
      if (!this.result?.convertedScores) return []
      return Object.keys(this.result.convertedScores)
        .map(key => ({
          type: key,
          name: this.constitutionTypes[key]?.name || '',
          score: this.result.convertedScores[key],
          color: this.constitutionTypes[key]?.color || '#666'
        }))
        .sort((a, b) => b.score - a.score)
    }
  },
  onLoad(options) {
    this.mode = options.mode || 'standard'
    this.loadQuestions()
  },
  methods: {
    async loadQuestions() {
      try {
        const result = await constitutionApi.getQuestions(this.mode)
        this.questions = result.questions || []
      } catch (e) {
        uni.showToast({ title: '加载失败', icon: 'none' })
      }
    },
    selectOption(value) {
      this.answers[this.currentQuestion.id] = value
    },
    prevQuestion() {
      if (this.currentIndex > 0) {
        this.currentIndex--
      }
    },
    nextQuestion() {
      if (!this.answers[this.currentQuestion.id]) {
        uni.showToast({ title: '请选择答案', icon: 'none' })
        return
      }
      if (this.currentIndex < this.questions.length - 1) {
        this.currentIndex++
      }
    },
    async submitTest() {
      const unanswered = this.questions.filter(q => !this.answers[q.id])
      if (unanswered.length > 0) {
        uni.showToast({ title: `还有 ${unanswered.length} 题未作答`, icon: 'none' })
        return
      }
      
      const answers = Object.keys(this.answers).map(qid => ({
        qid: parseInt(qid),
        value: this.answers[qid]
      }))
      
      uni.showLoading({ title: '提交中...' })
      try {
        const result = await constitutionApi.submit({ answers, mode: this.mode })
        uni.hideLoading()
        uni.showToast({ title: '测评完成', icon: 'success' })
        
        setTimeout(() => {
          uni.redirectTo({
            url: `/pages/constitution/constitution-result?data=${encodeURIComponent(JSON.stringify(result))}`
          })
        }, 500)
      } catch (e) {
        uni.hideLoading()
        uni.showToast({ title: '提交失败', icon: 'none' })
      }
    },
    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: $bg-primary;
  padding-bottom: 120rpx;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 60rpx 32rpx 32rpx;
  background: linear-gradient(135deg, $primary-color, $secondary-color);
  color: #FFFFFF;
  
  .header-left, .header-right {
    width: 80rpx;
    font-size: 36rpx;
    cursor: pointer;
  }
  
  .header-title {
    font-size: $font-size-xl;
    font-weight: $font-weight-semibold;
  }
}

.progress-bar {
  height: 8rpx;
  background: rgba(255,255,255,0.3);
  margin: 0 32rpx;
  
  .progress-fill {
    height: 100%;
    background: #FFFFFF;
    border-radius: $radius-sm;
    transition: width $transition-slow;
  }
}

.progress-text {
  text-align: center;
  font-size: $font-size-sm;
  color: rgba(255,255,255,0.8);
  padding: $spacing-md 0;
}

.question-area {
  padding: $spacing-xl $spacing-lg;
  
  .question-text {
    font-size: $font-size-xl;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin-bottom: $spacing-xl;
    line-height: 1.6;
  }
  
  .options-list {
    display: flex;
    flex-direction: column;
    gap: $spacing-lg;
  }
  
  .option-item {
    padding: $spacing-lg;
    background: $bg-card;
    border-radius: $radius-lg;
    font-size: $font-size-base;
    color: $text-primary;
    border: 2rpx solid $border-light;
    transition: all $transition-normal;
    cursor: pointer;
    
    &:active {
      transform: scale(0.98);
    }
    
    &.selected {
      background: $primary-color;
      color: #FFFFFF;
      border-color: $primary-color;
    }
    
    &:not(.selected):active {
      border-color: $primary-color;
      background: rgba($primary-color, 0.05);
    }
  }
}

.result-area {
  padding: $spacing-xl $spacing-lg;
  text-align: center;
  
  .result-icon {
    width: 200rpx;
    height: 200rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 96rpx;
    margin: 0 auto $spacing-xl;
  }
  
  .result-title {
    font-size: $font-size-display;
    font-weight: $font-weight-bold;
    margin-bottom: $spacing-sm;
  }
  
  .result-desc {
    font-size: $font-size-base;
    color: $text-secondary;
    margin-bottom: $spacing-xl;
  }
  
  .score-section, .mixed-section {
    background: $bg-card;
    border-radius: $radius-lg;
    padding: $spacing-lg;
    margin-bottom: $spacing-lg;
    box-shadow: $shadow-card;
    
    .section-title {
      font-size: $font-size-lg;
      font-weight: $font-weight-semibold;
      color: $text-primary;
      margin-bottom: $spacing-lg;
      text-align: left;
    }
  }
  
  .score-list {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
  }
  
  .score-item {
    .score-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: $spacing-xs;
      
      .score-name {
        font-size: $font-size-sm;
        color: $text-primary;
      }
      
      .score-value {
        font-size: $font-size-sm;
        font-weight: $font-weight-semibold;
      }
    }
    
    .score-bar {
      height: 16rpx;
      background: $bg-secondary;
      border-radius: $radius-full;
      overflow: hidden;
      
      .score-fill {
        height: 100%;
        border-radius: $radius-full;
        transition: width $transition-slow;
      }
    }
  }
  
  .mixed-tags {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-md;
    
    .mixed-tag {
      font-size: $font-size-xs;
      color: $text-secondary;
      background: $bg-secondary;
      padding: 12rpx 24rpx;
      border-radius: $radius-full;
    }
  }
  
  .result-date {
    font-size: $font-size-sm;
    color: $text-muted;
    margin-top: $spacing-xl;
  }
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: $spacing-lg;
  padding-bottom: calc($spacing-lg + env(safe-area-inset-bottom));
  background: $bg-card;
  display: flex;
  gap: $spacing-lg;
  box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.05);
  
  .btn {
    flex: 1;
    padding: $spacing-lg;
    border-radius: $radius-lg;
    font-size: $font-size-base;
    text-align: center;
    font-weight: $font-weight-medium;
    cursor: pointer;
    transition: opacity $transition-normal, transform $transition-normal;
    
    &:active {
      opacity: 0.8;
      transform: scale(0.98);
    }
    
    &.btn-secondary {
      background: $bg-secondary;
      color: $text-secondary;
    }
    
    &.btn-primary {
      background: $primary-color;
      color: #FFFFFF;
    }
    
    &.btn-success {
      background: $cta-color;
      color: #FFFFFF;
    }
    
    &:disabled {
      opacity: 0.5;
    }
  }
}
</style>
