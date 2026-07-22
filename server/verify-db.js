require('dotenv').config()
const { pool } = require('./config/mysql')

async function verify() {
  console.log('========== 数据验证 ==========\n')

  const [herbs] = await pool.query('SELECT COUNT(*) as count FROM herbs')
  console.log(`药材数量: ${herbs[0].count}`)

  const [ki] = await pool.query('SELECT COUNT(*) as count FROM key_identification')
  console.log(`鉴别点数量: ${ki[0].count}`)

  const [classics] = await pool.query('SELECT COUNT(*) as count FROM classics')
  console.log(`典籍记载数量: ${classics[0].count}`)

  const [food] = await pool.query('SELECT COUNT(*) as count FROM food_matches')
  console.log(`药食搭配数量: ${food[0].count}`)

  const [hfm] = await pool.query('SELECT COUNT(*) as count FROM herb_food_match')
  console.log(`药材-搭配关联: ${hfm[0].count}`)

  const [quizzes] = await pool.query('SELECT COUNT(*) as count FROM quizzes')
  console.log(`题目数量: ${quizzes[0].count}`)

  console.log('\n========== 示例查询 ==========\n')

  const [sample] = await pool.query(`
    SELECT h.id, h.name, h.category, h.effect, 
           ki.smell, ki.texture
    FROM herbs h
    LEFT JOIN key_identification ki ON h.id = ki.herb_id
    WHERE h.id <= 3
    ORDER BY h.id
  `)
  console.log('前3条药材示例:')
  sample.forEach(h => {
    console.log(`  ${h.id}. ${h.name} (${h.category})`)
    console.log(`     功效: ${h.effect.substring(0, 30)}...`)
    console.log(`     气味: ${h.smell?.substring(0, 20) || '无数据'}...`)
  })

  console.log('\n========== 分类统计 ==========\n')
  const [cats] = await pool.query(`
    SELECT category, COUNT(*) as count 
    FROM herbs 
    GROUP BY category 
    ORDER BY count DESC
  `)
  cats.forEach(c => {
    console.log(`  ${c.category}: ${c.count} 种`)
  })

  process.exit(0)
}

verify().catch(error => {
  console.error('验证失败:', error.message)
  process.exit(1)
})
