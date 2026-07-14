const express = require('express');
const router = express.Router();
const nihaixia = require('../services/nihaixiaService');

router.post('/consult', async (req, res) => {
  const { symptoms, context, mode } = req.body;
  
  if (!symptoms) {
    return res.json({ code: -1, message: '请描述您的症状' });
  }
  
  try {
    const result = await nihaixia.consult(symptoms, context || {}, mode || 'diagnosis');
    res.json({ code: 0, data: result });
  } catch (e) {
    console.error('[Skill] 问诊出错:', e);
    res.json({ code: -1, message: e.message });
  }
});

router.post('/constitution-advice', async (req, res) => {
  const { constitution, season } = req.body;
  
  if (!constitution) {
    return res.json({ code: -1, message: '请提供体质类型' });
  }
  
  try {
    const result = nihaixia.getConstitutionAdvice(constitution);
    res.json({ code: 0, data: result });
  } catch (e) {
    console.error('[Skill] 体质建议出错:', e);
    res.json({ code: -1, message: e.message });
  }
});

router.get('/herb-prescriptions/:herbName', async (req, res) => {
  const { herbName } = req.params;
  
  if (!herbName) {
    return res.json({ code: -1, message: '请提供药材名称' });
  }
  
  try {
    const result = nihaixia.getHerbPrescriptions(herbName);
    res.json({ code: 0, data: result });
  } catch (e) {
    console.error('[Skill] 药材配伍出错:', e);
    res.json({ code: -1, message: e.message });
  }
});

router.get('/search', async (req, res) => {
  const { query } = req.query;
  
  if (!query) {
    return res.json({ code: -1, message: '请输入搜索关键词' });
  }
  
  try {
    const results = nihaixia.search(query, 10);
    res.json({ code: 0, data: results });
  } catch (e) {
    console.error('[Skill] 搜索出错:', e);
    res.json({ code: -1, message: e.message });
  }
});

router.get('/health', (req, res) => {
  res.json({
    code: 0,
    data: {
      status: 'ok',
      indexCount: nihaixia.index.length,
      skillSize: nihaixia.skillContent.length
    }
  });
});

module.exports = router;