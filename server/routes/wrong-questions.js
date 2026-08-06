const express = require('express');
const { pool } = require('../config/mysql');
const { authRequired } = require('../middleware/auth');
const mysqlService = require('../services/mysqlService');

const router = express.Router();

function safeParseOptions(options) {
  if (!options) return [];
  if (Array.isArray(options)) return options;
  if (typeof options === 'string') {
    try {
      if (options.startsWith('[')) return JSON.parse(options);
    } catch (e) {}
    return options.split('|').map(s => s.trim()).filter(Boolean);
  }
  return [];
}

function toAnswerIndex(answer) {
  if (typeof answer === 'number') return answer;
  if (typeof answer === 'string' && /^[A-Da-d]$/.test(answer)) return answer.toUpperCase().charCodeAt(0) - 65;
  return 0;
}

router.post('/add', authRequired, async (req, res) => {
  try {
    const { questionId, userAnswer, correctAnswer, question, options, explanation, category, difficulty } = req.body;

    if (!questionId || userAnswer === undefined || userAnswer === null || correctAnswer === undefined || correctAnswer === null || !question || !options) {
      return res.json({ code: 400, message: '参数错误', data: null });
    }

    try {
      await pool.query(
        `INSERT IGNORE INTO wrong_questions
         (user_id, question_id, question, options, correct_answer, user_answer, explanation, category, difficulty)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          req.user.id,
          questionId,
          question,
          JSON.stringify(options),
          correctAnswer,
          userAnswer,
          explanation,
          category,
          difficulty
        ]
      );
    } catch (e) {
      console.error('Add wrong question error:', e);
    }

    res.json({ code: 0, message: 'ok', data: null });
  } catch (e) {
    console.error('Add wrong question error:', e);
    res.json({ code: 500, message: '操作失败', data: null });
  }
});

router.get('/list', authRequired, async (req, res) => {
  try {
    const { topic_id } = req.query
    let query = 'SELECT * FROM wrong_questions WHERE user_id = ?'
    const params = [req.user.id]
    
    if (topic_id) {
      query += ' AND topic_id = ?'
      params.push(topic_id)
    }
    
    query += ' ORDER BY created_at DESC'
    
    const [rows] = await pool.query(query, params);

    const list = rows.map(r => ({
      id: r.question_id,
      question: r.question,
      options: safeParseOptions(r.options),
      answer: toAnswerIndex(r.correct_answer),
      userAnswer: toAnswerIndex(r.user_answer),
      explanation: r.explanation,
      category: r.category,
      difficulty: r.difficulty,
      topicId: r.topic_id,
      wrong_count: 1,
      wrong_at: r.created_at
    }));

    res.json({ code: 0, message: 'ok', data: list });
  } catch (e) {
    console.error('Get wrong questions error:', e);
    res.json({ code: 500, message: '获取失败', data: [] });
  }
});

router.post('/remove', authRequired, async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.json({ code: 400, message: '参数错误', data: null });
    }
    await pool.query(
      'DELETE FROM wrong_questions WHERE user_id = ? AND question_id = ?',
      [req.user.id, id]
    );
    res.json({ code: 0, message: '删除成功', data: null });
  } catch (e) {
    console.error('Remove wrong question error:', e);
    res.json({ code: 500, message: '删除失败', data: null });
  }
});

router.post('/clear', authRequired, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM wrong_questions WHERE user_id = ?',
      [req.user.id]
    );
    res.json({ code: 0, message: '清空成功', data: null });
  } catch (e) {
    console.error('Clear wrong questions error:', e);
    res.json({ code: 500, message: '清空失败', data: null });
  }
});

router.post('/submit', authRequired, async (req, res) => {
  try {
    const { questionId, answer } = req.body;
    if (!questionId || !answer) {
      return res.json({ code: 400, message: '参数错误', data: null });
    }

    const question = await mysqlService.getQuizById(questionId);
    if (!question) {
      return res.json({ code: 404, message: '题目不存在', data: null });
    }

    const isCorrect = String(answer).toUpperCase() === String(question.answer).toUpperCase();

    if (!isCorrect) {
      try {
        await pool.query(
          `INSERT IGNORE INTO wrong_questions
           (user_id, question_id, question, options, correct_answer, user_answer, explanation, category, difficulty)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            req.user.id,
            question.id,
            question.question,
            typeof question.options === 'string' ? question.options : JSON.stringify(question.options),
            question.answer,
            answer,
            question.explanation,
            question.category,
            question.difficulty
          ]
        );
      } catch (e) {
        console.error('Auto add wrong question error:', e);
      }
    }

    res.json({
      code: 0,
      message: '成功',
      data: {
        questionId,
        isCorrect,
        correctAnswer: question.answer,
        explanation: question.explanation
      }
    });
  } catch (e) {
    console.error('Submit error:', e);
    res.json({ code: 500, message: '提交失败', data: null });
  }
});

module.exports = router;
