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
    const [r1] = await connection.query("DELETE FROM reference_images WHERE image_name LIKE '%.svg'")
    console.log('[数据库清理] reference_images 表删除', r1.affectedRows, '条 SVG 记录')

    const [r2] = await connection.query("DELETE FROM pending_reference_images WHERE image_path LIKE '%.svg'")
    console.log('[数据库清理] pending_reference_images 表删除', r2.affectedRows, '条 SVG 记录')
  } catch (error) {
    console.error('[错误]', error.message)
  } finally {
    await connection.end()
  }
}

main().catch(console.error)
