/**
 * 知乎"草本妙用"专栏药食同源搭配数据
 * 来源: https://www.zhihu.com/people/14-67-30-19/posts
 * 提取时间: 2026-07-22
 */

const zhihuRecipes = [
  // ========== 木贼 ==========
  {
    name: '木贼菊花明目茶',
    source_herb: '木贼',
    ingredients: ['木贼5g', '菊花6g', '枸杞子10g'],
    effect: '疏散风热、清肝明目，适用于眼干涩、红血丝、迎风流泪',
    suitable: '眼干涩、红血丝、迎风流泪者',
    method: '沸水冲泡或稍煎5分钟，代茶饮。建议每周饮用2-3次，每次木贼用量不超过5g。',
    source_url: 'https://zhuanlan.zhihu.com/p/2042210188346790847'
  },
  {
    name: '苦瓜苋菜木贼汤',
    source_herb: '木贼',
    ingredients: ['苦瓜1个', '苋菜2株', '木贼草25克', '盐少许'],
    effect: '适用于体热赤目、眼内红丝、眼干涩、头风胀痛、大便不畅、胸闷烦热',
    suitable: '体热赤目、眼内红丝、眼干涩者',
    method: '苦瓜切块，苋菜去根整株，加木贼草及水3碗，煲至1碗，饮汤食瓜。',
    source_url: 'https://zhuanlan.zhihu.com/p/2042210188346790847'
  },
  {
    name: '木贼薏米粥',
    source_herb: '木贼',
    ingredients: ['木贼10g', '薏苡仁30g'],
    effect: '利水渗湿、健脾止泻，兼有明目之功',
    suitable: '脾虚湿盛伴目昏者',
    method: '木贼煎水取汁，入薏米煮粥。',
    source_url: 'https://zhuanlan.zhihu.com/p/2042210188346790847'
  },
  
  // ========== 浮萍 ==========
  {
    name: '浮萍粥',
    source_herb: '浮萍',
    ingredients: ['浮萍15g（鲜品30g）', '粳米100g'],
    effect: '风热感冒、水肿、小便不利',
    suitable: '风热感冒、水肿、小便不利者',
    method: '浮萍与粳米共煮成粥。',
    source_url: 'https://zhuanlan.zhihu.com/p/2041840693199516370'
  },
  {
    name: '浮萍鸡蛋饼',
    source_herb: '浮萍',
    ingredients: ['浮萍末10g', '面粉', '鸡蛋'],
    effect: '辅助调理，透疹止痒',
    suitable: '需要透疹止痒者',
    method: '调制后油煎食用。',
    source_url: 'https://zhuanlan.zhihu.com/p/2041840693199516370'
  },
  
  // ========== 桑叶 ==========
  {
    name: '桑叶茶',
    source_herb: '桑叶',
    ingredients: ['干桑叶5-10g'],
    effect: '清肝明目，降糖润肺',
    suitable: '眼干、血糖偏高、肺燥咳嗽者',
    method: '开水冲泡代茶饮。',
    source_url: 'https://zhuanlan.zhihu.com/p/2040009880803751098'
  },
  {
    name: '桑叶菊花枸杞茶',
    source_herb: '桑叶',
    ingredients: ['桑叶5g', '菊花5g', '枸杞10g'],
    effect: '清肺润燥，护眼',
    suitable: '用眼过度、肺燥咳嗽者',
    method: '冲泡代茶饮。',
    source_url: 'https://zhuanlan.zhihu.com/p/2040009880803751098'
  },
  {
    name: '桑叶粥',
    source_herb: '桑叶',
    ingredients: ['鲜桑叶', '粳米'],
    effect: '降糖清脂',
    suitable: '血糖偏高、血脂偏高者',
    method: '桑叶煎汤取汁煮粥。',
    source_url: 'https://zhuanlan.zhihu.com/p/2040009880803751098'
  },
  {
    name: '桑叶猪肝汤',
    source_herb: '桑叶',
    ingredients: ['桑叶10g', '枸杞10g', '猪肝150g', '生姜'],
    effect: '养肝明目',
    suitable: '肝血不足、目暗不明者',
    method: '药材煲汤后下猪肝。',
    source_url: 'https://zhuanlan.zhihu.com/p/2040009880803751098'
  },
  
  // ========== 牛蒡子 ==========
  {
    name: '牛蒡根煲汤',
    source_herb: '牛蒡子',
    ingredients: ['鲜牛蒡根', '瘦肉'],
    effect: '清热利尿，健脾开胃',
    suitable: '热毒痈肿、小便不利、食欲不振者',
    method: '根去皮切片，配瘦肉煲汤。',
    source_url: 'https://zhuanlan.zhihu.com/p/2039750690654965968'
  },
  {
    name: '牛蒡子粥',
    source_herb: '牛蒡子',
    ingredients: ['牛蒡子果实', '粳米'],
    effect: '风热感冒初起，利咽止咳',
    suitable: '风热感冒、咽喉肿痛者',
    method: '牛蒡子研末，与粳米同煮。',
    source_url: 'https://zhuanlan.zhihu.com/p/2039750690654965968'
  },
  {
    name: '牛蒡茶',
    source_herb: '牛蒡子',
    ingredients: ['牛蒡根'],
    effect: '清热解毒，润肠通便',
    suitable: '便秘、热毒疮疡者',
    method: '晒干或烘干，开水泡饮。',
    source_url: 'https://zhuanlan.zhihu.com/p/2039750690654965968'
  },
  {
    name: '牛蒡子薄荷饮',
    source_herb: '牛蒡子',
    ingredients: ['牛蒡子果实', '薄荷'],
    effect: '疏散风热，清利头目',
    suitable: '风热感冒、头痛目赤者',
    method: '与薄荷同煎代茶。',
    source_url: 'https://zhuanlan.zhihu.com/p/2039750690654965968'
  },
  
  // ========== 升麻 ==========
  {
    name: '人参升麻粥',
    source_herb: '升麻',
    ingredients: ['人参5-10g', '升麻3g', '粳米30g', '冰糖适量'],
    effect: '补气摄血、升阳举陷，补充气血，增强体质',
    suitable: '气虚月经过多、过期不止，伴有心悸、四肢无力、面色苍白者',
    method: '1. 人参、升麻洗净，加水煎煮30分钟，取药汁备用；2. 粳米淘洗干净，加入药汁，小火慢煮至粥熟，加入冰糖调味即可。',
    source_url: 'https://zhuanlan.zhihu.com/p/2037842237216794291'
  },
  {
    name: '升麻芝麻炖猪大肠',
    source_herb: '升麻',
    ingredients: ['升麻15g', '黑芝麻100g', '猪大肠1段（约30厘米）', '生姜', '葱段', '盐适量'],
    effect: '升提中气、补虚润肠，改善肠道功能',
    suitable: '年老津枯、病后肠燥所致的便秘，或伴有脱肛、子宫下垂者（脾虚便溏者不宜）',
    method: '1. 猪大肠洗净，升麻、黑芝麻装入大肠内，两头扎紧；2. 将大肠放入砂锅中，加入生姜、葱段、适量清水，文火炖3小时至熟烂，加盐调味即可。',
    source_url: 'https://zhuanlan.zhihu.com/p/2037842237216794291'
  },
  {
    name: '升麻黄芪炖鸡',
    source_herb: '升麻',
    ingredients: ['升麻5g', '黄芪15g', '鸡肉200g', '红枣5颗', '生姜', '盐适量'],
    effect: '补中益气、升阳举陷，增强机体免疫力',
    suitable: '体虚乏力、中气不足，伴有气短、食欲不振、面色萎黄者',
    method: '1. 鸡肉切块，焯水去血沫；升麻、黄芪洗净，红枣去核；2. 所有食材放入砂锅中，加适量清水，大火烧开后转小火慢煲1小时，加盐调味即可。',
    source_url: 'https://zhuanlan.zhihu.com/p/2037842237216794291'
  },
  {
    name: '升麻甘草茶',
    source_herb: '升麻',
    ingredients: ['升麻3g', '炙甘草5g', '蜂蜜适量'],
    effect: '清热解毒、利咽止痛，缓解轻微咽喉不适',
    suitable: '风热感冒初期、咽喉轻微肿痛，无明显发热者',
    method: '升麻、炙甘草洗净，放入杯中，用沸水冲泡，焖泡15分钟，加入蜂蜜调味即可。',
    source_url: 'https://zhuanlan.zhihu.com/p/2037842237216794291'
  },
  
  // ========== 葛根 ==========
  {
    name: '葛粉粥',
    source_herb: '葛根',
    ingredients: ['葛根粉30g', '小米100g', '清水适量'],
    effect: '和中益胃，升举阳气，生津止渴',
    suitable: '脾胃虚弱、食欲不振、口干舌燥者；日常养生调理人群',
    method: '小米淘洗干净，提前浸泡一晚；次日将小米加水煮至粥稠，葛根粉用温水调成糊状，倒入粥中搅拌均匀，再煮5-10分钟即可，可加少量冰糖调味。',
    source_url: 'https://zhuanlan.zhihu.com/p/2037538686632464464'
  },
  {
    name: '葛根炖牛肉',
    source_herb: '葛根',
    ingredients: ['牛肉500g', '干葛根20g', '葱', '姜', '酱油', '盐适量'],
    effect: '补中益气，养血固脱，温阳益脾，通经活络',
    suitable: '气血不足、脾胃虚弱、肢体乏力者；产后恢复、体质虚弱者',
    method: '牛肉切块，焯水去血沫；葛根去皮洗净切块，与牛肉、葱段、姜片一同放入锅中，加适量清水和酱油，中小火焖煮30分钟，加盐调味即可。',
    source_url: 'https://zhuanlan.zhihu.com/p/2037538686632464464'
  },
  {
    name: '葛根绿豆菊花粥',
    source_herb: '葛根',
    ingredients: ['粳米100g', '绿豆60g', '菊花10g', '葛根粉30g'],
    effect: '清热生津，解肌发表，清肝明目',
    suitable: '风热感冒、发热口渴、心烦、口舌溃疡者；肝火旺盛、头晕目眩者',
    method: '菊花装入纱布袋煮汁，留汁去袋；绿豆浸泡30分钟，与粳米一同加水煮至绿豆开花，加入菊花汁煮至米烂，葛根粉调糊倒入，稍煮即可。',
    source_url: 'https://zhuanlan.zhihu.com/p/2037538686632464464'
  },
  {
    name: '葛根饺子',
    source_herb: '葛根',
    ingredients: ['面粉200g', '葛根粉40g', '丝瓜', '大葱', '猪肉适量', '调料少许'],
    effect: '生津止渴，通经活络，补充营养',
    suitable: '日常保健人群；颈肩不适、口干者',
    method: '面粉与葛根粉混合，加水揉成光滑面团；丝瓜、大葱、猪肉制成馅料，面团分剂子包馅，煮熟即可。',
    source_url: 'https://zhuanlan.zhihu.com/p/2037538686632464464'
  },
  {
    name: '葛根汁',
    source_herb: '葛根',
    ingredients: ['新鲜葛根200g', '清水适量'],
    effect: '生津止渴，解酒毒，清热降火',
    suitable: '酒后不适、口干舌燥、咽喉肿痛者；夏季清热解暑',
    method: '葛根去皮洗净，切成小块，放入榨汁机中，加适量清水榨汁，过滤后饮用，可加少量蜂蜜调味。',
    source_url: 'https://zhuanlan.zhihu.com/p/2037538686632464464'
  },
  
  // ========== 蝉蜕 ==========
  {
    name: '冬瓜苡仁蝉蜕汤',
    source_herb: '蝉蜕',
    ingredients: ['蝉蜕5g', '冬瓜200g', '薏苡仁30g', '生姜3片'],
    effect: '疏风清热，利水消肿',
    suitable: '风热感冒、水肿、小便不利者',
    method: '蝉蜕纱布包裹，与薏苡仁同煮30分钟，加入冬瓜块煮至熟烂，调味食用。',
    source_url: 'https://zhuanlan.zhihu.com/p/2027109628312400075'
  },
  {
    name: '马蹄蝉蜕煲猪横脷',
    source_herb: '蝉蜕',
    ingredients: ['蝉蜕5g', '马蹄100g', '猪横脷1条', '生姜3片'],
    effect: '清热利湿，疏风解表',
    suitable: '风热感冒、咽喉肿痛者',
    method: '蝉蜕纱布包裹，猪横脷洗净焯水，马蹄去皮，同煲1小时调味食用。',
    source_url: 'https://zhuanlan.zhihu.com/p/2027109628312400075'
  },
  {
    name: '蝉蜕防风粥',
    source_herb: '蝉蜕',
    ingredients: ['蝉蜕3g', '防风10g', '粳米100g'],
    effect: '疏风止痒，解表散邪',
    suitable: '风疹瘙痒、皮肤过敏者',
    method: '蝉蜕、防风煎汁去渣，入粳米煮粥。',
    source_url: 'https://zhuanlan.zhihu.com/p/2027109628312400075'
  },
  {
    name: '蝉衣鸡蛋汤',
    source_herb: '蝉蜕',
    ingredients: ['蝉蜕6g', '鸡蛋2个', '生姜3片'],
    effect: '疏风清热，透疹止痒',
    suitable: '风热感冒、麻疹不透者',
    method: '蝉蜕煎水去渣，打入蛋花，加姜调味。',
    source_url: 'https://zhuanlan.zhihu.com/p/2027109628312400075'
  },
  
  // ========== 薄荷 ==========
  {
    name: '薄荷粥',
    source_herb: '薄荷',
    ingredients: ['鲜薄荷叶10g（或干品3g）', '粳米100g', '冰糖适量'],
    effect: '疏散风热，清利头目，利咽喉',
    suitable: '风热感冒、头痛目赤、咽喉肿痛者',
    method: '1. 粳米淘洗干净，加水煮粥；2. 粥将熟时加入薄荷叶，再煮3分钟即可；3. 加冰糖调味。',
    source_url: 'https://zhuanlan.zhihu.com/p/2024464139167233897'
  },
  {
    name: '薄荷茶',
    source_herb: '薄荷',
    ingredients: ['薄荷叶5g', '蜂蜜适量'],
    effect: '疏风清热，利咽透疹',
    suitable: '风热感冒、咽喉肿痛、皮肤瘙痒者',
    method: '薄荷叶放入杯中，沸水冲泡，焖5分钟后加蜂蜜调味。',
    source_url: 'https://zhuanlan.zhihu.com/p/2024464139167233897'
  },
  {
    name: '薄荷红茶',
    source_herb: '薄荷',
    ingredients: ['薄荷叶3g', '红茶3g'],
    effect: '提神醒脑，疏风散热',
    suitable: '疲劳乏力、头晕头痛者',
    method: '薄荷叶与红茶同泡，焖5分钟饮用。',
    source_url: 'https://zhuanlan.zhihu.com/p/2024464139167233897'
  },
  {
    name: '清肝明目茶',
    source_herb: '薄荷',
    ingredients: ['薄荷5g', '菊花5g', '枸杞10g'],
    effect: '清肝明目，疏风清热',
    suitable: '用眼过度、眼睛干涩、头晕头痛者',
    method: '薄荷、菊花、枸杞同泡，焖10分钟饮用。',
    source_url: 'https://zhuanlan.zhihu.com/p/2024464139167233897'
  },
  {
    name: '双花薄荷饮',
    source_herb: '薄荷',
    ingredients: ['薄荷5g', '金银花10g', '菊花10g'],
    effect: '清热解毒，疏散风热',
    suitable: '风热感冒、咽喉肿痛、目赤肿痛者',
    method: '三味同煎，代茶饮。',
    source_url: 'https://zhuanlan.zhihu.com/p/2024464139167233897'
  },
  
  // ========== 蔓荆子 ==========
  {
    name: '蔓荆子粥',
    source_herb: '蔓荆子',
    ingredients: ['蔓荆子15g', '粳米100g'],
    effect: '疏散风热，清利头目',
    suitable: '风热感冒、头痛、目赤肿痛者',
    method: '先将蔓荆子洗净，加水煎煮，去渣取汁；再将粳米淘洗干净，加入药汁中，同煮为粥。',
    source_url: 'https://zhuanlan.zhihu.com/p/2040713673065370691'
  },
  {
    name: '蔓荆子茶',
    source_herb: '蔓荆子',
    ingredients: ['蔓荆子10g', '绿茶3g'],
    effect: '清利头目，止痛',
    suitable: '头痛、眩晕、目赤肿痛者',
    method: '将蔓荆子捣碎，与绿茶一同放入杯中，冲入沸水，加盖焖泡10分钟后即可饮用。',
    source_url: 'https://zhuanlan.zhihu.com/p/2040713673065370691'
  },
  {
    name: '蔓荆子鸡蛋汤',
    source_herb: '蔓荆子',
    ingredients: ['蔓荆子10g', '鸡蛋2个', '生姜3片', '葱白2段', '食盐少许'],
    effect: '疏风清热，止痛',
    suitable: '风热头痛、目赤肿痛者',
    method: '先将蔓荆子洗净，加水煎煮，去渣取汁；再将鸡蛋打散，倒入药汁中，加入生姜、葱白，煮至鸡蛋熟，加入食盐调味即可。',
    source_url: 'https://zhuanlan.zhihu.com/p/2040713673065370691'
  },
  
  // ========== 柽柳 ==========
  {
    name: '柽柳荸荠饮',
    source_herb: '柽柳',
    ingredients: ['柽柳15g', '荸荠200g', '冰糖适量'],
    effect: '清热解毒，生津止渴',
    suitable: '风热感冒、咽喉肿痛、口干舌燥者',
    method: '先将柽柳洗净，加水煎煮，去渣取汁；再将荸荠去皮，切片，放入药汁中，加入冰糖，煮至荸荠熟软即可。',
    source_url: 'https://zhuanlan.zhihu.com/p/2022704110739235271'
  },
  {
    name: '柽柳防风粥',
    source_herb: '柽柳',
    ingredients: ['柽柳10g', '防风10g', '粳米100g'],
    effect: '疏风解表，祛湿止痛',
    suitable: '风热感冒、头痛、身痛者',
    method: '先将柽柳、防风洗净，加水煎煮，去渣取汁；再将粳米淘洗干净，加入药汁中，同煮为粥。',
    source_url: 'https://zhuanlan.zhihu.com/p/2022704110739235271'
  },
  {
    name: '柽柳薄荷茶',
    source_herb: '柽柳',
    ingredients: ['柽柳10g', '薄荷5g', '绿茶3g'],
    effect: '疏风散热，清利头目',
    suitable: '风热感冒、头痛、目赤肿痛者',
    method: '将柽柳、薄荷、绿茶一同放入杯中，冲入沸水，加盖焖泡10分钟后即可饮用。',
    source_url: 'https://zhuanlan.zhihu.com/p/2022704110739235271'
  },
  
  // ========== 芸香草 ==========
  {
    name: '芸香草炖鸡汤',
    source_herb: '芸香草',
    ingredients: ['芸香草10g', '母鸡1只（约1000g）', '生姜5片', '食盐适量'],
    effect: '祛风除湿，温中止痛',
    suitable: '风寒湿痹、关节疼痛、胃寒腹痛者',
    method: '将母鸡宰杀，去毛及内脏，洗净，切块；芸香草洗净，晾干；生姜洗净，拍破。将母鸡、芸香草、生姜一同放入砂锅中，加适量清水，大火煮沸后，改用小火炖至鸡肉熟烂，加入食盐调味即可。',
    source_url: 'https://zhuanlan.zhihu.com/p/2021905703640507478'
  },
  {
    name: '芸香草排骨汤',
    source_herb: '芸香草',
    ingredients: ['芸香草10g', '猪排骨500g', '生姜5片', '食盐适量'],
    effect: '祛风除湿，强筋健骨',
    suitable: '风寒湿痹、关节疼痛、腰膝酸软者',
    method: '将猪排骨洗净，切块，焯水去血沫；芸香草洗净，晾干；生姜洗净，拍破。将排骨、芸香草、生姜一同放入砂锅中，加适量清水，大火煮沸后，改用小火炖至排骨熟烂，加入食盐调味即可。',
    source_url: 'https://zhuanlan.zhihu.com/p/2021905703640507478'
  },
  {
    name: '芸香草茶',
    source_herb: '芸香草',
    ingredients: ['芸香草5g', '绿茶3g'],
    effect: '祛风除湿，提神醒脑',
    suitable: '风寒湿痹、头痛、头晕者',
    method: '将芸香草、绿茶一同放入杯中，冲入沸水，加盖焖泡10分钟后即可饮用。',
    source_url: 'https://zhuanlan.zhihu.com/p/2021905703640507478'
  },
  {
    name: '芸香陈皮绿豆沙',
    source_herb: '芸香草',
    ingredients: ['芸香草10g', '陈皮5g', '绿豆200g', '冰糖适量'],
    effect: '祛风除湿，清热解毒',
    suitable: '风寒湿痹、暑湿感冒、咽喉肿痛者',
    method: '将绿豆洗净，浸泡2小时；芸香草、陈皮洗净，晾干。将绿豆、芸香草、陈皮一同放入砂锅中，加适量清水，大火煮沸后，改用小火炖至绿豆熟烂，加入冰糖调味即可。',
    source_url: 'https://zhuanlan.zhihu.com/p/2021905703640507478'
  },
  
  // ========== 苍耳子 ==========
  {
    name: '苍耳辛夷煲鸡蛋',
    source_herb: '苍耳子',
    ingredients: ['苍耳子10g', '辛夷10g', '鸡蛋2个', '生姜3片', '食盐少许'],
    effect: '祛风散寒，通鼻窍',
    suitable: '风寒感冒、鼻塞、流涕、头痛者',
    method: '将苍耳子、辛夷洗净，晾干，放入干净的纱布袋中，扎紧袋口；鸡蛋洗净，放入砂锅中，加入苍耳子、辛夷、生姜，加适量清水，大火煮沸后，改用小火煲30分钟，取出鸡蛋，剥壳后再放入砂锅中，继续煲10分钟，加入食盐调味即可。',
    source_url: 'https://zhuanlan.zhihu.com/p/2017162829334079070'
  },
  {
    name: '苍耳子防风粥',
    source_herb: '苍耳子',
    ingredients: ['苍耳子10g', '防风10g', '粳米100g'],
    effect: '祛风散寒，解表止痛',
    suitable: '风寒感冒、头痛、身痛者',
    method: '先将苍耳子、防风洗净，加水煎煮，去渣取汁；再将粳米淘洗干净，加入药汁中，同煮为粥。',
    source_url: 'https://zhuanlan.zhihu.com/p/2017162829334079070'
  },
  {
    name: '苍耳子猪蹄汤',
    source_herb: '苍耳子',
    ingredients: ['苍耳子10g', '猪蹄2只', '生姜5片', '食盐适量'],
    effect: '祛风散寒，通络止痛',
    suitable: '风寒湿痹、关节疼痛、麻木者',
    method: '将猪蹄洗净，切块，焯水去血沫；苍耳子、生姜洗净。将猪蹄、苍耳子、生姜一同放入砂锅中，加适量清水，大火煮沸后，改用小火炖至猪蹄熟烂，加入食盐调味即可。',
    source_url: 'https://zhuanlan.zhihu.com/p/2017162829334079070'
  },
  {
    name: '苍耳子茶',
    source_herb: '苍耳子',
    ingredients: ['苍耳子10g', '绿茶3g'],
    effect: '祛风散寒，通鼻窍',
    suitable: '风寒感冒、鼻塞、流涕、头痛者',
    method: '将苍耳子洗净，晾干，捣碎，与绿茶一同放入杯中，冲入沸水，加盖焖泡10分钟后即可饮用。',
    source_url: 'https://zhuanlan.zhihu.com/p/2017162829334079070'
  },
  
  // ========== 辛夷 ==========
  {
    name: '辛夷花煮鸡蛋',
    source_herb: '辛夷',
    ingredients: ['辛夷花10-15g（纱布包）', '鸡蛋2个', '生姜3片', '红糖适量'],
    effect: '温通鼻窍，发散风寒',
    suitable: '各类鼻炎患者，尤其过敏性鼻炎',
    method: '辛夷花与生姜、清水煮15分钟，放入鸡蛋煮熟，去壳扎孔再煮5分钟，吃蛋喝汤。每日1次连服7-10天。',
    source_url: 'https://zhuanlan.zhihu.com/p/2015728787808085374'
  },
  {
    name: '辛夷猪肺汤',
    source_herb: '辛夷',
    ingredients: ['辛夷15g（纱布包）', '猪肺400g', '瘦肉100g', '生姜3片'],
    effect: '补肺通窍，化痰止咳',
    suitable: '风寒犯肺、鼻塞流脓涕者',
    method: '猪肺反复灌洗切块焯水后与辛夷、瘦肉、生姜同炖3小时调味食用。每周2-3次。',
    source_url: 'https://zhuanlan.zhihu.com/p/2015728787808085374'
  },
  {
    name: '苍耳子辛夷花芥菜汤',
    source_herb: '辛夷',
    ingredients: ['辛夷花20g（纱布包）', '苍耳子20g（纱布包）', '芥菜640g', '蜜枣20g', '生姜3g'],
    effect: '祛风通窍，利气豁痰，消暑利尿',
    suitable: '鼻窦炎、鼻流脓涕者，夏季饮用尤佳',
    method: '辛夷、苍耳子纱布包裹与芥菜、蜜枣、姜片炖煮45分钟。',
    source_url: 'https://zhuanlan.zhihu.com/p/2015728787808085374'
  },
  {
    name: '辛夷花茶',
    source_herb: '辛夷',
    ingredients: ['辛夷花3-5g（纱布包）', '蜂蜜适量'],
    effect: '通鼻窍，散风寒',
    suitable: '风寒感冒初期鼻塞头痛者',
    method: '辛夷花开水冲泡加盖焖10分钟加蜂蜜调味。每日1剂分2-3次饮用。',
    source_url: 'https://zhuanlan.zhihu.com/p/2015728787808085374'
  },
  {
    name: '辛夷花粥',
    source_herb: '辛夷',
    ingredients: ['辛夷花5g（纱布包）', '粳米100g', '生姜3片'],
    effect: '散风寒，通鼻窍，温中暖胃',
    suitable: '风寒头痛、鼻塞、胃寒者',
    method: '辛夷花先煎取汁与粳米、生姜同煮成粥。早餐或晚餐食用连服10-15天。',
    source_url: 'https://zhuanlan.zhihu.com/p/2015728787808085374'
  }
]

module.exports = zhihuRecipes