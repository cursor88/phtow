#!/bin/bash
# ============================================================
# 草木有方 - 一键更新部署脚本
# 在服务器上执行：./update.sh
# 功能：git pull → 重建 herb-api → 健康检查
# ============================================================

set -e
cd /opt/caomuyoufang

echo "===== 1. 拉取最新代码 ====="
git pull

echo ""
echo "===== 2. 重建并重启 herb-api ====="
docker compose up -d --build herb-api

echo ""
echo "===== 3. 等待启动 ====="
sleep 10

echo ""
echo "===== 4. 健康检查 ====="
if curl -s --max-time 5 http://localhost/api/health | grep -q '"code":0'; then
  echo "✓ 服务正常"
  docker compose ps
else
  echo "✗ 服务异常，查看日志："
  docker compose logs --tail 20 herb-api
fi
