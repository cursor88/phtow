const fs = require('fs')
const path = require('path')
const { extractFeatures, computeSimilarity, FEATURE_VERSION } = require('./imageFeatureService')
const herbs = require('../data/herbs')
const paths = require('../config/paths')

const REF_DIR = paths.REF_IMAGES_DIR
const INDEX_FILE = path.join(REF_DIR, 'feature-index.json')

let featureIndex = null

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function loadIndex() {
  if (fs.existsSync(INDEX_FILE)) {
    try {
      const data = fs.readFileSync(INDEX_FILE, 'utf-8')
      featureIndex = JSON.parse(data)
      console.log(`[检索库] 加载索引: ${featureIndex?.items?.length || 0} 条参考数据`)
      return featureIndex
    } catch (e) {
      console.warn('加载特征索引失败:', e.message)
    }
  }
  
  featureIndex = {
    version: FEATURE_VERSION,
    builtAt: null,
    items: []
  }
  return featureIndex
}

function saveIndex() {
  ensureDir(REF_DIR)
  featureIndex.builtAt = new Date().toISOString()
  fs.writeFileSync(INDEX_FILE, JSON.stringify(featureIndex, null, 2))
  console.log(`[检索库] 索引已保存: ${featureIndex.items.length} 条数据`)
}

async function addReferenceImage(herbId, herbName, imageBuffer, imageName = 'default') {
  ensureDir(REF_DIR)
  
  const features = await extractFeatures(imageBuffer)
  
  const item = {
    id: `${herbId}-${imageName}-${Date.now()}`,
    herbId,
    herbName,
    imageName,
    addedAt: new Date().toISOString(),
    features
  }
  
  const existingIdx = featureIndex.items.findIndex(
    i => i.herbId === herbId && i.imageName === imageName
  )
  
  if (existingIdx >= 0) {
    featureIndex.items[existingIdx] = item
  } else {
    featureIndex.items.push(item)
  }
  
  saveIndex()
  return item
}

function searchByFeature(queryFeatures, topK = 5) {
  if (!featureIndex || featureIndex.items.length === 0) {
    return []
  }

  const results = []
  
  const herbScores = new Map()
  
  for (const item of featureIndex.items) {
    const sim = computeSimilarity(queryFeatures, item.features)
    
    if (!herbScores.has(item.herbId)) {
      herbScores.set(item.herbId, {
        herbId: item.herbId,
        herbName: item.herbName,
        bestScore: 0,
        avgScore: 0,
        count: 0,
        samples: []
      })
    }
    
    const herbResult = herbScores.get(item.herbId)
    herbResult.avgScore += sim.overall
    herbResult.count++
    
    if (sim.overall > herbResult.bestScore) {
      herbResult.bestScore = sim.overall
    }
    
    herbResult.samples.push({
      imageName: item.imageName,
      similarity: sim
    })
    
    if (herbResult.samples.length > 3) {
      herbResult.samples.sort((a, b) => b.similarity.overall - a.similarity.overall)
      herbResult.samples = herbResult.samples.slice(0, 3)
    }
  }

  const finalResults = Array.from(herbScores.values()).map(h => ({
    ...h,
    avgScore: h.avgScore / h.count
  }))

  finalResults.sort((a, b) => b.bestScore - a.bestScore)

  return finalResults.slice(0, topK)
}

async function searchByImage(imageBuffer, topK = 5) {
  const queryFeatures = await extractFeatures(imageBuffer)
  const results = searchByFeature(queryFeatures, topK)
  
  return {
    query: {
      dominantColors: queryFeatures.dominantColors,
      featureDim: queryFeatures.featureDim
    },
    results
  }
}

function getReferenceStats() {
  if (!featureIndex) return { total: 0, herbs: 0 }
  
  const herbSet = new Set(featureIndex.items.map(i => i.herbId))
  return {
    total: featureIndex.items.length,
    herbs: herbSet.size,
    version: featureIndex.version,
    builtAt: featureIndex.builtAt
  }
}

function hasReferenceImages() {
  return featureIndex && featureIndex.items.length > 0
}

loadIndex()

module.exports = {
  addReferenceImage,
  searchByImage,
  searchByFeature,
  getReferenceStats,
  hasReferenceImages,
  loadIndex,
  saveIndex,
  REF_DIR
}