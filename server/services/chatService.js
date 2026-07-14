const nihaixia = require('./nihaixiaService');
const llm = require('./llmService');
const fs = require('fs');
const path = require('path');

class ChatService {
  constructor() {
    this.sessions = new Map();
    this.maxHistory = 20;
    this.sessionTimeout = 3600000;
    this.llmEnabled = llm.isEnabled();
    this.historyFile = path.join(__dirname, '../data/chatHistory.json');
    this.chatHistory = this.loadHistory();
  }

  loadHistory() {
    try {
      if (fs.existsSync(this.historyFile)) {
        const data = fs.readFileSync(this.historyFile, 'utf8');
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('[ChatService] 加载历史记录失败:', e.message);
    }
    return [];
  }

  saveHistory() {
    try {
      const dir = path.dirname(this.historyFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.historyFile, JSON.stringify(this.chatHistory, null, 2), 'utf8');
    } catch (e) {
      console.error('[ChatService] 保存历史记录失败:', e.message);
    }
  }

  addToHistory(session) {
    if (!session || session.history.length === 0) return;
    
    const firstUserMsg = session.history.find(h => h.role === 'user');
    const summary = firstUserMsg ? firstUserMsg.content.substring(0, 30) : '问诊记录';
    
    const record = {
      sessionId: session.id,
      summary: summary + (firstUserMsg && firstUserMsg.content.length > 30 ? '...' : ''),
      diagnosis: session.diagnosis,
      prescription: session.prescription ? session.prescription.name : null,
      createdAt: session.createdAt,
      endedAt: Date.now(),
      messageCount: session.history.length,
      history: session.history.map(h => ({
        role: h.role,
        content: h.content,
        time: h.time
      }))
    };
    
    this.chatHistory.unshift(record);
    if (this.chatHistory.length > 50) {
      this.chatHistory = this.chatHistory.slice(0, 50);
    }
    this.saveHistory();
  }

  getHistoryList() {
    return this.chatHistory;
  }

  getHistoryDetail(sessionId) {
    let session = this.sessions.get(sessionId);
    if (session) {
      return {
        id: session.id,
        history: session.history,
        diagnosis: session.diagnosis,
        prescription: session.prescription,
        context: session.context,
        createdAt: session.createdAt
      };
    }
    
    // 从历史记录中恢复会话
    const record = this.chatHistory.find(h => h.sessionId === sessionId);
    if (record && record.history) {
      session = {
        id: record.sessionId,
        history: record.history,
        context: record.context || {},
        diagnosis: record.diagnosis,
        prescription: record.prescription ? { name: record.prescription } : null,
        createdAt: record.createdAt,
        lastActivity: Date.now()
      };
      this.sessions.set(sessionId, session);
      
      return {
        id: session.id,
        history: session.history,
        diagnosis: session.diagnosis,
        prescription: session.prescription,
        context: session.context,
        createdAt: session.createdAt
      };
    }
    
    return record || null;
  }

  deleteHistory(sessionId) {
    const index = this.chatHistory.findIndex(h => h.sessionId === sessionId);
    if (index !== -1) {
      this.chatHistory.splice(index, 1);
      this.saveHistory();
      return true;
    }
    return false;
  }

  clearAllHistory() {
    this.chatHistory = [];
    this.saveHistory();
  }

  createSession() {
    const sessionId = this.generateId();
    this.sessions.set(sessionId, {
      id: sessionId,
      history: [],
      context: {},
      diagnosis: null,
      prescription: null,
      createdAt: Date.now(),
      lastActive: Date.now()
    });
    return sessionId;
  }

  generateId() {
    return 'chat_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  getSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    
    if (Date.now() - session.lastActive > this.sessionTimeout) {
      this.sessions.delete(sessionId);
      return null;
    }
    
    session.lastActive = Date.now();
    return session;
  }

  saveMessage(sessionId, role, content) {
    const session = this.getSession(sessionId);
    if (!session) return;
    
    session.history.push({
      role: role,
      content: content,
      timestamp: Date.now()
    });
    
    if (session.history.length > this.maxHistory) {
      session.history = session.history.slice(-this.maxHistory);
    }
  }

  updateContext(sessionId, key, value) {
    const session = this.getSession(sessionId);
    if (!session) return;
    
    session.context[key] = value;
    
    if (key === 'diagnosis') {
      session.diagnosis = value;
    } else if (key === 'prescription') {
      session.prescription = value;
    }
  }

  async processMessage(sessionId, userMessage) {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error('会话已过期，请重新开始');
    }

    this.saveMessage(sessionId, 'user', userMessage);

    const contextStr = Object.keys(session.context)
      .filter(k => session.context[k])
      .map(k => `${k}: ${session.context[k]}`)
      .join('；');

    const previousDiagnosis = session.diagnosis ? `之前辨证为：${session.diagnosis}` : '';
    const previousPrescription = session.prescription ? `之前处方为：${session.prescription.name}` : '';

    const historySummary = session.history.slice(-5).map(h => 
      `${h.role === 'user' ? '用户' : 'AI'}：${h.content.substring(0, 50)}`
    ).join('\n');

    const fullContext = [
      previousDiagnosis,
      previousPrescription,
      contextStr,
      `对话历史：\n${historySummary}`
    ].filter(Boolean).join('\n\n');

    let aiResponse;

    if (this.isGreeting(userMessage)) {
      aiResponse = this.generateGreeting();
    } else if (this.isSymptomReport(userMessage)) {
      aiResponse = await this.handleSymptomReport(session, userMessage, fullContext);
    } else if (this.isConsultationQuestion(userMessage)) {
      aiResponse = await this.handleConsultation(session, userMessage, fullContext);
    } else if (this.isPrescriptionQuestion(userMessage)) {
      aiResponse = await this.handlePrescriptionQuestion(session, userMessage);
    } else if (this.isFollowUpQuestion(userMessage, session)) {
      aiResponse = await this.handleFollowUp(session, userMessage);
    } else {
      aiResponse = await this.handleGeneralQuestion(session, userMessage, fullContext);
    }

    aiResponse.text = this.formatResponse(aiResponse.text);

    this.saveMessage(sessionId, 'assistant', aiResponse.text);

    return {
      text: aiResponse.text,
      context: session.context,
      diagnosis: session.diagnosis,
      prescription: session.prescription,
      needMoreInfo: aiResponse.needMoreInfo || false,
      suggestedQuestions: aiResponse.suggestedQuestions || []
    };
  }

  formatResponse(text) {
    if (!text) return '';
    
    let result = text;
    
    result = result.replace(/^#{1,6}\s+/gm, '');
    result = result.replace(/^#{1,6}/gm, '');
    
    result = result.replace(/\*\*/g, '');
    
    result = result.replace(/__/g, '');
    
    result = result.replace(/^\s*[-*+]\s+/gm, '• ');
    
    result = result.replace(/^(\d+)\.\s*/gm, '$1. ');
    
    result = result.replace(/`([^`]+)`/g, '$1');
    
    result = result.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    
    result = result.replace(/详见：modul.*/gi, '');
    result = result.replace(/references\/research\/.*/gi, '');
    result = result.replace(/combined_reference.*/gi, '');
    result = result.replace(/研究资料索引.*/gi, '');
    result = result.replace(/原始研究素材.*/gi, '');
    result = result.replace(/文件\s+内容\s+用途.*/gi, '');
    
    result = result.replace(/^\s*[-=]{2,}\s*$/gm, '');
    
    result = result.split('\n').filter(line => {
      const metaPatterns = ['详见：', '文件 ', '内容 ', '用途 ', '目录', '模块', 'research/'];
      const trimmed = line.trim();
      if (!trimmed) return true;
      return !metaPatterns.some(p => trimmed.startsWith(p) || trimmed.includes(p));
    }).join('\n');
    
    result = result.replace(/\n{3,}/g, '\n\n');
    
    result = result.replace(/<br\s*\/?>/gi, '\n');
    
    result = result.replace(/^\s+|\s+$/g, '');
    
    return result;
  }

  isGreeting(message) {
    const greetings = ['你好', '您好', '嗨', 'hello', 'hi', '开始', '对话', '聊天'];
    return greetings.some(g => message.includes(g));
  }

  generateGreeting() {
    return {
      text: '您好！我是倪海厦经方中医助手。请描述您的症状，我将根据经方思维为您提供辨证和处方建议。',
      suggestedQuestions: ['我感冒发烧了怎么办？', '我有失眠问题', '我胃痛不舒服']
    };
  }

  isFollowUpQuestion(message, session) {
    if (!session || !session.diagnosis) {
      return false;
    }
    const followUpWords = ['为什么', '是什么', '怎么治', '怎么办', '如何', '怎么回事', '原因', '机理'];
    return followUpWords.some(w => message.includes(w));
  }

  isPrescriptionQuestion(message) {
    const prescriptionWords = ['方子', '药方', '处方', '药', '剂量', '用法', '服用'];
    return prescriptionWords.some(w => message.includes(w));
  }

  isSymptomReport(message) {
    const symptomWords = ['痛', '胀', '咳', '烧', '泻', '吐', '晕', '累', '失眠', '便秘', '头痛', '胃痛', '腰痛'];
    return symptomWords.some(w => message.includes(w));
  }

  isConsultationQuestion(message) {
    const consultWords = ['辨证', '诊断', '分析', '建议', '调理', '养生'];
    return consultWords.some(w => message.includes(w));
  }

  async handleSymptomReport(session, message, fullContext) {
    const result = await nihaixia.consult(message, session.context);
    
    if (result.diagnosis) {
      session.diagnosis = result.diagnosis;
      this.updateContext(session.id, 'diagnosis', result.diagnosis);
    }
    
    if (result.prescription) {
      session.prescription = result.prescription;
      this.updateContext(session.id, 'prescription', result.prescription);
    }

    this.updateContext(session.id, 'symptoms', message);

    let response = '';
    
    if (this.llmEnabled) {
      try {
        const searchResults = result.matches || nihaixia.search(message, 5);
        response = await llm.summarizeAnswer(
          result.diagnosis,
          result.analysis,
          result.prescription,
          result.tips,
          searchResults,
          message
        );
      } catch (error) {
        console.error('LLM整合失败:', error.message);
        response = this.buildFallbackResponse(result);
      }
    } else {
      response = this.buildFallbackResponse(result);
    }

    return {
      text: response,
      suggestedQuestions: [
        '这个病是什么原因引起的？',
        '这个方子的原理是什么？',
        '还有其他方子可以用吗？',
        '饮食上需要注意什么？'
      ]
    };
  }

  buildFallbackResponse(result) {
    let response = '';
    if (result.diagnosis) {
      response += `**辨证结果：${result.diagnosis}**\n\n`;
    }
    if (result.analysis) {
      response += `${result.analysis}\n\n`;
    }
    if (result.prescription) {
      response += `**推荐处方：${result.prescription.name}**\n`;
      response += `成分：${result.prescription.ingredients.join('、')}\n`;
      response += `说明：${result.prescription.explanation}\n\n`;
    }
    if (result.tips && result.tips.length > 0) {
      response += `**注意事项：**\n${result.tips.map(t => `• ${t}`).join('\n')}\n\n`;
    }
    response += '请问还有其他症状需要补充吗？或者您想了解更多关于这个辨证的信息？';
    return response;
  }

  async handleFollowUp(session, message) {
    if (!session.diagnosis) {
      return {
        text: '我需要先了解您的症状才能回答您的问题。请描述您的症状，我会为您进行辨证分析。',
        suggestedQuestions: ['我肚子痛怎么办？', '我咳嗽有血']
      };
    }

    let searchQuery = message;
    
    if (message.includes('这个病') || message.includes('该病') || message.includes('此证')) {
      searchQuery = message.replace(/这个病|该病|此证/g, session.diagnosis);
    }
    
    if (message.includes('这个方子') || message.includes('该方') || message.includes('此方')) {
      const prescName = session.prescription ? session.prescription.name : '';
      if (prescName) {
        searchQuery = message.replace(/这个方子|该方|此方/g, prescName);
      }
    }

    const searchResults = nihaixia.search(searchQuery, 5);
    
    let response = '';
    
    if (this.llmEnabled) {
      try {
        response = await llm.answerFollowUp(
          session.diagnosis,
          session.prescription,
          session.history,
          message
        );
      } catch (error) {
        console.error('LLM追问失败:', error.message);
        response = this.buildFollowUpFallback(message, session.diagnosis, searchResults);
      }
    } else {
      response = this.buildFollowUpFallback(message, session.diagnosis, searchResults);
    }

    return {
      text: response,
      suggestedQuestions: [
        '还有其他需要了解的吗？',
        '继续咨询其他症状'
      ]
    };
  }

  buildFollowUpFallback(message, diagnosis, searchResults) {
    if (searchResults.length === 0) {
      return `关于"${message}"的问题，我在知识库中暂未找到详细解答。您可以继续描述您的症状，我会尽力帮助您。`;
    }

    let response = '';
    if (message.includes('为什么') || message.includes('原因') || message.includes('机理')) {
      response += `关于您的问题"${message}"（针对${diagnosis}），根据经方思维分析：\n\n`;
    } else if (message.includes('怎么治') || message.includes('怎么办') || message.includes('如何')) {
      response += `针对您的问题"${message}"，建议如下：\n\n`;
    } else {
      response += `关于"${message}"，以下是相关知识：\n\n`;
    }

    searchResults.slice(0, 3).forEach((r, i) => {
      response += `${i + 1}. **${r.title}**\n`;
      response += `${r.content.substring(0, 200)}...\n\n`;
    });

    response += '如果您有其他问题，请继续提问。';
    return response;
  }

  async handlePrescriptionQuestion(session, message) {
    if (!session.prescription) {
      return {
        text: '我需要先了解您的症状才能为您推荐处方。请描述您的症状，我会为您进行辨证分析并给出合适的处方建议。',
        suggestedQuestions: ['我肚子痛怎么办？', '我咳嗽有血']
      };
    }

    const presc = session.prescription;
    let response = '';

    if (message.includes('剂量') || message.includes('用法') || message.includes('服用')) {
      response += `**${presc.name}**\n\n`;
      response += `成分：${presc.ingredients.join('、')}\n`;
      response += `剂量：请遵医嘱\n`;
      response += `说明：${presc.explanation}\n\n`;
      response += '⚠️ 重要提示：以上内容仅供参考，请务必在中医师指导下使用，切勿自行抓药服用。';
    } else {
      response += `当前推荐处方为 **${presc.name}**\n\n`;
      response += `成分：${presc.ingredients.join('、')}\n`;
      response += `说明：${presc.explanation}\n\n`;
      response += '您想了解这个方子的具体用法或剂量吗？';
    }

    return {
      text: response,
      suggestedQuestions: [
        '这个方子的具体用法是什么？',
        '有什么禁忌需要注意吗？',
        '还有其他替代方子吗？'
      ]
    };
  }

  async handleConsultation(session, message, fullContext) {
    const result = await nihaixia.consult(message, session.context);

    if (result.diagnosis) {
      session.diagnosis = result.diagnosis;
      this.updateContext(session.id, 'diagnosis', result.diagnosis);
    }

    let response = '';
    
    if (this.llmEnabled) {
      try {
        const searchResults = result.matches || nihaixia.search(message, 5);
        response = await llm.summarizeAnswer(
          result.diagnosis,
          result.analysis,
          result.prescription,
          result.tips,
          searchResults,
          message
        );
      } catch (error) {
        console.error('LLM咨询失败:', error.message);
        response = this.buildConsultationFallback(result);
      }
    } else {
      response = this.buildConsultationFallback(result);
    }

    return {
      text: response,
      suggestedQuestions: [
        '请描述您的具体症状',
        '咨询处方相关问题'
      ]
    };
  }

  buildConsultationFallback(result) {
    let response = '';
    
    if (result.diagnosis) {
      response += `**辨证结果：${result.diagnosis}**\n\n`;
    }
    
    if (result.analysis) {
      response += `${result.analysis}\n\n`;
    }
    
    if (result.tips && result.tips.length > 0) {
      response += `**建议：**\n${result.tips.map(t => `• ${t}`).join('\n')}\n\n`;
    }

    response += '请问您还有其他问题吗？';
    return response;
  }

  async handleGeneralQuestion(session, message, fullContext) {
    const searchResults = nihaixia.search(message, 5);

    if (searchResults.length === 0) {
      return {
        text: `关于"${message}"的问题，我在知识库中暂未找到相关内容。您可以尝试描述具体症状，我会尽力帮助您。`,
        suggestedQuestions: ['描述我的症状', '咨询常见问题']
      };
    }

    let response = '';
    
    if (this.llmEnabled) {
      try {
        response = await llm.summarizeAnswer(
          null,
          null,
          null,
          null,
          searchResults,
          message
        );
      } catch (error) {
        console.error('LLM通用问题失败:', error.message);
        response = this.buildGeneralFallback(message, searchResults);
      }
    } else {
      response = this.buildGeneralFallback(message, searchResults);
    }

    return {
      text: response,
      suggestedQuestions: [
        '继续了解其他内容',
        '描述我的症状进行辨证'
      ]
    };
  }

  buildGeneralFallback(message, searchResults) {
    let response = `关于"${message}"，以下是相关知识：\n\n`;

    searchResults.slice(0, 3).forEach((r, i) => {
      response += `${i + 1}. **${r.title}**\n`;
      response += `${r.content.substring(0, 300)}...\n\n`;
    });

    response += '如果您有其他问题，请继续提问。';
    return response;
  }

  getSessionInfo(sessionId) {
    const session = this.getSession(sessionId);
    if (!session) return null;
    
    return {
      id: session.id,
      historyCount: session.history.length,
      context: session.context,
      diagnosis: session.diagnosis,
      prescription: session.prescription,
      createdAt: session.createdAt,
      lastActive: session.lastActive
    };
  }

  endSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (session) {
      this.addToHistory(session);
    }
    this.sessions.delete(sessionId);
  }
}

module.exports = new ChatService();