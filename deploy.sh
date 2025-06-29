#!/bin/bash

# 设置变量
VPS_IP="sj.yfanj.ca"
VPS_USER="root"
PROJECT_DIR="/home/your-username/skydream-project"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

echo "🚀 开始部署 Skydream Controller Sign Up 系统..."

# 1. 构建前端
echo "📦 构建前端..."
cd frontend
npm install
npm run build
cd ..

# 2. 构建后端
echo "🔧 构建后端..."
cd backend
npm install
npm run build
cd ..

# 3. 上传到VPS
echo "📤 上传文件到VPS..."
rsync -avz --exclude 'node_modules' --exclude '.git' ./ $VPS_USER@$VPS_IP:$PROJECT_DIR/

# 4. 在VPS上重启服务
echo "🔄 在VPS上重启服务..."
ssh $VPS_USER@$VPS_IP << 'EOF'
cd /home/your-username/skydream-project

# 检查docker-compose是否可用
if command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
elif command -v docker &> /dev/null && docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    echo "错误: 未找到 docker-compose 或 docker compose 命令"
    exit 1
fi

# 停止现有容器
echo "停止现有容器..."
$COMPOSE_CMD down

# 重新构建并启动容器
echo "重新构建并启动容器..."
$COMPOSE_CMD up -d --build

# 等待服务启动
echo "等待服务启动..."
sleep 10

# 检查服务状态
echo "检查服务状态..."
$COMPOSE_CMD ps

# 检查后端日志
echo "检查后端日志..."
$COMPOSE_CMD logs backend --tail=20

# 检查前端日志
echo "检查前端日志..."
$COMPOSE_CMD logs frontend --tail=20

echo "✅ 部署完成！"
echo "🌐 前端地址: http://sj.yfanj.ca"
echo "🔧 后端API: http://sj.yfanj.ca:3001"
EOF

echo "🎉 部署完成！"
echo "📝 新增功能:"
echo "   - 管理员可以创建新用户"
echo "   - 支持设置呼号、邮箱、密码和权限等级"
echo "   - 只有SUP和ADM用户才能创建用户" 