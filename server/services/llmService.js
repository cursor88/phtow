const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

class LLMService {
  constructor() {
    this.providers = {
      openai: {
        apiKey: process.env.OPENAI_API_KEY,
        apiBase: process.env.OPENAI_API_BASE || 'https://api.openai.com/v1',
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        headers: (apiKey) => ({
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        })
      },
      zhipu: {
        apiKey: process.env.ZHIPU_API_KEY,
        apiBase: process.env.ZHIPU_API_BASE || 'https://open.bigmodel.cn/api/paas/v4',
        model: process.env.ZHIPU_MODEL || 'glm-4-flash',
        headers: (apiKey) => ({
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        })
      },
      moonshot: {
        apiKey: process.env.MOONSHOT_API_KEY,
        apiBase: process.env.MOONSHOT_API_BASE || 'https://api.moonshot.cn/v1',
        model: process.env.MOONSHOT_MODEL || 'moonshot-v1-8k',
        headers: (apiKey) => ({
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        })
      },
      qwen: {
        apiKey: process.env.QWEN_API_KEY,
        apiBase: process.env.QWEN_API_BASE || 'https://dashscope.aliyuncs.com/api/v1',
        model: process.env.QWEN_MODEL || 'qwen-turbo',
        headers: (apiKey) => ({
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        })
      },
      doubao: {
        apiKey: process.env.DOUBAO_API_KEY,
        apiBase: process.env.DOUBAO_API_BASE || 'https://ark.cn-beijing.volces.com/api/v3',
        model: process.env.DOUBAO_MODEL || 'doubao-1-5-pro-250115',
        headers: (apiKey) => ({
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        })
      }
    };

    this.provider = this.detectProvider();
    this.enabled = this.provider !== null;
  }

  detectProvider() {
    const priority = ['openai', 'zhipu', 'moonshot', 'qwen', 'doubao'];
    for (const p of priority) {
      if (this.providers[p].apiKey) {
        console.log(`[LLM服务] 已配置 ${p.toUpperCase()} 模型: ${this.providers[p].model}`);
        return this.providers[p];
      }
    }
    console.log('[LLM服务] 未配置任何LLM服务，将使用本地知识库模式');
    return null;
  }

  async generateResponse(messages) {
    if (!this.enabled) {
      throw new Error('LLM服务未配置');
    }

    try {
      const response = await axios.post(
        `${this.provider.apiBase}/chat/completions`,
        {
          model: this.provider.model,
          messages: messages,
          temperature: 0.3,
          max_tokens: 1000
        },
        {
          headers: this.provider.headers(this.provider.apiKey),
          timeout: 60000
        }
      );

      if (response.data && response.data.choices && response.data.choices.length > 0) {
        return response.data.choices[0].message.content.trim();
      }
      throw new Error('LLM返回数据格式错误');
    } catch (error) {
      console.error('LLM调用失败:', error.message);
      throw error;
    }
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
      if (searchResults && searchResults.length > 0) {
        response += '相关知识：\n';
        searchResults.slice(0, 2).forEach((r, i) => {
          response += `${i + 1}. ${r.title}\n${r.content.substring(0, 150)}...\n\n`;
        });
      }
      return response;
    }

    const systemPrompt = `你是一位精通倪海厦经方中医理论的资深中医师。请根据提供的信息，直接为用户进行专业的中医辨证分析和解答。

回答要求：
1. 直接给出专业回答，不要以"抱歉"、"对不起"、"我刚刚的回答有误"等道歉语句开头
2. 结构清晰：先给出辨证结果，再分析病因病机，最后给出处方建议和注意事项
3. 语言亲切自然，避免生硬的专业术语堆砌
4. 参考知识库内容进行综合分析，用自己的话总结，不要逐条罗列原文
5. 不要包含文件路径、模块名称、目录结构等元数据信息
6. 不要重复相同内容，回答简洁完整即可
7. 如果有多个可能的辨证，说明可能性大小并给出建议
8. 不要输出表格、目录列表、文件索引等格式`;

    const instruction = `请根据以下信息，为用户提供专业的中医辨证解答。注意：
- 直接给出结论和分析，不要罗列知识库原文
- 用自己的话总结病因病机和治疗建议
- 回答控制在300字以内，简洁明了`;

    let context = '';
    if (diagnosis) context += `辨证结果：${diagnosis}\n\n`;
    if (analysis) context += `分析：${analysis}\n\n`;
    if (prescription) {
      context += `推荐处方：${prescription.name}\n`;
      context += `成分：${prescription.ingredients.join('、')}\n`;
      context += `说明：${prescription.explanation}\n\n`;
    }
    if (tips && tips.length > 0) {
      context += `注意事项：\n${tips.map(t => `• ${t}`).join('\n')}\n\n`;
    }
    if (searchResults && searchResults.length > 0) {
      const cleanResults = searchResults.filter(r => {
        if (!r.content) return false;
        const skipPatterns = ['references/research', 'combined_reference', '文件 内容 用途', '目录', '模块', '研究资料索引', '原始研究素材'];
        return !skipPatterns.some(p => r.content.includes(p) || r.title.includes(p));
      });
      if (cleanResults.length > 0) {
        context += '相关知识参考：\n';
        cleanResults.slice(0, 3).forEach((r, i) => {
          let cleanContent = r.content;
          cleanContent = cleanContent.replace(/详见：modul.*/gi, '');
          cleanContent = cleanContent.replace(/references\/research\/.*/gi, '');
          cleanContent = cleanContent.replace(/文件\s+内容\s+用途.*/gi, '');
          cleanContent = cleanContent.replace(/研究资料索引.*/gi, '');
          cleanContent = cleanContent.replace(/原始研究素材.*/gi, '');
          cleanContent = cleanContent.replace(/-{2,}.*/g, '');
          cleanContent = cleanContent.replace(/={2,}.*/g, '');
          cleanContent = cleanContent.split('\n').filter(line => {
            const metaPatterns = ['详见：', '文件 ', '内容 ', '用途 ', '目录', '模块', 'research/', 'combined_reference'];
            return !metaPatterns.some(p => line.trim().startsWith(p) || line.includes(p));
          }).join('\n');
          context += `${i + 1}. ${r.title}\n${cleanContent.substring(0, 200)}\n\n`;
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
}

module.exports = new LLMService();