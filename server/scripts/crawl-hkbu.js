require('dotenv').config({ path: __dirname + '/../.env' })
const mysql = require('mysql2/promise')
const axios = require('axios')
const fs = require('fs')
const path = require('path')

const BASE_URL = 'https://sys01.lib.hkbu.edu.hk/cmed/mmid'
const herbsUploadDir = path.join(__dirname, '../data/assets/herbs')

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

    const imgCell = cells[9]
    const imgMatch = imgCell.match(/src="([^"]+)"/)
    const thumbUrl = imgMatch ? imgMatch[1] : ''

    if (name && pid) {
      herbs.push({ name, pid, latinName, thumbUrl })
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

  // 详情页的药材大图是相对路径 images/{pid}.jpg
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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
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
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT) || 3306,
    database: process.env.MYSQL_DATABASE || 'caomuyoufang',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    charset: 'utf8mb4'
  })

  console.log('[MySQL] 连接成功')

  const [herbRows] = await connection.query('SELECT id, name, alias FROM herbs')
  const herbMap = new Map()
  for (const h of herbRows) {
    herbMap.set(h.name, h)
    if (h.alias) {
      const aliases = h.alias.split(/[,，、]/).map(a => a.trim()).filter(a => a)
      for (const a of aliases) {
        if (!herbMap.has(a)) herbMap.set(a, h)
      }
    }
  }
  console.log(`[数据库] 共 ${herbMap.size} 个药材名称/别名索引`)

  const totalPages = 105
  let totalImg = 0
  let totalField = 0
  let totalMatch = 0
  let visitedPids = new Set()

  for (let page = 1; page <= totalPages; page++) {
    console.log(`\n[第 ${page}/${totalPages} 页] 正在爬取...`)

    try {
      const listResponse = await axios.get(`${BASE_URL}/index.php?lang=chs&page=${page}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 15000
      })

      const herbs = parseListPage(listResponse.data)
      if (herbs.length === 0) {
        console.log(`[第 ${page} 页] 无数据`)
        continue
      }

      for (const item of herbs) {
        if (visitedPids.has(item.pid)) {
          console.log(`[跳过] ${item.name} (${item.pid}) - 已访问`)
          continue
        }
        visitedPids.add(item.pid)

        const dbHerb = herbMap.get(item.name)
        if (!dbHerb) {
          console.log(`[无匹配] ${item.name} (${item.pid})`)
          await new Promise(r => setTimeout(r, 100))
          continue
        }

        console.log(`[匹配] ${item.name} -> 数据库ID=${dbHerb.id}`)

        const detailResponse = await axios.get(`${BASE_URL}/detail.php?lang=chs&pid=${item.pid}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          timeout: 15000
        })

        const detail = parseDetailHtml(detailResponse.data)

        if (detail.imageUrl) {
          const herbDir = path.join(herbsUploadDir, dbHerb.id.toString())
          if (!fs.existsSync(herbDir)) fs.mkdirSync(herbDir, { recursive: true })

          const [existing] = await connection.query(
            'SELECT image_url FROM herb_images WHERE herb_id = ?', [dbHerb.id]
          )
          const existingFiles = new Set(existing.map(r => path.basename(r.image_url)))

          const ext = path.extname(detail.imageUrl.split('?')[0]) || '.jpg'
          const fileName = `${item.name.replace(/[、，,\s]/g, '_')}_hkbu${ext}`

          if (!existingFiles.has(fileName) || !fs.existsSync(path.join(herbDir, fileName))) {
            const savePath = path.join(herbDir, fileName)
            const ok = await downloadImage(detail.imageUrl, savePath)
            if (ok) {
              const imgUrlDb = `/static/herbs/${dbHerb.id}/${fileName}`
              const [count] = await connection.query(
                'SELECT COUNT(*) as cnt FROM herb_images WHERE herb_id = ?', [dbHerb.id]
              )
              const isCover = (count[0].cnt === 0) ? 1 : 0
              await connection.query(`
                INSERT INTO herb_images (herb_id, image_url, is_cover, sort_order, created_at)
                VALUES (?, ?, ?, ?, NOW())
              `, [dbHerb.id, imgUrlDb, isCover, count[0].cnt + 1])
              totalImg++
              console.log(`       [下载] ${fileName}`)
            }
          } else {
            console.log(`       [已存在] ${fileName}`)
          }
        }

        if (detail.latinName || detail.efficacy) {
          const params = {
            scientific_name: detail.latinName || null,
            description: detail.efficacy || null
          }
          const sets = Object.keys(params).filter(k => params[k])
            .map(k => `${k} = COALESCE(?, ${k})`).join(', ')
          const vals = Object.keys(params).filter(k => params[k]).map(k => params[k])
          if (sets) {
            await connection.query(`UPDATE herbs SET ${sets} WHERE id = ?`, [...vals, dbHerb.id])
            totalField++
          }
        }

        totalMatch++
        await new Promise(r => setTimeout(r, 200))
      }

    } catch (e) {
      console.error(`[第 ${page} 页] 错误: ${e.message}`)
    }
  }

  console.log('\n========================================')
  console.log(`爬取完成！`)
  console.log(`  总记录: ${visitedPids.size} 条`)
  console.log(`  匹配药材: ${totalMatch} 味`)
  console.log(`  新增图片: ${totalImg} 张`)
  console.log(`  更新字段: ${totalField} 次`)
  console.log('========================================')

  await connection.end()
}

main().catch(console.error)