const axios = require('axios')

const BASE_URL = 'https://m.dayi.org.cn'

async function searchHerb(keyword) {
  const response = await axios.get(`${BASE_URL}/search`, {
    params: { keyword },
    headers: { 'User-Agent': 'Mozilla/5.0' }
  })
  const html = response.data

  // 找中药材类型的结果
  const cmedicalRegex = /href="(\/cmedical\/\d+\.html)"[^>]*>([^<]*)/g
  const matches = [...html.matchAll(cmedicalRegex)]

  return matches.map(m => ({
    url: m[1],
    text: m[2].trim()
  }))
}

async function probeDetail(url) {
  const response = await axios.get(`${BASE_URL}${url}`, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  })
  const html = response.data

  // 主图（药材图）
  const imgRegex = /<img[^>]+src="(https:\/\/image\.dayi\.org\.cn\/img\/[^"]+\.jpg)"/g
  const imgs = [...html.matchAll(imgRegex)]

  return imgs.map(m => m[1])
}

async function main() {
  // 测试搜索
  for (const keyword of ['熟地黄', '生地黄', '桂圆', '藿香']) {
    const results = await searchHerb(keyword)
    console.log(`\n[搜索 ${keyword}] 找到 ${results.length} 个 cmedical 链接`)
    results.slice(0, 3).forEach(r => {
      console.log(`  ${r.text} -> ${r.url}`)
    })

    // 测第一个结果的图片
    if (results.length > 0) {
      const imgs = await probeDetail(results[0].url)
      console.log(`  主图数: ${imgs.length}`)
      imgs.forEach(img => console.log(`    ${img}`))
    }
  }
}

main().catch(console.error)