const axios = require('axios')
const fs = require('fs')

async function main() {
  const response = await axios.get('https://www.dayi.org.cn/cmedical/1115491.html', {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  })
  const html = response.data
  fs.writeFileSync('C:/Users/86134/AppData/Local/Temp/dayi-detail.html', html)

  // 找所有图片相关
  const allImgRegex = /<img[^>]+src="([^"]+)"/g
  const allImgs = [...html.matchAll(allImgRegex)]

  console.log(`图片总数: ${allImgs.length}`)
  allImgs.forEach((m, i) => {
    if (!m[1].startsWith('data:') && !m[1].includes('_nuxt')) {
      console.log(`  ${i}: ${m[1]}`)
    }
  })

  // 查找aka.doubaocdn
  const akaMatches = html.match(/aka\.doubaocdn\.com[^"'\s)]+/g) || []
  console.log(`\naka.doubaocdn: ${akaMatches.length}`)
  akaMatches.forEach(m => console.log(`  ${m}`))
}

main()