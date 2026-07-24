const express = require('express')
const router = express.Router()
const path = require('path')
const fs = require('fs')
const mysqlService = require('../services/mysqlService')
const paths = require('../config/paths')
const { authRequired } = require('../middleware/auth')

const DAILY_HERBS_FILE = paths.DAILY_HERBS
const CHECKIN_RECORDS_FILE = paths.CHECKIN_RECORDS

const getTodayStr = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

router.get('/daily-herb', async (req, res) => {
  const today = getTodayStr()
  let dailyHerbs = []
  try {
    const data = require('../data/dailyHerbs.json')
    dailyHerbs = data
  } catch (e) {
    dailyHerbs = []
  }
  
  let todayHerb = dailyHerbs.find(h => h.date === today)
  
  if (!todayHerb) {
    const allHerbs = await mysqlService.getAllHerbs()
    
    const availableHerbs = allHerbs.filter(h => {
      return !dailyHerbs.some(dh => dh.herbId === h.id && dh.date !== today)
    })
    
    if (availableHerbs.length === 0) {
      todayHerb = {
        date: today,
        herbId: allHerbs[Math.floor(Math.random() * allHerbs.length)].id,
        available: true
      }
    } else {
      const randomHerb = availableHerbs[Math.floor(Math.random() * availableHerbs.length)]
      todayHerb = {
        date: today,
        herbId: randomHerb.id,
        available: true
      }
    }
    
    dailyHerbs.push(todayHerb)
    saveJsonFile(DAILY_HERBS_FILE, dailyHerbs)
  }
  
  const herb = await mysqlService.getHerbById(todayHerb.herbId)
  res.json({
    code: 0,
    message: '成功',
    data: {
      ...todayHerb,
      herb: herb
    }
  })
})

router.get('/records', authRequired, async (req, res) => {
  let records = []
  try {
    const data = require('../data/checkinRecords.json')
    records = data.filter(r => !r.user_id || r.user_id === req.user.id)
  } catch (e) {
    records = []
  }
  
  const detailedRecords = []
  for (const r of records) {
    const herb = await mysqlService.getHerbById(r.herbId)
    detailedRecords.push({
      ...r,
      herb: herb
    })
  }
  
  res.json({
    code: 0,
    message: '成功',
    data: {
      list: detailedRecords,
      total: detailedRecords.length
    }
  })
})

router.post('/checkin', authRequired, async (req, res) => {
  const { herbId } = req.body
  
  if (!herbId) {
    return res.json({ code: -1, message: '请选择药材' })
  }
  
  const today = getTodayStr()
  const userId = req.user.id
  let records = []
  try {
    const data = require('../data/checkinRecords.json')
    records = data
  } catch (e) {
    records = []
  }
  
  const existingRecord = records.find(r => r.user_id === userId && r.date === today && r.herbId === herbId)
  if (existingRecord) {
    return res.json({ code: 0, message: '今日已打卡', data: { alreadyChecked: true } })
  }
  
  const newRecord = {
    id: Date.now(),
    user_id: userId,
    date: today,
    herbId: parseInt(herbId),
    timestamp: Date.now()
  }
  
  records.push(newRecord)

  saveJsonFile(CHECKIN_RECORDS_FILE, records)
  
  const herb = await mysqlService.getHerbById(newRecord.herbId)
  res.json({
    code: 0,
    message: '打卡成功',
    data: {
      record: { ...newRecord, herb }
    }
  })
})

router.get('/calendar', authRequired, async (req, res) => {
  const { year, month } = req.query
  const now = new Date()
  const targetYear = parseInt(year) || now.getFullYear()
  const targetMonth = parseInt(month) || now.getMonth() + 1
  const userId = req.user.id
  
  let records = []
  try {
    const data = require('../data/checkinRecords.json')
    records = data.filter(r => !r.user_id || r.user_id === userId)
  } catch (e) {
    records = []
  }
  
  const monthRecords = records.filter(r => {
    const d = new Date(r.date)
    return d.getFullYear() === targetYear && d.getMonth() + 1 === targetMonth
  })
  
  const calendarData = []
  for (const r of monthRecords) {
    const herb = await mysqlService.getHerbBrief(r.herbId)
    calendarData.push({
      date: r.date,
      herbId: r.herbId,
      herbName: herb ? herb.name : '',
      herbImage: herb ? (herb.cover_image_url || '') : ''
    })
  }
  
  res.json({
    code: 0,
    message: '成功',
    data: {
      year: targetYear,
      month: targetMonth,
      records: calendarData
    }
  })
})

router.get('/stats', authRequired, (req, res) => {
  const userId = req.user.id
  let records = []
  try {
    const data = require('../data/checkinRecords.json')
    records = data.filter(r => !r.user_id || r.user_id === userId)
  } catch (e) {
    records = []
  }
  
  const today = getTodayStr()
  const todayRecord = records.find(r => r.date === today)
  
  const consecutiveDays = calculateConsecutiveDays(records)
  
  const monthStats = calculateMonthStats(records)
  
  res.json({
    code: 0,
    message: '成功',
    data: {
      totalCount: records.length,
      todayChecked: !!todayRecord,
      consecutiveDays,
      monthStats
    }
  })
})

function calculateConsecutiveDays(records) {
  if (records.length === 0) return 0
  
  const dates = records.map(r => r.date).sort((a, b) => b.localeCompare(a))
  const uniqueDates = [...new Set(dates)]
  
  let count = 0
  const today = getTodayStr()
  const todayDate = new Date(today)
  
  for (let i = 0; i < uniqueDates.length; i++) {
    const recordDate = new Date(uniqueDates[i])
    const expectedDate = new Date(todayDate)
    expectedDate.setDate(todayDate.getDate() - i)
    
    const recordStr = `${recordDate.getFullYear()}-${String(recordDate.getMonth() + 1).padStart(2, '0')}-${String(recordDate.getDate()).padStart(2, '0')}`
    const expectedStr = `${expectedDate.getFullYear()}-${String(expectedDate.getMonth() + 1).padStart(2, '0')}-${String(expectedDate.getDate()).padStart(2, '0')}`
    
    if (recordStr === expectedStr) {
      count++
    } else {
      break
    }
  }
  
  return count
}

function calculateMonthStats(records) {
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()
  
  const monthRecords = records.filter(r => {
    const d = new Date(r.date)
    return d.getFullYear() === currentYear && d.getMonth() + 1 === currentMonth
  })
  
  return {
    month: currentMonth,
    year: currentYear,
    checkedDays: monthRecords.length,
    totalDays: new Date(currentYear, currentMonth, 0).getDate()
  }
}

function saveJsonFile(filePath, data) {
  try {
    const dir = path.dirname(filePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
  } catch (e) {
    console.error('[Checkin] 保存文件失败:', filePath, e.message)
  }
}

module.exports = router
