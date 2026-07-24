const axios = require('axios')

const BASE_URL = 'https://www.dayi.org.cn'

// 从搜索结果中找"中药材"分类的URL
async function searchHerb(keyword, maxPages = 5) {
  const results = []
  for (let page = 1; page <= maxPages; page++) {
    try {
      const response = await axios.get(`${BASE_URL}/search`, {
        params: { keyword, page },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'zh-CN,zh;q=0.9',
          'Referer': `${BASE_URL}/`
        },
        timeout: 15000
      })
      const html = response.data

      // 找 cmedical 链接 + 后面有"中药材"标签
      // 模式: <a href="/cmedical/xxx.html">keyword</a> ... 中药材
      const cmedicalRegex = /<a[^>]+href="(\/cmedical\/\d+\.html)"[^>]*>([^<]+)<\/a>[\s\S]{0,200}?中药材/g
      const matches = [...html.matchAll(cmedicalRegex)]

      if (matches.length === 0) {
        // 尝试更宽松的匹配
        const looseRegex = /href="(\/cmedical\/\d+\.html)"[^>]*>([^<]+)</g
        const looseMatches = [...html.matchAll(looseRegex)]
        looseMatches.forEach(m => {
          const name = m[2].trim()
          // 检查后面200字符内是否有"中药材"
          const idx = html.indexOf(m[0])
          const context = html.substring(idx, idx + 500)
          if (context.includes('中药材') && name.includes(keyword.substring(0, 2))) {
            results.push({ url: m[1], name })
          }
        })
      } else {
        matches.forEach(m => {
          results.push({ url: m[1], name: m[2].trim() })
        })
      }

      if (matches.length === 0) break
      await new Promise(r => setTimeout(r, 800))
    } catch (e) {
      console.error(`搜索失败 p=${page}:`, e.message)
      break
    }
  }
  return results
}

async function getHerbDetail(cmedicalUrl) {
  try {
    const response = await axios.get(`${BASE_URL}${cmedicalUrl}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': `${BASE_URL}/`
      },
      timeout: 15000
    })
    const html = response.data

    // 找主图
    const imgRegex = /<img[^>]+src="(https:\/\/image\.dayi\.org\.cn\/img\/[^"]+\.jpg\?x-oss-process=image\/resize,w_200)"/g
    const imgs = [...html.matchAll(imgRegex)].map(m => m[1].replace('w_200', 'w_800'))

    // 提取字段
    const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
    const latinMatch = text.match(/拉[丁\s]名?\s*[称]*[：:]\s*([A-Z][a-z]+\s+[a-z]+(?:\s+[A-Z][a-z]+)?)/)
    const familyMatch = text.match(/科\s*[：:]\s*([^\s]+科)/)
    const genusMatch = text.match(/属\s*[：:]\s*([^\s]+属)/)
    const natureMatch = text.match(/性[味归经\s]*[：:]\s*([^，。]+)/)

    return {
      images: imgs,
      latin: latinMatch ? latinMatch[1] : null,
      family: familyMatch ? familyMatch[1] : null,
      genus: genusMatch ? genusMatch[1] : null
    }
  } catch (e) {
    console.error(`详情失败 ${cmedicalUrl}:`, e.message)
    return null
  }
}

async function main() {
  for (const kw of ['熟地黄', '桂圆', '炮姜']) {
    console.log(`\n========== 搜索: ${kw} ==========`)
    const results = await searchHerb(kw, 2)
    console.log(`找到 ${results.length} 个结果`)
    results.slice(0, 5).forEach(r => {
      console.log(`  ${r.name} -> ${r.url}`)
    })

    if (results.length > 0) {
      const detail = await getHerbDetail(results[0].url)
      if (detail) {
        console.log(`  拉丁名: ${detail.latin || 'N/A'}`)
        console.log(`  科: ${detail.family || 'N/A'}`)
        console.log(`  属: ${detail.genus || 'N/A'}`)
        console.log(`  主图: ${detail.images[0] || '无'}`)
      }
    }
    await new Promise(r => setTimeout(r, 1500))
  }
}

main().catch(console.error)