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
  background: #fff;
  display: flex;
  justify-content: space-around;
  padding: 8px 0 12px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 50;
  /* 兼容 iPhone X 底部安全区 */
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.tab-icon {
  font-size: 22px;
  margin-bottom: 2px;
  line-height: 1.2;
}

.tab-text {
  font-size: 11px;
  color: #999;
}

.tab-item.active .tab-text {
  color: #2d8b5e;
  font-weight: 500;
}
</style>
