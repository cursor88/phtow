require('dotenv').config({ path: __dirname + '/../.env' })
const mysql = require('mysql2/promise')
const axios = require('axios')

const BASE_URL = 'https://zjzybbg.zjyj.org.cn/bbg'

async function searchMedicine(keyword) {
  try {
    const response = await axios.get(`${BASE_URL}/search/search`, {
      params: { type: 1, context: keyword, pageNo: 1, pageSize: 10 },
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: 15000
    })
    return response.data.result?.records || []
  } catch (e) {
    return []
  }
}

async function getMedicineDetail(speciesInfoId) {
  try {
    const response = await axios.get(`${BASE_URL}/medicine/display/detail`, {
      params: { speciesInfoId },
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: 15000
    })
    return response.data.result || {}
  } catch (e) {
    return {}
  }
}

function extractText(content) {
  if (!content) return ''
  return content.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
}

function parseContent(content) {
  const result = {}
  
  const traitsMatch = content.match(/【性状】([\s\S]*?)(?=【|$)/)
  if (traitsMatch) result.traits = extractText(traitsMatch[1])
  
  const effectMatch = content.match(/【功能与主治】([\s\S]*?)(?=【|$)/)
  if (effectMatch) result.effect = extractText(effectMatch[1])
  
  const usageMatch = content.match(/【用法与用量】([\s\S]*?)(?=【|$)/)
  if (usageMatch) result.usage = extractText(usageMatch[1])
  
  const tabooMatch = content.match(/【注意】([\s\S]*?)(?=【|$)/)
  if (tabooMatch) result.taboo = extractText(tabooMatch[1])
  
  return result
}

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT) || 3306,
    database: process.env.MYSQL_DATABASE || 'caomuyoufang',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    charset: 'utf8mb4'
  })

  console.log('===== 药材字段补充 =====\n')

  const [herbs] = await connection.query(`
    SELECT id, name, scientific_name, family, medicinal_parts, pinyin, effect, identify_points, dosage, taboo
    FROM herbs
    WHERE name NOT LIKE '%自定义%'
    ORDER BY id
  `)

  let updated = 0
  let totalFields = 0

  for (let i = 0; i < herbs.length; i++) {
    const herb = herbs[i]
    let needsUpdate = false
    let updates = {}

    const results = await searchMedicine(herb.name)
    if (results.length === 0) continue

    const mainResult = results.find(r => r.medicineName === herb.name && r.standard === '药材') ||
                       results.find(r => r.medicineName === herb.name) ||
                       results[0]
    const speciesInfoId = mainResult.medicineSpeciesInfoId

    const detail = await getMedicineDetail(speciesInfoId)
    if (!detail.content) continue

    const parsed = parseContent(detail.content)

    if ((!herb.scientific_name || herb.scientific_name === '') && detail.latinName) {
      updates.scientific_name = extractText(detail.latinName)
      needsUpdate = true
      totalFields++
    }

    if ((!herb.family || herb.family === '') && mainResult.sectionName) {
      updates.family = extractText(mainResult.sectionName)
      needsUpdate = true
      totalFields++
    }

    if ((!herb.medicinal_parts || herb.medicinal_parts === '') && mainResult.medicinalParts) {
      updates.medicinal_parts = extractText(mainResult.medicinalParts)
      needsUpdate = true
      totalFields++
    }

    if ((!herb.pinyin || herb.pinyin === '') && detail.pinYin) {
      updates.pinyin = extractText(detail.pinYin)
      needsUpdate = true
      totalFields++
    }

    if ((!herb.effect || herb.effect === '') && parsed.effect) {
      updates.effect = parsed.effect
      needsUpdate = true
      totalFields++
    }

    if ((!herb.identify_points || herb.identify_points === '') && parsed.traits) {
      updates.identify_points = parsed.traits
      needsUpdate = true
      totalFields++
    }

    if ((!herb.dosage || herb.dosage === '') && parsed.usage) {
      updates.dosage = parsed.usage
      needsUpdate = true
      totalFields++
    }

    if ((!herb.taboo || herb.taboo === '') && parsed.taboo) {
      updates.taboo = parsed.taboo
      needsUpdate = true
      totalFields++
    }

    if (needsUpdate) {
      updates.updated_at = 'NOW()'
      const setClause = Object.keys(updates).map(k => 
        k === 'updated_at' ? `${k} = NOW()` : `${k} = ?`
      ).join(', ')
      const values = Object.keys(updates).filter(k => k !== 'updated_at').map(k => updates[k])

      await connection.query(
        `UPDATE herbs SET ${setClause} WHERE id = ?`,
        [...values, herb.id]
      )
      updated++

      const updatedFields = Object.keys(updates).filter(k => k !== 'updated_at').join(', ')
      console.log(`[${i + 1}/${herbs.length}] ${herb.name} - 更新: ${updatedFields}`)
    }

    await new Promise(r => setTimeout(r, 100))
  }

  console.log(`\n========================================`)
  console.log(`完成统计:`)
  console.log(`  搜索药材: ${herbs.length} 味`)
  console.log(`  更新记录: ${updated} 条`)
  console.log(`  更新字段: ${totalFields} 个`)
  console.log('========================================')

  await connection.end()
}

main().catch(console.error)
