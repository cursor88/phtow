<template>
  <view class="page">
    <view class="detail-container" v-if="herb">
      <view class="herb-hero">
        <!-- 多图轮播 -->
        <swiper
          v-if="hasMultipleImages"
          class="herb-swiper"
          :indicator-dots="false"
          :autoplay="false"
          :circular="false"
          :current="currentSlide"
          @change="onSwiperChange"
        >
          <swiper-item v-for="(img, idx) in herb.images" :key="idx">
            <image class="herb-image" :src="getImageUrl(img.url)" mode="aspectFill" @click="previewImage(idx)"></image>
          </swiper-item>
        </swiper>
        <!-- 单图直接显示 -->
        <image v-else class="herb-image" :src="userImage || herbImageUrl" mode="aspectFill" @click="previewSingleImage"></image>

        <view class="herb-overlay"></view>

        <!-- 图片计数（仅多图时显示） -->
        <view class="image-counter" v-if="hasMultipleImages">
          {{ currentSlide + 1 }}/{{ herb.images.length }}
        </view>

        <view class="herb-title-area">
          <view class="herb-name">{{ herb.name }}</view>
          <view class="herb-pinyin" v-if="herb.pinyin">{{ herb.pinyin }}</view>
          <view class="herb-alias" v-if="herb.alias && herb.alias.length">别名：{{ herb.alias.join('、') }}</view>
        </view>
        <view class="favorite-btn" @click="toggleFavorite">
          <text class="fav-icon" :class="{ favorited: isFavorite }">♥</text>
        </view>
      </view>

      <!-- 轮播切换按钮（图下方，仅多图时显示） -->
      <view class="swiper-nav" v-if="hasMultipleImages">
        <view class="nav-btn prev-btn" :class="{ disabled: currentSlide <= 0 }" @click="prevSlide">
          <text class="nav-arrow">‹</text>
        </view>
        <view class="nav-dots">
          <view
            v-for="(img, idx) in herb.images"
            :key="idx"
            class="nav-dot"
            :class="{ active: currentSlide === idx }"
            @click="goToSlide(idx)"
          ></view>
        </view>
        <view class="nav-btn next-btn" :class="{ disabled: currentSlide >= herb.images.length - 1 }" @click="nextSlide">
          <text class="nav-arrow">›</text>
        </view>
      </view>

      <view class="content-area">
        <view class="basic-info card">
          <view class="info-row">
            <view class="info-item">
              <view class="info-label">性味</view>
              <view class="info-value">{{ herb.nature }}，{{ herb.taste }}</view>
            </view>
            <view class="info-item">
              <view class="info-label">归经</view>
              <view class="info-value">{{ herb.meridian }}</view>
            </view>
          </view>
          <view class="info-tags">
            <text class="tag">{{ herb.category }}</text>
          </view>
        </view>

        <view class="section card">
          <view class="section-title">功效</view>
          <view class="section-content">{{ herb.effect }}</view>
        </view>

        <view class="section card">
          <view class="section-title">主治</view>
          <view class="section-content">{{ herb.indication }}</view>
        </view>

        <view class="section card">
          <view class="section-title">用法用量</view>
          <view class="section-content">{{ herb.dosage }}</view>
        </view>

        <view class="section card caution-card">
          <view class="section-title caution-title">
            <text class="caution-icon">⚠️</text>
            使用禁忌
          </view>
          <view class="section-content">{{ herb.taboo }}</view>
        </view>

        <view class="section card">
          <view class="section-title">鉴别要点</view>
          <view class="section-content">{{ herb.identify_points }}</view>
        </view>

        <!-- 关键鉴别点（在鉴别要点之后） -->
        <view class="section card key-id-section" v-if="hasKeyIdentification">
          <view class="section-title key-id-title">
            <text class="title-icon">🔬</text>
            关键鉴别点
          </view>
          <view class="section-content" v-if="isKeyIdentificationString">{{ herb.key_identification }}</view>
          <view class="key-id-list" v-else>
            <view class="key-id-item" v-for="(row, idx) in keyIdRows" :key="idx">
              <view class="key-id-label">
                <text class="key-id-icon">{{ row.icon }}</text>
                <text>{{ row.label }}</text>
              </view>
              <view class="key-id-value">{{ row.value }}</view>
            </view>
          </view>
        </view>

        <view class="section card classics-section">
          <view class="section-title classics-title">
            <text class="title-icon">📜</text>
            典籍溯源
          </view>
          <view class="classics-list">
            <view class="classics-item" v-for="(item, index) in herb.classics" :key="index">
              <view class="classics-book">
                <text class="book-icon">📖</text>
                {{ item.book }}
              </view>
              <view class="classics-content">"{{ item.content }}"</view>
            </view>
          </view>
          <view class="more-btn" @click="goToClassics">
            查看更多典籍记载 →
          </view>
        </view>

        <!-- 其他可能结果（在药食同源之前） -->
        <view class="section card alternatives-section" v-if="hasAlternatives">
          <view class="section-title alternatives-title">
            <text class="title-icon">🌿</text>
            其他可能结果
          </view>
          <view class="alt-desc">识别时可能的其他候选药材</view>
          <view class="alt-list">
            <view
              class="alt-item"
              v-for="(alt, idx) in herb.alternatives"
              :key="idx"
              @click="goToHerbDetail(alt)"
            >
              <view class="alt-visual">🌿</view>
              <view class="alt-info">
                <view class="alt-name">{{ alt.name }}</view>
                <view class="alt-ki" v-if="altKeyRows(alt).length">
                  <view class="alt-ki-row" v-for="(row, ridx) in altKeyRows(alt)" :key="ridx">
                    <text class="alt-ki-label">{{ row.label }}</text>
                    <text class="alt-ki-value">{{ row.value }}</text>
                  </view>
                </view>
              </view>
              <view class="alt-probability" v-if="alt.probability != null">{{ formatProbability(alt.probability) }}</view>
            </view>
          </view>
        </view>

        <!-- 真伪鉴别（仅有鉴别数据时显示） -->
        <view class="section card auth-section" v-if="authData">
          <view class="section-title auth-section-title">
            <text class="title-icon">🔍</text>
            真伪鉴别
          </view>
          <view class="auth-summary-row">
            <view class="auth-counterfeiter-info">
              <text class="auth-counterfeiter-label">冒充物：</text>
              <text class="auth-counterfeiter-value">{{ authData.counterfeiter }}</text>
            </view>
            <view class="auth-fraud-type-tag" :class="fraudClass(authData.fraudType)">{{ authData.fraudType }}</view>
          </view>
          <view class="auth-warn-text">{{ authData.summary }}</view>
          <view class="auth-keypoints-preview" v-if="authData.keyPoints && authData.keyPoints.length">
            <view class="auth-kp-item" v-for="(kp, idx) in authData.keyPoints.slice(0, 2)" :key="idx">
              <text class="auth-kp-label">{{ kp.label }}</text>
              <view class="auth-kp-compare">
                <text class="auth-kp-genuine">真：{{ kp.genuine }}</text>
                <text class="auth-kp-fake">假：{{ kp.fake }}</text>
              </view>
            </view>
          </view>
          <view class="more-btn" @click="goToAuthDetail">查看完整鉴别指南 →</view>
        </view>

        <view class="section card food-match-section">
          <view class="section-title food-title">
            <text class="title-icon">🍲</text>
            药食同源
          </view>
          <view class="food-desc">以下是{{ herb.name }}的养生搭配推荐</view>
          <view class="food-list">
            <view class="food-item" v-for="item in foodMatches" :key="item.id" @click="goToMatchDetail(item)">
              <image class="food-img" :src="getImageUrl(item.image)" mode="aspectFill"></image>
              <view class="food-info">
                <view class="food-name">{{ item.name }}</view>
                <view class="food-effect">{{ item.effect }}</view>
                <view class="food-ingredients">
                  <text class="ingredient-tag" v-for="(ing, idx) in (item.ingredients || []).slice(0, 4)" :key="idx">{{ ing }}</text>
                </view>
              </view>
            </view>
          </view>
          <view class="more-btn" @click="goToMatchList">
            查看全部搭配 →
          </view>
        </view>
      </view>
    </view>

    <!-- 药食同源搭配详情抽屉弹窗 -->
    <view class="match-detail-modal" v-if="showMatchDetailModal" @click="closeMatchDetail">
      <view class="match-detail-content" @click.stop>
        <view class="match-detail-header">
          <image
            class="match-detail-img"
            :src="currentMatchDetail ? getImageUrl(currentMatchDetail.image) : ''"
            mode="aspectFill"
          ></image>
          <view class="match-detail-close" @click="closeMatchDetail">×</view>
        </view>
        <view class="match-detail-body" v-if="currentMatchDetail">
          <view class="match-detail-name">{{ currentMatchDetail.name }}</view>

          <view class="match-detail-section">
            <view class="match-detail-label">主要食材</view>
            <view class="match-detail-ingredients">
              <text class="match-ingredient-item" v-for="(ing, idx) in (currentMatchDetail.ingredients || [])" :key="idx">
                {{ ing }}
              </text>
            </view>
          </view>

          <view class="match-detail-section">
            <view class="match-detail-label">功效</view>
            <view class="match-detail-text">{{ currentMatchDetail.effect }}</view>
          </view>

          <view class="match-detail-section" v-if="currentMatchDetail.suitable">
            <view class="match-detail-label">适宜人群</view>
            <view class="match-detail-text">{{ currentMatchDetail.suitable }}</view>
          </view>

          <view class="match-detail-section caution" v-if="currentMatchDetail.taboo">
            <view class="match-detail-label caution-label">禁忌</view>
            <view class="match-detail-text">{{ currentMatchDetail.taboo }}</view>
          </view>

          <view class="match-detail-section" v-if="currentMatchDetail.method">
            <view class="match-detail-label">做法</view>
            <view class="match-detail-method">{{ currentMatchDetail.method }}</view>
          </view>
        </view>
        <view class="match-detail-loading" v-else>
          <view class="loading-spinner"></view>
          <text>加载中...</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { herbApi, matchApi, favoriteApi, authenticateApi, getImageUrl, resolveHerbImage } from '@/api/index.js'

export default {
  data() {
    return {
      herbId: null,
      userImage: '',
      herb: null,
      foodMatches: [],
      authData: null,
      isFavorite: false,
      favorites: [],
      currentSlide: 0,
      showMatchDetailModal: false,
      currentMatchDetail: null,
      loadingMatchDetail: false
    }
  },
  computed: {
    hasMultipleImages() {
      return Array.isArray(this.herb.images) && this.herb.images.length > 1
    },
    hasKeyIdentification() {
      const ki = this.herb.key_identification
      if (!ki) return false
      if (typeof ki === 'string') return ki.trim() !== ''
      return this.keyIdRows.length > 0
    },
    isKeyIdentificationString() {
      return typeof this.herb.key_identification === 'string'
    },
    keyIdRows() {
      const ki = this.herb.key_identification
      if (!ki || typeof ki === 'string') return []
      const rows = []
      if (ki.odor || ki.smell) rows.push({ label: '气味', icon: '👃', value: ki.odor || ki.smell })
      if (ki.texture) rows.push({ label: '质地', icon: '✋', value: ki.texture })
      if (ki.cross_section) rows.push({ label: '截面', icon: '🔪', value: ki.cross_section })
      if (ki.outer_skin) rows.push({ label: '外皮', icon: '🌰', value: ki.outer_skin })
      if (ki.other) rows.push({ label: '其他', icon: '📌', value: ki.other })
      return rows
    },
    hasAlternatives() {
      return Array.isArray(this.herb.alternatives) && this.herb.alternatives.length > 0
    },
    // 首图兼容：优先 herb.image，兜底 herb.cover_image_url、images 第一张等
    herbImageUrl() {
      return getImageUrl(resolveHerbImage(this.herb))
    }
  },
  onLoad(options) {
    this.herbId = options.id
    if (options.image) {
      this.userImage = decodeURIComponent(options.image)
    }
    this.loadFavorites()
    this.loadDetail()
    this.loadFoodMatch()
    this.loadAuthData()
  },
  methods: {
    getImageUrl,
    async loadFavorites() {
      const token = uni.getStorageSync('token')
      if (!token) {
        this.favorites = []
        this.isFavorite = false
        return
      }
      try {
        const list = await favoriteApi.getHerbs()
        this.favorites = (list || []).map(h => h.id)
        this.isFavorite = this.favorites.includes(parseInt(this.herbId))
      } catch (e) {
        console.error('加载收藏失败', e)
        this.favorites = []
        this.isFavorite = false
      }
    },
    async toggleFavorite() {
      const token = uni.getStorageSync('token')
      if (!token) {
        uni.showModal({
          title: '提示',
          content: '请先登录后再收藏',
          confirmText: '去登录',
          success: (res) => {
            if (res.confirm) {
              uni.navigateTo({ url: '/pages/login/login' })
            }
          }
        })
        return
      }
      console.log('[detail] 切换收藏, herbId:', this.herbId, '当前已收藏:', this.isFavorite)
      try {
        const result = await favoriteApi.toggleHerb(this.herbId)
        console.log('[detail] toggleHerb 返回:', result)
        this.isFavorite = result.isFavorited
        uni.showToast({ title: this.isFavorite ? '已收藏' : '已取消收藏', icon: this.isFavorite ? 'success' : 'none' })
        uni.$emit('favoritesChanged')
      } catch (e) {
        console.error('[detail] 收藏操作失败', e)
        const errCode = e?.code || e?.data?.code
        if (errCode === 401) {
          uni.removeStorageSync('token')
          uni.showModal({
            title: '登录已过期',
            content: '请重新登录',
            confirmText: '去登录',
            success: (res) => {
              if (res.confirm) {
                uni.navigateTo({ url: '/pages/login/login' })
              }
            }
          })
        } else {
          uni.showToast({ title: e?.message || e?.data?.message || '操作失败', icon: 'none' })
        }
      }
    },
    async loadDetail() {
      try {
        this.herb = await herbApi.getDetail(this.herbId)
      } catch (e) {
        console.error('加载详情失败', e)
      }
    },
    async loadFoodMatch() {
      try {
        this.foodMatches = await herbApi.getFoodMatch(this.herbId)
      } catch (e) {
        console.error('加载搭配失败', e)
      }
    },
    async loadAuthData() {
      try {
        const data = await authenticateApi.getByHerb('', parseInt(this.herbId))
        this.authData = data || null
      } catch (e) {
        console.error('加载真伪鉴别失败', e)
      }
    },
    fraudClass(type) {
      const map = {
        '冒充': 'fraud-maoc',
        '做旧': 'fraud-jiu',
        '染色': 'fraud-ran',
        '硫熏': 'fraud-liu'
      }
      return map[type] || 'fraud-default'
    },
    goToAuthDetail() {
      if (!this.authData) return
      uni.navigateTo({
        url: `/pages/authenticate/authenticate-detail?id=${this.authData.id}`
      })
    },
    onSwiperChange(e) {
      this.currentSlide = e.detail.current
    },
    prevSlide() {
      if (this.currentSlide > 0) {
        this.currentSlide--
      }
    },
    nextSlide() {
      if (this.currentSlide < this.herb.images.length - 1) {
        this.currentSlide++
      }
    },
    goToSlide(idx) {
      this.currentSlide = idx
    },
    previewImage(idx) {
      const urls = (this.herb.images || []).map(img => getImageUrl(img.url))
      uni.previewImage({
        current: urls[idx] || urls[0],
        urls: urls
      })
    },
    previewSingleImage() {
      const url = this.userImage || this.herbImageUrl
      if (url) {
        uni.previewImage({
          current: url,
          urls: [url]
        })
      }
    },
    altKeyRows(alt) {
      if (!alt || !alt.key_identification) return []
      const ki = alt.key_identification
      if (typeof ki === 'string') return ki.trim() ? [{ label: '鉴别', value: ki }] : []
      const rows = []
      if (ki.odor || ki.smell) rows.push({ label: '气味', value: ki.odor || ki.smell })
      if (ki.texture) rows.push({ label: '质地', value: ki.texture })
      if (ki.cross_section) rows.push({ label: '截面', value: ki.cross_section })
      if (ki.outer_skin) rows.push({ label: '外皮', value: ki.outer_skin })
      if (ki.other) rows.push({ label: '其他', value: ki.other })
      return rows
    },
    formatProbability(p) {
      const num = Number(p)
      if (isNaN(num)) return ''
      if (num <= 1) return (num * 100).toFixed(0) + '%'
      return num.toFixed(0) + '%'
    },
    goToHerbDetail(alt) {
      if (!alt || !alt.herbId) {
        uni.showToast({ title: '暂无该药材详情', icon: 'none' })
        return
      }
      uni.navigateTo({
        url: `/pages/detail/detail?id=${alt.herbId}`
      })
    },
    goToClassics() {
      uni.navigateTo({
        url: `/pages/classics/classics?id=${this.herbId}`
      })
    },
    goToMatchDetail(item) {
      // 打开底部抽屉式弹窗显示搭配详情，而非跳转离开详情页
      this.currentMatchDetail = item
      this.showMatchDetailModal = true
      // 若列表项缺少详细字段，按 id 拉取完整详情
      if (item && item.id && (item.method == null && item.suitable == null && item.taboo == null)) {
        this.fetchMatchDetail(item.id)
      }
    },
    async fetchMatchDetail(id) {
      this.loadingMatchDetail = true
      try {
        const detail = await matchApi.getMatchDetail(id)
        if (detail) {
          this.currentMatchDetail = { ...this.currentMatchDetail, ...detail }
        }
      } catch (e) {
        console.error('加载搭配详情失败', e)
      } finally {
        this.loadingMatchDetail = false
      }
    },
    closeMatchDetail() {
      this.showMatchDetailModal = false
      this.currentMatchDetail = null
    },
    goToMatchList() {
      uni.switchTab({
        url: '/pages/match/match'
      })
    }
  }
}
</script>

<style lang="scss">
.page {
  min-height: 100vh;
  background: #F5F1E8;
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", "Microsoft YaHei", sans-serif;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
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

.detail-container {
  padding-bottom: 40rpx;
}

.herb-hero {
  position: relative;
  height: 400rpx;
  overflow: hidden;
  background: linear-gradient(135deg, #8CA082 0%, #10B981 50%, #34D399 100%);
}

.herb-swiper {
  width: 100%;
  height: 100%;
}

.herb-image {
  width: 100%;
  height: 100%;
}

.swiper-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16rpx 32rpx;
  background: #ffffff;
}

.nav-btn + .nav-dots {
  margin-left: 24rpx;
}

.nav-dots + .nav-btn {
  margin-left: 24rpx;
}

.nav-btn {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: rgba(140, 160, 130, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
}

.nav-btn:active {
  background: rgba(140, 160, 130, 0.25);
  transform: scale(0.92);
}

.nav-btn.disabled {
  opacity: 0.3;
  pointer-events: none;
}

.nav-arrow {
  font-size: 44rpx;
  color: #8CA082;
  line-height: 1;
  font-weight: bold;
}

.nav-dots {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
}

.nav-dot + .nav-dot {
  margin-left: 12rpx;
}

.nav-dot {
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  background: #d1d5db;
  transition: all 0.2s;
}

.nav-dot.active {
  background: #8CA082;
  width: 32rpx;
  border-radius: 7rpx;
}

.herb-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 200rpx;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  z-index: 2;
}

.image-counter {
  position: absolute;
  top: 32rpx;
  left: 32rpx;
  padding: 6rpx 18rpx;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  font-size: 22rpx;
  border-radius: 16rpx;
  z-index: 5;
}

.image-dots {
  position: absolute;
  bottom: 210rpx;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  z-index: 5;
}

.image-dots .dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  margin: 0 6rpx;
  transition: all 0.2s;
}

.image-dots .dot.active {
  background: #fff;
  width: 28rpx;
  border-radius: 6rpx;
}

.herb-title-area {
  position: absolute;
  bottom: 32rpx;
  left: 32rpx;
  right: 100rpx;
  color: #fff;
  z-index: 3;
}

.favorite-btn {
  position: absolute;
  top: 32rpx;
  right: 32rpx;
  width: 80rpx;
  height: 80rpx;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  transition: transform 0.2s;
  z-index: 4;
}

.favorite-btn:active {
  transform: scale(0.9);
}

.fav-icon {
  color: #d1d5db;
  transition: color 0.2s;
}

.fav-icon.favorited {
  color: #ef4444;
}

.herb-name {
  font-size: 48rpx;
  font-weight: 700;
  margin-bottom: 8rpx;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.3);
}

.herb-pinyin {
  font-size: 26rpx;
  opacity: 0.9;
  margin-bottom: 8rpx;
}

.herb-alias {
  font-size: 24rpx;
  opacity: 0.8;
}

.content-area {
  padding: 24rpx;
  margin-top: -20rpx;
  position: relative;
  z-index: 10;
}

.card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border: 1rpx solid rgba(180, 170, 150, 0.25);
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(180, 170, 150, 0.08);
}

.basic-info {
  .info-row {
    display: flex;
    margin-bottom: 20rpx;
  }

  .info-item {
    flex: 1;
  }

  .info-label {
    font-size: 24rpx;
    color: #999;
    margin-bottom: 8rpx;
  }

  .info-value {
    font-size: 28rpx;
    color: #3D3D3D;
    font-weight: 500;
  }
}

.info-tags {
  .tag {
    display: inline-block;
    padding: 8rpx 20rpx;
    background: #e8f5ee;
    color: #8CA082;
    border-radius: 16rpx;
    font-size: 24rpx;
  }
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #8CA082;
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
}

.section-title::before {
  content: '';
  width: 6rpx;
  height: 28rpx;
  background: linear-gradient(180deg, #8CA082, #3da878);
  border-radius: 3rpx;
  margin-right: 12rpx;
}

.section-content {
  font-size: 28rpx;
  color: #444;
  line-height: 1.8;
}

.caution-card {
  background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
  border: 2rpx solid #fed7aa;
}

.caution-title {
  color: #c2410c;
}

.caution-title::before {
  background: linear-gradient(180deg, #f59e0b, #d97706);
}

.caution-icon {
  margin-right: 8rpx;
}

.title-icon {
  margin-right: 8rpx;
  font-size: 32rpx;
}

/* 关键鉴别点 */
.key-id-section {
  background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%);
  border: 2rpx solid #99f6e4;
}

.key-id-title {
  color: #0f766e;
}

.key-id-title::before {
  background: linear-gradient(180deg, #14b8a6, #0d9488);
}

.key-id-list {
  .key-id-item {
    display: flex;
    padding: 16rpx 0;
    border-bottom: 1rpx solid rgba(15, 118, 110, 0.1);

    &:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    &:first-child {
      padding-top: 0;
    }
  }

  .key-id-label {
    width: 150rpx;
    flex-shrink: 0;
    font-size: 26rpx;
    color: #0f766e;
    font-weight: 500;
    display: flex;
    align-items: center;
  }

  .key-id-icon {
    margin-right: 8rpx;
    font-size: 28rpx;
  }

  .key-id-value {
    flex: 1;
    font-size: 26rpx;
    color: #3D3D3D;
    line-height: 1.6;
  }
}

.classics-section {
  background: linear-gradient(135deg, #fefdf8 0%, #fdf6e3 100%);
  border: 2rpx solid #f5e6c8;
}

.classics-title {
  color: #92400e;
}

.classics-title::before {
  background: linear-gradient(180deg, #d97706, #b45309);
}

.classics-list {
  .classics-item {
    background: rgba(255, 255, 255, 0.7);
    border-radius: 12rpx;
    padding: 20rpx;
    margin-bottom: 16rpx;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .classics-book {
    font-size: 26rpx;
    color: #92400e;
    font-weight: 600;
    margin-bottom: 12rpx;
    display: flex;
    align-items: center;
  }

  .book-icon {
    margin-right: 8rpx;
  }

  .classics-content {
    font-size: 26rpx;
    color: #666;
    line-height: 1.8;
    font-style: italic;
    padding-left: 16rpx;
    border-left: 3rpx solid #f5e6c8;
  }
}

/* 其他可能结果 */
.alternatives-section {
  background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
  border: 2rpx solid #ddd6fe;
}

.alternatives-title {
  color: #6d28d9;
}

.alternatives-title::before {
  background: linear-gradient(180deg, #8b5cf6, #7c3aed);
}

.alt-desc {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 24rpx;
}

.alt-list {
  .alt-item {
    display: flex;
    align-items: center;
    background: #fff;
    border-radius: 16rpx;
    padding: 20rpx;
    margin-bottom: 16rpx;
    box-shadow: 0 2rpx 12rpx rgba(180, 170, 150, 0.08);
    transition: transform 0.2s;

    &:last-child {
      margin-bottom: 0;
    }

    &:active {
      transform: scale(0.98);
    }
  }

  .alt-visual {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, #a78bfa, #8b5cf6);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40rpx;
    flex-shrink: 0;
    margin-right: 20rpx;
  }

  .alt-info {
    flex: 1;
    min-width: 0;
  }

  .alt-name {
    font-size: 30rpx;
    font-weight: 600;
    color: #3D3D3D;
    margin-bottom: 8rpx;
  }

  .alt-ki {
    border-top: 1rpx dashed #e2e8f0;
    padding-top: 8rpx;
  }

  .alt-ki-row {
    display: flex;
    padding: 4rpx 0;
  }

  .alt-ki-label {
    color: #6d28d9;
    font-weight: 500;
    font-size: 22rpx;
    width: 64rpx;
    flex-shrink: 0;
  }

  .alt-ki-value {
    font-size: 22rpx;
    color: #666;
    flex: 1;
    line-height: 1.5;
  }

  .alt-probability {
    color: #F59E0B;
    font-size: 32rpx;
    font-weight: 700;
    flex-shrink: 0;
    margin-left: 16rpx;
  }
}

.food-match-section {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border: 2rpx solid #bbf7d0;
}

/* 真伪鉴别 section */
.auth-section {
  background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
  border: 2rpx solid #d8b4fe;
}

.auth-section-title {
  color: #7c3aed;
}

.auth-section-title::before {
  background: linear-gradient(180deg, #a855f7, #7c3aed);
}

.auth-summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.auth-counterfeiter-info {
  font-size: 26rpx;
  color: #3D3D3D;
}

.auth-counterfeiter-label {
  color: #999;
}

.auth-counterfeiter-value {
  color: #7c3aed;
  font-weight: 500;
}

.auth-fraud-type-tag {
  font-size: 22rpx;
  padding: 6rpx 20rpx;
  border-radius: 16rpx;
  font-weight: 500;
}

.auth-fraud-type-tag.fraud-maoc {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  border: 1rpx solid rgba(239, 68, 68, 0.2);
}

.auth-fraud-type-tag.fraud-jiu {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
  border: 1rpx solid rgba(245, 158, 11, 0.2);
}

.auth-fraud-type-tag.fraud-ran {
  background: rgba(168, 85, 247, 0.1);
  color: #9333ea;
  border: 1rpx solid rgba(168, 85, 247, 0.2);
}

.auth-fraud-type-tag.fraud-liu {
  background: rgba(234, 179, 8, 0.1);
  color: #a16207;
  border: 1rpx solid rgba(234, 179, 8, 0.2);
}

.auth-fraud-type-tag.fraud-default {
  background: rgba(140, 160, 130, 0.1);
  color: #8CA082;
  border: 1rpx solid rgba(140, 160, 130, 0.2);
}

.auth-warn-text {
  font-size: 26rpx;
  color: #6b21a8;
  line-height: 1.6;
  background: rgba(168, 85, 247, 0.06);
  padding: 16rpx 20rpx;
  border-radius: 12rpx;
  margin-bottom: 20rpx;
}

.auth-keypoints-preview {
  background: #ffffff;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.auth-kp-item {
  margin-bottom: 14rpx;
}

.auth-kp-item:last-child {
  margin-bottom: 0;
}

.auth-kp-label {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 6rpx;
  display: block;
}

.auth-kp-compare {
  display: flex;
  flex-direction: column;
}

.auth-kp-genuine {
  font-size: 24rpx;
  color: #8CA082;
  margin-bottom: 4rpx;
}

.auth-kp-fake {
  font-size: 24rpx;
  color: #dc2626;
}

.food-title {
  color: #166534;
}

.food-title::before {
  background: linear-gradient(180deg, #22c55e, #16a34a);
}

.food-desc {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 24rpx;
}

.food-list {
  .food-item {
    display: flex;
    background: #fff;
    border-radius: 16rpx;
    overflow: hidden;
    margin-bottom: 20rpx;
    box-shadow: 0 2rpx 12rpx rgba(180, 170, 150, 0.08);

    &:last-child {
      margin-bottom: 0;
    }
  }

  .food-img {
    width: 180rpx;
    height: 180rpx;
    flex-shrink: 0;
  }

  .food-info {
    flex: 1;
    padding: 20rpx;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .food-name {
    font-size: 30rpx;
    font-weight: 600;
    color: #3D3D3D;
    margin-bottom: 8rpx;
  }

  .food-effect {
    font-size: 24rpx;
    color: #8CA082;
    margin-bottom: 12rpx;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .food-ingredients {
    display: flex;
    flex-wrap: wrap;
    gap: 8rpx;
  }

  .ingredient-tag {
    font-size: 20rpx;
    color: #666;
    background: #f5f5f5;
    padding: 4rpx 12rpx;
    border-radius: 12rpx;
  }
}

.more-btn {
  text-align: center;
  padding-top: 24rpx;
  margin-top: 16rpx;
  border-top: 1rpx solid rgba(0, 0, 0, 0.06);
  font-size: 26rpx;
  color: #8CA082;
  font-weight: 500;
}

/* 药食同源搭配详情抽屉弹窗 */
.match-detail-modal {
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

.match-detail-content {
  width: 100%;
  max-height: 85vh;
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: matchSlideUp 0.3s ease;
}

@keyframes matchSlideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.match-detail-header {
  position: relative;
  height: 320rpx;
  background: linear-gradient(135deg, #8CA082 0%, #10B981 50%, #34D399 100%);
}

.match-detail-img {
  width: 100%;
  height: 100%;
}

.match-detail-close {
  position: absolute;
  top: 24rpx;
  right: 24rpx;
  width: 64rpx;
  height: 64rpx;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 44rpx;
  line-height: 1;
}

.match-detail-body {
  padding: 32rpx;
  max-height: calc(85vh - 320rpx);
  overflow-y: auto;
}

.match-detail-name {
  font-size: 40rpx;
  font-weight: 700;
  color: #3D3D3D;
  margin-bottom: 32rpx;
}

.match-detail-section {
  margin-bottom: 28rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.match-detail-label {
  font-size: 28rpx;
  font-weight: 600;
  color: #8CA082;
  margin-bottom: 12rpx;
  display: flex;
  align-items: center;
}

.match-detail-label::before {
  content: '';
  width: 6rpx;
  height: 24rpx;
  background: #8CA082;
  border-radius: 3rpx;
  margin-right: 10rpx;
}

.caution-label {
  color: #dc2626;
}

.caution-label::before {
  background: #dc2626;
}

.match-detail-text {
  font-size: 26rpx;
  color: #555;
  line-height: 1.8;
  padding-left: 16rpx;
}

.match-detail-ingredients {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  padding-left: 16rpx;
}

.match-ingredient-item {
  padding: 8rpx 20rpx;
  background: #e8f5ee;
  color: #8CA082;
  border-radius: 16rpx;
  font-size: 24rpx;
}

.match-detail-method {
  font-size: 26rpx;
  color: #555;
  line-height: 2;
  padding-left: 16rpx;
  white-space: pre-line;
}

.match-detail-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
  color: #999;
  font-size: 28rpx;
}
</style>
