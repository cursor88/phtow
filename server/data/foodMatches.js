const foodMatches = [
  {
    id: 1,
    name: '人参鸡汤',
    herbId: 1,
    ingredients: ['人参', '土鸡', '红枣', '枸杞', '姜片'],
    effect: '大补元气，养血安神，增强体质',
    suitable: '体虚乏力、气血不足、失眠多梦者',
    taboo: '感冒发热、湿热内蕴者不宜',
    method: '1. 土鸡洗净焯水；2. 人参切片，红枣枸杞洗净；3. 所有材料放入砂锅，加水大火烧开后转小火炖2小时；4. 加盐调味即可。',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20ginseng%20chicken%20soup%20traditional%20herbal%20soup%20in%20clay%20pot%20high%20quality&image_size=square_hd'
  },
  {
    id: 2,
    name: '人参粥',
    herbId: 1,
    ingredients: ['人参粉', '大米', '冰糖'],
    effect: '补气健脾，益肺生津',
    suitable: '脾胃虚弱、食欲不振、肺虚气短者',
    taboo: '实证热证者忌用',
    method: '1. 大米淘洗干净；2. 锅中加水，放入大米煮粥；3. 粥将熟时加入人参粉和冰糖，再煮5分钟即可。',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20ginseng%20rice%20porridge%20congee%20healthy%20breakfast%20high%20quality&image_size=square_hd'
  },
  {
    id: 3,
    name: '人参枸杞茶',
    herbId: 1,
    ingredients: ['人参片', '枸杞', '蜂蜜'],
    effect: '益气养阴，明目提神',
    suitable: '疲劳乏力、用眼过度、免疫力低下者',
    taboo: '感冒发热者不宜',
    method: '1. 人参片和枸杞放入杯中；2. 冲入沸水，焖泡10分钟；3. 温度适宜后加蜂蜜调味即可。',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20ginseng%20goji%20berry%20tea%20herbal%20tea%20in%20teacup%20high%20quality&image_size=square_hd'
  },
  {
    id: 4,
    name: '枸杞菊花茶',
    herbId: 2,
    ingredients: ['枸杞', '菊花', '冰糖'],
    effect: '滋补肝肾，清肝明目',
    suitable: '用眼过度、眼睛干涩、头晕耳鸣者',
    taboo: '脾胃虚寒者不宜多饮',
    method: '1. 枸杞和菊花洗净；2. 放入茶壶中，冲入沸水；3. 焖泡5-10分钟，加冰糖调味即可。',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20goji%20berry%20chrysanthemum%20tea%20healthy%20herbal%20tea%20high%20quality&image_size=square_hd'
  },
  {
    id: 5,
    name: '枸杞银耳羹',
    herbId: 2,
    ingredients: ['枸杞', '银耳', '红枣', '冰糖'],
    effect: '滋阴润肺，养颜美容',
    suitable: '阴虚燥咳、皮肤干燥、面色无华者',
    taboo: '痰湿内盛者不宜',
    method: '1. 银耳泡发撕小朵；2. 银耳放入锅中，加水大火烧开转小火炖1小时；3. 加入枸杞、红枣和冰糖，再炖30分钟即可。',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20goji%20berry%20white%20fungus%20soup%20sweet%20dessert%20soup%20high%20quality&image_size=square_hd'
  },
  {
    id: 6,
    name: '枸杞红枣粥',
    herbId: 2,
    ingredients: ['枸杞', '红枣', '大米', '红糖'],
    effect: '补气养血，健脾益肾',
    suitable: '气血两虚、面色萎黄、腰膝酸软者',
    taboo: '湿热内蕴者不宜',
    method: '1. 大米淘洗，红枣去核；2. 锅中加水，放入大米和红枣煮粥；3. 粥将熟时加入枸杞和红糖，再煮5分钟即可。',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20goji%20berry%20red%20date%20rice%20porridge%20healthy%20congee%20high%20quality&image_size=square_hd'
  },
  {
    id: 7,
    name: '黄芪炖鸡',
    herbId: 3,
    ingredients: ['黄芪', '土鸡', '红枣', '姜片'],
    effect: '补气升阳，固表止汗',
    suitable: '气虚乏力、表虚自汗、容易感冒者',
    taboo: '感冒发热、阴虚火旺者不宜',
    method: '1. 土鸡洗净焯水；2. 黄芪、红枣洗净；3. 所有材料放入砂锅，加水炖2小时；4. 加盐调味即可。',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20astragalus%20chicken%20soup%20huangqi%20herbal%20soup%20high%20quality&image_size=square_hd'
  },
  {
    id: 8,
    name: '黄芪粥',
    herbId: 3,
    ingredients: ['黄芪', '大米', '白糖'],
    effect: '补气健脾，利水消肿',
    suitable: '气虚水肿、脾虚泄泻、乏力倦怠者',
    taboo: '表实邪盛者忌用',
    method: '1. 黄芪洗净，加水煎汁去渣；2. 药汁中加入大米煮粥；3. 粥成后加白糖调味即可。',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20astragalus%20rice%20porridge%20huangqi%20congee%20healthy%20high%20quality&image_size=square_hd'
  },
  {
    id: 9,
    name: '黄芪当归茶',
    herbId: 3,
    ingredients: ['黄芪', '当归', '红枣'],
    effect: '补气养血，调经止痛',
    suitable: '气血两虚、月经不调、面色萎黄者',
    taboo: '感冒发热、阴虚火旺者不宜',
    method: '1. 黄芪、当归、红枣洗净；2. 放入杯中，冲入沸水；3. 焖泡15分钟即可饮用。',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20astragalus%20angelica%20tea%20herbal%20tea%20healthy%20drink%20high%20quality&image_size=square_hd'
  },
  {
    id: 10,
    name: '当归生姜羊肉汤',
    herbId: 4,
    ingredients: ['当归', '生姜', '羊肉', '料酒'],
    effect: '温中补虚，散寒止痛',
    suitable: '虚寒腹痛、产后血虚、寒疝腹痛者',
    taboo: '阴虚火旺、湿热内蕴者不宜',
    method: '1. 羊肉切块焯水；2. 当归、生姜切片；3. 所有材料放入砂锅，加水炖2-3小时；4. 加盐调味即可。',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20angelica%20ginger%20lamb%20soup%20danggui%20traditional%20soup%20high%20quality&image_size=square_hd'
  },
  {
    id: 11,
    name: '当归红枣蛋',
    herbId: 4,
    ingredients: ['当归', '红枣', '鸡蛋', '红糖'],
    effect: '补血调经，养颜美容',
    suitable: '血虚月经不调、痛经、面色萎黄者',
    taboo: '湿热内蕴者不宜',
    method: '1. 鸡蛋煮熟去壳；2. 当归、红枣洗净；3. 锅中加水，放入所有材料煮30分钟；4. 加红糖调味即可。',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20angelica%20red%20date%20egg%20sweet%20soup%20danggui%20dessert%20high%20quality&image_size=square_hd'
  },
  {
    id: 12,
    name: '当归补血汤',
    herbId: 4,
    ingredients: ['当归', '黄芪', '红枣'],
    effect: '补气生血',
    suitable: '血虚发热、气血两虚、产后血虚者',
    taboo: '阴虚发热者慎用',
    method: '1. 黄芪和当归比例为5:1；2. 所有材料洗净，加水煎煮；3. 大火烧开后转小火煎40分钟，取汁饮用。',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20angelica%20astragalus%20blood%20tonic%20soup%20herbal%20decoction%20high%20quality&image_size=square_hd'
  },
  {
    id: 13,
    name: '金银花茶',
    herbId: 5,
    ingredients: ['金银花', '甘草', '蜂蜜'],
    effect: '清热解毒，疏散风热',
    suitable: '风热感冒、咽喉肿痛、口舌生疮者',
    taboo: '脾胃虚寒者不宜多饮',
    method: '1. 金银花和甘草洗净；2. 放入杯中，冲入沸水；3. 焖泡5-10分钟，加蜂蜜调味即可。',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20honeysuckle%20flower%20tea%20jinyinhua%20herbal%20tea%20high%20quality&image_size=square_hd'
  },
  {
    id: 14,
    name: '金银花绿豆汤',
    herbId: 5,
    ingredients: ['金银花', '绿豆', '冰糖'],
    effect: '清热解毒，消暑解渴',
    suitable: '暑热烦渴、热毒疮疡、内热亢盛者',
    taboo: '脾胃虚寒者不宜',
    method: '1. 绿豆提前浸泡2小时；2. 金银花用纱布包好；3. 锅中加水，放入绿豆和金银花包煮至绿豆开花；4. 取出药包，加冰糖调味即可。',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20honeysuckle%20mung%20bean%20soup%20summer%20cooling%20soup%20high%20quality&image_size=square_hd'
  },
  {
    id: 15,
    name: '金银花菊花茶',
    herbId: 5,
    ingredients: ['金银花', '菊花', '薄荷'],
    effect: '清热解毒，清肝明目',
    suitable: '风热感冒、目赤肿痛、头晕头痛者',
    taboo: '脾胃虚寒者不宜',
    method: '1. 金银花、菊花、薄荷洗净；2. 放入茶壶中，冲入沸水；3. 焖泡5分钟即可饮用。',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20honeysuckle%20chrysanthemum%20mint%20tea%20refreshing%20herbal%20tea%20high%20quality&image_size=square_hd'
  },
  {
    id: 16,
    name: '茯苓薏米粥',
    herbId: 6,
    ingredients: ['茯苓粉', '薏米', '大米', '白糖'],
    effect: '健脾祛湿，利水消肿',
    suitable: '脾虚湿盛、水肿腹胀、食欲不振者',
    taboo: '津液不足者慎用',
    method: '1. 薏米提前浸泡2小时；2. 大米淘洗干净；3. 锅中加水，放入薏米和大米煮粥；4. 粥将熟时加入茯苓粉和白糖，再煮5分钟即可。',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20poria%20coix%20seed%20rice%20porridge%20fuling%20healthy%20congee%20high%20quality&image_size=square_hd'
  },
  {
    id: 17,
    name: '茯苓山药排骨汤',
    herbId: 6,
    ingredients: ['茯苓', '山药', '排骨', '姜片'],
    effect: '健脾益胃，祛湿止泻',
    suitable: '脾胃虚弱、食少便溏、乏力倦怠者',
    taboo: '湿热内蕴者不宜',
    method: '1. 排骨焯水；2. 山药去皮切块，茯苓洗净；3. 所有材料放入砂锅，加水炖1.5小时；4. 加盐调味即可。',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20poria%20yam%20pork%20rib%20soup%20fuling%20healthy%20soup%20high%20quality&image_size=square_hd'
  },
  {
    id: 18,
    name: '茯苓陈皮茶',
    herbId: 6,
    ingredients: ['茯苓', '陈皮', '蜂蜜'],
    effect: '健脾祛湿，理气化痰',
    suitable: '脾虚湿盛、痰湿咳嗽、脘腹胀满者',
    taboo: '津液不足者慎用',
    method: '1. 茯苓和陈皮洗净；2. 放入杯中，冲入沸水；3. 焖泡10分钟，加蜂蜜调味即可。',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20poria%20tangerine%20peel%20tea%20fuling%20chenpi%20herbal%20tea%20high%20quality&image_size=square_hd'
  }
]

module.exports = foodMatches
