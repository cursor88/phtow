const axios = require('axios')

const BASE_URL = 'https://m.dayi.org.cn'

async function probeListWithPagination() {
  // 列表页似乎使用p参数
  for (let p = 1; p <= 3; p++) {
    const response = await axios.get(`${BASE_URL}/list/5/16`, {
      params: { p },
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })
    const html = response.data

    const linkRegex = /href="(\/cmedical\/\d+\.html)"/g
    const links = [...html.matchAll(linkRegex)]
    console.log(`p=${p} - 链接数: ${links.length}`)

    if (links.length > 0) {
      // 取前3个链接示例
      links.slice(0, 3).forEach(m => {
        const idMatch = m[1].match(/\/cmedical\/(\d+)\.html/)
        if (idMatch) {
          console.log(`  ID: ${idMatch[1]}`)
        }
      })
    }
  }
}

async function probeDetail(id) {
  const response = await axios.get(`${BASE_URL}/cmedical/${id}.html`, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  })
  const html = response.data

  console.log(`\n=== 详情 ${id} ===`)

  // 提取所有图片，过滤logo和icon
  const imgRegex = /<img[^>]+src="([^"]+)"/g
  const imgs = [...html.matchAll(imgRegex)]
    .map(m => m[1])
    .filter(src =>
      !src.startsWith('data:') &&
      !src.includes('logo') &&
      !src.includes('icon') &&
      !src.includes('_nuxt/img')
    )

  console.log(`有效图片: ${imgs.length}`)
  imgs.forEach((src, i) => console.log(`  ${i}: ${src}`))

  // 找药材图（大图）
  const herbImg = imgs.find(s => s.includes('image.dayi.org.cn') || s.includes('aka.'))
  console.log(`药材主图: ${herbImg || 'N/A'}`)

  // 提取药材信息
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')

  // 标题
  const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/)
  console.log(`标题: ${titleMatch ? titleMatch[1].trim() : 'N/A'}`)

  // 拉丁名
  const latinMatch = text.match(/拉丁[文名]*称[：:]\s*([A-Z][a-z]+\s+[a-z]+(?:\s+[A-Z][a-z]+)?)/)
  console.log(`拉丁名: ${latinMatch ? latinMatch[1] : 'N/A'}`)

  // 科属
  const familyMatch = text.match(/科[是为属]*\s*([^\s、,，。]+科[^\s、,，。]*)/)
  console.log(`科属: ${familyMatch ? familyMatch[1] : 'N/A'}`)
}

async function main() {
  try {
    await probeListWithPagination()
    await probeDetail(1129180)  // 党参
    await probeDetail(305866)   // 枳实
  } catch (e) {
    console.error('错误:', e.message)
  }
}

main()