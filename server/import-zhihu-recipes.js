/**
 * 知乎药膳数据导入脚本
 * 将zhihu-recipes.js中的药膳数据导入到MySQL的food_matches表
 */

require('dotenv').config({ path: __dirname + '/.env' })
const { pool } = require('./config/mysql')
const zhihuRecipes = require('./data/zhihu-recipes')

async function importZhihuRecipes() {
  console.log('\n========== 开始导入知乎药膳数据 ==========')
  console.log(`待导入药膳数量: ${zhihuRecipes.length}`)

  let conn
  try {
    conn = await pool.getConnection()
    await conn.beginTransaction()

    // 1. 获取当前最大ID
    const [maxIdResult] = await conn.query('SELECT MAX(id) as maxId FROM food_matches')
    let currentId = (maxIdResult[0].maxId || 0) + 1
    console.log(`当前最大ID: ${maxIdResult[0].maxId || 0}, 新数据从ID ${currentId} 开始`)

    // 2. 获取所有药材名称-ID映射
    const [herbs] = await conn.query('SELECT id, name, alias FROM herbs')
    const herbNameMap = new Map()
    herbs.forEach(h => {
      herbNameMap.set(h.name, h.id)
      // 也添加别名映射
      if (h.alias) {
        try {
          const aliases = JSON.parse(h.alias)
          aliases.forEach(alias => herbNameMap.set(alias, h.id))
        } catch (e) {}
      }
    })
    console.log(`已加载 ${herbs.length} 种药材映射`)

    // 3. 添加source_herb字段（如果不存在）
    try {
      await conn.query(`
        ALTER TABLE food_matches 
        ADD COLUMN source_herb VARCHAR(50) DEFAULT NULL COMMENT '来源药材名称' AFTER herb_id
      `)
      console.log('已添加 source_herb 字段')
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('source_herb 字段已存在')
      } else {
        console.log('添加字段失败:', e.message)
      }
    }

    // 4. 添加source_url字段（如果不存在）
    try {
      await conn.query(`
        ALTER TABLE food_matches 
        ADD COLUMN source_url VARCHAR(500) DEFAULT NULL COMMENT '来源文章URL' AFTER image
      `)
      console.log('已添加 source_url 字段')
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('source_url 字段已存在')
      } else {
        console.log('添加字段失败:', e.message)
      }
    }

    let successCount = 0
    let failCount = 0

    for (const recipe of zhihuRecipes) {
      try {
        // 查找药材ID
        const herbId = herbNameMap.get(recipe.source_herb) || null

        // 生成图片URL
        const imageUrl = `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(recipe.name + ' Chinese herbal medicine food therapy healthy dish high quality')}&image_size=square_hd`

        await conn.query(
          `INSERT INTO food_matches (id, name, herb_id, source_herb, ingredients, effect, suitable, taboo, method, image, source_url)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            currentId,
            recipe.name,
            herbId,
            recipe.source_herb,
            JSON.stringify(recipe.ingredients),
            recipe.effect,
            recipe.suitable || '',
            '',  // taboo字段暂空
            recipe.method,
            imageUrl,
            recipe.source_url
          ]
        )

        console.log(`  ✓ ${currentId}. ${recipe.name} (来源: ${recipe.source_herb}${herbId ? ', 药材ID: ' + herbId : ', 无匹配药材'})`)
        currentId++
        successCount++
      } catch (error) {
        failCount++
        console.error(`  ✗ ${recipe.name}: ${error.message}`)
      }
    }

    await conn.commit()
    console.log('\n========== 导入完成 ==========')
    console.log(`成功: ${successCount} 条`)
    console.log(`失败: ${failCount} 条`)

  } catch (error) {
    if (conn) await conn.rollback()
    console.error('导入失败:', error.message)
    throw error
  } finally {
    if (conn) conn.release()
    await pool.end()
  }
}

importZhihuRecipes().catch(console.error)