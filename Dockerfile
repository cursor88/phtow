# 使用 Node.js 20 slim 版本（better-sqlite3/canvas/sharp 兼容性更好）
FROM node:20-slim

# 安装系统依赖（canvas、sharp、better-sqlite3 编译所需）
RUN apt-get update && apt-get install -y \
  python3 \
  make \
  g++ \
  libpng-dev \
  libjpeg-dev \
  libgif-dev \
  libcairo2-dev \
  libpango1.0-dev \
  libxml2-dev \
  libvips-dev \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 先复制依赖文件（利用 Docker 缓存层）
COPY server/package*.json ./server/
RUN cd server && npm ci --production

# 复制整个项目代码
COPY . .

# 数据目录已包含在 server/data 中，无需额外创建
# 确保 uploads 目录存在
RUN mkdir -p /app/server/uploads

# 暴露服务端口
EXPOSE 8080

# 启动命令
CMD ["node", "server/app.js"]
