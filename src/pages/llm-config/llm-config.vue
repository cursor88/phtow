<template>
  <view class="page">
    <view class="nav-bar">
      <view class="back" @click="goBack">
        <text>←</text>
      </view>
      <text class="title">AI模型配置</text>
      <view class="nav-right"></view>
    </view>

    <view class="config-content">
      <!-- 当前AI模式 -->
      <view class="config-card">
        <view class="section-title">当前AI模式</view>
        <view class="status-box">
          <view class="status-dot" :class="statusEnabled ? 'enabled' : 'disabled'"></view>
          <view class="status-info">
            <view class="status-mode" :style="{ color: statusEnabled ? '#2d8b5e' : '#F59E0B' }">{{ statusMode }}</view>
            <view class="status-detail">{{ statusDetail }}</view>
          </view>
        </view>
      </view>

      <!-- 预设提供商 -->
      <view class="config-card">
        <view class="card-head">
          <view class="section-title head-title">📋 预设提供商</view>
          <view class="refresh-btn" @click="loadPresets">刷新列表</view>
        </view>
        <view class="preset-list">
          <view class="preset-item" v-for="item in presets" :key="item.key || item.id">
            <view class="preset-header" @click="togglePreset(item)">
              <view class="preset-info">
                <view class="preset-name">{{ item.name }}</view>
                <view class="preset-desc">{{ item.model || item.description || '' }}</view>
              </view>
              <text class="preset-arrow">{{ expandedPreset === (item.key || item.id) ? '▲' : '▼' }}</text>
            </view>
            <view class="preset-expand" v-if="expandedPreset === (item.key || item.id)">
              <input
                class="form-input"
                password
                v-model="presetKeys[item.key || item.id]"
                placeholder="请输入 API Key"
              />
              <view class="preset-btns">
                <view class="cancel-btn" @click="cancelPreset">取消</view>
                <view class="primary-btn preset-confirm" @click="enablePreset(item)">启用</view>
              </view>
            </view>
          </view>
          <view class="empty-tip" v-if="presets.length === 0">暂无预设提供商</view>
        </view>
      </view>

      <!-- 自定义配置 -->
      <view class="config-card">
        <view class="section-title">➕ 自定义配置</view>
        <view class="form-list">
          <view class="form-item">
            <text class="form-label">提供商名称</text>
            <input class="form-input" type="text" v-model="customForm.name" placeholder="如：我的LLM" />
          </view>
          <view class="form-item">
            <text class="form-label">API Key</text>
            <input class="form-input" password v-model="customForm.apiKey" placeholder="请输入 API Key" />
          </view>
          <view class="form-item">
            <text class="form-label">API 地址</text>
            <input class="form-input" type="text" v-model="customForm.apiBase" placeholder="如：https://api.example.com/v1" />
          </view>
          <view class="form-item">
            <text class="form-label">模型名称</text>
            <input class="form-input" type="text" v-model="customForm.model" placeholder="如：my-model" />
          </view>
          <button class="primary-btn" @click="saveCustomProvider">添加并启用</button>
        </view>
      </view>

      <!-- 已配置的提供商 -->
      <view class="config-card">
        <view class="section-title">已配置的提供商</view>
        <view class="provider-list">
          <view class="provider-item" :class="{ active: item.isActive || item.active }" v-for="item in providers" :key="item.key || item.id">
            <view class="provider-info" @click="activateProvider(item)">
              <view class="provider-name">
                {{ item.name }}
                <text class="active-tag" v-if="item.isActive || item.active">已启用</text>
              </view>
              <view class="provider-meta">{{ item.model }}<text v-if="item.apiBase"> · {{ item.apiBase }}</text></view>
            </view>
            <view class="provider-ops">
              <view class="provider-action" v-if="!(item.isActive || item.active)" @click="activateProvider(item)">启用</view>
              <view class="provider-del" @click="confirmDelete(item)">删除</view>
            </view>
          </view>
          <view class="empty-tip" v-if="providers.length === 0">暂无已配置的提供商</view>
        </view>
      </view>

      <!-- 检查状态 -->
      <view class="check-area">
        <button class="primary-btn" :disabled="checking" @click="checkStatus">
          {{ checking ? '⏳ 检查中...' : '🔍 测试连接' }}
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import { llmConfigApi } from '@/api/index.js'

export default {
  data() {
    return {
      status: null,
      presets: [],
      providers: [],
      expandedPreset: null,
      presetKeys: {},
      checking: false,
      customForm: {
        name: '',
        apiKey: '',
        apiBase: '',
        model: ''
      }
    }
  },
  computed: {
    statusEnabled() {
      return !!(this.status && this.status.enabled)
    },
    statusMode() {
      return this.statusEnabled ? 'AI增强模式' : '本地知识库模式'
    },
    statusDetail() {
      if (this.statusEnabled) {
        const provider = (this.status && this.status.provider) || ''
        const model = (this.status && this.status.model) || ''
        const text = [provider, model].filter(Boolean).join(' ')
        return text ? text + ' - 运行正常' : 'AI识别已就绪'
      }
      return '未配置API Key，解锁AI增强功能'
    }
  },
  onLoad() {
    this.loadStatus()
    this.loadPresets()
    this.loadProviders()
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    async loadStatus() {
      try {
        this.status = await llmConfigApi.getStatus()
      } catch (e) {
        console.error('加载状态失败', e)
      }
    },
    async loadPresets() {
      try {
        const res = await llmConfigApi.getPresets()
        if (Array.isArray(res)) {
          this.presets = res
        } else if (res && Array.isArray(res.presets)) {
          this.presets = res.presets
        } else {
          this.presets = []
        }
      } catch (e) {
        console.error('加载预设失败', e)
      }
    },
    async loadProviders() {
      try {
        const res = await llmConfigApi.getProviders()
        let list = []
        if (Array.isArray(res)) {
          list = res
        } else if (res && Array.isArray(res.providers)) {
          list = res.providers
          if (res.enabled !== undefined && !this.status) {
            this.status = res
          }
        }
        this.providers = list
      } catch (e) {
        console.error('加载提供商失败', e)
      }
    },
    togglePreset(item) {
      const key = item.key || item.id
      this.expandedPreset = this.expandedPreset === key ? null : key
    },
    cancelPreset() {
      this.expandedPreset = null
    },
    async enablePreset(preset) {
      const key = preset.key || preset.id
      const apiKey = this.presetKeys[key]
      if (!apiKey) {
        uni.showToast({ title: '请输入 API Key', icon: 'none' })
        return
      }
      try {
        await llmConfigApi.saveProvider({
          name: preset.name,
          apiKey: apiKey,
          apiBase: preset.apiBase || preset.base_url || '',
          model: preset.model || '',
          presetKey: key
        })
        uni.showToast({ title: '启用成功', icon: 'success' })
        this.expandedPreset = null
        this.presetKeys[key] = ''
        await this.loadProviders()
        await this.loadStatus()
      } catch (e) {
        console.error('启用失败', e)
      }
    },
    async saveCustomProvider() {
      if (!this.customForm.name || !this.customForm.apiKey) {
        uni.showToast({ title: '请填写名称和API Key', icon: 'none' })
        return
      }
      try {
        await llmConfigApi.saveProvider({
          name: this.customForm.name,
          apiKey: this.customForm.apiKey,
          apiBase: this.customForm.apiBase,
          model: this.customForm.model
        })
        uni.showToast({ title: '添加成功', icon: 'success' })
        this.customForm = { name: '', apiKey: '', apiBase: '', model: '' }
        await this.loadProviders()
        await this.loadStatus()
      } catch (e) {
        console.error('添加失败', e)
      }
    },
    async activateProvider(item) {
      if (item.isActive || item.active) return
      const id = item.key || item.id
      try {
        await llmConfigApi.setActiveProvider(id)
        uni.showToast({ title: '已切换', icon: 'success' })
        await this.loadProviders()
        await this.loadStatus()
      } catch (e) {
        console.error('切换失败', e)
      }
    },
    confirmDelete(item) {
      const id = item.key || item.id
      uni.showModal({
        title: '提示',
        content: '确定删除该提供商配置吗？',
        confirmColor: '#dc2626',
        success: (res) => {
          if (res.confirm) {
            this.deleteProvider(id)
          }
        }
      })
    },
    async deleteProvider(id) {
      try {
        await llmConfigApi.deleteProvider(id)
        uni.showToast({ title: '已删除', icon: 'success' })
        await this.loadProviders()
        await this.loadStatus()
      } catch (e) {
        console.error('删除失败', e)
      }
    },
    async checkStatus() {
      if (this.checking) return
      this.checking = true
      try {
        const res = await llmConfigApi.checkStatus()
        await this.loadStatus()
        const msg = (res && res.message) ? res.message : (this.statusEnabled ? 'AI连接正常' : '当前为本地模式')
        uni.showToast({ title: msg, icon: 'none' })
      } catch (e) {
        console.error('检查状态失败', e)
      } finally {
        this.checking = false
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

.config-content {
  padding: 24rpx 32rpx 48rpx;
}

.config-card {
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 28rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.head-title {
  margin-bottom: 0;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #2d8b5e;
  margin-bottom: 16rpx;
}

.refresh-btn {
  font-size: 24rpx;
  color: #2d8b5e;
  background: rgba(45, 139, 94, 0.1);
  padding: 8rpx 24rpx;
  border-radius: 24rpx;
}

.status-box {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background: #f8fafc;
  border-radius: 16rpx;
}

.status-dot {
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.status-dot.enabled {
  background: #2d8b5e;
  box-shadow: 0 0 0 6rpx rgba(45, 139, 94, 0.15);
}

.status-dot.disabled {
  background: #F59E0B;
  box-shadow: 0 0 0 6rpx rgba(245, 158, 11, 0.15);
}

.status-info {
  flex: 1;
}

.status-mode {
  font-size: 28rpx;
  font-weight: 600;
}

.status-detail {
  font-size: 24rpx;
  color: #999;
  margin-top: 4rpx;
}

.preset-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.preset-item {
  background: #f8fafc;
  border-radius: 14rpx;
  overflow: hidden;
}

.preset-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 24rpx;
}

.preset-info {
  flex: 1;
}

.preset-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.preset-desc {
  font-size: 24rpx;
  color: #999;
  margin-top: 4rpx;
}

.preset-arrow {
  font-size: 22rpx;
  color: #999;
}

.preset-expand {
  padding: 0 24rpx 20rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.preset-btns {
  display: flex;
  gap: 16rpx;
}

.cancel-btn {
  flex: 1;
  text-align: center;
  padding: 18rpx 0;
  background: #f1f5f9;
  color: #666;
  border-radius: 9999rpx;
  font-size: 28rpx;
}

.preset-confirm {
  flex: 1;
  margin-top: 0;
}

.form-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.form-label {
  font-size: 26rpx;
  font-weight: 500;
  color: #334155;
  margin-bottom: 4rpx;
}

.form-input {
  width: 100%;
  min-height: 96rpx;
  height: 96rpx;
  padding: 24rpx 28rpx;
  background: #f8fafc;
  border: 1rpx solid #e2e8f0;
  border-radius: 12rpx;
  font-size: 30rpx;
  line-height: 96rpx;
  box-sizing: border-box;
}

.primary-btn {
  width: 100%;
  background: linear-gradient(135deg, #2d8b5e, #3da878);
  color: #FFFFFF;
  border: none;
  border-radius: 9999rpx;
  font-size: 30rpx;
  font-weight: 600;
  padding: 22rpx 0;
  margin-top: 8rpx;
  line-height: 1.4;
}

.primary-btn::after {
  border: none;
}

.primary-btn[disabled] {
  opacity: 0.6;
}

.provider-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.provider-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 24rpx;
  background: #f8fafc;
  border-radius: 14rpx;
  border: 1rpx solid #e2e8f0;
}

.provider-item.active {
  border-color: #2d8b5e;
  background: rgba(45, 139, 94, 0.05);
}

.provider-info {
  flex: 1;
}

.provider-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.active-tag {
  display: inline-block;
  margin-left: 12rpx;
  font-size: 20rpx;
  color: #2d8b5e;
  background: rgba(45, 139, 94, 0.1);
  padding: 2rpx 14rpx;
  border-radius: 20rpx;
  font-weight: 500;
}

.provider-meta {
  font-size: 22rpx;
  color: #999;
  margin-top: 4rpx;
}

.provider-ops {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.provider-action {
  padding: 8rpx 24rpx;
  background: #FFFFFF;
  color: #2d8b5e;
  border: 1rpx solid #2d8b5e;
  border-radius: 24rpx;
  font-size: 24rpx;
}

.provider-del {
  padding: 8rpx 24rpx;
  background: rgba(220, 38, 38, 0.08);
  color: #dc2626;
  border-radius: 24rpx;
  font-size: 24rpx;
}

.empty-tip {
  text-align: center;
  font-size: 24rpx;
  color: #999;
  padding: 20rpx 0;
}

.check-area {
  margin-top: 16rpx;
}
</style>
