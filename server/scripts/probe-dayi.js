const axios = require('axios')

const BASE_URL = 'https://m.dayi.org.cn'

async function probeList() {
  const response = await axios.get(`${BASE_URL}/list/5/16`, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  })
  const html = response.data

  console.log('=== 大医本草-列表页分析 ===')
  console.log(`内容长度: ${html.length}`)

  // 药材链接
  const linkRegex = /href="(\/cmedical\/\d+\.html)"/g
  const links = [...html.matchAll(linkRegex)]
  console.log(`药材链接数: ${links.length}`)

  // 分页
  const pageRegex = /page[=\/](\d+)/g
  const pages = [...html.matchAll(pageRegex)].map(m => parseInt(m[1]))
  const maxPage = pages.length > 0 ? Math.max(...pages) : 1
  console.log(`最大页码: ${maxPage}`)

  // 图片
  const imgRegex = /<img[^>]+src="([^"]+)"/g
  const imgs = [...html.matchAll(imgRegex)]
  console.log(`图片数: ${imgs.length}`)
  imgs.slice(0, 5).forEach((m, i) => console.log(`  ${m[1]}`))
}

async function probeDetail(id) {
  const response = await axios.get(`${BASE_URL}/cmedical/${id}.html`, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  })
  const html = response.data

  console.log(`\n=== 详情页分析 (id=${id}) ===`)

  // 标题
  const titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/)
  console.log(`标题: ${titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : 'N/A'}`)

  // 所有图片
  const imgRegex = /<img[^>]+src="([^"]+)"/g
  const imgs = [...html.matchAll(imgRegex)]
  console.log(`图片数: ${imgs.length}`)
  imgs.forEach((m, i) => {
    if (!m[1].includes('logo') && !m[1].includes('icon')) {
      console.log(`  ${i}: ${m[1]}`)
    }
  })

  // 药材图片（去除logo/icon）
  const herbImgs = imgs.filter(m =>
    !m[1].includes('logo') &&
    !m[1].includes('icon') &&
    (m[1].includes('dayi') || m[1].includes('doubao') || m[1].includes('aka.'))
  )
  console.log(`可能的药材图片: ${herbImgs.length}`)

  // 关键字段
  const latinMatch = html.match(/拉丁[文名]*称[：:]\s*([^<\n]+)/)
  console.log(`拉丁名: ${latinMatch ? latinMatch[1].trim() : 'N/A'}`)

  const familyMatch = html.match(/科[是为属为]+([^<\n]+科)/)
  console.log(`科属: ${familyMatch ? familyMatch[1] : 'N/A'}`)
}

async function main() {
  try {
    await probeList()
    await probeDetail(1129180)
  } catch (e) {
    console.error('错误:', e.message)
  }
}

main()