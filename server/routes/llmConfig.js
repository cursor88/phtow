const express = require('express');
const router = express.Router();
const llmService = require('../services/llmService');

router.get('/presets', (req, res) => {
  res.json({
    code: 0,
    data: {
      presets: llmService.getPresets()
    }
  });
});

router.get('/config', (req, res) => {
  res.json({
    code: 0,
    data: {
      enabled: llmService.isEnabled(),
      provider: llmService.getProviderName(),
      model: llmService.getModel(),
      providers: llmService.getProviderList()
    }
  });
});

router.post('/config', (req, res) => {
  try {
    const config = req.body;
    const result = llmService.reloadConfig(config);
    res.json({
      code: 0,
      message: '配置更新成功',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      code: -1,
      message: '配置更新失败：' + error.message
    });
  }
});

router.get('/status', (req, res) => {
  res.json({
    code: 0,
    data: {
      enabled: llmService.isEnabled(),
      provider: llmService.isEnabled() ? llmService.getProviderName() : null,
      model: llmService.isEnabled() ? llmService.getModel() : null
    }
  });
});

module.exports = router;