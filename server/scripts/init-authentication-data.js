/**
 * 初始化中药材真伪鉴别数据
 * 数据来源：常见造假中药材盘点
 * 运行方式：node server/scripts/init-authentication-data.js
 */
require('dotenv').config();
const { pool, testConnection } = require('../config/mysql');

// 10 条真伪鉴别数据
const authData = [
  {
    herb_name: '茯苓',
    counterfeiter: '木薯',
    fraud_type: '冒充',
    summary: '用木薯冒充，手搓出粉、一掰就断，甚至能在表面画画写字',
    key_points: [
      { label: '质地', genuine: '坚硬，搓不出粉', fake: '松散，能搓出粉' },
      { label: '折断', genuine: '难以掰开', fake: '一掰就断' },
      { label: '划痕', genuine: '划不出痕迹', fake: '表面能画画写字' }
    ],
    genuine_features: [
      '质地坚硬，即使大力士也难以掰开',
      '手搓不出粉，划不出痕迹'
    ],
    fake_features: [
      '用木薯冒充',
      '手能搓出粉，一掰就断',
      '表面能画画写字'
    ],
    source: '常见造假中药材盘点'
  },
  {
    herb_name: '陈皮',
    counterfeiter: '温烤做旧',
    fraud_type: '做旧',
    summary: '外层乌漆嘛黑，里面没有渗透，没有麻点，经温烤做旧',
    key_points: [
      { label: '外层颜色', genuine: '颜色均匀自然', fake: '乌漆嘛黑' },
      { label: '内瓤', genuine: '自然脱落', fake: '未渗透' },
      { label: '油室(麻点)', genuine: '均匀分布', fake: '无麻点' }
    ],
    genuine_features: [
      '外层颜色均匀',
      '里层内瓤自然脱落',
      '油室（麻点）均匀分布'
    ],
    fake_features: [
      '经过温烤做旧',
      '外层乌漆嘛黑，里面没有渗透',
      '没有麻点'
    ],
    source: '常见造假中药材盘点'
  },
  {
    herb_name: '淮山药',
    counterfeiter: '菜山药',
    fraud_type: '冒充',
    summary: '用菜山药冒充，四周无翘边，质地松散，轻轻一折就断',
    key_points: [
      { label: '边缘', genuine: '外圈有翘边', fake: '四周无翘边' },
      { label: '表面', genuine: '有粗皱纹', fake: '表面光滑' },
      { label: '质地', genuine: '紧实，不好折断', fake: '松散，一折就断' }
    ],
    genuine_features: [
      '外圈有翘边',
      '表面有粗皱纹',
      '质地紧实，不好折断'
    ],
    fake_features: [
      '用菜山药冒充',
      '四周没有翘边',
      '质地松散，轻轻一折就断'
    ],
    source: '常见造假中药材盘点'
  },
  {
    herb_name: '黄芪',
    counterfeiter: '桑枝',
    fraud_type: '冒充',
    summary: '用桑枝冒充，外层棕灰色，中心有白色小泡沫，一折就断，无药效',
    key_points: [
      { label: '断面', genuine: '金井玉栏+菊花心', fake: '中心白色小泡沫' },
      { label: '质地', genuine: '折断有纤维丝', fake: '一折就断' },
      { label: '气味', genuine: '豆腥味', fake: '无奇怪味道但无药效' }
    ],
    genuine_features: [
      '吃起来有豆腥味',
      '断面具有"金井玉栏"（皮部黄白色，木部淡黄色）',
      '中间有菊花心',
      '折断时有纤维丝'
    ],
    fake_features: [
      '用桑枝冒充',
      '外层棕灰色，中心有白色小泡沫',
      '一折就断',
      '没有奇怪味道但无药效'
    ],
    source: '常见造假中药材盘点'
  },
  {
    herb_name: '薏苡仁',
    counterfeiter: '草珠子',
    fraud_type: '冒充',
    summary: '用草珠子冒充，个头比绿豆大，中间沟槽宽',
    key_points: [
      { label: '个头', genuine: '较小', fake: '比绿豆大' },
      { label: '沟槽', genuine: '窄', fake: '宽' }
    ],
    genuine_features: [
      '个头较小',
      '中间沟槽窄'
    ],
    fake_features: [
      '用草珠子冒充',
      '个头比绿豆大',
      '中间沟槽宽'
    ],
    source: '常见造假中药材盘点'
  },
  {
    herb_name: '西洋参',
    counterfeiter: '桔梗',
    fraud_type: '冒充',
    summary: '用桔梗冒充，外形不规则，中间有小气孔',
    key_points: [
      { label: '外形', genuine: '规则', fake: '不规则' },
      { label: '中心', genuine: '放射性菊花芯', fake: '小气孔' },
      { label: '边缘', genuine: '带小麻点', fake: '无麻点' }
    ],
    genuine_features: [
      '中间是放射性菊花芯',
      '边缘带有小麻点'
    ],
    fake_features: [
      '用桔梗冒充',
      '外形不规则',
      '中间还有小气孔'
    ],
    source: '常见造假中药材盘点'
  },
  {
    herb_name: '玫瑰花',
    counterfeiter: '月季',
    fraud_type: '冒充',
    summary: '用月季冒充玫瑰花，花托尖圆锥形，花叶有小分叉',
    key_points: [
      { label: '花托', genuine: '圆球形', fake: '尖圆锥形' },
      { label: '花叶', genuine: '有小绒毛，无分叉', fake: '有小分叉' }
    ],
    genuine_features: [
      '花托是圆球形',
      '花叶上有小绒毛',
      '不带分叉'
    ],
    fake_features: [
      '用月季冒充',
      '花托是尖尖的圆锥形',
      '花叶上还有小分叉'
    ],
    source: '常见造假中药材盘点'
  },
  {
    herb_name: '金银花',
    counterfeiter: '山银花',
    fraud_type: '冒充',
    summary: '用山银花冒充，握起来硬实扎手，表面光滑无绒毛',
    key_points: [
      { label: '手感', genuine: '软乎乎', fake: '硬实扎手' },
      { label: '外形', genuine: '像小棒槌', fake: '不规则' },
      { label: '表面', genuine: '带绒毛', fake: '光滑无绒毛' }
    ],
    genuine_features: [
      '握起来软乎乎的',
      '外形像个小棒槌',
      '表面带绒毛'
    ],
    fake_features: [
      '用山银花冒充',
      '握起来硬实还扎手',
      '表面光滑，没有绒毛'
    ],
    source: '常见造假中药材盘点'
  },
  {
    herb_name: '枸杞',
    counterfeiter: '染色/非野生',
    fraud_type: '染色',
    summary: '外观五颜六色，可能经硫磺熏蒸或染色，非野生枸杞',
    key_points: [
      { label: '颜色', genuine: '自然红，带白线纹', fake: '五颜六色' },
      { label: '手感', genuine: '握不成坨', fake: '易成坨' },
      { label: '顶端', genuine: '有小白点(果柄痕)', fake: '无白点' }
    ],
    genuine_features: [
      '宁夏枸杞，表面带有白线纹',
      '握起来不成坨',
      '顶端有小白点（果柄痕）'
    ],
    fake_features: [
      '外观五颜六色（可能经硫磺熏蒸或染色）',
      '通常用来喂猪喂鸡，不是野生枸杞'
    ],
    source: '常见造假中药材盘点'
  },
  {
    herb_name: '天麻',
    counterfeiter: '芭蕉芋',
    fraud_type: '冒充',
    summary: '用芭蕉芋冒充，表面有纤维丝，无环纹',
    key_points: [
      { label: '表面', genuine: '芝麻点(蛤蟆皮)+环纹', fake: '纤维丝，无环纹' },
      { label: '顶端', genuine: '红棕色芽苞(鹦哥嘴)', fake: '无芽苞' },
      { label: '底部', genuine: '圆脐形(肚脐眼)', fake: '无圆脐' },
      { label: '气味', genuine: '马尿味', fake: '无特殊气味' }
    ],
    genuine_features: [
      '顶端有红棕色干枯芽苞（俗称"鹦哥嘴"）',
      '底部有圆脐形（俗称"肚脐眼"）',
      '表面有芝麻点（俗称"蛤蟆皮"）',
      '闻起来有马尿味'
    ],
    fake_features: [
      '用芭蕉芋冒充',
      '表面有很多纤维丝',
      '不带一圈圈的环纹'
    ],
    source: '常见造假中药材盘点'
  }
];

(async () => {
  const ok = await testConnection();
  if (!ok) { console.error('MySQL 连接失败'); process.exit(1); }

  console.log('开始初始化真伪鉴别数据...\n');

  // 先清空旧数据（幂等）
  await pool.query('DELETE FROM herb_authentication');
  console.log('已清空旧数据');

  // 尝试关联 herbs 表的 herb_id
  for (let i = 0; i < authData.length; i++) {
    const item = authData[i];
    // 模糊匹配药材名
    const [herbs] = await pool.query(
      'SELECT id, name FROM herbs WHERE name = ? OR name LIKE ? LIMIT 1',
      [item.herb_name, `%${item.herb_name}%`]
    );
    const herbId = herbs.length > 0 ? herbs[0].id : null;
    if (herbId) {
      console.log(`  [${i + 1}] ${item.herb_name} 关联到药材 id=${herbId} (${herbs[0].name})`);
    } else {
      console.log(`  [${i + 1}] ${item.herb_name} 未找到关联药材`);
    }

    await pool.query(
      `INSERT INTO herb_authentication
        (herb_name, herb_id, counterfeiter, fraud_type, summary, key_points,
         genuine_features, fake_features, genuine_images, fake_images, source, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.herb_name,
        herbId,
        item.counterfeiter,
        item.fraud_type,
        item.summary,
        JSON.stringify(item.key_points),
        JSON.stringify(item.genuine_features),
        JSON.stringify(item.fake_features),
        JSON.stringify(item.genuine_images || []),
        JSON.stringify(item.fake_images || []),
        item.source,
        i + 1
      ]
    );
  }

  console.log(`\n共导入 ${authData.length} 条真伪鉴别数据`);
  await pool.end();
})();
