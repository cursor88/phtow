require('dotenv').config({ path: __dirname + '/../.env' })
const mysql = require('mysql2/promise')

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT) || 3306,
    database: process.env.MYSQL_DATABASE || 'caomuyoufang',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    charset: 'utf8mb4'
  })

  try {
    const [tables] = await connection.query("SHOW TABLES LIKE '%food%'")
    console.log('相关表:', tables.map(t => Object.values(t)[0]))

    if (tables.length > 0) {
      const t = tables[0][Object.keys(tables[0])[0]]
      const [cols] = await connection.query('DESCRIBE ??', [t])
      console.log('\n表结构:', t)
      cols.forEach(col => console.log(' ', col.Field, ':', col.Type))

      const [count] = await connection.query('SELECT COUNT(*) as cnt FROM ??', [t])
      console.log('\n记录数:', count[0].cnt)

      const [rows] = await connection.query('SELECT * FROM ?? LIMIT 3', [t])
      console.log('\n示例数据:', JSON.stringify(rows, null, 2))
    }
  } catch (error) {
    console.error('[错误]', error.message)
  } finally {
    await connection.end()
  }
}

main().catch(console.error)
