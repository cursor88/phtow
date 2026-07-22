require('dotenv').config()
const mysqlService = require('./services/mysqlService')

async function verify() {
  const stats = await mysqlService.getReferenceImageStats()
  console.log('参考图统计:')
  console.log(`  总记录数: ${stats.total}`)
  console.log(`  药材种类: ${stats.herb_count}`)

  const images = await mysqlService.getReferenceImagesByHerbId(1)
  console.log(`\n人参参考图数量: ${images.length}`)
  if (images.length > 0) {
    console.log(`  示例: ${images[0].image_name}, features维度: ${images[0].features?.featureDim || 'unknown'}`)
  }

  process.exit(0)
}

verify().catch(e => {
  console.error(e)
  process.exit(1)
})
