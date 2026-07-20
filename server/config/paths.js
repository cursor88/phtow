const path = require('path');

// 数据目录：通过环境变量配置，默认使用相对路径（兼容本地开发）
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '../data');
const CONFIG_DIR = process.env.CONFIG_DIR || path.join(__dirname, '../config');
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads');
const PUBLIC_DIR = process.env.PUBLIC_DIR || path.join(__dirname, '../..');

module.exports = {
  DATA_DIR,
  CONFIG_DIR,
  UPLOAD_DIR,
  PUBLIC_DIR,

  // JSON 数据文件
  CONSTITUTION_RECORDS: path.join(DATA_DIR, 'constitutionRecords.json'),
  DAILY_HERBS: path.join(DATA_DIR, 'dailyHerbs.json'),
  CHECKIN_RECORDS: path.join(DATA_DIR, 'checkinRecords.json'),
  QUIZ_STATE: path.join(DATA_DIR, 'quizState.json'),
  FAVORITE_RECORDS: path.join(DATA_DIR, 'favoriteRecords.json'),
  WRONG_QUESTIONS: path.join(DATA_DIR, 'wrongQuestions.json'),
  IDENTIFY_RECORDS: path.join(DATA_DIR, 'identifyRecords.json'),
  CHAT_HISTORY: path.join(DATA_DIR, 'chatHistory.json'),

  // 配置文件
  LLM_CONFIG: path.join(CONFIG_DIR, 'llm-config.json'),

  // SQLite 数据库
  DB_FILE: path.join(DATA_DIR, 'app.db'),

  // 知识库文件
  SKILL_MD: path.join(DATA_DIR, 'nihaixia/SKILL.md'),
  MODULES_DIR: path.join(DATA_DIR, 'nihaixia/modules'),

  // 图片目录
  REF_IMAGES_DIR: path.join(DATA_DIR, 'reference-images'),
};
