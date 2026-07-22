require('dotenv').config()
const fs = require('fs')
const path = require('path')
const { pool } = require('./config/mysql')

let HERB_ID = null
for (let i = 2; i < process.argv.length; i++) {
  if ((process.argv[i] === '--id' || process.argv[i] === '-i') && process.argv[i + 1]) {
    HERB_ID = parseInt(process.argv[i + 1])
    break
  }
}

if (!HERB_ID || isNaN(HERB_ID)) {
  console.error('用法: node update-images.js --id <药材ID>')
  console.error('示例: node update-images.js --id 2')
  process.exit(1)
}

const HERB_DIR = path.join(__dirname, 'uploads', 'herbs', String(HERB_ID))

async function updateHerbImages() {
  await pool.query('DELETE FROM herb_images WHERE herb_id = ?', [HERB_ID])
  console.log(`已删除 herbId=${HERB_ID} 的旧记录`)

  const files = fs.readdirSync(HERB_DIR)
    .filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f))
    .sort()

  console.log(`发现 ${files.length} 张图片:`)
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const url = `/uploads/herbs/${HERB_ID}/${file}`
    await pool.query(
      'INSERT INTO herb_images (herb_id, image_url, sort_order, description, is_cover) VALUES (?, ?, ?, ?, ?)',
      [HERB_ID, url, i, `${file}`, i === 0 ? 1 : 0]
    )
    console.log(`  [+] ${url}`)
  }

  const [rows] = await pool.query('SELECT * FROM herb_images WHERE herb_id = ? ORDER BY sort_order', [HERB_ID])
  console.log(`\n当前图片列表:`)
  rows.forEach(r => console.log(`  - ${r.image_url}`))

  process.exit(0)
}

updateHerbImages().catch(e => { console.error(e); process.exit(1) })
