#!/bin/bash

# 一键部署/更新脚本

# 1. 停止本机 nginx 服务
if systemctl is-active --quiet nginx; then
  echo "🛑 正在停止 nginx 服务..."
  systemctl stop nginx
else
  echo "✅ nginx 服务未运行，无需停止。"
fi

# 2. 停止本机 mysql 服务
if systemctl is-active --quiet mysql; then
  echo "🛑 正在停止 mysql 服务..."
  systemctl stop mysql
else
  echo "✅ mysql 服务未运行，无需停止。"
fi

# 3. 进入项目目录
cd /home/your-username/skydream-project || { echo "❌ 未找到项目目录 /home/your-username/skydream-project"; exit 1; }

# 4. 执行部署脚本
echo "🚀 开始执行 ./deploy.sh ..."
./deploy.sh 