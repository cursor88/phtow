require('dotenv').config({ path: __dirname + '/../.env' })
const mysql = require('mysql2/promise')
const axios = require('axios')
const fs = require('fs')
const path = require('path')

const BASE_URL = 'https://zjzybbg.zjyj.org.cn/bbg'
const herbsUploadDir = path.join(__dirname, '../uploads/herbs')

async function searchMedicine(keyword) {
  try {
    const response = await axios.get(`${BASE_URL}/search/search`, {
      params: { type: 1, context: keyword, pageNo: 1, pageSize: 10 },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    return response.data.result?.records || []
  } catch (error) {
    console.error(`[搜索失败] ${keyword}`, error.message)
    return []
  }
}

async function getMedicineDetail(speciesInfoId) {
  try {
    const response = await axios.get(`${BASE_URL}/medicine/display/detail`, {
      params: { speciesInfoId },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    return response.data.result || {}
  } catch (error) {
    console.error(`[获取详情失败] ID: ${speciesInfoId}`, error.message)
    return {}
  }
}

function extractImageUrls(detailData) {
  const urls = []
  const imageMap = detailData.imageMap || {}
  
  for (const key of Object.keys(imageMap)) {
    const imgList = imageMap[key]
    if (Array.isArray(imgList) && imgList.length > 0) {
      const imgPath = imgList[0]
      if (imgPath) {
        let url = imgPath
        if (!url.startsWith('http')) {
          url = BASE_URL + url.replace('/picture/', '/profile/picture/')
        }
        urls.push(url)
      }
    }
  }
  
  return [...new Set(urls)]
}

function parseContent(content) {
  const result = {}
  
  if (!content) return result
  
  const match = content.match(/本品为([^。]+)的干燥([^。]+)。/)
  if (match) {
    const familyMatch = match[1].match(/([^科]+)科植物([^。]+)/)
    if (familyMatch) {
      result.family = familyMatch[1].trim() + '科'
      const latinMatch = match[1].match(/([A-Z][a-z]+\s+[a-z]+[\s\w.]+\.)/)
      if (latinMatch) {
        result.scientific_name = latinMatch[1].trim()
      }
    }
    result.medicinal_parts = match[2].trim()
  }
  
  const xingzhuangMatch = content.match(/【性状】([^【]+)/)
  if (xingzhuangMatch) {
    const text = xingzhuangMatch[1].replace(/<[^>]*>/g, '').replace(/&nbsp;/g, '').trim()
    if (text) {
      result.characterDescribe = text.substring(0, 500)
    }
  }
  
  return result
}

async function downloadImage(url, savePath) {
  try {
    const response = await axios.get(url, {
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://zjzybbg.zjyj.org.cn/bbg-web/'
      },
      timeout: 30000
    })
    
    const writer = fs.createWriteStream(savePath)
    response.data.pipe(writer)
    
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        writer.destroy()
        console.error(`[下载失败] ${url} Download timeout`)
        resolve(false)
      }, 30000)
      
      writer.on('finish', () => {
        clearTimeout(timeout)
        resolve(true)
      })
      writer.on('error', (err) => {
        clearTimeout(timeout)
        console.error(`[下载失败] ${url}`, err.message)
        resolve(false)
      })
    })
  } catch (error) {
    console.error(`[下载失败] ${url}`, error.message)
    return false
  }
}

function getImageType(medicinalParts) {
  if (!medicinalParts) return 'plant'
  
  const parts = medicinalParts.toLowerCase()
  if (parts.includes('根') || parts.includes('根茎')) return 'root'
  if (parts.includes('叶')) return 'leaf'
  if (parts.includes('花')) return 'flower'
  if (parts.includes('果实') || parts.includes('果')) return 'fruit'
  if (parts.includes('种子') || parts.includes('籽')) return 'seed'
  if (parts.includes('茎')) return 'stem'
  if (parts.includes('皮')) return 'peel'
  if (parts.includes('全草')) return 'plant'
  if (parts.includes('动物') || parts.includes('虫')) return 'animal'
  if (parts.includes('矿物')) return 'mineral'
  if (parts.includes('贝壳')) return 'shell'
  if (parts.includes('菌') || parts.includes('苓')) return 'fungus'
  
  return 'plant'
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

  try {
    console.log('[MySQL] 连接成功')

    const [herbs] = await connection.query(
      'SELECT h.id, h.name FROM herbs h LEFT JOIN herb_images hi ON h.id = hi.herb_id WHERE hi.id IS NULL ORDER BY h.id'
    )
    console.log(`[查询] 缺少图片的药材数: ${herbs.length}`)

    let totalDownloaded = 0
    let totalUpdated = 0

    for (const herb of herbs) {
      const herbName = herb.name.trim()
      const localHerbId = herb.id
      
      if (!herbName || herbName === '自定义药材') {
        continue
      }

      const herbDir = path.join(herbsUploadDir, localHerbId.toString())
      
      if (!fs.existsSync(herbDir)) {
        fs.mkdirSync(herbDir, { recursive: true })
      }

      const existingFiles = fs.readdirSync(herbDir).filter(f => 
        f.match(/\.(jpg|jpeg|png)$/i)
      )
      
      if (existingFiles.length >= 2) {
        console.log(`[跳过] ${herbName} - 已有 ${existingFiles.length} 张图片`)
        continue
      }

      console.log(`\n[搜索] ${herbName}`)
      
      const results = await searchMedicine(herbName)
      if (results.length === 0) {
        console.log(`[无结果] ${herbName}`)
        continue
      }

      const mainResult = results.find(r => r.medicineName === herbName && r.standard === '药材') || 
                         results.find(r => r.medicineName === herbName) || 
                         results[0]
      const speciesInfoId = mainResult.medicineSpeciesInfoId

      console.log(`[获取详情] ${herbName} (ID: ${speciesInfoId})`)
      
      const detailData = await getMedicineDetail(speciesInfoId)
      
      let updated = false
      if (detailData.content) {
        const parsed = parseContent(detailData.content)
        if (parsed.family || parsed.scientific_name || parsed.medicinal_parts) {
          await connection.query(
            'UPDATE herbs SET scientific_name = COALESCE(?, scientific_name), family = COALESCE(?, family), medicinal_parts = COALESCE(?, medicinal_parts), image_type = COALESCE(?, image_type) WHERE id = ?',
            [parsed.scientific_name, parsed.family, parsed.medicinal_parts, getImageType(parsed.medicinal_parts), localHerbId]
          )
          updated = true
          totalUpdated++
          console.log(`[更新字段] 科属: ${parsed.family}, 拉丁名: ${parsed.scientific_name}, 药用部位: ${parsed.medicinal_parts}`)
        }
      }

      if (!detailData.imageMap) {
        console.log(`[无图片] ${herbName}${updated ? ' (但已更新字段)' : ''}`)
        await new Promise(resolve => setTimeout(resolve, 300))
        continue
      }

      const imageUrls = extractImageUrls(detailData)
      if (imageUrls.length === 0) {
        console.log(`[无图片] ${herbName}${updated ? ' (但已更新字段)' : ''}`)
        await new Promise(resolve => setTimeout(resolve, 300))
        continue
      }

      console.log(`[发现图片] ${herbName} - ${imageUrls.length} 张`)

      let imageCount = 0
      for (let i = 0; i < imageUrls.length && imageCount < 2; i++) {
        const imageUrl = imageUrls[i]
        
        const ext = path.extname(imageUrl) || '.jpg'
        const fileName = `${herbName}_${imageCount + 1}${ext}`
        const savePath = path.join(herbDir, fileName)

        console.log(`[下载] ${imageUrl} -> ${fileName}`)
        
        const success = await downloadImage(imageUrl, savePath)
        if (success !== false) {
          imageCount++
          totalDownloaded++

          const imageUrlDb = `/uploads/herbs/${localHerbId}/${fileName}`
          const isCover = (imageCount === 1) ? 1 : 0

          await connection.query(`
            INSERT INTO herb_images (herb_id, image_url, is_cover, sort_order, created_at)
            VALUES (?, ?, ?, ?, NOW())
          `, [localHerbId, imageUrlDb, isCover, imageCount])

          console.log(`[成功] ${herbName} - ${fileName}`)
        }

        await new Promise(resolve => setTimeout(resolve, 500))
      }

      await new Promise(resolve => setTimeout(resolve, 500))
    }

    console.log('\n========================================')
    console.log(`爬取完成！`)
    console.log(`  成功下载图片: ${totalDownloaded} 张`)
    console.log(`  更新药材字段: ${totalUpdated} 条`)
    console.log(`  缺少图片的药材: ${herbs.length} 味`)
    console.log('========================================')

  } catch (error) {
    console.error('[错误]', error.message)
    throw error
  } finally {
    await connection.end()
  }
}

main().catch(console.error)