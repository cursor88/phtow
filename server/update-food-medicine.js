/**
 * 药食同源药材数据更新脚本
 * 来源: https://www.pests.cn/index/de_pages/120
 * 106种药食同源药材目录
 */

require('dotenv').config({ path: __dirname + '/.env' })
const { pool } = require('./config/mysql')

// 106种药食同源药材列表
const foodMedicineHerbs = [
  '丁香', '八角茴香', '刀豆', '小茴香', '小蓟', '山药', '山楂', '马齿苋', '乌梢蛇', '乌梅',
  '木瓜', '火麻仁', '代代花', '玉竹', '甘草', '白芷', '白果', '白扁豆', '白扁豆花', '龙眼肉',
  '桂圆', '决明子', '百合', '肉豆蔻', '肉桂', '余甘子', '佛手', '杏仁', '甜杏仁', '苦杏仁',
  '沙棘', '牡蛎', '芡实', '花椒', '赤小豆', '阿胶', '鸡内金', '麦芽', '昆布', '枣', '大枣',
  '酸枣', '黑枣', '罗汉果', '郁李仁', '金银花', '青果', '鱼腥草', '姜', '生姜', '干姜',
  '枳椇子', '枸杞子', '枸杞', '栀子', '砂仁', '胖大海', '茯苓', '香橼', '香薷', '桃仁',
  '桑叶', '桑椹', '桔红', '桔梗', '益智仁', '荷叶', '莱菔子', '莲子', '高良姜', '淡竹叶',
  '淡豆豉', '菊花', '菊苣', '黄芥子', '黄精', '紫苏', '紫苏籽', '葛根', '黑芝麻', '黑胡椒',
  '槐米', '槐花', '蒲公英', '蜂蜜', '榧子', '酸枣仁', '鲜白茅根', '白茅根', '鲜芦根', '芦根',
  '蝮蛇', '橘皮', '薄荷', '薏苡仁', '薤白', '覆盆子', '藿香', '当归', '山柰', '西红花',
  '藏红花', '草果', '姜黄', '荜茇', '党参', '肉苁蓉', '铁皮石斛', '西洋参', '黄芪', '灵芝',
  '山茱萸', '天麻', '杜仲叶', '杜仲', '地黄', '麦冬', '天冬', '化橘红'
]

async function updateFoodMedicineStatus() {
  console.log('\n========== 药食同源数据更新 ==========')
  console.log(`药食同源药材列表: ${foodMedicineHerbs.length} 种`)

  let conn
  try {
    conn = await pool.getConnection()
    await conn.beginTransaction()

    // 1. 添加 is_food_medicine 字段
    try {
      await conn.query(`
        ALTER TABLE herbs 
        ADD COLUMN is_food_medicine TINYINT(1) DEFAULT 0 COMMENT '是否药食同源: 0-否, 1-是'
      `)
      console.log('✓ 已添加 is_food_medicine 字段')
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('✓ is_food_medicine 字段已存在')
      } else {
        throw e
      }
    }

    // 2. 获取所有药材
    const [herbs] = await conn.query('SELECT id, name, alias FROM herbs')
    console.log(`✓ 当前数据库药材数量: ${herbs.length}`)

    // 3. 创建药材名称映射
    const herbNameMap = new Map()
    const herbAliasMap = new Map()
    
    herbs.forEach(h => {
      herbNameMap.set(h.name, h.id)
      if (h.alias) {
        try {
          const aliases = JSON.parse(h.alias)
          aliases.forEach(alias => herbAliasMap.set(alias, h.id))
        } catch (e) {}
      }
    })

    // 4. 更新药食同源标记
    let matchedCount = 0
    let matchedNames = []

    for (const fmHerb of foodMedicineHerbs) {
      let herbId = herbNameMap.get(fmHerb) || herbAliasMap.get(fmHerb)
      
      if (herbId) {
        await conn.query(
          'UPDATE herbs SET is_food_medicine = 1 WHERE id = ?',
          [herbId]
        )
        matchedCount++
        matchedNames.push(fmHerb)
      }
    }

    console.log(`\n✓ 已标记药食同源药材: ${matchedCount} 种`)
    console.log('匹配的药材:', matchedNames.join('、'))

    // 5. 统计未匹配的药食同源药材
    const unmatched = foodMedicineHerbs.filter(h => 
      !herbNameMap.has(h) && !herbAliasMap.has(h)
    )
    console.log(`\n✗ 未匹配的药食同源药材: ${unmatched.length} 种`)
    if (unmatched.length > 0) {
      console.log('未匹配:', unmatched.join('、'))
    }

    await conn.commit()
    console.log('\n========== 更新完成 ==========')

  } catch (error) {
    if (conn) await conn.rollback()
    console.error('更新失败:', error.message)
    throw error
  } finally {
    if (conn) conn.release()
    await pool.end()
  }
}

updateFoodMedicineStatus().catch(console.error)