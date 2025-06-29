#!/bin/bash

echo "🔧 修复数据库 - 添加默认管理员用户..."

# 设置变量
VPS_IP="sj.yfanj.ca"
VPS_USER="root"
PROJECT_DIR="/home/your-username/skydream-project"

# 上传SQL文件到VPS
echo "📤 上传SQL文件到VPS..."
scp add_admin_user.sql $VPS_USER@$VPS_IP:$PROJECT_DIR/

# 在VPS上执行SQL脚本
echo "🔄 在VPS上执行SQL脚本..."
ssh $VPS_USER@$VPS_IP << 'EOF'
cd /home/your-username/skydream-project

echo "连接到MySQL数据库..."
docker exec -i skydream_mysql mysql -u skydream_user -p'SkydreamUser2024!@#' skydream_controller < add_admin_user.sql

echo "检查数据库连接..."
docker exec -i skydream_mysql mysql -u skydream_user -p'SkydreamUser2024!@#' skydream_controller -e "SELECT COUNT(*) as user_count FROM users;"

echo "检查管理员用户..."
docker exec -i skydream_mysql mysql -u skydream_user -p'SkydreamUser2024!@#' skydream_controller -e "SELECT id, username, email, level, created_at FROM users;"

echo "重启后端服务..."
docker restart skydream_backend

echo "等待服务启动..."
sleep 5

echo "检查后端日志..."
docker logs skydream_backend --tail=10

echo "✅ 数据库修复完成！"
echo "📝 默认管理员账户:"
echo "   呼号: ADMIN"
echo "   密码: admin123"
echo "   邮箱: admin@skydream.ca"
echo "   权限: ADM"
EOF

echo "🎉 数据库修复完成！"
echo "🌐 现在可以使用以下账户登录:"
echo "   呼号: ADMIN"
echo "   密码: admin123" 