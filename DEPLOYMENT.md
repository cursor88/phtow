# 草木有方 - 腾讯云轻量服务器部署文档

> 部署环境：腾讯云轻量 2G 内存 / Ubuntu 22.04 / Docker Compose
> 部署时间：2026-08-05
> 公网 IP：106.52.158.137（示例，替换为你自己的）

---

## 目录

1. [架构总览](#1-架构总览)
2. [本地准备](#2-本地准备)
3. [服务器准备](#3-服务器准备)
4. [部署文件说明](#4-部署文件说明)
5. [部署步骤](#5-部署步骤)
6. [数据导入](#6-数据导入)
7. [图片导入](#7-图片导入)
8. [小程序配置](#8-小程序配置)
9. [日常运维命令](#9-日常运维命令)
10. [常见问题排查](#10-常见问题排查)
11. [日常更新部署（必读）](#11-日常更新部署必读)
12. [**镜像部署方案（源码不外泄）**](#12-镜像部署方案源码不外泄)

---

## 1. 架构总览

```
微信小程序 / 浏览器
        ↓
   http://公网IP  (端口 80)
        ↓
┌─────────────────────────────────────┐
│  Nginx 容器 (herb-nginx)            │
│  监听 80，反向代理                   │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│  Node.js 容器 (herb-api)            │
│  Express + MySQL，监听 8080          │
│  内存超 400M 自动重启                 │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│  MySQL 8 容器 (herb-mysql)          │
│  仅内部网络访问，不对外暴露           │
│  innodb_buffer_pool_size=128M       │
└─────────────────────────────────────┘
```

**三个容器通过 Docker 内部网络 `herb-net` 通信**，只有 Nginx 的 80 端口映射到宿主机，安全且简洁。

### 两种部署方式对比

本项目支持两种 Docker 部署方式，**首次部署建议用方式 A**，生产环境可切换到方式 B。

| 对比项 | 方式 A：源码+现场构建（默认） | 方式 B：镜像部署 |
|--------|------------------------------|-----------------|
| 服务器上存放 | 完整源代码 + Dockerfile | 只有 docker-compose.yml + 环境变量 |
| 构建时机 | 服务器上 `docker compose build` | 本地构建后推送到镜像仓库 |
| 源码是否外泄 | 服务器上可见源码 | 服务器上无源码 |
| 更新方式 | `git pull + build` | `docker pull + up -d` |
| 更新复杂度 | 1 条命令 | 2 步（本地推+服务器拉） |
| 适合阶段 | 开发调试/个人项目 | 生产环境/团队协作 |
| 文档章节 | 第 5 节（部署步骤） | 第 12 节（镜像部署） |

> 💡 **为什么方式 A 服务器上有完整源码？**
> Dockerfile 里的 `COPY . .` 会把宿主机的源码复制进镜像。源码是**构建材料**，容器运行时执行的是镜像里的代码，不是直接读宿主机源码。
>
> 如担心源码安全，请使用 [方式 B：第 12 节镜像部署](#12-镜像部署方案源码不外泄)。

### 内存分配（2G 服务器）

| 组件 | 内存限制 | 说明 |
|------|---------|------|
| 系统 + Docker | ~200M | 不可压缩 |
| MySQL | 512M | `mem_limit` 限制 |
| Node.js | 512M | `mem_limit` + PM2 400M 重启 |
| Nginx | 128M | 轻量反代 |
| Swap | 2G | 内存不足时兜底 |
| **合计** | ~1.3G | 剩余 ~700M 余量 |

---

## 2. 本地准备

### 2.1 数据库导出（不依赖 mysqldump）

项目自带纯 Node 导出脚本，无需安装 mysqldump：

```bash
cd d:\trae-project\caomuyoufang
node server/scripts/export-db.js
```

**输出文件**：`server/scripts/caomuyoufang.sql`（约 770 KB）

> ⚠️ 导出脚本已修复 Date 字段格式问题，使用 `toISOString()` 输出 MySQL 兼容的 `YYYY-MM-DD HH:MM:SS` 格式。

### 2.2 打包项目代码

在项目根目录执行（PowerShell）：

```powershell
cd d:\trae-project\caomuyoufang

# 打包项目代码（排除 node_modules、.git、用户上传目录等大文件）
# 注意：server/data/assets/（内置药材图片）会打包进 tar，随镜像分发，不排除
tar -cf caomuyoufang-deploy.tar --exclude=node_modules --exclude=.git --exclude=dist --exclude=server/uploads --exclude=uploads.tar.gz --exclude=caomuyoufang-deploy.tar .
```

**产物**：`caomuyoufang-deploy.tar`（约 99 MB）

### 2.3 打包用户上传图片

```powershell
cd d:\trae-project\caomuyoufang
tar -czf uploads.tar.gz server/uploads
```

**产物**：`uploads.tar.gz`（仅用户上传的反馈图片，体积很小）

> 内置药材图片已随项目代码打包进 `caomuyoufang-deploy.tar`（位于 `server/data/assets/`），构建 Docker 镜像时会 COPY 进镜像，无需单独导入。

### 2.4 上传到服务器

```powershell
$SERVER = "root@你的IP"   # 例如 root@106.52.158.137

# 创建服务器目录
ssh $SERVER "mkdir -p /opt/caomuyoufang/init-sql"

# 上传三个文件
scp caomuyoufang-deploy.tar $SERVER:/opt/caomuyoufang/
scp server/scripts/caomuyoufang.sql $SERVER:/opt/caomuyoufang/init-sql/
scp uploads.tar.gz $SERVER:/opt/caomuyoufang/
```

---

## 3. 服务器准备

### 3.1 系统要求

- 腾讯云轻量应用服务器 2G 内存
- Ubuntu 22.04 LTS
- 已安装 Docker（含 docker compose 插件）

### 3.2 防火墙配置

腾讯云控制台 → 轻量应用服务器 → 防火墙，放行：

| 协议 | 端口 | 来源 | 说明 |
|------|------|------|------|
| TCP | 80 | 0.0.0.0/0 | HTTP 访问 |
| TCP | 22 | 你的IP/0.0.0.0/0 | SSH 管理 |

> ⚠️ **不要**放行 8080、3306，这些仅容器内部使用。

### 3.3 安装 Docker（如未安装）

```bash
curl -fsSL https://get.docker.com | bash
```

---

## 4. 部署文件说明

项目根目录下的部署相关文件：

```
caomuyoufang/
├── Dockerfile                    # Node 后端镜像（国内加速版）
├── docker-compose.yml            # 编排 MySQL + Node + Nginx
├── .env.docker                   # 环境变量配置（数据库密码等）
├── .dockerignore                 # Docker 构建排除文件
├── nginx/
│   └── nginx.conf                # Nginx 反向代理配置
└── server/
    └── scripts/
        ├── export-db.js          # 数据库导出脚本（本地用）
        ├── deploy.sh             # 非 Docker 部署脚本（备用）
        └── docker-deploy.sh      # Docker 部署脚本（服务器用）
```

### 4.1 Dockerfile 要点

- 基础镜像：`docker.m.daocloud.io/library/node:20-slim`（国内加速）
- apt 源：清华镜像
- npm 源：npmmirror
- 时区：Asia/Shanghai
- 安装 native 模块编译依赖（canvas/sharp/better-sqlite3）
- 健康检查：`/api/health` 接口

### 4.2 docker-compose.yml 要点

- **MySQL**：`mem_limit: 512m`，`innodb_buffer_pool_size=128M`，不对外暴露端口
- **herb-api**：`mem_limit: 512m`，`--max-memory-restart 400M`，依赖 MySQL healthy
- **Nginx**：仅 128M，监听宿主机 80 端口
- **Volumes**：`mysql_data`（数据库持久化）、`uploads_data`（用户上传图片）
- **init-sql**：MySQL 首次启动自动导入 `init-sql/caomuyoufang.sql`

### 4.3 环境变量（.env.docker）

```ini
MYSQL_ROOT_PASSWORD=herb_root_2024
MYSQL_DATABASE=caomuyoufang
MYSQL_USER=herb
MYSQL_PASSWORD=herb_pass_2024
```

> 生产环境请修改为强密码！

---

## 5. 部署步骤

### 5.1 SSH 登录服务器

```bash
ssh root@你的IP
```

### 5.2 解压项目代码

```bash
cd /opt/caomuyoufang
tar -xf caomuyoufang-deploy.tar
```

### 5.3 配置环境变量

```bash
cd /opt/caomuyoufang

# 复制环境变量文件（如需修改密码，编辑 .env）
cp .env.docker .env
```

### 5.4 构建并启动容器

```bash
cd /opt/caomuyoufang

# 构建镜像并启动（首次约 5-10 分钟）
docker compose up -d
```

### 5.5 查看启动状态

```bash
# 等待 30 秒让服务完全启动
sleep 30

# 查看容器状态
docker compose ps
```

**预期输出**：三个容器都是 `Up (healthy)`

```
NAME         IMAGE                                    STATUS                    PORTS
herb-api     caomuyoufang-herb-api                    Up (healthy)              8080/tcp
herb-mysql   docker.m.daocloud.io/library/mysql:8.0   Up (healthy)              3306/tcp
herb-nginx   docker.m.daocloud.io/library/nginx:...   Up                        0.0.0.0:80->80/tcp
```

### 5.6 验证服务

```bash
# 健康检查
curl http://localhost/api/health

# 预期返回
# {"code":0,"message":"API服务运行正常","data":{"status":"ok","timestamp":"..."}}
```

### 5.7 如果 herb-api 启动失败

查看日志定位原因：

```bash
docker compose logs --tail 50 herb-api
```

**已知问题及修复**：

| 报错 | 原因 | 修复 |
|------|------|------|
| `Table 'caomuyoufang.quiz_answers' doesn't exist` | `initTables` 中 ALTER 语句在 CREATE TABLE 之前执行 | 已修复 `server/config/mysql.js`，建表顺序调整为：先 CREATE → 再 ALTER |
| `failed to resolve reference "docker.io/..."` | Docker Hub 国内访问超时 | Dockerfile 和 docker-compose.yml 已改用 `docker.m.daocloud.io` 国内镜像 |

---

## 6. 数据导入

### 6.1 自动导入（首次启动）

如果 `init-sql/caomuyoufang.sql` 存在，MySQL 容器**首次启动**时会自动导入。

### 6.2 手动导入（如自动导入失败或需更新数据）

```bash
cd /opt/caomuyoufang

# 清空旧数据并重建空库
docker compose exec -T mysql mysql -uherb -pherb_pass_2024 -e "DROP DATABASE IF EXISTS caomuyoufang; CREATE DATABASE caomuyoufang CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; GRANT ALL ON caomuyoufang.* TO 'herb'@'%';"

# 导入 SQL
docker compose exec -T mysql mysql -uherb -pherb_pass_2024 caomuyoufang < init-sql/caomuyoufang.sql

# 验证数据量
docker compose exec -T mysql mysql -uherb -pherb_pass_2024 caomuyoufang -e "SELECT COUNT(*) AS herbs FROM herbs; SELECT COUNT(*) AS auth FROM herb_authentication; SELECT COUNT(*) AS quizzes FROM quizzes; SELECT COUNT(*) AS herb_images FROM herb_images;"
```

**预期数据量**：

| 表 | 记录数 |
|---|---|
| herbs（药材） | 499 |
| herb_authentication（真伪鉴别） | 28 |
| quizzes（题库） | 253 |
| herb_images（药材图片） | 1041 |
| classics（典籍） | 58 |
| food_matches（药食同源） | 85 |

### 6.3 重启 herb-api

数据导入后重启 API，让它重新跑 `initTables` 补充兼容字段：

```bash
docker compose restart herb-api
sleep 10
docker compose ps
```

---

## 7. 图片导入

内置药材图片（`server/data/assets/`）已随 Docker 镜像分发，无需手动导入。
仅需导入**用户上传的反馈图片**（`server/uploads/`）。

### 7.1 解压并复制用户上传图片

```bash
cd /opt/caomuyoufang

# 确认 tar 包存在
ls -lh uploads.tar.gz

# 解压到临时目录
mkdir -p /tmp/herb-uploads
tar -xzf uploads.tar.gz -C /tmp/herb-uploads --strip-components=1

# 检查解压结果（仅 feedback 等用户上传文件）
ls /tmp/herb-uploads/uploads/
echo "用户上传文件数: $(find /tmp/herb-uploads/uploads -type f 2>/dev/null | wc -l)"

# 复制到容器（持久卷 uploads_data 已挂载到 /app/server/uploads）
docker compose cp /tmp/herb-uploads/uploads/. herb-api:/app/server/uploads/

# 验证容器内文件数
docker compose exec -T herb-api sh -c "find /app/server/uploads -type f | wc -l"

# 测试内置药材图片访问（随镜像分发，无需导入）
curl -I http://localhost/static/herbs/1/人参.png

# 测试用户上传图片访问
curl -I http://localhost/uploads/feedback/feedback-1784607669452-709100714.jpg

# 清理临时文件
rm -rf /tmp/herb-uploads uploads.tar.gz caomuyoufang-deploy.tar
```

### 7.2 迁移数据库中的旧图片路径（仅升级部署时需要）

如果是从旧版本（图片放在 `uploads/herbs` 或 `feedback-images` 目录）升级，需运行路径迁移脚本，将数据库中的旧路径更新为新路径：

| 旧路径 | 新路径 |
|--------|--------|
| `/uploads/herbs/` | `/static/herbs/` |
| `/uploads/auth/` | `/static/auth/` |
| `/feedback-images/` | `/uploads/feedback/` |

```bash
# 在容器内执行迁移脚本
docker compose exec -T herb-api node server/scripts/migrate-image-paths.js
```

> 首次全新部署可跳过此步骤。脚本幂等，重复执行无副作用。

---

## 8. 小程序配置

### 8.1 修改前端 API 地址

编辑 `src/api/index.js`，将默认内网 IP 改为公网 IP：

```javascript
// 第 5 行
const DEFAULT_INNER_ORIGIN = 'http://106.52.158.137'  // 替换为你的公网 IP
```

> 因为 Nginx 监听 80 端口，所以**不需要带端口**。`http://106.52.158.137` 等同于 `http://106.52.158.137:80`。

### 8.2 编译小程序

```bash
cd d:\trae-project\caomuyoufang
npm run dev:mp-weixin
```

### 8.3 微信开发者工具设置

1. 导入项目（指向 `dist/dev/mp-weixin` 或项目根目录）
2. **详情 → 本地设置**，勾选：
   - ☑ 不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书
3. **工具 → 清缓存 → 全部清除**
4. **编译**（Ctrl+B）

### 8.4 验证连接

在小程序控制台执行：

```javascript
// 测试 API 连通性
uni.request({
  url: 'http://106.52.158.137/api/health',
  success: (res) => console.log('✓ 服务器正常:', res.data),
  fail: (err) => console.log('✗ 连接失败:', err)
})
```

### 8.5 测试各功能模块

| 模块 | 测试点 |
|------|--------|
| 首页 | 今日药材图片加载 |
| 图鉴 | 药材列表、详情页 |
| 识别 | 拍照/上传识别 |
| 真伪鉴别 | 列表、详情页图片对比 |
| 药食同源 | 搭配列表、详情 |
| 问答 | 题目加载、答题 |
| 登录 | 用户登录、收藏同步 |

### 8.6 临时切换服务器（不修改代码）

如需临时切换服务器地址，在小程序控制台执行：

```javascript
uni.setStorageSync('serverOrigin', 'http://其他IP或域名')
```

然后重新编译。清缓存后失效，会回退到代码里的默认值。

---

## 9. 日常运维命令

### 9.1 服务管理

```bash
cd /opt/caomuyoufang

# 查看容器状态
docker compose ps

# 启动所有服务
docker compose up -d

# 停止所有服务
docker compose down

# 重启单个服务
docker compose restart herb-api
docker compose restart mysql
docker compose restart nginx

# 重新构建并启动（代码更新后）
docker compose up -d --build herb-api
```

### 9.2 日志查看

```bash
# 实时查看所有日志
docker compose logs -f

# 查看 herb-api 最近 100 行日志
docker compose logs --tail 100 herb-api

# 查看 MySQL 错误日志
docker compose logs --tail 50 mysql

# 查看 Nginx 访问日志
docker compose exec -T nginx cat /var/log/nginx/access.log | tail -20
```

### 9.3 数据库操作

```bash
# 进入 MySQL 命令行
docker compose exec -T mysql mysql -uherb -pherb_pass_2024 caomuyoufang

# 查看数据量
docker compose exec -T mysql mysql -uherb -pherb_pass_2024 caomuyoufang -e "SELECT COUNT(*) FROM herbs;"

# 备份数据库
docker compose exec -T mysql mysqldump -uherb -pherb_pass_2024 caomuyoufang > backup_$(date +%Y%m%d).sql
```

### 9.4 内存监控

```bash
# 宿主机内存
free -h

# 容器资源使用
docker stats --no-stream

# 查看某个容器详情
docker inspect herb-api | grep -A 20 "Memory"
```

### 9.5 更新代码

> 已迁移至 [第 11 节：日常更新部署](#11-日常更新部署必读)，包含 Git 方式和 scp 方式的完整流程。

---

## 10. 常见问题排查

### 10.1 容器启动失败

| 现象 | 原因 | 解决 |
|------|------|------|
| `herb-mysql` 不断重启 | OOM 或 SQL 导入失败 | `docker compose logs mysql` 查看报错 |
| `herb-api` Exit 1 | native 模块编译失败或 initTables 报错 | `docker compose logs herb-api` 查看 |
| `herb-nginx` 未启动 | 依赖 herb-api healthy | 先确保 herb-api healthy，再 `docker compose up -d nginx` |
| `no space left on device` | 磁盘满 | `docker system prune -af` 清理旧镜像 |

### 10.2 Docker Hub 拉取超时

**报错**：`failed to resolve reference "docker.io/library/mysql:8.0": i/o timeout`

**原因**：国内访问 Docker Hub 不稳定

**解决**：已在国内加速版 Dockerfile 和 docker-compose.yml 中改用 `docker.m.daocloud.io` 镜像源。如仍超时，可尝试其他镜像源：

```bash
# 备选镜像源（二选一）
sed -i 's|docker.m.daocloud.io|ccr.ccs.tencentyun.com|g' docker-compose.yml Dockerfile   # 腾讯云
sed -i 's|docker.m.daocloud.io|dockerproxy.com|g' docker-compose.yml Dockerfile          # dockerproxy
```

### 10.3 数据库导入失败

**报错**：`Incorrect datetime value: 'Mon Jul 20 2026 ...'`

**原因**：导出脚本 Date 对象被 `toString()` 转成 JS 格式，MySQL 不认

**解决**：已修复 `server/scripts/export-db.js`，改用 `toISOString()` 输出 `YYYY-MM-DD HH:MM:SS` 格式。重新导出并导入即可。

**报错**：`Invalid JSON text` for `reference_images.features`

**原因**：个别图片特征 JSON 格式异常

**解决**：不影响主要功能，可忽略。如需修复，单独处理该条记录。

### 10.4 小程序无法访问

| 现象 | 原因 | 解决 |
|------|------|------|
| `request:fail` | 未勾选"不校验合法域名" | 详情→本地设置→勾选 |
| `request:fail timeout` | 服务器 80 端口未开放 | 腾讯云防火墙放行 TCP 80 |
| 图片不显示 | 同上，或容器内无图片 | 执行第 7 节图片导入 |
| 真机调试连不上 | 防火墙拦截 | 腾讯云防火墙放行 80；手机用 4G 测试 |

### 10.5 图片丢失（容器重建后）

**原因**：`docker compose cp` 复制的文件在容器重建后会丢失

**临时解决**：重新执行第 7 节图片导入

**永久解决**：在 `docker-compose.yml` 中挂载宿主机目录：

```yaml
herb-api:
  volumes:
    - ./server/uploads:/app/server/uploads           # 改为宿主机目录挂载
    - ./server/data/feedback-images:/app/server/data/feedback-images
```

然后将图片直接放到宿主机的 `server/uploads/` 和 `server/data/feedback-images/` 目录。

---

## 附录：端口与网络说明

| 端口 | 服务 | 对外 | 说明 |
|------|------|------|------|
| 80 | Nginx | ✅ 是 | HTTP 入口，小程序/浏览器访问 |
| 22 | SSH | ✅ 是 | 服务器管理 |
| 8080 | Node.js | ❌ 否 | 仅容器内部，Nginx 反代 |
| 3306 | MySQL | ❌ 否 | 仅容器内部，herb-api 访问 |

**HTTPS 说明**：
- 开发期：勾选"不校验合法域名"可用 HTTP
- 正式版：必须 HTTPS + 已备案域名
- 申请 HTTPS：有域名后用 certbot 申请 Let's Encrypt 免费证书

---

## 11. 日常更新部署（必读）

> 首次部署完成后，后续代码更新**无需重复完整部署流程**。
> 根据改动范围选择对应方案，最快 30 秒搞定。

### 11.0 更新场景速查表

| 改动范围 | 推荐方案 | 用时 | 是否动服务器 |
|----------|---------|------|-------------|
| 只改前端（小程序页面/Vue） | 本地编译 + 微信工具刷新 | 30 秒 | ❌ 否 |
| 只改后端（API/路由/服务） | Git pull + 重建 herb-api | 1-2 分钟 | ✅ 是 |
| 改了数据库数据 | 重新导出 SQL + 导入 | 1 分钟 | ✅ 是 |
| 改了 Dockerfile/compose | Git pull + 重建所有 | 5-10 分钟 | ✅ 是 |
| 改了 nginx.conf | Git pull + 重启 nginx | 10 秒 | ✅ 是 |
| 新增用户上传图片 | 重新打包 uploads + cp 到容器 | 1 分钟 | ✅ 是 |

---

### 11.1 前置准备：配置 Git（一次性）

#### 11.1.1 本地代码推到 Gitee

```bash
# 本地
cd d:\trae-project\caomuyoufang
git add .
git commit -m "部署完成，添加 Docker 部署文件"
git remote add origin https://gitee.com/你的用户名/你的仓库.git   # 如果还没配置远程
git push -u origin main
```

#### 11.1.2 服务器克隆仓库

```bash
# 服务器（一次性）
cd /opt
# 如果 /opt/caomuyoufang 已存在（首次部署用的 scp 方式），先备份再克隆
mv /opt/caomuyoufang /opt/caomuyoufang.bak
git clone https://gitee.com/你的用户名/你的仓库.git caomuyoufang
cd caomuyoufang

# 恢复 .env 和 init-sql（从备份复制）
cp /opt/caomuyoufang.bak/.env .env
cp -r /opt/caomuyoufang.bak/init-sql init-sql

# 确认 docker-compose.yml 在
ls docker-compose.yml

# 启动服务（数据卷未删除，数据不丢失）
docker compose up -d
```

#### 11.1.3 上传更新脚本

```bash
# 本地
scp server/scripts/update.sh root@你的IP:/opt/caomuyoufang/
```

> 配置完成后，以后更新代码只需 [11.2 节](#112-场景一更新后端代码最常用) 的两步。

---

### 11.2 场景一：更新后端代码（最常用）

**适用**：改了 `server/` 下的任何文件（API、路由、服务、配置等）

#### 步骤

```bash
# ===== 本地 =====
cd d:\trae-project\caomuyoufang
git add .
git commit -m "修改xxx功能"
git push

# ===== 服务器 =====
cd /opt/caomuyoufang
./update.sh
```

#### update.sh 脚本内容

脚本已存在于 `server/scripts/update.sh`，做的事：

```bash
git pull                          # 拉取最新代码
docker compose up -d --build herb-api   # 重建并重启 herb-api
sleep 10                          # 等待启动
curl http://localhost/api/health  # 健康检查
```

#### 手动执行（不用脚本）

```bash
cd /opt/caomuyoufang
git pull
docker compose up -d --build herb-api
sleep 10
docker compose ps
curl http://localhost/api/health
```

**用时**：1-2 分钟（仅重建 herb-api 镜像，MySQL 和 Nginx 不动）

---

### 11.3 场景二：更新前端代码（小程序）

**适用**：改了 `src/` 下的页面、组件、API 调用等

#### 步骤

```bash
# ===== 本地 =====
cd d:\trae-project\caomuyoufang
npm run dev:mp-weixin    # 开发模式，实时编译
# 或
npm run build:mp-weixin  # 生产构建
```

然后在**微信开发者工具**里：
1. **工具 → 清缓存 → 全部清除**
2. **编译**（Ctrl+B）

#### 说明

- 前端代码**不需要动服务器**，因为小程序走的是本地编译产物
- 前端通过 `http://公网IP/api/...` 访问服务器后端，服务器后端不需要更新
- 如果改了 `src/api/index.js` 里的 API 调用逻辑，只需重新编译小程序即可

**用时**：30 秒

---

### 11.4 场景三：更新数据库数据

**适用**：新增药材、新增鉴别数据、修改题库等

#### 关于数据同步机制

首次部署时，本地 MySQL 数据通过 `export-db.js` 全量导出为 `caomuyoufang.sql`，再导入服务器 MySQL。**两边数据库内容完全一致**。

后续更新数据时，根据改动量选择方案：

| 改动量 | 推荐方案 | 是否影响服务器其他数据 | 用时 |
|--------|---------|---------------------|------|
| 少量（1-10 条） | [方式 A：增量 SQL](#方式-a增量-sql脚本推荐) | ❌ 不影响 | 30 秒 |
| 中等（一个模块） | [方式 A：增量 SQL](#方式-a增量-sql脚本推荐) | ❌ 不影响 | 30 秒 |
| 大量（整体同步） | [方式 B：全量导出导入](#方式-b全量导出导入) | ⚠️ 覆盖服务器数据 | 1 分钟 |
| 实时查看/修改 | [方式 C：直连远程 MySQL](#方式-c直连远程-mysql-可视化) | ❌ 不影响 | 实时 |

#### 方式 A：增量 SQL 脚本（推荐）

**适用场景**：本地新增了几条鉴别数据、改了某个药材信息等。

**步骤**：本地写一个增量 SQL 脚本，上传到服务器执行。

```bash
# ===== 1. 本地：写增量 SQL 脚本 =====
# 例如新增一条鉴别数据，保存为 update.sql
# 文件内容示例：
# INSERT INTO herb_authentication (herb_name, herb_id, counterfeiter, fraud_type, summary, ...)
# VALUES ('新药材', 100, '冒充物', '冒充', '描述...', ...);

# ===== 2. 上传到服务器 =====
scp update.sql root@你的IP:/tmp/

# ===== 3. 服务器执行 =====
ssh root@你的IP
docker compose exec -T mysql mysql -uherb -pherb_pass_2024 caomuyoufang < /tmp/update.sql

# ===== 4. 重启 herb-api（如需重新加载缓存）=====
docker compose restart herb-api
```

> 💡 **技巧**：本地的 `server/scripts/` 下已有现成的增量脚本（如 `add-auth-data.js`、`init-authentication-data.js`），可以直接用：
> ```bash
> scp server/scripts/add-auth-data.js root@你的IP:/opt/caomuyoufang/server/scripts/
# ssh 到服务器后
> cd /opt/caomuyoufang
> docker compose exec -T herb-api node server/scripts/add-auth-data.js
> ```

#### 方式 B：全量导出导入

**适用场景**：本地数据库做了大量修改，需要整体同步到服务器。

> ⚠️ **警告**：此方式会**清空服务器数据库**重新导入。如果服务器上有本地没有的数据（如线上用户注册、收藏、答题记录），会**丢失**。生产环境慎用，建议先备份。

```bash
# ===== 1. 服务器：先备份当前数据（重要！）=====
ssh root@你的IP
cd /opt/caomuyoufang
docker compose exec -T mysql mysqldump -uherb -pherb_pass_2024 caomuyoufang > backup_$(date +%Y%m%d_%H%M).sql
exit

# ===== 2. 本地：导出新数据 =====
cd d:\trae-project\caomuyoufang
node server/scripts/export-db.js
scp server/scripts/caomuyoufang.sql root@你的IP:/opt/caomuyoufang/init-sql/

# ===== 3. 服务器：导入新数据 =====
ssh root@你的IP
cd /opt/caomuyoufang
docker compose exec -T mysql mysql -uherb -pherb_pass_2024 -e "DROP DATABASE IF EXISTS caomuyoufang; CREATE DATABASE caomuyoufang CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; GRANT ALL ON caomuyoufang.* TO 'herb'@'%';"
docker compose exec -T mysql mysql -uherb -pherb_pass_2024 caomuyoufang < init-sql/caomuyoufang.sql
docker compose restart herb-api

# ===== 4. 验证数据 =====
docker compose exec -T mysql mysql -uherb -pherb_pass_2024 caomuyoufang -e "SELECT COUNT(*) FROM herbs; SELECT COUNT(*) FROM herb_authentication;"
```

**用时**：1 分钟

#### 方式 C：直连远程 MySQL（可视化）

**适用场景**：想用 Navicat/DBeaver 等工具直接查看/修改远程数据库。

> ⚠️ 当前配置中 MySQL **不对外暴露端口**（安全考虑）。需临时开放，用完关闭。

**步骤 1：服务器临时开放 3306 端口**

```bash
ssh root@你的IP
cd /opt/caomuyoufang

# 创建远程访问用户
docker compose exec -T mysql mysql -uroot -pherb_root_2024 -e "CREATE USER IF NOT EXISTS 'herb_remote'@'%' IDENTIFIED BY 'Herb_Remote@2024'; GRANT ALL ON caomuyoufang.* TO 'herb_remote'@'%'; FLUSH PRIVILEGES;"

# 临时开放端口：编辑 docker-compose.yml，在 mysql 服务下加 ports 映射
# ports:
#   - "3306:3306"
# 或用命令行临时改（不改文件）：
docker compose port mysql 3306  # 查看映射
# 如果没映射，需要改 docker-compose.yml 后重启 mysql
```

**步骤 2：腾讯云防火墙放行 3306**

腾讯云控制台 → 轻量服务器 → 防火墙 → 添加规则：TCP 3306，来源限制为你的本机 IP（更安全）。

**步骤 3：本地连接**

```
主机：106.52.158.137
端口：3306
用户：herb_remote
密码：Herb_Remote@2024
数据库：caomuyoufang
```

**步骤 4：用完关闭（重要！）**

```bash
# 服务器：移除远程用户 + 关闭端口
docker compose exec -T mysql mysql -uroot -pherb_root_2024 -e "DROP USER IF EXISTS 'herb_remote'@'%';"
# 移除 docker-compose.yml 里的 ports: "3306:3306"
docker compose up -d mysql
# 腾讯云防火墙删除 3306 规则
```

#### 方式 D：通过 API 查看/修改（最简单）

无需连数据库，直接调 API：

```bash
# 查看药材列表
curl "http://106.52.158.137/api/herb/list?page=1&pageSize=10"

# 查看某味药材详情
curl "http://106.52.158.137/api/herb/detail/1"

# 查看真伪鉴别列表
curl "http://106.52.158.137/api/authenticate/list?page=1&pageSize=10"

# 查看某条鉴别详情
curl "http://106.52.158.137/api/authenticate/detail/1"
```

也可直接在小程序里查看对应模块的数据。

---

### 11.5 场景四：更新 Dockerfile 或 docker-compose.yml

**适用**：改了镜像构建逻辑、容器编排、环境变量等

```bash
# ===== 本地 =====
cd d:\trae-project\caomuyoufang
git add .
git commit -m "更新 Docker 配置"
git push

# ===== 服务器 =====
cd /opt/caomuyoufang
git pull
docker compose down              # 停止所有容器
docker compose up -d --build     # 重新构建并启动所有
sleep 30
docker compose ps
curl http://localhost/api/health
```

**用时**：5-10 分钟（三个镜像都要重建）

> ⚠️ `docker compose down` 不会删除数据卷（mysql_data、uploads_data 等），数据安全。但 `docker compose down -v` 会删数据卷，**慎用**。

---

### 11.6 场景五：更新 Nginx 配置

**适用**：改了 `nginx/nginx.conf`（如修改反代规则、添加 HTTPS 等）

```bash
# ===== 本地 =====
cd d:\trae-project\caomuyoufang
git add nginx/nginx.conf
git commit -m "更新 Nginx 配置"
git push

# ===== 服务器 =====
cd /opt/caomuyoufang
git pull
docker compose restart nginx
# 或
docker compose up -d nginx
```

**用时**：10 秒

---

### 11.7 场景六：新增用户上传图片

**适用**：本地有新的药材图片要同步到服务器

```bash
# ===== 本地 =====
cd d:\trae-project\caomuyoufang
tar -czf uploads.tar.gz server/uploads server/data/feedback-images
scp uploads.tar.gz root@你的IP:/opt/caomuyoufang/

# ===== 服务器 =====
cd /opt/caomuyoufang
mkdir -p /tmp/herb-uploads
tar -xzf uploads.tar.gz -C /tmp/herb-uploads --strip-components=1
docker compose cp /tmp/herb-uploads/uploads/. herb-api:/app/server/uploads/
docker compose cp /tmp/herb-uploads/data/feedback-images/. herb-api:/app/server/data/feedback-images/
rm -rf /tmp/herb-uploads uploads.tar.gz
```

**用时**：1 分钟

> ⚠️ 容器重建（`docker compose up -d --build`）后通过 `docker compose cp` 复制的文件会丢失。如需持久化，见 [10.5 节](#105-图片丢失容器重建后) 的 volume 挂载方案。

---

### 11.8 完整更新流程示例

假设你改了真伪鉴别模块的后端代码和前端页面：

```bash
# ===== 1. 本地修改代码 =====
# （编辑 server/routes/authenticate.js 和 src/pages/authenticate/authenticate.vue）

# ===== 2. 本地测试 =====
cd d:\trae-project\caomuyoufang
npm run dev:mp-weixin
# 微信开发者工具里测试功能正常

# ===== 3. 提交并推送 =====
git add .
git commit -m "优化真伪鉴别模块"
git push

# ===== 4. 服务器更新后端 =====
ssh root@你的IP
cd /opt/caomuyoufang
./update.sh
# 输出：✓ 服务正常

# ===== 5. 退出服务器 =====
exit

# ===== 6. 本地重新编译前端 =====
# 微信开发者工具：清缓存 → 编译
# 完成交付
```

**总用时**：3-5 分钟

---

### 11.9 没配 Git 的备选方案（scp）

如果暂时不想配 Git，可以用 scp 方式更新：

```bash
# ===== 本地：打包改动的文件（或全量打包）=====
cd d:\trae-project\caomuyoufang
tar -cf update.tar --exclude=node_modules --exclude=.git --exclude=dist --exclude=server/uploads --exclude=server/data/feedback-images .

# ===== 上传 =====
scp update.tar root@你的IP:/opt/caomuyoufang/

# ===== 服务器：解压并重建 =====
ssh root@你的IP
cd /opt/caomuyoufang
tar -xf update.tar
docker compose up -d --build herb-api
sleep 10
curl http://localhost/api/health
rm update.tar
```

**缺点**：每次都要上传完整代码包（约 99MB），比 Git pull（只传差异）慢。**强烈建议配置 Git**。

---

### 11.10 更新注意事项

1. **更新前备份**：重要数据先备份
   ```bash
   docker compose exec -T mysql mysqldump -uherb -pherb_pass_2024 caomuyoufang > backup_$(date +%Y%m%d_%H%M).sql
   ```

2. **避开高峰期**：`docker compose up -d --build` 期间服务会短暂中断

3. **健康检查**：更新后务必验证
   ```bash
   curl http://localhost/api/health
   docker compose ps   # 三个容器都应是 healthy
   ```

4. **回滚**：如果更新后异常，回滚到上一版本
   ```bash
   cd /opt/caomuyoufang
   git log --oneline -5          # 查看最近提交
   git checkout HEAD~1           # 回退到上一个版本
   docker compose up -d --build herb-api
   ```

5. **查看日志**：更新后如果功能异常，第一时间看日志
   ```bash
   docker compose logs --tail 50 herb-api
   ```

---

## 12. 镜像部署方案（源码不外泄）

> 适用场景：生产环境上线、团队协作、不想让源码出现在服务器上。
> 与方式 A（源码+现场构建）相比，**服务器上只放 docker-compose.yml 和 .env**，没有任何源代码。

### 12.1 架构与流程

```
本地电脑                    镜像仓库 (ACR)              腾讯云服务器
   │                            │                           │
   ├─ docker build              │                           │
   ├─ docker tag                 │                           │
   ├─ docker push ─────────────→│                           │
   │                            │                           │
   │                            │←──── docker pull ─────────┤
   │                            │                           ├─ docker compose up -d
   │                            │                           │
   └────────────────────────────────────────────────────────┘
                部署完成后小程序正常访问服务器 API
```

**核心思路**：
- 构建动作在**本地电脑**完成（用你本地的 CPU 和内存）
- 构建产物是一个可运行的 Docker 镜像
- 镜像推送到远程镜像仓库
- 服务器只做 `docker pull` 和 `docker run`，**不需要源码、不需要 npm install、不需要 build-essential**

### 12.2 准备镜像仓库

本项目推荐用**腾讯云 TCR 个人版**（免费，且轻量服务器走内网拉取，速度快、不消耗公网流量）：

| 项目 | 值 |
|------|---|
| 仓库地址 | `ccr.ccs.tencentyun.com` |
| 命名空间 | `caomuyoufang` |
| 仓库名 | `caomuyoufang-api`（后端镜像） |
| 完整镜像地址 | `ccr.ccs.tencentyun.com/caomuyoufang/caomuyoufang-api:latest` |

#### 开通步骤（5 分钟）

1. 登录 [腾讯云控制台](https://console.cloud.tencent.com/)
2. 顶部搜索「**容器镜像服务**」→ 左侧选「**个人版**」
3. 首次使用点击「开通」（免费，立即生效）
4. **设置访问密码**：个人版 → 访问控制 → 设置密码（用「腾讯云账号 + 独立密码」登录，不是 AccessKey）
5. **创建命名空间**：个人版 → 命名空间 → 新建 → 名字 `caomuyoufang` → 地域选**广州**（和轻量服务器同地域，内网拉取免流量）
6. **创建镜像仓库**：个人版 → 镜像仓库 → 新建 → 命名空间 `caomuyoufang` → 仓库名 `caomuyoufang-api`

> 💡 **地域选择很关键**：你的轻量服务器 IP `106.52.158.137` 属于广州地域，命名空间也选广州，这样服务器拉镜像走**内网**，速度可达 100MB/s+，完全免费。
>
> 如已开通阿里云 ACR 也可用，地址格式 `crpi-xxx.cn-hangzhou.personal.cr.aliyuncs.com/命名空间/仓库名`。

### 12.3 一次性准备（本地）

#### 12.3.1 本地安装 Docker Desktop

Windows：下载 Docker Desktop 并启动，托盘里出现鲸鱼图标即成功。

验证：
```bash
docker --version
docker compose version
```

#### 12.3.2 登录镜像仓库

```bash
# 腾讯云 TCR 个人版（推荐）
# 用户名 = 腾讯云账号（如 QQ 邮箱），密码 = 第 12.2 节设置的访问密码
docker login ccr.ccs.tencentyun.com
# 输入用户名和密码
```

登录成功会显示 `Login Succeeded`。

### 12.4 本地构建并推送镜像

```bash
cd d:\trae-project\caomuyoufang

# ===== 1. 构建镜像（约 3-5 分钟，取决于网速和 CPU）=====
docker build -t caomuyoufang-api:latest .

# 验证构建成功
docker images | findstr caomuyoufang-api

# ===== 2. 打标签 =====
docker tag caomuyoufang-api:latest ccr.ccs.tencentyun.com/caomuyoufang/caomuyoufang-api:latest

# ===== 3. 推送到镜像仓库 =====
docker push ccr.ccs.tencentyun.com/caomuyoufang/caomuyoufang-api:latest
```

> 💡 **给版本打 tag（推荐）**：每次发布固定版本号，方便回滚
> ```bash
> docker tag caomuyoufang-api:latest ccr.ccs.tencentyun.com/caomuyoufang/caomuyoufang-api:v2.1.0
> docker push ccr.ccs.tencentyun.com/caomuyoufang/caomuyoufang-api:v2.1.0
> ```

### 12.5 服务器配置（一次性）

#### 12.5.1 服务器上只需要 4 个文件

```
/opt/caomuyoufang/
├── docker-compose.yml    ← 镜像版（只有 image，没有 build 段）
├── .env                  ← 环境变量（数据库密码）
├── nginx/
│   └── nginx.conf        ← Nginx 配置
└── init-sql/
    └── caomuyoufang.sql  ← 首次导入数据库用
```

**服务器上**：
```bash
# 1. 建目录
mkdir -p /opt/caomuyoufang/{nginx,init-sql}
cd /opt/caomuyoufang
```

#### 12.5.2 写 docker-compose.yml（镜像版）

在 `/opt/caomuyoufang/docker-compose.yml` 中，**herb-api 用远程镜像，去掉 build 段**：

```yaml
version: '3.8'

services:
  mysql:
    image: docker.m.daocloud.io/library/mysql:8.0
    container_name: herb-mysql
    restart: always
    mem_limit: 512m
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: ${MYSQL_DATABASE}
      MYSQL_USER: ${MYSQL_USER}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
      TZ: Asia/Shanghai
    command:
      - --character-set-server=utf8mb4
      - --collation-server=utf8mb4_unicode_ci
      - --innodb-buffer-pool-size=128M
      - --max-connections=50
      - --performance-schema=OFF
    volumes:
      - mysql_data:/var/lib/mysql
      - ./init-sql:/docker-entrypoint-initdb.d:ro
    networks:
      - herb-net
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-u", "root", "-p${MYSQL_ROOT_PASSWORD}"]
      interval: 10s
      timeout: 5s
      retries: 10
      start_period: 30s

  herb-api:
    # ⬇️ 关键：用远程镜像地址，不是 build
    image: ccr.ccs.tencentyun.com/caomuyoufang/caomuyoufang-api:latest
    container_name: herb-api
    restart: always
    mem_limit: 512m
    depends_on:
      mysql:
        condition: service_healthy
    environment:
      PORT: 8080
      MYSQL_HOST: mysql
      MYSQL_PORT: 3306
      MYSQL_DATABASE: ${MYSQL_DATABASE}
      MYSQL_USER: ${MYSQL_USER}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
      MYSQL_CONNECTION_LIMIT: 5
      TZ: Asia/Shanghai
    volumes:
      - uploads_data:/app/server/uploads
      - feedback_images:/app/server/data/feedback-images
    networks:
      - herb-net

  nginx:
    image: docker.m.daocloud.io/library/nginx:alpine
    container_name: herb-nginx
    restart: always
    mem_limit: 128m
    depends_on:
      herb-api:
        condition: service_healthy
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf:ro
    networks:
      - herb-net

volumes:
  mysql_data:
  uploads_data:
  feedback_images:

networks:
  herb-net:
    driver: bridge
```

#### 12.5.3 .env 和 nginx.conf

和方式 A 一致：
```bash
# 从本地 scp 过去
scp .env.docker root@你的IP:/opt/caomuyoufang/.env
scp nginx/nginx.conf root@你的IP:/opt/caomuyoufang/nginx/nginx.conf
scp server/scripts/caomuyoufang.sql root@你的IP:/opt/caomuyoufang/init-sql/

# 或直接在服务器上写
vi /opt/caomuyoufang/.env
vi /opt/caomuyoufang/nginx/nginx.conf
```

#### 12.5.4 服务器登录镜像仓库

```bash
# 腾讯云 TCR 个人版（同账号同密码）
docker login ccr.ccs.tencentyun.com
```

> 💡 轻量服务器和 TCR 在同地域（广州），拉取镜像走**内网**，速度极快且免流量。

### 12.6 首次部署启动

```bash
cd /opt/caomuyoufang

# 拉取镜像 + 启动所有容器
docker compose pull   # 拉取 herb-api 镜像
docker compose up -d

# 等待 30 秒
sleep 30
docker compose ps

# 健康检查
curl http://localhost/api/health
```

**预期**：三个容器 Up (healthy)，/api/health 返回 code:0。

### 12.7 日常更新：后端代码

```bash
# ===== 本地 =====
cd d:\trae-project\caomuyoufang

# 1. 构建新镜像
docker build -t caomuyoufang-api:latest .

# 2. 打标签（latest + 版本号）
docker tag caomuyoufang-api:latest ccr.ccs.tencentyun.com/caomuyoufang/caomuyoufang-api:latest
docker tag caomuyoufang-api:latest ccr.ccs.tencentyun.com/caomuyoufang/caomuyoufang-api:v2.1.1

# 3. 推送
docker push ccr.ccs.tencentyun.com/caomuyoufang/caomuyoufang-api:latest
docker push ccr.ccs.tencentyun.com/caomuyoufang/caomuyoufang-api:v2.1.1

# ===== 服务器 =====
ssh root@你的IP
cd /opt/caomuyoufang
docker compose pull herb-api   # 拉取最新镜像（内网，秒级）
docker compose up -d herb-api  # 用新镜像重启
sleep 10
curl http://localhost/api/health
```

**用时**：2-3 分钟（取决于镜像层变更大小）。

### 12.8 日常更新：其他场景

| 改动类型 | 操作 |
|----------|------|
| 只改前端 | 本地重新编译小程序即可，服务器无感知 |
| 改数据库数据 | 同方式 A 的 11.4 节（增量 SQL / 全量导入） |
| 改 nginx.conf | scp 新 nginx.conf → 服务器 `docker compose restart nginx` |
| 改 docker-compose.yml | 服务器改完 → `docker compose up -d` |
| 新增用户上传图片 | 同方式 A 的 11.7 节（tar + cp 到容器） |

### 12.9 回滚

如果新版本有问题，切回上一个版本号：

```bash
# 服务器
cd /opt/caomuyoufang

# 修改 docker-compose.yml 的 image tag，或直接 run 旧版本
docker compose down
# 把 image: ... caomuyoufang-api:latest 改成 :v2.1.0
docker compose up -d

# 或直接用命令指定镜像
docker run -d --name herb-api-rollback ...镜像:v2.1.0
```

### 12.10 两种方式切换（A ↔ B）

#### 从方式 A（源码构建）切换到方式 B（镜像部署）

```bash
# 服务器：保留数据卷和配置，删掉源码
cd /opt/caomuyoufang
# 备份
cp -r . /opt/caomuyoufang.bak
# 删除源码目录（保留 docker-compose.yml、.env、nginx/、init-sql/）
rm -rf server src dist demo* package* static Dockerfile* deploy*
# docker-compose.yml 改成镜像版（12.5.2 节），去掉 build 段
# 然后：
docker compose pull
docker compose up -d
```

#### 从方式 B 切换回方式 A

```bash
# 服务器：git clone 源码进来
cd /opt
git clone https://gitee.com/你的仓库.git caomuyoufang-src
cp /opt/caomuyoufang/.env /opt/caomuyoufang-src/.env
cp -r /opt/caomuyoufang/init-sql /opt/caomuyoufang-src/
# docker-compose.yml 改回带 build 段的版本
docker compose up -d --build
```

> 💡 数据卷（mysql_data、uploads_data）在两种方式之间**通用**，切换不会丢失数据。

### 12.11 镜像部署的优缺点总结

| 优点 | 缺点 |
|------|------|
| 服务器无源码，安全 | 需要镜像仓库（ACR/TCR） |
| 服务器构建压力为 0 | 本地需要装 Docker Desktop |
| 构建一次，多地可用（多台服务器都拉同一个镜像） | 每次更新多了 push/pull 两步 |
| 版本号管理清晰，随时回滚 | 镜像仓库有流量/存储限制（个人版免费够用） |
| CI/CD 友好，可接入自动构建 | 初次配置稍复杂 |

---

## 附录：项目数据规模

| 数据类型 | 数量 |
|----------|------|
| 药材 | 499 味 |
| 药材图片 | 1041 张 |
| 真伪鉴别 | 28 条 |
| 题库 | 253 题 |
| 典籍记载 | 58 条 |
| 药食同源搭配 | 85 条 |
| 用户上传图片 | 1014 张（需手动导入容器） |
| 反馈图片 | 4 张 |

---

*文档最后更新：2026-08-05*
