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
      <!-- 统计 -->
      <view class="stats-row">
        <view class="stats-card" :class="{ active: currentTab === 'pending' }" @click="switchTab('pending')">
          <view class="stats-num pending">{{ stats.pending || 0 }}</view>
          <view class="stats-label">待审核</view>
        </view>
        <view class="stats-card" :class="{ active: currentTab === 'approved' }" @click="switchTab('approved')">
          <view class="stats-num approved">{{ stats.approved || 0 }}</view>
          <view class="stats-label">已通过</view>
        </view>
        <view class="stats-card" :class="{ active: currentTab === 'rejected' }" @click="switchTab('rejected')">
          <view class="stats-num rejected">{{ stats.rejected || 0 }}</view>
          <view class="stats-label">已拒绝</view>
        </view>
      </view>

      <!-- Tab 切换 -->
      <view class="tab-bar">
        <view
          class="tab-item"
          :class="{ active: currentTab === tab.key }"
          v-for="tab in tabs"
          :key="tab.key"
          @click="switchTab(tab.key)"
        >{{ tab.label }}</view>
      </view>

      <!-- 审核列表 -->
      <view class="review-list" v-if="list.length > 0">
        <view class="review-card" v-for="item in list" :key="item.id">
          <view class="card-top">
            <view class="card-image-wrap" @click="previewImage(item)">
              <image class="card-image" :src="getImageUrl(item)" mode="aspectFill"></image>
            </view>
            <view class="card-body">
              <view class="result-row">
                <view class="row-label">用户认为</view>
                <view class="row-value">
                  <text class="feedback-name">{{ item.correct_name || item.herb_name || item.correctName || '-' }}</text>
                </view>
              </view>
              <view class="result-row">
                <view class="row-label">AI识别</view>
                <view class="row-value">
                  <text class="ai-name">{{ item.original_result || item.aiName || '未知' }}</text>
                  <text class="ai-accuracy" v-if="item.accuracy != null">相似度 {{ formatAccuracy(item.accuracy) }}</text>
                </view>
              </view>
              <view class="result-row">
                <view class="row-label">提交时间</view>
                <view class="row-value">
                  <text class="meta-text">{{ formatTime(item.created_at) }}</text>
                </view>
              </view>
              <view class="result-row" v-if="item.reviewer_note && currentTab !== 'pending'">
                <view class="row-label">审核理由</view>
                <view class="row-value">
                  <text class="meta-text">{{ item.reviewer_note }}</text>
                </view>
              </view>
            </view>
          </view>

          <view class="card-actions" v-if="currentTab === 'pending'">
            <view class="action-btn approve-btn" @click="openReason(item, 'approve')">✓ 通过</view>
            <view class="action-btn reject-btn" @click="openReason(item, 'reject')">✗ 拒绝</view>
          </view>
          <view class="card-footer" v-else>
            <text class="review-time">审核时间：{{ formatTime(item.reviewed_at) }}</text>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-else-if="!loading">
        <view class="empty-icon">📋</view>
        <view class="empty-title">暂无{{ currentTabLabel }}记录</view>
      </view>

      <!-- 加载中 -->
      <view class="loading" v-else>
        <view class="loading-spinner"></view>
        <text class="loading-text">加载中...</text>
      </view>
    </view>

    <!-- 理由输入弹窗 -->
    <view class="modal-mask" v-if="reasonPopup.show" @click="closeReason">
      <view class="modal-card" @click.stop>
        <view class="modal-title">{{ reasonPopup.type === 'approve' ? '通过审核' : '拒绝审核' }}</view>
        <view class="modal-desc">请填写{{ reasonPopup.type === 'approve' ? '通过' : '拒绝' }}理由</view>
        <textarea
          class="modal-textarea"
          v-model="reasonPopup.reason"
          :placeholder="reasonPopup.type === 'approve' ? '如：识别准确，已加入参考库' : '请说明拒绝原因'"
          maxlength="200"
        />
        <view class="modal-btns">
          <view class="modal-btn cancel" @click="closeReason">取消</view>
          <view
            class="modal-btn confirm"
            :class="reasonPopup.type === 'approve' ? 'confirm-approve' : 'confirm-reject'"
            @click="submitReview"
          >确定</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { reviewApi, getImageUrl } from '@/api/index.js'

export default {
  data() {
    return {
      currentTab: 'pending',
      tabs: [
        { key: 'pending', label: '待审核' },
        { key: 'approved', label: '已通过' },
        { key: 'rejected', label: '已拒绝' }
      ],
      stats: {},
      list: [],
      page: 1,
      loading: false,
      reasonPopup: {
        show: false,
        type: 'approve',
        id: null,
        reason: ''
      }
    }
  },
  computed: {
    currentTabLabel() {
      const tab = this.tabs.find(t => t.key === this.currentTab)
      return tab ? tab.label : ''
    }
  },
  onLoad() {
    this.loadStats()
    this.loadList()
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    getImageUrl(item) {
      const raw = item.image_path || item.imageUrl || item.image || ''
      if (!raw) return ''
      if (raw.startsWith('http') || raw.startsWith('data:')) return raw
      const filename = raw.replace(/.*feedback[/\\]/, '')
      return getImageUrl('/uploads/feedback/' + filename)
    },
    async loadStats() {
      try {
        this.stats = await reviewApi.getStats() || {}
      } catch (e) {
        console.error('加载统计失败', e)
      }
    },
    async loadList() {
      if (this.loading) return
      this.loading = true
      try {
        const res = await reviewApi.getPendingList(this.page)
        this.list = Array.isArray(res) ? res : (res && res.list) || []
      } catch (e) {
        console.error('加载审核列表失败', e)
      } finally {
        this.loading = false
      }
    },
    switchTab(key) {
      if (this.currentTab === key) return
      this.currentTab = key
      this.page = 1
      this.loadList()
    },
    formatTime(time) {
      if (!time) return '-'
      return String(time).replace('T', ' ').substring(0, 16)
    },
    formatAccuracy(val) {
      const num = Number(val)
      if (isNaN(num)) return val
      if (num <= 1) return (num * 100).toFixed(1) + '%'
      return num.toFixed(1) + '%'
    },
    previewImage(item) {
      const url = this.getImageUrl(item)
      if (!url) return
      uni.previewImage({ urls: [url], current: url })
    },
    openReason(item, type) {
      this.reasonPopup.show = true
      this.reasonPopup.type = type
      this.reasonPopup.id = item.id
      this.reasonPopup.reason = ''
    },
    closeReason() {
      this.reasonPopup.show = false
      this.reasonPopup.reason = ''
    },
    async submitReview() {
      const reason = (this.reasonPopup.reason || '').trim()
      if (!reason) {
        uni.showToast({ title: '请填写审核理由', icon: 'none' })
        return
      }
      const id = this.reasonPopup.id
      const type = this.reasonPopup.type
      try {
        if (type === 'approve') {
          await reviewApi.approve(id, { reviewerNote: reason })
          uni.showToast({ title: '已通过并入库', icon: 'success' })
        } else {
          await reviewApi.reject(id, { reviewerNote: reason })
          uni.showToast({ title: '已拒绝', icon: 'none' })
        }
        this.closeReason()
        this.list = this.list.filter(i => i.id !== id)
        await this.loadStats()
        if (this.list.length === 0) {
          this.loadList()
        }
      } catch (e) {
        console.error('审核操作失败', e)
      }
    }
  }
}
</script>

<style>
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
}

.nav-bar .back {
  width: 80rpx;
  font-size: 40rpx;
}

.nav-bar .title {
  font-size: 36rpx;
  font-weight: 600;
}

.nav-bar .nav-right {
  width: 80rpx;
}

.review-content {
  padding: 24rpx 32rpx 48rpx;
}

.stats-row {
  display: flex;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.stats-card {
  flex: 1;
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx 12rpx;
  text-align: center;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  border: 2rpx solid transparent;
}

.stats-card.active {
  border-color: #2d8b5e;
  background: rgba(45, 139, 94, 0.06);
}

.stats-num {
  font-size: 40rpx;
  font-weight: 700;
  margin-bottom: 6rpx;
}

.stats-num.pending {
  color: #F59E0B;
}

.stats-num.approved {
  color: #2d8b5e;
}

.stats-num.rejected {
  color: #dc2626;
}

.stats-label {
  font-size: 24rpx;
  color: #999;
}

.tab-bar {
  display: flex;
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 8rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 18rpx 0;
  font-size: 28rpx;
  color: #666;
  border-radius: 12rpx;
}

.tab-item.active {
  color: #FFFFFF;
  background: linear-gradient(135deg, #2d8b5e, #3da878);
  font-weight: 600;
}

.review-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.review-card {
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.card-top {
  display: flex;
  gap: 20rpx;
}

.card-image-wrap {
  width: 160rpx;
  height: 160rpx;
  flex-shrink: 0;
  border-radius: 14rpx;
  overflow: hidden;
  background: #f8fafc;
}

.card-image {
  width: 100%;
  height: 100%;
}

.card-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10rpx;
}

.result-row {
  display: flex;
  align-items: flex-start;
}

.row-label {
  width: 130rpx;
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
  gap: 10rpx;
}

.feedback-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #2d8b5e;
}

.ai-name {
  font-size: 28rpx;
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

.meta-text {
  font-size: 24rpx;
  color: #666;
}

.card-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 24rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f9f4;
}

.action-btn {
  flex: 1;
  text-align: center;
  padding: 18rpx 0;
  border-radius: 9999rpx;
  font-size: 28rpx;
  font-weight: 600;
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

.card-footer {
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f9f4;
}

.review-time {
  font-size: 24rpx;
  color: #999;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 160rpx 0;
}

.empty-icon {
  font-size: 96rpx;
  margin-bottom: 20rpx;
}

.empty-title {
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
  to {
    transform: rotate(360deg);
  }
}

.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-card {
  width: 600rpx;
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 36rpx 32rpx;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  text-align: center;
  margin-bottom: 12rpx;
}

.modal-desc {
  font-size: 24rpx;
  color: #999;
  text-align: center;
  margin-bottom: 24rpx;
}

.modal-textarea {
  width: 100%;
  min-height: 160rpx;
  padding: 20rpx 24rpx;
  background: #f8fafc;
  border: 1rpx solid #e2e8f0;
  border-radius: 12rpx;
  font-size: 28rpx;
  box-sizing: border-box;
  margin-bottom: 24rpx;
}

.modal-btns {
  display: flex;
  gap: 20rpx;
}

.modal-btn {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
  border-radius: 9999rpx;
  font-size: 28rpx;
  font-weight: 600;
}

.modal-btn.cancel {
  background: #f1f5f9;
  color: #666;
}

.modal-btn.confirm-approve {
  background: linear-gradient(135deg, #2d8b5e, #3da878);
  color: #FFFFFF;
}

.modal-btn.confirm-reject {
  background: linear-gradient(135deg, #dc2626, #ef4444);
  color: #FFFFFF;
}
</style>
