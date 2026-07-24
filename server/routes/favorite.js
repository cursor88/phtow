const express = require('express');
const { pool } = require('../config/mysql');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

router.get('/list/:targetType', authRequired, async (req, res) => {
  try {
    const { targetType } = req.params;
    if (!['herb', 'match'].includes(targetType)) {
      return res.json({ code: 400, message: '无效的类型', data: null });
    }

    const [rows] = await pool.query(
      'SELECT target_id, created_at FROM user_favorites WHERE user_id = ? AND target_type = ? ORDER BY created_at DESC',
      [req.user.id, targetType]
    );

    const ids = rows.map(r => r.target_id);
    res.json({ code: 0, message: 'ok', data: ids });
  } catch (e) {
    console.error('Get favorites error:', e);
    res.json({ code: 500, message: '获取失败', data: null });
  }
});

router.post('/toggle', authRequired, async (req, res) => {
  try {
    const { targetType, targetId } = req.body;
    if (!['herb', 'match'].includes(targetType) || !targetId) {
      return res.json({ code: 400, message: '参数错误', data: null });
    }

    const [existing] = await pool.query(
      'SELECT id FROM user_favorites WHERE user_id = ? AND target_type = ? AND target_id = ?',
      [req.user.id, targetType, targetId]
    );

    let isFavorited;
    if (existing.length > 0) {
      await pool.query(
        'DELETE FROM user_favorites WHERE user_id = ? AND target_type = ? AND target_id = ?',
        [req.user.id, targetType, targetId]
      );
      isFavorited = false;
    } else {
      await pool.query(
        'INSERT INTO user_favorites (user_id, target_type, target_id) VALUES (?, ?, ?)',
        [req.user.id, targetType, targetId]
      );
      isFavorited = true;
    }

    res.json({ code: 0, message: 'ok', data: { isFavorited } });
  } catch (e) {
    console.error('Toggle favorite error:', e);
    res.json({ code: 500, message: '操作失败', data: null });
  }
});

router.get('/check/:targetType/:targetId', authRequired, async (req, res) => {
  try {
    const { targetType, targetId } = req.params;
    if (!['herb', 'match'].includes(targetType) || !targetId) {
      return res.json({ code: 400, message: '参数错误', data: null });
    }

    const [rows] = await pool.query(
      'SELECT id FROM user_favorites WHERE user_id = ? AND target_type = ? AND target_id = ?',
      [req.user.id, targetType, targetId]
    );

    res.json({ code: 0, message: 'ok', data: { isFavorited: rows.length > 0 } });
  } catch (e) {
    console.error('Check favorite error:', e);
    res.json({ code: 500, message: '查询失败', data: null });
  }
});

router.get('/herbs', authRequired, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT h.*,
              (SELECT image_url FROM herb_images WHERE herb_id = h.id AND is_cover = 1 LIMIT 1) AS cover_image_url
       FROM herbs h
       INNER JOIN user_favorites uf ON uf.target_id = h.id AND uf.target_type = 'herb'
       WHERE uf.user_id = ?
       ORDER BY uf.created_at DESC`,
      [req.user.id]
    );
    res.json({ code: 0, message: 'ok', data: rows });
  } catch (e) {
    console.error('Get fav herbs error:', e);
    res.json({ code: 500, message: '获取失败', data: [] });
  }
});

router.get('/matches', authRequired, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT fm.*
       FROM food_matches fm
       INNER JOIN user_favorites uf ON uf.target_id = fm.id AND uf.target_type = 'match'
       WHERE uf.user_id = ?
       ORDER BY uf.created_at DESC`,
      [req.user.id]
    );
    res.json({ code: 0, message: 'ok', data: rows });
  } catch (e) {
    console.error('Get fav matches error:', e);
    res.json({ code: 500, message: '获取失败', data: [] });
  }
});

router.post('/add', authRequired, async (req, res) => {
  try {
    const { type, id } = req.body;
    if (!type || !id || !['herb', 'match'].includes(type)) {
      return res.json({ code: 400, message: '参数错误', data: null });
    }
    await pool.query(
      `INSERT IGNORE INTO user_favorites (user_id, target_type, target_id) VALUES (?, ?, ?)`,
      [req.user.id, type, id]
    );
    res.json({ code: 0, message: '收藏成功', data: { isFavorited: true } });
  } catch (e) {
    console.error('Add favorite error:', e);
    res.json({ code: 500, message: '操作失败', data: null });
  }
});

router.post('/remove', authRequired, async (req, res) => {
  try {
    const { type, id } = req.body;
    if (!type || !id || !['herb', 'match'].includes(type)) {
      return res.json({ code: 400, message: '参数错误', data: null });
    }
    await pool.query(
      'DELETE FROM user_favorites WHERE user_id = ? AND target_type = ? AND target_id = ?',
      [req.user.id, type, id]
    );
    res.json({ code: 0, message: '取消收藏', data: { isFavorited: false } });
  } catch (e) {
    console.error('Remove favorite error:', e);
    res.json({ code: 500, message: '操作失败', data: null });
  }
});

module.exports = router;
