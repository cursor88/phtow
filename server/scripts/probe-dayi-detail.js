const axios = require('axios')

const BASE_URL = 'https://www.dayi.org.cn'

async function getHerbDetail(cmedicalId) {
  try {
    const response = await axios.get(`${BASE_URL}/cmedical/${cmedicalId}.html`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': `${BASE_URL}/`
      },
      timeout: 15000
    })
    const html = response.data

    // 标题
    const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/)

    // 找主图
    const imgRegex = /<img[^>]+src="(https:\/\/image\.dayi\.org\.cn\/img\/[^"]+\.jpg\?x-oss-process=image\/resize,w_200)"/g
    const imgs = [...html.matchAll(imgRegex)].map(m => m[1].replace('w_200', 'w_800'))

    return {
      title: titleMatch ? titleMatch[1].trim() : null,
      images: imgs,
      success: true
    }
  } catch (e) {
    return { success: false, error: e.message }
  }
}

async function main() {
  // 测试一些已知ID
  const testIds = [
    1115491,  // 熟地黄
    1129180,  // 党参
    1156181,  // 石斛花
    305866,   // 枳实
    303695,   // 水晶兰
    1115418,  // 石菖蒲
    1155695,  // 紫河车
    1114442   // 茴香
  ]

  for (const id of testIds) {
    const result = await getHerbDetail(id)
    if (result.success) {
      console.log(`[${id}] ${result.title} - ${result.images[0] || '无图'}`)
    } else {
      console.log(`[${id}] 失败: ${result.error}`)
    }
    await new Promise(r => setTimeout(r, 500))
  }
}

main().catch(console.error)