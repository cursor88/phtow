<template>
  <view class="page">
    <view class="header">
      <view class="header-left" @click="goBack">
        <text>←</text>
      </view>
      <view class="header-title">体质测评结果</view>
      <view class="header-right"></view>
    </view>

    <view class="result-hero" :style="{ background: 'linear-gradient(135deg, ' + resultInfo.color + ', ' + resultInfo.color + 'dd)' }">
      <view class="hero-icon">🧬</view>
      <view class="hero-title">{{ result.mainTypeName || '--' }}</view>
      <view class="hero-desc">{{ resultInfo.desc || '' }}</view>
      <view class="hero-score">
        <text class="score-num">{{ result.mainScore || 0 }}</text>
        <text class="score-percent">%</text>
        <text class="score-label">主要体质得分</text>
      </view>
    </view>

    <view class="result-body">
      <view class="card">
        <view class="section-title">📊 各体质得分详情</view>
        <view class="score-list">
          <view class="score-item" v-for="item in scoreList" :key="item.type">
            <view class="score-row">
              <view class="score-left">
                <view class="score-dot" :style="{ background: item.color }"></view>
                <text class="score-name">{{ item.name }}</text>
                <text v-if="item.type === result.mainType" class="main-tag">主</text>
              </view>
              <text class="score-value" :style="{ color: item.color }">{{ item.score }}%</text>
            </view>
            <view class="score-bar">
              <view class="score-fill" :style="{ width: item.score + '%', background: item.color }"></view>
            </view>
          </view>
        </view>
      </view>

      <view class="card" v-if="result.mixedTypes && result.mixedTypes.length > 0">
        <view class="section-title">🧩 兼夹体质</view>
        <view class="mixed-desc">除主体质外，您可能同时具有以下体质特征：</view>
        <view class="mixed-tags">
          <view class="mixed-tag" v-for="t in result.mixedTypes" :key="t.type">
            <text class="mixed-name">{{ t.name }}</text>
            <text class="mixed-score">{{ t.score }}%</text>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="section-title">💡 体质特点与建议</view>
        <view class="suggestion-list">
          <view class="suggestion-item">
            <view class="suggestion-icon">🌿</view>
            <view class="suggestion-content">
              <view class="suggestion-title">饮食调养</view>
              <view class="suggestion-desc">{{ suggestions.diet }}</view>
            </view>
          </view>
          <view class="suggestion-item">
            <view class="suggestion-icon">🏃</view>
            <view class="suggestion-content">
              <view class="suggestion-title">运动保健</view>
              <view class="suggestion-desc">{{ suggestions.exercise }}</view>
            </view>
          </view>
          <view class="suggestion-item">
            <view class="suggestion-icon">😴</view>
            <view class="suggestion-content">
              <view class="suggestion-title">起居调摄</view>
              <view class="suggestion-desc">{{ suggestions.lifestyle }}</view>
            </view>
          </view>
          <view class="suggestion-item">
            <view class="suggestion-icon">🧘</view>
            <view class="suggestion-content">
              <view class="suggestion-title">情志调节</view>
              <view class="suggestion-desc">{{ suggestions.emotion }}</view>
            </view>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="section-title">🍲 药食同源搭配建议</view>
        <view class="match-list">
          <view class="match-item" v-for="(match, idx) in matchSuggestions" :key="idx">
            <view class="match-header">
              <text class="match-name">{{ match.name }}</text>
              <text class="match-tag">{{ match.type }}</text>
            </view>
            <view class="match-desc">{{ match.desc }}</view>
            <view class="match-herbs">
              <text class="match-herbs-label">涉及药材：</text>
              <view class="match-herbs-list">
                <view class="match-herb-tag" v-for="(h, hIdx) in match.herbs" :key="hIdx" @click="goToHerbDetail(h)">
                  {{ h }}
                  <text class="arrow">→</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="section-title">🌱 推荐药材</view>
        <view class="herb-list">
          <view class="herb-tag" v-for="(h, idx) in relatedHerbs" :key="idx" @click="goToHerbDetail(h)">
            {{ h }}
            <text class="arrow">→</text>
          </view>
        </view>
      </view>

      <view class="card notice-card">
        <view class="notice-title">📌 重要提示</view>
        <view class="notice-text">本测评结果仅供参考，不能替代专业医生诊断。如有明显不适，请及时就医。</view>
      </view>

      <view class="result-meta">
        <text>测评时间：{{ result.date || '' }}</text>
        <text>测评方式：{{ result.mode === 'quick' ? '快速测评' : '标准测评' }}</text>
      </view>
    </view>

    <view class="bottom-bar">
      <view class="btn btn-secondary" @click="goBack">返回</view>
      <view class="btn btn-primary" @click="goToList">查看我的测评</view>
    </view>
  </view>
</template>

<script>
import { constitutionApi } from '@/api/index.js'

export default {
  data() {
    return {
      result: {},
      constitutionTypes: {
        pinghe: { name: '平和质', color: '#10b981', desc: '精力充沛，适应力强' },
        qixu: { name: '气虚质', color: '#f59e0b', desc: '容易疲劳，活动气短' },
        yangxu: { name: '阳虚质', color: '#3b82f6', desc: '手脚冰凉，尤其怕冷' },
        yinxu: { name: '阴虚质', color: '#ef4444', desc: '手心发热，口干舌燥' },
        tanshi: { name: '痰湿质', color: '#84cc16', desc: '身体沉重，腹部肥软' },
        shire: { name: '湿热质', color: '#a855f7', desc: '面部油腻，易长痘痘' },
        xueyu: { name: '血瘀质', color: '#7c3aed', desc: '皮肤暗沉，容易淤青' },
        qiyu: { name: '气郁质', color: '#06b6d4', desc: '情绪抑郁，经常叹气' },
        tebing: { name: '特禀质', color: '#ec4899', desc: '容易过敏' }
      },
      suggestionsMap: {
        pinghe: { diet: '饮食有节，不偏不嗜，多吃五谷杂粮、蔬菜水果', exercise: '适度运动，如八段锦、太极、慢跑等', lifestyle: '起居有常，不妄作劳', emotion: '保持心情舒畅，戒骄戒躁' },
        qixu: { diet: '多食补气食物，如山药、大枣、黄芪、鸡肉等', exercise: '避免剧烈运动，宜散步、太极等温和运动', lifestyle: '注意休息，避免过度劳累', emotion: '保持乐观，避免忧思过度' },
        yangxu: { diet: '多食温阳食物，如羊肉、生姜、桂圆、肉桂等', exercise: '适当运动，多晒太阳', lifestyle: '注意保暖，特别是腰腹和脚部', emotion: '保持心情愉悦，多听轻松音乐' },
        yinxu: { diet: '多食滋阴食物，如银耳、百合、麦冬、梨等', exercise: '避免高温环境，宜清晨或傍晚锻炼', lifestyle: '保持充足睡眠，避免熬夜', emotion: '保持心情平静，避免急躁' },
        tanshi: { diet: '饮食清淡，少食肥甘厚腻，多吃薏苡仁、冬瓜、荷叶等', exercise: '坚持运动，多出汗有助于化湿', lifestyle: '远离潮湿环境，居室保持干燥', emotion: '多参与户外活动，舒展情志' },
        shire: { diet: '清淡饮食，多食绿豆、苦瓜、冬瓜、薏米等', exercise: '适当运动，避免高温时段', lifestyle: '戒烟限酒，保持皮肤清洁', emotion: '戒怒戒躁，保持心平气和' },
        xueyu: { diet: '多食活血化瘀食物，如山楂、红花、玫瑰花、黑木耳等', exercise: '坚持运动，促进血液循环', lifestyle: '避免久坐，多做伸展运动', emotion: '保持心情舒畅，多听欢快音乐' },
        qiyu: { diet: '多食理气解郁食物，如陈皮、玫瑰花、佛手、香橼等', exercise: '多参加集体活动，户外运动', lifestyle: '保持规律作息，睡前避免饮茶咖啡', emotion: '学会倾诉，培养兴趣爱好' },
        tebing: { diet: '饮食清淡，避免辛辣、海鲜等发物', exercise: '适度运动，增强体质', lifestyle: '保持环境清洁，避免接触过敏原', emotion: '保持心情平和，避免紧张焦虑' }
      },
      herbsMap: {
        pinghe: ['山药', '大枣', '枸杞'],
        qixu: ['人参', '黄芪', '党参', '山药'],
        yangxu: ['肉桂', '干姜', '附子', '鹿茸'],
        yinxu: ['麦冬', '沙参', '玉竹', '百合'],
        tanshi: ['薏苡仁', '茯苓', '荷叶', '冬瓜'],
        shire: ['薏苡仁', '绿豆', '栀子', '茵陈'],
        xueyu: ['丹参', '红花', '桃仁', '川芎'],
        qiyu: ['陈皮', '香附', '佛手', '玫瑰花'],
        tebing: ['黄芪', '灵芝', '防风', '甘草']
      },
      matchSuggestionsMap: {
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
    resultInfo() {
      return this.constitutionTypes[this.result.mainType] || {}
    },
    scoreList() {
      if (!this.result.convertedScores) return []
      return Object.keys(this.result.convertedScores)
        .map(key => ({
          type: key,
          name: this.constitutionTypes[key]?.name || '',
          score: this.result.convertedScores[key],
          color: this.constitutionTypes[key]?.color || '#666'
        }))
        .sort((a, b) => b.score - a.score)
    },
    suggestions() {
      return this.suggestionsMap[this.result.mainType] || { diet: '暂无建议', exercise: '暂无建议', lifestyle: '暂无建议', emotion: '暂无建议' }
    },
    relatedHerbs() {
      return this.herbsMap[this.result.mainType] || []
    },
    matchSuggestions() {
      return this.matchSuggestionsMap[this.result.mainType] || []
    }
  },
  onLoad(options) {
    if (options.data) {
      try {
        this.result = JSON.parse(decodeURIComponent(options.data))
      } catch (e) {
        console.error('解析测评结果失败', e)
      }
    } else if (options.id) {
      this.loadRecord(parseInt(options.id))
    }
  },
  methods: {
    async loadRecord(id) {
      try {
        const record = await constitutionApi.getRecord(id)
        this.result = record
      } catch (e) {
        uni.showToast({ title: '加载失败', icon: 'none' })
      }
    },
    goBack() {
      uni.navigateBack()
    },
    goToList() {
      uni.switchTab({
        url: '/pages/mine/mine'
      })
    },
    goToHerbDetail(herbName) {
      uni.navigateTo({
        url: `/pages/detail/detail?name=${encodeURIComponent(herbName)}`
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: $bg-primary;
  padding-bottom: 140rpx;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 60rpx $spacing-lg $spacing-md;
  background: $bg-card;

  .header-left, .header-right {
    width: 80rpx;
    font-size: 36rpx;
    color: $text-primary;
    cursor: pointer;
  }

  .header-title {
    font-size: $font-size-xl;
    font-weight: $font-weight-semibold;
    color: $text-primary;
  }
}

.result-hero {
  margin: $spacing-lg;
  padding: $spacing-2xl $spacing-lg;
  border-radius: $radius-xl;
  text-align: center;
  color: #FFFFFF;
  box-shadow: $shadow-lg;

  .hero-icon {
    width: 140rpx;
    height: 140rpx;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 80rpx;
    margin: 0 auto $spacing-md;
  }

  .hero-title {
    font-size: $font-size-display;
    font-weight: $font-weight-bold;
    margin-bottom: $spacing-xs;
  }

  .hero-desc {
    font-size: $font-size-sm;
    opacity: 0.9;
    margin-bottom: $spacing-lg;
  }

  .hero-score {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: $spacing-xs;
    margin-top: $spacing-md;

    .score-num {
      font-size: 80rpx;
      font-weight: $font-weight-bold;
    }

    .score-percent {
      font-size: $font-size-xl;
      font-weight: $font-weight-semibold;
    }

    .score-label {
      font-size: $font-size-sm;
      opacity: 0.85;
      margin-left: $spacing-sm;
    }
  }
}

.result-body {
  padding: 0 $spacing-lg;
}

.card {
  background: $bg-card;
  border-radius: $radius-lg;
  padding: $spacing-lg;
  margin-bottom: $spacing-lg;
  box-shadow: $shadow-card;
}

.section-title {
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  margin-bottom: $spacing-lg;
}

.score-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.score-item {
  .score-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10rpx;
  }

  .score-left {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
  }

  .score-dot {
    width: 16rpx;
    height: 16rpx;
    border-radius: 50%;
  }

  .score-name {
    font-size: $font-size-base;
    color: $text-primary;
    font-weight: $font-weight-medium;
  }

  .main-tag {
    font-size: $font-size-xs;
    color: #FFFFFF;
    background: $warning-color;
    padding: 2rpx 12rpx;
    border-radius: $radius-full;
  }

  .score-value {
    font-size: $font-size-base;
    font-weight: $font-weight-bold;
  }

  .score-bar {
    height: 16rpx;
    background: $bg-secondary;
    border-radius: $radius-full;
    overflow: hidden;
  }

  .score-fill {
    height: 100%;
    border-radius: $radius-full;
    transition: width 0.5s ease;
  }
}

.mixed-desc {
  font-size: $font-size-sm;
  color: $text-secondary;
  margin-bottom: $spacing-md;
}

.mixed-tags {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-md;
}

.mixed-tag {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  font-size: $font-size-sm;
  color: $text-secondary;
  background: $bg-secondary;
  padding: 12rpx 20rpx;
  border-radius: $radius-full;

  .mixed-name {
    font-weight: $font-weight-medium;
  }

  .mixed-score {
    color: $text-muted;
    font-size: $font-size-xs;
  }
}

.suggestion-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.suggestion-item {
  display: flex;
  align-items: flex-start;
  gap: $spacing-lg;

  .suggestion-icon {
    width: 72rpx;
    height: 72rpx;
    border-radius: $radius-md;
    background: rgba($cta-color, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36rpx;
    flex-shrink: 0;
  }

  .suggestion-content {
    flex: 1;
    min-width: 0;
  }

  .suggestion-title {
    font-size: $font-size-base;
    color: $text-primary;
    font-weight: $font-weight-semibold;
    margin-bottom: $spacing-xs;
  }

  .suggestion-desc {
    font-size: $font-size-sm;
    color: $text-secondary;
    line-height: 1.6;
  }
}

.match-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.match-item {
  padding: $spacing-lg;
  background: $bg-secondary;
  border-radius: $radius-md;
  border-left: 4rpx solid $cta-color;

  .match-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-sm;
  }

  .match-name {
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    color: $text-primary;
  }

  .match-tag {
    font-size: $font-size-xs;
    color: $warning-color;
    background: rgba($warning-color, 0.1);
    padding: 4rpx 16rpx;
    border-radius: $radius-full;
  }

  .match-desc {
    font-size: $font-size-sm;
    color: $text-secondary;
    line-height: 1.5;
    margin-bottom: $spacing-md;
  }

  .match-herbs {
    .match-herbs-label {
      font-size: $font-size-sm;
      color: $text-muted;
      margin-bottom: $spacing-xs;
      display: block;
    }
  }

  .match-herbs-list {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-sm;
  }

  .match-herb-tag {
    display: flex;
    align-items: center;
    gap: 6rpx;
    font-size: $font-size-sm;
    color: $primary-color;
    background: rgba($primary-color, 0.08);
    border: 1rpx solid rgba($primary-color, 0.2);
    padding: 8rpx 16rpx;
    border-radius: $radius-full;
    cursor: pointer;
    transition: all $transition-normal;

    &:active {
      background: rgba($primary-color, 0.15);
      transform: scale(0.98);
    }

    .arrow {
      font-size: $font-size-xs;
      opacity: 0.7;
    }
  }
}

.herb-list {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-md;
}

.herb-tag {
  display: flex;
  align-items: center;
  gap: 6rpx;
  font-size: $font-size-sm;
  color: $cta-color;
  background: rgba($cta-color, 0.08);
  border: 1rpx solid rgba($cta-color, 0.2);
  padding: 12rpx 24rpx;
  border-radius: $radius-full;
  cursor: pointer;
  transition: all $transition-normal;

  &:active {
    background: rgba($cta-color, 0.15);
    transform: scale(0.98);
  }

  .arrow {
    font-size: $font-size-xs;
    opacity: 0.7;
  }
}

.notice-card {
  background: rgba($warning-color, 0.06);
  border: 1rpx solid rgba($warning-color, 0.2);

  .notice-title {
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    color: darken($warning-color, 20%);
    margin-bottom: $spacing-sm;
  }

  .notice-text {
    font-size: $font-size-sm;
    color: darken($warning-color, 25%);
    line-height: 1.6;
  }
}

.result-meta {
  display: flex;
  justify-content: space-between;
  font-size: $font-size-xs;
  color: $text-muted;
  padding: $spacing-md $spacing-lg;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: $spacing-lg;
  padding-bottom: calc($spacing-lg + env(safe-area-inset-bottom));
  background: $bg-card;
  display: flex;
  gap: $spacing-lg;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.06);

  .btn {
    flex: 1;
    padding: $spacing-lg;
    border-radius: $radius-lg;
    font-size: $font-size-base;
    text-align: center;
    font-weight: $font-weight-medium;
    cursor: pointer;
    transition: opacity $transition-normal, transform $transition-normal;

    &:active {
      opacity: 0.8;
      transform: scale(0.98);
    }

    &.btn-secondary {
      background: $bg-secondary;
      color: $text-secondary;
    }

    &.btn-primary {
      background: $primary-color;
      color: #FFFFFF;
    }
  }
}
</style>
