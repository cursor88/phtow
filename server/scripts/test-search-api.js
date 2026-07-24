const axios = require('axios')
const BASE_URL = 'https://zjzybbg.zjyj.org.cn/bbg'

async function main() {
  const response = await axios.get(`${BASE_URL}/search/search`, {
    params: { type: 1, context: '金银花', pageNo: 1, pageSize: 5 },
    headers: { 'User-Agent': 'Mozilla/5.0' }
  })
  const records = response.data.result?.records || []
  console.log('搜索结果记录数:', records.length)
  if (records.length > 0) {
    console.log('字段:', Object.keys(records[0]))
    console.log('完整记录:', JSON.stringify(records[0], null, 2))
  }
}

main().catch(console.error)
