/**
 * 更新现有用户安全问题为"您的昵称是什么？"
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool, testConnection } = require('../config/mysql');

(async () => {
  const ok = await testConnection();
  if (!ok) { console.error('MySQL 连接失败'); process.exit(1); }

  const [users] = await pool.query('SELECT id, username, nickname FROM users');

  for (const u of users) {
    const answer = u.nickname || u.username;
    const hash = await bcrypt.hash(answer, 10);
    await pool.query(
      'UPDATE users SET security_question = ?, security_answer_hash = ? WHERE id = ?',
      ['您的昵称是什么？', hash, u.id]
    );
    console.log(`  - ${u.username} (${u.nickname || '无昵称'}) 答案=${answer}`);
  }

  console.log(`\n共更新 ${users.length} 个用户`);
  await pool.end();
})();
