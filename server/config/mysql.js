require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') })
const mysql = require('mysql2/promise')

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT) || 3306,
  database: process.env.MYSQL_DATABASE || 'caomuyoufang',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.MYSQL_CONNECTION_LIMIT) || 10,
  queueLimit: 0,
  charset: 'utf8mb4'
})

async function testConnection() {
  let conn
  try {
    conn = await pool.getConnection()
    await conn.query('SELECT 1')
    console.log('[MySQL] 连接成功')
    return true
  } catch (error) {
    console.error('[MySQL] 连接失败:', error.message)
    return false
  } finally {
    if (conn) conn.release()
  }
}

async function initTables() {
  let conn
  try {
    conn = await pool.getConnection()

    await conn.query(`
      CREATE TABLE IF NOT EXISTS herbs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(50) NOT NULL,
        pinyin VARCHAR(100),
        alias TEXT,
        category VARCHAR(30),
        nature VARCHAR(20),
        taste VARCHAR(50),
        meridian VARCHAR(100),
        effect TEXT,
        indication TEXT,
        dosage VARCHAR(200),
        taboo TEXT,
        identify_points TEXT,
        image_type VARCHAR(20),
        keywords TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_herb_name (name),
        INDEX idx_herb_category (category),
        FULLTEXT INDEX ft_herb_search (name, keywords, effect)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    await conn.query(`
      CREATE TABLE IF NOT EXISTS key_identification (
        id INT PRIMARY KEY AUTO_INCREMENT,
        herb_id INT NOT NULL,
        smell TEXT,
        texture TEXT,
        cross_section TEXT,
        outer_skin TEXT,
        other TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uk_ki_herb_id (herb_id),
        FOREIGN KEY (herb_id) REFERENCES herbs(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    await conn.query(`
      CREATE TABLE IF NOT EXISTS classics (
        id INT PRIMARY KEY AUTO_INCREMENT,
        herb_id INT NOT NULL,
        book VARCHAR(100),
        content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (herb_id) REFERENCES herbs(id) ON DELETE CASCADE,
        INDEX idx_classics_herb_id (herb_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    await conn.query(`
      CREATE TABLE IF NOT EXISTS food_matches (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        herb_id INT,
        ingredients TEXT,
        effect TEXT,
        suitable TEXT,
        taboo TEXT,
        method TEXT,
        image VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (herb_id) REFERENCES herbs(id) ON DELETE SET NULL,
        INDEX idx_fm_herb_id (herb_id),
        FULLTEXT INDEX ft_fm_search (name, effect, ingredients)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    await conn.query(`
      CREATE TABLE IF NOT EXISTS herb_food_match (
        id INT PRIMARY KEY AUTO_INCREMENT,
        herb_id INT NOT NULL,
        food_match_id INT NOT NULL,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uk_hfm_herb_food (herb_id, food_match_id),
        FOREIGN KEY (herb_id) REFERENCES herbs(id) ON DELETE CASCADE,
        FOREIGN KEY (food_match_id) REFERENCES food_matches(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    await conn.query(`
      CREATE TABLE IF NOT EXISTS quiz_topics (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(50) NOT NULL,
        description TEXT,
        icon VARCHAR(50) DEFAULT '📚',
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uk_topic_name (name),
        INDEX idx_topic_sort (sort_order)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    await conn.query(`
      CREATE TABLE IF NOT EXISTS quiz_topic_category (
        id INT PRIMARY KEY AUTO_INCREMENT,
        topic_id INT NOT NULL,
        category VARCHAR(30) NOT NULL,
        UNIQUE KEY uk_topic_category (topic_id, category),
        INDEX idx_tc_topic (topic_id),
        FOREIGN KEY (topic_id) REFERENCES quiz_topics(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    await conn.query(`
      CREATE TABLE IF NOT EXISTS quizzes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        question TEXT NOT NULL,
        options TEXT,
        answer VARCHAR(10),
        explanation TEXT,
        difficulty VARCHAR(10),
        category VARCHAR(30),
        topic_id INT,
        herb_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (herb_id) REFERENCES herbs(id) ON DELETE SET NULL,
        FOREIGN KEY (topic_id) REFERENCES quiz_topics(id) ON DELETE SET NULL,
        INDEX idx_quiz_herb_id (herb_id),
        INDEX idx_quiz_category (category),
        INDEX idx_quiz_topic (topic_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    await conn.query(`
      CREATE TABLE IF NOT EXISTS herb_images (
        id INT PRIMARY KEY AUTO_INCREMENT,
        herb_id INT NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        sort_order INT DEFAULT 0,
        description VARCHAR(200),
        is_cover BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (herb_id) REFERENCES herbs(id) ON DELETE CASCADE,
        INDEX idx_herb_img_herb_id (herb_id),
        INDEX idx_herb_img_sort (herb_id, sort_order)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    await conn.query(`
      CREATE TABLE IF NOT EXISTS reference_images (
        id VARCHAR(64) PRIMARY KEY,
        herb_id INT NOT NULL,
        herb_name VARCHAR(32) NOT NULL,
        image_name VARCHAR(64) NOT NULL,
        is_synthetic BOOLEAN DEFAULT FALSE,
        features JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uk_ref_herb_image (herb_id, image_name),
        INDEX idx_ref_herb_id (herb_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    await conn.query(`
      CREATE TABLE IF NOT EXISTS pending_reference_images (
        id INT PRIMARY KEY AUTO_INCREMENT,
        herb_id INT NULL,
        herb_name VARCHAR(50) NOT NULL,
        original_result VARCHAR(50),
        image_path VARCHAR(500) NOT NULL,
        image_features JSON,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        submitter_note TEXT,
        reviewer_note TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reviewed_at TIMESTAMP NULL,
        INDEX idx_pending_status (status),
        INDEX idx_pending_herb_id (herb_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    try {
      await conn.query(`ALTER TABLE pending_reference_images
        MODIFY COLUMN herb_id INT NULL,
        DROP FOREIGN KEY pending_reference_images_ibfk_1
      `)
    } catch (e) {
      if (e.errno !== 1091) throw e
    }

    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        nickname VARCHAR(50),
        security_question VARCHAR(100) DEFAULT '您的昵称是什么？',
        security_answer_hash VARCHAR(255),
        role VARCHAR(20) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_username (username)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    await conn.query(`
      CREATE TABLE IF NOT EXISTS user_favorites (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        target_type VARCHAR(20) NOT NULL,
        target_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uk_uf_user_target (user_id, target_type, target_id),
        INDEX idx_uf_user (user_id, target_type),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    await conn.query(`
      CREATE TABLE IF NOT EXISTS wrong_questions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        question_id INT NOT NULL,
        topic_id INT,
        question TEXT NOT NULL,
        options TEXT NOT NULL,
        correct_answer VARCHAR(10) NOT NULL,
        user_answer VARCHAR(10) NOT NULL,
        explanation TEXT,
        category VARCHAR(30),
        difficulty VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uk_wq_user_question (user_id, question_id),
        INDEX idx_wq_user (user_id),
        INDEX idx_wq_topic (user_id, topic_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (topic_id) REFERENCES quiz_topics(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    await conn.query(`
      CREATE TABLE IF NOT EXISTS quiz_answers (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        question_id INT NOT NULL,
        topic_id INT,
        is_correct BOOLEAN NOT NULL,
        first_answer VARCHAR(10),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uk_qa_user_question (user_id, question_id),
        INDEX idx_qa_user (user_id),
        INDEX idx_qa_user_correct (user_id, is_correct),
        INDEX idx_qa_topic (user_id, topic_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (question_id) REFERENCES quizzes(id) ON DELETE CASCADE,
        FOREIGN KEY (topic_id) REFERENCES quiz_topics(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    // 兼容：给旧表加字段（必须放在对应 CREATE TABLE 之后）
    try {
      await conn.query(`ALTER TABLE users ADD COLUMN security_question VARCHAR(100) DEFAULT '您的昵称是什么？'`)
    } catch (e) { if (e.errno !== 1060) throw e }
    try {
      await conn.query(`ALTER TABLE users ADD COLUMN security_answer_hash VARCHAR(255)`)
    } catch (e) { if (e.errno !== 1060) throw e }
    try {
      await conn.query(`ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user'`)
    } catch (e) { if (e.errno !== 1060) throw e }

    try {
      await conn.query(`ALTER TABLE quizzes ADD COLUMN topic_id INT`)
    } catch (e) { if (e.errno !== 1060) throw e }
    try {
      await conn.query(`ALTER TABLE quiz_answers ADD COLUMN topic_id INT`)
    } catch (e) { if (e.errno !== 1060) throw e }
    try {
      await conn.query(`ALTER TABLE wrong_questions ADD COLUMN topic_id INT`)
    } catch (e) { if (e.errno !== 1060) throw e }

    // 真伪鉴别表：记录常见造假中药材的真品/伪品对比数据
    await conn.query(`
      CREATE TABLE IF NOT EXISTS herb_authentication (
        id INT PRIMARY KEY AUTO_INCREMENT,
        herb_name VARCHAR(50) NOT NULL,
        herb_id INT,
        counterfeiter VARCHAR(100),
        fraud_type VARCHAR(50),
        summary TEXT,
        key_points TEXT,
        genuine_features TEXT,
        fake_features TEXT,
        genuine_images TEXT,
        fake_images TEXT,
        source VARCHAR(100),
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_auth_herb_name (herb_name),
        INDEX idx_auth_fraud_type (fraud_type),
        INDEX idx_auth_herb_id (herb_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    console.log('[MySQL] 数据表初始化完成')
  } catch (error) {
    console.error('[MySQL] 数据表初始化失败:', error.message)
    throw error
  } finally {
    if (conn) conn.release()
  }
}

module.exports = {
  pool,
  testConnection,
  initTables
}
