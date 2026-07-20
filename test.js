
// ==================== 模拟数据 ====================
const HERB_DATA = [
  { id: 1, name: "黄芪", pinyin: "Huang Qi", alias: "黄耆、绵芪", category: "补气药", visual: "🟡", color: "herb-color-6", effect: "补气固表，利尿托毒，排脓，敛疮生肌", nature: "微温", taste: "甘", meridian: "肺、脾", keyIdentification: { smell: "有豆腥味", texture: "质硬而韧，不易折断", crossSection: "皮部黄白色，木部淡黄色，有放射状纹理及裂隙", outerSkin: "表面灰黄色或淡棕褐色，有不规则纵皱纹", other: "味微甜，嚼之有豆腥味" }, dosage: "9-30g", caution: "表实邪盛、气滞湿阻、食积停滞、阴虚阳亢、疮疡初起或溃后热毒尚盛等实证，均禁服", classics: [{ book: "《神农本草经》", content: "黄芪，味甘微温。主痈疽久败疮，排脓止痛，大风癞疾，五痔鼠瘘，补虚，小儿百病。" },{ book: "《名医别录》", content: "逐五脏间恶血，补丈夫虚损，五劳羸瘦，止渴，腹痛泄痢，益气，利阴气。" }] },
  { id: 2, name: "当归", pinyin: "Dang Gui", alias: "干归、秦归", category: "补血药", visual: "🟤", color: "herb-color-4", effect: "补血活血，调经止痛，润肠通便", nature: "温", taste: "甘、辛", meridian: "肝、心、脾", keyIdentification: { smell: "有浓郁香气", texture: "质柔韧，断面黄白色或淡黄棕色", crossSection: "皮部厚，有棕色油点，木部色较淡，形成层环黄棕色", outerSkin: "表面黄棕色至棕褐色，具纵皱纹和横长皮孔样突起", other: "味甘、辛、微苦" }, dosage: "6-12g", caution: "湿盛中满、大便溏泄者忌服", classics: [{ book: "《神农本草经》", content: "当归，味甘温。主咳逆上气，温疟寒热洗洗在皮肤中，妇人漏下绝子，诸恶疮疡金疮，煮饮之。" }] },
  { id: 3, name: "枸杞", pinyin: "Gou Qi Zi", alias: "杞子、红耳坠", category: "补阴药", visual: "🔴", color: "herb-color-2", effect: "滋补肝肾，益精明目", nature: "平", taste: "甘", meridian: "肝、肾", keyIdentification: { smell: "气微", texture: "质柔软而滋润", crossSection: "果肉柔软，种子类肾形", outerSkin: "表面鲜红色或暗红色，基部有白色果梗痕", other: "味甘" }, dosage: "6-12g", caution: "外邪实热、脾虚泄泻者慎服", classics: [{ book: "《神农本草经》", content: "枸杞，味苦寒。主五内邪气，热中消渴，周痹风湿。久服坚筋骨，轻身不老，耐寒暑。" }] },
  { id: 4, name: "人参", pinyin: "Ren Shen", alias: "棒槌、地精", category: "补气药", visual: "🧅", color: "herb-color-5", effect: "大补元气，复脉固脱，补脾益肺，生津养血，安神益智", nature: "微温", taste: "甘、微苦", meridian: "脾、肺、心", keyIdentification: { smell: "气微香而特异", texture: "质较硬，断面淡黄白色，显粉性", crossSection: "形成层环纹棕黄色，皮部有黄棕色点状树脂道", outerSkin: "表面灰黄色，上部或全体有疏浅断续的粗横纹及明显的纵皱", other: "味微苦、甘" }, dosage: "3-9g", caution: "实证、热证而正气不虚者忌服。反藜芦，畏五灵脂", classics: [{ book: "《神农本草经》", content: "人参，味甘微寒。主补五脏，安精神，定魂魄，止惊悸，除邪气，明目，开心益智。久服轻身延年。" }] },
  { id: 5, name: "白术", pinyin: "Bai Zhu", alias: "于术、冬术", category: "补气药", visual: "🟨", color: "herb-color-6", effect: "健脾益气，燥湿利水，止汗，安胎", nature: "温", taste: "甘、苦", meridian: "脾、胃", keyIdentification: { smell: "气清香", texture: "质坚硬，不易折断", crossSection: "断面不平坦，黄白色至淡棕色，有棕黄色的油点散在", outerSkin: "表面灰黄色或灰棕色，有瘤状突起及断续的纵皱和沟纹", other: "味甘、微辛，嚼之略带黏性" }, dosage: "6-12g", caution: "阴虚燥渴、气滞胀闷者忌服", classics: [{ book: "《神农本草经》", content: "白术，味苦温。主风寒湿痹，死肌，痉，疸，止汗，除热，消食。" }] },
  { id: 6, name: "茯苓", pinyin: "Fu Ling", alias: "云苓、松苓", category: "利水渗湿药", visual: "⚪", color: "herb-color-1", effect: "利水渗湿，健脾，宁心", nature: "平", taste: "甘、淡", meridian: "心、肺、脾、肾", keyIdentification: { smell: "气微", texture: "体重，质坚实，断面颗粒性", crossSection: "断面不平坦，有的具裂隙，外层淡棕色，内部白色", outerSkin: "表面棕褐色至黑褐色，有皱缩纹理", other: "味淡，嚼之粘牙" }, dosage: "10-15g", caution: "阴虚而无湿热、虚寒滑精、气虚下陷者慎服", classics: [{ book: "《神农本草经》", content: "茯苓，味甘平。主胸胁逆气，忧恚惊邪恐悸，心下结痛，寒热烦满，咳逆，口焦舌干，利小便。久服安魂养神。" }] },
  { id: 7, name: "甘草", pinyin: "Gan Cao", alias: "国老、甜草根", category: "补气药", visual: "🟫", color: "herb-color-4", effect: "补脾益气，清热解毒，祛痰止咳，缓急止痛，调和诸药", nature: "平", taste: "甘", meridian: "心、肺、脾、胃", keyIdentification: { smell: "气微，味甜而特殊", texture: "质坚实，断面略显纤维性，黄白色，粉性", crossSection: "形成层环明显，射线放射状，有的有裂隙", outerSkin: "表面红棕色或灰棕色，具显著的纵皱纹、沟纹及皮孔", other: "味甜而特殊" }, dosage: "2-10g", caution: "不宜与海藻、京大戟、红大戟、甘遂、芫花同用。湿盛胀满、水肿者不宜用", classics: [{ book: "《神农本草经》", content: "甘草，味甘平。主五脏六腑寒热邪气，坚筋骨，长肌肉，倍力，金疮肿，解毒。" }] },
  { id: 8, name: "丹参", pinyin: "Dan Shen", alias: "赤参、紫丹参", category: "活血化瘀药", visual: "🟥", color: "herb-color-2", effect: "活血祛瘀，通经止痛，清心除烦，凉血消痈", nature: "微寒", taste: "苦", meridian: "心、肝", keyIdentification: { smell: "气微", texture: "质硬而脆，易折断", crossSection: "断面疏松，有裂隙或略平整而致密，皮部棕红色，木部灰黄色或紫褐色", outerSkin: "表面棕红色或暗棕红色，粗糙，具纵皱纹", other: "味微苦涩" }, dosage: "10-15g", caution: "不宜与藜芦同用。月经过多者及无瘀血者慎服", classics: [{ book: "《神农本草经》", content: "丹参，味苦微寒。主心腹邪气，肠鸣幽幽如走水，寒热积聚，破癥除瘕，止烦满，益气。" }] },
  { id: 9, name: "生姜", pinyin: "Sheng Jiang", alias: "姜根、鲜姜", category: "解表药", visual: "🫚", color: "herb-color-3", effect: "解表散寒，温中止呕，化痰止咳，解鱼蟹毒", nature: "微温", taste: "辛", meridian: "肺、脾、胃", keyIdentification: { smell: "气香特异", texture: "质脆，易折断", crossSection: "断面浅黄色，内皮层环纹明显，维管束散在", outerSkin: "表面黄褐色或灰棕色，有环节，分枝顶端有茎痕或芽", other: "味辛辣" }, dosage: "3-10g", caution: "阴虚内热及实热证禁服", classics: [{ book: "《神农本草经》", content: "干姜，味辛温。主胸满咳逆上气，温中止血，出汗，逐风湿痹，肠澼下利。" }] }
];

const QUIZ_DATA = [
  { id: 1, question: "黄芪的主要功效是什么？", options: ["补气固表", "活血化瘀", "清热解毒", "利水渗湿"], answer: 0, explanation: "黄芪味甘微温，归脾肺经，具有补气固表、利尿托毒、排脓、敛疮生肌的功效。", difficulty: "简单", category: "中药学" },
  { id: 2, question: "当归的药用部位是？", options: ["根", "茎", "叶", "花"], answer: 0, explanation: "当归入药部位为伞形科植物当归的干燥根。", difficulty: "简单", category: "中药学" },
  { id: 3, question: "枸杞主要归哪些经？", options: ["心、肝", "肝、肾", "脾、胃", "肺、肾"], answer: 1, explanation: "枸杞味甘性平，归肝、肾经，具有滋补肝肾、益精明目的功效。", difficulty: "中等", category: "中药学" },
  { id: 4, question: "下列哪项不是甘草的功效？", options: ["补脾益气", "清热解毒", "活血化瘀", "调和诸药"], answer: 2, explanation: "甘草具有补脾益气、清热解毒、祛痰止咳、缓急止痛、调和诸药的功效，不具有活血化瘀作用。", difficulty: "中等", category: "中药学" },
  { id: 5, question: "茯苓的性味是？", options: ["甘、淡，平", "苦，寒", "辛，温", "甘、苦，微寒"], answer: 0, explanation: "茯苓味甘、淡，性平，归心、肺、脾、肾经。", difficulty: "简单", category: "中药学" },
  { id: 6, question: "丹参擅长治疗什么证型？", options: ["风寒感冒", "瘀血证", "脾虚泄泻", "肺虚咳嗽"], answer: 1, explanation: "丹参苦微寒，归心肝经，具有活血祛瘀、通经止痛的功效，擅长治疗瘀血证。", difficulty: "中等", category: "中药学" },
  { id: 7, question: "生姜的功效不包括？", options: ["解表散寒", "温中止呕", "化痰止咳", "补气养血"], answer: 3, explanation: "生姜具有解表散寒、温中止呕、化痰止咳、解鱼蟹毒的功效，不具有补气养血作用。", difficulty: "简单", category: "中药学" },
  { id: 8, question: "白术的主要功效是？", options: ["健脾益气", "补肾壮阳", "滋阴润燥", "清热泻火"], answer: 0, explanation: "白术苦甘温，归脾胃经，具有健脾益气、燥湿利水、止汗、安胎的功效。", difficulty: "中等", category: "中药学" },
  { id: 9, question: "与人参相反的药物是？", options: ["甘草", "藜芦", "茯苓", "当归"], answer: 1, explanation: "十八反中，诸参辛芍叛藜芦，人参反藜芦。", difficulty: "困难", category: "中药学" },
  { id: 10, question: "中药配伍中，\"相须\"是指？", options: ["两药合用增强疗效", "一种药减轻另一种的毒性", "两药合用产生不良反应", "一种药制约另一种的偏性"], answer: 0, explanation: "相须是指性能功效相类似的药物配合应用，可以增强原有疗效。", difficulty: "困难", category: "中药学" }
];

const DIET_DATA = [
  { id: 1, name: "当归羊肉汤", herb: "当归", type: "药膳汤品", effect: "温中补虚，祛寒止痛", suitable: "虚寒体质、产后血虚", ingredients: ["当归20g", "羊肉500g", "生姜30g", "大枣5枚"], method: "羊肉切块焯水，与当归、生姜、大枣同炖2小时，加盐调味。", season: "冬季", icon: "🍲" },
  { id: 2, name: "黄芪炖鸡", herb: "黄芪", type: "药膳汤品", effect: "补气固表，健脾益肺", suitable: "气虚体质、易感冒", ingredients: ["黄芪30g", "老母鸡1只", "大枣5枚", "生姜3片"], method: "鸡处理干净，与黄芪、大枣、生姜同炖1.5小时，加盐调味。", season: "四季皆宜", icon: "🍗" },
  { id: 3, name: "枸杞菊花茶", herb: "枸杞", type: "茶饮", effect: "滋补肝肾，明目清热", suitable: "用眼过度、肝肾虚", ingredients: ["枸杞10g", "菊花5g", "冰糖适量"], method: "将枸杞、菊花放入杯中，沸水冲泡10分钟，可加冰糖调味。", season: "四季皆宜", icon: "🍵" },
  { id: 4, name: "茯苓薏米粥", herb: "茯苓", type: "粥品", effect: "健脾祛湿，利水消肿", suitable: "湿气重、脾虚", ingredients: ["茯苓粉15g", "薏米30g", "大米50g", "红枣3枚"], method: "薏米、大米、红枣煮粥，将熟时加入茯苓粉搅匀，再煮5分钟。", season: "夏季", icon: "🥣" },
  { id: 5, name: "丹参山楂茶", herb: "丹参", type: "茶饮", effect: "活血化瘀，消食化积", suitable: "血瘀体质、高血脂", ingredients: ["丹参10g", "山楂10g", "红糖适量"], method: "丹参加水煎煮15分钟，取汁冲泡山楂，加红糖调味。", season: "四季皆宜", icon: "🍵" },
  { id: 6, name: "甘草大枣茶", herb: "甘草", type: "茶饮", effect: "补中益气，养心安神", suitable: "心脾两虚、失眠", ingredients: ["甘草5g", "大枣5枚", "小麦30g"], method: "甘草、大枣、小麦加水煎煮20分钟，取汁饮用。", season: "四季皆宜", icon: "🍵" }
];

const CONSTITUTION_QUICK_QUESTIONS = [
  { question: "您平时容易疲劳吗？", type: "气虚" },
  { question: "您手脚经常发凉吗？", type: "阳虚" },
  { question: "您感觉口干咽燥吗？", type: "阴虚" },
  { question: "您身体感觉沉重吗？", type: "痰湿" },
  { question: "您容易生痤疮或湿疹吗？", type: "湿热" },
  { question: "您皮肤容易出现瘀斑吗？", type: "血瘀" },
  { question: "您容易感到焦虑或抑郁吗？", type: "气郁" },
  { question: "您对某些食物或环境过敏吗？", type: "特禀" },
  { question: "您睡眠质量好吗？", type: "平和" }
];

const CONSTITUTION_STANDARD_QUESTIONS = [
  { question: "您平时容易疲劳吗？", type: "气虚" },
  { question: "您说话声音低弱无力吗？", type: "气虚" },
  { question: "您容易气短（呼吸短促、接不上气）吗？", type: "气虚" },
  { question: "您容易头晕或站起时眩晕吗？", type: "气虚" },
  { question: "您手脚经常发凉吗？", type: "阳虚" },
  { question: "您胃脘部、背部或腰膝部怕冷吗？", type: "阳虚" },
  { question: "您衣服穿得比别人多吗？", type: "阳虚" },
  { question: "您比一般人耐受不了寒冷吗？", type: "阳虚" },
  { question: "您感觉口干咽燥吗？", type: "阴虚" },
  { question: "您手心脚心发热吗？", type: "阴虚" },
  { question: "您皮肤或口唇干燥吗？", type: "阴虚" },
  { question: "您大便干燥吗？", type: "阴虚" },
  { question: "您身体感觉沉重吗？", type: "痰湿" },
  { question: "您腹部肥满松软吗？", type: "痰湿" },
  { question: "您额头油脂分泌多吗？", type: "痰湿" },
  { question: "您嘴里有黏黏的感觉吗？", type: "痰湿" },
  { question: "您容易生痤疮或湿疹吗？", type: "湿热" },
  { question: "您面部油亮有光泽吗？", type: "湿热" },
  { question: "您容易口苦口干吗？", type: "湿热" },
  { question: "您大便黏滞不爽吗？", type: "湿热" },
  { question: "您皮肤容易出现瘀斑吗？", type: "血瘀" },
  { question: "您皮肤不知不觉出现青紫瘀斑吗？", type: "血瘀" },
  { question: "您身体某处有固定的疼痛吗？", type: "血瘀" },
  { question: "您面色晦暗或容易出现褐斑吗？", type: "血瘀" },
  { question: "您容易感到焦虑或抑郁吗？", type: "气郁" },
  { question: "您情绪低沉、精神紧张吗？", type: "气郁" },
  { question: "您多愁善感、感情脆弱吗？", type: "气郁" },
  { question: "您胸胁部胀痛吗？", type: "气郁" },
  { question: "您对某些食物或环境过敏吗？", type: "特禀" },
  { question: "您不感冒也会打喷嚏吗？", type: "特禀" },
  { question: "您不感冒也会鼻塞流鼻涕吗？", type: "特禀" },
  { question: "您皮肤一抓就红并出现抓痕吗？", type: "特禀" },
  { question: "您精力充沛吗？", type: "平和" },
  { question: "您容易入睡吗？", type: "平和" },
  { question: "您大小便正常吗？", type: "平和" },
  { question: "您食欲好吗？", type: "平和" },
  { question: "您平时不易生病吗？", type: "平和" },
  { question: "您面色红润有光泽吗？", type: "平和" },
  { question: "您适应外界环境变化吗？", type: "平和" },
  { question: "您说话声音洪亮吗？", type: "平和" },
  { question: "您头发有光泽吗？", type: "平和" },
  { question: "您眼睛明亮吗？", type: "平和" },
  { question: "您舌苔薄白吗？", type: "平和" },
  { question: "您脉象和缓有力吗？", type: "平和" },
  { question: "您性格开朗吗？", type: "平和" },
  { question: "您平时工作生活压力大吗？", type: "平和" },
  { question: "您经常运动吗？", type: "平和" },
  { question: "您饮食规律吗？", type: "平和" },
  { question: "您经常熬夜吗？", type: "平和" },
  { question: "您抽烟喝酒吗？", type: "平和" },
  { question: "您每天喝水量足够吗？", type: "平和" },
  { question: "您经常吃蔬菜水果吗？", type: "平和" },
  { question: "您很少吃油腻辛辣食物吗？", type: "平和" },
  { question: "您经常晒太阳吗？", type: "平和" },
  { question: "您注意保暖吗？", type: "平和" },
  { question: "您劳逸结合吗？", type: "平和" },
  { question: "您人际关系好吗？", type: "平和" },
  { question: "您心态平和吗？", type: "平和" },
  { question: "您身体柔韧性好吗？", type: "平和" },
  { question: "您反应敏捷吗？", type: "平和" }
];

const CONSTITUTION_RESULTS = {
  "平和": { name: "平和质", icon: "😊", color: "#2d8b5e", description: "阴阳气血调和，体型匀称，面色红润，精力充沛", characteristics: ["精力充沛", "面色红润", "睡眠良好", "二便调畅", "适应力强"], diet: ["饮食多样化", "荤素搭配", "不偏食", "不过饥过饱", "少吃油腻辛辣"], exercise: ["跑步", "游泳", "太极拳", "散步", "瑜伽"], herbs: ["枸杞", "甘草", "茯苓"] },
  "气虚": { name: "气虚质", icon: "😮‍💨", color: "#F59E0B", description: "元气不足，容易疲乏，声音低弱，易出汗", characteristics: ["容易疲劳", "声音低弱", "易出汗", "气短懒言", "易感冒"], diet: ["多吃补气食物", "山药、大枣", "鸡肉、牛肉", "小米、糯米", "少吃生冷"], exercise: ["散步", "太极拳", "八段锦", "慢跑", "避免剧烈运动"], herbs: ["黄芪", "人参", "白术"] },
  "阳虚": { name: "阳虚质", icon: "🥶", color: "#3B82F6", description: "阳气不足，畏寒怕冷，手脚发凉，喜热饮食", characteristics: ["畏寒怕冷", "手脚发凉", "喜热饮食", "精神不振", "面色白"], diet: ["多吃温阳食物", "羊肉、牛肉", "生姜、韭菜", "核桃、栗子", "少吃生冷"], exercise: ["慢跑", "散步", "晒太阳", "太极拳", "避免大汗"], herbs: ["生姜", "当归", "人参"] },
  "阴虚": { name: "阴虚质", icon: "🥵", color: "#EF4444", description: "阴液亏少，口燥咽干，手足心热，易失眠", characteristics: ["口干咽燥", "手足心热", "失眠多梦", "大便干燥", "舌红少津"], diet: ["多吃滋阴食物", "百合、银耳", "梨、鸭肉", "枸杞、麦冬", "少吃辛辣"], exercise: ["太极拳", "瑜伽", "散步", "游泳", "避免剧烈运动"], herbs: ["枸杞", "丹参", "甘草"] },
  "痰湿": { name: "痰湿质", icon: "🤰", color: "#8B5CF6", description: "痰湿凝聚，体型肥胖，腹部肥满，口黏苔腻", characteristics: ["体型肥胖", "腹部肥满", "身体沉重", "口中黏腻", "苔厚腻"], diet: ["清淡饮食", "多吃蔬菜水果", "薏米、赤小豆", "冬瓜、荷叶", "少吃油腻甜腻"], exercise: ["快走", "慢跑", "游泳", "骑自行车", "长期坚持"], herbs: ["茯苓", "白术", "甘草"] },
  "湿热": { name: "湿热质", icon: "🌡️", color: "#F97316", description: "湿热内蕴，面垢油光，易生痤疮，口苦口干", characteristics: ["面垢油光", "易生痤疮", "口苦口干", "大便黏滞", "舌红苔黄"], diet: ["清淡饮食", "苦瓜、黄瓜", "绿豆、薏米", "莲子、茯苓", "少吃辛辣油腻"], exercise: ["跑步", "游泳", "爬山", "球类运动", "多出汗"], herbs: ["茯苓", "丹参", "甘草"] },
  "血瘀": { name: "血瘀质", icon: "🟣", color: "#A855F7", description: "血行不畅，肤色晦暗，易生瘀斑，口唇色暗", characteristics: ["肤色晦暗", "易生瘀斑", "口唇色暗", "固定疼痛", "脉涩"], diet: ["多吃活血食物", "山楂、醋", "玫瑰花", "黑豆、桃仁", "少吃寒凉"], exercise: ["快走", "慢跑", "舞蹈", "太极拳", "促进血液循环"], herbs: ["丹参", "当归", "甘草"] },
  "气郁": { name: "气郁质", icon: "😔", color: "#6366F1", description: "气机郁滞，情绪低沉，胸胁胀痛，善太息", characteristics: ["情绪低沉", "胸胁胀痛", "善太息", "容易焦虑", "睡眠差"], diet: ["多吃理气食物", "玫瑰花、茉莉花", "柑橘、佛手", "香菜、洋葱", "少吃酸涩"], exercise: ["户外活动", "跑步", "跳舞", "旅游", "多与人交流"], herbs: ["甘草", "茯苓", "枸杞"] },
  "特禀": { name: "特禀质", icon: "🤧", color: "#EC4899", description: "先天禀赋异常，过敏体质，易对药物食物过敏", characteristics: ["过敏体质", "易打喷嚏", "易起荨麻疹", "皮肤抓痕", "季节性发病"], diet: ["清淡均衡饮食", "少吃辛辣刺激", "少吃海鲜发物", "多吃蔬菜水果", "注意饮食禁忌"], exercise: ["适度运动", "散步", "太极拳", "避免剧烈运动", "注意环境"], herbs: ["甘草", "黄芪", "白术"] }
};

var currentPage = 'page-home';
var pageHistory = [];
var currentQuizIndex = 0;
var quizAnswers = {};
var constitutionQuestions = [];
var constitutionCurrentQuestion = 0;
var constitutionAnswers = [];
var currentCategory = '全部';
var llmStatus = { enabled: false, provider: '', model: '' };

var checkinRecords = [
  { date: getTodayDate(), herbId: 1, herbName: '黄芪', checked: true }
];

var identifyRecords = [
  { date: '2024-01-15 14:30', herbName: '枸杞', accuracy: 92 },
  { date: '2024-01-14 10:15', herbName: '当归', accuracy: 88 }
];

var chatHistoryData = [
  {
    id: 'demo-session-1',
    summary: '咳嗽有痰咨询',
    createdAt: '2024-01-15 14:30',
    diagnosis: '风寒咳嗽',
    prescription: '杏苏散加减',
    history: [
      { role: 'user', text: '医生你好，我最近咳嗽有痰，已经三天了' },
      { role: 'assistant', text: '您好，感谢您的咨询。为了更好地为您辨证，我需要了解更多信息：\n\n1. 痰是什么颜色的？（白/黄/清稀）\n2. 有没有怕冷或发热的情况？\n3. 嗓子痛不痛？有没有出汗？' },
      { role: 'user', text: '痰是白色的，有点怕冷，嗓子不痛' },
      { role: 'assistant', text: '根据您描述的症状：咳嗽白痰、怕冷、无咽痛，初步辨证为风寒咳嗽。\n\n风寒咳嗽是由于风寒之邪侵袭肺卫，导致肺气失宣所致。\n\n建议参考方剂：杏苏散加减\n\n【方药组成】\n• 杏仁 10g\n• 紫苏叶 6g\n• 半夏 10g\n• 茯苓 12g\n• 甘草 6g\n• 生姜 3片\n• 大枣 3枚\n\n【功效】 疏风散寒，宣肺化痰\n\n⚠️ 温馨提示：以上建议仅供学习参考，具体用药请咨询专业中医师。' }
    ]
  },
  {
    id: 'demo-session-2',
    summary: '脾胃虚弱调理',
    createdAt: '2024-01-12 09:15',
    diagnosis: '脾胃气虚',
    prescription: '四君子汤加减',
    history: [
      { role: 'user', text: '我最近胃口不好，吃一点就饱，还经常拉肚子' },
      { role: 'assistant', text: '您好，为了更准确地辨证，请问您：\n\n1. 这种情况持续多久了？\n2. 大便是什么样的？稀溏还是有水样？\n3. 有没有乏力、腹胀的感觉？\n4. 舌头颜色和舌苔怎么样？' },
      { role: 'user', text: '大概半个月了，大便稀溏，有时候一天两三次，人感觉乏力' },
      { role: 'assistant', text: '根据您描述的症状：食欲不振、食后腹胀、大便稀溏、神疲乏力，初步辨证为脾胃气虚证。\n\n脾胃气虚是由于脾胃功能虚弱，运化失常所致。\n\n建议参考方剂：四君子汤加减\n\n【方药组成】\n• 人参 10g（或党参15g）\n• 白术 12g\n• 茯苓 12g\n• 甘草 6g\n• 山药 15g\n• 炒扁豆 12g\n\n【功效】 益气健脾，和胃渗湿\n\n建议配合食疗：山药薏米粥、四神汤等健脾食物。\n\n⚠️ 温馨提示：以上建议仅供学习参考，具体用药请咨询专业中医师。' }
    ]
  }
];

const CHAT_HISTORY_DATA = chatHistoryData;

const MATCH_DATA = [
  { id: 1, name: '当归羊肉汤', herbIds: [2], effect: '温中补虚，祛寒止痛', ingredients: ['当归20g', '羊肉500g', '生姜30g', '大枣5枚'], method: '羊肉切块焯水，与当归、生姜、大枣同炖2小时，加盐调味。', caution: '湿热体质者不宜', tags: ['冬季', '补血', '温阳'] },
  { id: 2, name: '黄芪炖鸡', herbIds: [1], effect: '补气固表，健脾益肺', ingredients: ['黄芪30g', '老母鸡1只', '大枣5枚', '生姜3片'], method: '鸡处理干净，与黄芪、大枣、生姜同炖1.5小时，加盐调味。', caution: '实证热证者不宜', tags: ['补气', '健脾', '四季皆宜'] },
  { id: 3, name: '枸杞菊花茶', herbIds: [3], effect: '滋补肝肾，明目清热', ingredients: ['枸杞10g', '菊花5g', '冰糖适量'], method: '将枸杞、菊花放入杯中，沸水冲泡10分钟，可加冰糖调味。', caution: '脾胃虚寒者不宜过量', tags: ['茶饮', '明目', '四季皆宜'] },
  { id: 4, name: '茯苓薏米粥', herbIds: [6], effect: '健脾祛湿，利水消肿', ingredients: ['茯苓粉15g', '薏米30g', '大米50g', '红枣3枚'], method: '薏米、大米、红枣煮粥，将熟时加入茯苓粉搅匀，再煮5分钟。', caution: '阴虚者不宜', tags: ['粥品', '祛湿', '夏季'] },
  { id: 5, name: '丹参山楂茶', herbIds: [8], effect: '活血化瘀，消食化积', ingredients: ['丹参10g', '山楂10g', '红糖适量'], method: '丹参加水煎煮15分钟，取汁冲泡山楂，加红糖调味。', caution: '孕妇禁用，月经过多者不宜', tags: ['茶饮', '活血', '高血脂'] },
  { id: 6, name: '甘草大枣茶', herbIds: [7], effect: '补中益气，养心安神', ingredients: ['甘草5g', '大枣5枚', '小麦30g'], method: '甘草、大枣、小麦加水煎煮20分钟，取汁饮用。', caution: '湿盛胀满者不宜', tags: ['茶饮', '安神', '四季皆宜'] },
  { id: 7, name: '生姜红糖水', herbIds: [9], effect: '解表散寒，温中止呕', ingredients: ['生姜15g', '红糖20g', '葱白2根'], method: '生姜切片，与葱白加水煎煮10分钟，加入红糖调味。', caution: '热证者不宜', tags: ['茶饮', '散寒', '风寒感冒'] },
  { id: 8, name: '人参乌鸡汤', herbIds: [4], effect: '大补元气，养血安神', ingredients: ['人参10g', '乌鸡1只', '枸杞10g', '大枣5枚'], method: '乌鸡处理干净，与人参、枸杞、大枣同炖2小时，加盐调味。', caution: '实证热证者忌服', tags: ['补气', '养血', '冬季'] },
  { id: 9, name: '白术茯苓粥', herbIds: [5, 6], effect: '健脾益气，燥湿利水', ingredients: ['白术10g', '茯苓15g', '大米50g', '山药20g'], method: '白术、茯苓先煎取汁，加入大米、山药煮粥。', caution: '阴虚燥渴者不宜', tags: ['粥品', '健脾', '祛湿'] },
  { id: 10, name: '当归黄芪补血汤', herbIds: [2, 1], effect: '补气生血', ingredients: ['黄芪30g', '当归6g', '大枣5枚'], method: '黄芪、当归、大枣加水煎煮30分钟，取汁饮用。', caution: '阴虚发热者不宜', tags: ['汤品', '补血', '补气'] }
];

var FAVORITE_HERBS = [1, 3, 6];
var FAVORITE_MATCHES = [1, 3, 4];
var currentMatchHerb = null;
var currentDetailHerbId = null;
var currentMatchDetailId = null;

var constitutionRecords = [
  { type: '气虚质', date: '2024-01-10', score: 72 }
];

var CONSTITUTION_TYPES = {
  '平和': { color: '#2d8b5e' },
  '气虚': { color: '#F59E0B' },
  '阳虚': { color: '#3B82F6' },
  '阴虚': { color: '#EF4444' },
  '痰湿': { color: '#8B5CF6' },
  '湿热': { color: '#F97316' },
  '血瘀': { color: '#A855F7' },
  '气郁': { color: '#6366F1' },
  '特禀': { color: '#EC4899' }
};

function showPage(pageId, addToHistory) {
  if (addToHistory !== false && currentPage !== pageId) pageHistory.push(currentPage);
  document.querySelectorAll('.page').forEach(function(p){ p.classList.remove('active'); });
  var target = document.getElementById(pageId);
  if (target) { target.classList.add('active'); currentPage = pageId; }
  document.querySelectorAll('.tab-item').forEach(function(t){ t.classList.remove('active'); });
  var tabs = document.querySelectorAll('.tab-item');
  var map = { 'page-home': 0, 'page-identify': 1, 'page-herb-list': 2, 'page-match': 3, 'page-profile': 4 };
  if (map[pageId] !== undefined && tabs[map[pageId]]) tabs[map[pageId]].classList.add('active');
  window.scrollTo(0, 0);
  if (pageId === 'page-home') renderHome();
  if (pageId === 'page-herb-list') renderHerbList();
  if (pageId === 'page-match') renderMatchList();
  if (pageId === 'page-profile') renderProfile();
  if (pageId === 'page-quiz') renderQuiz();
  if (pageId === 'page-chat-history') renderChatHistory();
}
function goBack() {
  if (pageHistory.length > 0) { var prev = pageHistory.pop(); showPage(prev, false); }
  else showPage('page-home');
}
function getTodayDate() {
  var d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function getDailyHerb() {
  var idx = new Date().getDate() % HERB_DATA.length;
  return HERB_DATA[idx];
}
function getDailyQuiz() {
  var idx = new Date().getDate() % QUIZ_DATA.length;
  return QUIZ_DATA[idx];
}
function renderHome() {
  var dailyHerb = getDailyHerb();
  var dailyQuiz = getDailyQuiz();
  document.getElementById('daily-question').textContent = dailyQuiz.question;
  document.getElementById('daily-difficulty').textContent = dailyQuiz.difficulty;
  document.getElementById('daily-category').textContent = dailyQuiz.category;
  document.getElementById('daily-herb-name').textContent = dailyHerb.name;
  var effectParts = dailyHerb.effect.split('，');
  document.getElementById('daily-herb-effect').textContent = effectParts[0] + '，' + effectParts[1];
  var herbListEl = document.getElementById('herb-list');
  if (herbListEl && herbListEl.children.length === 0) {
    herbListEl.innerHTML = HERB_DATA.map(function(h){ return '<div class="herb-item" onclick="showHerbDetail('+h.id+')"><div class="herb-visual '+h.color+'"><div style="font-size:48px;">'+h.visual+'</div></div><div class="herb-info"><div class="name">'+h.name+'</div><div class="cat">'+h.category+'</div></div></div>'; }).join('');
  }
  var todayCheckin = checkinRecords.find(function(r){ return r.date === getTodayDate(); });
  var checkinBtn = document.getElementById('daily-checkin-btn');
  var statusEl = document.getElementById('daily-herb-status');
  if (todayCheckin && todayCheckin.checked) {
    if (checkinBtn) { checkinBtn.textContent = '✅ 已打卡'; checkinBtn.style.background = '#ccc'; checkinBtn.disabled = true; }
    if (statusEl) statusEl.textContent = '已学习';
  } else {
    if (checkinBtn) { checkinBtn.textContent = '立即打卡'; checkinBtn.style.background = 'linear-gradient(135deg, #2d8b5e, #3da878)'; checkinBtn.disabled = false; }
    if (statusEl) statusEl.textContent = '去学习';
  }
}
function handleDailyCheckin() {
  var today = getTodayDate();
  var idx = checkinRecords.findIndex(function(r){ return r.date === today; });
  var dailyHerb = getDailyHerb();
  if (idx >= 0) { checkinRecords[idx].checked = true; checkinRecords[idx].herbId = dailyHerb.id; checkinRecords[idx].herbName = dailyHerb.name; }
  else checkinRecords.unshift({ date: today, herbId: dailyHerb.id, herbName: dailyHerb.name, checked: true });
  renderHome();
  alert('打卡成功！\n今日学习药材：'+dailyHerb.name+'\n功效：'+dailyHerb.effect);
}
function goToDailyQuiz() { currentQuizIndex = new Date().getDate() % QUIZ_DATA.length; quizAnswers = {}; showPage('page-quiz'); }
function goToDailyHerbDetail() { showHerbDetail(getDailyHerb().id); }
function takePhoto() { simulateIdentify(); }
function chooseImage() { simulateIdentify(); }
function simulateIdentify() {
  var previewEl = document.getElementById('identify-preview');
  var resultEl = document.getElementById('identify-result');
  var randomHerb = HERB_DATA[Math.floor(Math.random() * HERB_DATA.length)];
  var accuracy = 85 + Math.floor(Math.random() * 15);
  previewEl.innerHTML = '<div class="preview-area"><div class="preview-mask"><div class="spinner"></div><div style="font-size:16px;">正在识别中...</div></div></div>';
  resultEl.innerHTML = '';
  setTimeout(function(){
    previewEl.innerHTML = '<div class="preview-area"><div style="font-size:120px;">'+randomHerb.visual+'</div></div>';
    resultEl.innerHTML = '<div class="recognition-result"><div class="result-header"><div class="result-name">'+randomHerb.name+'</div><div class="result-accuracy">'+accuracy+'%</div></div><div class="result-pinyin">'+randomHerb.pinyin+'</div><div class="result-effect">'+randomHerb.effect+'</div><div style="display:flex;gap:8px;margin-top:16px;"><button class="btn btn-primary" style="flex:1;" onclick="showHerbDetail('+randomHerb.id+')">查看详情</button><button class="btn btn-secondary" style="flex:1;" onclick="showPage(\'page-identify\')">重新识别</button></div></div><div class="card"><div class="section-title">鉴别要点</div><div style="font-size:13px;color:#666;line-height:1.8;"><p><strong>气味：</strong>'+randomHerb.keyIdentification.smell+'</p><p><strong>质地：</strong>'+randomHerb.keyIdentification.texture+'</p><p><strong>截面：</strong>'+randomHerb.keyIdentification.crossSection+'</p><p><strong>外皮：</strong>'+randomHerb.keyIdentification.outerSkin+'</p></div></div>';
    identifyRecords.unshift({ date: new Date().toLocaleString('zh-CN'), herbName: randomHerb.name, accuracy: accuracy });
  }, 1500);
}
function showHerbDetail(herbId) {
  var herb = HERB_DATA.find(function(h){ return h.id === herbId; });
  if (!herb) return;
  currentDetailHerbId = herbId;
  pageHistory.push(currentPage);
  showPage('page-detail', false);
  updateHerbFavBtn();
  var content = document.getElementById('detail-content');
  content.innerHTML = '<div class="herb-hero"><div class="hero-bg '+herb.color+'"><div style="font-size:140px;">'+herb.visual+'</div></div><div class="herb-overlay"></div><div class="herb-title-area"><div class="name">'+herb.name+'</div><div class="pinyin">'+herb.pinyin+'</div><div class="alias">别名：'+herb.alias+'</div></div></div><div class="card"><div class="section-title">基本信息</div><div class="info-row"><div class="info-item"><div class="label">类别</div><div class="value">'+herb.category+'</div></div><div class="info-item"><div class="label">性味</div><div class="value">'+herb.nature+' / '+herb.taste+'</div></div><div class="info-item"><div class="label">归经</div><div class="value">'+herb.meridian+'</div></div></div><div style="margin-top:8px;"><span class="label" style="font-size:12px;color:#999;">功效</span><div style="margin-top:4px;font-size:14px;color:#333;font-weight:500;">'+herb.effect+'</div></div><div style="margin-top:12px;"><span class="label" style="font-size:12px;color:#999;">用量</span><div style="margin-top:4px;font-size:14px;color:#333;">'+herb.dosage+'</div></div></div><div class="card"><div class="section-title">鉴别要点</div><div style="font-size:13px;color:#333;line-height:1.8;"><p><strong>气味：</strong>'+herb.keyIdentification.smell+'</p><p><strong>质地：</strong>'+herb.keyIdentification.texture+'</p><p><strong>截面：</strong>'+herb.keyIdentification.crossSection+'</p><p><strong>外皮：</strong>'+herb.keyIdentification.outerSkin+'</p><p><strong>其他：</strong>'+herb.keyIdentification.other+'</p></div></div><div class="card caution-card"><div class="section-title caution-title">⚠️ 使用禁忌</div><div class="section-content">'+herb.caution+'</div></div><div class="card"><div class="section-title">📚 典籍记载</div>'+herb.classics.map(function(c){ return '<div class="classics-item"><div class="classics-book">'+c.book+'</div><div class="classics-content">'+c.content+'</div></div>'; }).join('')+'</div><div style="padding:0 16px 16px;"><button class="btn btn-primary" onclick="goBack()">← 返回</button></div>';
}
function updateHerbFavBtn() {
  var btn = document.getElementById('detail-fav-btn');
  if (!btn) return;
  var isFav = FAVORITE_HERBS.indexOf(currentDetailHerbId) !== -1;
  btn.textContent = isFav ? '♥' : '♡';
  btn.className = 'fav-btn' + (isFav ? ' active' : '');
}
function toggleHerbFavorite() {
  if (!currentDetailHerbId) return;
  var idx = FAVORITE_HERBS.indexOf(currentDetailHerbId);
  if (idx !== -1) {
    FAVORITE_HERBS.splice(idx, 1);
  } else {
    FAVORITE_HERBS.push(currentDetailHerbId);
  }
  updateHerbFavBtn();
}
function renderQuiz() {
  var quiz = QUIZ_DATA[currentQuizIndex];
  var answered = quizAnswers[quiz.id];
  var html = '<div class="card"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;"><span style="font-size:13px;color:#999;">第 '+(currentQuizIndex+1)+' / '+QUIZ_DATA.length+' 题</span><span class="quiz-tag">'+quiz.difficulty+'</span></div><div class="quiz-question">'+quiz.question+'</div>';
  html += quiz.options.map(function(opt, i){
    var cls = 'option-item';
    var check = '';
    if (answered !== undefined) {
      if (i === quiz.answer) { cls += ' correct'; check = '✓'; }
      else if (i === answered && i !== quiz.answer) { cls += ' wrong'; check = '✗'; }
      else { cls += ' disabled'; }
    }
    return '<div class="'+cls+'" onclick="answerQuiz('+i+')" data-index="'+i+'"><div class="opt-letter">'+String.fromCharCode(65+i)+'</div><div class="opt-text">'+opt+'</div>'+(check?'<div class="opt-check">'+check+'</div>':'')+'</div>';
  }).join('') + '</div>';
  if (answered !== undefined) {
    html += '<div class="card"><div class="explanation"><div class="title">📖 解析</div><div class="text">'+quiz.explanation+'</div></div><div style="display:flex;gap:12px;"><button class="btn btn-secondary" style="flex:1;" onclick="prevQuiz()">← 上一题</button><button class="btn btn-primary" style="flex:1;" onclick="nextQuiz()">下一题 →</button></div></div>';
  }
  document.getElementById('quiz-content').innerHTML = html;
  updateQuizStats();
}
function answerQuiz(index) {
  var quiz = QUIZ_DATA[currentQuizIndex];
  if (quizAnswers[quiz.id] !== undefined) return;
  quizAnswers[quiz.id] = index;
  renderQuiz();
}
function nextQuiz() {
  if (currentQuizIndex < QUIZ_DATA.length - 1) { currentQuizIndex++; renderQuiz(); }
  else alert('🎉 恭喜完成所有题目！\n正确率：'+calculateAccuracy()+'%');
}
function prevQuiz() {
  if (currentQuizIndex > 0) { currentQuizIndex--; renderQuiz(); }
}
function calculateAccuracy() {
  var correct = 0, total = 0;
  Object.keys(quizAnswers).forEach(function(id){
    var q = QUIZ_DATA.find(function(q){ return q.id === parseInt(id); });
    if (q && quizAnswers[id] === q.answer) correct++;
    total++;
  });
  return total > 0 ? Math.round(correct / total * 100) : 0;
}
function updateQuizStats() {
  var correct = 0, total = Object.keys(quizAnswers).length;
  Object.keys(quizAnswers).forEach(function(id){
    var q = QUIZ_DATA.find(function(q){ return q.id === parseInt(id); });
    if (q && quizAnswers[id] === q.answer) correct++;
  });
  var elC = document.getElementById('stat-correct');
  var elT = document.getElementById('stat-total');
  var elA = document.getElementById('stat-accuracy');
  if (elC) elC.textContent = correct;
  if (elT) elT.textContent = total;
  if (elA) elA.textContent = total > 0 ? Math.round(correct / total * 100) + '%' : '0%';
}
function goToQuizList() { currentQuizIndex = 0; quizAnswers = {}; showPage('page-quiz'); }
function goToWrongQuestions() {
  var wrongIds = Object.keys(quizAnswers).filter(function(id){
    var q = QUIZ_DATA.find(function(q){ return q.id === parseInt(id); });
    return q && quizAnswers[id] !== q.answer;
  });
  if (wrongIds.length === 0) { alert('🎉 太棒了！目前没有错题记录'); return; }
  currentQuizIndex = QUIZ_DATA.findIndex(function(q){ return q.id === parseInt(wrongIds[0]); });
  showPage('page-quiz');
}
function renderMatchList() {
  var chipsEl = document.getElementById('match-herb-chips');
  if (chipsEl && chipsEl.children.length === 0) {
    chipsEl.innerHTML = '<div class="herb-chip active" onclick="filterMatchByHerb(null)">全部</div>' + HERB_DATA.map(function(h){ return '<div class="herb-chip" onclick="filterMatchByHerb('+h.id+')">'+h.name+'</div>'; }).join('');
  }
  var listEl = document.getElementById('match-list');
  var items = currentMatchHerb ? MATCH_DATA.filter(function(m){ return m.herbIds.indexOf(currentMatchHerb) !== -1; }) : MATCH_DATA;
  listEl.innerHTML = items.map(function(m){
    var isFav = FAVORITE_MATCHES.indexOf(m.id) !== -1;
    return '<div class="food-item" onclick="showMatchDetail('+m.id+')"><div class="food-visual herb-color-'+(m.id%6+1)+'"><div style="font-size:48px;">🍲</div></div><div class="food-info"><div class="name">'+m.name+'<span class="fav-icon-list '+(isFav?'active':'')+'" onclick="event.stopPropagation();toggleMatchFavorite('+m.id+')">'+(isFav?'♥':'♡')+'</span></div><div class="effect">'+m.effect+'</div><div class="ings">'+m.ingredients.slice(0,3).map(function(i){ return '<span>'+i+'</span>'; }).join('')+'</div></div></div>';
  }).join('');
}
function filterMatchByHerb(herbId) {
  currentMatchHerb = herbId;
  var chips = document.querySelectorAll('#match-herb-chips .herb-chip');
  chips.forEach(function(c){ c.classList.remove('active'); });
  var idx = herbId ? HERB_DATA.findIndex(function(h){ return h.id === herbId; }) + 1 : 0;
  if (chips[idx]) chips[idx].classList.add('active');
  renderMatchList();
}
function showMatchDetail(matchId) {
  var match = MATCH_DATA.find(function(m){ return m.id === matchId; });
  if (!match) return;
  currentMatchDetailId = matchId;
  var modal = document.getElementById('match-modal');
  var isFav = FAVORITE_MATCHES.indexOf(matchId) !== -1;
  document.getElementById('modal-bg').className = 'modal-bg herb-color-'+(match.id%6+1);
  document.getElementById('modal-bg').innerHTML = '<div style="font-size:80px;">🍲</div>';
  document.getElementById('modal-body').innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;"><div class="title">'+match.name+'</div><span class="fav-icon-modal '+(isFav?'active':'')+'" onclick="toggleMatchFavorite('+match.id+')">'+(isFav?'♥':'♡')+'</span></div><div class="detail-section"><div class="label">功效</div><div class="text">'+match.effect+'</div></div><div class="detail-section"><div class="label">食材</div><div class="ingredient-list">'+match.ingredients.map(function(i){ return '<span>'+i+'</span>'; }).join('')+'</div></div><div class="detail-section"><div class="label">做法</div><div class="method-text">'+match.method+'</div></div><div class="detail-section"><div class="label">适宜季节</div><div class="text">'+match.season+'</div></div><div class="detail-section caution"><div class="label">禁忌</div><div class="text">'+match.caution+'</div></div><div style="display:flex;gap:12px;margin-top:16px;"><button class="btn btn-primary" style="flex:1;" onclick="closeMatchModal()">关闭</button></div>';
  modal.classList.add('active');
}
function toggleMatchFavorite(matchId) {
  var id = matchId || currentMatchDetailId;
  if (!id) return;
  var idx = FAVORITE_MATCHES.indexOf(id);
  if (idx !== -1) {
    FAVORITE_MATCHES.splice(idx, 1);
  } else {
    FAVORITE_MATCHES.push(id);
  }
  if (currentPage === 'page-match') renderMatchList();
  if (currentMatchDetailId === id) {
    var modal = document.getElementById('match-modal');
    if (modal.classList.contains('active')) {
      showMatchDetail(id);
    }
  }
}
function closeMatchModal() { document.getElementById('match-modal').classList.remove('active'); }
function handleMatchSearchKey(e) { if (e.key === 'Enter') { var val = e.target.value.trim(); if (val) searchMatch(val); } }
function searchMatch(keyword) {
  var results = MATCH_DATA.filter(function(m){ return m.name.indexOf(keyword) !== -1 || m.effect.indexOf(keyword) !== -1 || m.ingredients.some(function(i){ return i.indexOf(keyword) !== -1; }) || m.tags.some(function(t){ return t.indexOf(keyword) !== -1; }); });
  var resultEl = document.getElementById('match-search-result');
  var listEl = document.getElementById('match-list');
  var sectionEl = document.getElementById('match-herb-section');
  if (results.length > 0) {
    listEl.style.display = 'none'; sectionEl.style.display = 'none'; resultEl.style.display = 'block';
    resultEl.innerHTML = '<div class="search-result-header"><span class="title">搜索结果</span><span class="count">共 '+results.length+' 个</span></div>' + results.map(function(m){ return '<div class="search-result-item" onclick="showMatchDetail('+m.id+')"><div class="result-visual herb-color-'+(m.id%6+1)+'"><div style="font-size:32px;">🍲</div></div><div class="result-info"><div class="result-name">'+m.name+'</div><div class="result-effect">'+m.effect+'</div></div></div>'; }).join('');
  } else {
    listEl.style.display = 'block'; sectionEl.style.display = 'block'; resultEl.style.display = 'none';
    alert('未找到相关搭配，请尝试其他关键词');
  }
}
function quickSearchMatch(keyword) { document.getElementById('match-search-input').value = keyword; searchMatch(keyword); }
function clearMatchSearch() {
  document.getElementById('match-search-input').value = '';
  document.getElementById('match-list').style.display = 'block';
  document.getElementById('match-herb-section').style.display = 'block';
  document.getElementById('match-search-result').style.display = 'none';
}
var CATEGORIES = ['全部', '补气药', '补血药', '补阴药', '活血化瘀药', '利水渗湿药', '解表药'];
var currentCategory = '全部';
function renderHerbList() {
  var tabsEl = document.getElementById('category-tabs');
  if (tabsEl && tabsEl.children.length === 0) {
    tabsEl.innerHTML = CATEGORIES.map(function(c, i){ return '<div class="category-tab '+(i===0?'active':'')+'" onclick="filterCategory(\''+c+'\')">'+c+'</div>'; }).join('');
  }
  var herbs = currentCategory === '全部' ? HERB_DATA : HERB_DATA.filter(function(h){ return h.category === currentCategory; });
  var contentEl = document.getElementById('herb-list-content');
  contentEl.innerHTML = herbs.map(function(h){ return '<div class="herb-list-card" onclick="showHerbDetail('+h.id+')"><div class="herb-visual '+h.color+'"><div style="font-size:48px;">'+h.visual+'</div></div><div class="herb-info"><div class="name">'+h.name+'</div><div class="effect">'+h.effect+'</div></div></div>'; }).join('');
}
function filterCategory(cat) {
  currentCategory = cat;
  document.querySelectorAll('.category-tab').forEach(function(t, i){ t.classList.toggle('active', CATEGORIES[i] === cat); });
  renderHerbList();
}
function handleHerbSearch() {
  var val = document.getElementById('herb-search-input').value.trim();
  if (!val) { renderHerbList(); return; }
  var herbs = HERB_DATA.filter(function(h){ return h.name.indexOf(val) !== -1 || h.alias.indexOf(val) !== -1 || h.pinyin.toLowerCase().indexOf(val.toLowerCase()) !== -1; });
  document.getElementById('herb-list-content').innerHTML = herbs.map(function(h){ return '<div class="herb-list-card" onclick="showHerbDetail('+h.id+')"><div class="herb-visual '+h.color+'"><div style="font-size:48px;">'+h.visual+'</div></div><div class="herb-info"><div class="name">'+h.name+'</div><div class="effect">'+h.effect+'</div></div></div>'; }).join('');
}
function openConstitutionTest(type) {
  constitutionCurrentQuestion = 0; constitutionAnswers = [];
  if (type === 'quick') constitutionQuestions = CONSTITUTION_QUICK_QUESTIONS.slice();
  else constitutionQuestions = CONSTITUTION_STANDARD_QUESTIONS.slice();
  document.getElementById('constitution-modal').style.display = 'flex';
  renderConstitutionQuestion();
}
function closeConstitutionTest() { document.getElementById('constitution-modal').style.display = 'none'; }
function renderConstitutionQuestion() {
  var q = constitutionQuestions[constitutionCurrentQuestion];
  var progress = ((constitutionCurrentQuestion + 1) / constitutionQuestions.length * 100).toFixed(0);
  document.getElementById('constitution-progress-text').textContent = (constitutionCurrentQuestion + 1) + ' / ' + constitutionQuestions.length;
  document.getElementById('constitution-progress-bar').style.width = progress + '%';
  document.getElementById('constitution-question').innerHTML = '<div style="font-size:16px;font-weight:600;color:#333;margin-bottom:20px;line-height:1.6;">'+q.question+'</div><div style="display:flex;flex-direction:column;gap:12px;"><button style="padding:14px;background:#f0f9f4;border:1.5px solid #2d8b5e;border-radius:10px;font-size:14px;color:#2d8b5e;cursor:pointer;font-weight:500;" onclick="answerConstitution(2)">是，经常如此</button><button style="padding:14px;background:#fff;border:1.5px solid #e2e8f0;border-radius:10px;font-size:14px;color:#666;cursor:pointer;" onclick="answerConstitution(1)">有时如此</button><button style="padding:14px;background:#fff;border:1.5px solid #e2e8f0;border-radius:10px;font-size:14px;color:#666;cursor:pointer;" onclick="answerConstitution(0)">很少或没有</button></div>';
  document.getElementById('constitution-prev').style.display = constitutionCurrentQuestion > 0 ? 'block' : 'none';
  document.getElementById('constitution-next').style.display = constitutionCurrentQuestion < constitutionQuestions.length - 1 ? 'block' : 'none';
  document.getElementById('constitution-submit').style.display = constitutionCurrentQuestion === constitutionQuestions.length - 1 ? 'block' : 'none';
}
function answerConstitution(score) {
  constitutionAnswers[constitutionCurrentQuestion] = { type: constitutionQuestions[constitutionCurrentQuestion].type, score: score };
  if (constitutionCurrentQuestion < constitutionQuestions.length - 1) { constitutionCurrentQuestion++; renderConstitutionQuestion(); }
}
function constitutionPrev() { if (constitutionCurrentQuestion > 0) { constitutionCurrentQuestion--; renderConstitutionQuestion(); } }
function constitutionNext() { if (constitutionCurrentQuestion < constitutionQuestions.length - 1) { constitutionCurrentQuestion++; renderConstitutionQuestion(); } }
function constitutionSubmit() {
  var scores = {};
  constitutionAnswers.forEach(function(a){ if (!scores[a.type]) scores[a.type] = 0; scores[a.type] += a.score; });
  var maxType = '平和', maxScore = -1;
  Object.keys(scores).forEach(function(t){ if (scores[t] > maxScore) { maxScore = scores[t]; maxType = t; } });
  var result = CONSTITUTION_TYPES[maxType];
  document.getElementById('constitution-question').innerHTML = '<div style="text-align:center;margin-bottom:20px;"><div style="font-size:60px;margin-bottom:12px;">'+result.icon+'</div><div style="font-size:22px;font-weight:700;color:'+result.color+';">'+result.name+'</div><div style="font-size:13px;color:#666;margin-top:8px;">'+result.description+'</div></div><div style="margin-bottom:16px;"><div style="font-size:14px;font-weight:600;color:#333;margin-bottom:8px;">主要特征</div><div style="display:flex;flex-wrap:wrap;gap:8px;">'+result.characteristics.map(function(c){ return '<span style="padding:4px 12px;background:#f0f9f4;color:#2d8b5e;border-radius:20px;font-size:12px;">'+c+'</span>'; }).join('')+'</div></div><div style="margin-bottom:16px;"><div style="font-size:14px;font-weight:600;color:#333;margin-bottom:8px;">饮食建议</div><div style="font-size:13px;color:#666;line-height:1.8;">'+result.diet.map(function(d){ return '<p>• '+d+'</p>'; }).join('')+'</div></div><div style="margin-bottom:16px;"><div style="font-size:14px;font-weight:600;color:#333;margin-bottom:8px;">运动建议</div><div style="display:flex;flex-wrap:wrap;gap:8px;">'+result.exercise.map(function(e){ return '<span style="padding:4px 12px;background:rgba(245,158,11,0.1);color:#F59E0B;border-radius:20px;font-size:12px;">'+e+'</span>'; }).join('')+'</div></div><div style="margin-bottom:16px;"><div style="font-size:14px;font-weight:600;color:#333;margin-bottom:8px;">推荐药材</div><div style="display:flex;flex-wrap:wrap;gap:8px;">'+result.herbs.map(function(h){ var herb = HERB_DATA.find(function(herb){ return herb.name === h; }); return '<span style="padding:4px 12px;background:rgba(168,85,247,0.1);color:#a855f7;border-radius:20px;font-size:12px;cursor:pointer;" onclick="closeConstitutionTest();showHerbDetail('+(herb?herb.id:1)+')">'+h+'</span>'; }).join('')+'</div></div><button class="btn btn-primary" onclick="closeConstitutionTest()">完成测评</button>';
  document.getElementById('constitution-prev').style.display = 'none';
  document.getElementById('constitution-next').style.display = 'none';
  document.getElementById('constitution-submit').style.display = 'none';
  constitutionRecords.unshift({ date: getTodayDate(), type: result.name, score: maxScore });
}
function handleChatKey(e) { if (e.key === 'Enter') sendMessage(); }
function sendMessage(text) {
  var input = document.getElementById('chat-input');
  var message = text || input.value.trim();
  if (!message) return;
  if (isChatLoading) return;
  addMessage('user', message);
  if (!text) input.value = '';
  isChatLoading = true;
  var sendBtn = document.getElementById('chat-send-btn');
  if (sendBtn) sendBtn.disabled = true;
  var loadingId = 'loading-' + Date.now();
  var messagesEl = document.getElementById('chat-messages');
  messagesEl.innerHTML += '<div class="chat-message assistant" id="'+loadingId+'"><div class="chat-avatar">📖</div><div class="chat-loading"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div></div>';
  messagesEl.scrollTop = messagesEl.scrollHeight;
  setTimeout(function(){
    var el = document.getElementById(loadingId);
    if (el) el.remove();
    var response = CONSULT_RESPONSES.default;
    var keys = Object.keys(CONSULT_RESPONSES);
    for (var i = 0; i < keys.length; i++) {
      if (keys[i] !== 'default' && message.indexOf(keys[i]) !== -1) { response = CONSULT_RESPONSES[keys[i]]; break; }
    }
    var html = response.explanation;
    if (response.diagnosis !== '需要进一步辨证') {
      html += '<br><br><span class="chat-diagnosis-tag">辨证：'+response.diagnosis+'</span>';
      html += '<div class="chat-prescription-card"><div class="prescription-name">📜 '+response.prescription+'</div><div class="prescription-ingredients">组成：'+response.herbs+'</div></div>';
    }
    addMessage('assistant', html);
    isChatLoading = false;
    if (sendBtn) sendBtn.disabled = false;
  }, 1200);
}
function addMessage(role, text) {
  var messagesEl = document.getElementById('chat-messages');
  messagesEl.innerHTML += '<div class="chat-message '+role+'"><div class="chat-avatar">'+(role==='user'?'👤':'📖')+'</div><div class="chat-bubble">'+text+'</div></div>';
  messagesEl.scrollTop = messagesEl.scrollHeight;
}
function endChat() { showPage('page-home'); }
function renderChatHistory() {
  var content = document.getElementById('chat-history-content');
  if (CHAT_HISTORY_DATA.length === 0) {
    content.innerHTML = '<div class="empty-state"><div class="empty-icon">📋</div><div class="empty-title">暂无问诊记录</div><div class="empty-desc">前往经方问诊页面开始您的第一次问诊</div></div>';
    return;
  }
  content.innerHTML = CHAT_HISTORY_DATA.map(function(chat){
    return '<div class="card" style="cursor:pointer;margin-bottom:12px;" onclick="showChatDetail(\''+chat.id+'\')"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;"><span style="font-size:15px;font-weight:600;color:#333;">'+chat.summary+'</span><span style="font-size:12px;color:#999;">'+chat.createdAt+'</span></div><div style="font-size:13px;color:#666;margin-bottom:8px;">'+chat.history[0].text+'</div>'+(chat.diagnosis?'<span style="padding:2px 10px;background:rgba(168,85,247,0.1);color:#a855f7;border-radius:20px;font-size:12px;">'+chat.diagnosis+'</span>':'')+(chat.prescription?'<span style="padding:2px 10px;background:rgba(45,139,94,0.1);color:#2d8b5e;border-radius:20px;font-size:12px;margin-left:6px;">'+chat.prescription+'</span>':'')+'</div>';
  }).join('');
}
function showChatDetail(sessionId) {
  var chat = CHAT_HISTORY_DATA.find(function(c){ return c.id === sessionId; });
  if (!chat) return;
  pageHistory.push('page-chat-history');
  showPage('page-chat-detail', false);
  var html = '<div class="card" style="margin-bottom:12px;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;"><span style="font-size:16px;font-weight:600;">'+chat.summary+'</span><span style="font-size:12px;color:#999;">'+chat.createdAt+'</span></div>';
  if (chat.diagnosis) html += '<div style="margin-bottom:8px;"><span style="padding:4px 12px;background:rgba(168,85,247,0.1);color:#a855f7;border-radius:20px;font-size:13px;">辨证：'+chat.diagnosis+'</span></div>';
  if (chat.prescription) html += '<div><span style="padding:4px 12px;background:rgba(45,139,94,0.1);color:#2d8b5e;border-radius:20px;font-size:13px;">处方：'+chat.prescription+'</span></div>';
  html += '</div>';
  html += chat.history.map(function(h){ return '<div class="chat-message '+h.role+'" style="margin-bottom:12px;"><div class="chat-avatar">'+(h.role==='user'?'👤':'📖')+'</div><div class="chat-bubble">'+h.text.replace(/\n/g, '<br>')+'</div></div>'; }).join('');
  html += '<div style="padding:0 16px 16px;"><button class="btn btn-primary" onclick="goBack()">← 返回</button></div>';
  document.getElementById('chat-detail-content').innerHTML = html;
}
function renderProfile() {
  var favHerbsEl = document.getElementById('fav-herbs-list');
  favHerbsEl.innerHTML = FAVORITE_HERBS.map(function(id){
    var h = HERB_DATA.find(function(herb){ return herb.id === id; });
    return '<div class="herb-list-card" onclick="showHerbDetail('+h.id+')" style="margin:0 16px 12px;"><div class="herb-visual '+h.color+'"><div style="font-size:40px;">'+h.visual+'</div></div><div class="herb-info"><div class="name">'+h.name+'</div><div class="effect">'+h.effect+'</div></div></div>';
  }).join('');
  var favMatchesEl = document.getElementById('fav-matches-list');
  favMatchesEl.innerHTML = FAVORITE_MATCHES.map(function(id){
    var m = MATCH_DATA.find(function(match){ return match.id === id; });
    return '<div class="food-item" onclick="showMatchDetail('+m.id+')" style="margin:0 16px 12px;"><div class="food-visual herb-color-'+(m.id%6+1)+'"><div style="font-size:40px;">🍲</div></div><div class="food-info"><div class="name">'+m.name+'</div><div class="effect">'+m.effect+'</div></div></div>';
  }).join('');
  var checkinEl = document.getElementById('checkin-records-list');
  checkinEl.innerHTML = checkinRecords.slice(0,5).map(function(r){
    return '<div class="card" style="padding:12px 16px;margin:0 16px 8px;display:flex;justify-content:space-between;align-items:center;"><div style="display:flex;align-items:center;gap:10px;"><span style="font-size:20px;">'+(r.checked?'✅':'⭕')+'</span><div><div style="font-size:14px;font-weight:500;">'+r.herbName+'</div><div style="font-size:12px;color:#999;">'+r.date+'</div></div></div><span style="font-size:12px;color:'+(r.checked?'#2d8b5e':'#999')+';">'+(r.checked?'已打卡':'未打卡')+'</span></div>';
  }).join('');
  var identifyEl = document.getElementById('identify-records-list');
  identifyEl.innerHTML = identifyRecords.slice(0,5).map(function(r){
    return '<div class="card" style="padding:12px 16px;margin:0 16px 8px;display:flex;justify-content:space-between;align-items:center;"><div><div style="font-size:14px;font-weight:500;">'+r.herbName+'</div><div style="font-size:12px;color:#999;">'+r.date+'</div></div><span style="font-size:14px;font-weight:600;color:#2d8b5e;">'+r.accuracy+'%</span></div>';
  }).join('');
  var chatEl = document.getElementById('chat-history-list');
  chatEl.innerHTML = CHAT_HISTORY_DATA.slice(0,3).map(function(chat){
    return '<div class="card" style="padding:12px 16px;margin:0 16px 8px;cursor:pointer;" onclick="showChatDetail(\''+chat.id+'\')"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;"><span style="font-size:14px;font-weight:500;">'+chat.summary+'</span><span style="font-size:12px;color:#999;">'+chat.createdAt+'</span></div>'+(chat.diagnosis?'<span style="padding:2px 8px;background:rgba(168,85,247,0.1);color:#a855f7;border-radius:20px;font-size:11px;">'+chat.diagnosis+'</span>':'')+'</div>';
  }).join('');
  var constEl = document.getElementById('constitution-records-list');
  constEl.innerHTML = constitutionRecords.map(function(r){
    var ct = CONSTITUTION_TYPES[r.type.replace('质','')];
    return '<div class="card" style="padding:12px 16px;margin:0 16px 8px;display:flex;justify-content:space-between;align-items:center;"><div><div style="font-size:14px;font-weight:500;">'+r.type+'</div><div style="font-size:12px;color:#999;">'+r.date+'</div></div><span style="font-size:14px;font-weight:600;color:'+(ct?ct.color:'#2d8b5e')+';">'+r.score+'分</span></div>';
  }).join('');
}
function checkLLMStatus() {
  var btn = document.getElementById('check-status-btn');
  if (btn) { btn.textContent = '⏳ 检查中...'; btn.disabled = true; }
  setTimeout(function(){
    llmStatus = { enabled: false, provider: '', model: '' };
    updateLLMUI();
    if (btn) { btn.textContent = '🔍 检查状态'; btn.disabled = false; }
    alert('当前为演示模式，未配置AI服务。\n\n本地知识库模式已启用，所有功能均可正常使用。');
  }, 1000);
}
function updateLLMUI() {
  var enabled = llmStatus.enabled;
  var modeText = enabled ? 'AI增强模式' : '本地知识库模式';
  var detailText = enabled ? llmStatus.provider + ' ' + llmStatus.model : '未配置API Key';
  var homeBar = document.getElementById('home-llm-status');
  var homeDot = document.getElementById('home-llm-dot');
  var homeText = document.getElementById('home-llm-text');
  var homeArrow = document.getElementById('home-llm-arrow');
  if (homeBar) {
    homeBar.className = 'llm-status-bar ' + (enabled ? 'enabled' : 'disabled');
    homeDot.className = 'llm-status-dot ' + (enabled ? 'enabled' : 'disabled');
    homeText.className = 'llm-status-text ' + (enabled ? 'enabled' : 'disabled');
    homeText.textContent = enabled ? modeText + ' - ' + detailText : modeText + ' - 配置API Key解锁AI增强';
    homeArrow.className = 'llm-status-arrow ' + (enabled ? 'enabled' : 'disabled');
  }
  var configDot = document.getElementById('config-llm-dot');
  var configMode = document.getElementById('config-llm-mode');
  var configDetail = document.getElementById('config-llm-detail');
  if (configDot) configDot.className = 'llm-status-dot ' + (enabled ? 'enabled' : 'disabled');
  if (configMode) { configMode.textContent = modeText; configMode.style.color = enabled ? '#2d8b5e' : '#F59E0B'; }
  if (configDetail) configDetail.textContent = detailText;
  var profileDot = document.getElementById('profile-llm-dot');
  var profileMode = document.getElementById('profile-llm-mode');
  var profileDetail = document.getElementById('profile-llm-detail');
  if (profileDot) profileDot.className = 'llm-status-dot ' + (enabled ? 'enabled' : 'disabled');
  if (profileMode) { profileMode.textContent = modeText; profileMode.style.color = enabled ? '#2d8b5e' : '#F59E0B'; }
  if (profileDetail) profileDetail.textContent = enabled ? detailText : '点击配置API Key，解锁AI增强功能';
  var consultIndicator = document.getElementById('consult-mode-indicator');
  if (consultIndicator) consultIndicator.className = 'mode-indicator ' + (enabled ? 'enabled' : 'disabled');
  var localTag = document.getElementById('local-mode-tag');
  if (localTag) localTag.style.display = enabled ? 'none' : 'inline-block';
}
document.addEventListener('DOMContentLoaded', function() {
  renderHome();
  updateLLMUI();
});

