require('dotenv').config({ path: __dirname + '/.env' })
const { pool } = require('./config/mysql')
const zhihuWeeklyRecipes = require('./data/zhihu-weekly-recipes')

async function importWeeklyRecipes() {
  console.log('\n========== 开始导入知乎一周食谱数据 ==========')
  console.log(`待导入药膳数量: ${zhihuWeeklyRecipes.length}`)

  let conn
  try {
    conn = await pool.getConnection()
    await conn.beginTransaction()

    const [maxIdResult] = await conn.query('SELECT MAX(id) as maxId FROM food_matches')
    let currentId = (maxIdResult[0].maxId || 0) + 1
    console.log(`当前最大ID: ${maxIdResult[0].maxId || 0}, 新数据从ID ${currentId} 开始`)

    const [herbs] = await conn.query('SELECT id, name, alias FROM herbs')
    const herbNameMap = new Map()
    herbs.forEach(h => {
      herbNameMap.set(h.name, h.id)
      if (h.alias) {
        try {
          const aliases = typeof h.alias === 'string' ? JSON.parse(h.alias) : h.alias
          aliases.forEach(alias => herbNameMap.set(alias, h.id))
        } catch (e) {}
      }
    })
    console.log(`已加载 ${herbs.length} 种药材映射`)

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
        console.log('添加 source_herb 字段失败:', e.message)
      }
    }

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
        console.log('添加 source_url 字段失败:', e.message)
      }
    }

    try {
      await conn.query(`
        ALTER TABLE food_matches 
        ADD COLUMN category VARCHAR(50) DEFAULT NULL COMMENT '分类：健脾养胃/补气养血/清热润肺/祛湿利水/养肝明目/周末调理' AFTER source_herb
      `)
      console.log('已添加 category 字段')
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('category 字段已存在')
      } else {
        console.log('添加 category 字段失败:', e.message)
      }
    }

    const [existingNames] = await conn.query('SELECT name FROM food_matches')
    const existingNameSet = new Set(existingNames.map(r => r.name))

    let successCount = 0
    let skipCount = 0
    let failCount = 0

    for (const recipe of zhihuWeeklyRecipes) {
      try {
        if (existingNameSet.has(recipe.name)) {
          console.log(`  ⊘ ${recipe.name} (已存在，跳过)`)
          skipCount++
          continue
        }

        const herbId = herbNameMap.get(recipe.source_herb) || null

        const imageUrl = `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(recipe.name + ' Chinese herbal medicine food therapy healthy dish high quality')}&image_size=square_hd`

        const [result] = await conn.query(
          `INSERT INTO food_matches (id, name, herb_id, source_herb, category, ingredients, effect, suitable, taboo, method, image, source_url)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            currentId,
            recipe.name,
            herbId,
            recipe.source_herb,
            recipe.category || null,
            JSON.stringify(recipe.ingredients),
            recipe.effect,
            recipe.suitable || '',
            '',
            recipe.method,
            imageUrl,
            recipe.source_url
          ]
        )

        if (herbId) {
          await conn.query(
            `INSERT IGNORE INTO herb_food_match (herb_id, food_match_id, sort_order) VALUES (?, ?, 0)`,
            [herbId, currentId]
          )
        }

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
    console.log(`跳过(已存在): ${skipCount} 条`)
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

importWeeklyRecipes().catch(console.error)
