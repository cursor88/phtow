const express = require('express')
const router = express.Router()
const quizzes = require('../data/quizzes')

const getDailyQuestion = () => {
  const today = new Date().toDateString()
  const hash = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const index = hash % quizzes.length
  return quizzes[index]
}

router.get('/daily', (req, res) => {
  const question = getDailyQuestion()
  
  res.json({
    code: 0,
    message: '成功',
    data: {
      id: question.id,
      question: question.question,
      options: question.options,
      difficulty: question.difficulty,
      category: question.category,
      herbId: question.herbId
    }
  })
})

router.get('/random', (req, res) => {
  const index = Math.floor(Math.random() * quizzes.length)
  const question = quizzes[index]
  
  res.json({
    code: 0,
    message: '成功',
    data: {
      id: question.id,
      question: question.question,
      options: question.options,
      difficulty: question.difficulty,
      category: question.category,
      herbId: question.herbId
    }
  })
})

router.post('/submit', (req, res) => {
  const { questionId, answer } = req.body
  const question = quizzes.find(q => q.id === questionId)
  
  if (!question) {
    return res.json({
      code: 404,
      message: '题目不存在',
      data: null
    })
  }
  
  const isCorrect = answer === question.answer
  
  res.json({
    code: 0,
    message: '成功',
    data: {
      questionId,
      isCorrect,
      correctAnswer: question.answer,
      explanation: question.explanation
    }
  })
})

router.get('/list', (req, res) => {
  const { page = 1, pageSize = 10, category = '', difficulty = '' } = req.query
  let filtered = quizzes
  
  if (category) {
    filtered = filtered.filter(q => q.category === category)
  }
  
  if (difficulty) {
    filtered = filtered.filter(q => q.difficulty === difficulty)
  }
  
  const start = (page - 1) * pageSize
  const end = start + parseInt(pageSize)
  const list = filtered.slice(start, end).map(q => ({
    id: q.id,
    question: q.question,
    options: q.options,
    difficulty: q.difficulty,
    category: q.category,
    herbId: q.herbId
  }))
  
  res.json({
    code: 0,
    message: '成功',
    data: {
      list,
      total: filtered.length,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    }
  })
})

router.get('/detail/:id', (req, res) => {
  const { id } = req.params
  const question = quizzes.find(q => q.id === parseInt(id))
  
  if (!question) {
    return res.json({
      code: 404,
      message: '题目不存在',
      data: null
    })
  }
  
  res.json({
    code: 0,
    message: '成功',
    data: {
      id: question.id,
      question: question.question,
      options: question.options,
      answer: question.answer,
      explanation: question.explanation,
      difficulty: question.difficulty,
      category: question.category,
      herbId: question.herbId
    }
  })
})

const quizStateFile = './server/data/quizState.json'
const fs = require('fs')

function loadQuizState() {
  try {
    return JSON.parse(fs.readFileSync(quizStateFile, 'utf8'))
  } catch (e) {
    return { correct: 0, total: 0, wrongIds: [] }
  }
}

function saveQuizState(state) {
  fs.writeFileSync(quizStateFile, JSON.stringify(state, null, 2))
}

router.get('/stats', (req, res) => {
  const state = loadQuizState()
  res.json({
    code: 0,
    message: '成功',
    data: {
      correct: state.correct || 0,
      total: state.total || 0
    }
  })
})

router.post('/answer', (req, res) => {
  const { qid, answer, correct } = req.body
  const state = loadQuizState()
  state.total = (state.total || 0) + 1
  if (correct) {
    state.correct = (state.correct || 0) + 1
  } else {
    if (qid && !state.wrongIds) state.wrongIds = []
    if (qid && state.wrongIds && !state.wrongIds.includes(qid)) {
      state.wrongIds.push(qid)
    }
  }
  saveQuizState(state)
  res.json({ code: 0, message: 'ok', data: { correct: state.correct, total: state.total } })
})

module.exports = router
