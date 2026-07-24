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

  const [columns] = await c.query(
    'SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = ? AND table_name = ? ORDER BY ordinal_position',
    ['caomuyoufang', 'herbs']
  )

  console.log('=== herbs 表字段 ===')
  columns.forEach(col => {
    console.log('  ' + col.column_name + ' (' + col.data_type + ')')
  })

  const colNames = columns.map(c => c.column_name)
  console.log('\n字段名列表:', colNames.join(', '))

  const [sample] = await c.query('SELECT * FROM herbs LIMIT 1')
  console.log('\n=== 单条数据示例 ===')
  console.log(JSON.stringify(sample[0], null, 2))

  await c.end()
}

main().catch(console.error)
