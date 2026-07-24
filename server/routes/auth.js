const express = require('express');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/mysql');
const { generateToken, authRequired } = require('../middleware/auth');

const router = express.Router();
const SALT_ROUNDS = 10;

function isValidUsername(username) {
  if (!username || typeof username !== 'string') return false;
  if (username.length < 3 || username.length > 20) return false;
  return /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(username);
}

function isValidPassword(password) {
  if (!password || typeof password !== 'string') return false;
  return password.length >= 6 && password.length <= 32;
}

router.post('/register', async (req, res) => {
  try {
    const { username, password, nickname } = req.body;

    if (!isValidUsername(username)) {
      return res.json({ code: 400, message: '用户名长度3-20位，支持中英文、数字、下划线', data: null });
    }
    if (!isValidPassword(password)) {
      return res.json({ code: 400, message: '密码长度6-32位', data: null });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length > 0) {
      return res.json({ code: 400, message: '用户名已被注册', data: null });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const displayName = nickname || username;
    const securityAnswerHash = await bcrypt.hash(displayName, SALT_ROUNDS);

    const [result] = await pool.query(
      'INSERT INTO users (username, password_hash, nickname, security_question, security_answer_hash) VALUES (?, ?, ?, ?, ?)',
      [username, passwordHash, displayName, '您的昵称是什么？', securityAnswerHash]
    );

    const userId = result.insertId;
    const user = { id: userId, username, nickname: displayName };
    const token = generateToken(user);

    res.json({ code: 0, message: '注册成功', data: { token, user } });
  } catch (e) {
    console.error('Register error:', e);
    res.json({ code: 500, message: '注册失败，请稍后重试', data: null });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.json({ code: 400, message: '请输入用户名和密码', data: null });
    }

    const [rows] = await pool.query(
      'SELECT id, username, password_hash, nickname, role FROM users WHERE username = ?',
      [username]
    );
    if (rows.length === 0) {
      return res.json({ code: 401, message: '用户名或密码错误', data: null });
    }
    const u = rows[0];

    const isValid = await bcrypt.compare(password, u.password_hash);
    if (!isValid) {
      return res.json({ code: 401, message: '用户名或密码错误', data: null });
    }

    const userInfo = { id: u.id, username: u.username, nickname: u.nickname, role: u.role || 'user' };
    const token = generateToken(userInfo);

    res.json({ code: 0, message: '登录成功', data: { token, user: userInfo } });
  } catch (e) {
    console.error('Login error:', e);
    res.json({ code: 500, message: '登录失败，请稍后重试', data: null });
  }
});

router.get('/profile', authRequired, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, username, nickname, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) {
      return res.json({ code: 404, message: '用户不存在', data: null });
    }
    res.json({ code: 0, message: 'ok', data: rows[0] });
  } catch (e) {
    console.error('Profile error:', e);
    res.json({ code: 500, message: '获取用户信息失败', data: null });
  }
});

router.post('/forgot-check', async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.json({ code: 400, message: '请输入用户名', data: null });
    }

    const [rows] = await pool.query(
      'SELECT security_question FROM users WHERE username = ?',
      [username]
    );
    if (rows.length === 0) {
      return res.json({ code: 404, message: '用户不存在', data: null });
    }

    res.json({
      code: 0,
      message: 'ok',
      data: { question: rows[0].security_question }
    });
  } catch (e) {
    console.error('Forgot check error:', e);
    res.json({ code: 500, message: '查询失败', data: null });
  }
});

router.post('/forgot-reset', async (req, res) => {
  try {
    const { username, answer, newPassword } = req.body;

    if (!username || !answer || !newPassword) {
      return res.json({ code: 400, message: '请填写完整信息', data: null });
    }
    if (!isValidPassword(newPassword)) {
      return res.json({ code: 400, message: '新密码长度6-32位', data: null });
    }

    const [rows] = await pool.query(
      'SELECT id, security_answer_hash FROM users WHERE username = ?',
      [username]
    );
    if (rows.length === 0) {
      return res.json({ code: 404, message: '用户不存在', data: null });
    }

    const u = rows[0];
    if (!u.security_answer_hash) {
      return res.json({ code: 400, message: '该用户未设置安全问题，请联系管理员', data: null });
    }

    const answerValid = await bcrypt.compare(answer, u.security_answer_hash);
    if (!answerValid) {
      return res.json({ code: 400, message: '安全问题答案错误', data: null });
    }

    const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, u.id]);

    res.json({ code: 0, message: '密码重置成功，请使用新密码登录', data: null });
  } catch (e) {
    console.error('Forgot reset error:', e);
    res.json({ code: 500, message: '重置失败，请稍后重试', data: null });
  }
});

router.post('/change-password', authRequired, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!isValidPassword(newPassword)) {
      return res.json({ code: 400, message: '新密码长度6-32位', data: null });
    }

    const [rows] = await pool.query('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) {
      return res.json({ code: 404, message: '用户不存在', data: null });
    }

    const isOldValid = await bcrypt.compare(oldPassword, rows[0].password_hash);
    if (!isOldValid) {
      return res.json({ code: 400, message: '原密码错误', data: null });
    }

    const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, req.user.id]);

    res.json({ code: 0, message: '密码修改成功', data: null });
  } catch (e) {
    console.error('Change password error:', e);
    res.json({ code: 500, message: '修改失败，请稍后重试', data: null });
  }
});

module.exports = router;
