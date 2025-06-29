-- 添加默认管理员用户脚本
-- 使用方法: mysql -u skydream_user -p skydream_controller < add_admin_user.sql

USE skydream_controller;

-- 创建默认管理员用户 (密码: admin123)
-- 密码哈希值是通过bcrypt加密的 "admin123"
INSERT INTO users (username, email, password, level) VALUES 
('ADMIN', 'admin@skydream.ca', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADM')
ON DUPLICATE KEY UPDATE username=username;

-- 验证用户是否创建成功
SELECT id, username, email, level, created_at FROM users WHERE username = 'ADMIN'; 