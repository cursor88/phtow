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
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        writer.destroy()
        reject(new Error('Download timeout'))
      }, 30000)
      
      writer.on('finish', () => {
        clearTimeout(timeout)
        resolve()
      })
      writer.on('error', (err) => {
        clearTimeout(timeout)
        reject(err)
      })
    })
  } catch (error) {
    console.error(`[下载失败] ${url}`, error.message)
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

  try {
    console.log('[MySQL] 连接成功')

    const [herbs] = await connection.query('SELECT id, name FROM herbs ORDER BY id')
    console.log(`[查询] 本地数据库共 ${herbs.length} 味药材`)

    let totalDownloaded = 0

    for (const herb of herbs) {
      const herbName = herb.name.trim()
      const localHerbId = herb.id
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
      if (!detailData.imageMap) {
        console.log(`[无图片] ${herbName}`)
        continue
      }

      const imageUrls = extractImageUrls(detailData)
      if (imageUrls.length === 0) {
        console.log(`[无图片] ${herbName}`)
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
        if (success) {
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

      if (imageCount > 0) {
        await connection.query(
          'DELETE FROM herb_images WHERE herb_id = ? AND image_url LIKE ?',
          [localHerbId, '%.svg']
        )
      }
    }

    console.log('\n========================================')
    console.log(`爬取完成！`)
    console.log(`  成功下载: ${totalDownloaded} 张`)
    console.log(`  本地药材: ${herbs.length} 味`)
    console.log('========================================')

  } catch (error) {
    console.error('[错误]', error.message)
    throw error
  } finally {
    await connection.end()
  }
}

main().catch(console.error)