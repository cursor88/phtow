const express = require('express')
const router = express.Router()
const herbs = require('../data/herbs')

const DATA_FILE = './server/data/identifyRecords.json'
const fs = require('fs')

function loadRecords() {
  try {
    return require('../data/identifyRecords.json')
  } catch (e) {
    return []
  }
}

function saveRecords(records) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(records))
}

function getRecordsList(page, pageSize) {
  let records = loadRecords()
  const detailedRecords = records.map(r => {
    const herb = herbs.find(h => h.id === r.herbId)
    return {
      ...r,
      herb: herb || null
    }
  })
  detailedRecords.sort((a, b) => b.timestamp - a.timestamp)
  const start = (page - 1) * pageSize
  const end = start + parseInt(pageSize)
  const list = detailedRecords.slice(start, end)
  return { list, total: detailedRecords.length }
}

router.get('/list', (req, res) => {
  const { page = 1, pageSize = 20 } = req.query
  const { list, total } = getRecordsList(page, pageSize)
  res.json({
    code: 0,
    message: '成功',
    data: {
      list,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    }
  })
})

router.get('/records', (req, res) => {
  const { page = 1, pageSize = 20 } = req.query
  const { list, total } = getRecordsList(page, pageSize)
  res.json({
    code: 0,
    message: '成功',
    data: {
      list,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    }
  })
})

router.post('/add', (req, res) => {
  const { herbId, herbName, accuracy, image, source } = req.body
  
  if (!herbId && !herbName) {
    return res.json({ code: -1, message: '缺少药材信息' })
  }
  
  const records = loadRecords()
  
  const newRecord = {
    id: Date.now(),
    herbId: parseInt(herbId) || null,
    herbName: herbName || '',
    accuracy: parseFloat(accuracy) || 0,
    image: image || '',
    source: source || 'local',
    timestamp: Date.now(),
    date: new Date().toISOString().split('T')[0]
  }
  
  records.push(newRecord)
  saveRecords(records)
  
  const herb = herbs.find(h => h.id === newRecord.herbId)
  
  res.json({
    code: 0,
    message: '保存成功',
    data: {
      ...newRecord,
      herb
    }
  })
})

router.get('/stats', (req, res) => {
  const records = loadRecords()
  
  const today = new Date().toISOString().split('T')[0]
  const todayCount = records.filter(r => r.date === today).length
  
  res.json({
    code: 0,
    message: '成功',
    data: {
      total: records.length,
      todayCount
    }
  })
})

router.post('/delete/:id', (req, res) => {
  const id = parseInt(req.params.id)
  let records = loadRecords()
  
  const index = records.findIndex(r => r.id === id)
  if (index === -1) {
    return res.json({ code: -1, message: '记录不存在' })
  }
  
  records.splice(index, 1)
  saveRecords(records)
  
  res.json({
    code: 0,
    message: '删除成功'
  })
})

module.exports = router
