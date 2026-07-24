const express = require('express')
const fs = require('fs')
const { pool } = require('../config/mysql')
const { addReferenceImage } = require('../services/imageSearchService')
const { adminRequired } = require('../middleware/auth')

const router = express.Router()

router.get('/pending-images', adminRequired, async (req, res) => {
  try {
    const { status = 'pending', page = 1, pageSize = 20 } = req.query
    const offset = (parseInt(page) - 1) * parseInt(pageSize)

    const [rows] = await pool.query(
      `SELECT p.*, h.name as correct_name, h.category 
       FROM pending_reference_images p
       LEFT JOIN herbs h ON p.herb_id = h.id
       WHERE p.status = ?
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [status, parseInt(pageSize), offset]
    )

    const [countRows] = await pool.query(
      'SELECT COUNT(*) as total FROM pending_reference_images WHERE status = ?',
      [status]
    )

    res.json({
      code: 0,
      message: 'ok',
      data: {
        list: rows,
        total: countRows[0].total,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    })
  } catch (error) {
    console.error('[管理] 获取待审核列表失败:', error)
    res.json({ code: 500, message: '获取失败', data: null })
  }
})

router.post('/approve-image/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { reviewerNote } = req.body

    const [rows] = await pool.query(
      'SELECT * FROM pending_reference_images WHERE id = ? AND status = "pending"',
      [id]
    )

    if (rows.length === 0) {
      return res.json({ code: 404, message: '记录不存在或已处理', data: null })
    }

    const record = rows[0]
    let herbId = record.herb_id

    if (!herbId || herbId === 0) {
      const [existingHerb] = await pool.query(
        'SELECT id FROM herbs WHERE name = ?',
        [record.herb_name]
      )

      if (existingHerb.length > 0) {
        herbId = existingHerb[0].id
      } else {
        const [insertResult] = await pool.query(
          'INSERT INTO herbs (name) VALUES (?)',
          [record.herb_name]
        )
        herbId = insertResult.insertId
      }
    }

    try {
      const buffer = fs.readFileSync(record.image_path)
      await addReferenceImage(herbId, record.herb_name, buffer, `feedback-${id}`)
    } catch (e) {
      console.warn('[管理] 加入参考库失败:', e.message)
    }

    await pool.query(
      `UPDATE pending_reference_images 
       SET status = 'approved', herb_id = ?, reviewer_note = ?, reviewed_at = NOW() 
       WHERE id = ?`,
      [herbId, reviewerNote || null, id]
    )

    res.json({ code: 0, message: '已通过并入库', data: null })
  } catch (error) {
    console.error('[管理] 审核通过失败:', error)
    res.json({ code: 500, message: '操作失败', data: null })
  }
})

router.post('/reject-image/:id', adminRequired, async (req, res) => {
  try {
    const { id } = req.params
    const { reviewerNote } = req.body

    const [result] = await pool.query(
      `UPDATE pending_reference_images 
       SET status = 'rejected', reviewer_note = ?, reviewed_at = NOW() 
       WHERE id = ? AND status = 'pending'`,
      [reviewerNote || null, id]
    )

    if (result.affectedRows === 0) {
      return res.json({ code: 404, message: '记录不存在或已处理', data: null })
    }

    res.json({ code: 0, message: '已拒绝', data: null })
  } catch (error) {
    console.error('[管理] 审核拒绝失败:', error)
    res.json({ code: 500, message: '操作失败', data: null })
  }
})

router.get('/dashboard-stats', adminRequired, async (req, res) => {
  try {
    const [pendingRows] = await pool.query(
      'SELECT COUNT(*) as count FROM pending_reference_images WHERE status = "pending"'
    )
    const [approvedRows] = await pool.query(
      'SELECT COUNT(*) as count FROM pending_reference_images WHERE status = "approved"'
    )
    const [rejectedRows] = await pool.query(
      'SELECT COUNT(*) as count FROM pending_reference_images WHERE status = "rejected"'
    )
    const [recentRows] = await pool.query(
      `SELECT p.*, h.name as correct_name 
       FROM pending_reference_images p
       LEFT JOIN herbs h ON p.herb_id = h.id
       ORDER BY p.created_at DESC LIMIT 5`
    )

    res.json({
      code: 0,
      message: 'ok',
      data: {
        pending: pendingRows[0].count,
        approved: approvedRows[0].count,
        rejected: rejectedRows[0].count,
        recent: recentRows
      }
    })
  } catch (error) {
    console.error('[管理] 获取仪表盘失败:', error)
    res.json({ code: 500, message: '获取失败', data: null })
  }
})

module.exports = router
