# 草木有方 Node 后端镜像
# 基于 node:20-slim，安装 native 模块编译依赖
FROM node:20-slim

# 设置时区
ENV TZ=Asia/Shanghai
RUN apt-get update && apt-get install -y --no-install-recommends tzdata \
  && ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone \
  && rm -rf /var/lib/apt/lists/*

# 安装系统依赖（canvas / sharp / better-sqlite3 编译所需）
RUN apt-get update && apt-get install -y --no-install-recommends \
  python3 make g++ \
  libpng-dev libjpeg-dev libgif-dev \
  libcairo2-dev libpango1.0-dev \
  libxml2-dev libvips-dev \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 先复制依赖文件，利用 Docker 缓存层
COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev

# 复制项目代码（含 server/data/assets 内置图片，随镜像分发）
COPY . .

# 确保用户上传目录存在（容器运行时挂载持久卷覆盖此目录）
RUN mkdir -p /app/server/uploads/feedback

EXPOSE 8080

# 健康检查
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:8080/api/health').then(r=>r.json()).then(d=>process.exit(d.code===0?0:1)).catch(()=>process.exit(1))"

# 启动命令
CMD ["node", "server/app.js"]
