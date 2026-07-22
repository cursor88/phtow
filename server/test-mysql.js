require('dotenv').config()
const { testConnection, initTables } = require('./config/mysql')

async function main() {
  console.log('测试 MySQL 连接...')
  console.log(`Host: ${process.env.MYSQL_HOST || 'localhost'}`)
  console.log(`Port: ${process.env.MYSQL_PORT || 3306}`)
  console.log(`User: ${process.env.MYSQL_USER || 'root'}`)
  console.log(`Database: ${process.env.MYSQL_DATABASE || 'caomuyoufang'}`)
  console.log()

  const connected = await testConnection()
  if (connected) {
    console.log('\n连接成功！正在初始化数据表...')
    await initTables()
    console.log('\n初始化完成！')
  } else {
    console.log('\n连接失败，请检查：')
    console.log('1. MySQL 服务是否启动')
    console.log('2. 用户名密码是否正确')
    console.log('3. 数据库是否已创建')
    console.log('4. .env 文件中的 MySQL 配置是否正确')
  }
  process.exit(connected ? 0 : 1)
}

main().catch(error => {
  console.error('测试失败:', error.message)
  process.exit(1)
})
