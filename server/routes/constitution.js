const express = require('express')
const router = express.Router()
const path = require('path')
const fs = require('fs')
const paths = require('../config/paths')

const DATA_FILE = paths.CONSTITUTION_RECORDS

const constitutionTypes = {
  pinghe: { name: '平和质', desc: '精力充沛，适应力强，很少不适', color: '#10b981', icon: '☀️' },
  qixu: { name: '气虚质', desc: '容易疲劳，稍微活动就气短', color: '#f59e0b', icon: '💨' },
  yangxu: { name: '阳虚质', desc: '手脚冰凉，尤其怕冷', color: '#3b82f6', icon: '❄️' },
  yinxu: { name: '阴虚质', desc: '感到手脚心发热，口干舌燥', color: '#ef4444', icon: '🔥' },
  tanshi: { name: '痰湿质', desc: '身体沉重，腹部肥软，痰多', color: '#84cc16', icon: '☁️' },
  shire: { name: '湿热质', desc: '面部油腻，易长痘痘或疮疡', color: '#a855f7', icon: '🌶️' },
  xueyu: { name: '血瘀质', desc: '皮肤暗沉、容易出现淤青', color: '#7c3aed', icon: '🩸' },
  qiyu: { name: '气郁质', desc: '情绪抑郁，经常叹气或失眠', color: '#06b6d4', icon: '🌧️' },
  tebing: { name: '特禀质', desc: '容易过敏（如鼻炎、荨麻疹）', color: '#ec4899', icon: '🌸' }
}

const standardQuestions = [
  { id: 1, type: 'pinghe', text: '您精力充沛吗？' },
  { id: 2, type: 'pinghe', text: '您容易疲乏吗？', reverse: true },
  { id: 3, type: 'pinghe', text: '您说话声音响亮吗？' },
  { id: 4, type: 'pinghe', text: '您容易气短（呼吸短促，接不上气）吗？', reverse: true },
  { id: 5, type: 'pinghe', text: '您精神状态好吗？' },
  { id: 6, type: 'pinghe', text: '您情绪低落吗？', reverse: true },
  { id: 7, type: 'pinghe', text: '您能适应自然环境变化吗？' },
  { id: 8, type: 'pinghe', text: '您容易失眠吗？', reverse: true },
  
  { id: 9, type: 'qixu', text: '您容易疲乏吗？' },
  { id: 10, type: 'qixu', text: '您容易气短（呼吸短促，接不上气）吗？' },
  { id: 11, type: 'qixu', text: '您容易心慌吗？' },
  { id: 12, type: 'qixu', text: '您容易头晕或站起时眩晕吗？' },
  { id: 13, type: 'qixu', text: '您比别人容易感冒吗？' },
  { id: 14, type: 'qixu', text: '您喜欢安静、懒得说话吗？' },
  
  { id: 15, type: 'yangxu', text: '您手脚发凉吗？' },
  { id: 16, type: 'yangxu', text: '您胃脘部、背部或腰膝部怕冷吗？' },
  { id: 17, type: 'yangxu', text: '您怕冷吗？' },
  { id: 18, type: 'yangxu', text: '您容易腹泻或大便稀溏吗？' },
  { id: 19, type: 'yangxu', text: '您夜尿多吗？' },
  { id: 20, type: 'yangxu', text: '您精神不振吗？' },
  
  { id: 21, type: 'yinxu', text: '您感到口干咽燥、总想喝水吗？' },
  { id: 22, type: 'yinxu', text: '您感到手脚心发热吗？' },
  { id: 23, type: 'yinxu', text: '您面部或两颧潮红吗？' },
  { id: 24, type: 'yinxu', text: '您口唇颜色偏红吗？' },
  { id: 25, type: 'yinxu', text: '您容易便秘或大便干燥吗？' },
  { id: 26, type: 'yinxu', text: '您夜间容易盗汗吗？' },
  
  { id: 27, type: 'tanshi', text: '您感到胸闷或腹部胀满吗？' },
  { id: 28, type: 'tanshi', text: '您身体沉重不舒或身体困重吗？' },
  { id: 29, type: 'tanshi', text: '您腹部肥满松软吗？' },
  { id: 30, type: 'tanshi', text: '您感到痰多、咽喉部有痰堵着吗？' },
  { id: 31, type: 'tanshi', text: '您舌苔厚腻或有舌苔厚厚的感觉吗？' },
  { id: 32, type: 'tanshi', text: '您容易困倦吗？' },
  
  { id: 33, type: 'shire', text: '您面部或鼻部油腻吗？' },
  { id: 34, type: 'shire', text: '您容易生痤疮或疮疖吗？' },
  { id: 35, type: 'shire', text: '您感到口苦或嘴里有异味吗？' },
  { id: 36, type: 'shire', text: '您大便黏滞不畅或大便有解不尽的感觉吗？' },
  { id: 37, type: 'shire', text: '您小便时尿道有发热感、尿色浓（深）吗？' },
  { id: 38, type: 'shire', text: '您带下色黄（白带颜色发黄）吗？' },
  
  { id: 39, type: 'xueyu', text: '您的皮肤在不知不觉中会出现青紫瘀斑（皮下出血）吗？' },
  { id: 40, type: 'xueyu', text: '您身体上有哪里疼痛吗？' },
  { id: 41, type: 'xueyu', text: '您面色晦黯或容易出现褐斑吗？' },
  { id: 42, type: 'xueyu', text: '您容易出现黑眼圈吗？' },
  { id: 43, type: 'xueyu', text: '您容易忘事（健忘）吗？' },
  { id: 44, type: 'xueyu', text: '您口唇颜色偏黯吗？' },
  
  { id: 45, type: 'qiyu', text: '您感到闷闷不乐、情绪低沉吗？' },
  { id: 46, type: 'qiyu', text: '您容易精神紧张、焦虑不安吗？' },
  { id: 47, type: 'qiyu', text: '您容易多愁善感、感情脆弱吗？' },
  { id: 48, type: 'qiyu', text: '您容易感到害怕或受到惊吓吗？' },
  { id: 49, type: 'qiyu', text: '您经常感到闷闷不乐吗？' },
  { id: 50, type: 'qiyu', text: '您容易失眠吗？' },
  
  { id: 51, type: 'tebing', text: '您没有感冒时也会打喷嚏吗？' },
  { id: 52, type: 'tebing', text: '您没有感冒时也会鼻塞、流鼻涕吗？' },
  { id: 53, type: 'tebing', text: '您容易过敏（药物、食物、气味、花粉、季节交替、温度变化等）吗？' },
  { id: 54, type: 'tebing', text: '您容易起荨麻疹（风团、风疹块、风疙瘩）吗？' },
  { id: 55, type: 'tebing', text: '您的皮肤容易起湿疹、皮炎、痤疮吗？' },
  { id: 56, type: 'tebing', text: '您容易过敏吗？' },
  
  { id: 57, type: 'pinghe', text: '您食欲好吗？' },
  { id: 58, type: 'pinghe', text: '您睡眠质量好吗？' },
  { id: 59, type: 'pinghe', text: '您的二便正常吗？' },
  { id: 60, type: 'pinghe', text: '您脉象平和有力吗？' }
]

const quickQuestions = [
  { id: 1, type: 'qixu', text: '容易疲劳，稍微活动就气短' },
  { id: 2, type: 'yangxu', text: '手脚冰凉，尤其怕冷' },
  { id: 3, type: 'yinxu', text: '感到手脚心发热，口干舌燥' },
  { id: 4, type: 'shire', text: '面部油腻，易长痘痘或疮疡' },
  { id: 5, type: 'tanshi', text: '身体沉重，腹部肥软，痰多' },
  { id: 6, type: 'xueyu', text: '皮肤暗沉、容易出现淤青' },
  { id: 7, type: 'qiyu', text: '情绪抑郁，经常叹气或失眠' },
  { id: 8, type: 'tebing', text: '容易过敏（如鼻炎、荨麻疹）' },
  { id: 9, type: 'pinghe', text: '精力充沛，适应力强，很少不适' }
]

function loadRecords() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
  } catch (e) {
    return []
  }
}

function saveRecords(records) {
  const dir = path.dirname(DATA_FILE)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2))
}

router.get('/questions', (req, res) => {
  const { mode = 'standard' } = req.query
  
  if (mode === 'quick') {
    res.json({
      code: 0,
      message: '成功',
      data: {
        questions: quickQuestions,
        constitutionTypes
      }
    })
  } else {
    res.json({
      code: 0,
      message: '成功',
      data: {
        questions: standardQuestions,
        constitutionTypes
      }
    })
  }
})

router.post('/submit', (req, res) => {
  const { answers, mode = 'standard' } = req.body
  
  if (!answers || !Array.isArray(answers)) {
    return res.json({ code: -1, message: '请填写问卷' })
  }
  
  const questions = mode === 'quick' ? quickQuestions : standardQuestions
  
  const scores = {}
  const counts = {}
  
  questions.forEach(q => {
    const key = q.type
    if (!scores[key]) {
      scores[key] = 0
      counts[key] = 0
    }
    
    const answer = answers.find(a => a.qid === q.id)
    let value = answer ? parseInt(answer.value) : 1
    
    if (q.reverse) {
      value = 6 - value
    }
    
    scores[key] += value
    counts[key]++
  })
  
  const convertedScores = {}
  Object.keys(scores).forEach(key => {
    const raw = scores[key]
    const count = counts[key] || 1
    convertedScores[key] = Math.round(((raw - count) / (count * 4)) * 100)
  })
  
  let mainType = 'pinghe'
  let mainScore = convertedScores.pinghe || 0
  let mainTypeName = '平和质'
  
  const types = Object.keys(convertedScores).filter(k => k !== 'pinghe')
  types.forEach(type => {
    if (convertedScores[type] >= mainScore) {
      mainScore = convertedScores[type]
      mainType = type
      mainTypeName = constitutionTypes[type].name
    }
  })
  
  if (convertedScores.pinghe >= 60) {
    let allLow = true
    types.forEach(type => {
      if (convertedScores[type] >= 30) {
        allLow = false
      }
    })
    if (allLow) {
      mainType = 'pinghe'
      mainTypeName = '平和质'
      mainScore = convertedScores.pinghe
    }
  }
  
  const highTypes = types.filter(t => convertedScores[t] >= 40)
  const mixedTypes = highTypes.map(t => ({ type: t, name: constitutionTypes[t].name, score: convertedScores[t] }))
  
  const record = {
    id: Date.now(),
    mode,
    date: new Date().toISOString().split('T')[0],
    timestamp: Date.now(),
    answers,
    rawScores: scores,
    convertedScores,
    mainType,
    mainTypeName,
    mainScore,
    mixedTypes,
    constitutionInfo: constitutionTypes[mainType]
  }
  
  const records = loadRecords()
  records.push(record)
  saveRecords(records)
  
  res.json({
    code: 0,
    message: '测评完成',
    data: record
  })
})

router.get('/records', (req, res) => {
  const records = loadRecords()
  records.sort((a, b) => b.timestamp - a.timestamp)
  
  res.json({
    code: 0,
    message: '成功',
    data: {
      list: records,
      total: records.length
    }
  })
})

router.get('/record/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const records = loadRecords()
  const record = records.find(r => r.id === id)
  
  if (!record) {
    return res.json({ code: -1, message: '记录不存在' })
  }
  
  res.json({
    code: 0,
    message: '成功',
    data: record
  })
})

router.get('/constitution-types', (req, res) => {
  res.json({
    code: 0,
    message: '成功',
    data: constitutionTypes
  })
})

router.delete('/record/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const records = loadRecords()
  const index = records.findIndex(r => r.id === id)
  
  if (index === -1) {
    return res.json({ code: -1, message: '记录不存在' })
  }
  
  records.splice(index, 1)
  saveRecords(records)
  
  res.json({
    code: 0,
    message: '删除成功',
    data: { id }
  })
})

module.exports = router
