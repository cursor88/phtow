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
    const [result] = await connection.query(
      "DELETE FROM herb_images WHERE image_url LIKE 'https://picsum.photos/seed/%'"
    )
    console.log('[清理完成] 删除', result.affectedRows, '条 picsum.photos 图片记录')
  } catch (error) {
    console.error('[错误]', error.message)
  } finally {
    await connection.end()
  }
}

main().catch(console.error)