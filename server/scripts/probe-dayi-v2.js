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

    const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/)

    // 找主图（image.dayi.org.cn/img/...）
    const imgRegex = /<img[^>]+src="(https:\/\/image\.dayi\.org\.cn\/img\/[^"]+\.(?:jpg|png|jpeg))/g
    const imgs = [...html.matchAll(imgRegex)].map(m => {
      // 移除图片处理参数，获取原图
      return m[1].replace(/\?x-oss-process=.*$/, '')
    })

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
  const testIds = [1115491, 1129180, 1156181, 305866, 303695, 1115418, 1155695, 1114442]

  for (const id of testIds) {
    const result = await getHerbDetail(id)
    if (result.success) {
      console.log(`[${id}] ${result.title}`)
      result.images.forEach(img => console.log(`  ${img}`))
    } else {
      console.log(`[${id}] 失败: ${result.error}`)
    }
    await new Promise(r => setTimeout(r, 500))
  }
}

main().catch(console.error)