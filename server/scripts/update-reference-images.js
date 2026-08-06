require('dotenv').config({ path: __dirname + '/../.env' })
const fs = require('fs')
const path = require('path')
const { pool } = require('../config/mysql')
const { extractFeatures } = require('../services/imageFeatureService')

const herbsUploadDir = path.join(__dirname, '../data/assets/herbs')

async function main() {
  console.log('[更新参考图] 开始更新 reference_images 表...')

  try {
    const [herbsWithImages] = await pool.query(`
      SELECT h.id, h.name, hi.image_url, hi.is_cover, hi.sort_order
      FROM herbs h
      JOIN herb_images hi ON h.id = hi.herb_id
      ORDER BY h.id, hi.is_cover DESC, hi.sort_order
    `)

    console.log(`[查询] 找到 ${herbsWithImages.length} 张药材图片`)

    const herbImageMap = new Map()
    for (const item of herbsWithImages) {
      const key = item.id
      if (!herbImageMap.has(key)) {
        herbImageMap.set(key, { id: item.id, name: item.name, images: [] })
      }
      herbImageMap.get(key).images.push(item.image_url)
    }

    console.log(`[处理] 共 ${herbImageMap.size} 种药材需要更新参考图`)

    let updatedCount = 0
    let skippedCount = 0
    let errorCount = 0

    for (const [herbId, herbData] of herbImageMap) {
      const herbName = herbData.name
      let imageIndex = 0

      for (const imageUrl of herbData.images) {
        if (imageIndex >= 3) break

        const imagePath = path.join(__dirname, '..', imageUrl.replace(/^\//, ''))

        if (!fs.existsSync(imagePath)) {
          console.log(`[跳过] ${herbName} - 文件不存在: ${imagePath}`)
          skippedCount++
          continue
        }

        try {
          console.log(`[提取特征] ${herbName} - ${path.basename(imagePath)}`)

          const imageBuffer = fs.readFileSync(imagePath)
          const features = await extractFeatures(imageBuffer)

          const imageName = `real-${imageIndex}`
          const id = `${herbId}-real-${imageIndex}`

          await pool.query(`
            INSERT INTO reference_images 
              (id, herb_id, herb_name, image_name, is_synthetic, features)
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
              herb_name = VALUES(herb_name),
              is_synthetic = VALUES(is_synthetic),
              features = VALUES(features)
          `, [id, herbId, herbName, imageName, false, JSON.stringify(features)])

          updatedCount++
          console.log(`  [成功] ${herbName} #${imageIndex + 1}`)

        } catch (error) {
          console.error(`  [失败] ${herbName} - ${error.message}`)
          errorCount++
        }

        imageIndex++
      }

      await new Promise(resolve => setTimeout(resolve, 200))
    }

    console.log('\n========================================')
    console.log('更新完成！')
    console.log(`  成功更新: ${updatedCount} 条`)
    console.log(`  跳过（文件不存在）: ${skippedCount} 条`)
    console.log(`  更新失败: ${errorCount} 条`)
    console.log(`  涉及药材: ${herbImageMap.size} 种`)
    console.log('========================================')

    const [finalStats] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_synthetic = TRUE THEN 1 ELSE 0 END) as synthetic_count,
        SUM(CASE WHEN is_synthetic = FALSE THEN 1 ELSE 0 END) as real_count
      FROM reference_images
    `)

    console.log('\n[统计] reference_images 表最终状态:')
    console.log(`  总记录数: ${finalStats[0].total}`)
    console.log(`  合成图像: ${finalStats[0].synthetic_count}`)
    console.log(`  真实图像: ${finalStats[0].real_count}`)

  } catch (error) {
    console.error('[错误]', error.message)
    throw error
  } finally {
    await pool.end()
  }
}

main().catch(console.error)