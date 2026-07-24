require('dotenv').config({ path: __dirname + '/../.env' })
const mysql = require('mysql2/promise')
const axios = require('axios')

const BASE_URL = 'https://sys01.lib.hkbu.edu.hk/cmed/mmid'

// 从爬虫日志中提取的 66 条未匹配药材
// 每条数据: [name, latinName, category, pinyin]
const unmatchedHerbs = [
  ['阿魏', 'Ferulae Resina', '树脂类', 'Awei'],
  ['巴豆', 'Crotonis Fructus', '果实及种子类', 'Badou'],
  ['白矾', 'Alumen', '矿物类', 'Baifan'],
  ['白附子', 'Typhonii Rhizoma', '根及根茎类', 'Baifuzi'],
  ['白花蛇舌草', 'Hedyotidis Herba', '全草类', 'Baihuasheshecao'],
  ['白鲜皮', 'Dictamni Cortex', '皮类', 'Baixianpi'],
  ['斑蝥', 'Mylabris', '动物类', 'Banmao'],
  ['北沙参', 'Glehniae Radix', '根及根茎类', 'Beishashen'],
  ['蟾酥', 'Bufonis Venenum', '动物类', 'Chansu'],
  ['蝉蜕', 'Cicadae Periostracum', '动物类', 'Chantui'],
  ['车前草', 'Plantaginis Herba', '全草类', 'Cheqiancao'],
  ['虫白蜡', 'Cera Chinensis', '动物类', 'Chongbaila'],
  ['川楝子', 'Toosendan Fructus', '果实及种子类', 'Chuanlianzi'],
  ['川木通', 'Clematidis Armandii Caulis', '藤木类', 'Chuanmutong'],
  ['川木香', 'Vladimiriae Radix', '根及根茎类', 'Chuanmuxiang'],
  ['川牛膝', 'Cyathulae Radix', '根及根茎类', 'Chuanniuxi'],
  ['草乌', 'Aconiti Kusnezoffii Radix', '根及根茎类', 'Caowu'],
  ['蛤壳', 'Meretricis Concha', '动物类', 'Geqiao'],
  ['枸骨叶', 'Ilicis Cornutae Folium', '叶类', 'Guguye'],
  ['谷精草', 'Eriocauli Flos', '花类', 'Gujingcao'],
  ['关黄柏', 'Phellodendri Amurensis Cortex', '皮类', 'Guanhuangbai'],
  ['龟甲', 'Testudinis Carapax et Plastrum', '动物类', 'Guijia'],
  ['桂枝', 'Cinnamomi Ramulus', '藤木类', 'Guizhi'],
  ['藁本', 'Ligustici Rhizoma et Radix', '根及根茎类', 'Gaoben'],
  ['红大戟', 'Knoxiae Radix', '根及根茎类', 'Hongdaji'],
  ['红豆蔻', 'Galangae Fructus', '果实及种子类', 'Hongdoukou'],
  ['红芪', 'Hedysari Radix', '根及根茎类', 'Hongqi'],
  ['红参', 'Ginseng Radix et Rhizoma Rubra', '根及根茎类', 'Hongshen'],
  ['胡芦巴', 'Trigonellae Semen', '果实及种子类', 'Huluba'],
  ['槐角', 'Sophorae Fructus', '果实及种子类', 'Huaijiao'],
  ['金礞石', 'Micae Lapis Aureus', '矿物类', 'Jinmengshi'],
  ['金钱白花蛇', 'Bungarus Parvus', '动物类', 'Jinqianbaihuashe'],
  ['金樱子', 'Rosae Laevigatae Fructus', '果实及种子类', 'Jinyingzi'],
  ['九里香', 'Murrayae Folium et Cacumen', '叶类', 'Jiulixiang'],
  ['狼毒', 'Euphorbiae Ebracteolatae Radix', '根及根茎类', 'Langdu'],
  ['老鹳草', 'Erodii Herba', '全草类', 'Laoguancao'],
  ['两面针', 'Zanthoxyli Radix', '根及根茎类', 'Liangmianzhen'],
  ['炉甘石', 'Calamina', '矿物类', 'Luganshi'],
  ['鹿衔草', 'Pyrolae Herba', '全草类', 'Luxiancao'],
  ['罗布麻叶', 'Apocyni Veneti Folium', '叶类', 'Luobumaye'],
  ['明党参', 'Changii Radix', '根及根茎类', 'Mingdangshen'],
  ['南鹤虱', 'Carotae Fructus', '果实及种子类', 'Nanhishi'],
  ['南沙参', 'Adenophorae Radix', '根及根茎类', 'Nanshashen'],
  ['南五味子', 'Schisandrae Sphenantherae Fructus', '果实及种子类', 'Nanwuweizi'],
  ['闹羊花', 'Rhododendri Mollis Flos', '花类', 'Naoyanghua'],
  ['牛蒡子', 'Arctii Fructus', '果实及种子类', 'Niubangzi'],
  ['蒺藜', 'Tribuli Fructus', '果实及种子类', 'Jili'],
  ['山慈菇', 'Cremastrae Pseudobulbus', '根及根茎类', 'Shancigu'],
  ['山楂叶', 'Crataegi Folium', '叶类', 'Shanzhaye'],
  ['丝瓜络', 'Luffae Fructus Retinervus', '果实及种子类', 'Sigualuo'],
  ['水蛭', 'Hirudo', '动物类', 'Shuizhi'],
  ['锁阳', 'Cynomorii Herba', '全草类', 'Suoyang'],
  ['天南星', 'Arisaematis Rhizoma', '根及根茎类', 'Tiannanxing'],
  ['天山雪莲', 'Saussureae Involucratae Herba', '全草类', 'Tianshanxuelian'],
  ['天仙子', 'Hyoscyami Semen', '果实及种子类', 'Tianxianzi'],
  ['瓦楞子', 'Arcae Concha', '动物类', 'Walengzi'],
  ['五倍子', 'Galla Chinensis', '其他类', 'Wubeizi'],
  ['相思子', 'Abri Semen', '果实及种子类', 'Xiangsizi'],
  ['枳实', 'Aurantii Fructus Immaturus', '果实及种子类', 'Zhishi'],
  ['珍珠母', 'Margaritifera Concha', '动物类', 'Zhenzhumu'],
  ['赭石', 'Haematitum', '矿物类', 'Zheshi'],
  ['紫草', 'Arnebiae Radix', '根及根茎类', 'Zicao'],
  ['紫苏叶', 'Perillae Folium', '叶类', 'Zisuye'],
  ['紫苏子', 'Perillae Fructus', '果实及种子类', 'Zisuzi'],
  ['皂角刺', 'Gleditsiae Spina', '藤木类', 'Zaojiaoci']
]

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT) || 3306,
    database: process.env.MYSQL_DATABASE || 'caomuyoufang',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    charset: 'utf8mb4'
  })

  console.log('[MySQL] 连接成功')

  const [existing] = await connection.query('SELECT id, name FROM herbs')
  const existingNames = new Set(existing.map(h => h.name))
  console.log(`[数据库] 现有 ${existing.length} 条药材`)

  let inserted = 0
  let skipped = 0

  for (const [name, latinName, category, pinyin] of unmatchedHerbs) {
    if (existingNames.has(name)) {
      console.log(`[跳过] ${name} - 已存在`)
      skipped++
      continue
    }

    try {
      await connection.query(
        `INSERT INTO herbs (name, pinyin, scientific_name, category, keywords, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
        [name, pinyin, latinName, category, name + ',' + (latinName || '')]
      )
      console.log(`[插入] ${name} (${pinyin}) - ${category}`)
      inserted++
    } catch (e) {
      console.log(`[错误] ${name} - ${e.message}`)
    }
  }

  console.log('\n========================================')
  console.log(`新增药材: ${inserted} 条`)
  console.log(`跳过(已存在): ${skipped} 条`)
  console.log('========================================')

  await connection.end()
}

main().catch(console.error)