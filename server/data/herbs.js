const herbs = [
  {
    id: 1,
    name: '人参',
    pinyin: 'rén shēn',
    alias: ['棒槌', '山参', '园参'],
    category: '补虚药',
    nature: '微温',
    taste: '甘、微苦',
    meridian: '脾、肺、心、肾经',
    effect: '大补元气，复脉固脱，补脾益肺，生津养血，安神益智',
    indication: '体虚欲脱，肢冷脉微，脾虚食少，肺虚喘咳，津伤口渴，内热消渴，气血亏虚，久病虚羸，惊悸失眠，阳痿宫冷',
    dosage: '3~9g，另煎兑服；也可研粉吞服，一次2g，一日2次',
    taboo: '不宜与藜芦、五灵脂同用。实证、热证而正气不虚者忌服',
    identify_points: '主根呈纺锤形或圆柱形，长3~15cm，直径1~2cm。表面灰黄色，上部或全体有疏浅断续的粗横纹及明显的纵皱，下部有支根2~3条，并着生多数细长的须根，须根上常有不明显的细小疣状突出。',
    key_identification: {
      smell: '特异香气，味微苦、甘',
      texture: '质较硬，断面显粉性',
      cross_section: '淡黄白色，形成层环纹棕黄色，皮部有黄棕色的点状树脂道',
      outer_skin: '灰黄色，有疏浅断续的粗横纹及纵皱，须根上有细小疣状突出（珍珠点）',
      other: '芦头（根茎）明显，具不定根（艼）和茎痕（芦碗）'
    },
    imageType: 'root',
    keywords: ['人参', '山参', '根', 'ginseng', 'ren shen'],
    classics: [
      { book: '《神农本草经》', content: '味甘，微寒。主补五脏，安精神，定魂魄，止惊悸，除邪气，明目，开心益智。久服，轻身延年。' },
      { book: '《本草纲目》', content: '治男妇一切虚证，发热自汗，眩晕头痛，反胃吐食，痎疟，滑泻久痢，小便频数，淋沥，劳倦内伤，中风，中暑，痿痹，吐血，嗽血，下血，血淋，血崩，胎前产后诸病。' },
      { book: '《名医别录》', content: '微温，无毒。主治肠胃中冷，心腹鼓痛，胸胁逆满，霍乱吐逆，调中，止消渴通血脉，破坚积，令人不忘。' }
    ],
    food_match: [1, 2, 3]
  },
  {
    id: 2,
    name: '枸杞',
    pinyin: 'gǒu qǐ',
    alias: ['枸杞子', '苟起子', '红耳坠'],
    category: '补虚药',
    nature: '平',
    taste: '甘',
    meridian: '肝、肾经',
    effect: '滋补肝肾，益精明目',
    indication: '虚劳精亏，腰膝酸痛，眩晕耳鸣，阳萎遗精，内热消渴，血虚萎黄，目昏不明',
    dosage: '6~12g',
    taboo: '外邪实热，脾虚有湿及泄泻者忌服',
    identify_points: '本品呈类纺锤形或椭圆形，长6~20mm，直径3~10mm。表面红色或暗红色，顶端有小突起状的花柱痕，基部有白色的果梗痕。',
    key_identification: {
      smell: '气微，味甜、微酸',
      texture: '质柔软湿润，略有黏性',
      cross_section: '果肉柔软，内含多数黄色肾形种子',
      outer_skin: '红色或暗红色，有光泽，表面有不规则皱纹',
      other: '顶端有花柱痕凸起，基部有白色果梗痕，水泡后易膨胀'
    },
    imageType: 'fruit',
    keywords: ['枸杞', '枸杞果', '红色', '果实', 'gouqi', 'wolfberry'],
    classics: [
      { book: '《神农本草经》', content: '味苦，寒。主五内邪气，热中消渴，周痹。久服，坚筋骨，轻身不老。' },
      { book: '《本草纲目》', content: '滋肾，润肺，明目。枸杞子，甘平而润，性滋而补，不能退热，止能补肾润肺，生精益气。' },
      { book: '《药性论》', content: '能补益精诸不足，易颜色，变白，明目，安神。令人长寿。' }
    ],
    food_match: [4, 5, 6]
  },
  {
    id: 3,
    name: '黄芪',
    pinyin: 'huáng qí',
    alias: ['黄耆', '绵芪', '北芪'],
    category: '补虚药',
    nature: '微温',
    taste: '甘',
    meridian: '脾、肺经',
    effect: '补气升阳，固表止汗，利水消肿，生津养血，行滞通痹，托毒排脓，敛疮生肌',
    indication: '气虚乏力，食少便溏，中气下陷，久泻脱肛，便血崩漏，表虚自汗，气虚水肿，内热消渴，血虚萎黄，半身不遂，痹痛麻木，痈疽难溃，久溃不敛',
    dosage: '9~30g',
    taboo: '表实邪盛，气滞湿阻，食积停滞，痈疽初起或溃后热毒尚盛等实证，以及阴虚阳亢者，均须禁服',
    identify_points: '本品呈圆柱形，有的有分枝，上端较粗，长30~90cm，直径1~3.5cm。表面淡棕黄色或淡棕褐色，有不整齐的纵皱纹或纵沟。',
    key_identification: {
      smell: '气微，味微甜，嚼之有豆腥味',
      texture: '质硬而韧，不易折断，纤维性强',
      cross_section: '纤维性强，显粉性，皮部黄白色，木部淡黄色，有放射状纹理及裂隙（菊花心）',
      outer_skin: '淡棕黄色或淡棕褐色，有不整齐的纵皱纹或纵沟',
      other: '断面皮部与木部易分离（皮松肉紧），切片可见放射状纹理'
    },
    imageType: 'root',
    keywords: ['黄芪', '黄耆', '根', '切片', 'huangqi', 'astragalus'],
    classics: [
      { book: '《神农本草经》', content: '味甘，微温。主痈疽，久败疮，排脓止痛，大风癞疾，五痔，鼠瘘，补虚，小儿百病。' },
      { book: '《本草纲目》', content: '耆长也，黄耆色黄，为补药之长，故名。黄芪甘温纯阳，其用有五：补诸虚不足，一也；益元气，二也；壮脾胃，三也；去肌热，四也；排脓止痛，活血生血，内托阴疽，为疮家圣药，五也。' },
      { book: '《名医别录》', content: '无毒。主治妇人子脏风邪气，逐五脏间恶血，补丈夫虚损，五劳羸瘦，止渴，腹痛泄痢，益气，利阴气。' }
    ],
    food_match: [7, 8, 9]
  },
  {
    id: 4,
    name: '当归',
    pinyin: 'dāng guī',
    alias: ['干归', '秦归', '云归'],
    category: '补虚药',
    nature: '温',
    taste: '甘、辛',
    meridian: '肝、心、脾经',
    effect: '补血活血，调经止痛，润肠通便',
    indication: '血虚萎黄，眩晕心悸，月经不调，经闭痛经，虚寒腹痛，风湿痹痛，跌扑损伤，痈疽疮疡，肠燥便秘',
    dosage: '6~12g',
    taboo: '湿盛中满、大便泄泻者忌服',
    identify_points: '本品略呈圆柱形，下部有支根3~5条或更多，长15~25cm。表面黄棕色至棕褐色，具纵皱纹和横长皮孔样突起。',
    key_identification: {
      smell: '浓郁特异香气，味甘、辛、微苦',
      texture: '质柔韧，断面油润',
      cross_section: '黄白色或淡黄棕色，皮部厚，有裂隙及多数棕色油点（油室）',
      outer_skin: '黄棕色至棕褐色，有纵皱纹和横长皮孔样突起',
      other: '支根3~5条，主根（归头）膨大，断面有多数棕色油点（分泌腔）'
    },
    imageType: 'root',
    keywords: ['当归', '干归', '根', '补血', 'danggui', 'angelica'],
    classics: [
      { book: '《神农本草经》', content: '味甘，温。主咳逆上气，温疟，寒热，洗洗在皮肤中，妇人漏下绝子，诸恶疮疡，金疮，煮饮之。' },
      { book: '《本草纲目》', content: '当归调血，为女人要药，有思夫之意，故有当归之名。当归头，止血而上行；身，养血而中守；梢，破血而下流；全，活血而不走。' },
      { book: '《名医别录》', content: '味辛，大温，无毒。主温中，止痛，除客血内塞，中风痓，汗不出，湿痹，中恶，客气虚冷，补五脏，生肌肉。' }
    ],
    food_match: [10, 11, 12]
  },
  {
    id: 5,
    name: '金银花',
    pinyin: 'jīn yín huā',
    alias: ['忍冬花', '双花', '二宝花'],
    category: '清热药',
    nature: '寒',
    taste: '甘',
    meridian: '肺、心、胃经',
    effect: '清热解毒，疏散风热',
    indication: '痈肿疔疮，喉痹，丹毒，热毒血痢，风热感冒，温病发热',
    dosage: '6~15g',
    taboo: '脾胃虚寒及气虚疮疡脓清者忌服',
    identify_points: '本品呈棒状，上粗下细，略弯曲，长2~3cm，上部直径约3mm，下部直径约1.5mm。表面黄白色或绿白色，密被短柔毛。',
    key_identification: {
      smell: '气清香，味淡、微苦',
      texture: '质柔软，手捏有弹性',
      cross_section: '花冠筒内有雄蕊5枚，雌蕊1枚',
      outer_skin: '黄白色或绿白色，密被短柔毛',
      other: '初开白色（银花），后转黄色（金花），故称金银花；花萼绿色，5裂'
    },
    imageType: 'flower',
    keywords: ['金银花', '花', '黄色', '白色', 'jinyinhua', 'honeysuckle'],
    classics: [
      { book: '《本草纲目》', content: '金银花，善于化毒，故治痈疽、肿毒、疮癣、杨梅、风湿诸毒，诚为要药。毒未成者能散，毒已成者能溃。' },
      { book: '《名医别录》', content: '味甘，温，无毒。主寒热，身肿。久服轻身，长年益寿。' },
      { book: '《本草拾遗》', content: '主热毒，血痢，水痢。浓煎服之。' }
    ],
    food_match: [13, 14, 15]
  },
  {
    id: 6,
    name: '茯苓',
    pinyin: 'fú líng',
    alias: ['云苓', '松苓', '茯灵'],
    category: '利水渗湿药',
    nature: '平',
    taste: '甘、淡',
    meridian: '心、肺、脾、肾经',
    effect: '利水渗湿，健脾，宁心',
    indication: '水肿尿少，痰饮眩悸，脾虚食少，便溏泄泻，心神不安，惊悸失眠',
    dosage: '10~15g',
    taboo: '阴虚而无湿热、虚寒滑精、气虚下陷者慎服',
    identify_points: '本品呈类球形、椭圆形、扁圆形或不规则团块，大小不一。外皮薄而粗糙，棕褐色至黑褐色，有明显的皱缩纹理。',
    key_identification: {
      smell: '气微，味淡，嚼之粘牙',
      texture: '质坚体重，断面颗粒性',
      cross_section: '白色或淡棕色，颗粒性，有的中间有松根（茯神）',
      outer_skin: '棕褐色至黑褐色，薄而粗糙，有明显皱缩纹理',
      other: '体重质实，断面不平坦，呈颗粒状；嚼之粘牙为真品特征'
    },
    imageType: 'fungus',
    keywords: ['茯苓', '块', '白色', '菌类', 'fuling', 'poria'],
    classics: [
      { book: '《神农本草经》', content: '味甘，平。主胸胁逆气，忧恚，惊邪，恐悸，心下结痛，寒热烦满，咳逆，口焦舌干，利小便。久服，安魂养神，不饥延年。' },
      { book: '《本草纲目》', content: '茯苓，本草又言利小便，伐肾邪，至东垣、王海藏乃言小便多者能止，涩者能通，同朱砂能秘真元。' },
      { book: '《名医别录》', content: '无毒。止消渴，好唾，大腹淋沥，膈中痰水，水肿淋结。开胸腑，调脏气，伐肾邪，长阴，益气力，保神守中。' }
    ],
    food_match: [16, 17, 18]
  },
  {
    id: 7,
    name: '山药',
    pinyin: 'shān yào',
    alias: ['淮山药', '怀山药'],
    category: '补虚药',
    nature: '平',
    taste: '甘',
    meridian: '脾、肺、肾经',
    effect: '益气养阴，补脾肺肾，固精止带',
    indication: '脾虚食少，倦怠乏力，便溏泄泻，肺虚喘咳，肾虚遗精，带下，尿频，虚热消渴',
    dosage: '15~30g',
    taboo: '湿盛中满或有实邪、积滞者忌服',
    identify_points: '本品略呈圆柱形，弯曲而稍扁，长15~30cm，直径1.5~6cm。表面黄白色或淡黄色，有纵沟、纵皱纹及须根痕，偶有浅棕色外皮残留。',
    key_identification: {
      smell: '气微，味淡、微酸，嚼之发黏',
      texture: '体重，质坚实，不易折断',
      cross_section: '白色，粉性，有淡黄色小点组成的环纹（维管束）',
      outer_skin: '黄白色或淡黄色，有纵沟、纵皱纹及须根痕',
      other: ''
    },
    imageType: 'root',
    keywords: ['山药', '淮山', 'root', 'yam', 'shan yao'],
    classics: [
      { book: '《神农本草经》', content: '味甘，温。主伤中，补虚羸，除寒热邪气，补中益气力，长肌肉。久服，耳目聪明，轻身不饥延年。' },
      { book: '《本草纲目》', content: '益肾气，健脾胃，止泄痢，化痰涎，润皮毛。' }
    ],
    food_match: []
  },
  {
    id: 8,
    name: '大枣',
    pinyin: 'dà zǎo',
    alias: ['红枣', '干枣'],
    category: '补虚药',
    nature: '温',
    taste: '甘',
    meridian: '脾、胃、心经',
    effect: '补中益气，养血安神',
    indication: '脾虚乏力，食少便溏，妇人脏躁，精神不安',
    dosage: '6~15g',
    taboo: '湿盛中满、食积、虫积、龋齿作痛及痰热咳嗽者忌服',
    identify_points: '本品呈椭圆形或球形，长2~3.5cm，直径1.5~2.5cm。表面暗红色，略带光泽，有不规则皱纹。基部凹陷，有短果梗。',
    key_identification: {
      smell: '气微香，味甜',
      texture: '果肉柔软，略黏手',
      cross_section: '果肉黄棕色，中心有一纵沟，顶端有花柱残痕',
      outer_skin: '暗红色，略带光泽，有不规则皱纹',
      other: ''
    },
    imageType: 'fruit',
    keywords: ['大枣', '红枣', 'fruit', 'jujube', 'date', 'da zao'],
    classics: [
      { book: '《神农本草经》', content: '味甘，平。主心腹邪气，安中养脾，助十二经。平胃气，通九窍，补少气，少津液，身中不足，大惊，四肢重，和百药。久服轻身长年。' },
      { book: '《本草纲目》', content: '大枣气味甘温，能补脾胃，益气生津，调营卫，解药毒。' }
    ],
    food_match: []
  },
  {
    id: 9,
    name: '桂圆',
    pinyin: 'guì yuán',
    alias: ['龙眼', '龙眼肉'],
    category: '补虚药',
    nature: '温',
    taste: '甘',
    meridian: '心、脾经',
    effect: '补益心脾，养血安神',
    indication: '气血不足，心悸怔忡，健忘失眠，血虚萎黄',
    dosage: '9~15g',
    taboo: '湿盛中满或有停饮、痰、火者忌服',
    identify_points: '本品为纵向破裂的不规则薄片，常数片粘结。长约1.5cm，宽2~4cm，厚约0.1cm。棕褐色，半透明。',
    key_identification: {
      smell: '气香，味甜',
      texture: '质柔润',
      cross_section: '棕褐色，半透明',
      outer_skin: '',
      other: ''
    },
    imageType: 'fruit',
    keywords: ['桂圆', '龙眼', 'fruit', 'longan', 'gui yuan'],
    classics: [
      { book: '《神农本草经》', content: '味甘，平。主五脏邪气，安志厌食。久服强魂聪明，轻身不老，通神明。' },
      { book: '《本草纲目》', content: '食品以荔枝为贵，而资益则龙眼为良。盖荔枝性热，而龙眼性和平也。' }
    ],
    food_match: []
  },
  {
    id: 10,
    name: '百合',
    pinyin: 'bǎi hé',
    alias: ['白百合', '百合干'],
    category: '补虚药',
    nature: '微寒',
    taste: '甘',
    meridian: '心、肺经',
    effect: '养阴润肺，清心安神',
    indication: '阴虚燥咳，劳嗽咯血，虚烦惊悸，失眠多梦，精神恍惚',
    dosage: '6~12g',
    taboo: '风寒咳嗽及中寒便溏者忌服',
    identify_points: '本品呈长椭圆形，长2~5cm，宽1~2cm，中部厚1.3~4mm。表面类白色、淡棕黄色或微带紫色，有数条纵直平行的白色维管束。',
    key_identification: {
      smell: '气微，味微苦',
      texture: '质硬而脆，易折断',
      cross_section: '较平坦，角质样',
      outer_skin: '类白色、淡棕黄色或微带紫色',
      other: ''
    },
    imageType: 'bulb',
    keywords: ['百合', 'bulb', 'lily', 'bai he'],
    classics: [
      { book: '《神农本草经》', content: '味甘，平。主邪气腹胀，心痛，利大小便，补中益气。' },
      { book: '《本草纲目》', content: '百合之根，以众瓣合成也。或云专治百合病，故名。' }
    ],
    food_match: []
  },
  {
    id: 11,
    name: '莲子',
    pinyin: 'lián zǐ',
    alias: ['莲实', '莲米'],
    category: '补虚药',
    nature: '平',
    taste: '甘、涩',
    meridian: '脾、肾、心经',
    effect: '补脾止泻，益肾涩精，养心安神',
    indication: '脾虚泄泻，遗精滑精，心悸失眠',
    dosage: '6~15g',
    taboo: '中满痞胀及大便燥结者忌服',
    identify_points: '本品略呈椭圆形或类球形，长1.2~1.8cm，直径0.8~1.4cm。表面浅黄棕色至红棕色，有细纵纹和较宽的脉纹。一端中心呈乳头状突起，深棕色，多有裂口，其周边略下陷。',
    key_identification: {
      smell: '气微，味甘、微涩',
      texture: '质硬，种皮薄，不易剥离',
      cross_section: '子叶2，黄白色，肥厚，中有空隙，具绿色莲子心',
      outer_skin: '浅黄棕色至红棕色，有细纵纹和较宽的脉纹',
      other: ''
    },
    imageType: 'seed',
    keywords: ['莲子', 'lotus', 'seed', 'lian zi'],
    classics: [
      { book: '《神农本草经》', content: '味甘，平。主补中，养神，益气力。久服轻身耐老，不饥延年。' },
      { book: '《本草纲目》', content: '莲子味甘，气温而性涩，禀清芳之气，得稼穑之味，乃脾之果也。' }
    ],
    food_match: []
  },
  {
    id: 12,
    name: '生姜',
    pinyin: 'shēng jiāng',
    alias: ['姜', '鲜姜'],
    category: '解表药',
    nature: '微温',
    taste: '辛',
    meridian: '肺、脾、胃经',
    effect: '解表散寒，温中止呕，化痰止咳，解毒',
    indication: '风寒感冒，胃寒呕吐，寒痰咳嗽',
    dosage: '3~10g',
    taboo: '阴虚火旺者忌服',
    identify_points: '本品呈不规则块状，略扁，具指状分枝，长4~18cm，厚1~3cm。表面黄褐色或灰棕色，有环节，分枝顶端有茎痕或芽。',
    key_identification: {
      smell: '有特异香气，味辛辣',
      texture: '质脆，易折断',
      cross_section: '浅黄色，内皮层环纹明显，维管束散在',
      outer_skin: '黄褐色或灰棕色，有环节',
      other: ''
    },
    imageType: 'root',
    keywords: ['生姜', 'ginger', 'root', 'sheng jiang'],
    classics: [
      { book: '《神农本草经》', content: '味辛，温。主胸满咳逆上气，温中止血，出汗，逐风湿痹，肠澼下利。生者尤良。久服去臭气，通神明。' },
      { book: '《本草纲目》', content: '姜，辛而不荤，去邪辟恶，生啖熟食，醋、酱、糟、盐、蜜煎调和，无不宜之。' }
    ],
    food_match: []
  },
  {
    id: 13,
    name: '肉桂',
    pinyin: 'ròu guì',
    alias: ['桂皮', '官桂'],
    category: '温里药',
    nature: '大热',
    taste: '辛、甘',
    meridian: '肾、脾、心、肝经',
    effect: '补火助阳，散寒止痛，温通经脉',
    indication: '阳痿宫冷，腰膝冷痛，肾虚作喘，阳虚眩晕，心腹冷痛，寒疝腹痛，寒痹腰痛，经闭痛经',
    dosage: '1~5g',
    taboo: '阴虚火旺，里有实热，血热妄行出血及孕妇忌用',
    identify_points: '本品呈槽状或卷筒状，长30~40cm，宽或直径3~10cm，厚0.2~0.8cm。外表面灰棕色，稍粗糙，有不规则的细皱纹及横向突起的皮孔，有的可见灰白色的斑纹。',
    key_identification: {
      smell: '气香浓烈，味甜、辣',
      texture: '质硬而脆，易折断',
      cross_section: '断面不平坦，外层棕色而较粗糙，内层红棕色而油润，两层间有1条黄棕色的线纹',
      outer_skin: '灰棕色，有细皱纹及皮孔',
      other: ''
    },
    imageType: 'bark',
    keywords: ['肉桂', 'cinnamon', 'bark', 'rou gui'],
    classics: [
      { book: '《神农本草经》', content: '味辛，温。主上气咳逆，结气喉痹，吐吸，利关节，补中益气。久服通神，轻身不老。' },
      { book: '《本草纲目》', content: '肉桂下行，益火之原，此东垣所谓肾苦燥，急食辛以润之，开腠理，致津液，通其气者也。' }
    ],
    food_match: []
  },
  {
    id: 14,
    name: '麦冬',
    pinyin: 'mài dōng',
    alias: ['麦门冬'],
    category: '补虚药',
    nature: '微寒',
    taste: '甘、微苦',
    meridian: '心、肺、胃经',
    effect: '养阴生津，润肺清心',
    indication: '肺燥干咳，阴虚痨嗽，喉痹咽痛，津伤口渴，内热消渴，心烦失眠，肠燥便秘',
    dosage: '6~12g',
    taboo: '脾胃虚寒泄泻，胃有痰饮湿浊及暴感风寒咳嗽者均忌服',
    identify_points: '本品呈纺锤形，两端略尖，长1.5~3cm，直径0.3~0.6cm。表面黄白色或淡黄色，有细纵纹。',
    key_identification: {
      smell: '气微香，味甘、微苦',
      texture: '质柔韧，断面黄白色，半透明',
      cross_section: '黄白色，半透明，中柱细小',
      outer_skin: '黄白色或淡黄色，有细纵纹',
      other: ''
    },
    imageType: 'root',
    keywords: ['麦冬', 'maidenhair', 'root', 'mai dong'],
    classics: [
      { book: '《神农本草经》', content: '味甘，平。主心腹结气，伤中伤饱，胃络脉绝，羸瘦短气。久服轻身不老不饥。' },
      { book: '《本草纲目》', content: '麦冬，甘微苦微寒，滋养肺胃之阴，以培其本也。' }
    ],
    food_match: []
  },
  {
    id: 15,
    name: '沙参',
    pinyin: 'shā shēn',
    alias: ['南沙参', '北沙参'],
    category: '补虚药',
    nature: '微寒',
    taste: '甘、微苦',
    meridian: '肺、胃经',
    effect: '养阴清肺，益胃生津',
    indication: '肺热燥咳，阴虚劳嗽，干咳痰少，咽干鼻燥，胃阴不足，食少呕吐，口渴咽干',
    dosage: '9~15g',
    taboo: '虚寒证忌服',
    identify_points: '本品呈圆锥形或圆柱形，略扁，长7~27cm，直径0.8~3cm。表面黄白色或淡棕黄色，凹陷处常有残留粗皮，上部多有深陷横纹，呈断续的环状，下部有纵纹及纵沟。',
    key_identification: {
      smell: '气微，味微甘',
      texture: '质疏松，易折断',
      cross_section: '不平坦，黄白色，多裂隙',
      outer_skin: '黄白色或淡棕黄色，有深陷横纹',
      other: ''
    },
    imageType: 'root',
    keywords: ['沙参', 'bellflower', 'root', 'sha shen'],
    classics: [
      { book: '《神农本草经》', content: '味苦，微寒。主血积惊气，除寒热，补中益肺气。久服利人。' }
    ],
    food_match: []
  },
  {
    id: 16,
    name: '玉竹',
    pinyin: 'yù zhú',
    alias: ['萎蕤'],
    category: '补虚药',
    nature: '微寒',
    taste: '甘',
    meridian: '肺、胃经',
    effect: '养阴润燥，生津止渴',
    indication: '肺胃阴伤，燥热咳嗽，咽干口渴，内热消渴',
    dosage: '6~12g',
    taboo: '痰湿气滞者禁服，脾虚便溏者慎服',
    identify_points: '本品呈长圆柱形，略扁，少有分枝，长4~18cm，直径0.3~1.6cm。表面黄白色或淡黄棕色，半透明，具纵皱纹及微隆起的环节，有白色圆点状的须根痕和圆盘状茎痕。',
    key_identification: {
      smell: '气微，味甘，嚼之发黏',
      texture: '质硬而脆或稍软，易折断',
      cross_section: '角质样或显颗粒性',
      outer_skin: '黄白色或淡黄棕色，半透明',
      other: ''
    },
    imageType: 'root',
    keywords: ['玉竹', 'polygonatum', 'root', 'yu zhu'],
    classics: [
      { book: '《神农本草经》', content: '味甘，平。主中风暴热，不能动摇，跌筋结肉，诸不足。久服去面黑䵟，好颜色，润泽，轻身不老。' },
      { book: '《本草纲目》', content: '玉竹，性平，味甘，柔润可食。故朱肱《南阳活人书》治风温自汗身重，语言难出，用萎蕤汤以之为君药。' }
    ],
    food_match: []
  },
  {
    id: 17,
    name: '银耳',
    pinyin: 'yín ěr',
    alias: ['白木耳'],
    category: '补虚药',
    nature: '平',
    taste: '甘、淡',
    meridian: '肺、胃、肾经',
    effect: '滋阴润肺，养胃生津',
    indication: '肺热或肺燥咳嗽，痰少咽干，食欲不振，口干舌燥，病后体虚',
    dosage: '6~12g',
    taboo: '外感风寒、痰热咳嗽者忌用',
    identify_points: '本品由数片至10余片薄而多皱褶的瓣片组成，呈菊花形、牡丹形或球形，直径3~15cm。表面类白色或淡黄色，半透明。',
    key_identification: {
      smell: '气微，味淡',
      texture: '质硬而脆，易折断',
      cross_section: '角质样',
      outer_skin: '类白色或淡黄色，半透明',
      other: ''
    },
    imageType: 'fungi',
    keywords: ['银耳', 'tremella', 'fungi', 'yin er'],
    classics: [
      { book: '《本草纲目拾遗》', content: '银耳，味甘，淡，性平。滋阴生津，润肺养胃，益气和血，补脑强心。' }
    ],
    food_match: []
  },
  {
    id: 18,
    name: '薏苡仁',
    pinyin: 'yì yǐ rén',
    alias: ['薏米', '苡仁'],
    category: '利水渗湿药',
    nature: '凉',
    taste: '甘、淡',
    meridian: '脾、胃、肺经',
    effect: '利水渗湿，健脾止泻，清热排脓',
    indication: '水肿，脚气，小便不利，脾虚泄泻，湿痹拘挛，肺痈，肠痈',
    dosage: '9~30g',
    taboo: '脾虚无湿，大便燥结者及孕妇慎服',
    identify_points: '本品呈宽卵形或长椭圆形，长4~8mm，宽3~6mm。表面乳白色，光滑，偶有残存的黄褐色种皮。一端钝圆，另端较宽而微凹，有1淡棕色点状种脐。',
    key_identification: {
      smell: '气微，味微甜',
      texture: '质坚实，断面白色，粉性',
      cross_section: '白色，粉性',
      outer_skin: '乳白色，光滑',
      other: ''
    },
    imageType: 'seed',
    keywords: ['薏苡仁', 'coix', 'seed', 'yi yi ren'],
    classics: [
      { book: '《神农本草经》', content: '味甘，微寒。主筋急拘挛，不可屈伸，风湿痹，下气。久服轻身益气。' },
      { book: '《本草纲目》', content: '薏苡仁属土，阳明药也，故能健脾益胃。虚则补其母，故肺痿肺痈用之。筋骨之病，以治阳明为本，故拘挛筋急风痹者用之。' }
    ],
    food_match: []
  },
  {
    id: 19,
    name: '冬瓜',
    pinyin: 'dōng guā',
    alias: ['白瓜'],
    category: '利水渗湿药',
    nature: '凉',
    taste: '甘、淡',
    meridian: '肺、大肠、小肠、膀胱经',
    effect: '清热解暑，生津止渴，利尿消肿',
    indication: '水肿胀满，淋证，脚气，痰喘，暑热烦闷，消渴',
    dosage: '适量',
    taboo: '脾胃虚寒者不宜生食',
    identify_points: '果实呈长圆柱形或近球形，长25~60cm，直径10~25cm。表面深绿色、浅绿色或白色，光滑或被白粉。',
    key_identification: {
      smell: '气微，味淡',
      texture: '果肉白色，肥厚',
      cross_section: '果肉白色，有种子多数',
      outer_skin: '深绿色、浅绿色或白色',
      other: ''
    },
    imageType: 'fruit',
    keywords: ['冬瓜', 'wax gourd', 'fruit', 'dong gua'],
    classics: [
      { book: '《神农本草经》', content: '味甘，微寒。主益气，耐老，除寒热邪气。' },
      { book: '《本草纲目》', content: '冬瓜，性冷利，善解烦渴，涤秽除烦，消痰止嗽，解暑化热。' }
    ],
    food_match: []
  },
  {
    id: 20,
    name: '荷叶',
    pinyin: 'hé yè',
    alias: [],
    category: '清热药',
    nature: '平',
    taste: '苦',
    meridian: '肝、脾、胃经',
    effect: '清热解暑，升发清阳，凉血止血',
    indication: '暑热烦渴，暑湿泄泻，脾虚泄泻，血热吐衄，便血崩漏',
    dosage: '3~10g',
    taboo: '脾胃虚寒者慎用',
    identify_points: '本品呈半圆形或折扇形，展开后呈类圆形，直径20~50cm，全缘或稍呈波状。上表面深绿色或黄绿色，较粗糙；下表面淡灰棕色，较光滑，有粗脉21~22条，自中心向四周射出；中心有突起的叶柄残基。',
    key_identification: {
      smell: '气微，味微苦',
      texture: '质脆，易破碎',
      cross_section: '',
      outer_skin: '',
      other: ''
    },
    imageType: 'leaf',
    keywords: ['荷叶', 'lotus leaf', 'leaf', 'he ye'],
    classics: [
      { book: '《本草纲目》', content: '荷叶，气味俱薄，主治暑湿泄泻，眩晕，水气浮肿，雷头风。' }
    ],
    food_match: []
  },
  {
    id: 21,
    name: '陈皮',
    pinyin: 'chén pí',
    alias: ['橘皮'],
    category: '理气药',
    nature: '温',
    taste: '辛、苦',
    meridian: '脾、肺经',
    effect: '理气健脾，燥湿化痰',
    indication: '脘腹胀满，食少吐泻，咳嗽痰多',
    dosage: '3~10g',
    taboo: '气虚体燥、阴虚燥咳、吐血及内有实热者慎服',
    identify_points: '本品常剥成数瓣，基部相连，有的呈不规则的片状，厚1~4mm。外表面橙红色或红棕色，有细皱纹和凹下的油点；内表面浅黄白色，粗糙，附黄白色或黄棕色筋络状维管束。',
    key_identification: {
      smell: '香气浓郁，味辛、苦',
      texture: '质稍硬而脆',
      cross_section: '',
      outer_skin: '橙红色或红棕色，有细皱纹和油点',
      other: ''
    },
    imageType: 'peel',
    keywords: ['陈皮', 'tangerine peel', 'peel', 'chen pi'],
    classics: [
      { book: '《神农本草经》', content: '味辛，温。主胸中瘕热逆气，利水谷。久服去臭，下气，通神。' },
      { book: '《本草纲目》', content: '陈皮，苦能泄能燥，辛能散，温能和。其治百病，总是取其理气燥湿之功。' }
    ],
    food_match: []
  },
  {
    id: 22,
    name: '绿豆',
    pinyin: 'lǜ dòu',
    alias: [],
    category: '清热药',
    nature: '凉',
    taste: '甘',
    meridian: '心、胃经',
    effect: '清热解毒，消暑利水',
    indication: '暑热烦渴，咽喉肿痛，疮疡肿毒，水肿，小便不利',
    dosage: '15~30g',
    taboo: '脾胃虚寒者不宜过量',
    identify_points: '本品呈短圆柱形，长2.5~4mm，直径2.5~3mm。表面绿黄色或暗绿色，光滑，有光泽。一端有一白色的种脐。',
    key_identification: {
      smell: '气微，味甘',
      texture: '质坚硬，种皮薄，不易剥离',
      cross_section: '子叶2，肥厚，黄白色',
      outer_skin: '绿黄色或暗绿色，光滑',
      other: ''
    },
    imageType: 'seed',
    keywords: ['绿豆', 'mung bean', 'seed', 'lv dou'],
    classics: [
      { book: '《本草纲目》', content: '绿豆，消肿治痘之功虽同赤豆，而清热解毒之力过之。' }
    ],
    food_match: []
  },
  {
    id: 23,
    name: '山楂',
    pinyin: 'shān zhā',
    alias: ['红果', '山里红'],
    category: '消食药',
    nature: '微温',
    taste: '酸、甘',
    meridian: '脾、胃、肝经',
    effect: '消食化积，活血化瘀',
    indication: '肉食积滞，胃脘胀满，腹痛泄泻，瘀血经闭，产后瘀阻，心腹刺痛，疝气疼痛',
    dosage: '9~12g',
    taboo: '脾胃虚弱者慎服',
    identify_points: '本品为圆形片，皱缩不平，直径1~2.5cm，厚0.2~0.4cm。外皮红色，具皱纹，有灰白色小斑点。果肉深黄色至浅棕色。',
    key_identification: {
      smell: '气微清香，味酸、微甜',
      texture: '质硬',
      cross_section: '果肉深黄色至浅棕色，中部横切片具5粒浅黄色果核',
      outer_skin: '红色，具皱纹',
      other: ''
    },
    imageType: 'fruit',
    keywords: ['山楂', 'hawthorn', 'fruit', 'shan zha'],
    classics: [
      { book: '《本草纲目》', content: '山楂，酸甘微温，脾肺二经药也。能健脾消食，活血化瘀。' }
    ],
    food_match: []
  },
  {
    id: 24,
    name: '红花',
    pinyin: 'hóng huā',
    alias: ['红蓝花'],
    category: '活血化瘀药',
    nature: '温',
    taste: '辛',
    meridian: '心、肝经',
    effect: '活血通经，散瘀止痛',
    indication: '经闭，痛经，恶露不行，癥瘕痞块，胸痹心痛，瘀滞腹痛，胸胁刺痛，跌扑损伤，疮疡肿痛',
    dosage: '3~10g',
    taboo: '孕妇慎用',
    identify_points: '本品为不带子房的管状花，长1~2cm。表面红黄色或红色。花冠筒细长，先端5裂，裂片呈狭条形，长5~8mm。雄蕊5，花药聚合成筒状，黄白色。柱头长圆柱形，顶端微分叉。',
    key_identification: {
      smell: '气微香，味微苦',
      texture: '质柔软',
      cross_section: '',
      outer_skin: '',
      other: ''
    },
    imageType: 'flower',
    keywords: ['红花', 'safflower', 'flower', 'hong hua'],
    classics: [
      { book: '《本草纲目》', content: '红花，活血润燥，止痛散肿，通经。' }
    ],
    food_match: []
  },
  {
    id: 25,
    name: '丹参',
    pinyin: 'dān shēn',
    alias: ['紫丹参'],
    category: '活血化瘀药',
    nature: '微寒',
    taste: '苦',
    meridian: '心、肝、经',
    effect: '活血祛瘀，通经止痛，清心除烦，凉血消痈',
    indication: '胸痹心痛，脘腹胁痛，癥瘕积聚，热痹疼痛，心烦不眠，月经不调，痛经经闭，疮疡肿痛',
    dosage: '10~15g',
    taboo: '孕妇及月经过多者慎用',
    identify_points: '本品根茎短粗，顶端有时残留茎基。根数条，长圆柱形，略弯曲，有的分枝并具须状细根，长10~20cm，直径0.3~1cm。表面棕红色或暗棕红色，粗糙，具纵皱纹。',
    key_identification: {
      smell: '气微，味微苦涩',
      texture: '质硬而脆，易折断',
      cross_section: '皮部棕红色，木部灰黄色或紫褐色，有黄白色放射状纹理',
      outer_skin: '棕红色或暗棕红色，粗糙',
      other: ''
    },
    imageType: 'root',
    keywords: ['丹参', 'salvia', 'root', 'dan shen'],
    classics: [
      { book: '《神农本草经》', content: '味苦，微寒。主心腹邪气，肠鸣幽幽如走水，寒热积聚，破癥除瘕，止烦满，益气。' },
      { book: '《本草纲目》', content: '丹参，活血通经，排脓生新，止痛。' }
    ],
    food_match: []
  },
  {
    id: 26,
    name: '玫瑰花',
    pinyin: 'méi guī huā',
    alias: [],
    category: '理气药',
    nature: '温',
    taste: '甘、微苦',
    meridian: '肝、脾经',
    effect: '疏肝解郁，活血止痛',
    indication: '肝胃气痛，食少呕恶，月经不调，经前乳房胀痛',
    dosage: '3~6g',
    taboo: '阴虚火旺者慎用',
    identify_points: '本品略呈半球形或不规则团状，直径1~2.5cm。花瓣密集，呈长圆形，紫红色或淡紫红色，有的黄棕色。',
    key_identification: {
      smell: '香气浓郁，味微苦涩',
      texture: '体轻，质脆',
      cross_section: '',
      outer_skin: '',
      other: ''
    },
    imageType: 'flower',
    keywords: ['玫瑰花', 'rose', 'flower', 'mei gui hua'],
    classics: [
      { book: '《本草纲目拾遗》', content: '玫瑰花，理气解郁，活血散瘀。' }
    ],
    food_match: []
  },
  {
    id: 27,
    name: '香附',
    pinyin: 'xiāng fù',
    alias: ['莎草根'],
    category: '理气药',
    nature: '平',
    taste: '辛、微苦、微甘',
    meridian: '肝、脾、三焦经',
    effect: '疏肝解郁，理气宽中，调经止痛',
    indication: '肝郁气滞，胸胁胀痛，疝气疼痛，乳房胀痛，脾胃气滞，脘腹痞闷，胀满疼痛，月经不调，经闭痛经',
    dosage: '6~10g',
    taboo: '气虚无滞者慎服',
    identify_points: '本品多呈纺锤形，有的略弯曲，长2~3.5cm，直径0.5~1cm。表面棕褐色或黑褐色，有纵皱纹和6~10个略隆起的环节，节上有未除净的棕色毛须及须根断痕。',
    key_identification: {
      smell: '气香，味微苦',
      texture: '质硬，经蒸煮者断面黄棕色或红棕色，角质样；生晒者断面色白而显粉性',
      cross_section: '黄棕色或红棕色，角质样',
      outer_skin: '棕褐色或黑褐色，有纵皱纹和环节',
      other: ''
    },
    imageType: 'root',
    keywords: ['香附', 'nutgrass', 'root', 'xiang fu'],
    classics: [
      { book: '《本草纲目》', content: '香附之气平而不寒，香而能窜，其味多辛能散，微苦能降，微甘能和。' }
    ],
    food_match: []
  },
  {
    id: 28,
    name: '佛手',
    pinyin: 'fó shǒu',
    alias: ['佛手柑'],
    category: '理气药',
    nature: '温',
    taste: '辛、苦、酸',
    meridian: '肝、脾、胃、肺经',
    effect: '疏肝理气，和胃止痛，燥湿化痰',
    indication: '肝胃气滞，胸胁胀痛，胃脘痞满，食少呕吐，咳嗽痰多',
    dosage: '3~10g',
    taboo: '阴虚火旺者慎用',
    identify_points: '本品为类椭圆形或卵圆形的薄片，常皱缩或卷曲，长6~10cm，宽3~7cm，厚0.2~0.4cm。顶端稍宽，常有3~5个手指状的裂瓣，基部略窄，有的可见果梗痕。',
    key_identification: {
      smell: '气香，味微甜后苦',
      texture: '质硬而脆',
      cross_section: '',
      outer_skin: '',
      other: ''
    },
    imageType: 'fruit',
    keywords: ['佛手', 'citron', 'fruit', 'fo shou'],
    classics: [
      { book: '《本草纲目》', content: '佛手，气味清香，性温，无毒。主治下气，除心头痰水。' }
    ],
    food_match: []
  },
  {
    id: 29,
    name: '防风',
    pinyin: 'fáng fēng',
    alias: ['关防风'],
    category: '解表药',
    nature: '微温',
    taste: '辛、甘',
    meridian: '膀胱、肝、脾经',
    effect: '祛风解表，胜湿止痛，止痉',
    indication: '感冒，头痛，发热，微恶风寒，风湿痹痛，风疹瘙痒，破伤风',
    dosage: '5~10g',
    taboo: '阴虚火旺，血虚发痉者慎用',
    identify_points: '本品呈长圆锥形或长圆柱形，下部渐细，长15~30cm，直径0.5~2cm。根头部有明显密集的环纹，习称"蚯蚓头"，环纹上有的有棕褐色毛状残存叶基。',
    key_identification: {
      smell: '气特异，味微甘',
      texture: '体轻，质松，易折断',
      cross_section: '皮部浅棕色，有裂隙，木部浅黄色',
      outer_skin: '灰棕色或棕褐色，粗糙，有纵皱纹、多数横长皮孔及点状突起的细根痕',
      other: ''
    },
    imageType: 'root',
    keywords: ['防风', 'saposhnikovia', 'root', 'fang feng'],
    classics: [
      { book: '《神农本草经》', content: '味甘，温。主大风，头眩痛，恶风，风邪，目盲无所见，风行周身，骨节疼痹，烦满。久服轻身。' },
      { book: '《本草纲目》', content: '防风，主治三十六般风，去上焦风邪，头目滞气，经络留湿，一身尽痛。' }
    ],
    food_match: []
  },
  {
    id: 30,
    name: '甘草',
    pinyin: 'gān cǎo',
    alias: ['国老'],
    category: '补虚药',
    nature: '平',
    taste: '甘',
    meridian: '心、肺、脾、胃经',
    effect: '益气补中，清热解毒，调和诸药',
    indication: '脾胃虚弱，倦怠乏力，心悸气短，咳嗽痰多，脘腹、四肢挛急疼痛，痈肿疮毒，缓解药物毒性、烈性',
    dosage: '2~10g',
    taboo: '不宜与海藻、京大戟、红大戟、甘遂、芫花同用',
    identify_points: '本品呈圆柱形，长25~100cm，直径0.6~3.5cm。外皮松紧不一。表面红棕色或灰棕色，具显著的纵皱纹、沟纹、皮孔及稀疏的细根痕。',
    key_identification: {
      smell: '气微，味甜而特殊',
      texture: '质坚实，断面略显纤维性',
      cross_section: '黄白色，粉性，形成层环明显，射线放射状，有的有裂隙',
      outer_skin: '红棕色或灰棕色，有纵皱纹',
      other: ''
    },
    imageType: 'root',
    keywords: ['甘草', 'licorice', 'root', 'gan cao'],
    classics: [
      { book: '《神农本草经》', content: '味甘，平。主五脏六腑寒热邪气，坚筋骨，长肌肉，倍力，金疮肿，解毒。久服轻身延年。' },
      { book: '《本草纲目》', content: '甘草，协和群品，有元老之功，普治百邪，得王道之化。' }
    ],
    food_match: []
  },
  {
    id: 31,
    name: '灵芝',
    pinyin: 'líng zhī',
    alias: ['赤芝', '紫芝'],
    category: '补虚药',
    nature: '平',
    taste: '甘',
    meridian: '心、肺、肝、肾经',
    effect: '补气安神，止咳平喘',
    indication: '心神不宁，失眠，惊悸，咳喘痰多，虚劳短气，不思饮食',
    dosage: '6~12g',
    taboo: '',
    identify_points: '本品外形呈伞状，菌盖肾形、半圆形或近圆形，直径10~18cm，厚1~2cm。皮壳坚硬，黄褐色至红褐色，有光泽，具环状棱纹和辐射状皱纹。',
    key_identification: {
      smell: '气微香，味苦涩',
      texture: '菌盖下表面菌肉白色至浅棕色，菌管孔面淡褐色至褐色',
      cross_section: '',
      outer_skin: '黄褐色至红褐色，有光泽',
      other: ''
    },
    imageType: 'fungi',
    keywords: ['灵芝', 'ganoderma', 'fungi', 'ling zhi'],
    classics: [
      { book: '《神农本草经》', content: '赤芝，味苦，平。主胸中结，益心气，补中，增智慧，不忘。久食，轻身不老，延年神仙。' }
    ],
    food_match: []
  }
]

module.exports = herbs
