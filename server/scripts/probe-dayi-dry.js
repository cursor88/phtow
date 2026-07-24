// 大医本草药材ID映射表（已通过 WebSearch 验证）
// 通过 https://www.dayi.org.cn/cmedical/{id}.html 访问

const missing = [
  { id: 9, name: '桂圆', dayiName: '龙眼', dayiId: 1114881 },
  { id: 50, name: '生地黄', dayiName: '干地黄', dayiId: 301006 },
  { id: 62, name: '红藤、败酱草', dayiName: '大血藤', dayiId: 300287 },
  { id: 85, name: '海风藤', dayiName: '海风藤', dayiId: 301169 },
  { id: 86, name: '昆明山海棠', dayiName: '昆明山海棠', dayiId: 301642 },
  { id: 87, name: '雪上一枝蒿', dayiName: '雪上一枝蒿', dayiId: 1116869 },
  { id: 96, name: '雪莲花', dayiName: '雪莲花', dayiId: 1115967 },
  { id: 98, name: '藿香', dayiName: '藿香', dayiId: 301406 },
  { id: 106, name: '木通', dayiName: '木通', dayiId: 302437 },
  { id: 109, name: '萆薢', dayiName: '萆薢', dayiId: 300151 },
  { id: 128, name: '鹤草芽', dayiName: '鹤草芽', dayiId: 1116917 },
  { id: 140, name: '棕榈炭', dayiName: '棕榈炭', dayiId: 1156036 },
  { id: 142, name: '炮姜', dayiName: '炮姜', dayiId: 302653 },
  { id: 145, name: '延胡索', dayiName: '延胡索', dayiId: 305115 },
  { id: 167, name: '禹白附', dayiName: '禹白附', dayiId: 1115467 },
  { id: 168, name: '白芥子', dayiName: '芥子', dayiId: 301424 },
  { id: 174, name: '竹沥', dayiName: '竹沥', dayiId: 305949 },
  { id: 193, name: '缬草', dayiName: '缬草', dayiId: 304939 },
  { id: 198, name: '刺蒺藜', dayiName: '蒺藜', dayiId: null, note: '大医本草无对应条目' },
  { id: 199, name: '生铁落', dayiName: '生铁落', dayiId: 1155643 },
  { id: 210, name: '冰片', dayiName: '冰片', dayiId: 1113587 },
  { id: 217, name: '饴糖', dayiName: '饴糖', dayiId: null, note: 'ID 1142889 在 /drug/ 路径下, 不在 /cmedical/' },
  { id: 225, name: '益智仁', dayiName: '益智仁', dayiId: 305425 },
  { id: 228, name: '乌贼骨', dayiName: '海螵蛸', dayiId: 1116173 },
  { id: 229, name: '熟地黄', dayiName: '熟地黄', dayiId: 1115491 },
  { id: 259, name: '白扁豆花', dayiName: '白扁豆花' },
  { id: 276, name: '桔红', dayiName: '桔红' },
  { id: 282, name: '黄芥子', dayiName: '芥子', dayiId: 301424 },
  { id: 284, name: '紫苏籽', dayiName: '紫苏子', dayiId: 306061 },
  { id: 286, name: '黑胡椒', dayiName: '胡椒', dayiId: 301270 },
  { id: 304, name: '酸枣', dayiName: '酸枣' },
  { id: 305, name: '黑枣', dayiName: '黑枣' }
]

module.exports = { missing }
