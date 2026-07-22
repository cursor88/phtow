require('dotenv').config()
const fs = require('fs')
const path = require('path')
const { pool } = require('./config/mysql')

const HERB_ID = 2
const HERB_DIR = path.join(__dirname, 'uploads', 'herbs', String(HERB_ID))

async function fixHerbImage() {
  // 1. 删除该药材所有现有图片
  await pool.query('DELETE FROM herb_images WHERE herb_id = ?', [HERB_ID])
  console.log(`已删除 herbId=${HERB_ID} 的旧图片记录`)

  // 2. 扫描 uploads/herbs/2/ 目录
  if (!fs.existsSync(HERB_DIR)) {
    console.log(`目录不存在: ${HERB_DIR}`)
    process.exit(1)
  }

  const files = fs.readdirSync(HERB_DIR)
    .filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f))
    .sort()

  console.log(`发现 ${files.length} 张真实图片:`)
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const url = `/uploads/herbs/${HERB_ID}/${file}`
    await pool.query(
      'INSERT INTO herb_images (herb_id, image_url, sort_order, description, is_cover) VALUES (?, ?, ?, ?, ?)',
      [HERB_ID, url, i, `${file}`, i === 0 ? 1 : 0]
    )
    console.log(`  [+] ${url}`)
  }

  // 3. 验证
  const [rows] = await pool.query(
    'SELECT * FROM herb_images WHERE herb_id = ? ORDER BY sort_order',
    [HERB_ID]
  )
  console.log(`\nherbId=${HERB_ID} 当前共 ${rows.length} 张图片:`)
  rows.forEach(r => {
    console.log(`  - ${r.image_url} (封面: ${r.is_cover === 1 ? '是' : '否'})`)
  })

  process.exit(0)
}

fixHerbImage().catch(e => {
  console.error(e)
  process.exit(1)
})
