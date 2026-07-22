require('dotenv').config()
const { pool } = require('./config/mysql')

async function checkData() {
  const [rows] = await pool.query('SELECT id, name, alias, keywords FROM herbs LIMIT 2')
  console.log('数据库原始数据:')
  console.log(JSON.stringify(rows, null, 2))
  console.log('\nalias类型:', typeof rows[0].alias)
  console.log('keywords类型:', typeof rows[0].keywords)
  
  try {
    const parsed = JSON.parse(rows[0].alias)
    console.log('\nalias JSON解析结果:', parsed)
    console.log('解析后类型:', typeof parsed)
  } catch (e) {
    console.log('\nalias JSON解析失败:', e.message)
  }
  
  process.exit(0)
}

checkData().catch(e => {
  console.error(e)
  process.exit(1)
})
