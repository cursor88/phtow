require('dotenv').config();
const { pool, testConnection } = require('../config/mysql');

(async () => {
  await testConnection();
  await pool.query("UPDATE users SET role = 'admin' WHERE username = 'fey'");
  const [rows] = await pool.query('SELECT id, username, nickname, role FROM users ORDER BY id');
  console.table(rows);
  await pool.end();
})();
