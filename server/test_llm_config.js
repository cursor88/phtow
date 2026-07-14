require('dotenv').config({ path: __dirname + '/.env' });

console.log('=== LLM API Key 配置检测 ===\n');

const providers = [
  { name: 'OpenAI', key: process.env.OPENAI_API_KEY, base: process.env.OPENAI_API_BASE, model: process.env.OPENAI_MODEL },
  { name: '智谱AI', key: process.env.ZHIPU_API_KEY, base: process.env.ZHIPU_API_BASE, model: process.env.ZHIPU_MODEL },
  { name: '月之暗面', key: process.env.MOONSHOT_API_KEY, base: process.env.MOONSHOT_API_BASE, model: process.env.MOONSHOT_MODEL },
  { name: '通义千问', key: process.env.QWEN_API_KEY, base: process.env.QWEN_API_BASE, model: process.env.QWEN_MODEL },
  { name: '豆包', key: process.env.DOUBAO_API_KEY, base: process.env.DOUBAO_API_BASE, model: process.env.DOUBAO_MODEL }
];

let configuredCount = 0;

providers.forEach(p => {
  const hasKey = !!p.key && p.key !== 'your-' + p.name.toLowerCase().replace(/\s/g, '') + '-api-key';
  if (hasKey) {
    console.log(`✅ ${p.name}`);
    console.log(`   API Key: ${p.key.substring(0, 10)}****${p.key.substring(p.key.length - 4)}`);
    console.log(`   API Base: ${p.base || '默认'}`);
    console.log(`   模型: ${p.model || '默认'}`);
    console.log('');
    configuredCount++;
  }
});

if (configuredCount === 0) {
  console.log('❌ 未检测到任何已配置的LLM API Key');
  console.log('请在 .env 文件中配置至少一个API Key');
} else {
  console.log(`\n✅ 共检测到 ${configuredCount} 个已配置的LLM服务`);
  
  const llm = require('./services/llmService');
  console.log(`\n🔍 LLM服务状态: ${llm.isEnabled() ? '已启用' : '未启用'}`);
  if (llm.isEnabled()) {
    console.log('LLM服务将被用于优化问答结果');
  } else {
    console.log('将使用本地知识库模式');
  }
}