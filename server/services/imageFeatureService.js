const { createCanvas, loadImage } = require('canvas')
const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const FEATURE_VERSION = 'v1'
const HISTOGRAM_BINS = 16
const TEXTURE_GRID = 4

function extractColorHistogram(imageData, bins = HISTOGRAM_BINS) {
  const data = imageData.data
  const width = imageData.width
  const height = imageData.height
  const totalPixels = width * height

  const rHist = new Array(bins).fill(0)
  const gHist = new Array(bins).fill(0)
  const bHist = new Array(bins).fill(0)
  const grayHist = new Array(bins).fill(0)

  const binSize = 256 / bins

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const a = data[i + 3]

    if (a < 128) continue

    const rBin = Math.min(Math.floor(r / binSize), bins - 1)
    const gBin = Math.min(Math.floor(g / binSize), bins - 1)
    const bBin = Math.min(Math.floor(b / binSize), bins - 1)
    const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b)
    const grayBin = Math.min(Math.floor(gray / binSize), bins - 1)

    rHist[rBin]++
    gHist[gBin]++
    bHist[bBin]++
    grayHist[grayBin]++
  }

  const normalize = (hist) => hist.map(v => v / totalPixels)

  return {
    r: normalize(rHist),
    g: normalize(gHist),
    b: normalize(bHist),
    gray: normalize(grayHist)
  }
}

function extractTextureFeatures(imageData, gridSize = TEXTURE_GRID) {
  const data = imageData.data
  const width = imageData.width
  const height = imageData.height

  const cellW = Math.floor(width / gridSize)
  const cellH = Math.floor(height / gridSize)
  const features = []

  for (let gy = 0; gy < gridSize; gy++) {
    for (let gx = 0; gx < gridSize; gx++) {
      let sumR = 0, sumG = 0, sumB = 0, sumGray = 0
      let sumR2 = 0, sumG2 = 0, sumB2 = 0, sumGray2 = 0
      let count = 0

      const startX = gx * cellW
      const startY = gy * cellH
      const endX = Math.min(startX + cellW, width)
      const endY = Math.min(startY + cellH, height)

      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          const idx = (y * width + x) * 4
          const r = data[idx]
          const g = data[idx + 1]
          const b = data[idx + 2]
          const gray = 0.299 * r + 0.587 * g + 0.114 * b

          sumR += r; sumG += g; sumB += b; sumGray += gray
          sumR2 += r * r; sumG2 += g * g; sumB2 += b * b; sumGray2 += gray * gray
          count++
        }
      }

      if (count > 0) {
        const avgR = sumR / count
        const avgG = sumG / count
        const avgB = sumB / count
        const avgGray = sumGray / count
        const stdGray = Math.sqrt(Math.max(0, sumGray2 / count - avgGray * avgGray))

        features.push(avgR / 255, avgG / 255, avgB / 255, stdGray / 128)
      } else {
        features.push(0, 0, 0, 0)
      }
    }
  }

  return features
}

function extractDominantColors(imageData, topK = 5) {
  const data = imageData.data
  const colorMap = new Map()

  for (let i = 0; i < data.length; i += 16) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const a = data[i + 3]

    if (a < 128) continue

    const rQ = Math.round(r / 32) * 32
    const gQ = Math.round(g / 32) * 32
    const bQ = Math.round(b / 32) * 32
    const key = `${rQ},${gQ},${bQ}`

    colorMap.set(key, (colorMap.get(key) || 0) + 1)
  }

  const sorted = Array.from(colorMap.entries()).sort((a, b) => b[1] - a[1])
  return sorted.slice(0, topK).map(([color, count]) => {
    const [r, g, b] = color.split(',').map(Number)
    return { r, g, b, hex: `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}` }
  })
}

async function extractFeatures(imageBuffer) {
  try {
    // 用 sharp 统一转换为 jpeg 格式，解决 webp/png/gif 等格式不被 canvas 支持的问题
    const jpegBuffer = await sharp(imageBuffer)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 90 })
      .toBuffer()

    const img = await loadImage(jpegBuffer)

    const targetSize = 256
    const canvas = createCanvas(targetSize, targetSize)
    const ctx = canvas.getContext('2d')

    const scale = Math.min(targetSize / img.width, targetSize / img.height)
    const w = Math.round(img.width * scale)
    const h = Math.round(img.height * scale)
    const x = Math.round((targetSize - w) / 2)
    const y = Math.round((targetSize - h) / 2)

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, targetSize, targetSize)
    ctx.drawImage(img, x, y, w, h)

    const imageData = ctx.getImageData(0, 0, targetSize, targetSize)

    const colorHist = extractColorHistogram(imageData)
    const texture = extractTextureFeatures(imageData)
    const dominantColors = extractDominantColors(imageData)

    const featureVector = [
      ...colorHist.r,
      ...colorHist.g,
      ...colorHist.b,
      ...colorHist.gray,
      ...texture
    ]

    return {
      version: FEATURE_VERSION,
      imageSize: { width: img.width, height: img.height },
      colorHistogram: colorHist,
      textureFeatures: texture,
      dominantColors,
      featureVector,
      featureDim: featureVector.length
    }
  } catch (error) {
    console.error('特征提取失败:', error.message)
    throw error
  }
}

function cosineSimilarity(a, b) {
  if (a.length !== b.length) return 0

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  if (normA === 0 || normB === 0) return 0
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

function computeSimilarity(feat1, feat2) {
  const fv1 = feat1.featureVector || feat1
  const fv2 = feat2.featureVector || feat2

  const colorSim = cosineSimilarity(
    [...fv1.slice(0, HISTOGRAM_BINS * 4)],
    [...fv2.slice(0, HISTOGRAM_BINS * 4)]
  )

  const textureSim = cosineSimilarity(
    [...fv1.slice(HISTOGRAM_BINS * 4)],
    [...fv2.slice(HISTOGRAM_BINS * 4)]
  )

  const overallSim = 0.65 * colorSim + 0.35 * textureSim

  return {
    overall: overallSim,
    color: colorSim,
    texture: textureSim
  }
}

module.exports = {
  extractFeatures,
  computeSimilarity,
  cosineSimilarity,
  FEATURE_VERSION
}