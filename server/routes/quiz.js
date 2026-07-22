const express = require('express')
const router = express.Router()
const path = require('path')
const fs = require('fs')
const mysqlService = require('../services/mysqlService')
const paths = require('../config/paths')

const toAnswerIndex = (answer) => {
  if (typeof answer === 'number') return answer
  if (typeof answer === 'string' && /^[A-Da-d]$/.test(answer)) {
    return answer.toUpperCase().charCodeAt(0) - 65
  }
  return 0
}

const getDailyQuestion = async () => {
  const today = new Date().toDateString()
  const hash = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  
  const { list, total } = await mysqlService.getQuizzes(1, 100)
  if (total === 0) return null
  
  const index = hash % total
  return list[index] || list[0]
}

router.get('/daily', async (req, res) => {
  const question = await getDailyQuestion()

  if (!question) {
    return res.json({
      code: 404,
      message: '暂无题目',
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
      answer: toAnswerIndex(question.answer),
      explanation: question.explanation,
      difficulty: question.difficulty,
      category: question.category,
      herbId: question.herb_id
    }
  })
})

router.get('/random', async (req, res) => {
  const { list, total } = await mysqlService.getQuizzes(1, 100)
  
  if (total === 0) {
    return res.json({
      code: 404,
      message: '暂无题目',
      data: null
    })
  }
  
  const index = Math.floor(Math.random() * total)
  const question = list[index] || list[0]

  res.json({
    code: 0,
    message: '成功',
    data: {
      id: question.id,
      question: question.question,
      options: question.options,
      answer: toAnswerIndex(question.answer),
      explanation: question.explanation,
      difficulty: question.difficulty,
      category: question.category,
      herbId: question.herb_id
    }
  })
})

router.post('/submit', async (req, res) => {
  const { questionId, answer } = req.body
  const question = await mysqlService.getQuizById(questionId)

  if (!question) {
    return res.json({
      code: 404,
      message: '题目不存在',
      data: null
    })
  }

  const userAnswerIdx = toAnswerIndex(answer)
  const correctAnswerIdx = toAnswerIndex(question.answer)
  const isCorrect = userAnswerIdx === correctAnswerIdx

  res.json({
    code: 0,
    message: '成功',
    data: {
      questionId,
      isCorrect,
      correctAnswer: correctAnswerIdx,
      explanation: question.explanation
    }
  })
})

router.get('/list', async (req, res) => {
  const { page = 1, pageSize = 10, category = '', difficulty = '', keyword = '' } = req.query

  const { list, total } = await mysqlService.getQuizzes(page, pageSize, category, null, keyword)

  const result = list.map(q => ({
    id: q.id,
    question: q.question,
    options: q.options,
    answer: toAnswerIndex(q.answer),
    explanation: q.explanation,
    difficulty: q.difficulty,
    category: q.category,
    herbId: q.herb_id
  }))

  res.json({
    code: 0,
    message: '成功',
    data: {
      list: result,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    }
  })
})

router.get('/detail/:id', async (req, res) => {
  const { id } = req.params
  const question = await mysqlService.getQuizById(parseInt(id))
  
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
      answer: toAnswerIndex(question.answer),
      explanation: question.explanation,
      difficulty: question.difficulty,
      category: question.category,
      herbId: question.herb_id
    }
  })
})

const quizStateFile = paths.QUIZ_STATE

function loadQuizState() {
  try {
    return JSON.parse(fs.readFileSync(quizStateFile, 'utf8'))
  } catch (e) {
    return { correct: 0, total: 0, wrongIds: [] }
  }
}

function saveQuizState(state) {
  try {
    const dir = path.dirname(quizStateFile)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(quizStateFile, JSON.stringify(state, null, 2))
  } catch (e) {
    console.error('[Quiz] 保存状态失败:', e.message)
  }
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

router.post('/answer', async (req, res) => {
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
    // 同步写入错题本
    try {
      const wrongFile = paths.WRONG_QUESTIONS
      let wrongList = []
      try { wrongList = JSON.parse(fs.readFileSync(wrongFile, 'utf8')) } catch (e) { wrongList = [] }
      const existing = wrongList.find(w => w.questionId === qid)
      if (existing) {
        existing.count = (existing.count || 1) + 1
      } else {
        wrongList.push({ questionId: qid, count: 1 })
      }
      fs.writeFileSync(wrongFile, JSON.stringify(wrongList, null, 2))
    } catch (e) {
      console.error('[Quiz] 写入错题本失败:', e.message)
    }
  }
  saveQuizState(state)
  res.json({ code: 0, message: 'ok', data: { correct: state.correct, total: state.total } })
})

module.exports = router
