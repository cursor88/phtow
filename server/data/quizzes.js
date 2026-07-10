const quizzes = [
  {
    id: 1,
    question: '人参的主要功效不包括以下哪项？',
    options: [
      'A. 大补元气',
      'B. 补脾益肺',
      'C. 清热解毒',
      'D. 安神益智'
    ],
    answer: 'C',
    explanation: '人参的主要功效是大补元气、复脉固脱、补脾益肺、生津养血、安神益智。清热解毒是金银花等清热药的功效。',
    difficulty: '简单',
    category: '功效主治',
    herbId: 1
  },
  {
    id: 2,
    question: '枸杞子主要归哪些经络？',
    options: [
      'A. 肝、肾经',
      'B. 心、肺经',
      'C. 脾、胃经',
      'D. 肺、大肠经'
    ],
    answer: 'A',
    explanation: '枸杞子味甘性平，归肝、肾经，具有滋补肝肾、益精明目的功效。',
    difficulty: '简单',
    category: '性味归经',
    herbId: 2
  },
  {
    id: 3,
    question: '黄芪的药用部位是？',
    options: [
      'A. 果实',
      'B. 花',
      'C. 根',
      'D. 叶'
    ],
    answer: 'C',
    explanation: '黄芪为豆科植物蒙古黄芪或膜荚黄芪的干燥根，是常用的补气药。',
    difficulty: '简单',
    category: '药用部位',
    herbId: 3
  },
  {
    id: 4,
    question: '当归的哪个部位偏于补血？',
    options: [
      'A. 当归头',
      'B. 当归身',
      'C. 当归尾',
      'D. 全当归'
    ],
    answer: 'B',
    explanation: '传统经验认为：当归头止血而上行，当归身养血而中守，当归尾破血而下流，全当归活血而不走。',
    difficulty: '中等',
    category: '炮制与用法',
    herbId: 4
  },
  {
    id: 5,
    question: '金银花的性味是？',
    options: [
      'A. 甘，寒',
      'B. 苦，温',
      'C. 辛，热',
      'D. 酸，平'
    ],
    answer: 'A',
    explanation: '金银花味甘性寒，归肺、心、胃经，具有清热解毒、疏散风热的功效。',
    difficulty: '简单',
    category: '性味归经',
    herbId: 5
  },
  {
    id: 6,
    question: '茯苓的主要功效是？',
    options: [
      'A. 发汗解表',
      'B. 利水渗湿，健脾宁心',
      'C. 泻下通便',
      'D. 收敛固涩'
    ],
    answer: 'B',
    explanation: '茯苓味甘淡性平，具有利水渗湿、健脾、宁心的功效，是利水渗湿的要药。',
    difficulty: '简单',
    category: '功效主治',
    herbId: 6
  },
  {
    id: 7,
    question: '以下哪味药被誉为"补药之长"？',
    options: [
      'A. 人参',
      'B. 黄芪',
      'C. 当归',
      'D. 枸杞'
    ],
    answer: 'B',
    explanation: '黄芪色黄，为补药之长，故名黄耆。黄芪具有补气升阳、固表止汗等多种功效。',
    difficulty: '中等',
    category: '药名释义',
    herbId: 3
  },
  {
    id: 8,
    question: '《本草纲目》的作者是？',
    options: [
      'A. 张仲景',
      'B. 李时珍',
      'C. 孙思邈',
      'D. 华佗'
    ],
    answer: 'B',
    explanation: '《本草纲目》是明代医药学家李时珍所著，全书共52卷，载药1892种。',
    difficulty: '简单',
    category: '典籍知识',
    herbId: null
  },
  {
    id: 9,
    question: '人参与以下哪味药相反，不宜同用？',
    options: [
      'A. 黄芪',
      'B. 白术',
      'C. 藜芦',
      'D. 茯苓'
    ],
    answer: 'C',
    explanation: '十八反中明确记载"诸参辛芍叛藜芦"，人参不宜与藜芦同用。此外人参也畏五灵脂。',
    difficulty: '中等',
    category: '用药禁忌',
    herbId: 1
  },
  {
    id: 10,
    question: '以下哪项不是金银花的适应症？',
    options: [
      'A. 痈肿疔疮',
      'B. 风热感冒',
      'C. 热毒血痢',
      'D. 脾胃虚寒泄泻'
    ],
    answer: 'D',
    explanation: '金银花性寒，脾胃虚寒及气虚疮疡脓清者忌服。金银花适用于热证，不适用于脾胃虚寒泄泻。',
    difficulty: '中等',
    category: '功效主治',
    herbId: 5
  },
  {
    id: 11,
    question: '茯苓中间抱有松根的药材称为？',
    options: [
      'A. 茯苓皮',
      'B. 茯神',
      'C. 赤茯苓',
      'D. 白茯苓'
    ],
    answer: 'B',
    explanation: '茯神是茯苓菌核中间抱有松根的部分，长于宁心安神。',
    difficulty: '困难',
    category: '药材鉴别',
    herbId: 6
  },
  {
    id: 12,
    question: '当归调经止痛的作用主要用于？',
    options: [
      'A. 血热月经不调',
      'B. 血虚血瘀月经不调',
      'C. 痰湿月经不调',
      'D. 肝郁月经不调'
    ],
    answer: 'B',
    explanation: '当归既能补血又能活血，是补血活血的要药，尤其适用于血虚血瘀所致的月经不调、经闭痛经。',
    difficulty: '中等',
    category: '功效主治',
    herbId: 4
  }
]

module.exports = quizzes
