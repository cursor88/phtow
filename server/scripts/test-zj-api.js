const axios = require('axios')
const BASE_URL = 'https://zjzybbg.zjyj.org.cn/bbg'

async function main() {
  console.log('=== 测试搜索 API ===')
  const searchResponse = await axios.get(`${BASE_URL}/search/search`, {
    params: { type: 1, context: '人参', pageNo: 1, pageSize: 10 },
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  })
  console.log('搜索结果:', JSON.stringify(searchResponse.data.result?.records?.[0], null, 2))

  if (searchResponse.data.result?.records?.[0]) {
    const speciesInfoId = searchResponse.data.result.records[0].medicineSpeciesInfoId
    console.log('\n=== 测试详情 API (ID=' + speciesInfoId + ') ===')
    const detailResponse = await axios.get(`${BASE_URL}/medicine/display/detail`, {
      params: { speciesInfoId },
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    })
    console.log('详情数据:', JSON.stringify(detailResponse.data.result, null, 2))
    console.log('\n=== keys ===', Object.keys(detailResponse.data.result || {}))
  }
}

main().catch(e => {
  console.error('Error:', e.message)
  console.error(e.response?.data)
})
