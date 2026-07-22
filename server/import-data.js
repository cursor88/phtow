require('dotenv').config()
const { pool, testConnection, initTables } = require('./config/mysql')
const herbs = require('./data/herbs')
const foodMatches = require('./data/foodMatches')
const quizzes = require('./data/quizzes')

async function importHerbs() {
  console.log('\n========== 开始导入药材数据 ==========')
  console.log(`待导入药材数量: ${herbs.length}`)

  let successCount = 0
  let failCount = 0

  for (const herb of herbs) {
    const conn = await pool.getConnection()
    try {
      await conn.beginTransaction()

      const [result] = await conn.query(
        `INSERT INTO herbs (id, name, pinyin, alias, category, nature, taste, meridian, effect, indication, dosage, taboo, identify_points, image_type, keywords)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           name = VALUES(name),
           pinyin = VALUES(pinyin),
           alias = VALUES(alias),
           category = VALUES(category),
           nature = VALUES(nature),
           taste = VALUES(taste),
           meridian = VALUES(meridian),
           effect = VALUES(effect),
           indication = VALUES(indication),
           dosage = VALUES(dosage),
           taboo = VALUES(taboo),
           identify_points = VALUES(identify_points),
           image_type = VALUES(image_type),
           keywords = VALUES(keywords)`,
        [
          herb.id,
          herb.name,
          herb.pinyin || '',
          JSON.stringify(herb.alias || []),
          herb.category || '',
          herb.nature || '',
          herb.taste || '',
          herb.meridian || '',
          herb.effect || '',
          herb.indication || '',
          herb.dosage || '',
          herb.taboo || '',
          herb.identify_points || '',
          herb.imageType || '',
          JSON.stringify(herb.keywords || [])
        ]
      )

      if (herb.key_identification) {
        await conn.query(
          `INSERT INTO key_identification (herb_id, smell, texture, cross_section, outer_skin, other)
           VALUES (?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             smell = VALUES(smell),
             texture = VALUES(texture),
             cross_section = VALUES(cross_section),
             outer_skin = VALUES(outer_skin),
             other = VALUES(other)`,
          [
            herb.id,
            herb.key_identification.smell || '',
            herb.key_identification.texture || '',
            herb.key_identification.cross_section || '',
            herb.key_identification.outer_skin || '',
            herb.key_identification.other || ''
          ]
        )
      }

      if (herb.classics && herb.classics.length > 0) {
        await conn.query('DELETE FROM classics WHERE herb_id = ?', [herb.id])
        for (const classic of herb.classics) {
          await conn.query(
            `INSERT INTO classics (herb_id, book, content) VALUES (?, ?, ?)`,
            [herb.id, classic.book || '', classic.content || '']
          )
        }
      }

      await conn.commit()
      successCount++
      console.log(`  ✓ ${herb.id}. ${herb.name}`)
    } catch (error) {
      await conn.rollback()
      failCount++
      console.error(`  ✗ ${herb.id}. ${herb.name}: ${error.message}`)
    } finally {
      conn.release()
    }
  }

  console.log(`药材导入完成: 成功 ${successCount} 条，失败 ${failCount} 条`)
}

async function importFoodMatches() {
  console.log('\n========== 开始导入药食同源搭配 ==========')
  console.log(`待导入搭配数量: ${foodMatches.length}`)

  let successCount = 0
  let failCount = 0

  for (const match of foodMatches) {
    try {
      await pool.query(
        `INSERT INTO food_matches (id, name, herb_id, ingredients, effect, suitable, taboo, method, image)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           name = VALUES(name),
           herb_id = VALUES(herb_id),
           ingredients = VALUES(ingredients),
           effect = VALUES(effect),
           suitable = VALUES(suitable),
           taboo = VALUES(taboo),
           method = VALUES(method),
           image = VALUES(image)`,
        [
          match.id,
          match.name,
          match.herbId || null,
          JSON.stringify(match.ingredients || []),
          match.effect || '',
          match.suitable || '',
          match.taboo || '',
          match.method || '',
          match.image || ''
        ]
      )
      successCount++
      console.log(`  ✓ ${match.id}. ${match.name}`)
    } catch (error) {
      failCount++
      console.error(`  ✗ ${match.id}. ${match.name}: ${error.message}`)
    }
  }

  console.log(`药食搭配导入完成: 成功 ${successCount} 条，失败 ${failCount} 条`)
}

async function importHerbFoodRelations() {
  console.log('\n========== 开始导入药材-搭配关联 ==========')

  let successCount = 0

  for (const herb of herbs) {
    if (herb.food_match && herb.food_match.length > 0) {
      for (let i = 0; i < herb.food_match.length; i++) {
        const matchId = herb.food_match[i]
        try {
          await pool.query(
            `INSERT IGNORE INTO herb_food_match (herb_id, food_match_id, sort_order) VALUES (?, ?, ?)`,
            [herb.id, matchId, i]
          )
          successCount++
        } catch (error) {
          console.error(`  ✗ 药材${herb.id}-搭配${matchId}: ${error.message}`)
        }
      }
    }
  }

  console.log(`关联关系导入完成: ${successCount} 条`)
}

async function importQuizzes() {
  console.log('\n========== 开始导入题目数据 ==========')
  console.log(`待导入题目数量: ${quizzes.length}`)

  let successCount = 0
  let failCount = 0

  for (const quiz of quizzes) {
    try {
      await pool.query(
        `INSERT INTO quizzes (id, question, options, answer, explanation, difficulty, category, herb_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           question = VALUES(question),
           options = VALUES(options),
           answer = VALUES(answer),
           explanation = VALUES(explanation),
           difficulty = VALUES(difficulty),
           category = VALUES(category),
           herb_id = VALUES(herb_id)`,
        [
          quiz.id,
          quiz.question,
          JSON.stringify(quiz.options || []),
          quiz.answer || '',
          quiz.explanation || '',
          quiz.difficulty || '',
          quiz.category || '',
          quiz.herbId || null
        ]
      )
      successCount++
    } catch (error) {
      failCount++
      console.error(`  ✗ ${quiz.id}. ${quiz.question.substring(0, 30)}: ${error.message}`)
    }
  }

  console.log(`题目导入完成: 成功 ${successCount} 条，失败 ${failCount} 条`)
}

async function main() {
  const connected = await testConnection()
  if (!connected) {
    console.error('\n数据库连接失败，请检查配置')
    process.exit(1)
  }

  await initTables()

  await importHerbs()
  await importFoodMatches()
  await importHerbFoodRelations()
  await importQuizzes()

  console.log('\n========== 所有数据导入完成 ==========')
  process.exit(0)
}

main().catch(error => {
  console.error('导入失败:', error)
  process.exit(1)
})
