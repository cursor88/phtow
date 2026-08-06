<template>
  <view class="page">
    <view class="container">
      <view class="loading" v-if="loading">
        <view class="loading-spinner"></view>
        <text>加载中...</text>
      </view>

      <view class="empty-state" v-else-if="topics.length === 0">
        <text class="empty-icon">📚</text>
        <text class="empty-text">暂无题库专题</text>
      </view>

      <view class="topic-grid" v-else>
        <view class="topic-card" v-for="topic in topics" :key="topic.id" @click="enterTopic(topic)">
          <view class="topic-icon">{{ topic.icon || '📖' }}</view>
          <view class="topic-info">
            <view class="topic-name">{{ topic.name }}</view>
            <view class="topic-desc">{{ topic.description || '点击开始练习' }}</view>
            <view class="topic-meta">
              <text class="meta-item">{{ topic.totalQuestions || 0 }} 题</text>
            </view>
          </view>
          <view class="topic-arrow">→</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { quizApi } from '@/api/index.js'

export default {
  data() {
    return {
      topics: [],
      loading: true
    }
  },
  onLoad() {
    this.loadTopics()
  },
  methods: {
    async loadTopics() {
      this.loading = true
      try {
        const res = await quizApi.getTopics()
        this.topics = Array.isArray(res) ? res : (res && res.list) || (res && res.data) || []
      } catch (e) {
        console.error('加载题库专题失败', e)
        uni.showToast({ title: '加载失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },
    enterTopic(topic) {
      uni.navigateTo({
        url: `/pages/quiz/quiz?topicId=${topic.id}&topicName=${encodeURIComponent(topic.name)}`
      })
    }
  }
}
</script>

<style>
.page {
  min-height: 100vh;
  background: #F5F1E8;
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", "Microsoft YaHei", sans-serif;
}

.container {
  padding: 24rpx;
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
  border-top-color: #8CA082;
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
}

.topic-grid {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.topic-card {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 16rpx;
  padding: 28rpx;
  border: 1rpx solid rgba(180, 170, 150, 0.25);
  backdrop-filter: blur(10px);
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.04);
}

.topic-icon {
  width: 88rpx;
  height: 88rpx;
  border-radius: 16rpx;
  background: linear-gradient(135deg, #8CA082 0%, #A8B89E 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 44rpx;
  margin-right: 24rpx;
  flex-shrink: 0;
}

.topic-info {
  flex: 1;
  min-width: 0;
}

.topic-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #3D3D3D;
  margin-bottom: 8rpx;
}

.topic-desc {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.topic-meta {
  display: flex;
  align-items: center;
  font-size: 22rpx;
  color: #8CA082;
}

.meta-item {
  color: #8CA082;
}

.meta-divider {
  margin: 0 8rpx;
  color: #ccc;
}

.topic-arrow {
  font-size: 36rpx;
  color: #ccc;
  margin-left: 12rpx;
}
</style>
