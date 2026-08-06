require('dotenv').config({ path: __dirname + '/../.env' })
const mysql = require('mysql2/promise')
const axios = require('axios')
const fs = require('fs')
const path = require('path')

const BASE_URL = 'https://sys01.lib.hkbu.edu.hk/cmed/mmid'
const herbsUploadDir = path.join(__dirname, '../data/assets/herbs')

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

    if (name && pid) {
      herbs.push({ name, pid })
    }
  }
  return herbs
}

function parseDetailHtml(html) {
  const result = { imageUrl: null, name: '' }
  const titleMatch = html.match(/<h1[^>]*>([\u4e00-\u9fa5]+)</)
  if (titleMatch) result.name = titleMatch[1].trim()

  const imgMatch = html.match(/<img[^>]+src="(images\/[A-Z0-9]+\.jpg)"/)
  if (imgMatch) result.imageUrl = `${BASE_URL}/${imgMatch[1]}`
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
      const timer = setTimeout(() => { writer.destroy(); resolve(false) }, 30000)
      writer.on('finish', () => { clearTimeout(timer); resolve(true) })
      writer.on('error', () => { clearTimeout(timer); resolve(false) })
    })
  } catch (e) { return false }
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

  // 找出新增但无图片的药材
  const [rows] = await connection.query(`
    SELECT h.id, h.name FROM herbs h
    LEFT JOIN herb_images img ON img.herb_id = h.id
    WHERE h.id > 372 AND img.id IS NULL
    ORDER BY h.id
  `)

  console.log(`[重试] ${rows.length} 味药材缺少图片`)
  if (rows.length === 0) {
    await connection.end()
    return
  }

  // 第一步：重新爬取 HKBU 全部 420 条列表，建立 name->pid 映射
  console.log('\n===== 第一步：爬取 HKBU 全部列表获取 PID =====')
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
  console.log(`[HKBU] 共收集 ${allHkbuHerbs.length} 条药材`)

  // 建立 name->pid 映射（支持多名称匹配）
  const nameToPid = new Map()
  for (const h of allHkbuHerbs) {
    nameToPid.set(h.name, h.pid)
  }

  // 第二步：用 PID 直接下载图片
  console.log('\n===== 第二步：用 PID 下载详情页图片 =====')
  let success = 0
  for (const herb of rows) {
    const pid = nameToPid.get(herb.name)
    if (!pid) {
      // 尝试模糊匹配：查找包含该名称的HKBU药材
      let fuzzyPid = null
      for (const [hName, hPid] of nameToPid) {
        if (hName.includes(herb.name) || herb.name.includes(hName)) {
          fuzzyPid = hPid
          console.log(`[模糊匹配] ${herb.name} -> ${hName} (PID=${hPid})`)
          break
        }
      }
      if (!fuzzyPid) {
        console.log(`[无记录] ${herb.name}`)
        continue
      }
    }

    const finalPid = pid || fuzzyPid

    try {
      const detailResponse = await axios.get(
        `${BASE_URL}/detail.php?lang=chs&pid=${finalPid}`,
        { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 15000 }
      )
      const detail = parseDetailHtml(detailResponse.data)

      if (detail.imageUrl) {
        const herbDir = path.join(herbsUploadDir, herb.id.toString())
        if (!fs.existsSync(herbDir)) fs.mkdirSync(herbDir, { recursive: true })

        const fileName = `${herb.name.replace(/[、，,\s]/g, '_')}_hkbu.jpg`
        const savePath = path.join(herbDir, fileName)

        const ok = await downloadImage(detail.imageUrl, savePath)
        if (ok) {
          const imgUrlDb = `/static/herbs/${herb.id}/${fileName}`
          await connection.query(`
            INSERT INTO herb_images (herb_id, image_url, is_cover, sort_order, created_at)
            VALUES (?, ?, 1, 1, NOW())
          `, [herb.id, imgUrlDb])
          success++
          console.log(`[成功] ${herb.name}`)
        } else {
          console.log(`[下载失败] ${herb.name}`)
        }
      } else {
        console.log(`[无图片] ${herb.name}`)
      }
    } catch (e) {
      console.log(`[失败] ${herb.name} - ${e.message}`)
    }
    await new Promise(r => setTimeout(r, 500))
  }

  console.log(`\n[重试完成] 成功 ${success}/${rows.length}`)
  await connection.end()
}

main().catch(console.error)
