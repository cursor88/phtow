<template>
  <view class="page">
    <view class="nav-bar">
      <view class="back" @click="goBack">
        <text>←</text>
      </view>
      <text class="title">识别纠错审核</text>
      <view class="nav-right"></view>
    </view>

    <view class="review-content">
      <view class="review-list" v-if="list.length > 0">
        <view class="review-card" v-for="item in list" :key="item.id">
          <view class="card-image-wrap">
            <image class="card-image" :src="item.image || item.imageUrl" mode="aspectFill" @click="previewImage(item)"></image>
          </view>
          <view class="card-body">
            <view class="result-row">
              <view class="row-label">AI识别结果</view>
              <view class="row-value">
                <text class="ai-name">{{ item.herbName || item.aiName || '-' }}</text>
                <text class="ai-accuracy" v-if="accuracyOf(item) !== null">
                  相似度 {{ formatAccuracy(accuracyOf(item)) }}
                </text>
              </view>
            </view>
            <view class="result-row">
              <view class="row-label">用户反馈药材</view>
              <view class="row-value">
                <text class="feedback-name">{{ item.correctHerbName || item.feedbackName || item.correctName || '-' }}</text>
              </view>
            </view>
            <view class="action-row">
              <button class="btn approve-btn" @click="handleApprove(item)">通过</button>
              <button class="btn reject-btn" @click="handleReject(item)">驳回</button>
            </view>
          </view>
        </view>
      </view>

      <view class="empty-state" v-else-if="!loading">
        <view class="empty-icon">📋</view>
        <view class="empty-text">暂无待审核记录</view>
      </view>

      <view class="loading" v-else>
        <view class="loading-spinner"></view>
        <text class="loading-text">加载中...</text>
      </view>
    </view>
  </view>
</template>

<script>
import { reviewApi } from '@/api/index.js'

export default {
  data() {
    return {
      list: [],
      page: 1,
      loading: false
    }
  },
  onLoad() {
    this.loadList()
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    async loadList() {
      if (this.loading) return
      this.loading = true
      try {
        const res = await reviewApi.getPendingList(this.page)
        const items = Array.isArray(res) ? res : (res && res.list) || []
        if (this.page === 1) {
          this.list = items
        } else {
          this.list = [...this.list, ...items]
        }
      } catch (e) {
        console.error('加载待审核列表失败', e)
      } finally {
        this.loading = false
      }
    },
    accuracyOf(item) {
      if (item.accuracy != null) return item.accuracy
      if (item.similarity != null) return item.similarity
      return null
    },
    formatAccuracy(val) {
      const num = Number(val)
      if (isNaN(num)) return val
      if (num <= 1) return (num * 100).toFixed(1) + '%'
      return num.toFixed(1) + '%'
    },
    previewImage(item) {
      const url = item.image || item.imageUrl
      if (!url) return
      uni.previewImage({ urls: [url], current: url })
    },
    removeItem(id) {
      this.list = this.list.filter(i => i.id !== id)
      if (this.list.length === 0) {
        this.page++
        this.loadList()
      }
    },
    async handleApprove(item) {
      try {
        await reviewApi.approve(item.id)
        uni.showToast({ title: '已通过', icon: 'success' })
        this.removeItem(item.id)
      } catch (e) {
        console.error('通过失败', e)
      }
    },
    async handleReject(item) {
      try {
        await reviewApi.reject(item.id)
        uni.showToast({ title: '已驳回', icon: 'none' })
        this.removeItem(item.id)
      } catch (e) {
        console.error('驳回失败', e)
      }
    }
  }
}
</script>

<style lang="scss">
.page {
  min-height: 100vh;
  background: #f0f9f4;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 60rpx 32rpx 24rpx;
  background: linear-gradient(135deg, #2d8b5e, #3da878);
  color: #FFFFFF;
  box-shadow: 0 2rpx 8rpx rgba(45, 139, 94, 0.2);

  .back {
    width: 80rpx;
    font-size: 40rpx;
    cursor: pointer;
  }

  .title {
    font-size: 36rpx;
    font-weight: 600;
  }

  .nav-right {
    width: 80rpx;
  }
}

.review-content {
  padding: 24rpx 32rpx 48rpx;
}

.review-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.review-card {
  background: #FFFFFF;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.card-image-wrap {
  width: 100%;
  height: 360rpx;
  background: #f8fafc;
}

.card-image {
  width: 100%;
  height: 100%;
}

.card-body {
  padding: 24rpx;
}

.result-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16rpx;
}

.row-label {
  width: 180rpx;
  font-size: 24rpx;
  color: #999;
  flex-shrink: 0;
  padding-top: 4rpx;
}

.row-value {
  flex: 1;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12rpx;
}

.ai-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.ai-accuracy {
  font-size: 22rpx;
  color: #F59E0B;
  background: rgba(245, 158, 11, 0.1);
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
}

.feedback-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #2d8b5e;
}

.action-row {
  display: flex;
  gap: 20rpx;
  margin-top: 24rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f9f4;
}

.btn {
  flex: 1;
  border: none;
  border-radius: 9999rpx;
  font-size: 28rpx;
  font-weight: 600;
  padding: 18rpx 0;
  line-height: 1.4;
}

.btn::after {
  border: none;
}

.approve-btn {
  background: linear-gradient(135deg, #2d8b5e, #3da878);
  color: #FFFFFF;
}

.reject-btn {
  background: #FFFFFF;
  color: #dc2626;
  border: 1rpx solid #dc2626;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 160rpx 0;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
  color: #999;
  font-size: 24rpx;
}

.loading-spinner {
  width: 48rpx;
  height: 48rpx;
  border: 4rpx solid rgba(45, 139, 94, 0.2);
  border-top-color: #2d8b5e;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16rpx;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
