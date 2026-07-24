const axios = require('axios')

async function test() {
  const response = await axios.get('https://sys01.lib.hkbu.edu.hk/cmed/mmid/detail.php?lang=chs&pid=B00399', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
    timeout: 15000
  })
  
  const html = response.data
  console.log('=== 所有 img 标签 ===')
  const imgMatches = html.match(/<img[^>]+src="[^"]+"/g) || []
  imgMatches.forEach(m => console.log(m))
  
  console.log('\n=== aka.doubaocdn.com 图片 ===')
  const akaMatches = html.match(/https?:\/\/aka\.doubaocdn\.com\/s\/[a-zA-Z0-9]+/g) || []
  akaMatches.forEach(m => console.log(m))
}

test().catch(console.error)