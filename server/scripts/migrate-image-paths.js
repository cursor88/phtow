/**
 * 数据库图片路径迁移脚本
 * 将旧路径 /uploads/herbs/ → /static/herbs/
 * 将旧路径 /uploads/auth/ → /static/auth/
 * 将旧路径 /feedback-images/ → /uploads/feedback/
 *
 * 用法：node server/scripts/migrate-image-paths.js
 */
require('dotenv').config()
const { pool, testConnection } = require('../config/mysql')

async function migrate() {
  const ok = await testConnection()
  if (!ok) {
    console.error('MySQL 连接失败');
    process.exit(1)
  }

  console.log('===== 开始迁移图片路径 =====\n')

  // 1. herb_images.image_url: /uploads/herbs/ → /static/herbs/
  const [r1] = await pool.query(
    "UPDATE herb_images SET image_url = REPLACE(image_url, '/uploads/herbs/', '/static/herbs/') WHERE image_url LIKE '/uploads/herbs/%'"
  )
  console.log(`[herb_images.image_url] 更新 ${r1.affectedRows} 条: /uploads/herbs/ → /static/herbs/`)

  // 2. herbs 表中可能有 image / cover_image_url 字段（旧数据）
  try {
    const [r2] = await pool.query(
      "UPDATE herbs SET image = REPLACE(image, '/uploads/herbs/', '/static/herbs/') WHERE image LIKE '/uploads/herbs/%'"
    )
    console.log(`[herbs.image] 更新 ${r2.affectedRows} 条: /uploads/herbs/ → /static/herbs/`)
  } catch (e) { /* 字段可能不存在，忽略 */ }

  try {
    const [r3] = await pool.query(
      "UPDATE herbs SET cover_image_url = REPLACE(cover_image_url, '/uploads/herbs/', '/static/herbs/') WHERE cover_image_url LIKE '/uploads/herbs/%'"
    )
    console.log(`[herbs.cover_image_url] 更新 ${r3.affectedRows} 条: /uploads/herbs/ → /static/herbs/`)
  } catch (e) { /* 字段可能不存在，忽略 */ }

  // 3. herb_authentication.genuine_images (JSON 数组): /uploads/auth/ → /static/auth/
  const [authRows] = await pool.query(
    "SELECT id, genuine_images, fake_images FROM herb_authentication WHERE genuine_images LIKE '%/uploads/auth/%' OR fake_images LIKE '%/uploads/auth/%'"
  )
  let authCount = 0
  for (const row of authRows) {
    const newGenuine = (row.genuine_images || '').replace(/\/uploads\/auth\//g, '/static/auth/')
    const newFake = (row.fake_images || '').replace(/\/uploads\/auth\//g, '/static/auth/')
    await pool.query(
      'UPDATE herb_authentication SET genuine_images = ?, fake_images = ? WHERE id = ?',
      [newGenuine, newFake, row.id]
    )
    authCount++
  }
  console.log(`[herb_authentication] 更新 ${authCount} 条: /uploads/auth/ → /static/auth/`)

  // 4. pending_reference_images.image_path: /uploads/herbs/ → /static/herbs/
  try {
    const [r4] = await pool.query(
      "UPDATE pending_reference_images SET image_path = REPLACE(image_path, '/uploads/herbs/', '/static/herbs/') WHERE image_path LIKE '/uploads/herbs/%'"
    )
    console.log(`[pending_reference_images.image_path] 更新 ${r4.affectedRows} 条`)
  } catch (e) { /* 表可能不存在，忽略 */ }

  // 5. reference_images.image_url: /uploads/herbs/ → /static/herbs/
  try {
    const [r5] = await pool.query(
      "UPDATE reference_images SET image_url = REPLACE(image_url, '/uploads/herbs/', '/static/herbs/') WHERE image_url LIKE '/uploads/herbs/%'"
    )
    console.log(`[reference_images.image_url] 更新 ${r5.affectedRows} 条`)
  } catch (e) { /* 表可能不存在，忽略 */ }

  // 6. feedback 相关路径: /feedback-images/ → /uploads/feedback/
  try {
    const [r6] = await pool.query(
      "UPDATE pending_reference_images SET image_path = REPLACE(image_path, '/feedback-images/', '/uploads/feedback/') WHERE image_path LIKE '%/feedback-images/%'"
    )
    console.log(`[pending_reference_images.image_path] 更新 ${r6.affectedRows} 条: /feedback-images/ → /uploads/feedback/`)
  } catch (e) { /* 忽略 */ }

  console.log('\n===== 迁移完成 =====')

  // 验证：检查是否还有残留的旧路径
  const [check1] = await pool.query(
    "SELECT COUNT(*) as cnt FROM herb_images WHERE image_url LIKE '/uploads/herbs/%'"
  )
  const [check2] = await pool.query(
    "SELECT COUNT(*) as cnt FROM herb_authentication WHERE genuine_images LIKE '%/uploads/auth/%' OR fake_images LIKE '%/uploads/auth/%'"
  )
  console.log(`\n验证：herb_images 残留旧路径 ${check1[0].cnt} 条`)
  console.log(`验证：herb_authentication 残留旧路径 ${check2[0].cnt} 条`)

  if (check1[0].cnt === 0 && check2[0].cnt === 0) {
    console.log('✓ 所有路径迁移成功，无残留')
  } else {
    console.log('⚠️ 仍有残留旧路径，请检查')
  }

  await pool.end()
}

migrate().catch(e => {
  console.error('迁移失败:', e)
  process.exit(1)
})
