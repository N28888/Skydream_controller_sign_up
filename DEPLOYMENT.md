# VPS部署指南

## 部署方式选择

### 方式一：Docker Compose（推荐）
最简单的一键部署方式，适合大多数VPS环境。

### 方式二：传统部署
直接在VPS上安装Node.js、MySQL等环境。

---

## 方式一：Docker Compose部署

### 1. VPS环境准备

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 启动Docker服务
sudo systemctl start docker
sudo systemctl enable docker
```

### 2. 上传项目文件

```bash
# 在本地打包项目
git clone <your-repo-url>
cd Skydream_controller_sign_up

# 上传到VPS（使用scp或其他方式）
scp -r . user@your-vps-ip:/home/user/skydream-project
```

### 3. 配置环境变量

编辑 `docker-compose.yml` 文件，修改以下配置：

```yaml
# 数据库密码
MYSQL_ROOT_PASSWORD: your_secure_mysql_root_password
MYSQL_PASSWORD: your_secure_mysql_password

# JWT密钥
JWT_SECRET: your_very_secure_jwt_secret_key

# 域名配置
CORS_ORIGIN: http://your-domain.com
```

### 4. 一键部署

```bash
cd /home/user/skydream-project
./deploy.sh
```

### 5. 配置域名和SSL（可选）

```bash
# 安装Nginx
sudo apt install nginx -y

# 配置反向代理
sudo nano /etc/nginx/sites-available/skydream

# 添加配置
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# 启用配置
sudo ln -s /etc/nginx/sites-available/skydream /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 方式二：传统部署

### 1. 安装必要软件

```bash
# 安装Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装MySQL
sudo apt install mysql-server -y
sudo mysql_secure_installation

# 安装Nginx
sudo apt install nginx -y
```

### 2. 配置数据库

```bash
# 登录MySQL
sudo mysql -u root -p

# 创建数据库和用户
CREATE DATABASE skydream_controller;
CREATE USER 'skydream_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON skydream_controller.* TO 'skydream_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# 导入数据表
mysql -u skydream_user -p skydream_controller < backend/src/config/init.sql
```

### 3. 部署后端

```bash
cd backend
npm install
npm run build

# 创建环境变量文件
cp env.example .env
# 编辑.env文件配置数据库连接

# 使用PM2启动服务
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 4. 部署前端

```bash
cd frontend
npm install
npm run build

# 配置Nginx
sudo cp -r build/* /var/www/html/
```

---

## 维护命令

```bash
# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 重启服务
docker-compose restart

# 更新代码后重新部署
git pull
./deploy.sh

# 备份数据库
docker exec skydream_mysql mysqldump -u root -p skydream_controller > backup.sql
```

---

## 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   sudo netstat -tulpn | grep :80
   sudo netstat -tulpn | grep :3001
   ```

2. **数据库连接失败**
   ```bash
   docker-compose logs mysql
   ```

3. **前端无法访问后端API**
   - 检查CORS配置
   - 检查Nginx代理配置

4. **内存不足**
   ```bash
   # 清理Docker缓存
   docker system prune -a
   ``` 