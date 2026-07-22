/**
 * 知乎"药食同源一周食谱"搭配数据
 * 来源: https://zhuanlan.zhihu.com/p/23592115184
 * 作者: 陈东东
 * 提取时间: 2026-07-22
 */

const zhihuWeeklyRecipes = [
  // ========== 星期一：健脾养胃 ==========
  {
    name: '山药枸杞粥',
    source_herb: '山药',
    ingredients: ['山药100g（切块）', '枸杞10g', '大米50g'],
    effect: '健脾益气，补肾养肝',
    suitable: '脾胃虚弱、食欲不振者',
    method: '山药与大米煮粥，出锅前5分钟加入枸杞。',
    category: '健脾养胃',
    source_url: 'https://zhuanlan.zhihu.com/p/23592115184'
  },
  {
    name: '茯苓薏米排骨汤',
    source_herb: '茯苓',
    ingredients: ['茯苓15g', '薏米30g', '排骨200g', '生姜3片'],
    effect: '祛湿健脾，适合脾胃虚弱者',
    suitable: '脾胃虚弱、湿气重者',
    method: '排骨焯水后与茯苓、薏米、生姜同炖1小时，加盐调味。',
    category: '健脾养胃',
    source_url: 'https://zhuanlan.zhihu.com/p/23592115184'
  },
  {
    name: '红枣小米粥',
    source_herb: '红枣',
    ingredients: ['小米80g', '红枣5颗（去核）', '桂圆肉10g'],
    effect: '补血安神，改善睡眠',
    suitable: '气血不足、失眠多梦者',
    method: '小米、红枣、桂圆同煮至粘稠。',
    category: '健脾养胃',
    source_url: 'https://zhuanlan.zhihu.com/p/23592115184'
  },

  // ========== 星期二：补气养血 ==========
  {
    name: '桂圆红枣鸡蛋汤',
    source_herb: '桂圆',
    ingredients: ['桂圆肉10g', '红枣5颗', '鸡蛋1个'],
    effect: '补气血，缓解疲劳',
    suitable: '气血亏虚、疲劳乏力者',
    method: '桂圆、红枣煮15分钟，打入鸡蛋煮成荷包蛋。',
    category: '补气养血',
    source_url: 'https://zhuanlan.zhihu.com/p/23592115184'
  },
  {
    name: '当归黄芪炖鸡汤',
    source_herb: '当归',
    ingredients: ['当归5g', '黄芪10g', '鸡腿1只', '生姜3片'],
    effect: '补气活血，增强免疫力',
    suitable: '气血两虚、免疫力低下者',
    method: '鸡腿焯水后与药材、生姜炖1.5小时，加盐调味。',
    category: '补气养血',
    source_url: 'https://zhuanlan.zhihu.com/p/23592115184'
  },
  {
    name: '黑芝麻核桃糊',
    source_herb: '黑芝麻',
    ingredients: ['黑芝麻30g', '核桃仁20g', '糯米20g', '红糖少许'],
    effect: '补肾乌发，润肠通便',
    suitable: '肾虚白发、肠燥便秘者',
    method: '材料打粉后加水煮成糊，加红糖调味。',
    category: '补气养血',
    source_url: 'https://zhuanlan.zhihu.com/p/23592115184'
  },

  // ========== 星期三：清热润肺 ==========
  {
    name: '百合莲子银耳羹',
    source_herb: '百合',
    ingredients: ['百合10g', '莲子15g', '银耳半朵（泡发）', '冰糖少许'],
    effect: '润肺止咳，滋阴养颜',
    suitable: '肺燥咳嗽、阴虚体质者',
    method: '银耳撕小朵，与百合、莲子炖至粘稠，加冰糖。',
    category: '清热润肺',
    source_url: 'https://zhuanlan.zhihu.com/p/23592115184'
  },
  {
    name: '沙参玉竹老鸭汤',
    source_herb: '沙参',
    ingredients: ['沙参10g', '玉竹10g', '鸭肉200g', '枸杞5g'],
    effect: '清热润燥，适合秋季干燥或阴虚体质',
    suitable: '阴虚燥热、秋季干燥者',
    method: '鸭肉焯水后与药材同炖1.5小时，加盐调味。',
    category: '清热润肺',
    source_url: 'https://zhuanlan.zhihu.com/p/23592115184'
  },
  {
    name: '雪梨川贝炖瘦肉',
    source_herb: '川贝母',
    ingredients: ['雪梨1个（切块）', '川贝3g（研粉）', '瘦肉100g'],
    effect: '润肺化痰，缓解干咳',
    suitable: '肺热燥咳、干咳少痰者',
    method: '瘦肉焯水后与雪梨、川贝粉隔水炖1小时。',
    category: '清热润肺',
    source_url: 'https://zhuanlan.zhihu.com/p/23592115184'
  },

  // ========== 星期四：祛湿利水 ==========
  {
    name: '红豆薏米芡实粥',
    source_herb: '薏米',
    ingredients: ['红豆30g', '薏米30g', '芡实15g'],
    effect: '祛湿消肿，改善水肿虚胖',
    suitable: '湿气重、水肿虚胖者',
    method: '材料提前浸泡2小时，煮至软烂。',
    category: '祛湿利水',
    source_url: 'https://zhuanlan.zhihu.com/p/23592115184'
  },
  {
    name: '冬瓜荷叶煲鸭汤',
    source_herb: '荷叶',
    ingredients: ['冬瓜200g', '干荷叶10g', '鸭肉150g'],
    effect: '清热解暑，利水祛湿',
    suitable: '暑湿重、水肿、夏季解暑者',
    method: '鸭肉焯水后与冬瓜、荷叶同煮1小时，加盐调味。',
    category: '祛湿利水',
    source_url: 'https://zhuanlan.zhihu.com/p/23592115184'
  },
  {
    name: '陈皮红豆沙',
    source_herb: '陈皮',
    ingredients: ['红豆50g', '陈皮5g', '冰糖少许'],
    effect: '理气健脾，消食化滞',
    suitable: '脾胃气滞、消化不良者',
    method: '红豆煮烂后加陈皮再煮10分钟，打成沙状。',
    category: '祛湿利水',
    source_url: 'https://zhuanlan.zhihu.com/p/23592115184'
  },

  // ========== 星期五：养肝明目 ==========
  {
    name: '枸杞菊花粥',
    source_herb: '枸杞',
    ingredients: ['枸杞10g', '菊花5g', '大米50g'],
    effect: '清肝明目，缓解眼疲劳',
    suitable: '用眼过度、眼睛干涩者',
    method: '大米煮粥，出锅前5分钟加入枸杞和菊花。',
    category: '养肝明目',
    source_url: 'https://zhuanlan.zhihu.com/p/23592115184'
  },
  {
    name: '决明子绿茶蒸鱼',
    source_herb: '决明子',
    ingredients: ['决明子5g（泡水）', '绿茶5g', '鲈鱼1条'],
    effect: '降脂明目，适合长期用眼或三高人群',
    suitable: '长期用眼、三高人群',
    method: '绿茶和决明子水混合，淋在鲈鱼上清蒸15分钟。',
    category: '养肝明目',
    source_url: 'https://zhuanlan.zhihu.com/p/23592115184'
  },
  {
    name: '桑葚黑米粥',
    source_herb: '桑葚',
    ingredients: ['黑米50g', '桑葚干10g', '红枣3颗'],
    effect: '补肝益肾，改善脱发、白发',
    suitable: '肝肾不足、脱发白发者',
    method: '黑米与红枣煮粥，出锅前加入桑葚干。',
    category: '养肝明目',
    source_url: 'https://zhuanlan.zhihu.com/p/23592115184'
  },

  // ========== 周末调理建议 ==========
  {
    name: '四神汤',
    source_herb: '茯苓',
    ingredients: ['茯苓15g', '莲子15g', '山药15g', '芡实15g', '猪肚或排骨适量'],
    effect: '健脾祛湿，调理消化系统',
    suitable: '脾胃虚弱、消化不良者',
    method: '药材与肉类同炖1.5小时，加盐调味。',
    category: '周末调理',
    source_url: 'https://zhuanlan.zhihu.com/p/23592115184'
  },
  {
    name: '阿胶红枣糕',
    source_herb: '阿胶',
    ingredients: ['阿胶粉5g', '红枣泥50g', '核桃碎20g'],
    effect: '补血养颜，适合女性经后调理',
    suitable: '女性血虚、经后调理者',
    method: '混合后蒸15分钟，冷藏切块。',
    category: '周末调理',
    source_url: 'https://zhuanlan.zhihu.com/p/23592115184'
  }
]

module.exports = zhihuWeeklyRecipes
