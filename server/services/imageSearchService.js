const fs = require('fs')
const path = require('path')
const { extractFeatures, computeSimilarity, FEATURE_VERSION } = require('./imageFeatureService')
const mysqlService = require('./mysqlService')
const paths = require('../config/paths')

const REF_DIR = paths.REF_IMAGES_DIR

let featureIndex = null

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

async function loadIndex() {
  try {
    const items = await mysqlService.getAllReferenceImages()
    featureIndex = {
      version: FEATURE_VERSION,
      builtAt: items.length > 0 ? new Date().toISOString() : null,
      items: items.map(item => ({
        id: item.id,
        herbId: item.herb_id,
        herbName: item.herb_name,
        imageName: item.image_name,
        synthetic: item.is_synthetic,
        addedAt: item.created_at,
        features: item.features
      }))
    }
    console.log(`[检索库] 从MySQL加载索引: ${featureIndex?.items?.length || 0} 条参考数据`)
    return featureIndex
  } catch (e) {
    console.warn('从MySQL加载特征索引失败:', e.message)
    featureIndex = {
      version: FEATURE_VERSION,
      builtAt: null,
      items: []
    }
    return featureIndex
  }
}

async function addReferenceImage(herbId, herbName, imageBuffer, imageName = 'default') {
  ensureDir(REF_DIR)

  const features = await extractFeatures(imageBuffer)

  const id = `${herbId}-${imageName}-${Date.now()}`
  const item = {
    id,
    herbId,
    herbName,
    imageName,
    synthetic: false,
    addedAt: new Date().toISOString(),
    features
  }

  await mysqlService.saveReferenceImage(item)

  // 同步更新内存索引
  const existingIdx = featureIndex.items.findIndex(
    i => i.herbId === herbId && i.imageName === imageName
  )

  if (existingIdx >= 0) {
    featureIndex.items[existingIdx] = item
  } else {
    featureIndex.items.push(item)
  }

  console.log(`[检索库] 已添加参考图: ${herbName} (${imageName})`)
  return item
}

function searchByFeature(queryFeatures, topK = 5) {
  if (!featureIndex || featureIndex.items.length === 0) {
    return []
  }

  const MATCH_THRESHOLD = 0.75
  const herbScores = new Map()

  for (const item of featureIndex.items) {
    const sim = computeSimilarity(queryFeatures, item.features)
    const weight = item.synthetic ? 0.7 : 1.0
    const weightedSim = {
      overall: sim.overall * weight,
      color: sim.color * weight,
      texture: sim.texture * weight
    }
    const isMatch = weightedSim.overall >= MATCH_THRESHOLD

    if (!herbScores.has(item.herbId)) {
      herbScores.set(item.herbId, {
        herbId: item.herbId,
        herbName: item.herbName,
        bestScore: 0,
        avgScore: 0,
        count: 0,
        matchCount: 0,
        totalRefCount: 0,
        samples: []
      })
    }

    const herbResult = herbScores.get(item.herbId)
    herbResult.avgScore += weightedSim.overall
    herbResult.totalRefCount++

    if (isMatch) {
      herbResult.matchCount++
    }

    if (weightedSim.overall > herbResult.bestScore) {
      herbResult.bestScore = weightedSim.overall
    }

    herbResult.samples.push({
      imageName: item.imageName,
      similarity: weightedSim
    })

    if (herbResult.samples.length > 3) {
      herbResult.samples.sort((a, b) => b.similarity.overall - a.similarity.overall)
      herbResult.samples = herbResult.samples.slice(0, 3)
    }
  }

  const finalResults = Array.from(herbScores.values()).map(h => ({
    ...h,
    avgScore: h.avgScore / h.totalRefCount,
    matchRatio: h.totalRefCount > 0 ? h.matchCount / h.totalRefCount : 0
  }))

  finalResults.sort((a, b) => {
    if (b.bestScore !== a.bestScore) return b.bestScore - a.bestScore
    if (b.avgScore !== a.avgScore) return b.avgScore - a.avgScore
    return b.matchRatio - a.matchRatio
  })

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

// 启动时异步加载索引
loadIndex().catch(e => console.warn('[检索库] 初始化失败:', e.message))

module.exports = {
  addReferenceImage,
  searchByImage,
  searchByFeature,
  getReferenceStats,
  hasReferenceImages,
  loadIndex,
  REF_DIR
}
