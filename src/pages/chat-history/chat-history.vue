<template>
  <view class="page">
    <view class="nav-bar">
      <view class="back" @click="goBack">
        <text>←</text>
      </view>
      <text class="title">问诊记录</text>
      <view class="nav-right"></view>
    </view>

    <view class="content">
      <view class="record-list" v-if="records.length > 0">
        <view
          class="record-card"
          v-for="item in records"
          :key="item.sessionId"
          @click="goDetail(item.sessionId)"
          @longpress="deleteRecord(item.sessionId)"
        >
          <view class="card-top">
            <view class="summary">{{ item.summary || '问诊记录' }}</view>
            <view class="delete-btn" @click.stop="deleteRecord(item.sessionId)">
              <text class="delete-icon">×</text>
            </view>
          </view>
          <view class="preview">{{ getPreview(item) }}</view>
          <view class="card-meta">
            <view class="meta-item">
              <text class="meta-icon">🕐</text>
              <text class="meta-text">{{ formatDate(item.endedAt || item.createdAt) }}</text>
            </view>
            <view class="meta-item" v-if="item.messageCount">
              <text class="meta-icon">💬</text>
              <text class="meta-text">{{ item.messageCount }} 条消息</text>
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
  onShow() {
    this.loadHistory()
  },
  methods: {
    async loadHistory() {
      this.loading = true
      try {
        const result = await chatApi.getHistory(1)
        if (Array.isArray(result)) {
          this.records = result
        } else if (result && result.list) {
          this.records = result.list
        } else {
          this.records = []
        }
      } catch (e) {
        console.error('加载问诊记录失败', e)
      } finally {
        this.loading = false
      }
    },
    getPreview(item) {
      if (item.preview) return item.preview
      if (item.lastMessage) return item.lastMessage
      if (item.diagnosis) return '辨证：' + item.diagnosis
      return '点击查看详细对话'
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
    goDetail(id) {
      uni.navigateTo({
        url: `/pages/chat-detail/chat-detail?id=${id}`
      })
    },
    goBack() {
      uni.navigateBack()
    },
    formatDate(date) {
      if (!date) return ''
      const d = new Date(date)
      if (isNaN(d.getTime())) return ''
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

<style scoped>
.page {
  min-height: 100vh;
  padding: 0;
  background: #F5F1E8;
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", "Microsoft YaHei", sans-serif;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 60rpx 32rpx 24rpx;
  background: rgba(245, 241, 232, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1rpx solid rgba(180, 170, 150, 0.25);
  color: #3D3D3D;
  box-shadow: 0 2rpx 12rpx rgba(180, 170, 150, 0.08);
}

.nav-bar .back {
  width: 80rpx;
  font-size: 40rpx;
  color: #3D3D3D;
}

.nav-bar .title {
  font-size: 36rpx;
  font-weight: 600;
  letter-spacing: 2rpx;
}

.nav-bar .nav-right {
  width: 80rpx;
}

.content {
  padding: 24rpx;
  padding-bottom: 48rpx;
}

.record-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border: 1rpx solid rgba(180, 170, 150, 0.25);
  border-radius: 16rpx;
  padding: 28rpx 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(180, 170, 150, 0.08);
}

.record-card:active {
  transform: scale(0.98);
  box-shadow: 0 2rpx 8rpx rgba(180, 170, 150, 0.12);
}

.card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.summary {
  flex: 1;
  font-size: 30rpx;
  font-weight: 600;
  color: #3D3D3D;
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
  background: rgba(181, 83, 74, 0.08);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.delete-btn:active {
  background: rgba(181, 83, 74, 0.18);
}

.delete-icon {
  font-size: 32rpx;
  color: #B5534A;
  line-height: 1;
}

.preview {
  font-size: 26rpx;
  color: #8B8680;
  line-height: 1.5;
  margin-bottom: 16rpx;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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
  color: #8B8680;
}

.card-arrow {
  display: flex;
  justify-content: flex-end;
  padding-top: 12rpx;
  border-top: 1rpx solid rgba(180, 170, 150, 0.2);
}

.arrow-text {
  font-size: 24rpx;
  color: #8CA082;
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
  color: #8B8680;
  margin-bottom: 12rpx;
}

.empty-tip {
  font-size: 24rpx;
  color: #A5A099;
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
  border: 4rpx solid #E5DFD4;
  border-top-color: #8CA082;
  border-radius: 50%;
  animation: historySpin 1s linear infinite;
  margin-bottom: 20rpx;
}

.loading-text {
  font-size: 26rpx;
  color: #8B8680;
}

@keyframes historySpin {
  to {
    transform: rotate(360deg);
  }
}
</style>
