const fs = require('fs');
const axios = require('axios');
const path = require('path');
const paths = require('../config/paths');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

class LLMService {
  constructor() {
    this.providers = {};
    this.provider = null;
    this.enabled = false;
    this.configPath = paths.LLM_CONFIG;

    this.presets = {
      openai: {
        name: 'OpenAI',
        apiBase: 'https://api.openai.com/v1',
        model: 'gpt-4o-mini',
        requestFormat: 'openai'
      },
      zhipu: {
        name: '智谱AI',
        apiBase: 'https://open.bigmodel.cn/api/paas/v4',
        model: 'glm-4-flash',
        requestFormat: 'openai'
      },
      moonshot: {
        name: '月之暗面',
        apiBase: 'https://api.moonshot.cn/v1',
        model: 'moonshot-v1-8k',
        requestFormat: 'openai'
      },
      qwen: {
        name: '通义千问',
        apiBase: 'https://dashscope.aliyuncs.com/api/v1',
        model: 'qwen-turbo',
        requestFormat: 'openai'
      },
      doubao: {
        name: '豆包',
        apiBase: 'https://ark.cn-beijing.volces.com/api/v3',
        model: 'doubao-1-5-pro-250115',
        requestFormat: 'openai'
      },
      deepseek: {
        name: '深度求索',
        apiBase: 'https://api.deepseek.com/v1',
        model: 'deepseek-chat',
        requestFormat: 'openai'
      },
      baichuan: {
        name: '百川智能',
        apiBase: 'https://api.baichuan-ai.com/v1',
        model: 'Baichuan3-Turbo',
        requestFormat: 'openai'
      },
      kimi: {
        name: 'Kimi',
        apiBase: 'https://api.moonshot.cn/v1',
        model: 'kimi-8k',
        requestFormat: 'openai'
      },
      yi: {
        name: '零一万物',
        apiBase: 'https://api.lingyiwanwu.com/v1',
        model: 'yi-34b-chat',
        requestFormat: 'openai'
      },
      local: {
        name: '本地模型(Ollama)',
        apiBase: process.env.OLLAMA_API_BASE || 'http://localhost:11434/v1',
        model: process.env.OLLAMA_MODEL || 'qwen2.5:7b',
        requestFormat: 'openai'
      }
    };

    this.loadConfig();
  }

  loadConfig() {
    // 优先从环境变量加载（生产环境，API Key不进镜像）
    this.detectProviderFromEnv();

    if (!this.enabled) {
      try {
        const config = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));

        if (config.providers) {
          for (const [key, value] of Object.entries(config.providers)) {
            if (this.presets[key]) {
              this.providers[key] = { ...this.presets[key], ...value };
            } else {
              this.providers[key] = { ...value };
            }
          }
        }

        if (config.activeProvider && this.providers[config.activeProvider]) {
          this.provider = this.providers[config.activeProvider];
          this.enabled = true;
        } else {
          this.provider = this.detectProvider();
          this.enabled = this.provider !== null;
        }
      } catch (e) {
        // 配置文件读取失败，已尝试环境变量
      }
    }
  }

  detectProvider() {
    for (const [key, provider] of Object.entries(this.providers)) {
      if (provider.apiKey) {
        console.log(`[LLM服务] 已配置 ${provider.name} 模型: ${provider.model}`);
        return provider;
      }
    }
    return null;
  }

  detectProviderFromEnv() {
    // 支持通过 LLM_API_KEY + LLM_PROVIDER 环境变量配置
    const envApiKey = process.env.LLM_API_KEY;
    const envProvider = (process.env.LLM_PROVIDER || 'qwen').toLowerCase();
    const envModel = process.env.LLM_MODEL;
    const envApiBase = process.env.LLM_API_BASE;

    if (envApiKey) {
      const preset = this.presets[envProvider] || this.presets.qwen;
      this.providers[envProvider] = {
        ...preset,
        apiKey: envApiKey,
        ...(envModel ? { model: envModel } : {}),
        ...(envApiBase ? { apiBase: envApiBase } : {})
      };
      this.provider = this.providers[envProvider];
      this.enabled = true;
      console.log(`[LLM服务] 从环境变量加载 ${preset.name} 模型: ${this.provider.model}`);
      return;
    }

    // 兼容旧格式：PROVIDER_API_KEY（如 QWEN_API_KEY）
    for (const [key, preset] of Object.entries(this.presets)) {
      const envKey = `${key.toUpperCase()}_API_KEY`;
      if (process.env[envKey]) {
        this.providers[key] = {
          ...preset,
          apiKey: process.env[envKey]
        };
        this.provider = this.providers[key];
        this.enabled = true;
        console.log(`[LLM服务] 从环境变量加载 ${preset.name} 模型`);
        return;
      }
    }
    console.log('[LLM服务] 未配置任何LLM服务，将使用本地知识库模式');
  }

  reloadConfig(config) {
    if (config.providers) {
      for (const [key, value] of Object.entries(config.providers)) {
        if (this.presets[key]) {
          this.providers[key] = { ...this.presets[key], ...value };
        } else {
          this.providers[key] = { ...value, requestFormat: value.requestFormat || 'openai' };
        }
      }
    }

    let activeProvider = null;
    if (config.activeProvider && this.providers[config.activeProvider]) {
      activeProvider = this.providers[config.activeProvider];
    } else {
      activeProvider = this.detectProvider();
    }

    this.provider = activeProvider;
    this.enabled = activeProvider !== null;

    const saveConfig = {
      providers: {},
      activeProvider: Object.keys(this.providers).find(
        k => this.providers[k] === this.provider
      ) || null
    };

    for (const [key, provider] of Object.entries(this.providers)) {
      saveConfig.providers[key] = {
        apiKey: provider.apiKey || '',
        model: provider.model,
        apiBase: provider.apiBase,
        name: provider.name,
        requestFormat: provider.requestFormat || 'openai'
      };
    }

    try {
      const configDir = path.dirname(this.configPath);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }
      fs.writeFileSync(this.configPath, JSON.stringify(saveConfig, null, 2));
    } catch (e) {
      console.error('[LLM服务] 保存配置文件失败:', e.message);
    }

    const providerName = this.provider ? this.provider.name : '未知';
    console.log(this.enabled
      ? `[LLM服务] 已重新配置 ${providerName} 模型: ${this.provider.model}`
      : '[LLM服务] 配置后未启用任何LLM服务');

    return {
      enabled: this.enabled,
      provider: providerName,
      model: this.provider ? this.provider.model : null,
      providers: this.getProviderList()
    };
  }

  getPresets() {
    return Object.entries(this.presets).map(([key, preset]) => ({
      key,
      name: preset.name,
      apiBase: preset.apiBase,
      model: preset.model,
      requestFormat: preset.requestFormat
    }));
  }

  getProviderList() {
    return Object.entries(this.providers).map(([key, provider]) => ({
      key,
      name: provider.name,
      apiBase: provider.apiBase,
      model: provider.model,
      hasApiKey: !!provider.apiKey,
      isActive: this.provider === provider
    }));
  }

  async generateResponse(messages) {
    if (!this.enabled) {
      throw new Error('LLM服务未配置');
    }

    try {
      const endpoint = this.provider.endpoint || '/chat/completions';
      const url = `${this.provider.apiBase}${endpoint}`;

      const requestBody = this.buildRequestBody(messages);
      const headers = this.buildHeaders();

      const response = await axios.post(url, requestBody, {
        headers,
        timeout: 60000
      });

      return this.parseResponse(response.data);
    } catch (error) {
      console.error('LLM调用失败:', error.message);
      throw error;
    }
  }

  buildRequestBody(messages) {
    return {
      model: this.provider.model,
      messages: messages,
      temperature: 0.3,
      max_tokens: 1000
    };
  }

  buildHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      ...this.provider.headers
    };
    if (this.provider.apiKey) {
      headers['Authorization'] = `Bearer ${this.provider.apiKey}`;
    }
    return headers;
  }

  parseResponse(data) {
    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content.trim();
    }
    throw new Error('LLM返回数据格式错误');
  }

  async summarizeAnswer(diagnosis, analysis, prescription, tips, searchResults, userQuestion) {
    if (!this.enabled) {
      let response = '';
      if (diagnosis) response += `辨证结果：${diagnosis}\n\n`;
      if (analysis) response += `${analysis}\n\n`;
      if (prescription) {
        response += `推荐处方：${prescription.name}\n`;
        response += `成分：${prescription.ingredients.join('、')}\n`;
        response += `说明：${prescription.explanation}\n\n`;
      }
      if (tips && tips.length > 0) {
        response += `注意事项：\n${tips.map(t => `• ${t}`).join('\n')}\n\n`;
      }
      return response;
    }

    const systemPrompt = `你是一位资深中医师。请根据提供的信息，为用户进行专业的中医辨证分析和解答。

回答要求：
1. 直接给出专业回答，不要以"抱歉"等道歉语句开头
2. 结构清晰：先辨证，再分析，最后给处方建议
3. 用自己的话总结，不要罗列知识库原文
4. 回答控制在300字以内
5. 不要包含文件路径、模块名称等元数据`;

    const instruction = `请根据以下信息，为用户提供专业的中医辨证解答。用你自己的话总结，不要照抄知识库原文。`;

    let context = '';
    if (diagnosis) context += `辨证结果：${diagnosis}\n`;
    if (analysis) context += `分析：${analysis}\n`;
    if (prescription) {
      context += `推荐处方：${prescription.name}\n`;
      context += `成分：${prescription.ingredients.join('、')}\n`;
      context += `说明：${prescription.explanation}\n`;
    }
    if (tips && tips.length > 0) {
      context += `注意事项：${tips.join('；')}\n`;
    }
    if (searchResults && searchResults.length > 0) {
      const cleanResults = searchResults.filter(r => {
        if (!r.content) return false;
        const skipPatterns = ['references/research', 'combined_reference', '文件 内容 用途', '目录', '模块', '研究资料索引', '原始研究素材'];
        return !skipPatterns.some(p => r.content.includes(p) || r.title.includes(p));
      });
      if (cleanResults.length > 0) {
        context += '知识库摘要（仅供参考，不要照抄）：\n';
        cleanResults.slice(0, 2).forEach((r, i) => {
          let cleanContent = r.content;
          cleanContent = cleanContent.replace(/详见：.*$/gmi, '');
          cleanContent = cleanContent.replace(/references\/research\/.*$/gmi, '');
          cleanContent = cleanContent.replace(/文件\s+内容\s+用途.*$/gmi, '');
          cleanContent = cleanContent.replace(/研究资料索引.*$/gmi, '');
          cleanContent = cleanContent.replace(/原始研究素材.*$/gmi, '');
          cleanContent = cleanContent.replace(/-{2,}.*$/gm, '');
          cleanContent = cleanContent.replace(/={2,}.*$/gm, '');
          cleanContent = cleanContent.split('\n').filter(line => {
            const metaPatterns = ['详见：', '文件 ', '内容 ', '用途 ', '目录', '模块', 'research/', 'combined_reference'];
            return !metaPatterns.some(p => line.trim().startsWith(p) || line.includes(p));
          }).join(' ');
          context += `${i + 1}. ${r.title}：${cleanContent.substring(0, 100)}\n`;
        });
      }
    }

    const userMessage = userQuestion
      ? `用户问题：${userQuestion}\n\n${instruction}`
      : instruction;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `${context}\n\n${userMessage}` }
    ];

    return await this.generateResponse(messages);
  }

  async answerFollowUp(diagnosis, prescription, history, userQuestion) {
    if (!this.enabled) {
      return `关于您的问题"${userQuestion}"，结合您的辨证 ${diagnosis || '情况'}，以下是相关分析：\n\n` +
        '由于当前未配置LLM服务，无法提供更详细的解答。建议您咨询专业中医师。';
    }

    const systemPrompt = `你是一位精通倪海厦经方中医理论的资深中医师。用户已经进行过辨证，现在提出了进一步的问题。

当前辨证：${diagnosis || '尚未辨证'}
当前处方：${prescription ? prescription.name : '尚未推荐处方'}

回答要求：
1. 直接给出专业回答，不要以"抱歉"、"对不起"、"我刚才说错了"等道歉语句开头
2. 回答专业、清晰、易懂
3. 不要包含文件路径、模块名称、目录结构等元数据信息
4. 不要重复相同内容，简洁完整即可`;

    const historySummary = history.slice(-5).map(h =>
      `${h.role === 'user' ? '用户' : 'AI'}：${h.content.substring(0, 80)}`
    ).join('\n');

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `对话历史：\n${historySummary}\n\n用户当前问题：${userQuestion}` }
    ];

    return await this.generateResponse(messages);
  }

  isEnabled() {
    return this.enabled;
  }

  getProviderName() {
    return this.provider ? this.provider.name : null;
  }

  getModel() {
    return this.provider ? this.provider.model : null;
  }
}

module.exports = new LLMService();