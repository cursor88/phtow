const express = require('express')
const router = express.Router()
const foodMatches = require('../data/foodMatches')
const herbs = require('../data/herbs')

const symptomKeywordMap = {
  '口干舌燥': ['滋阴', '生津', '润燥', '阴虚', '口干'],
  '口干': ['滋阴', '生津', '润燥', '阴虚'],
  '嗓子干': ['滋阴', '生津', '润燥', '利咽'],
  '喉咙痛': ['清热', '解毒', '利咽', '咽喉肿痛'],
  '咽喉肿痛': ['清热', '解毒', '利咽', '咽喉肿痛'],
  '失眠': ['安神', '养血', '补气', '失眠多梦'],
  '睡不着': ['安神', '养血', '补气', '失眠多梦'],
  '疲劳': ['补气', '养血', '益气', '增强体质', '乏力'],
  '乏力': ['补气', '养血', '益气', '增强体质', '乏力倦怠'],
  '没精神': ['补气', '养血', '益气', '提神'],
  '气血不足': ['补气', '养血', '气血两虚', '气血不足'],
  '头晕': ['补气', '养血', '益气', '头晕'],
  '头痛': ['清热', '疏风', '祛风', '止痛'],
  '感冒': ['清热', '疏风', '解表', '感冒'],
  '发烧': ['清热', '解毒', '退烧', '风热感冒'],
  '咳嗽': ['润肺', '止咳', '化痰', '平喘', '燥咳'],
  '有痰': ['化痰', '止咳', '润肺', '祛湿'],
  '湿气重': ['祛湿', '健脾', '利水', '水肿', '湿盛'],
  '水肿': ['利水', '消肿', '祛湿', '健脾'],
  '消化不良': ['健脾', '益胃', '消食', '食欲不振'],
  '胃口不好': ['健脾', '益胃', '开胃', '食欲不振'],
  '脾胃虚弱': ['健脾', '益胃', '补气', '脾胃虚弱'],
  '拉肚子': ['健脾', '止泻', '祛湿', '便溏'],
  '便秘': ['润肠', '通便', '清热', '润燥'],
  '皮肤干燥': ['滋阴', '润肺', '养颜', '润肤'],
  '长痘': ['清热', '解毒', '泻火', '排毒'],
  '上火': ['清热', '降火', '解毒', '泻火'],
  '火气大': ['清热', '降火', '解毒', '泻火'],
  '眼睛干涩': ['明目', '养肝', '清肝', '护眼'],
  '眼疲劳': ['明目', '养肝', '清肝', '护眼'],
  '月经不调': ['调经', '养血', '补气', '活血'],
  '痛经': ['调经', '止痛', '养血', '散寒'],
  '怕冷': ['温中', '散寒', '补气', '壮阳'],
  '手脚冰凉': ['温中', '散寒', '补气', '养血'],
  '腰酸': ['补肾', '壮腰', '强筋骨', '腰膝酸软'],
  '腰膝酸软': ['补肾', '壮腰', '强筋骨', '腰膝酸软'],
  '记忆力差': ['益智', '安神', '补脑', '增强记忆'],
  '免疫力低': ['增强体质', '补气', '养血', '提高免疫力']
}

function extractKeywords(text) {
  const keywords = new Set()
  const cleanText = String(text || '').toLowerCase().trim()
  
  for (const [symptom, relatedWords] of Object.entries(symptomKeywordMap)) {
    if (cleanText.includes(symptom.toLowerCase())) {
      relatedWords.forEach(w => keywords.add(w.toLowerCase()))
    }
  }
  
  const words = cleanText.split(/[，。！？、\s]+/).filter(w => w.length >= 2)
  words.forEach(w => keywords.add(w))
  
  return Array.from(keywords)
}

function calculateMatchScore(match, keywords) {
  let score = 0
  const fields = [
    { text: match.effect, weight: 3 },
    { text: match.suitable, weight: 2 },
    { text: match.name, weight: 2 },
    { text: (match.ingredients || []).join(','), weight: 1 }
  ]
  
  const herb = herbs.find(h => h.id === match.herbId)
  if (herb) {
    fields.push({ text: herb.effect || '', weight: 2 })
    fields.push({ text: herb.name || '', weight: 1 })
  }
  
  for (const keyword of keywords) {
    const kw = keyword.toLowerCase()
    for (const field of fields) {
      const fieldText = String(field.text || '').toLowerCase()
      if (fieldText.includes(kw)) {
        score += field.weight
      }
    }
  }
  
  return score
}

router.get('/search', (req, res) => {
  const { keyword } = req.query
  
  if (!keyword || !keyword.trim()) {
    return res.json({
      code: 0,
      message: '成功',
      data: []
    })
  }
  
  const keywords = extractKeywords(keyword)
  
  const scored = foodMatches.map(match => {
    const score = calculateMatchScore(match, keywords)
    const herb = herbs.find(h => h.id === match.herbId)
    return {
      ...match,
      herbName: herb ? herb.name : '',
      score
    }
  })
  
  const results = scored
    .filter(m => m.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
  
  res.json({
    code: 0,
    message: '成功',
    data: {
      list: results,
      total: results.length,
      matchedKeywords: keywords
    }
  })
})

router.get('/list', (req, res) => {
  const { herbId } = req.query
  let list = foodMatches
  
  if (herbId) {
    const herb = herbs.find(h => h.id === parseInt(herbId))
    if (herb) {
      list = foodMatches.filter(m => herb.food_match.includes(m.id))
    }
  }
  
  res.json({
    code: 0,
    message: '成功',
    data: list
  })
})

router.get('/detail/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const match = foodMatches.find(m => m.id === id)
  
  if (!match) {
    return res.json({
      code: 404,
      message: '搭配不存在',
      data: null
    })
  }
  
  const herb = herbs.find(h => h.id === match.herbId)
  
  res.json({
    code: 0,
    message: '成功',
    data: {
      ...match,
      herbName: herb ? herb.name : ''
    }
  })
})

module.exports = router
