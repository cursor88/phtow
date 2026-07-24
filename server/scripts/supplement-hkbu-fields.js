require('dotenv').config({ path: __dirname + '/../.env' })
const mysql = require('mysql2/promise')
const axios = require('axios')

const BASE_URL = 'https://sys01.lib.hkbu.edu.hk/cmed/mmid'

function stripHtml(s) {
  if (!s) return ''
  return s.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
}

function parseListPage(html) {
  const herbs = []
  const tbodyMatch = html.match(/<tbody>([\s\S]*?)<\/tbody>/)
  if (!tbodyMatch) return herbs
  const rows = tbodyMatch[1].match(/<tr[^>]*>([\s\S]*?)<\/tr>/g) || []
  for (const row of rows) {
    const cells = row.match(/<td[^>]*>([\s\S]*?)<\/td>/g) || []
    if (cells.length < 10) continue
    const numCell = cells[0]
    const linkMatch = numCell.match(/href="([^"]+)"/)
    const detailUrl = linkMatch ? linkMatch[1] : ''
    const pidMatch = detailUrl.match(/pid=([^&]+)/)
    const pid = pidMatch ? pidMatch[1] : ''
    const nameCell = cells[1]
    const nameMatch = nameCell.match(/([\u4e00-\u9fa5]+)/)
    const name = nameMatch ? nameMatch[1].trim() : ''
    if (name && pid) herbs.push({ name, pid })
  }
  return herbs
}

function parseDetailHtml(html) {
  const result = { name: '', latinName: '', efficacy: '', properties: '' }
  const rows = html.match(/<tr[^>]*>([\s\S]*?)<\/tr>/g) || []
  for (const row of rows) {
    const cells = row.match(/<td[^>]*>([\s\S]*?)<\/td>/g) || []
    if (cells.length < 2) continue
    const label = stripHtml(cells[0])
    const value = stripHtml(cells[1])
    if (label.includes('名称')) result.name = value
    else if (label.includes('拉丁')) result.latinName = value
    else if (label.includes('性状')) result.properties = value
    else if (label.includes('功效')) result.efficacy = value
  }
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

  console.log('===== 从 HKBU 补充药材字段 =====\n')

  console.log('第一步：爬取 HKBU 全部列表建立映射...')
  const allHkbuHerbs = []
  for (let page = 1; page <= 105; page++) {
    try {
      const listResponse = await axios.get(`${BASE_URL}/index.php?lang=chs&page=${page}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 15000
      })
      const herbs = parseListPage(listResponse.data)
      if (herbs.length > 0) allHkbuHerbs.push(...herbs)
    } catch (e) { /* ignore */ }
  }
  console.log(`HKBU 共收集 ${allHkbuHerbs.length} 条药材`)

  const nameToPid = new Map()
  for (const h of allHkbuHerbs) nameToPid.set(h.name, h.pid)

  const [herbs] = await connection.query(`
    SELECT id, name, scientific_name, effect, identify_points
    FROM herbs
    WHERE name NOT LIKE '%自定义%'
    ORDER BY id
  `)

  let updated = 0
  let totalFields = 0

  for (let i = 0; i < herbs.length; i++) {
    const herb = herbs[i]
    const pid = nameToPid.get(herb.name)
    if (!pid) continue

    let needsUpdate = false
    let updates = {}

    try {
      const detailResponse = await axios.get(
        `${BASE_URL}/detail.php?lang=chs&pid=${pid}`,
        { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 15000 }
      )
      const detail = parseDetailHtml(detailResponse.data)

      if ((!herb.scientific_name || herb.scientific_name === '') && detail.latinName) {
        updates.scientific_name = detail.latinName
        needsUpdate = true
        totalFields++
      }

      if ((!herb.effect || herb.effect === '') && detail.efficacy) {
        updates.effect = detail.efficacy
        needsUpdate = true
        totalFields++
      }

      if ((!herb.identify_points || herb.identify_points === '') && detail.properties) {
        updates.identify_points = detail.properties
        needsUpdate = true
        totalFields++
      }

      if (needsUpdate) {
        updates.updated_at = 'NOW()'
        const setClause = Object.keys(updates).map(k =>
          k === 'updated_at' ? `${k} = NOW()` : `${k} = ?`
        ).join(', ')
        const values = Object.keys(updates).filter(k => k !== 'updated_at').map(k => updates[k])

        await connection.query(`UPDATE herbs SET ${setClause} WHERE id = ?`, [...values, herb.id])
        updated++

        const updatedFields = Object.keys(updates).filter(k => k !== 'updated_at').join(', ')
        console.log(`[${i + 1}/${herbs.length}] ${herb.name} - 更新: ${updatedFields}`)
      }

    } catch (e) { /* ignore */ }

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
