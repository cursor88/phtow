<template>
  <view class="custom-tabbar">
    <view
      class="tab-item"
      v-for="item in tabs"
      :key="item.path"
      :class="{ active: current === item.key }"
      @click="switchTab(item)"
    >
      <text class="tab-icon">{{ item.icon }}</text>
      <text class="tab-text">{{ item.text }}</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'custom-tabbar',
  props: {
    current: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      tabs: [
        { key: 'home',     path: '/pages/index/index',         icon: '🏠', text: '首页' },
        { key: 'identify', path: '/pages/identify/identify',   icon: '🔍', text: '识别' },
        { key: 'herb',     path: '/pages/herb-list/herb-list', icon: '🌿', text: '图鉴' },
        { key: 'match',    path: '/pages/match/match',         icon: '🍲', text: '药食同源' },
        { key: 'mine',     path: '/pages/mine/mine',           icon: '👤', text: '我的' }
      ]
    }
  },
  methods: {
    switchTab(item) {
      if (this.current === item.key) return
      uni.switchTab({ url: item.path })
    }
  }
}
</script>

<style scoped>
.custom-tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(245, 241, 232, 0.95);
  backdrop-filter: blur(10px);
  border-top: 1rpx solid rgba(180, 170, 150, 0.25);
  display: flex;
  justify-content: space-around;
  padding: 12rpx 0 16rpx;
  box-shadow: 0 -2rpx 12rpx rgba(180, 170, 150, 0.08);
  z-index: 50;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", "Microsoft YaHei", sans-serif;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8rpx 16rpx;
  border-radius: 12rpx;
  transition: all 0.2s;
}

.tab-item:active {
  background: rgba(180, 170, 150, 0.1);
}

.tab-icon {
  font-size: 40rpx;
  margin-bottom: 4rpx;
  line-height: 1.2;
}

.tab-text {
  font-size: 20rpx;
  color: #8B8680;
  letter-spacing: 1rpx;
}

.tab-item.active .tab-text {
  color: #3D3D3D;
  font-weight: 500;
}

.tab-item.active {
  background: rgba(140, 160, 130, 0.1);
}
</style>
