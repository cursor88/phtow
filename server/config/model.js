require('dotenv').config()

const models = {
  openai: {
    name: 'OpenAI GPT-4o',
    enabled: process.env.OPENAI_API_KEY ? true : false,
    apiKey: process.env.OPENAI_API_KEY,
    apiBase: process.env.OPENAI_API_BASE || 'https://api.openai.com/v1',
    model: process.env.OPENAI_MODEL || 'gpt-4o',
    timeout: 30000
  },
  zhipu: {
    name: '智谱AI GLM-4V',
    enabled: process.env.ZHIPU_API_KEY ? true : false,
    apiKey: process.env.ZHIPU_API_KEY,
    apiBase: process.env.ZHIPU_API_BASE || 'https://open.bigmodel.cn/api/paas/v4',
    model: process.env.ZHIPU_MODEL || 'glm-4v-flash',
    timeout: 30000
  },
  hunyuan: {
    name: '腾讯云混元大模型',
    enabled: (process.env.TENCENT_SECRET_ID && process.env.TENCENT_SECRET_KEY) ? true : false,
    secretId: process.env.TENCENT_SECRET_ID,
    secretKey: process.env.TENCENT_SECRET_KEY,
    region: process.env.TENCENT_REGION || 'ap-beijing',
    model: process.env.TENCENT_MODEL || 'hunyuan-plus',
    timeout: 30000
  },
  qwen: {
    name: '阿里通义千问',
    enabled: process.env.QWEN_API_KEY ? true : false,
    apiKey: process.env.QWEN_API_KEY,
    apiBase: process.env.QWEN_API_BASE || 'https://dashscope.aliyuncs.com',
    model: process.env.QWEN_MODEL || 'qwen-vl-max',
    timeout: 30000
  },
  doubao: {
    name: '豆包大模型',
    enabled: true,
    apiKey: process.env.DOUBAO_API_KEY || '',
    apiBase: process.env.DOUBAO_API_BASE || 'https://ark.cn-beijing.volces.com/api/v3',
    model: process.env.DOUBAO_MODEL || 'doubao-1-5-vision-pro-32k-250115',
    timeout: 30000
  },
  moonshot: {
    name: '月之暗面 Kimi',
    enabled: process.env.MOONSHOT_API_KEY ? true : false,
    apiKey: process.env.MOONSHOT_API_KEY,
    apiBase: process.env.MOONSHOT_API_BASE || 'https://api.moonshot.cn/v1',
    model: process.env.MOONSHOT_MODEL || 'moonshot-v1-8k',
    timeout: 30000
  },
  ollama: {
    name: 'Ollama 本地模型',
    enabled: process.env.OLLAMA_ENABLED ? (process.env.OLLAMA_ENABLED === 'true') : true,
    apiKey: 'ollama',
    apiBase: process.env.OLLAMA_API_BASE || 'http://localhost:11434/v1',
    model: process.env.OLLAMA_MODEL || 'qwen2.5vl:3b',
    timeout: 120000
  }
}

const activeModels = Object.keys(models).filter(key => models[key].enabled)

module.exports = {
  models,
  activeModels,
  defaultModel: activeModels[0] || null,
  fallbackToLocal: true
}