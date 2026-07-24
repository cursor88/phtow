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
    return new Promise((resolve) => {
      const timer = setTimeout(() => { writer.destroy(); resolve(false) }, 30000)
      writer.on('finish', () => { clearTimeout(timer); resolve(true) })
      writer.on('error', () => { clearTimeout(timer); resolve(false) })
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

  console.log('===== 浙江省中药博物馆 - 图片补充爬取 =====\n')

  // 找出图片不足2张的药材
  const [herbs] = await connection.query(`
    SELECT h.id, h.name, COUNT(img.id) AS img_count
    FROM herbs h
    LEFT JOIN herb_images img ON img.herb_id = h.id
    WHERE h.name NOT LIKE '%自定义%'
    GROUP BY h.id, h.name
    HAVING img_count < 2
    ORDER BY img_count, h.id
  `)

  console.log(`[待补图] ${herbs.length} 味药材`)

  let success = 0
  let failed = 0
  let totalImg = 0

  for (let i = 0; i < herbs.length; i++) {
    const herb = herbs[i]
    const herbName = herb.name
    const herbId = herb.id

    process.stdout.write(`[${i + 1}/${herbs.length}] ${herbName} ... `)

    const results = await searchMedicine(herbName)
    if (results.length === 0) {
      console.log('无搜索结果')
      failed++
      continue
    }

    // 优先匹配"药材"标准的精确名称
    const mainResult = results.find(r => r.medicineName === herbName && r.standard === '药材') ||
                       results.find(r => r.medicineName === herbName) ||
                       results[0]
    const speciesInfoId = mainResult.medicineSpeciesInfoId

    const detailData = await getMedicineDetail(speciesInfoId)
    if (!detailData.imageMap) {
      console.log('无图片数据')
      failed++
      continue
    }

    const imageUrls = extractImageUrls(detailData)
    if (imageUrls.length === 0) {
      console.log('无图片')
      failed++
      continue
    }

    // 创建目录
    const herbDir = path.join(herbsUploadDir, herbId.toString())
    if (!fs.existsSync(herbDir)) fs.mkdirSync(herbDir, { recursive: true })

    // 计算需要补几张
    const needCount = 2 - herb.img_count
    let imageCount = 0

    for (let j = 0; j < imageUrls.length && imageCount < needCount; j++) {
      const imageUrl = imageUrls[j]
      const ext = path.extname(imageUrl.split('?')[0]) || '.jpg'
      const fileName = `${herbName}_zjbbg${imageCount + 1}${ext}`
      const savePath = path.join(herbDir, fileName)

      const ok = await downloadImage(imageUrl, savePath)
      if (ok) {
        const imgUrlDb = `/uploads/herbs/${herbId}/${fileName}`
        // 已有图片时不设为封面
        const isCover = (herb.img_count === 0 && imageCount === 0) ? 1 : 0
        await connection.query(`
          INSERT INTO herb_images (herb_id, image_url, is_cover, sort_order, created_at)
          VALUES (?, ?, ?, ?, NOW())
        `, [herbId, imgUrlDb, isCover, herb.img_count + imageCount + 1])
        imageCount++
        totalImg++
      }
      await new Promise(r => setTimeout(r, 200))
    }

    if (imageCount > 0) {
      success++
      console.log(`成功 ${imageCount} 张`)
    } else {
      console.log('下载失败')
      failed++
    }
  }

  console.log(`\n========================================`)
  console.log(`完成统计:`)
  console.log(`  成功补图: ${success} 味`)
  console.log(`  失败/无图: ${failed} 味`)
  console.log(`  总计下载: ${totalImg} 张`)
  console.log('========================================')

  await connection.end()
}

main().catch(console.error)
