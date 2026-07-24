require('dotenv').config({ path: __dirname + '/../.env' })
const mysql = require('mysql2/promise')

async function main() {
  const c = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT) || 3306,
    database: process.env.MYSQL_DATABASE || 'caomuyoufang',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    charset: 'utf8mb4'
  })

  const [[{total}]] = await c.query('SELECT COUNT(*) as total FROM herbs')
  const [[{imgCount}]] = await c.query('SELECT COUNT(*) as imgCount FROM herb_images')
  const [missingImg] = await c.query(`
    SELECT h.id, h.name FROM herbs h
    LEFT JOIN herb_images img ON img.herb_id = h.id
    WHERE h.id > 372 AND img.id IS NULL
    ORDER BY h.id
  `)

  console.log('数据库药材总数:', total)
  console.log('图片总数:', imgCount)
  console.log('新增药材无图片数量:', missingImg.length)
  if (missingImg.length > 0) {
    console.log('无图片药材列表:')
    missingImg.forEach(r => console.log(`  - ${r.name} (ID=${r.id})`))
  }

  await c.end()
}

main().catch(console.error)
