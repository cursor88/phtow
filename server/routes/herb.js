const express = require('express')
const router = express.Router()
const herbs = require('../data/herbs')
const foodMatches = require('../data/foodMatches')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { callModel, callModelWithCandidates, activeModels } = require('../services/modelService')
const { searchByImage, hasReferenceImages, addReferenceImage } = require('../services/imageSearchService')
const { extractFeatures } = require('../services/imageFeatureService')

const imageMagicNumbers = {
  jpg: [0xFF, 0xD8, 0xFF],
  jpeg: [0xFF, 0xD8, 0xFF],
  png: [0x89, 0x50, 0x4E, 0x47],
  gif: [0x47, 0x49, 0x46, 0x38],
  webp: [0x52, 0x49, 0x46, 0x46]
}

function detectImageType(buffer) {
  for (const [type, magic] of Object.entries(imageMagicNumbers)) {
    if (buffer.length >= magic.length) {
      let match = true
      for (let i = 0; i < magic.length; i++) {
        if (buffer[i] !== magic[i]) {
          match = false
          break
        }
      }
      if (match) return type
    }
  }
  return null
}

function extractColorFeatures(buffer) {
  const colors = { red: 0, green: 0, blue: 0, count: 0 }
  const sampleSize = Math.min(buffer.length, 1000)
  for (let i = 0; i < sampleSize; i += 3) {
    colors.red += buffer[i] || 0
    colors.green += buffer[i + 1] || 0
    colors.blue += buffer[i + 2] || 0
    colors.count++
  }
  if (colors.count > 0) {
    colors.red = Math.round(colors.red / colors.count)
    colors.green = Math.round(colors.green / colors.count)
    colors.blue = Math.round(colors.blue / colors.count)
  }
  return colors
}

function analyzeColorPalette(colors) {
  const r = colors.red, g = colors.green, b = colors.blue
  const avg = (r + g + b) / 3
  
  if (r > 150 && g < 120 && b < 120) return 'red'
  if (r < 100 && g > 120 && b < 100) return 'green'
  if (r > 180 && g > 150 && b < 100) return 'yellow'
  if (r > 150 && g > 130 && b < 80) return 'orange'
  if (avg > 200) return 'white'
  if (avg < 80) return 'dark'
  if (r > g && r > b && g > b) return 'brown'
  return 'mixed'
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'))
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
})

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('只支持图片格式'))
    }
    cb(null, true)
  }
})

const HERB_COLOR_MAP = {
  '人参': 'white',
  '枸杞': 'red',
  '黄芪': 'yellow',
  '当归': 'brown',
  '金银花': 'yellow',
  '茯苓': 'white'
}

const HERB_TYPE_COLOR_MAP = {
  root: ['brown', 'yellow', 'white'],
  fruit: ['red', 'orange', 'yellow'],
  flower: ['white', 'yellow', 'red'],
  fungus: ['white', 'dark', 'mixed']
}

function analyzeImage(filename, fileBuffer) {
  const nameLower = filename.toLowerCase()
  const colorPalette = fileBuffer ? analyzeColorPalette(extractColorFeatures(fileBuffer)) : 'mixed'
  
  let scores = herbs.map(herb => {
    let score = 0
    const keywords = herb.keywords.map(k => k.toLowerCase())
    
    for (const kw of keywords) {
      if (nameLower.includes(kw)) {
        score += 15
      }
    }
    
    for (const alias of herb.alias) {
      if (nameLower.includes(alias.toLowerCase())) {
        score += 12
      }
    }
    
    if (herb.imageType === 'fruit' && (nameLower.includes('红') || nameLower.includes('red') || nameLower.includes('果') || nameLower.includes('fruit'))) {
      score += 10
    }
    if (herb.imageType === 'root' && (nameLower.includes('根') || nameLower.includes('root') || nameLower.includes('草') || nameLower.includes('herb'))) {
      score += 10
    }
    if (herb.imageType === 'flower' && (nameLower.includes('花') || nameLower.includes('flower') || nameLower.includes('bloom'))) {
      score += 10
    }
    if (herb.imageType === 'fungus' && (nameLower.includes('菌') || nameLower.includes('fungus') || nameLower.includes('mushroom'))) {
      score += 10
    }
    
    const herbExpectedColor = HERB_COLOR_MAP[herb.name]
    if (herbExpectedColor && colorPalette === herbExpectedColor) {
      score += 25
    }
    
    const typeColors = HERB_TYPE_COLOR_MAP[herb.imageType] || []
    if (typeColors.includes(colorPalette)) {
      score += 10
    }
    
    const categoryKeywords = {
      '补虚药': ['补', '虚', '养', '元气'],
      '清热药': ['清热', '解毒', '凉', '寒'],
      '利水渗湿药': ['水', '湿', '利']
    }
    const categoryKws = categoryKeywords[herb.category] || []
    for (const kw of categoryKws) {
      if (nameLower.includes(kw)) {
        score += 5
      }
    }
    
    score += Math.random() * 3
    
    return { herb, score }
  })
  
  scores.sort((a, b) => b.score - a.score)
  
  const topScore = scores[0].score
  const secondScore = scores[1]?.score || 0
  const scoreDiff = topScore - secondScore
  
  let accuracy
  if (topScore >= 30) {
    accuracy = Math.min(0.98, 0.85 + topScore / 200)
  } else if (topScore >= 15) {
    accuracy = 0.70 + topScore / 100
  } else if (scoreDiff > 5) {
    accuracy = 0.55 + scoreDiff / 50
  } else {
    accuracy = 0.45 + Math.random() * 0.15
  }
  
  const selectedHerb = scores[0].herb
  const isHighConfidence = topScore >= 25
  
  return { 
    herb: selectedHerb, 
    accuracy: parseFloat(accuracy.toFixed(2)),
    isHighConfidence,
    colorPalette,
    matchedFeatures: {
      keywordMatch: topScore >= 15,
      colorMatch: HERB_COLOR_MAP[selectedHerb.name] === colorPalette,
      typeMatch: topScore >= 10
    }
  }
}

// 构建Top-3候选结果（含关键鉴别点）
function buildAlternatives(candidates, primaryHerbId = null) {
  if (!candidates || candidates.length === 0) return []
  
  const top3 = candidates.slice(0, 3)
  return top3.map((c, i) => {
    const herbData = herbs.find(h => h.id === c.herbId || h.name === c.herbName)
    return {
      rank: i + 1,
      herbId: c.herbId,
      name: c.herbName,
      probability: parseFloat(c.bestScore.toFixed(3)),
      isPrimary: primaryHerbId ? c.herbId === primaryHerbId : i === 0,
      key_identification: herbData?.key_identification || null,
      effect: herbData?.effect || '',
      category: herbData?.category || ''
    }
  })
}

function buildAlternativesFromAI(top3AI, primaryName = null) {
  if (!top3AI || top3AI.length === 0) return []
  
  return top3AI.map((item, i) => {
    const herbData = herbs.find(h => 
      h.name === item.name || 
      h.alias.some(a => a === item.name) ||
      h.name.includes(item.name) ||
      item.name.includes(h.name)
    )
    return {
      rank: i + 1,
      herbId: herbData?.id || null,
      name: item.name,
      probability: parseFloat(item.confidence.toFixed(3)),
      isPrimary: primaryName ? item.name === primaryName : i === 0,
      key_identification: item.key_points || herbData?.key_identification || null,
      effect: herbData?.effect || '',
      category: herbData?.category || item.category || '',
      reason: item.reason || ''
    }
  })
}

router.post('/identify', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        code: 400,
        message: '请上传图片',
        data: null
      })
    }
    
    const filename = req.file.originalname
    let fileBuffer = null
    try {
      fileBuffer = fs.readFileSync(req.file.path)
    } catch (e) {
      console.warn('无法读取上传的图片文件:', e.message)
    }
    
    // ========== 始终运行图像检索，获取Top-3候选（用于备选结果展示）==========
    let retrievalCandidates = []
    if (fileBuffer) {
      try {
        console.log('\n========== 图像检索（获取候选）==========')
        const searchResult = await searchByImage(fileBuffer, 5)
        retrievalCandidates = searchResult.results || []
        console.log(`检索到 ${retrievalCandidates.length} 个候选药材:`)
        retrievalCandidates.forEach((c, i) => {
          console.log(`  ${i + 1}. ${c.herbName} (最佳相似度: ${(c.bestScore * 100).toFixed(1)}%)`)
        })
      } catch (error) {
        console.error('图像检索失败:', error.message)
      }
    }
    
    // ========== 阶段1: 优先通义千问云模型识别 ==========
    let modelResultData = null  // 保存阶段1结果，供阶段2参考
    if (fileBuffer && activeModels.length > 0) {
      try {
        console.log('\n========== 阶段1: 通义千问云模型识别 ==========')
        console.log(`激活的模型数量: ${activeModels.length}`)
        
        const modelResult = await callModel(fileBuffer, 'qwen')
        
        if (!modelResult.fallback && modelResult.data) {
          const data = modelResult.data
          console.log(`模型识别结果: ${data.name} (置信度: ${data.confidence || '未知'})`)
          modelResultData = data  // 保存供阶段2使用
          
          // 检查是否为非中药材
          const isNonHerb = data.name && 
            (data.name.includes('非中药材') || 
             data.name.includes('不是中药材') || 
             data.name.includes('non-herb') || 
             data.name.includes('not a herb'))
          
          if (!isNonHerb && (data.confidence || 0) >= 0.6) {
            // 在本地数据库中查找对应的药材详情
            const herbData = herbs.find(h => 
              h.name === data.name || 
              h.alias.some(a => a === data.name) ||
              h.name.includes(data.name) ||
              data.name.includes(h.name)
            )
            
            // 优先使用 AI 返回的 Top-3 作为备选
            const aiAlternatives = buildAlternativesFromAI(data.top3, data.name)
            
            const result = herbData ? {
              id: herbData.id,
              name: herbData.name,
              pinyin: herbData.pinyin,
              category: herbData.category,
              nature: herbData.nature,
              taste: herbData.taste,
              meridian: herbData.meridian,
              effect: herbData.effect,
              indication: herbData.indication,
              dosage: herbData.dosage,
              taboo: herbData.taboo,
              identify_points: herbData.identify_points,
              key_identification: herbData.key_identification,
              alias: herbData.alias,
              classics: herbData.classics,
              food_match: [],
              accuracy: data.confidence || 0.7,
              confidenceLevel: (data.confidence || 0) > 0.8 ? '高' : ((data.confidence || 0) > 0.6 ? '中' : '低'),
              source: 'ai',
              model: 'qwen-vl-max',
              isFallback: false,
              alternatives: aiAlternatives.length > 0 ? aiAlternatives : buildAlternatives(retrievalCandidates, herbData?.id),
              _rawModelResults: [{
                model: 'qwen',
                modelName: '通义千问',
                success: true,
                name: data.name,
                confidence: data.confidence,
                error: null,
                duration: 0
              }],
              _voteInfo: null
            } : {
              name: data.name,
              id: Date.now(),
              pinyin: data.pinyin || '',
              category: data.category || '',
              nature: '',
              taste: '',
              meridian: '',
              effect: data.effect || '',
              indication: '',
              dosage: '',
              taboo: '',
              identify_points: data.description || '',
              key_identification: null,
              alias: [],
              classics: [],
              food_match: [],
              accuracy: data.confidence || 0.7,
              confidenceLevel: (data.confidence || 0) > 0.8 ? '高' : ((data.confidence || 0) > 0.6 ? '中' : '低'),
              source: 'ai',
              model: 'qwen-vl-max',
              isFallback: false,
              alternatives: aiAlternatives.length > 0 ? aiAlternatives : buildAlternatives(retrievalCandidates, null),
              _rawModelResults: [{
                model: 'qwen',
                modelName: '通义千问',
                success: true,
                name: data.name,
                confidence: data.confidence,
                error: null,
                duration: 0
              }],
              _voteInfo: null
            }
            
            // 自动加入参考库（让库越用越准）
            if (herbData) {
              try {
                await addReferenceImage(herbData.id, herbData.name, fileBuffer, `user-${Date.now()}`)
                console.log(`[参考库] 已自动加入: ${herbData.name}`)
              } catch (e) {
                console.warn('[参考库] 加入失败:', e.message)
              }
            }
            
            res.json({
              code: 0,
              message: 'AI模型识别成功',
              data: result
            })
            return
          } else {
            console.log(`置信度较低(${data.confidence})或非中药材，继续阶段2检索+精判`)
          }
        }
      } catch (error) {
        console.error('通义千问识别失败:', error.message)
      }
    }
    
    // ========== 阶段2: 图像检索 + LLM精判 ==========
    if (retrievalCandidates.length > 0 && activeModels.length > 0) {
      try {
        console.log('\n========== 阶段2: LLM候选精判 ==========')
        
        const candidateNames = retrievalCandidates.map(c => c.herbName).join('、')
        console.log(`候选药材: ${candidateNames}`)
        
        const modelResult = await callModelWithCandidates(fileBuffer, retrievalCandidates, 'qwen')
        
        if (!modelResult.fallback && modelResult.data) {
          const data = modelResult.data
          const herbData = herbs.find(h => 
            h.name === data.name || 
            h.alias.some(a => a === data.name) ||
            h.name.includes(data.name) ||
            data.name.includes(h.name)
          )
          
          const result = herbData ? {
            id: herbData.id,
            name: herbData.name,
            pinyin: herbData.pinyin,
            category: herbData.category,
            nature: herbData.nature,
            taste: herbData.taste,
            meridian: herbData.meridian,
            effect: herbData.effect,
            indication: herbData.indication,
            dosage: herbData.dosage,
            taboo: herbData.taboo,
            identify_points: herbData.identify_points,
            key_identification: herbData.key_identification,
            alias: herbData.alias,
            classics: herbData.classics,
            food_match: [],
            accuracy: data.confidence || 0.7,
            confidenceLevel: (data.confidence || 0) > 0.8 ? '高' : ((data.confidence || 0) > 0.6 ? '中' : '低'),
            source: 'ai-search-hybrid',
            model: 'retrieval+llm',
            isFallback: false,
            alternatives: buildAlternatives(retrievalCandidates, herbData?.id),
            _searchInfo: {
              llmSelected: data.name
            }
          } : {
            name: data.name,
            id: Date.now(),
            pinyin: data.pinyin || '',
            category: data.category || '',
            nature: '',
            taste: '',
            meridian: '',
            effect: data.effect || '',
            indication: '',
            dosage: '',
            taboo: '',
            identify_points: data.description || '',
            key_identification: null,
            alias: [],
            classics: [],
            food_match: [],
            accuracy: data.confidence || 0.7,
            confidenceLevel: (data.confidence || 0) > 0.8 ? '高' : ((data.confidence || 0) > 0.6 ? '中' : '低'),
            source: 'ai-search-hybrid',
            model: 'retrieval+llm',
            isFallback: false,
            alternatives: buildAlternatives(retrievalCandidates, null),
            _searchInfo: {}
          }
          
          res.json({
            code: 0,
            message: '检索+LLM识别成功',
            data: result
          })
          // 自动加入参考库（让库越用越准）
          if (herbData) {
            try {
              await addReferenceImage(herbData.id, herbData.name, fileBuffer, `user-${Date.now()}`)
              console.log(`[参考库] 已自动加入(阶段2): ${herbData.name}`)
            } catch (e) {
              console.warn('[参考库] 加入失败:', e.message)
            }
          }
          return
        }
      } catch (error) {
        console.error('LLM候选精判失败:', error.message)
      }
    }
    
    // ========== 阶段3: 图像检索直接返回（无模型或LLM失败时）==========
    if (retrievalCandidates.length > 0) {
      const topResult = retrievalCandidates[0]
      const herbData = herbs.find(h => h.id === topResult.herbId)
      
      if (herbData) {
        const result = {
          id: herbData.id,
          name: herbData.name,
          pinyin: herbData.pinyin,
          category: herbData.category,
          nature: herbData.nature,
          taste: herbData.taste,
          meridian: herbData.meridian,
          effect: herbData.effect,
          indication: herbData.indication,
          dosage: herbData.dosage,
          taboo: herbData.taboo,
          identify_points: herbData.identify_points,
          key_identification: herbData.key_identification,
          alias: herbData.alias,
          classics: herbData.classics,
          food_match: [],
          accuracy: topResult.bestScore,
          confidenceLevel: topResult.bestScore > 0.8 ? '高' : (topResult.bestScore > 0.6 ? '中' : '低'),
          source: 'image-search',
          model: 'retrieval-v1',
          isFallback: false,
          alternatives: buildAlternatives(retrievalCandidates, herbData.id)
        }
        
        res.json({
          code: 0,
          message: '图像检索识别成功',
          data: result
        })
        return
      }
    }
    
    // ========== 阶段4: 本地识别回退 ==========
    const analysis = analyzeImage(filename, fileBuffer)
    
    const result = {
      id: analysis.herb.id,
      name: analysis.herb.name,
      pinyin: analysis.herb.pinyin,
      category: analysis.herb.category,
      accuracy: analysis.accuracy,
      effect: analysis.herb.effect,
      identify_points: analysis.herb.identify_points,
      key_identification: analysis.herb.key_identification,
      imageType: analysis.herb.imageType,
      confidenceLevel: analysis.isHighConfidence ? '高' : '中',
      colorPalette: analysis.colorPalette,
      source: 'local',
      model: null,
      isFallback: true,
      alternatives: buildAlternatives(retrievalCandidates, analysis.herb.id),
      _rawModelResults: [],
      _voteInfo: null
    }
    
    res.json({
      code: 0,
      message: '本地识别成功（AI服务不可用）',
      data: result
    })
  } catch (error) {
    console.error('识别错误:', error)
    res.status(500).json({
      code: 500,
      message: '识别失败，请重试',
      data: null
    })
  }
})

router.get('/detail/:id', (req, res) => {
  const param = req.params.id
  let herb = null
  
  const id = parseInt(param)
  if (!isNaN(id)) {
    herb = herbs.find(h => h.id === id)
  }
  
  if (!herb) {
    herb = herbs.find(h => 
      h.name === param || 
      h.alias.some(a => a === param) ||
      h.name.includes(param)
    )
  }
  
  if (!herb) {
    return res.json({
      code: 404,
      message: '药材不存在',
      data: null
    })
  }
  
  res.json({
    code: 0,
    message: '成功',
    data: herb
  })
})

router.get('/list', (req, res) => {
  const { page = 1, pageSize = 10, keyword = '', category = '' } = req.query
  let filtered = herbs
  
  if (keyword) {
    filtered = filtered.filter(h => 
      h.name.includes(keyword) || 
      h.alias.some(a => a.includes(keyword))
    )
  }
  
  if (category) {
    filtered = filtered.filter(h => h.category === category)
  }
  
  const start = (page - 1) * pageSize
  const end = start + parseInt(pageSize)
  const list = filtered.slice(start, end)
  
  res.json({
    code: 0,
    message: '成功',
    data: {
      list,
      total: filtered.length,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    }
  })
})

router.get('/classics/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const herb = herbs.find(h => h.id === id)
  
  if (!herb) {
    return res.json({
      code: 404,
      message: '药材不存在',
      data: null
    })
  }
  
  res.json({
    code: 0,
    message: '成功',
    data: {
      herbId: herb.id,
      herbName: herb.name,
      classics: herb.classics
    }
  })
})

router.get('/food-match/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const herb = herbs.find(h => h.id === id)
  
  if (!herb) {
    return res.json({
      code: 404,
      message: '药材不存在',
      data: null
    })
  }
  
  const matches = foodMatches.filter(m => herb.food_match.includes(m.id))
  
  res.json({
    code: 0,
    message: '成功',
    data: matches
  })
})

module.exports = router
