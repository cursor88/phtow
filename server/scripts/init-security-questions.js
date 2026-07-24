/**
 * 给现有用户初始化默认安全问题
 * 默认问题：您的用户名是什么？  答案：用户名本身
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool, testConnection } = require('../config/mysql');

(async () => {
  const ok = await testConnection();
  if (!ok) { console.error('MySQL 连接失败'); process.exit(1); }

  const [users] = await pool.query(
    'SELECT id, username FROM users WHERE security_answer_hash IS NULL'
  );

  for (const u of users) {
    const hash = await bcrypt.hash(u.username, 10);
    await pool.query(
      'UPDATE users SET security_question = ?, security_answer_hash = ? WHERE id = ?',
      ['您的用户名是什么？', hash, u.id]
    );
    console.log(`  - ${u.username} 已设置默认安全问题`);
  }

  console.log(`\n共初始化 ${users.length} 个用户的安全问题`);
  await pool.end();
})();
