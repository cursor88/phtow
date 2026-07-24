/**
 * 用户数据迁移脚本: SQLite -> MySQL
 *
 * 数据源:
 *   - server/data/app.db  (users / user_favorites / wrong_questions)
 *   - server/data/favoriteRecords.json  (匿名收藏,合并到 user_id=1)
 *   - server/data/wrongQuestions.json   (匿名错题,合并到 user_id=1)
 *
 * 目标: caomuyoufang.users / user_favorites / wrong_questions
 *
 * 运行: cd server && node scripts/migrate-users-to-mysql.js
 */
require('dotenv').config();
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const { pool, testConnection, initTables } = require('../config/mysql');

const SQLITE_PATH = path.join(__dirname, '../data/app.db');
const FAVORITE_JSON = path.join(__dirname, '../data/favoriteRecords.json');
const WRONG_JSON = path.join(__dirname, '../data/wrongQuestions.json');

const ANONYMOUS_USER_ID = 1;

async function migrate() {
  const sqliteOk = fs.existsSync(SQLITE_PATH);
  if (!sqliteOk) {
    console.log('[迁移] 未找到 SQLite 文件,跳过 SQLite 读取');
  }
  const sqliteDb = sqliteOk ? new Database(SQLITE_PATH) : null;

  const mysqlOk = await testConnection();
  if (!mysqlOk) {
    console.error('[迁移] MySQL 连接失败,中止');
    if (sqliteDb) sqliteDb.close();
    process.exit(1);
  }

  // 先初始化所有表(包含新增的 users/user_favorites/wrong_questions)
  await initTables();

  const stats = { users: 0, favs: 0, wrongs: 0, favsAnony: 0, wrongsAnony: 0 };

  try {
    // 1) 迁移 users
    const sqliteUsers = sqliteDb
      ? sqliteDb.prepare('SELECT id, username, password_hash, nickname, created_at, updated_at FROM users').all()
      : [];

    for (const u of sqliteUsers) {
      const [existing] = await pool.query('SELECT id FROM users WHERE username = ?', [u.username]);
      if (existing.length > 0) {
        console.log(`  - users.${u.username} 已存在,跳过`);
        continue;
      }
      // 显式插入时保留 SQLite 中的 id
      await pool.query(
        `INSERT INTO users (id, username, password_hash, nickname, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP))`,
        [u.id, u.username, u.password_hash, u.nickname || u.username, u.created_at || new Date(), u.updated_at || null]
      );
      // 重置 AUTO_INCREMENT 到当前 max(id)
      stats.users++;
    }
    if (sqliteUsers.length > 0) {
      const maxId = Math.max(...sqliteUsers.map(u => u.id));
      await pool.query('ALTER TABLE users AUTO_INCREMENT = ?', [maxId + 1]);
    }

    // 2) 迁移 user_favorites (有 user_id)
    const sqliteFavs = sqliteDb
      ? sqliteDb.prepare('SELECT user_id, target_type, target_id, created_at FROM user_favorites').all()
      : [];
    for (const f of sqliteFavs) {
      try {
        await pool.query(
          `INSERT INTO user_favorites (user_id, target_type, target_id, created_at)
           VALUES (?, ?, ?, ?)`,
          [f.user_id, f.target_type, f.target_id, f.created_at || new Date()]
        );
        stats.favs++;
      } catch (e) {
        if (e.code === 'ER_DUP_ENTRY') {
          console.log(`  - user_favorites(${f.user_id}, ${f.target_type}, ${f.target_id}) 已存在,跳过`);
        } else throw e;
      }
    }

    // 3) 迁移 wrong_questions (有 user_id)
    const sqliteWrongs = sqliteDb
      ? sqliteDb.prepare(`SELECT user_id, question_id, question, options, correct_answer, user_answer,
                                 explanation, category, difficulty, created_at
                          FROM wrong_questions`).all()
      : [];
    for (const w of sqliteWrongs) {
      try {
        await pool.query(
          `INSERT INTO wrong_questions (user_id, question_id, question, options, correct_answer,
                                        user_answer, explanation, category, difficulty, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [w.user_id, w.question_id, w.question, w.options, w.correct_answer, w.user_answer,
           w.explanation, w.category, w.difficulty, w.created_at || new Date()]
        );
        stats.wrongs++;
      } catch (e) {
        if (e.code === 'ER_DUP_ENTRY') {
          console.log(`  - wrong_questions(${w.user_id}, q${w.question_id}) 已存在,跳过`);
        } else throw e;
      }
    }

    // 4) 迁移 favoriteRecords.json (匿名 -> 归到 user_id=1 保留)
    if (fs.existsSync(FAVORITE_JSON)) {
      const json = JSON.parse(fs.readFileSync(FAVORITE_JSON, 'utf8'));
      const herbs = Array.isArray(json.herbs) ? json.herbs : [];
      const matches = Array.isArray(json.matches) ? json.matches : [];

      // 确保 user_id=1 存在(若 SQLite 中无该 id,则创建一个 system 用户)
      const [u1] = await pool.query('SELECT id FROM users WHERE id = ?', [ANONYMOUS_USER_ID]);
      if (u1.length === 0) {
        await pool.query(
          `INSERT INTO users (id, username, password_hash, nickname)
           VALUES (?, ?, ?, ?)`,
          [ANONYMOUS_USER_ID, '__anonymous__', '!no-login!', '匿名收藏']
        );
        await pool.query('ALTER TABLE users AUTO_INCREMENT = 2');
        console.log('  - 创建匿名用户 (id=1)');
      }

      for (const hid of herbs) {
        try {
          await pool.query(
            `INSERT INTO user_favorites (user_id, target_type, target_id) VALUES (?, 'herb', ?)`,
            [ANONYMOUS_USER_ID, hid]
          );
          stats.favsAnony++;
        } catch (e) {
          if (e.code !== 'ER_DUP_ENTRY') throw e;
        }
      }
      for (const mid of matches) {
        try {
          await pool.query(
            `INSERT INTO user_favorites (user_id, target_type, target_id) VALUES (?, 'match', ?)`,
            [ANONYMOUS_USER_ID, mid]
          );
          stats.favsAnony++;
        } catch (e) {
          if (e.code !== 'ER_DUP_ENTRY') throw e;
        }
      }
    }

    // 5) 迁移 wrongQuestions.json (匿名 -> 归到 user_id=1)
    if (fs.existsSync(WRONG_JSON)) {
      const arr = JSON.parse(fs.readFileSync(WRONG_JSON, 'utf8'));
      const mysqlService = require('../services/mysqlService');
      for (const item of arr) {
        const qid = item.questionId || item.id;
        if (!qid) continue;
        const quiz = await mysqlService.getQuizById(qid);
        if (!quiz) {
          console.log(`  - 错题 q${qid} 在 MySQL quizzes 中不存在,跳过`);
          continue;
        }
        try {
          await pool.query(
            `INSERT INTO wrong_questions (user_id, question_id, question, options, correct_answer,
                                          user_answer, explanation, category, difficulty)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [ANONYMOUS_USER_ID, quiz.id, quiz.question, JSON.stringify(quiz.options),
             quiz.answer, item.user_answer || item.userAnswer || 'A', quiz.explanation,
             quiz.category, quiz.difficulty]
          );
          stats.wrongsAnony++;
        } catch (e) {
          if (e.code !== 'ER_DUP_ENTRY') throw e;
        }
      }
    }

    console.log('\n=== 迁移完成 ===');
    console.log(`  users 迁移:        ${stats.users}`);
    console.log(`  user_favorites 迁移: ${stats.favs} (匿名+${stats.favsAnony})`);
    console.log(`  wrong_questions 迁移: ${stats.wrongs} (匿名+${stats.wrongsAnony})`);
  } catch (e) {
    console.error('[迁移] 失败:', e);
    process.exitCode = 1;
  } finally {
    if (sqliteDb) sqliteDb.close();
    await pool.end();
  }
}

migrate();
