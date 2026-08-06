<template>
  <view class="page">
    <view class="identify-container">
      <!-- 预览区 -->
      <view class="preview-area" v-if="imagePath">
        <image class="preview-img" :src="imagePath" mode="aspectFit"></image>
        <view class="preview-mask" v-if="identifying">
          <view class="loading-spinner"></view>
          <text class="loading-text">AI 识别中...</text>
          <text class="loading-sub">正在分析药材特征</text>
        </view>
      </view>
      <view class="placeholder-area" v-else @click="chooseImage">
        <view class="placeholder-icon">📸</view>
        <view class="placeholder-text">选择图片开始识别</view>
        <view class="placeholder-desc">支持拍照或从相册选择药材图片</view>
      </view>

      <!-- 操作按钮 -->
      <view class="action-btns" v-if="!identifying">
        <button class="primary-btn" @click="takePhoto">
          <text class="btn-icon">📷</text>
          <text>拍照识别</text>
        </button>
        <button class="secondary-btn" @click="chooseImage">
          <text class="btn-icon">🖼️</text>
          <text>相册选择</text>
        </button>
      </view>

      <!-- 识别结果 -->
      <view class="result-area" v-if="result && !identifying">
        <!-- 主结果卡片，整体可点击跳转详情 -->
        <view class="result-card" @click="goToDetail">
          <view class="result-header">
            <view class="result-name">{{ result.name }}</view>
            <view class="result-accuracy">{{ formatAccuracy(result.accuracy) }}%</view>
          </view>
          <view class="result-pinyin" v-if="result.pinyin">{{ result.pinyin }}</view>
          <view class="result-source">
            <text class="source-tag">来源：{{ sourceText }}</text>
          </view>
          <view class="result-category" v-if="result.category">
            <text class="tag">{{ result.category }}</text>
          </view>
          <view class="result-effect" v-if="result.effect">
            <view class="result-label">功效</view>
            <view class="result-value">{{ result.effect }}</view>
          </view>

          <!-- 关键鉴别点 -->
          <view class="key-identification" v-if="keyIdRows.length">
            <view class="ki-title">关键鉴别点</view>
            <view class="ki-row" v-for="row in keyIdRows" :key="row.label">
              <text class="ki-label">{{ row.label }}</text>
              <text class="ki-value">{{ row.value }}</text>
            </view>
          </view>

          <view class="detail-entry">
            <text>查看药材详情</text>
            <text class="arrow">→</text>
          </view>
        </view>

        <!-- 其他可能结果 -->
        <view class="alternatives" v-if="alternatives.length">
          <view class="alt-title">其他可能结果</view>
          <view
            class="alt-item"
            v-for="(alt, idx) in alternatives"
            :key="idx"
            @click="goToAltDetail(alt)"
          >
            <view class="alt-icon">🌿</view>
            <view class="alt-info">
              <view class="alt-name">{{ alt.name }}</view>
              <view class="alt-ki" v-if="altKiText(alt)">{{ altKiText(alt) }}</view>
            </view>
            <view class="alt-prob">{{ formatAccuracy(alt.probability || alt.accuracy) }}%</view>
          </view>
        </view>

        <!-- 识别有误反馈 -->
        <view class="feedback-btn" @click="goFeedback">识别有误？帮助改进</view>
      </view>

      <!-- 识别小贴士 -->
      <view class="tips-area card" v-if="!imagePath">
        <view class="section-title">识别小贴士</view>
        <view class="tip-list">
          <view class="tip-item">
            <text class="tip-num">1</text>
            <text class="tip-text">确保光线充足，药材清晰可见</text>
          </view>
          <view class="tip-item">
            <text class="tip-num">2</text>
            <text class="tip-text">尽量拍摄药材完整形态</text>
          </view>
          <view class="tip-item">
            <text class="tip-num">3</text>
            <text class="tip-text">背景简洁，避免杂物干扰</text>
          </view>
          <view class="tip-item">
            <text class="tip-num">4</text>
            <text class="tip-text">仅供参考，用药请遵医嘱</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 识别有误反馈弹窗 -->
    <view class="feedback-modal" v-if="showFeedbackModal" @click="closeFeedbackModal">
      <view class="feedback-content" @click.stop>
        <view class="feedback-header">
          <view class="feedback-close" @click="closeFeedbackModal">×</view>
          <view class="feedback-icon">📝</view>
          <view class="feedback-title">帮助改进识别</view>
          <view class="feedback-subtitle">您的反馈将帮助我们提升识别准确率</view>
        </view>
        <view class="feedback-body">
          <view class="fb-original">
            AI识别结果：<text class="fb-original-name">{{ result ? result.name : '-' }}</text>
          </view>
          <view class="fb-field">
            <view class="fb-label">请选择或输入正确的药材</view>
            <view class="fb-search-wrap">
              <text class="fb-search-icon">🔍</text>
              <input class="fb-search-input" type="text" placeholder="输入药材名称搜索或直接输入" v-model="feedbackKeyword" @input="filterFeedbackHerbs" />
            </view>
            <scroll-view class="fb-herb-list" scroll-y="true" v-if="filteredHerbs.length">
              <view
                class="fb-herb-chip"
                :class="{ active: selectedFeedbackHerb && selectedFeedbackHerb.id === herb.id }"
                v-for="herb in filteredHerbs"
                :key="herb.id"
                @click="selectFeedbackHerb(herb)"
              >
                {{ herb.name }}
              </view>
            </scroll-view>
            <view class="fb-empty" v-else-if="feedbackKeyword">
              <view class="fb-empty-tip">未找到匹配药材，将作为自定义名称提交</view>
              <input class="fb-custom-input" type="text" v-model="customHerbName" placeholder="请输入药材名称" />
            </view>
          </view>
          <view class="fb-field">
            <view class="fb-label">补充说明（选填）</view>
            <textarea class="fb-note" placeholder="如：这是野生/栽培品、不同产地等" v-model="feedbackNote" />
          </view>
          <button class="fb-submit-btn" @click="submitFeedback" :disabled="submitting">
            {{ submitting ? '提交中...' : '提交反馈' }}
          </button>
        </view>
      </view>
    </view>
    <custom-tabbar current="identify"></custom-tabbar>
  </view>
</template>

<script>
import { herbApi, feedbackApi } from '@/api/index.js'
import customTabbar from '@/components/custom-tabbar/custom-tabbar.vue'

export default {
  components: { customTabbar },
  data() {
    return {
      imagePath: '',
      identifying: false,
      result: null,
      hasNavigated: false,
      showFeedbackModal: false,
      feedbackKeyword: '',
      customHerbName: '',
      feedbackNote: '',
      selectedFeedbackHerb: null,
      allHerbs: [],
      filteredHerbs: [],
      submitting: false
    }
  },
  computed: {
    sourceText() {
      if (!this.result) return ''
      const s = this.result.source
      if (s === 'ai') return 'AI 模型识别'
      if (s === 'image-search') return '图像检索'
      return '本地识别'
    },
    keyIdRows() {
      if (!this.result || !this.result.key_identification) return []
      const ki = this.result.key_identification
      if (typeof ki === 'string') {
        return [{ label: '特征', value: ki }]
      }
      const labels = { smell: '气味', odor: '气味', texture: '质地', cross_section: '截面', outer_skin: '外皮', other: '其他' }
      const rows = []
      Object.keys(ki).forEach(k => {
        if (ki[k] && labels[k]) {
          rows.push({ label: labels[k], value: ki[k] })
        }
      })
      return rows
    },
    alternatives() {
      if (!this.result || !this.result.alternatives) return []
      return this.result.alternatives.filter(a => a && a.name)
    }
  },
  onLoad(options) {
    if (options.image) {
      this.imagePath = decodeURIComponent(options.image)
      setTimeout(() => {
        this.doIdentify()
      }, 300)
    }
  },
  onShow() {
    uni.hideTabBar()
    // 检查是否有来自首页的待识别图片
    const pendingImage = uni.getStorageSync('pendingIdentifyImage')
    if (pendingImage) {
      uni.removeStorageSync('pendingIdentifyImage')
      this.imagePath = pendingImage
      this.result = null
      setTimeout(() => {
        this.doIdentify()
      }, 200)
    }
    // 从详情页返回时不清空结果，保留识别记录
    if (this.hasNavigated) {
      this.hasNavigated = false
    }
  },
  methods: {
    takePhoto() {
      uni.chooseImage({
        count: 1,
        sourceType: ['camera'],
        success: (res) => {
          this.imagePath = res.tempFilePaths[0]
          this.result = null
          this.doIdentify()
        }
      })
    },
    chooseImage() {
      uni.chooseImage({
        count: 1,
        sourceType: ['album'],
        success: (res) => {
          this.imagePath = res.tempFilePaths[0]
          this.result = null
          this.doIdentify()
        }
      })
    },
    async doIdentify() {
      this.identifying = true
      this.result = null
      try {
        const res = await herbApi.identify(this.imagePath)
        this.result = res
      } catch (e) {
        console.error('识别失败', e)
        uni.showToast({ title: '识别失败，请重试', icon: 'none' })
      } finally {
        this.identifying = false
      }
    },
    formatAccuracy(val) {
      if (val == null) return '--'
      const num = Number(val)
      if (num <= 1) return (num * 100).toFixed(0)
      return num.toFixed(0)
    },
    altKiText(alt) {
      if (!alt.key_identification) return ''
      const ki = alt.key_identification
      if (typeof ki === 'string') return ki
      const parts = []
      if (ki.smell) parts.push('气味:' + ki.smell)
      if (ki.odor) parts.push('气味:' + ki.odor)
      if (ki.texture) parts.push('质地:' + ki.texture)
      if (ki.cross_section) parts.push('截面:' + ki.cross_section)
      return parts.join(' ')
    },
    goToDetail() {
      if (!this.result || !this.result.id) {
        uni.showToast({ title: '无法获取药材详情', icon: 'none' })
        return
      }
      this.hasNavigated = true
      uni.navigateTo({
        url: `/pages/detail/detail?id=${this.result.id}&image=${encodeURIComponent(this.imagePath)}`
      })
    },
    goToAltDetail(alt) {
      const id = alt.herbId || alt.id
      if (!id) {
        uni.showToast({ title: '暂无详情', icon: 'none' })
        return
      }
      this.hasNavigated = true
      uni.navigateTo({
        url: `/pages/detail/detail?id=${id}`
      })
    },
    goFeedback() {
      if (!this.imagePath) {
        uni.showToast({ title: '请先识别药材', icon: 'none' })
        return
      }
      this.feedbackKeyword = ''
      this.customHerbName = ''
      this.feedbackNote = ''
      this.selectedFeedbackHerb = null
      this.showFeedbackModal = true
      this.loadAllHerbs()
    },
    async loadAllHerbs() {
      if (this.allHerbs.length > 0) {
        this.filteredHerbs = this.allHerbs.slice(0, 30)
        return
      }
      try {
        const res = await herbApi.getList({ page: 1, pageSize: 500 })
        this.allHerbs = res.list || []
        this.filteredHerbs = this.allHerbs.slice(0, 30)
      } catch (e) {
        console.error('加载药材列表失败', e)
        this.filteredHerbs = []
      }
    },
    filterFeedbackHerbs() {
      const kw = this.feedbackKeyword.trim()
      if (!kw) {
        this.filteredHerbs = this.allHerbs.slice(0, 30)
        this.selectedFeedbackHerb = null
        this.customHerbName = ''
        return
      }
      this.filteredHerbs = this.allHerbs.filter(h => h.name && h.name.indexOf(kw) > -1).slice(0, 30)
      this.selectedFeedbackHerb = null
      if (this.filteredHerbs.length === 0) {
        this.customHerbName = kw
      } else {
        this.customHerbName = ''
      }
    },
    selectFeedbackHerb(herb) {
      this.selectedFeedbackHerb = herb
      this.feedbackKeyword = herb.name
      this.customHerbName = ''
    },
    closeFeedbackModal() {
      this.showFeedbackModal = false
    },
    async submitFeedback() {
      if (this.submitting) return
      const herbId = this.selectedFeedbackHerb ? this.selectedFeedbackHerb.id : 0
      const herbName = this.selectedFeedbackHerb ? this.selectedFeedbackHerb.name : this.customHerbName.trim()
      if (!herbName) {
        uni.showToast({ title: '请选择或输入正确的药材', icon: 'none' })
        return
      }
      if (!this.imagePath) {
        uni.showToast({ title: '图片数据丢失，请重新上传', icon: 'none' })
        return
      }
      this.submitting = true
      try {
        await feedbackApi.submitCorrection(this.imagePath, {
          herbId,
          herbName,
          originalResult: this.result ? this.result.name : '',
          note: this.feedbackNote
        })
        uni.showToast({ title: '感谢您的反馈！审核通过后将入库', icon: 'none' })
        this.closeFeedbackModal()
      } catch (e) {
        console.error('提交反馈失败', e)
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

<style>
.page {
  min-height: 100vh;
  background: #F5F1E8;
  padding-bottom: 70px;
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", "Microsoft YaHei", sans-serif;
}

.identify-container {
  padding: 24rpx;
}

/* 预览区 */
.preview-area {
  position: relative;
  width: 100%;
  height: 500rpx;
  background: #000;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 32rpx;
}

.preview-img {
  width: 100%;
  height: 100%;
}

.preview-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
  border-top-color: #8CA082;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20rpx;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  color: #fff;
  font-size: 28rpx;
  margin-bottom: 8rpx;
}

.loading-sub {
  color: rgba(255, 255, 255, 0.7);
  font-size: 24rpx;
}

/* 占位区 */
.placeholder-area {
  width: 100%;
  height: 500rpx;
  background: linear-gradient(135deg, #e8f5ee 0%, #d4efdf 100%);
  border-radius: 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 32rpx;
  border: 3rpx dashed #8CA082;
}

.placeholder-icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
}

.placeholder-text {
  font-size: 32rpx;
  color: #8CA082;
  font-weight: 500;
  margin-bottom: 12rpx;
}

.placeholder-desc {
  font-size: 24rpx;
  color: #666;
}

/* 操作按钮 */
.action-btns {
  display: flex;
  flex-direction: row;
  gap: 20rpx;
  margin-bottom: 24rpx;
}

.primary-btn {
  flex: 1;
  background: linear-gradient(135deg, #8CA082 0%, #a8bd9c 100%);
  color: #fff;
  border-radius: 50rpx;
  font-size: 30rpx;
  padding: 22rpx 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  margin: 0;
  line-height: 1.5;
}

.primary-btn::after {
  border: none;
}

.btn-icon {
  margin-right: 8rpx;
  font-size: 30rpx;
}

.secondary-btn {
  flex: 1;
  background: rgba(255, 255, 255, 0.7);
  color: #8CA082;
  border: 2rpx solid #8CA082;
  border-radius: 50rpx;
  font-size: 30rpx;
  padding: 20rpx 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  line-height: 1.5;
}

.secondary-btn::after {
  border: none;
}

/* 结果区 */
.result-area {
  margin-bottom: 24rpx;
}

.result-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border: 1rpx solid rgba(180, 170, 150, 0.25);
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.result-name {
  font-size: 40rpx;
  font-weight: 700;
  color: #8CA082;
}

.result-accuracy {
  font-size: 26rpx;
  color: #f59e0b;
  background: #fef3c7;
  padding: 6rpx 16rpx;
  border-radius: 16rpx;
  font-weight: 600;
}

.result-pinyin {
  font-size: 26rpx;
  color: #999;
  margin-bottom: 12rpx;
}

.result-source {
  margin-bottom: 16rpx;
}

.source-tag {
  font-size: 22rpx;
  color: #999;
}

.result-category {
  margin-bottom: 20rpx;
}

.tag {
  display: inline-block;
  padding: 8rpx 20rpx;
  background: #e8f5ee;
  color: #8CA082;
  border-radius: 16rpx;
  font-size: 24rpx;
}

.result-effect {
  background: #f9fafb;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.result-label {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 8rpx;
  font-weight: 500;
}

.result-value {
  font-size: 28rpx;
  color: #3D3D3D;
  line-height: 1.6;
}

/* 关键鉴别点 */
.key-identification {
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f9f4;
}

.ki-title {
  font-size: 26rpx;
  font-weight: 600;
  color: #8CA082;
  margin-bottom: 12rpx;
}

.ki-row {
  display: flex;
  padding: 6rpx 0;
}

.ki-label {
  width: 100rpx;
  font-size: 24rpx;
  color: #8CA082;
  font-weight: 500;
  flex-shrink: 0;
}

.ki-value {
  font-size: 24rpx;
  color: #666;
  flex: 1;
}

/* 进入详情入口 */
.detail-entry {
  margin-top: 24rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 28rpx;
  color: #8CA082;
  font-weight: 500;
}

.arrow {
  font-size: 32rpx;
}

/* 其他可能结果 */
.alternatives {
  margin-top: 24rpx;
}

.alt-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #3D3D3D;
  margin-bottom: 16rpx;
}

.alt-item {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border: 1rpx solid rgba(180, 170, 150, 0.25);
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 12rpx;
  box-shadow: 0 1rpx 4rpx rgba(0, 0, 0, 0.03);
}

.alt-icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: 12rpx;
  background: #f0f9f4;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  margin-right: 16rpx;
  flex-shrink: 0;
}

.alt-info {
  flex: 1;
  min-width: 0;
}

.alt-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #3D3D3D;
  margin-bottom: 4rpx;
}

.alt-ki {
  font-size: 22rpx;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.alt-prob {
  color: #f59e0b;
  font-size: 28rpx;
  font-weight: 600;
  margin-left: 12rpx;
}

/* 反馈按钮 */
.feedback-btn {
  margin-top: 24rpx;
  text-align: center;
  color: #8CA082;
  font-size: 26rpx;
  text-decoration: underline;
}

/* 反馈弹窗 */
.feedback-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: flex-end;
}

.feedback-content {
  width: 100%;
  max-height: 90vh;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border: 1rpx solid rgba(180, 170, 150, 0.25);
  border-radius: 32rpx 32rpx 0 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.feedback-header {
  position: relative;
  background: linear-gradient(135deg, #8CA082, #a8bd9c);
  padding: 48rpx 32rpx 40rpx;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.feedback-close {
  position: absolute;
  top: 24rpx;
  right: 24rpx;
  width: 56rpx;
  height: 56rpx;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  line-height: 1;
  color: #fff;
}

.feedback-icon {
  font-size: 64rpx;
  margin-bottom: 12rpx;
}

.feedback-title {
  font-size: 36rpx;
  font-weight: 600;
  margin-bottom: 8rpx;
}

.feedback-subtitle {
  font-size: 24rpx;
  opacity: 0.9;
}

.feedback-body {
  padding: 32rpx;
  overflow-y: auto;
  flex: 1;
}

.fb-original {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 32rpx;
}

.fb-original-name {
  color: #3D3D3D;
  font-weight: 600;
}

.fb-field {
  margin-bottom: 32rpx;
}

.fb-label {
  font-size: 28rpx;
  font-weight: 600;
  color: #3D3D3D;
  margin-bottom: 16rpx;
}

.fb-search-wrap {
  display: flex;
  align-items: center;
  background: #f8fafc;
  border-radius: 50rpx;
  padding: 0 28rpx;
  height: 80rpx;
  border: 1rpx solid #e5e7eb;
  margin-bottom: 20rpx;
}

.fb-search-icon {
  font-size: 28rpx;
  color: #999;
  margin-right: 16rpx;
}

.fb-search-input {
  flex: 1;
  font-size: 28rpx;
  color: #3D3D3D;
  background: transparent;
}

.fb-herb-list {
  max-height: 360rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.fb-herb-chip {
  padding: 16rpx 24rpx;
  border-radius: 16rpx;
  border: 2rpx solid #e5e7eb;
  background: #fff;
  font-size: 26rpx;
  color: #3D3D3D;
}

.fb-herb-chip.active {
  border-color: #8CA082;
  background: #f0fdf4;
  color: #8CA082;
  font-weight: 600;
}

.fb-empty {
  margin-top: 16rpx;
}

.fb-empty-tip {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 12rpx;
}

.fb-custom-input {
  width: 100%;
  padding: 20rpx;
  border: 2rpx solid #8CA082;
  border-radius: 12rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.fb-note {
  width: 100%;
  padding: 20rpx;
  border: 1rpx solid #e5e7eb;
  border-radius: 16rpx;
  font-size: 26rpx;
  resize: none;
  height: 140rpx;
  box-sizing: border-box;
}

.fb-submit-btn {
  width: 100%;
  background: linear-gradient(135deg, #8CA082 0%, #a8bd9c 100%);
  color: #fff;
  border-radius: 16rpx;
  font-size: 30rpx;
  padding: 24rpx 0;
  border: none;
  margin-top: 8rpx;
  font-weight: 600;
}

.fb-submit-btn::after {
  border: none;
}

.fb-submit-btn[disabled] {
  opacity: 0.6;
}

/* 小贴士 */
.tips-area {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border: 1rpx solid rgba(180, 170, 150, 0.25);
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.03);
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #8CA082;
  margin-bottom: 24rpx;
}

.tip-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20rpx;
}

.tip-item:last-child {
  margin-bottom: 0;
}

.tip-num {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: #e8f5ee;
  color: #8CA082;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
  flex-shrink: 0;
  font-weight: 500;
}

.tip-text {
  font-size: 28rpx;
  color: #666;
  line-height: 1.5;
  flex: 1;
}
</style>
