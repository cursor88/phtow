const { pool } = require('../config/mysql')

async function main() {
  const [r] = await pool.query(`
    SELECT h.id, h.name 
    FROM herbs h 
    LEFT JOIN herb_images hi ON h.id = hi.herb_id 
    WHERE hi.id IS NULL 
      AND h.name != '自定义药材' 
      AND h.name != ''
    ORDER BY h.id
  `)
  console.log('缺图药材数:', r.length)
  r.forEach(h => console.log(`  ${h.id} - ${h.name}`))
  await pool.end()
}

main().catch(console.error)