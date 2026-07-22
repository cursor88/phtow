const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { pool } = require('../config/mysql')
const { extractFeatures } = require('../services/imageSearchService')

const router = express.Router()

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '../data/feedback-images')
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, 'feedback-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ storage })

router.post('/identify-correction', upload.single('image'), async (req, res) => {
  try {
    const { herbId, herbName, originalResult, note } = req.body

    if (!herbName || !herbName.trim()) {
      return res.json({ code: 400, message: '请输入药材名称', data: null })
    }

    if (!req.file) {
      return res.json({ code: 400, message: '请上传图片', data: null })
    }

    const imagePath = req.file.path
    let features = null

    try {
      const buffer = fs.readFileSync(imagePath)
      features = extractFeatures(buffer)
    } catch (e) {
      console.warn('[反馈] 特征提取失败:', e.message)
    }

    const parsedHerbId = parseInt(herbId) || 0

    const [result] = await pool.query(
      `INSERT INTO pending_reference_images 
       (herb_id, herb_name, original_result, image_path, image_features, submitter_note, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [parsedHerbId, herbName.trim(), originalResult || null, imagePath, features ? JSON.stringify(features) : null, note || null]
    )

    res.json({
      code: 0,
      message: '感谢您的反馈！我们将审核后入库',
      data: { id: result.insertId }
    })
  } catch (error) {
    console.error('[反馈] 提交纠错失败:', error)
    res.json({ code: 500, message: '提交失败', data: null })
  }
})

router.get('/correction-stats', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT status, COUNT(*) as count 
      FROM pending_reference_images 
      GROUP BY status
    `)
    const stats = { pending: 0, approved: 0, rejected: 0 }
    rows.forEach(r => { stats[r.status] = r.count })
    res.json({ code: 0, message: 'ok', data: stats })
  } catch (error) {
    console.error('[反馈] 获取统计失败:', error)
    res.json({ code: 500, message: '获取失败', data: null })
  }
})

module.exports = router
