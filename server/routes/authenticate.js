const express = require('express')
const router = express.Router()
const mysqlService = require('../services/mysqlService')

// 获取真伪鉴别列表
// GET /api/authenticate/list?page=1&pageSize=10&fraudType=冒充&keyword=茯苓
router.get('/list', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const pageSize = parseInt(req.query.pageSize) || 10
    const fraudType = req.query.fraudType || ''
    const keyword = (req.query.keyword || '').trim()

    const result = await mysqlService.getAuthenticationList(page, pageSize, fraudType, keyword)
    res.json({
      code: 0,
      message: '成功',
      data: result
    })
  } catch (e) {
    console.error('[authenticate] 获取列表失败:', e)
    res.json({ code: 500, message: '获取列表失败', data: null })
  }
})

// 获取真伪鉴别详情
// GET /api/authenticate/detail/:id
router.get('/detail/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    if (!id) {
      return res.json({ code: 400, message: '参数错误', data: null })
    }
    const detail = await mysqlService.getAuthenticationById(id)
    if (!detail) {
      return res.json({ code: 404, message: '鉴别数据不存在', data: null })
    }
    res.json({ code: 0, message: '成功', data: detail })
  } catch (e) {
    console.error('[authenticate] 获取详情失败:', e)
    res.json({ code: 500, message: '获取详情失败', data: null })
  }
})

// 根据药材名获取真伪鉴别（用于药材详情页联动）
// GET /api/authenticate/by-herb?herbName=茯苓  或  /api/authenticate/by-herb?herbId=123
router.get('/by-herb', async (req, res) => {
  try {
    const { herbName, herbId } = req.query
    if (!herbName && !herbId) {
      return res.json({ code: 400, message: '请提供药材名或药材ID', data: null })
    }
    const detail = await mysqlService.getAuthenticationByHerb(herbName, herbId ? parseInt(herbId) : null)
    res.json({ code: 0, message: '成功', data: detail })
  } catch (e) {
    console.error('[authenticate] 按药材查询失败:', e)
    res.json({ code: 500, message: '查询失败', data: null })
  }
})

// 获取所有造假方式分类（用于前端筛选标签）
// GET /api/authenticate/types
router.get('/types', async (req, res) => {
  try {
    const types = await mysqlService.getAuthenticationTypes()
    res.json({ code: 0, message: '成功', data: types })
  } catch (e) {
    console.error('[authenticate] 获取分类失败:', e)
    res.json({ code: 500, message: '获取分类失败', data: null })
  }
})

module.exports = router
