require('dotenv').config({ path: __dirname + '/../.env' })
const mysql = require('mysql2/promise')
const axios = require('axios')
const fs = require('fs')
const path = require('path')
const { missing } = require('./probe-dayi-dry')

const BASE_URL = 'https://www.dayi.org.cn'
const herbsUploadDir = path.join(__dirname, '../data/assets/herbs')

function stripHtml(s) {
  if (!s) return ''
  return s.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim()
}

function safeParseJSON(s) {
  if (!s) return null
  try { return JSON.parse(s) } catch { return null }
}

// 从详情页解析数据：图片、字段
function parseDetailHtml(html) {
  const result = {
    title: null,
    images: [],
    fields: {}
  }

  // 标题
  const titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/)
  if (titleMatch) result.title = stripHtml(titleMatch[1])

  // 提取药材图片（支持多个域名）
  const imgRegex = /<img[^>]+src="(https?:\/\/(?:image\.dayi\.org\.cn\/img\/[^"]+|aka\.doubaocdn\.com\/s\/[^"]+))/g
  const imgs = [...html.matchAll(imgRegex)].map(m => m[1].replace(/\?x-oss-process=.*$/, ''))
  result.images = [...new Set(imgs)]

  // 解析 __NUXT__ 嵌入数据
  // 数据在 window.__NUXT__=(function(args){...l.latinName="...";...}(...))</script> 中
  const nuxtStart = html.indexOf('window.__NUXT__=')
  if (nuxtStart >= 0) {
    const nuxtEnd = html.indexOf(';</script>', nuxtStart)
    const scriptContent = html.substring(nuxtStart, nuxtEnd)

    const extract = (key) => {
      const m = scriptContent.match(new RegExp(`\\b${key}="([^"]*)"`))
      return m ? m[1] : null
    }

    // 字段映射
    const f = result.fields
    const latinName = extract('latinName')
    if (latinName) f.scientific_name = latinName

    const alisaName = extract('alisaName')
    if (alisaName) f.alias = alisaName

    const drugSite = extract('drugSite')
    if (drugSite) f.medicinal_parts = stripHtml(drugSite)

    const remark = extract('remark')
    if (remark) f.taste_meridian = remark

    // medicinalSlicesImg 字段是 JSON 字符串 [{img: 'https://...'}]
    const slicesMatch = scriptContent.match(/\bmedicinalSlicesImg="(\[.*?\])"/)
    if (slicesMatch) {
      const arr = safeParseJSON(slicesMatch[1].replace(/\\u002F/g, '/').replace(/\\"/g, '"'))
      if (Array.isArray(arr)) {
        for (const item of arr) {
          if (item.img && !result.images.includes(item.img)) {
            result.images.push(item.img)
          }
        }
      }
    }

    // 植物学信息：科、属
    const plantGenusMatch = scriptContent.match(/\bplantGenus="([^"]*)"/)
    if (plantGenusMatch) {
      const text = stripHtml(plantGenusMatch[1]).replace(/\\u003E/g, '>').replace(/\\u003C/g, '<')
      // 提取 "唇形科藿香属植物"
      const keMatch = text.match(/([\u4e00-\u9fa5]+科)/)
      if (keMatch) f.family = keMatch[1]
    }
  }

  return result
}

async function fetchDetail(cmedicalId) {
  try {
    const response = await axios.get(`${BASE_URL}/cmedical/${cmedicalId}.html`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': `${BASE_URL}/`
      },
      timeout: 15000
    })
    return { ...parseDetailHtml(response.data), success: true }
  } catch (e) {
    return { success: false, error: e.message }
  }
}

async function downloadImage(url, savePath) {
  try {
    const response = await axios.get(url, {
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': `${BASE_URL}/`
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

function getImageType(parts) {
  if (!parts) return null
  const p = parts.toLowerCase()
  if (p.includes('根茎') || p.includes('根')) return 'root'
  if (p.includes('叶')) return 'leaf'
  if (p.includes('花')) return 'flower'
  if (p.includes('果实') || p.includes('果')) return 'fruit'
  if (p.includes('种子') || p.includes('籽')) return 'seed'
  if (p.includes('茎') || p.includes('藤')) return 'stem'
  if (p.includes('皮')) return 'peel'
  if (p.includes('全草')) return 'plant'
  if (p.includes('树脂') || p.includes('分泌物') || p.includes('结晶') || p.includes('合成')) return 'mineral'
  if (p.includes('动物') || p.includes('虫') || p.includes('贝') || p.includes('骨') || p.includes('壳') || p.includes('内壳')) return 'animal'
  return 'plant'
}

async function main() {
  const onlyWithId = process.argv.includes('--only-with-id')
  const targets = onlyWithId ? missing.filter(m => m.dayiId) : missing

  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT) || 3306,
    database: process.env.MYSQL_DATABASE || 'caomuyoufang',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    charset: 'utf8mb4'
  })

  try {
    console.log(`[MySQL] 连接成功`)
    console.log(`[目标] 共 ${targets.length} 味药材`)

    let totalImg = 0
    let totalField = 0
    let successCount = 0
    let skipCount = 0

    for (const m of targets) {
      if (!m.dayiId) {
        console.log(`[跳过] ${m.name} (${m.dayiName}) - 无 dayiId`)
        skipCount++
        await new Promise(r => setTimeout(r, 100))
        continue
      }

      const detail = await fetchDetail(m.dayiId)
      if (!detail.success) {
        console.log(`[失败] ${m.name} - ${detail.error}`)
        await new Promise(r => setTimeout(r, 200))
        continue
      }

      console.log(`\n[详情] ${m.name} (ID=${m.dayiId}) - 标题: ${detail.title || 'N/A'}`)
      console.log(`       图片: ${detail.images.length} 张`)
      if (detail.fields.scientific_name) console.log(`       拉丁名: ${detail.fields.scientific_name}`)
      if (detail.fields.family) console.log(`       科: ${detail.fields.family}`)
      if (detail.fields.medicinal_parts) console.log(`       药用部位: ${detail.fields.medicinal_parts}`)
      if (detail.fields.taste_meridian) console.log(`       性味: ${detail.fields.taste_meridian.substring(0, 50)}`)
      if (detail.fields.alias) console.log(`       别名: ${detail.fields.alias.substring(0, 50)}`)

      // 更新字段
      const f = detail.fields
      if (f.scientific_name || f.family || f.medicinal_parts || f.alias) {
        const params = {
          scientific_name: f.scientific_name || null,
          family: f.family || null,
          medicinal_parts: f.medicinal_parts || null,
          alias: f.alias || null,
          image_type: f.medicinal_parts ? getImageType(f.medicinal_parts) : null
        }
        const sets = Object.keys(params).filter(k => params[k])
          .map(k => `${k} = COALESCE(?, ${k})`).join(', ')
        const vals = Object.keys(params).filter(k => params[k]).map(k => params[k])
        if (sets) {
          await connection.query(
            `UPDATE herbs SET ${sets} WHERE id = ?`,
            [...vals, m.id]
          )
          totalField++
          console.log(`       [更新字段] ${Object.keys(params).filter(k => params[k]).join(', ')}`)
        }
      }

      // 下载图片
      if (detail.images.length === 0) {
        console.log(`       [无图片] ${m.name}`)
        await new Promise(r => setTimeout(r, 200))
        continue
      }

      const herbDir = path.join(herbsUploadDir, m.id.toString())
      if (!fs.existsSync(herbDir)) {
        fs.mkdirSync(herbDir, { recursive: true })
      }

      // 先查询已有图片，避免重复下载
      const [existing] = await connection.query(
        'SELECT image_url FROM herb_images WHERE herb_id = ?', [m.id]
      )
      const existingFiles = new Set(existing.map(r => path.basename(r.image_url)))

      let imgCount = 0
      for (let i = 0; i < detail.images.length && imgCount < 3; i++) {
        const imgUrl = detail.images[i]
        const ext = path.extname(imgUrl.split('?')[0]) || '.jpg'
        const fileName = `${m.name.replace(/[、，,\s]/g, '_')}_dayi${imgCount + 1}${ext}`
        const savePath = path.join(herbDir, fileName)

        // 跳过已存在
        if (existingFiles.has(fileName) && fs.existsSync(savePath) && fs.statSync(savePath).size > 1000) {
          console.log(`       [已存在] ${fileName}`)
          imgCount++
          continue
        }

        const ok = await downloadImage(imgUrl, savePath)
        if (ok) {
          imgCount++
          totalImg++
          const imgUrlDb = `/static/herbs/${m.id}/${fileName}`
          const isCover = (imgCount === 1) ? 1 : 0
          await connection.query(`
            INSERT INTO herb_images (herb_id, image_url, is_cover, sort_order, created_at)
            VALUES (?, ?, ?, ?, NOW())
          `, [m.id, imgUrlDb, isCover, imgCount])
          console.log(`       [下载] ${fileName}`)
        }
        await new Promise(r => setTimeout(r, 300))
      }

      successCount++
      await new Promise(r => setTimeout(r, 500))
    }

    console.log('\n========================================')
    console.log(`爬取完成！`)
    console.log(`  成功处理药材: ${successCount} 味`)
    console.log(`  跳过(无ID): ${skipCount} 味`)
    console.log(`  新增图片: ${totalImg} 张`)
    console.log(`  更新字段: ${totalField} 次`)
    console.log('========================================')

  } catch (e) {
    console.error('[错误]', e.message)
    throw e
  } finally {
    await connection.end()
  }
}

main().catch(console.error)
