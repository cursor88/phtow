const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'herb-identify-app-default-secret-change-in-production';
const JWT_EXPIRES_IN = '7d';

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      role: user.role || 'user'
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return null;
  }
}

function authRequired(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.json({
      code: 401,
      message: '请先登录',
      data: null
    });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.json({
      code: 401,
      message: '登录已过期，请重新登录',
      data: null
    });
  }

  req.user = decoded;
  next();
}

function adminRequired(req, res, next) {
  authRequired(req, res, function() {
    if (req.user.role !== 'admin') {
      return res.json({
        code: 403,
        message: '无权限，仅超级管理员可访问',
        data: null
      });
    }
    next();
  });
}

module.exports = {
  generateToken,
  verifyToken,
  authRequired,
  adminRequired,
  JWT_SECRET
};
