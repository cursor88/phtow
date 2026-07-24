require('dotenv').config({ path: __dirname + '/../.env' })
const mysql = require('mysql2/promise')

async function main() {
  const c = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT) || 3306,
    database: process.env.MYSQL_DATABASE || 'caomuyoufang',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    charset: 'utf8mb4'
  })

  const [stats] = await c.query(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN scientific_name IS NULL OR scientific_name = '' THEN 1 ELSE 0 END) as missing_scientific,
      SUM(CASE WHEN family IS NULL OR family = '' THEN 1 ELSE 0 END) as missing_family,
      SUM(CASE WHEN medicinal_parts IS NULL OR medicinal_parts = '' THEN 1 ELSE 0 END) as missing_medicinal_parts,
      SUM(CASE WHEN pinyin IS NULL OR pinyin = '' THEN 1 ELSE 0 END) as missing_pinyin,
      SUM(CASE WHEN alias IS NULL OR alias = '' OR alias = '[]' THEN 1 ELSE 0 END) as missing_alias,
      SUM(CASE WHEN effect IS NULL OR effect = '' THEN 1 ELSE 0 END) as missing_effect,
      SUM(CASE WHEN identify_points IS NULL OR identify_points = '' THEN 1 ELSE 0 END) as missing_identify_points
    FROM herbs
  `)

  const s = stats[0]
  console.log('=== 字段缺失统计 ===')
  console.log('总药材数:', s.total)
  console.log('  scientific_name(拉丁名):', s.missing_scientific, '条缺失')
  console.log('  family(科属):', s.missing_family, '条缺失')
  console.log('  medicinal_parts(药用部位):', s.missing_medicinal_parts, '条缺失')
  console.log('  pinyin(拼音):', s.missing_pinyin, '条缺失')
  console.log('  alias(别名):', s.missing_alias, '条缺失')
  console.log('  effect(功效):', s.missing_effect, '条缺失')
  console.log('  identify_points(鉴别要点):', s.missing_identify_points, '条缺失')

  const [missingList] = await c.query(`
    SELECT id, name, scientific_name, family, medicinal_parts
    FROM herbs
    WHERE scientific_name IS NULL OR scientific_name = ''
       OR family IS NULL OR family = ''
       OR medicinal_parts IS NULL OR medicinal_parts = ''
    ORDER BY id
    LIMIT 20
  `)
  console.log('\n=== 缺失示例(前20条) ===')
  missingList.forEach(r => {
    console.log(r.id + '. ' + r.name + 
      ' [拉丁:' + (r.scientific_name || '空') + 
      ', 科属:' + (r.family || '空') + 
      ', 药用部位:' + (r.medicinal_parts || '空') + ']')
  })

  await c.end()
}

main().catch(console.error)
