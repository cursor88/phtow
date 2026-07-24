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

  // 按图片数量分组统计
  const [rows] = await c.query(`
    SELECT
      CASE
        WHEN img_count = 0 THEN '0张'
        WHEN img_count = 1 THEN '1张'
        WHEN img_count BETWEEN 2 AND 3 THEN '2-3张'
        ELSE '4张以上'
      END AS category,
      COUNT(*) AS herb_count
    FROM (
      SELECT h.id, COUNT(img.id) AS img_count
      FROM herbs h
      LEFT JOIN herb_images img ON img.herb_id = h.id
      GROUP BY h.id
    ) t
    GROUP BY category
    ORDER BY category
  `)

  console.log('=== 药材图片分布 ===')
  rows.forEach(r => console.log(`  ${r.category}: ${r.herb_count} 味`))

  // 列出图片少于2张的药材
  const [needMore] = await c.query(`
    SELECT h.id, h.name, COUNT(img.id) AS img_count
    FROM herbs h
    LEFT JOIN herb_images img ON img.herb_id = h.id
    GROUP BY h.id, h.name
    HAVING img_count < 2
    ORDER BY img_count, h.id
  `)

  console.log(`\n=== 图片不足2张的药材: ${needMore.length} 味 ===`)
  needMore.slice(0, 30).forEach(r => console.log(`  ID=${r.id} ${r.name} - ${r.img_count}张`))
  if (needMore.length > 30) console.log(`  ... 还有 ${needMore.length - 30} 味`)

  await c.end()
}

main().catch(console.error)
