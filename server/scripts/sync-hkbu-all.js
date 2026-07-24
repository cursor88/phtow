require('dotenv').config({ path: __dirname + '/../.env' })
const mysql = require('mysql2/promise')
const axios = require('axios')
const fs = require('fs')
const path = require('path')

const BASE_URL = 'https://sys01.lib.hkbu.edu.hk/cmed/mmid'
const herbsUploadDir = path.join(__dirname, '../uploads/herbs')

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

    const latinCell = cells[3]
    const latinName = stripHtml(latinCell)

    const categoryCell = cells[7]
    const category = stripHtml(categoryCell)

    const imgCell = cells[9]
    const imgMatch = imgCell.match(/src="([^"]+)"/)
    const thumbUrl = imgMatch ? imgMatch[1] : ''

    if (name && pid) {
      herbs.push({ name, pid, latinName, category, thumbUrl })
    }
  }
  return herbs
}

function parseDetailHtml(html) {
  const result = {
    name: null,
    latinName: '',
    englishName: '',
    category: '',
    source: '',
    origin: '',
    properties: '',
    taste: '',
    efficacy: '',
    imageUrl: null
  }

  const titleMatch = html.match(/<h1[^>]*>([\u4e00-\u9fa5]+)</)
  if (titleMatch) result.name = titleMatch[1].trim()

  const imgMatch = html.match(/<img[^>]+src="(images\/[A-Z0-9]+\.jpg)"/)
  if (imgMatch) {
    result.imageUrl = `${BASE_URL}/${imgMatch[1]}`
  }

  const rows = html.match(/<tr[^>]*>([\s\S]*?)<\/tr>/g) || []
  for (const row of rows) {
    const cells = row.match(/<td[^>]*>([\s\S]*?)<\/td>/g) || []
    if (cells.length < 2) continue

    const label = stripHtml(cells[0])
    const value = stripHtml(cells[1])

    if (label.includes('名称')) result.name = value
    else if (label.includes('拼音')) {}
    else if (label.includes('英文')) result.englishName = value
    else if (label.includes('拉丁')) result.latinName = value
    else if (label.includes('类别')) result.category = value
    else if (label.includes('来源')) result.source = value
    else if (label.includes('产地')) result.origin = value
    else if (label.includes('性状')) result.properties = value
    else if (label.includes('性味')) result.taste = value
    else if (label.includes('功效')) result.efficacy = value
  }

  return result
}

async function downloadImage(url, savePath) {
  try {
    const response = await axios.get(url, {
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': BASE_URL
      },
      timeout: 30000
    })

    const writer = fs.createWriteStream(savePath)
    response.data.pipe(writer)

    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        writer.destroy()
        resolve(false)
      }, 30000)

      writer.on('finish', () => {
        clearTimeout(timer)
        resolve(true)
      })
      writer.on('error', () => {
        clearTimeout(timer)
        resolve(false)
      })
    })
  } catch (e) {
    return false
  }
}

async function main() {
  console.log('===== 第一步：爬取 HKBU 全部 420 条药材记录 =====')

  const allHkbuHerbs = []
  for (let page = 1; page <= 105; page++) {
    try {
      const listResponse = await axios.get(`${BASE_URL}/index.php?lang=chs&page=${page}`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        timeout: 15000
      })
      const herbs = parseListPage(listResponse.data)
      if (herbs.length > 0) {
        allHkbuHerbs.push(...herbs)
        if (page % 20 === 0) console.log(`[第 ${page}/105 页] 已收集 ${allHkbuHerbs.length} 条`)
      }
    } catch (e) {
      console.error(`[第 ${page} 页] 错误: ${e.message}`)
    }
  }

  console.log(`\n[HKBU] 共收集 ${allHkbuHerbs.length} 条药材`)

  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT) || 3306,
    database: process.env.MYSQL_DATABASE || 'caomuyoufang',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    charset: 'utf8mb4'
  })

  console.log('\n===== 第二步：对比数据库，找出缺失的药材 =====')

  const [existingRows] = await connection.query('SELECT id, name FROM herbs')
  const existingNames = new Set(existingRows.map(h => h.name))
  console.log(`[数据库] 现有 ${existingRows.length} 条药材`)

  const missingHerbs = allHkbuHerbs.filter(h => !existingNames.has(h.name))
  console.log(`[缺失] ${missingHerbs.length} 味药材需要新增`)

  if (missingHerbs.length === 0) {
    console.log('所有 HKBU 药材已在数据库中，无需新增。')
    await connection.end()
    return
  }

  console.log('\n===== 第三步：插入缺失的药材到 herbs 表 =====')
  let inserted = 0
  const insertedIds = []

  for (const h of missingHerbs) {
    try {
      const [result] = await connection.query(
        `INSERT INTO herbs (name, pinyin, scientific_name, category, keywords, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
        [h.name, '', h.latinName, h.category, h.name + ',' + (h.latinName || '')]
      )
      h.id = result.insertId
      insertedIds.push(result.insertId)
      inserted++
      console.log(`[插入] ${h.name} (ID=${result.insertId}) ${h.latinName ? '- ' + h.latinName : ''} [${h.category}]`)
    } catch (e) {
      console.log(`[错误] ${h.name} - ${e.message}`)
    }
  }

  console.log(`\n===== 第四步：为新增药材下载图片 =====`)
  let totalImg = 0

  for (const h of missingHerbs) {
    if (!h.id) continue

    try {
      const detailResponse = await axios.get(`${BASE_URL}/detail.php?lang=chs&pid=${h.pid}`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        timeout: 15000
      })

      const detail = parseDetailHtml(detailResponse.data)

      if (detail.imageUrl) {
        const herbDir = path.join(herbsUploadDir, h.id.toString())
        if (!fs.existsSync(herbDir)) fs.mkdirSync(herbDir, { recursive: true })

        const ext = path.extname(detail.imageUrl.split('?')[0]) || '.jpg'
        const fileName = `${h.name.replace(/[、，,\s]/g, '_')}_hkbu${ext}`
        const savePath = path.join(herbDir, fileName)

        const ok = await downloadImage(detail.imageUrl, savePath)
        if (ok) {
          const imgUrlDb = `/uploads/herbs/${h.id}/${fileName}`
          await connection.query(`
            INSERT INTO herb_images (herb_id, image_url, is_cover, sort_order, created_at)
            VALUES (?, ?, 1, 1, NOW())
          `, [h.id, imgUrlDb])
          totalImg++
          console.log(`[下载] ${h.name} - ${fileName}`)
        } else {
          console.log(`[下载失败] ${h.name}`)
        }
      } else {
        console.log(`[无图片] ${h.name}`)
      }
    } catch (e) {
      console.log(`[爬取失败] ${h.name} - ${e.message}`)
    }

    await new Promise(r => setTimeout(r, 200))
  }

  console.log('\n========================================')
  console.log(`HKBU 总记录: ${allHkbuHerbs.length} 条`)
  console.log(`数据库原有: ${existingRows.length} 条`)
  console.log(`新增药材: ${inserted} 条`)
  console.log(`新增图片: ${totalImg} 张`)
  console.log(`数据库现有: ${existingRows.length + inserted} 条`)
  console.log('========================================')

  await connection.end()
}

main().catch(console.error)
