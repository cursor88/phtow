/**
 * 为数据库中的每种药材添加至少2张图片
 * 图片保存在 server/uploads/herbs/{herb_id}/ 目录下
 * 并更新 herb_images 表
 */

require('dotenv').config({ path: __dirname + '/../.env' })
const mysql = require('mysql2/promise')
const fs = require('fs')
const path = require('path')

const herbsUploadDir = path.join(__dirname, '../uploads/herbs')

// 药材对应的颜色主题（用于生成不同的图标）
const colorThemes = [
  { bg: '#e8f5e9', text: '#2e7d32' },
  { bg: '#fff3e0', text: '#e65100' },
  { bg: '#e3f2fd', text: '#1565c0' },
  { bg: '#fce4ec', text: '#c2185b' },
  { bg: '#f3e5f5', text: '#7b1fa2' },
  { bg: '#e0f7fa', text: '#006064' },
  { bg: '#fff8e1', text: '#ef6c00' },
  { bg: '#f1f8e9', text: '#33691e' }
]

// 常用草药图标
const herbIcons = ['🌿', '🍃', '🌱', '🌾', '🪴', '🌻', '🌼', '🌸', '🌺', '🌹', '🍀', '🪻', '🌷', '🪷', '🍄', '🪵', '🌳', '🌴', '🌲', '🌵']

// 生成SVG图片内容
function generateHerbSVG(name, themeIndex, variant) {
  const theme = colorThemes[themeIndex % colorThemes.length]
  const icon = herbIcons[themeIndex % herbIcons.length]
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="${theme.bg}" rx="16"/>
  <text x="100" y="90" font-size="56" text-anchor="middle" dominant-baseline="middle">${icon}</text>
  <text x="100" y="130" font-size="18" text-anchor="middle" fill="${theme.text}" font-family="Microsoft YaHei, sans-serif">${name}</text>
  <text x="100" y="160" font-size="12" text-anchor="middle" fill="${theme.text}" opacity="0.6" font-family="Microsoft YaHei, sans-serif">图${variant}</text>
</svg>`
}

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT) || 3306,
    database: process.env.MYSQL_DATABASE || 'caomuyoufang',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    charset: 'utf8mb4'
  })

  try {
    console.log('[MySQL] 连接成功')

    // 获取所有药材
    const [herbs] = await connection.query('SELECT id, name, category FROM herbs ORDER BY id')
    console.log(`[查询] 共 ${herbs.length} 味药材`)

    let totalAdded = 0
    let totalSkipped = 0

    for (const herb of herbs) {
      const herbDir = path.join(herbsUploadDir, herb.id.toString())
      
      // 检查已有图片数量
      let existingCount = 0
      if (fs.existsSync(herbDir)) {
        const files = fs.readdirSync(herbDir)
        existingCount = files.filter(f => f.match(/\.(jpg|jpeg|png|svg)$/i)).length
      }

      // 计算需要添加的图片数量（至少2张）
      const needAdd = Math.max(0, 2 - existingCount)
      
      if (needAdd === 0) {
        console.log(`[跳过] ${herb.name} (${herb.category}) - 已有 ${existingCount} 张图片`)
        totalSkipped++
        continue
      }

      // 创建目录
      if (!fs.existsSync(herbDir)) {
        fs.mkdirSync(herbDir, { recursive: true })
      }

      // 生成图片
      for (let i = 0; i < needAdd; i++) {
        const variant = existingCount + i + 1
        const fileName = `${herb.name}_${variant}.svg`
        const filePath = path.join(herbDir, fileName)
        
        // 生成SVG内容
        const svgContent = generateHerbSVG(herb.name, herb.id + i, variant)
        fs.writeFileSync(filePath, svgContent, 'utf-8')
        
        // 插入数据库
        const imageUrl = `/uploads/herbs/${herb.id}/${fileName}`
        const isCover = (existingCount === 0 && i === 0) ? 1 : 0
        
        await connection.query(`
          INSERT INTO herb_images (herb_id, image_url, is_cover, sort_order, created_at)
          VALUES (?, ?, ?, ?, NOW())
        `, [herb.id, imageUrl, isCover, variant])
        
        console.log(`[添加] ${herb.name} - ${fileName} (封面: ${isCover})`)
        totalAdded++
      }
    }

    console.log('\n========================================')
    console.log(`图片添加完成！`)
    console.log(`  成功添加: ${totalAdded} 张`)
    console.log(`  跳过已足够: ${totalSkipped} 味`)
    console.log(`  总计药材: ${herbs.length} 味`)
    console.log('========================================')

  } catch (error) {
    console.error('[错误]', error.message)
    throw error
  } finally {
    await connection.end()
  }
}

main().catch(console.error)