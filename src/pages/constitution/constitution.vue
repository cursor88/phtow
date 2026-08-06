<template>
  <view class="page">
    <view class="content" v-if="viewMode === 'select'">
      <view class="intro-card card">
        <view class="intro-icon">🧬</view>
        <view class="intro-title">中医体质测评</view>
        <view class="intro-desc">基于《GB/T 46939-2025》国家标准，通过科学问卷评估您的九种体质倾向，获取个性化药食同源调养方案。</view>
      </view>

      <view class="mode-card card" @click="startTest('standard')">
        <view class="mode-icon standard-icon">📋</view>
        <view class="mode-info">
          <view class="mode-name">标准版测评</view>
          <view class="mode-desc">60 题 · 国标 GB/T 46939-2025</view>
          <view class="mode-tag">精准全面 · 约 8 分钟</view>
        </view>
        <view class="mode-arrow">›</view>
      </view>

      <view class="mode-card card" @click="startTest('quick')">
        <view class="mode-icon quick-icon">⚡</view>
        <view class="mode-info">
          <view class="mode-name">快速版测评</view>
          <view class="mode-desc">18 题 · 9 体质 × 2</view>
          <view class="mode-tag">快速了解 · 约 2 分钟</view>
        </view>
        <view class="mode-arrow">›</view>
      </view>

      <view class="records-btn" @click="viewRecords">
        <text class="records-btn-icon">📜</text>
        <text class="records-btn-text">查看测评记录</text>
      </view>

      <view class="types-card card">
        <view class="section-title">九种体质</view>
        <view class="types-grid">
          <view class="type-item" v-for="(t, key) in constitutionTypes" :key="key">
            <view class="type-dot" :style="{ background: t.color }"></view>
            <text class="type-name">{{ t.name }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="content" v-if="viewMode === 'quiz'">
      <view class="progress-wrap">
        <view class="progress-bar">
          <view class="progress-fill" :style="{ width: progressPercent + '%' }"></view>
        </view>
        <view class="progress-text">{{ currentIndex + 1 }} / {{ questions.length }}</view>
      </view>

      <view class="question-card card" v-if="questions.length > 0">
        <view class="question-index">第 {{ currentIndex + 1 }} 题</view>
        <view class="question-text">{{ currentQuestion.text }}</view>
        <view class="options-list">
          <view
            class="option-item"
            :class="{ selected: answers[currentQuestion.id] === idx + 1 }"
            v-for="(opt, idx) in options"
            :key="idx"
            @click="selectOption(idx + 1)"
          >
            <view class="option-letter">{{ idx + 1 }}</view>
            <text class="option-text">{{ opt }}</text>
            <view class="option-check" v-if="answers[currentQuestion.id] === idx + 1">✓</view>
          </view>
        </view>
      </view>

      <view class="loading" v-else>
        <view class="loading-spinner"></view>
        <text>加载题目中...</text>
      </view>

      <view class="bottom-bar" v-if="questions.length > 0">
        <view class="btn btn-secondary" v-if="currentIndex > 0" @click="prevQuestion">上一题</view>
        <view class="btn btn-primary" v-if="currentIndex < questions.length - 1" @click="nextQuestion">下一题</view>
        <view class="btn btn-success" v-if="currentIndex === questions.length - 1" @click="submitTest">提交测评</view>
      </view>
    </view>

    <view class="content" v-if="viewMode === 'result' && result">
      <view class="result-hero" :style="{ background: resultInfo.color }">
        <view class="result-icon">🧬</view>
        <view class="result-title">{{ result.mainTypeName || resultInfo.name }}</view>
        <view class="result-desc">{{ resultInfo.desc }}</view>
      </view>

      <view class="score-card card">
        <view class="section-title">各体质得分</view>
        <view class="score-list">
          <view class="score-item" v-for="item in scoreList" :key="item.type">
            <view class="score-row">
              <text class="score-name">{{ item.name }}</text>
              <text class="score-value" :style="{ color: item.color }">{{ item.score }}分</text>
            </view>
            <view class="score-bar">
              <view class="score-fill" :style="{ width: item.score + '%', background: item.color }"></view>
            </view>
          </view>
        </view>
      </view>

      <view class="mixed-card card" v-if="mixedTypes.length > 0">
        <view class="section-title">兼夹体质（≥40分）</view>
        <view class="mixed-tags">
          <view class="mixed-tag" v-for="t in mixedTypes" :key="t.type || t.name">
            {{ t.name }} {{ t.score }}分
          </view>
        </view>
      </view>

      <view class="match-card card">
        <view class="section-title">🍲 药食同源搭配推荐</view>
        <view class="match-list" v-if="recommendations.length > 0">
          <view class="match-item" v-for="(m, idx) in recommendations" :key="idx" @click="goToMatchDetail(m)">
            <view class="match-head">
              <text class="match-name">{{ m.name }}</text>
              <text class="match-type">{{ m.type }}</text>
            </view>
            <view class="match-desc">{{ m.desc }}</view>
            <view class="match-herbs-label">涉及药材：</view>
            <view class="match-herbs">
              <text class="herb-tag" v-for="(h, i) in m.herbs" :key="i" @click.stop="goToHerbByTag(h)">{{ h }}</text>
            </view>
          </view>
        </view>
        <view class="match-empty" v-else>暂无推荐</view>
      </view>

      <view class="result-date">测评时间：{{ result.date || '-' }}</view>

      <view class="bottom-bar">
        <view class="btn btn-secondary" @click="goSelect">再测一次</view>
        <view class="btn btn-primary" @click="viewRecords">查看记录</view>
      </view>
    </view>

    <view class="content" v-if="viewMode === 'records'">
      <view class="records-header">
        <text class="records-count" v-if="records.length > 0">共 {{ records.length }} 次测评</text>
      </view>

      <view class="empty-card card" v-if="records.length === 0 && !recordsLoading">
        <view class="empty-icon">🧬</view>
        <view class="empty-text">暂无测评记录</view>
        <view class="empty-tip">去测一测，了解你的体质吧</view>
        <view class="empty-btn" @click="goSelect">开始测评</view>
      </view>

      <view class="record-list" v-else>
        <view
          class="record-card card"
          v-for="r in records"
          :key="r.id"
          @click="viewRecordDetail(r)"
        >
          <view class="record-icon" :style="{ background: getTypeColor(r.mainType) }">🧬</view>
          <view class="record-info">
            <view class="record-name" :style="{ color: getTypeColor(r.mainType) }">{{ r.mainTypeName }}</view>
            <view class="record-meta">{{ r.mode === 'quick' ? '快速测评' : '标准测评' }} · 得分 {{ r.mainScore }}%</view>
            <view class="record-date">{{ r.date }}</view>
          </view>
          <view class="record-mixed" v-if="r.mixedTypes && r.mixedTypes.length > 0">
            <text class="record-mixed-tag" v-for="(t, i) in r.mixedTypes.slice(0, 2)" :key="i">{{ t.name }}</text>
          </view>
          <view class="record-del" @click.stop="deleteRecord(r.id)">删除</view>
        </view>
      </view>

      <view class="bottom-bar">
        <view class="btn btn-secondary" @click="goSelect">返回测评</view>
      </view>
    </view>

    <!-- 药食同源搭配底部弹框 -->
    <view class="match-sheet-mask" v-if="matchSheetVisible" @click="closeMatchSheet"></view>
    <view class="match-sheet" :class="{ 'match-sheet-show': matchSheetVisible }">
      <view class="match-sheet-handle"></view>
      <view class="match-sheet-header">
        <text class="match-sheet-title">🍲 搭配详情</text>
        <view class="match-sheet-close" @click="closeMatchSheet">✕</view>
      </view>
      <scroll-view scroll-y class="match-sheet-content" v-if="currentMatch">
        <view class="ms-hero">
          <text class="ms-hero-name">{{ currentMatch.name }}</text>
          <text class="ms-hero-type">{{ currentMatch.type }}</text>
        </view>
        <view class="ms-section">
          <text class="ms-section-label">📝 功效描述</text>
          <text class="ms-section-text">{{ currentMatch.desc }}</text>
        </view>
        <view class="ms-section" v-if="currentMatch.herbs && currentMatch.herbs.length > 0">
          <text class="ms-section-label">🌿 涉及药材</text>
          <view class="ms-herbs-list">
            <text
              class="ms-herb-tag"
              v-for="(h, i) in currentMatch.herbs"
              :key="i"
              @click="goToHerbByTag(h)"
            >{{ h }}</text>
          </view>
        </view>
      </scroll-view>
      <view class="match-sheet-footer">
        <view class="ms-btn-primary" @click="openFullMatch">查看完整搭配 →</view>
      </view>
    </view>
  </view>
</template>

<script>
import { constitutionApi, matchApi, herbApi } from '@/api/index.js'

export default {
  data() {
    return {
      viewMode: 'select',
      mode: 'standard',
      questions: [],
      currentIndex: 0,
      answers: {},
      result: null,
      records: [],
      recordsLoading: false,
      matchSheetVisible: false,
      currentMatch: null,
      matchLoading: false,
      options: ['没有', '很少', '有时', '经常', '总是'],
      constitutionTypes: {
        pinghe: { name: '平和质', color: '#2d8b5e', desc: '精力充沛，适应力强，很少不适' },
        qixu: { name: '气虚质', color: '#f59e0b', desc: '容易疲劳，稍微活动就气短' },
        yangxu: { name: '阳虚质', color: '#3b82f6', desc: '手脚冰凉，尤其怕冷' },
        yinxu: { name: '阴虚质', color: '#ef4444', desc: '感到手脚心发热，口干舌燥' },
        tanshi: { name: '痰湿质', color: '#84cc16', desc: '身体沉重，腹部肥软，痰多' },
        shire: { name: '湿热质', color: '#a855f7', desc: '面部油腻，易长痘痘或疮疡' },
        xueyu: { name: '血瘀质', color: '#7c3aed', desc: '皮肤暗沉、容易出现淤青' },
        qiyu: { name: '气郁质', color: '#06b6d4', desc: '情绪抑郁，经常叹气或失眠' },
        tebing: { name: '特禀质', color: '#ec4899', desc: '容易过敏（如鼻炎、荨麻疹）' }
      },
      matchMap: {
        pinghe: [
          { name: '山药枸杞粥', type: '粥类', desc: '健脾养胃，滋补肝肾，适合日常养生', herbs: ['山药', '枸杞', '大米'] },
          { name: '大枣桂圆茶', type: '茶饮', desc: '补气养血，安神健脾，增强体质', herbs: ['大枣', '桂圆', '枸杞'] },
          { name: '百合莲子汤', type: '汤品', desc: '滋阴润肺，养心安神，平和调养', herbs: ['百合', '莲子', '冰糖'] }
        ],
        qixu: [
          { name: '人参粥', type: '粥类', desc: '大补元气，健脾养胃，适合气虚乏力', herbs: ['人参', '大米', '大枣'] },
          { name: '黄芪炖鸡', type: '汤品', desc: '补气升阳，固表止汗，增强免疫力', herbs: ['黄芪', '鸡肉', '生姜'] },
          { name: '党参山药炖排骨', type: '汤品', desc: '益气健脾，滋阴润燥，适合气虚体质', herbs: ['党参', '山药', '排骨'] }
        ],
        yangxu: [
          { name: '肉桂粥', type: '粥类', desc: '温中散寒，补肾助阳，适合阳虚畏寒', herbs: ['肉桂', '大米', '红糖'] },
          { name: '生姜羊肉汤', type: '汤品', desc: '温中补虚，散寒止痛，暖身驱寒', herbs: ['生姜', '羊肉', '当归'] },
          { name: '附子炖狗肉', type: '汤品', desc: '温肾助阳，散寒止痛，适合严重阳虚', herbs: ['附子', '狗肉', '生姜'] }
        ],
        yinxu: [
          { name: '麦冬百合粥', type: '粥类', desc: '滋阴润肺，清心安神，适合阴虚燥热', herbs: ['麦冬', '百合', '大米'] },
          { name: '沙参玉竹炖鸡汤', type: '汤品', desc: '滋阴清热，润肺生津，适合阴虚口干', herbs: ['沙参', '玉竹', '鸡肉'] },
          { name: '银耳莲子羹', type: '甜品', desc: '滋阴润燥，养心安神，适合阴虚体质', herbs: ['银耳', '莲子', '冰糖'] }
        ],
        tanshi: [
          { name: '薏苡仁冬瓜汤', type: '汤品', desc: '利水渗湿，清热化痰，适合痰湿肥胖', herbs: ['薏苡仁', '冬瓜', '排骨'] },
          { name: '荷叶茶', type: '茶饮', desc: '清热利湿，消水肿，帮助减肥', herbs: ['荷叶', '山楂', '陈皮'] },
          { name: '茯苓粥', type: '粥类', desc: '利水渗湿，健脾和胃，消除体内湿气', herbs: ['茯苓', '大米', '山药'] }
        ],
        shire: [
          { name: '绿豆粥', type: '粥类', desc: '清热解毒，消暑利水，适合湿热体质', herbs: ['绿豆', '大米', '荷叶'] },
          { name: '苦瓜炒蛋', type: '菜品', desc: '清热解毒，明目解毒，降火祛湿', herbs: ['苦瓜', '鸡蛋'] },
          { name: '茵陈茶', type: '茶饮', desc: '清热利湿，利胆退黄，适合湿热黄疸', herbs: ['茵陈', '栀子', '大黄'] }
        ],
        xueyu: [
          { name: '山楂粥', type: '粥类', desc: '活血化瘀，消食化积，适合血瘀体质', herbs: ['山楂', '大米', '红糖'] },
          { name: '丹参酒', type: '饮品', desc: '活血化瘀，通经止痛，改善血液循环', herbs: ['丹参', '白酒'] },
          { name: '玫瑰花茶', type: '茶饮', desc: '疏肝理气，活血化瘀，美容养颜', herbs: ['玫瑰花', '枸杞', '大枣'] }
        ],
        qiyu: [
          { name: '陈皮粥', type: '粥类', desc: '理气健脾，燥湿化痰，适合气郁体质', herbs: ['陈皮', '大米', '生姜'] },
          { name: '佛手茶', type: '茶饮', desc: '疏肝理气，和胃止痛，缓解情绪抑郁', herbs: ['佛手', '玫瑰花', '香附'] },
          { name: '香附炖鸡', type: '汤品', desc: '疏肝解郁，理气止痛，调节情志', herbs: ['香附', '鸡肉', '生姜'] }
        ],
        tebing: [
          { name: '黄芪粥', type: '粥类', desc: '补气固表，增强体质，预防过敏', herbs: ['黄芪', '大米', '大枣'] },
          { name: '灵芝茶', type: '茶饮', desc: '补气安神，增强免疫力，抗过敏', herbs: ['灵芝', '蜂蜜'] },
          { name: '防风粥', type: '粥类', desc: '祛风解表，胜湿止痛，预防过敏反应', herbs: ['防风', '大米', '生姜'] }
        ]
      }
    }
  },
  computed: {
    currentQuestion() {
      return this.questions[this.currentIndex] || {}
    },
    progressPercent() {
      if (!this.questions.length) return 0
      return ((this.currentIndex + 1) / this.questions.length * 100).toFixed(0)
    },
    headerTitle() {
      const map = {
        select: '体质测评',
        quiz: this.mode === 'quick' ? '快速测评' : '标准测评',
        result: '测评结果',
        records: '测评记录'
      }
      return map[this.viewMode] || '体质测评'
    },
    resultInfo() {
      return this.constitutionTypes[this.result && this.result.mainType] || this.constitutionTypes.pinghe
    },
    scoreList() {
      if (!this.result || !this.result.convertedScores) return []
      return Object.keys(this.result.convertedScores)
        .map(key => ({
          type: key,
          name: (this.constitutionTypes[key] || {}).name || key,
          score: this.result.convertedScores[key],
          color: (this.constitutionTypes[key] || {}).color || '#666'
        }))
        .sort((a, b) => b.score - a.score)
    },
    mixedTypes() {
      if (!this.result) return []
      if (this.result.mixedTypes && this.result.mixedTypes.length) {
        return this.result.mixedTypes.filter(t => (t.score || 0) >= 40)
      }
      const scores = this.result.convertedScores || {}
      const main = this.result.mainType
      return Object.keys(scores)
        .filter(k => k !== main && scores[k] >= 40)
        .map(k => ({
          type: k,
          name: (this.constitutionTypes[k] || {}).name || k,
          score: scores[k]
        }))
        .sort((a, b) => b.score - a.score)
    },
    recommendations() {
      if (!this.result || !this.result.mainType) return []
      return this.matchMap[this.result.mainType] || []
    }
  },
  onLoad(options) {
    if (options && options.mode) {
      this.startTest(options.mode)
    } else if (options && options.view === 'records') {
      this.viewMode = 'records'
      this.loadRecords()
    }
  },
  onShow() {
    if (this.viewMode === 'records') {
      this.loadRecords()
    }
  },
  methods: {
    async startTest(mode) {
      this.mode = mode || 'standard'
      this.viewMode = 'quiz'
      this.currentIndex = 0
      this.answers = {}
      this.questions = []
      uni.showLoading({ title: '加载中...' })
      try {
        const res = await constitutionApi.getQuestions(this.mode)
        this.questions = (res && res.questions) || []
        if (this.questions.length === 0) {
          uni.showToast({ title: '加载问卷失败', icon: 'none' })
          this.viewMode = 'select'
        }
      } catch (e) {
        uni.showToast({ title: '加载失败', icon: 'none' })
        this.viewMode = 'select'
      } finally {
        uni.hideLoading()
      }
    },
    selectOption(value) {
      this.answers[this.currentQuestion.id] = value
    },
    prevQuestion() {
      if (this.currentIndex > 0) {
        this.currentIndex--
      }
    },
    nextQuestion() {
      if (!this.answers[this.currentQuestion.id]) {
        uni.showToast({ title: '请选择答案', icon: 'none' })
        return
      }
      if (this.currentIndex < this.questions.length - 1) {
        this.currentIndex++
      }
    },
    async submitTest() {
      const unanswered = this.questions.filter(q => !this.answers[q.id])
      if (unanswered.length > 0) {
        uni.showToast({ title: `还有 ${unanswered.length} 题未作答`, icon: 'none' })
        return
      }
      const answers = Object.keys(this.answers).map(qid => ({
        qid: parseInt(qid),
        value: this.answers[qid]
      }))
      uni.showLoading({ title: '提交中...' })
      try {
        const result = await constitutionApi.submit({ answers, mode: this.mode })
        uni.hideLoading()
        if (result) {
          this.result = result
          this.viewMode = 'result'
          uni.showToast({ title: '测评完成', icon: 'success' })
        } else {
          uni.showToast({ title: '测评失败', icon: 'none' })
        }
      } catch (e) {
        uni.hideLoading()
        uni.showToast({ title: '提交失败', icon: 'none' })
      }
    },
    async viewRecords() {
      this.viewMode = 'records'
      await this.loadRecords()
    },
    async loadRecords() {
      this.recordsLoading = true
      try {
        const data = await constitutionApi.getRecords()
        let list = []
        if (Array.isArray(data)) {
          list = data
        } else if (data && data.list) {
          list = data.list
        } else if (data && Array.isArray(data.records)) {
          list = data.records
        }
        list.sort((a, b) => {
          const da = a.date || ''
          const db = b.date || ''
          return db.localeCompare(da)
        })
        this.records = list
      } catch (e) {
        this.records = []
      } finally {
        this.recordsLoading = false
      }
    },
    async viewRecordDetail(record) {
      uni.showLoading({ title: '加载中...' })
      try {
        const detail = await constitutionApi.getRecord(record.id)
        this.result = detail || record
      } catch (e) {
        this.result = record
      } finally {
        uni.hideLoading()
        this.viewMode = 'result'
      }
    },
    deleteRecord(id) {
      uni.showModal({
        title: '删除测评记录',
        content: '确定要删除这条测评记录吗？',
        success: async (res) => {
          if (!res.confirm) return
          uni.showLoading({ title: '删除中...' })
          try {
            await constitutionApi.deleteRecord(id)
            uni.hideLoading()
            uni.showToast({ title: '删除成功', icon: 'success' })
            this.loadRecords()
          } catch (e) {
            uni.hideLoading()
            uni.showToast({ title: '删除失败', icon: 'none' })
          }
        }
      })
    },
    goSelect() {
      this.viewMode = 'select'
      this.result = null
      this.questions = []
      this.answers = {}
      this.currentIndex = 0
    },
    goBack() {
      if (this.viewMode === 'select') {
        uni.navigateBack()
      } else if (this.viewMode === 'result') {
        this.viewMode = 'records'
        this.loadRecords()
      } else {
        this.viewMode = 'select'
      }
    },
    getTypeColor(type) {
      return (this.constitutionTypes[type] || {}).color || '#2d8b5e'
    },
    goToMatchDetail(m) {
      this.currentMatch = m
      this.matchSheetVisible = true
    },
    closeMatchSheet() {
      this.matchSheetVisible = false
      this.currentMatch = null
    },
    openFullMatch() {
      if (!this.currentMatch) return
      uni.setStorageSync('pendingMatchName', this.currentMatch.name)
      this.closeMatchSheet()
      uni.switchTab({
        url: '/pages/match/match'
      })
    },
    async goToHerbByTag(herbName) {
      // 根据药材名称搜索并跳转药材详情
      uni.showLoading({ title: '查找药材...' })
      try {
        const res = await herbApi.getList({ page: 1, pageSize: 500 })
        const list = (res && res.list) || []
        const matched = list.find(h => h.name === herbName) ||
          list.find(h => (h.name || '').indexOf(herbName) >= 0 || herbName.indexOf(h.name || '') >= 0)
        uni.hideLoading()
        if (matched && matched.id) {
          uni.navigateTo({
            url: `/pages/detail/detail?id=${matched.id}`
          })
        } else {
          uni.showToast({ title: `未找到药材「${herbName}」`, icon: 'none' })
        }
      } catch (e) {
        uni.hideLoading()
        uni.showToast({ title: '查找药材失败', icon: 'none' })
      }
    }
  }
}
</script>

<style>
.page {
  min-height: 100vh;
  background: #F5F1E8;
  padding-bottom: 160rpx;
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", "Microsoft YaHei", sans-serif;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 60rpx 32rpx 40rpx;
  background: linear-gradient(135deg, #8CA082 0%, #A8B89C 100%);
  color: #ffffff;
}

.header-back,
.header-right {
  width: 80rpx;
  font-size: 40rpx;
}

.back-icon {
  font-size: 40rpx;
  color: #ffffff;
}

.header-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #ffffff;
}

.content {
  padding: 24rpx;
}

.card {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
  backdrop-filter: blur(10px);
  border: 1rpx solid rgba(180, 170, 150, 0.25);
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #8CA082;
  margin-bottom: 24rpx;
  display: flex;
  align-items: center;
}

.section-title::before {
  content: '';
  width: 8rpx;
  height: 30rpx;
  background: linear-gradient(180deg, #8CA082, #A8B89C);
  border-radius: 4rpx;
  margin-right: 16rpx;
}

.intro-card {
  text-align: center;
  background: linear-gradient(135deg, #EDF0E9 0%, rgba(255, 255, 255, 0.7) 100%);
  border: 2rpx solid #D8DFD0;
}

.intro-icon {
  font-size: 80rpx;
  margin-bottom: 16rpx;
}

.intro-title {
  font-size: 38rpx;
  font-weight: 700;
  color: #8CA082;
  margin-bottom: 16rpx;
}

.intro-desc {
  font-size: 26rpx;
  color: #666;
  line-height: 1.7;
}

.mode-card {
  display: flex;
  align-items: center;
  padding: 32rpx;
}

.mode-icon {
  width: 96rpx;
  height: 96rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
  margin-right: 24rpx;
  flex-shrink: 0;
}

.standard-icon {
  background: linear-gradient(135deg, #D8DFD0, #CBD6C0);
}

.quick-icon {
  background: linear-gradient(135deg, #F5E8D0, #EDD9B5);
}

.mode-info {
  flex: 1;
  min-width: 0;
}

.mode-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #3D3D3D;
  margin-bottom: 8rpx;
}

.mode-desc {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 8rpx;
}

.mode-tag {
  font-size: 22rpx;
  color: #8CA082;
  background: rgba(140, 160, 130, 0.08);
  display: inline-block;
  padding: 4rpx 14rpx;
  border-radius: 16rpx;
}

.mode-arrow {
  font-size: 48rpx;
  color: #ccc;
  margin-left: 16rpx;
}

.records-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx;
  margin-bottom: 24rpx;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
  backdrop-filter: blur(10px);
  border: 1rpx solid rgba(180, 170, 150, 0.25);
}

.records-btn-icon {
  font-size: 32rpx;
  margin-right: 12rpx;
}

.records-btn-text {
  font-size: 28rpx;
  color: #8CA082;
  font-weight: 500;
}

.types-card {
  margin-bottom: 0;
}

.types-grid {
  display: flex;
  flex-wrap: wrap;
}

.type-item {
  width: 33.33%;
  display: flex;
  align-items: center;
  padding: 12rpx 0;
}

.type-dot {
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  margin-right: 12rpx;
  flex-shrink: 0;
}

.type-name {
  font-size: 26rpx;
  color: #3D3D3D;
}

.progress-wrap {
  margin-bottom: 24rpx;
}

.progress-bar {
  height: 12rpx;
  background: #D8DFD0;
  border-radius: 6rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #8CA082;
  border-radius: 6rpx;
  transition: width 0.3s;
}

.progress-text {
  text-align: center;
  font-size: 24rpx;
  color: #999;
  margin-top: 16rpx;
}

.question-card {
  padding: 32rpx;
}

.question-index {
  font-size: 24rpx;
  color: #8CA082;
  margin-bottom: 16rpx;
}

.question-text {
  font-size: 34rpx;
  font-weight: 600;
  color: #3D3D3D;
  line-height: 1.6;
  margin-bottom: 32rpx;
}

.options-list {
  display: flex;
  flex-direction: column;
}

.option-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  border: 2rpx solid #e5e7eb;
  border-radius: 16rpx;
  margin-bottom: 16rpx;
  background: #ffffff;
  transition: all 0.2s;
}

.option-item:last-child {
  margin-bottom: 0;
}

.option-item.selected {
  border-color: #8CA082;
  background: #EDF0E9;
}

.option-letter {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  font-weight: 600;
  color: #6b7280;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.option-item.selected .option-letter {
  background: #8CA082;
  color: #ffffff;
}

.option-text {
  flex: 1;
  font-size: 28rpx;
  color: #3D3D3D;
  line-height: 1.5;
}

.option-item.selected .option-text {
  color: #8CA082;
  font-weight: 500;
}

.option-check {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: bold;
  color: #8CA082;
  margin-left: 12rpx;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
  color: #999;
  font-size: 28rpx;
}

.loading-spinner {
  width: 50rpx;
  height: 50rpx;
  border: 4rpx solid #D8DFD0;
  border-top-color: #8CA082;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20rpx;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.result-hero {
  text-align: center;
  padding: 48rpx 32rpx;
  border-radius: 16rpx;
  margin-bottom: 24rpx;
  color: #ffffff;
}

.result-icon {
  font-size: 96rpx;
  margin-bottom: 16rpx;
}

.result-title {
  font-size: 44rpx;
  font-weight: 700;
  margin-bottom: 12rpx;
}

.result-desc {
  font-size: 26rpx;
  opacity: 0.9;
}

.score-card {
  padding: 32rpx;
}

.score-list {
  display: flex;
  flex-direction: column;
}

.score-item {
  margin-bottom: 20rpx;
}

.score-item:last-child {
  margin-bottom: 0;
}

.score-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8rpx;
}

.score-name {
  font-size: 26rpx;
  color: #3D3D3D;
}

.score-value {
  font-size: 26rpx;
  font-weight: 600;
}

.score-bar {
  height: 16rpx;
  background: #EDF0E9;
  border-radius: 8rpx;
  overflow: hidden;
}

.score-fill {
  height: 100%;
  border-radius: 8rpx;
  transition: width 0.4s;
}

.mixed-card {
  padding: 32rpx;
}

.mixed-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.mixed-tag {
  font-size: 24rpx;
  color: #666;
  background: #f8fafc;
  border: 1rpx solid #D8DFD0;
  padding: 8rpx 20rpx;
  border-radius: 24rpx;
}

.match-card {
  padding: 32rpx;
}

.match-list {
  display: flex;
  flex-direction: column;
}

.match-item {
  background: #f8fafc;
  border-left: 6rpx solid #8CA082;
  border-radius: 0 12rpx 12rpx 0;
  padding: 24rpx;
  margin-bottom: 16rpx;
  transition: background 0.2s;
}

.match-item:active {
  background: #EDF0E9;
}

.match-item:last-child {
  margin-bottom: 0;
}

.match-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.match-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #3D3D3D;
}

.match-type {
  font-size: 22rpx;
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
  padding: 4rpx 16rpx;
  border-radius: 16rpx;
}

.match-desc {
  font-size: 24rpx;
  color: #666;
  line-height: 1.6;
  margin-bottom: 12rpx;
}

.match-herbs-label {
  font-size: 22rpx;
  color: #999;
  margin-bottom: 8rpx;
}

.match-herbs {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.herb-tag {
  font-size: 22rpx;
  color: #8CA082;
  background: rgba(140, 160, 130, 0.08);
  border: 1rpx solid rgba(140, 160, 130, 0.2);
  padding: 6rpx 16rpx;
  border-radius: 16rpx;
  transition: all 0.2s;
}

.herb-tag:active {
  background: rgba(140, 160, 130, 0.2);
  transform: scale(0.95);
}

.match-empty {
  text-align: center;
  color: #999;
  font-size: 26rpx;
  padding: 32rpx 0;
}

.result-date {
  text-align: center;
  font-size: 24rpx;
  color: #999;
  margin: 16rpx 0 32rpx;
}

.records-header {
  margin-bottom: 16rpx;
}

.records-count {
  font-size: 26rpx;
  color: #999;
}

.empty-card {
  text-align: center;
  padding: 80rpx 32rpx;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 16rpx;
}

.empty-text {
  font-size: 30rpx;
  color: #3D3D3D;
  margin-bottom: 8rpx;
}

.empty-tip {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 32rpx;
}

.empty-btn {
  display: inline-block;
  padding: 16rpx 48rpx;
  background: linear-gradient(135deg, #8CA082, #A8B89C);
  color: #ffffff;
  font-size: 28rpx;
  border-radius: 40rpx;
}

.record-card {
  display: flex;
  align-items: center;
  padding: 24rpx;
}

.record-icon {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.record-info {
  flex: 1;
  min-width: 0;
}

.record-name {
  font-size: 30rpx;
  font-weight: 600;
  margin-bottom: 6rpx;
}

.record-meta {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 4rpx;
}

.record-date {
  font-size: 22rpx;
  color: #999;
}

.record-mixed {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  margin-right: 16rpx;
  align-items: flex-end;
}

.record-mixed-tag {
  font-size: 20rpx;
  color: #666;
  background: #f8fafc;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
}

.record-del {
  font-size: 24rpx;
  color: #dc2626;
  background: rgba(239, 68, 68, 0.08);
  border: 1rpx solid rgba(239, 68, 68, 0.2);
  padding: 10rpx 20rpx;
  border-radius: 24rpx;
  flex-shrink: 0;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 20rpx;
  padding: 20rpx 24rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: rgba(255, 255, 255, 0.7);
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.03);
  backdrop-filter: blur(10px);
  border-top: 1rpx solid rgba(180, 170, 150, 0.25);
}

.btn {
  flex: 1;
  text-align: center;
  padding: 22rpx 0;
  border-radius: 44rpx;
  font-size: 30rpx;
  font-weight: 500;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.7);
  color: #8CA082;
  border: 2rpx solid #8CA082;
}

.btn-primary {
  background: linear-gradient(135deg, #8CA082, #A8B89C);
  color: #ffffff;
}

.btn-success {
  background: linear-gradient(135deg, #8CA082, #A8B89C);
  color: #ffffff;
}

/* 底部弹框样式 */
.match-sheet-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  animation: fadeIn 0.2s ease;
}

.match-sheet {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;
  z-index: 1000;
  transform: translateY(100%);
  transition: transform 0.3s ease;
  max-height: 75vh;
  display: flex;
  flex-direction: column;
}

.match-sheet-show {
  transform: translateY(0);
}

.match-sheet-handle {
  width: 60rpx;
  height: 8rpx;
  background: #ddd;
  border-radius: 4rpx;
  margin: 16rpx auto 8rpx;
}

.match-sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 32rpx 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.match-sheet-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #3D3D3D;
}

.match-sheet-close {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 28rpx;
}

.match-sheet-content {
  flex: 1;
  padding: 24rpx 32rpx;
  overflow-y: auto;
}

.ms-hero {
  background: linear-gradient(135deg, #8CA082 0%, #A8B89C 100%);
  border-radius: 20rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
}

.ms-hero-name {
  display: block;
  font-size: 40rpx;
  font-weight: 700;
  color: #fff;
  margin-bottom: 8rpx;
}

.ms-hero-type {
  display: inline-block;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.2);
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
}

.ms-section {
  margin-bottom: 28rpx;
}

.ms-section-label {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #3D3D3D;
  margin-bottom: 12rpx;
}

.ms-section-text {
  display: block;
  font-size: 28rpx;
  color: #666;
  line-height: 1.8;
}

.ms-herbs-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.ms-herb-tag {
  background: rgba(140, 160, 130, 0.1);
  color: #8CA082;
  font-size: 26rpx;
  padding: 12rpx 24rpx;
  border-radius: 30rpx;
  border: 1rpx solid rgba(140, 160, 130, 0.3);
}

.ms-herb-tag:active {
  background: rgba(140, 160, 130, 0.2);
}

.match-sheet-footer {
  padding: 20rpx 32rpx 40rpx;
  border-top: 1rpx solid #f0f0f0;
}

.ms-btn-primary {
  background: linear-gradient(135deg, #8CA082 0%, #A8B89C 100%);
  color: #fff;
  text-align: center;
  padding: 24rpx;
  border-radius: 48rpx;
  font-size: 30rpx;
  font-weight: 600;
}

.ms-btn-primary:active {
  opacity: 0.9;
}

.ms-loading {
  text-align: center;
  color: #999;
  font-size: 26rpx;
  padding: 32rpx;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}</style>
