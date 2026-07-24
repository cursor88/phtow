const axios = require('axios')

const BASE_URL = 'https://www.dayi.org.cn'

async function searchHerb(keyword, page = 1) {
  const response = await axios.get(`${BASE_URL}/search/${page}`, {
    params: { keyword },
    headers: { 'User-Agent': 'Mozilla/5.0' }
  })
  const html = response.data

  // 找中药材类型
  const results = []
  // 匹配 <a href="/cmedical/xxx.html"> keyword </a> - 中药材
  const cmedicalRegex = /<a[^>]+href="(\/cmedical\/\d+\.html)"[^>]*>([^<]+)<\/a>\s*-\s*中药材/g
  const matches = [...html.matchAll(cmedicalRegex)]

  matches.forEach(m => {
    results.push({
      url: m[1],
      name: m[2].trim()
    })
  })

  return results
}

async function getHerbImage(cmedicalUrl) {
  const response = await axios.get(`${BASE_URL}${cmedicalUrl}`, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  })
  const html = response.data

  // 找image.dayi.org.cn域名下的jpg图片
  const imgRegex = /<img[^>]+src="(https:\/\/image\.dayi\.org\.cn\/img\/[^"]+\.jpg\?x-oss-process=image\/resize,w_\d+)"/g
  const matches = [...html.matchAll(imgRegex)]

  return matches.map(m => m[1])
}

async function getHerbImageFullUrl(cmedicalUrl) {
  const response = await axios.get(`${BASE_URL}${cmedicalUrl}`, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  })
  const html = response.data

  // 移除w_200参数获取大图
  const imgRegex = /<img[^>]+src="(https:\/\/image\.dayi\.org\.cn\/img\/[^"]+\.jpg\?x-oss-process=image\/resize,w_200)"/g
  const matches = [...html.matchAll(imgRegex)]

  return matches.map(m => {
    // 将w_200改为w_800以获得更高分辨率
    return m[1].replace('w_200', 'w_800')
  })
}

async function main() {
  // 测试搜索
  for (const kw of ['熟地黄', '生地黄', '桂圆', '藿香', '炮姜', '木通']) {
    const results = await searchHerb(kw, 1)
    console.log(`\n[${kw}] 找到 ${results.length} 个中药材`)

    if (results.length > 0) {
      results.slice(0, 3).forEach(r => {
        console.log(`  ${r.name} -> ${r.url}`)
      })

      // 测试第一个的图片
      const imgs = await getHerbImageFullUrl(results[0].url)
      console.log(`  主图: ${imgs[0] || '无'}`)
    }

    await new Promise(r => setTimeout(r, 1000))
  }
}

main().catch(console.error)