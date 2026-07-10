const fs = require('fs')
const path = require('path')
const { createCanvas } = require('canvas')
const { extractFeatures } = require('./imageFeatureService')
const herbs = require('../data/herbs')

const REF_DIR = path.join(__dirname, '..', 'data', 'reference-images')

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

const HERB_COLORS = {
  '人参': { primary: '#8B7355', secondary: '#A0522D', accent: '#DEB887' },
  '枸杞': { primary: '#DC143C', secondary: '#B22222', accent: '#FF6347' },
  '黄芪': { primary: '#D2B48C', secondary: '#C4A67A', accent: '#F5DEB3' },
  '当归': { primary: '#8B4513', secondary: '#A0522D', accent: '#D2691E' },
  '金银花': { primary: '#FFFACD', secondary: '#F0E68C', accent: '#98FB98' },
  '菊花': { primary: '#FFD700', secondary: '#FFA500', accent: '#FFFFE0' },
  '党参': { primary: '#C4A67A', secondary: '#DEB887', accent: '#F5DEB3' },
  '红枣': { primary: '#8B0000', secondary: '#A52A2A', accent: '#CD5C5C' },
  '茯苓': { primary: '#F5F5DC', secondary: '#FAEBD7', accent: '#FFFAF0' },
  '灵芝': { primary: '#8B0000', secondary: '#B22222', accent: '#CD853F' },
  '五指毛桃': { primary: '#D2B48C', secondary: '#C4A67A', accent: '#DEB887' },
  '桑叶': { primary: '#228B22', secondary: '#32CD32', accent: '#90EE90' },
  '薄荷': { primary: '#2E8B57', secondary: '#3CB371', accent: '#98FB98' },
  '艾叶': { primary: '#2F4F2F', secondary: '#355E3B', accent: '#556B2F' },
  '玫瑰花': { primary: '#DC143C', secondary: '#FF69B4', accent: '#FFB6C1' },
  '陈皮': { primary: '#FF8C00', secondary: '#FFA500', accent: '#FFD700' }
}

function generateSyntheticImage(colors, size = 256, variation = 0) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')
  
  const gradient = ctx.createRadialGradient(
    size / 2 + variation * 10, size / 2 - variation * 10, 20,
    size / 2, size / 2, size / 2
  )
  gradient.addColorStop(0, colors.accent)
  gradient.addColorStop(0.5, colors.primary)
  gradient.addColorStop(1, colors.secondary)
  
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  
  const noiseCount = 500 + variation * 200
  for (let i = 0; i < noiseCount; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const r = Math.random() * 3 + 1
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.15})`
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }
  
  const lineCount = 8 + variation * 3
  ctx.strokeStyle = `rgba(0,0,0,${0.05 + variation * 0.02})`
  ctx.lineWidth = 1
  for (let i = 0; i < lineCount; i++) {
    const y = (i / lineCount) * size + Math.random() * 20
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.bezierCurveTo(
      size * 0.3, y + Math.random() * 20 - 10,
      size * 0.7, y + Math.random() * 20 - 10,
      size, y + Math.random() * 10 - 5
    )
    ctx.stroke()
  }
  
  return canvas.toBuffer('image/jpeg', { quality: 0.85 })
}

async function buildReferenceIndex() {
  ensureDir(REF_DIR)
  
  const results = []
  let count = 0
  
  for (const herb of herbs) {
    const colors = HERB_COLORS[herb.name] || { primary: '#8B7355', secondary: '#A0522D', accent: '#DEB887' }
    
    const variations = 3
    for (let v = 0; v < variations; v++) {
      try {
        const imageBuffer = generateSyntheticImage(colors, 256, v)
        const features = await extractFeatures(imageBuffer)
        
        results.push({
          id: `${herb.id}-synth-${v}`,
          herbId: herb.id,
          herbName: herb.name,
          imageName: `synthetic-${v}`,
          synthetic: true,
          addedAt: new Date().toISOString(),
          features
        })
        
        count++
        console.log(`  [√] ${herb.name} #${v + 1}`)
      } catch (e) {
        console.error(`  [×] ${herb.name} #${v + 1}: ${e.message}`)
      }
    }
  }
  
  const index = {
    version: 'v1',
    builtAt: new Date().toISOString(),
    synthetic: true,
    items: results
  }
  
  const indexFile = path.join(REF_DIR, 'feature-index.json')
  fs.writeFileSync(indexFile, JSON.stringify(index, null, 2))
  
  console.log(`\n[完成] 参考库构建完成: ${count} 条数据, ${herbs.length} 种药材`)
  console.log(`索引文件: ${indexFile}`)
  
  return index
}

if (require.main === module) {
  buildReferenceIndex().catch(console.error)
}

module.exports = {
  buildReferenceIndex,
  HERB_COLORS,
  generateSyntheticImage
}