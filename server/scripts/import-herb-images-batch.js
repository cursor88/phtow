/**
 * 批量导入药材图片
 * 使用方法：
 * 1. 将药材图片按目录组织：server/data/assets/herbs/{药材ID}/xxx.jpg
 * 2. 运行此脚本，自动扫描目录并更新数据库
 * 
 * 支持的图片格式：jpg, jpeg, png, gif, webp
 */

require('dotenv').config({ path: __dirname + '/../.env' })
const mysql = require('mysql2/promise')
const fs = require('fs')
const path = require('path')

const herbsUploadDir = path.join(__dirname, '../data/assets/herbs')
const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp']

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

    const [herbs] = await connection.query('SELECT id, name FROM herbs ORDER BY id')
    console.log(`[查询] 共 ${herbs.length} 味药材`)

    let totalAdded = 0
    let totalUpdated = 0
    let totalDeleted = 0

    for (const herb of herbs) {
      const herbDir = path.join(herbsUploadDir, herb.id.toString())
      
      if (!fs.existsSync(herbDir)) continue

      const files = fs.readdirSync(herbDir)
      const imageFiles = files.filter(f => 
        allowedExts.includes(path.extname(f).toLowerCase())
      )

      if (imageFiles.length === 0) continue

      // 删除旧的SVG占位图记录
      const [oldImages] = await connection.query(
        'SELECT id, image_url FROM herb_images WHERE herb_id = ?',
        [herb.id]
      )
      
      for (const oldImg of oldImages) {
        if (oldImg.image_url.endsWith('.svg')) {
          await connection.query(
            'DELETE FROM herb_images WHERE id = ?',
            [oldImg.id]
          )
          totalDeleted++
        }
      }

      // 按文件名排序
      imageFiles.sort()

      for (let i = 0; i < imageFiles.length; i++) {
        const fileName = imageFiles[i]
        const imageUrl = `/static/herbs/${herb.id}/${fileName}`
        const isCover = (i === 0) ? 1 : 0
        
        // 检查是否已存在
        const [exists] = await connection.query(
          'SELECT id FROM herb_images WHERE herb_id = ? AND image_url = ?',
          [herb.id, imageUrl]
        )

        if (exists.length > 0) {
          // 更新封面标记
          await connection.query(
            'UPDATE herb_images SET is_cover = ?, sort_order = ? WHERE id = ?',
            [isCover, i + 1, exists[0].id]
          )
          totalUpdated++
        } else {
          await connection.query(`
            INSERT INTO herb_images (herb_id, image_url, is_cover, sort_order, created_at)
            VALUES (?, ?, ?, ?, NOW())
          `, [herb.id, imageUrl, isCover, i + 1])
          totalAdded++
        }
      }

      console.log(`[处理] ${herb.name} - ${imageFiles.length} 张图片`)
    }

    console.log('\n========================================')
    console.log(`批量导入完成！`)
    console.log(`  新增图片: ${totalAdded} 张`)
    console.log(`  更新图片: ${totalUpdated} 张`)
    console.log(`  删除SVG: ${totalDeleted} 张`)
    console.log('========================================')

  } catch (error) {
    console.error('[错误]', error.message)
    throw error
  } finally {
    await connection.end()
  }
}

main().catch(console.error)