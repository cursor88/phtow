const express = require('express');
const router = express.Router();
const chatService = require('../services/chatService');

router.post('/create', (req, res) => {
  try {
    const sessionId = chatService.createSession();
    res.json({
      code: 0,
      data: {
        sessionId: sessionId,
        message: '会话已创建',
        suggestedQuestions: ['我感冒发烧了怎么办？', '我有失眠问题', '我胃痛不舒服']
      }
    });
  } catch (e) {
    console.error('[Chat] 创建会话出错:', e);
    res.json({ code: -1, message: e.message });
  }
});

router.post('/message', async (req, res) => {
  let { sessionId, message } = req.body;

  // 没有 sessionId 时自动创建会话
  if (!sessionId) {
    try {
      sessionId = chatService.createSession();
    } catch (e) {
      console.error('[Chat] 自动创建会话失败:', e);
      return res.json({ code: -1, message: '创建会话失败' });
    }
  }

  if (!message) {
    return res.json({ code: -1, message: '请输入消息内容' });
  }

  try {
    const result = await chatService.processMessage(sessionId, message);
    res.json({
      code: 0,
      data: { ...result, sessionId }
    });
  } catch (e) {
    console.error('[Chat] 处理消息出错:', e);
    if (e.message.includes('会话已过期')) {
      return res.json({ code: -2, message: e.message });
    }
    res.json({ code: -1, message: e.message });
  }
});

router.get('/session/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  
  try {
    const sessionInfo = chatService.getSessionInfo(sessionId);
    if (!sessionInfo) {
      return res.json({ code: -2, message: '会话不存在或已过期' });
    }
    res.json({
      code: 0,
      data: sessionInfo
    });
  } catch (e) {
    console.error('[Chat] 获取会话信息出错:', e);
    res.json({ code: -1, message: e.message });
  }
});

router.post('/end/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  
  try {
    chatService.endSession(sessionId);
    res.json({
      code: 0,
      message: '会话已结束'
    });
  } catch (e) {
    console.error('[Chat] 结束会话出错:', e);
    res.json({ code: -1, message: e.message });
  }
});

router.get('/history', (req, res) => {
  try {
    const history = chatService.getHistoryList();
    res.json({
      code: 0,
      data: history
    });
  } catch (e) {
    console.error('[Chat] 获取历史记录出错:', e);
    res.json({ code: -1, message: e.message });
  }
});

router.get('/history/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  
  try {
    const detail = chatService.getHistoryDetail(sessionId);
    if (!detail) {
      return res.json({ code: -1, message: '记录不存在' });
    }
    res.json({
      code: 0,
      data: detail
    });
  } catch (e) {
    console.error('[Chat] 获取历史详情出错:', e);
    res.json({ code: -1, message: e.message });
  }
});

router.delete('/history/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  
  try {
    const deleted = chatService.deleteHistory(sessionId);
    if (deleted) {
      res.json({ code: 0, message: '记录已删除' });
    } else {
      res.json({ code: -1, message: '记录不存在' });
    }
  } catch (e) {
    console.error('[Chat] 删除历史出错:', e);
    res.json({ code: -1, message: e.message });
  }
});

router.delete('/history', (req, res) => {
  try {
    chatService.clearAllHistory();
    res.json({ code: 0, message: '全部记录已清空' });
  } catch (e) {
    console.error('[Chat] 清空历史出错:', e);
    res.json({ code: -1, message: e.message });
  }
});

module.exports = router;