require('dotenv').config()
const fs = require('fs')
const path = require('path')
const { pool } = require('./config/mysql')

const UPLOADS_DIR = path.join(__dirname, 'data/assets')
const HERBS_DIR = path.join(UPLOADS_DIR, 'herbs')

async function syncUploadsToDb() {
  console.log('扫描 data/assets 目录...')

  // 1. 扫描 herbs/{herbId}/* 目录结构
  if (fs.existsSync(HERBS_DIR)) {
    const herbDirs = fs.readdirSync(HERBS_DIR, { withFileTypes: true })
      .filter(d => d.isDirectory() && /^\d+$/.test(d.name))

    for (const dir of herbDirs) {
      const herbId = parseInt(dir.name)
      const files = fs.readdirSync(path.join(HERBS_DIR, dir.name))
        .filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f))

      console.log(`  药材ID=${herbId}: 发现 ${files.length} 张图片`)

      // 检查该药材是否已有图片记录
      const [existing] = await pool.query(
        'SELECT id FROM herb_images WHERE herb_id = ?',
        [herbId]
      )

      if (existing.length === 0) {
        // 删除占位图后插入
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          const url = `/static/herbs/${herbId}/${file}`
          await pool.query(
            'INSERT INTO herb_images (herb_id, image_url, sort_order, description, is_cover) VALUES (?, ?, ?, ?, ?)',
            [herbId, url, i, `图片 ${i + 1}`, i === 0 ? 1 : 0]
          )
          console.log(`    [+] ${url}`)
        }
      } else {
        console.log(`    [跳过] 已有 ${existing.length} 条记录`)
      }
    }
  }

  // 2. 扫描 data/assets 根目录的散落图片
  const rootFiles = fs.existsSync(UPLOADS_DIR)
    ? fs.readdirSync(UPLOADS_DIR).filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f))
    : []

  if (rootFiles.length > 0) {
    console.log(`\ndata/assets 根目录发现 ${rootFiles.length} 张散落图片`)
    console.log('提示: 这些图片没有归属到具体药材，请先移动到 data/assets/herbs/{herbId}/ 目录下')
  }

  const [stats] = await pool.query(`
    SELECT h.id, h.name, COUNT(hi.id) as img_count
    FROM herbs h
    LEFT JOIN herb_images hi ON h.id = hi.herb_id
    GROUP BY h.id, h.name
    ORDER BY img_count DESC, h.id
    LIMIT 10
  `)

  console.log('\n药材图片统计 TOP 10:')
  stats.forEach(s => {
    console.log(`  [${s.id}] ${s.name}: ${s.img_count} 张`)
  })

  process.exit(0)
}

syncUploadsToDb().catch(e => {
  console.error(e)
  process.exit(1)
})
