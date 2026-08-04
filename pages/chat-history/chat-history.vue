<template>
  <view class="page">
    <view class="record-list" v-if="records.length > 0">
      <view class="record-card" v-for="item in records" :key="item.sessionId" @click="goDetail(item.sessionId)">
        <view class="card-top">
          <view class="summary">{{ item.summary || '问诊记录' }}</view>
          <view class="delete-btn" @click.stop="deleteRecord(item.sessionId)">
            <text class="delete-icon">×</text>
          </view>
        </view>
        <view class="card-meta">
          <view class="meta-item">
            <text class="meta-icon">🕐</text>
            <text class="meta-text">{{ formatDate(item.createdAt) }}</text>
          </view>
          <view class="meta-item">
            <text class="meta-icon">💬</text>
            <text class="meta-text">{{ item.messageCount || 0 }} 条消息</text>
          </view>
        </view>
        <view class="card-arrow">
          <text class="arrow-text">查看详情 ›</text>
        </view>
      </view>
    </view>

    <view class="empty-state" v-else-if="!loading">
      <text class="empty-icon">📋</text>
      <text class="empty-text">暂无问诊记录</text>
      <text class="empty-tip">开始问诊后将在此显示</text>
    </view>

    <view class="loading-state" v-if="loading">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>
  </view>
</template>

<script>
import { chatApi } from '@/api/index.js'

export default {
  data() {
    return {
      records: [],
      loading: false
    }
  },
  onLoad() {
    this.loadHistory()
  },
  onShow() {
    if (this.records.length > 0) {
      this.loadHistory()
    }
  },
  methods: {
    async loadHistory() {
      this.loading = true
      try {
        const result = await chatApi.getHistory(1)
        this.records = Array.isArray(result) ? result : (result.list || [])
      } catch (e) {
        console.error('加载问诊记录失败', e)
      } finally {
        this.loading = false
      }
    },
    deleteRecord(id) {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这条问诊记录吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              await chatApi.deleteHistory(id)
              uni.showToast({ title: '已删除', icon: 'success' })
              this.records = this.records.filter(r => r.sessionId !== id)
            } catch (e) {
              uni.showToast({ title: '删除失败', icon: 'none' })
            }
          }
        }
      })
    },
    goDetail(sessionId) {
      uni.navigateTo({
        url: `/pages/chat-detail/chat-detail?sessionId=${sessionId}`
      })
    },
    formatDate(date) {
      if (!date) return ''
      const d = new Date(date)
      const now = new Date()
      const diff = now - d
      if (diff < 60000) return '刚刚'
      if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
      if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
      if (diff < 604800000) return Math.floor(diff / 86400000) + '天前'
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      const h = String(d.getHours()).padStart(2, '0')
      const min = String(d.getMinutes()).padStart(2, '0')
      if (y === now.getFullYear()) {
        return `${m}月${day}日 ${h}:${min}`
      }
      return `${y}年${m}月${day}日`
    }
  }
}
</script>

<style lang="scss">
.page {
  min-height: 100vh;
  background: #f0f9f4;
  padding: 24rpx;
}

.record-list {
  padding-bottom: 40rpx;
}

.record-card {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 28rpx 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(45, 139, 94, 0.06);
  transition: transform 200ms, box-shadow 200ms;

  &:active {
    transform: scale(0.98);
    box-shadow: 0 2rpx 8rpx rgba(45, 139, 94, 0.1);
  }
}

.card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.summary {
  flex: 1;
  font-size: 30rpx;
  font-weight: 600;
  color: #1f3a2e;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-right: 16rpx;
}

.delete-btn {
  width: 48rpx;
  height: 48rpx;
  background: rgba(239, 68, 68, 0.08);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background-color 200ms;

  &:active {
    background: rgba(239, 68, 68, 0.18);
  }
}

.delete-icon {
  font-size: 32rpx;
  color: #ef4444;
  line-height: 1;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 32rpx;
  margin-bottom: 16rpx;
}

.meta-item {
  display: flex;
  align-items: center;
}

.meta-icon {
  font-size: 24rpx;
  margin-right: 8rpx;
}

.meta-text {
  font-size: 24rpx;
  color: #6b7280;
}

.card-arrow {
  display: flex;
  justify-content: flex-end;
  padding-top: 12rpx;
  border-top: 1rpx solid #ecfdf5;
}

.arrow-text {
  font-size: 24rpx;
  color: #2d8b5e;
  font-weight: 500;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 160rpx 0 80rpx;
}

.empty-icon {
  font-size: 100rpx;
  margin-bottom: 24rpx;
  opacity: 0.6;
}

.empty-text {
  font-size: 30rpx;
  color: #6b7280;
  margin-bottom: 12rpx;
}

.empty-tip {
  font-size: 24rpx;
  color: #9ca3af;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
}

.loading-spinner {
  width: 48rpx;
  height: 48rpx;
  border: 4rpx solid #d1fae5;
  border-top-color: #2d8b5e;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20rpx;
}

.loading-text {
  font-size: 26rpx;
  color: #6b7280;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
