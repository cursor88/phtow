require('dotenv').config()
const mysql = require('mysql2/promise')

async function createDatabase() {
  const conn = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    charset: 'utf8mb4'
  })

  try {
    const dbName = process.env.MYSQL_DATABASE || 'caomuyoufang'
    console.log(`正在创建数据库 ${dbName}...`)

    await conn.query(
      `CREATE DATABASE IF NOT EXISTS ${dbName} DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    )

    console.log(`数据库 ${dbName} 创建成功（或已存在）`)
  } catch (error) {
    console.error('创建数据库失败:', error.message)
    throw error
  } finally {
    await conn.end()
  }
}

createDatabase()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))
