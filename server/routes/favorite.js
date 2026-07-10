const express = require('express');
const db = require('../config/db');
const { authRequired } = require('../middleware/auth');
const fs = require('fs');
const path = require('path');
const herbs = require('../data/herbs');
const foodMatches = require('../data/foodMatches');

const router = express.Router();
const FAVORITE_FILE = path.join(__dirname, '../data/favoriteRecords.json');

function loadFavorites() {
  try {
    return JSON.parse(fs.readFileSync(FAVORITE_FILE, 'utf8'));
  } catch (e) {
    return { herbs: [], matches: [] };
  }
}

function saveFavorites(data) {
  fs.writeFileSync(FAVORITE_FILE, JSON.stringify(data, null, 2));
}

router.get('/list/:targetType', authRequired, (req, res) => {
  try {
    const { targetType } = req.params;
    if (!['herb', 'match'].includes(targetType)) {
      return res.json({ code: 400, message: '无效的类型', data: null });
    }

    const rows = db.prepare(`
      SELECT target_id, created_at
      FROM user_favorites
      WHERE user_id = ? AND target_type = ?
      ORDER BY created_at DESC
    `).all(req.user.id, targetType);

    const ids = rows.map(r => r.target_id);
    res.json({ code: 0, message: 'ok', data: ids });
  } catch (e) {
    console.error('Get favorites error:', e);
    res.json({ code: 500, message: '获取失败', data: null });
  }
});

router.post('/toggle', authRequired, (req, res) => {
  try {
    const { targetType, targetId } = req.body;
    if (!['herb', 'match'].includes(targetType) || !targetId) {
      return res.json({ code: 400, message: '参数错误', data: null });
    }

    const existing = db.prepare(`
      SELECT id FROM user_favorites
      WHERE user_id = ? AND target_type = ? AND target_id = ?
    `).get(req.user.id, targetType, targetId);

    let isFavorited;
    if (existing) {
      db.prepare(`
        DELETE FROM user_favorites
        WHERE user_id = ? AND target_type = ? AND target_id = ?
      `).run(req.user.id, targetType, targetId);
      isFavorited = false;
    } else {
      db.prepare(`
        INSERT INTO user_favorites (user_id, target_type, target_id)
        VALUES (?, ?, ?)
      `).run(req.user.id, targetType, targetId);
      isFavorited = true;
    }

    res.json({
      code: 0,
      message: 'ok',
      data: { isFavorited }
    });
  } catch (e) {
    console.error('Toggle favorite error:', e);
    res.json({ code: 500, message: '操作失败', data: null });
  }
});

router.get('/check/:targetType/:targetId', authRequired, (req, res) => {
  try {
    const { targetType, targetId } = req.params;
    if (!['herb', 'match'].includes(targetType) || !targetId) {
      return res.json({ code: 400, message: '参数错误', data: null });
    }

    const row = db.prepare(`
      SELECT id FROM user_favorites
      WHERE user_id = ? AND target_type = ? AND target_id = ?
    `).get(req.user.id, targetType, targetId);

    res.json({
      code: 0,
      message: 'ok',
      data: { isFavorited: !!row }
    });
  } catch (e) {
    console.error('Check favorite error:', e);
    res.json({ code: 500, message: '查询失败', data: null });
  }
});

router.get('/herbs', (req, res) => {
  try {
    const favs = loadFavorites();
    const favHerbs = favs.herbs.map(id => {
      const herb = herbs.find(h => h.id === id);
      return herb || null;
    }).filter(Boolean);
    res.json({ code: 0, message: 'ok', data: favHerbs });
  } catch (e) {
    console.error('Get fav herbs error:', e);
    res.json({ code: 500, message: '获取失败', data: [] });
  }
});

router.get('/matches', (req, res) => {
  try {
    const favs = loadFavorites();
    const favMatches = favs.matches.map(id => {
      const match = foodMatches.find(m => m.id === id);
      return match || null;
    }).filter(Boolean);
    res.json({ code: 0, message: 'ok', data: favMatches });
  } catch (e) {
    console.error('Get fav matches error:', e);
    res.json({ code: 500, message: '获取失败', data: [] });
  }
});

router.post('/add', (req, res) => {
  try {
    const { type, id } = req.body;
    if (!type || !id) {
      return res.json({ code: 400, message: '参数错误', data: null });
    }
    const favs = loadFavorites();
    if (type === 'herb') {
      if (!favs.herbs.includes(id)) favs.herbs.push(id);
    } else if (type === 'match') {
      if (!favs.matches.includes(id)) favs.matches.push(id);
    }
    saveFavorites(favs);
    res.json({ code: 0, message: '收藏成功', data: { isFavorited: true } });
  } catch (e) {
    console.error('Add favorite error:', e);
    res.json({ code: 500, message: '操作失败', data: null });
  }
});

router.post('/remove', (req, res) => {
  try {
    const { type, id } = req.body;
    if (!type || !id) {
      return res.json({ code: 400, message: '参数错误', data: null });
    }
    const favs = loadFavorites();
    if (type === 'herb') {
      favs.herbs = favs.herbs.filter(hid => hid !== id);
    } else if (type === 'match') {
      favs.matches = favs.matches.filter(mid => mid !== id);
    }
    saveFavorites(favs);
    res.json({ code: 0, message: '取消收藏', data: { isFavorited: false } });
  } catch (e) {
    console.error('Remove favorite error:', e);
    res.json({ code: 500, message: '操作失败', data: null });
  }
});

module.exports = router;
