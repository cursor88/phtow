const axios = require('axios')

const BASE_URL = 'https://sys01.lib.hkbu.edu.hk/cmed/mmid'

async function probeList() {
  const response = await axios.get(`${BASE_URL}/index.php`, {
    params: { sort: 'name_pinyin', page: 1 },
    headers: { 'User-Agent': 'Mozilla/5.0' }
  })
  const html = response.data

  console.log('=== 列表页分析 ===')

  // 找药材链接 - 更宽松
  const linkRegex = /href="detail\.php\?herb=([^"&]+)[^"]*"/gi
  const links = [...html.matchAll(linkRegex)]
  console.log(`药材详情链接数: ${links.length}`)

  const seen = new Set()
  links.forEach((m) => {
    const herb = decodeURIComponent(m[1])
    if (!seen.has(herb)) {
      seen.add(herb)
      if (seen.size <= 8) {
        console.log(`  herb=${herb}`)
      }
    }
  })
  console.log(`唯一药材数: ${seen.size}`)

  // 分页信息
  const pageRegex = /page=(\d+)/g
  const pages = [...html.matchAll(pageRegex)].map(m => parseInt(m[1]))
  const maxPage = pages.length > 0 ? Math.max(...pages) : 1
  console.log(`最大页码: ${maxPage}`)

  // 药材名称+图片预览
  const itemRegex = /<div[^>]*class="[^"]*herb-item[^"]*"[\s\S]*?<\/div>/gi
  const items = [...html.matchAll(itemRegex)]
  console.log(`药材卡片数: ${items.length}`)
}

async function probeDetail(herbId) {
  const response = await axios.get(`${BASE_URL}/detail.php`, {
    params: { herb: herbId, lang: 'cht' },
    headers: { 'User-Agent': 'Mozilla/5.0' }
  })
  const html = response.data

  console.log(`\n=== 详情页分析 (${herbId}) ===`)

  // 药材名称
  const nameMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/i) ||
                    html.match(/<h2[^>]*>(.*?)<\/h2>/i)
  if (nameMatch) {
    console.log(`名称: ${nameMatch[1].replace(/<[^>]+>/g, '').trim().substring(0, 80)}`)
  }

  // 所有img标签
  const imgRegex = /<img[^>]+src="([^"]+)"[^>]*>/gi
  const images = [...html.matchAll(imgRegex)]
  console.log(`img标签数: ${images.length}`)

  images.forEach((m, i) => {
    const src = m[1]
    if (!src.includes('logo') && !src.includes('arr_')) {
      console.log(`  图片${i}: ${src}`)
    }
  })

  // 提取药材名称（中文名）
  const cnNameMatch = html.match(/>([^<]*人参[^<]*)</)
  if (cnNameMatch) {
    console.log(`中文名: ${cnNameMatch[1].trim()}`)
  }

  // 找图片链接中的大图
  const aImgRegex = /<a\s+href="([^"]+)"[^>]*>\s*<img[^>]+src="images\/small\/([^"]+)"/gi
  const aImgs = [...html.matchAll(aImgRegex)]
  console.log(`a>img链接数: ${aImgs.length}`)
  aImgs.forEach((m) => {
    console.log(`  小图: images/small/${m[2]} -> 链接: ${m[1]}`)
  })
}

async function main() {
  try {
    await probeList()
    await probeDetail('Ginseng+Radix+et+Rhizoma')
  } catch (e) {
    console.error(e.message)
  }
}

main()