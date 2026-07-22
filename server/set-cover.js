require('dotenv').config()
const { pool } = require('./config/mysql')

const HERB_ID = 2
const COVER_IMAGE_ID = 65  // 要设为封面的图片ID

async function setCover() {
  await pool.query('UPDATE herb_images SET is_cover = 0 WHERE herb_id = ?', [HERB_ID])
  await pool.query('UPDATE herb_images SET is_cover = 1 WHERE id = ?', [COVER_IMAGE_ID])
  
  const [rows] = await pool.query('SELECT id, image_url, is_cover FROM herb_images WHERE herb_id = ? ORDER BY is_cover DESC', [HERB_ID])
  console.log('设置完成，当前图片:')
  rows.forEach(r => console.log(`  [${r.id}] ${r.image_url} 封面: ${r.is_cover === 1 ? '是' : '否'}`))
  
  process.exit(0)
}

setCover().catch(e => { console.error(e); process.exit(1) })
