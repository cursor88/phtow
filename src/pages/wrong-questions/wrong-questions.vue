<template>
  <view class="page">
    <view class="container">
      <view class="stats-card card">
        <view class="stats-row">
          <view class="stats-col">
            <text class="stats-num">{{ wrongList.length }}</text>
            <text class="stats-label">错题数</text>
          </view>
          <view class="stats-divider"></view>
          <view class="stats-col">
            <text class="stats-num">{{ categoryCount }}</text>
            <text class="stats-label">涉及分类</text>
          </view>
          <view class="stats-divider"></view>
          <view class="stats-col">
            <text class="stats-num">{{ totalWrongCount }}</text>
            <text class="stats-label">累计错次</text>
          </view>
        </view>
        <view class="clear-btn" v-if="wrongList.length > 0" @click="clearAll">
          清空错题本
        </view>
      </view>

      <view class="loading" v-if="loading">
        <view class="loading-spinner"></view>
        <text>加载中...</text>
      </view>

      <view class="empty-state" v-else-if="wrongList.length === 0">
        <text class="empty-icon">📝</text>
        <text class="empty-text">暂无错题</text>
        <text class="empty-desc">答题错误后会自动加入错题本</text>
      </view>

      <view class="wrong-list" v-else>
        <view class="wrong-item card" v-for="(item, idx) in wrongList" :key="item.id || idx">
          <view class="item-header">
            <view class="item-category">{{ item.category || '未分类' }}</view>
            <view class="item-remove" @click="removeItem(item, idx)">删除</view>
          </view>

          <view class="item-question">{{ item.question }}</view>

          <view class="item-options" v-if="item.options && item.options.length">
            <view
              class="option-row"
              v-for="(opt, i) in item.options"
              :key="i"
              :class="{
                correct: isCorrectOption(item, i),
                wrong: isUserAnswer(item, i)
              }"
            >
              <text class="opt-letter">{{ String.fromCharCode(65 + i) }}</text>
              <text class="opt-text">{{ opt.substring(3) }}</text>
              <text class="opt-tag" v-if="isCorrectOption(item, i)">正确</text>
              <text class="opt-tag wrong-tag" v-else-if="isUserAnswer(item, i)">你的答案</text>
            </view>
          </view>

          <view class="item-explanation" v-if="item.explanation">
            <view class="exp-title">解析</view>
            <view class="exp-content">{{ item.explanation }}</view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { wrongQuestionApi } from '@/api/index.js'

export default {
  data() {
    return {
      wrongList: [],
      loading: true,
      totalWrongCount: 0
    }
  },
  computed: {
    categoryCount() {
      const set = new Set()
      this.wrongList.forEach(item => {
        if (item.category) set.add(item.category)
      })
      return set.size
    }
  },
  onShow() {
    this.loadList()
  },
  methods: {
    async loadList() {
      this.loading = true
      try {
        const res = await wrongQuestionApi.getList()
        const list = Array.isArray(res) ? res : (res && res.list) || (res && res.data) || []
        this.wrongList = list
        this.totalWrongCount = list.reduce((sum, item) => sum + (item.wrongCount || 1), 0)
      } catch (e) {
        console.error('加载错题本失败', e)
        uni.showToast({ title: '加载失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },
    isCorrectOption(item, index) {
      const answer = item.correctAnswer || item.answer
      if (answer == null) return false
      if (typeof answer === 'number') return answer === index
      return String.fromCharCode(65 + index) === String(answer)
    },
    isUserAnswer(item, index) {
      const ua = item.userAnswer
      if (ua == null) return false
      if (typeof ua === 'number') return ua === index
      return String.fromCharCode(65 + index) === String(ua)
    },
    async removeItem(item, idx) {
      const id = item.id || item.questionId
      if (!id) {
        this.wrongList.splice(idx, 1)
        return
      }
      uni.showModal({
        title: '确认',
        content: '确定移除这道错题吗？',
        success: async (r) => {
          if (r.confirm) {
            try {
              await wrongQuestionApi.remove(id)
              this.wrongList.splice(idx, 1)
              uni.showToast({ title: '已移除', icon: 'success' })
            } catch (e) {
              console.error('移除失败', e)
              uni.showToast({ title: '移除失败', icon: 'none' })
            }
          }
        }
      })
    },
    clearAll() {
      uni.showModal({
        title: '清空错题本',
        content: '确定要清空所有错题吗？此操作不可恢复。',
        confirmColor: '#dc2626',
        success: async (r) => {
          if (r.confirm) {
            try {
              await wrongQuestionApi.clear()
              this.wrongList = []
              this.totalWrongCount = 0
              uni.showToast({ title: '已清空', icon: 'success' })
            } catch (e) {
              console.error('清空失败', e)
              uni.showToast({ title: '清空失败', icon: 'none' })
            }
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
  background: #f0f9f4;
}

.container {
  padding: 24rpx;
}

.card {
  background: #fff;
  border-radius: 20rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.stats-card {
  background: linear-gradient(135deg, #2d8b5e 0%, #3da878 100%);
  color: #fff;
}

.stats-row {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.stats-col {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stats-num {
  font-size: 44rpx;
  font-weight: bold;
  color: #fff;
}

.stats-label {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.85);
  margin-top: 8rpx;
}

.stats-divider {
  width: 1rpx;
  height: 60rpx;
  background: rgba(255, 255, 255, 0.3);
}

.clear-btn {
  margin-top: 24rpx;
  text-align: center;
  font-size: 26rpx;
  color: #fff;
  padding: 16rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.5);
  border-radius: 12rpx;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 40vh;
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

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 40vh;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 16rpx;
}

.empty-text {
  font-size: 30rpx;
  color: #666;
  margin-bottom: 8rpx;
}

.empty-desc {
  font-size: 24rpx;
  color: #999;
}

.wrong-item {
  padding: 28rpx;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.item-category {
  font-size: 24rpx;
  color: #2d8b5e;
  background: #f0f9f4;
  padding: 6rpx 16rpx;
  border-radius: 16rpx;
}

.item-remove {
  font-size: 24rpx;
  color: #dc2626;
  padding: 6rpx 16rpx;
}

.item-question {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  line-height: 1.6;
  margin-bottom: 20rpx;
}

.item-options {
  margin-bottom: 20rpx;
}

.option-row {
  display: flex;
  align-items: center;
  padding: 16rpx 20rpx;
  border: 2rpx solid #e5e7eb;
  border-radius: 12rpx;
  margin-bottom: 12rpx;
}

.option-row.correct {
  border-color: #10b981;
  background: #ecfdf5;
}

.option-row.wrong {
  border-color: #ef4444;
  background: #fef2f2;
}

.opt-letter {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: 600;
  color: #6b7280;
  margin-right: 16rpx;
  flex-shrink: 0;
}

.option-row.correct .opt-letter {
  background: #10b981;
  color: #fff;
}

.option-row.wrong .opt-letter {
  background: #ef4444;
  color: #fff;
}

.opt-text {
  flex: 1;
  font-size: 26rpx;
  color: #333;
  line-height: 1.5;
}

.opt-tag {
  font-size: 20rpx;
  color: #10b981;
  padding: 4rpx 12rpx;
  background: #d1fae5;
  border-radius: 8rpx;
  margin-left: 12rpx;
}

.opt-tag.wrong-tag {
  color: #ef4444;
  background: #fee2e2;
}

.item-explanation {
  background: #fefce8;
  border-radius: 12rpx;
  padding: 20rpx;
  border: 1rpx solid #fef08a;
}

.exp-title {
  font-size: 26rpx;
  font-weight: 600;
  color: #854d0e;
  margin-bottom: 8rpx;
}

.exp-content {
  font-size: 24rpx;
  color: #713f12;
  line-height: 1.7;
}
</style>
