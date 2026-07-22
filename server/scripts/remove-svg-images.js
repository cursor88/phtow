require('dotenv').config({ path: __dirname + '/../.env' })
const mysql = require('mysql2/promise')
const fs = require('fs')
const path = require('path')

const herbsUploadDir = path.join(__dirname, '../uploads/herbs')

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
    console.log('[MySQL] 连接成功')

    // 1. 删除文件系统中的 SVG 文件
    let deletedFiles = 0
    function deleteSvgFiles(dir) {
      const items = fs.readdirSync(dir)
      for (const item of items) {
        const fullPath = path.join(dir, item)
        const stat = fs.statSync(fullPath)
        if (stat.isDirectory()) {
          deleteSvgFiles(fullPath)
        } else if (item.endsWith('.svg')) {
          fs.unlinkSync(fullPath)
          deletedFiles++
          console.log(`[删除文件] ${fullPath}`)
        }
      }
    }

    deleteSvgFiles(herbsUploadDir)
    console.log(`\n[文件清理] 共删除 ${deletedFiles} 个 SVG 文件`)

    // 2. 清理 herb_images 表中的 SVG 记录
    const [herbResult] = await connection.query(
      "DELETE FROM herb_images WHERE image_url LIKE '%.svg'"
    )
    console.log(`[数据库清理] herb_images 表删除 ${herbResult.affectedRows} 条 SVG 记录`)

    // 3. 清理 reference_images 表中的 SVG 记录
    const [refResult] = await connection.query(
      "DELETE FROM reference_images WHERE image_path LIKE '%.svg'"
    )
    console.log(`[数据库清理] reference_images 表删除 ${refResult.affectedRows} 条 SVG 记录`)

    // 4. 清理 pending_reference_images 表中的 SVG 记录
    const [pendingResult] = await connection.query(
      "DELETE FROM pending_reference_images WHERE image_path LIKE '%.svg'"
    )
    console.log(`[数据库清理] pending_reference_images 表删除 ${pendingResult.affectedRows} 条 SVG 记录`)

    console.log('\n========================================')
    console.log('SVG 清理完成！')
    console.log(`  删除文件: ${deletedFiles} 个`)
    console.log(`  herb_images 清理: ${herbResult.affectedRows} 条`)
    console.log(`  reference_images 清理: ${refResult.affectedRows} 条`)
    console.log(`  pending_reference_images 清理: ${pendingResult.affectedRows} 条`)
    console.log('========================================')

  } catch (error) {
    console.error('[错误]', error.message)
    throw error
  } finally {
    await connection.end()
  }
}

main().catch(console.error)
