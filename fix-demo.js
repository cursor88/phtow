const fs = require('fs');
let content = fs.readFileSync('demo.html', 'utf8');

const fixes = [
  ['古籍记�?', '古籍记载'],
  ['涨知�?', '涨知识'],
  ['选择图片开始识别/div>', '选择图片开始识别</div>'],
  ['识别小贴�?', '识别小贴士'],
  ['清晰可�?', '清晰可见'],
  ['完整形�?', '完整形态'],
  ['总题�?', '总题数'],
  ['正确�?', '正确率'],
  ['错题�?', '错题本'],
  ['湿气�?)', '湿气重)"'],
  ['湿气�?/', '湿气重/'],
  ['搜索药材名称或别�? id=', '搜索药材名称或别名" id='],
  ['<span class="back" onclick="showPage(\'page-home\')">�?</span>', '<span class="back" onclick="showPage(\'page-home\')">←</span>'],
  ['<span class="back" onclick="goBack()">�?</span>', '<span class="back" onclick="goBack()">←</span>'],
  ['<span class="search-clear" onclick="clearMatchSearch()" id="match-search-clear" style="display:none;">�?</span>', '<span class="search-clear" onclick="clearMatchSearch()" id="match-search-clear" style="display:none;">×</span>'],
  ['标准测评 (60题', '标准测评 (60题)'],
  ['AI识别</div><div class="feature-desc">拍照秒识药材品类</div>', 'AI识别</div><div class="feature-desc">拍照秒识药材品类</div>'],
];

let changed = 0;
for (const [bad, good] of fixes) {
  if (content.includes(bad)) {
    content = content.split(bad).join(good);
    changed++;
  }
}

// Fix all remaining garbled patterns
content = content.replace(/�\?/g, '');
content = content.replace(/[\uFFFD]/g, '');

// Fix common missing characters
const charFixes = {
  '古籍记': '古籍记载',
  '涨知': '涨知识',
  '总题': '总题数',
  '正确': '正确率',
  '错题': '错题本',
  '湿气': '湿气重',
  '别�': '别名',
};

for (const [bad, good] of Object.entries(charFixes)) {
  content = content.split(bad).join(good);
}

fs.writeFileSync('demo.html', content, 'utf8');
console.log('Fixed all garbled characters');
