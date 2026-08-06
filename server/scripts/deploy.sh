#!/bin/bash
# ============================================================
# 草木有方 - 腾讯云轻量 2G 服务器一键部署脚本
# 适用系统: Ubuntu 22.04 LTS
# 整合步骤: Swap → MySQL → Node → PM2 → Nginx → HTTPS
# 使用方法:
#   1. 上传整个 server 目录到服务器 /var/www/caomuyoufang
#   2. chmod +x deploy.sh && sudo ./deploy.sh
# ============================================================

set -e

# ---------- 配置区（可按需修改） ----------
PROJECT_DIR="/var/www/caomuyoufang/server"
APP_NAME="herb-api"
APP_ENTRY="app.js"
NODE_PORT=8080
DB_NAME="caomuyoufang"
DB_USER="herb"
# 数据库密码: 留空则脚本运行时随机生成并写入 .env
DB_PASSWORD=""
# 域名或公网 IP（用于 Nginx server_name）
SERVER_NAME=""
# 是否申请 HTTPS 证书 (1=是, 0=否)，申请需要已解析的域名
ENABLE_HTTPS=0
# 项目 SQL 备份文件路径（如有则自动导入，留空跳过）
SQL_DUMP_FILE=""
# uploads 压缩包路径（如有则自动解压，留空跳过）
UPLOADS_TAR=""
# ------------------------------------------

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log()  { echo -e "${GREEN}[$(date +%H:%M:%S)]${NC} $1"; }
warn() { echo -e "${YELLOW}[$(date +%H:%M:%S)] WARN:${NC} $1"; }
err()  { echo -e "${RED}[$(date +%H:%M:%S)] ERROR:${NC} $1"; }

# ---------- 前置检查 ----------
if [[ $EUID -ne 0 ]]; then
  err "请使用 root 或 sudo 执行本脚本"
  exit 1
fi

if [[ ! -f /etc/os-release ]] || ! grep -qi "ubuntu" /etc/os-release; then
  warn "本脚本针对 Ubuntu 22.04 设计，当前系统可能不兼容，继续执行可能出错"
  read -p "是否继续? (y/N): " yn
  [[ "$yn" =~ ^[Yy]$ ]] || exit 1
fi

# 交互收集缺失参数
if [[ -z "$SERVER_NAME" ]]; then
  read -p "请输入域名或公网IP（用于 Nginx 配置，回车跳过用本机IP）: " SERVER_NAME
fi
[[ -z "$SERVER_NAME" ]] && SERVER_NAME=$(curl -s --max-time 5 http://ifconfig.me || echo "localhost")

if [[ -z "$DB_PASSWORD" ]]; then
  DB_PASSWORD=$(openssl rand -base64 18 | tr -d '/+=' | cut -c1-20)
  warn "已自动生成数据库密码: $DB_PASSWORD （请记录，已写入 .env）"
fi

log "================ 开始部署 ================"
log "项目目录: $PROJECT_DIR"
log "服务名:   $APP_NAME (端口 $NODE_PORT)"
log "数据库:   $DB_NAME / 用户 $DB_USER"
log "Nginx:    $SERVER_NAME"
echo ""

# ---------- 步骤1: Swap ----------
log "[1/9] 配置 2G Swap"
if swapon --show | grep -q swapfile; then
  log "  Swap 已存在，跳过"
else
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
  sysctl -w vm.swappiness=20 >/dev/null
  grep -q 'vm.swappiness' /etc/sysctl.conf || echo 'vm.swappiness=20' >> /etc/sysctl.conf
  log "  Swap 已启用 2G"
fi

# ---------- 步骤2: 系统更新 + 基础工具 ----------
log "[2/9] 系统更新 + 安装基础工具"
apt update -y
apt install -y curl wget git build-essential python3 ca-certificates lsb-release \
               libcairo2-dev libjpeg-dev libpango1.0-dev libgif-dev librsvg2-dev

# ---------- 步骤3: MySQL 8 ----------
log "[3/9] 安装 MySQL 8"
if ! command -v mysql >/dev/null 2>&1; then
  apt install -y mysql-server
  mysql_secure_installation <<-EOF
y
${DB_PASSWORD}
${DB_PASSWORD}
y
y
y
y
EOF
  log "  MySQL 安装完成"
else
  log "  MySQL 已安装，跳过"
fi

# 内存优化配置（2G 服务器关键）
log "  写入 MySQL 内存优化配置"
cat > /etc/mysql/mysql.conf.d/z-herb-tuning.cnf <<EOF
[mysqld]
# 2G 轻量服务器内存优化
innodb_buffer_pool_size=256M
max_connections=50
key_buffer_size=32M
table_open_cache=200
table_definition_cache=200
performance_schema=OFF
thread_cache_size=8
query_cache_type=OFF
EOF

systemctl restart mysql
systemctl enable mysql >/dev/null 2>&1
log "  MySQL 已重启并应用优化配置"

# 创建数据库和用户（幂等）
log "  创建数据库 $DB_NAME 和用户 $DB_USER"
mysql -u root <<-SQL || true
CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
ALTER USER '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';
FLUSH PRIVILEGES;
SQL
log "  数据库与用户就绪"

# ---------- 步骤4: Node.js 20 ----------
log "[4/9] 安装 Node.js 20"
if ! command -v node >/dev/null 2>&1 || [[ "$(node -v)" < "v20" ]]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt install -y nodejs
fi
log "  Node.js 版本: $(node -v) / npm: $(npm -v)"

# PM2
if ! command -v pm2 >/dev/null 2>&1; then
  npm install -g pm2
fi
log "  PM2: $(pm2 --version)"

# ---------- 步骤5: Nginx ----------
log "[5/9] 安装 Nginx"
apt install -y nginx
systemctl enable nginx >/dev/null 2>&1
systemctl restart nginx
log "  Nginx 已安装"

# ---------- 步骤6: 项目代码与依赖 ----------
log "[6/9] 部署项目代码"
if [[ ! -d "$PROJECT_DIR" ]]; then
  err "项目目录不存在: $PROJECT_DIR"
  err "请先上传 server 目录到该路径（或修改脚本顶部 PROJECT_DIR）"
  exit 1
fi

cd "$PROJECT_DIR"
log "  安装生产依赖（可能需要几分钟，sharp/canvas 会编译 native 模块）"
npm install --omit=dev || { err "npm install 失败，请检查网络或重试 npm rebuild"; exit 1; }

# ---------- 步骤7: 生成 .env ----------
log "[7/9] 生成 .env 配置"
cat > "$PROJECT_DIR/.env" <<EOF
PORT=$NODE_PORT
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=$DB_NAME
MYSQL_USER=$DB_USER
MYSQL_PASSWORD=$DB_PASSWORD
MYSQL_CONNECTION_LIMIT=5
NODE_ENV=production
EOF
chmod 600 "$PROJECT_DIR/.env"
log "  .env 已写入 $PROJECT_DIR/.env"

# ---------- 数据导入 ----------
if [[ -n "$SQL_DUMP_FILE" && -f "$SQL_DUMP_FILE" ]]; then
  log "  导入 SQL 备份: $SQL_DUMP_FILE"
  mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < "$SQL_DUMP_FILE"
  log "  SQL 导入完成"
else
  warn "未指定 SQL_DUMP_FILE，跳过数据导入（首次启动时 initTables 会自动建表）"
fi

if [[ -n "$UPLOADS_TAR" && -f "$UPLOADS_TAR" ]]; then
  log "  解压 uploads: $UPLOADS_TAR"
  tar -xzf "$UPLOADS_TAR" -C "$PROJECT_DIR/.."
  log "  uploads 解压完成"
fi

# ---------- 步骤8: PM2 启动 ----------
log "[8/9] PM2 启动服务"
pm2 delete "$APP_NAME" >/dev/null 2>&1 || true
pm2 start "$APP_ENTRY" \
  --name "$APP_NAME" \
  --max-memory-restart 400M \
  --cwd "$PROJECT_DIR"
pm2 save
# 开机自启
pm2 startup systemd -u root --hp /root >/dev/null 2>&1 || true
log "  PM2 已启动 $APP_NAME (内存超 400M 自动重启)"

# 健康检查
sleep 3
if curl -s --max-time 5 "http://127.0.0.1:$NODE_PORT/api/health" | grep -q '"code":0'; then
  log "  健康检查通过 ✓"
else
  warn "  健康检查未通过，查看日志: pm2 logs $APP_NAME --lines 50"
fi

# ---------- 步骤9: Nginx 反向代理 ----------
log "[9/9] 配置 Nginx 反向代理"
cat > /etc/nginx/conf.d/herb.conf <<EOF
server {
    listen 80;
    server_name $SERVER_NAME;

    client_max_body_size 10M;
    proxy_read_timeout 120s;
    proxy_send_timeout 120s;

    # API 接口
    location /api/ {
        proxy_pass http://127.0.0.1:$NODE_PORT;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # 内置静态资源（药材图片、鉴别图片等，随代码分发）
    location /static/ {
        proxy_pass http://127.0.0.1:$NODE_PORT;
    }

    # 用户上传图片（反馈图片等）
    location /uploads/ {
        proxy_pass http://127.0.0.1:$NODE_PORT;
    }

    # 前端静态页面（demo.html 等）
    location / {
        proxy_pass http://127.0.0.1:$NODE_PORT;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
EOF

nginx -t && systemctl reload nginx
log "  Nginx 配置已生效 → http://$SERVER_NAME"

# ---------- HTTPS ----------
if [[ "$ENABLE_HTTPS" -eq 1 ]]; then
  log "申请 HTTPS 证书 (certbot)"
  apt install -y certbot python3-certbot-nginx
  certbot --nginx -d "$SERVER_NAME" --non-interactive --agree-tos --register-unsafely-without-email --redirect
  log "  HTTPS 已启用 → https://$SERVER_NAME"
fi

# ---------- 完成 ----------
echo ""
log "================ 部署完成 ================"
echo -e "${GREEN}服务地址:${NC}  http://$SERVER_NAME"
echo -e "${GREEN}健康检查:${NC}  http://$SERVER_NAME/api/health"
echo -e "${GREEN}PM2 状态:${NC}    pm2 status"
echo -e "${GREEN}PM2 日志:${NC}    pm2 logs $APP_NAME --lines 100"
echo -e "${GREEN}Nginx 日志:${NC}  tail -f /var/log/nginx/error.log"
echo ""
echo -e "${YELLOW}下一步:${NC}"
echo "  1. 小程序前端: uni.setStorageSync('serverOrigin', 'https://$SERVER_NAME')"
echo "  2. 微信公众平台 → 开发管理 → 服务器域名 添加 https://$SERVER_NAME"
echo "  3. 如有数据备份，请再次执行本脚本并设置 SQL_DUMP_FILE 完成数据导入"
echo ""
echo -e "${YELLOW}已生成的数据库密码（请妥善保存）:${NC}"
echo "  $DB_PASSWORD"
echo "  （已写入 $PROJECT_DIR/.env）"
