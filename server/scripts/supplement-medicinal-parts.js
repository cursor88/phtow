require('dotenv').config({ path: __dirname + '/../.env' })
const mysql = require('mysql2/promise')
const axios = require('axios')

const BASE_URL = 'https://zjzybbg.zjyj.org.cn/bbg'

async function searchMedicine(keyword) {
  try {
    const response = await axios.get(`${BASE_URL}/search/search`, {
      params: { type: 1, context: keyword, pageNo: 1, pageSize: 10 },
      headers: { 'User-Agent': 'Mozilla/5.0' },
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
      headers: { 'User-Agent': 'Mozilla/5.0' },
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

function extractMedicinalPart(content) {
  const text = extractText(content)
  const sourceMatch = text.match(/本品为[^。]+的干燥([^。]+)[。，]/)
  if (sourceMatch) return sourceMatch[1].trim()
  
  const altMatch = text.match(/药用部位[：:]([^。\n]+)/)
  if (altMatch) return altMatch[1].trim()
  
  return ''
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

  console.log('===== 补充药用部位 =====\n')

  const [herbs] = await connection.query(`
    SELECT id, name, medicinal_parts
    FROM herbs
    WHERE name NOT LIKE '%自定义%' AND (medicinal_parts IS NULL OR medicinal_parts = '')
    ORDER BY id
  `)

  console.log(`待补充: ${herbs.length} 味药材`)

  let updated = 0

  for (let i = 0; i < herbs.length; i++) {
    const herb = herbs[i]

    const results = await searchMedicine(herb.name)
    if (results.length === 0) {
      if (i % 30 === 0) console.log(`[${i + 1}/${herbs.length}] ${herb.name} - 无搜索结果`)
      continue
    }

    const mainResult = results.find(r => r.medicineName === herb.name && r.standard === '药材') ||
                       results.find(r => r.medicineName === herb.name) ||
                       results[0]

    const detail = await getMedicineDetail(mainResult.medicineSpeciesInfoId)
    if (!detail.content) {
      if (i % 30 === 0) console.log(`[${i + 1}/${herbs.length}] ${herb.name} - 无详情`)
      continue
    }

    const part = extractMedicinalPart(detail.content)
    if (part) {
      await connection.query('UPDATE herbs SET medicinal_parts = ?, updated_at = NOW() WHERE id = ?', [part, herb.id])
      updated++
      console.log(`[${i + 1}/${herbs.length}] ${herb.name} - ${part}`)
    } else {
      if (i % 30 === 0) console.log(`[${i + 1}/${herbs.length}] ${herb.name} - 未找到药用部位`)
    }

    await new Promise(r => setTimeout(r, 100))
  }

  console.log(`\n完成: 更新 ${updated} 条`)
  await connection.end()
}

main().catch(console.error)
