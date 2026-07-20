const express = require('express');
const db = require('../config/db');
const { authRequired } = require('../middleware/auth');
const quizzes = require('../data/quizzes');
const fs = require('fs');
const path = require('path');
const paths = require('../config/paths');

const router = express.Router();
const WRONG_FILE = paths.WRONG_QUESTIONS;

function loadWrongQuestions() {
  try {
    return JSON.parse(fs.readFileSync(WRONG_FILE, 'utf8'));
  } catch (e) {
    return [];
  }
}

function saveWrongQuestions(data) {
  fs.writeFileSync(WRONG_FILE, JSON.stringify(data, null, 2));
}

router.post('/add', authRequired, (req, res) => {
  try {
    const { questionId, userAnswer, correctAnswer, question, options, explanation, category, difficulty } = req.body;
    
    if (!questionId || !userAnswer || !correctAnswer || !question || !options) {
      return res.json({ code: 400, message: '参数错误', data: null });
    }

    try {
      db.prepare(`
        INSERT OR IGNORE INTO wrong_questions 
        (user_id, question_id, question, options, correct_answer, user_answer, explanation, category, difficulty)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        req.user.id,
        questionId,
        question,
        JSON.stringify(options),
        correctAnswer,
        userAnswer,
        explanation,
        category,
        difficulty
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

router.get('/list', (req, res) => {
  try {
    const wrongList = loadWrongQuestions();
    const list = wrongList.map(w => {
      const q = quizzes.find(qz => qz.id === w.questionId);
      return q ? {
        id: w.questionId,
        question: q.question,
        options: q.options,
        answer: q.answer,
        explanation: q.explanation,
        category: q.category,
        difficulty: q.difficulty,
        wrong_count: w.count || 1
      } : null;
    }).filter(Boolean);
    res.json({ code: 0, message: 'ok', data: list });
  } catch (e) {
    console.error('Get wrong questions error:', e);
    res.json({ code: 500, message: '获取失败', data: [] });
  }
});

router.post('/remove', (req, res) => {
  try {
    const { id } = req.body;
    let wrongList = loadWrongQuestions();
    wrongList = wrongList.filter(w => w.questionId !== id);
    saveWrongQuestions(wrongList);
    res.json({ code: 0, message: '删除成功', data: null });
  } catch (e) {
    console.error('Remove wrong question error:', e);
    res.json({ code: 500, message: '删除失败', data: null });
  }
});

router.post('/submit', authRequired, (req, res) => {
  const { questionId, answer } = req.body;
  const question = quizzes.find(q => q.id === questionId);
  
  if (!question) {
    return res.json({
      code: 404,
      message: '题目不存在',
      data: null
    });
  }
  
  const isCorrect = answer === question.answer;
  
  if (!isCorrect) {
    try {
      db.prepare(`
        INSERT OR IGNORE INTO wrong_questions 
        (user_id, question_id, question, options, correct_answer, user_answer, explanation, category, difficulty)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        req.user.id,
        question.id,
        question.question,
        JSON.stringify(question.options),
        question.answer,
        answer,
        question.explanation,
        question.category,
        question.difficulty
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
});

module.exports = router;
