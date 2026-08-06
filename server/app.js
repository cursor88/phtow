require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs')

const { testConnection, initTables } = require('./config/mysql')

const app = express()
const PORT = process.env.PORT || 8080

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const paths = require('./config/paths');

if (!fs.existsSync(paths.UPLOAD_DIR)) {
  fs.mkdirSync(paths.UPLOAD_DIR, { recursive: true })
}

app.use('/api/herb', require('./routes/herb'))
app.use('/api/quiz', require('./routes/quiz'))
app.use('/api/match', require('./routes/match'))
app.use('/api/auth', require('./routes/auth'))
app.use('/api/favorite', require('./routes/favorite'))
app.use('/api/wrong-questions', require('./routes/wrong-questions'))
app.use('/api/checkin', require('./routes/checkin'))
app.use('/api/identify', require('./routes/identify'))
app.use('/api/constitution', require('./routes/constitution'))
app.use('/api/skill', require('./routes/skill'))
app.use('/api/chat', require('./routes/chat'))
app.use('/api/llm', require('./routes/llmConfig'))
app.use('/api/feedback', require('./routes/feedback'))
app.use('/api/admin', require('./routes/admin'))
app.use('/api/authenticate', require('./routes/authenticate'))

// 静态文件服务 - 提供前端页面
const projectRoot = paths.PUBLIC_DIR

// 禁用缓存中间件，确保前端更新立即生效
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private')
  res.set('Pragma', 'no-cache')
  res.set('Expires', '0')
  next()
})

app.use(express.static(projectRoot))
// 内置静态资源（药材图片、鉴别图片等，随镜像分发）
app.use('/static', express.static(path.join(__dirname, 'data/assets')))
// 用户上传文件（反馈图片等，挂载持久卷）
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.get('/', (req, res) => {
  res.sendFile(path.join(projectRoot, 'demo.html'))
})

app.get('/api/health', (req, res) => {
  res.json({
    code: 0,
    message: 'API服务运行正常',
    data: {
      status: 'ok',
      timestamp: new Date().toISOString()
    }
  })
})

app.get('/api/llm-status', (req, res) => {
  const llm = require('./services/llmService');
  res.json({
    code: 0,
    data: {
      enabled: llm.isEnabled(),
      provider: llm.isEnabled() ? llm.getProviderName() : null,
      model: llm.isEnabled() ? llm.getModel() : null
    }
  })
})

async function startServer() {
  const ok = await testConnection()
  if (!ok) {
    console.error('[启动] MySQL连接失败，服务未启动')
    process.exit(1)
  }

  await initTables()

  app.listen(PORT, () => {
    console.log(`\n========================================`)
    console.log(`  本草智识 - 后端API服务已启动`)
    console.log(`  服务地址: http://localhost:${PORT}`)
    console.log(`  健康检查: http://localhost:${PORT}/api/health`)
    console.log(`========================================\n`)
  })
}

startServer()
