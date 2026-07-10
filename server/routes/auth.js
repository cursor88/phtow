const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
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
      return res.json({
        code: 400,
        message: '用户名长度3-20位，支持中英文、数字、下划线',
        data: null
      });
    }

    if (!isValidPassword(password)) {
      return res.json({
        code: 400,
        message: '密码长度6-32位',
        data: null
      });
    }

    const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existingUser) {
      return res.json({
        code: 400,
        message: '用户名已被注册',
        data: null
      });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const displayName = nickname || username;

    const result = db.prepare(`
      INSERT INTO users (username, password_hash, nickname)
      VALUES (?, ?, ?)
    `).run(username, passwordHash, displayName);

    const userId = result.lastInsertRowid;
    const user = {
      id: userId,
      username,
      nickname: displayName
    };

    const token = generateToken(user);

    res.json({
      code: 0,
      message: '注册成功',
      data: {
        token,
        user
      }
    });
  } catch (e) {
    console.error('Register error:', e);
    res.json({
      code: 500,
      message: '注册失败，请稍后重试',
      data: null
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.json({
        code: 400,
        message: '请输入用户名和密码',
        data: null
      });
    }

    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!user) {
      return res.json({
        code: 401,
        message: '用户名或密码错误',
        data: null
      });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.json({
        code: 401,
        message: '用户名或密码错误',
        data: null
      });
    }

    const userInfo = {
      id: user.id,
      username: user.username,
      nickname: user.nickname
    };

    const token = generateToken(userInfo);

    res.json({
      code: 0,
      message: '登录成功',
      data: {
        token,
        user: userInfo
      }
    });
  } catch (e) {
    console.error('Login error:', e);
    res.json({
      code: 500,
      message: '登录失败，请稍后重试',
      data: null
    });
  }
});

router.get('/profile', authRequired, (req, res) => {
  try {
    const user = db.prepare('SELECT id, username, nickname, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.json({
        code: 404,
        message: '用户不存在',
        data: null
      });
    }
    res.json({
      code: 0,
      message: 'ok',
      data: user
    });
  } catch (e) {
    console.error('Profile error:', e);
    res.json({
      code: 500,
      message: '获取用户信息失败',
      data: null
    });
  }
});

router.post('/change-password', authRequired, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!isValidPassword(newPassword)) {
      return res.json({
        code: 400,
        message: '新密码长度6-32位',
        data: null
      });
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.json({
        code: 404,
        message: '用户不存在',
        data: null
      });
    }

    const isOldValid = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isOldValid) {
      return res.json({
        code: 400,
        message: '原密码错误',
        data: null
      });
    }

    const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newHash, req.user.id);

    res.json({
      code: 0,
      message: '密码修改成功',
      data: null
    });
  } catch (e) {
    console.error('Change password error:', e);
    res.json({
      code: 500,
      message: '修改失败，请稍后重试',
      data: null
    });
  }
});

module.exports = router;
