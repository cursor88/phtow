require('dotenv').config()
const { pool } = require('./config/mysql')

async function initHerbImages() {
  // 检查 herb_images 表是否存在
  const [tables] = await pool.query(`
    SELECT TABLE_NAME FROM information_schema.tables
    WHERE table_schema = DATABASE() AND table_name = 'herb_images'
  `)

  if (tables.length === 0) {
    console.log('herb_images 表不存在，请先运行 test-mysql.js 初始化表结构')
    process.exit(1)
  }

  // 清空旧数据
  await pool.query('DELETE FROM herb_images')
  console.log('已清空 herb_images 表')

  // 获取所有药材
  const [herbs] = await pool.query('SELECT id, name FROM herbs ORDER BY id')

  // 为每种药材插入 1-3 张占位图片
  // 使用 picsum.photos 作为占位图服务（基于药材ID生成固定图片）
  for (const herb of herbs) {
    const imageCount = 1 + (herb.id % 3) // 1-3 张
    for (let i = 0; i < imageCount; i++) {
      const seed = herb.id * 10 + i
      const width = 800
      const height = 600
      const imageUrl = `https://picsum.photos/seed/caoyao${seed}/${width}/${height}`

      await pool.query(
        'INSERT INTO herb_images (herb_id, image_url, sort_order, description, is_cover) VALUES (?, ?, ?, ?, ?)',
        [herb.id, imageUrl, i, `${herb.name} 图 ${i + 1}`, i === 0 ? 1 : 0]
      )
    }
  }

  const [count] = await pool.query('SELECT COUNT(*) as total FROM herb_images')
  console.log(`成功插入 ${count[0].total} 条图片记录`)

  process.exit(0)
}

initHerbImages().catch(e => {
  console.error(e)
  process.exit(1)
})
