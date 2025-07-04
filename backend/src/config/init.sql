-- 创建数据库
CREATE DATABASE IF NOT EXISTS skydream_controller;
USE skydream_controller;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  level ENUM('S1', 'S2', 'S3', 'C1', 'C2', 'C3', 'I1', 'I2', 'I3', 'SUP', 'ADM') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 活动表
CREATE TABLE IF NOT EXISTS events (
  id INT PRIMARY KEY AUTO_INCREMENT,
  custom_id VARCHAR(20) UNIQUE,
  title VARCHAR(200) NOT NULL,
  departure_airport VARCHAR(20) NOT NULL,
  arrival_airport VARCHAR(20) NOT NULL,
  route TEXT,
  flight_level VARCHAR(50),
  airac VARCHAR(20),
  event_date DATE NOT NULL,
  event_time TIME NOT NULL,
  remarks TEXT,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- 席位表
CREATE TABLE IF NOT EXISTS positions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  event_id INT NOT NULL,
  position_name VARCHAR(50) NOT NULL,
  position_type ENUM('DEL', 'GND', 'TWR', 'APP', 'CTR', 'FSS') NOT NULL,
  is_taken BOOLEAN DEFAULT FALSE,
  taken_by INT,
  student_supervised VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (taken_by) REFERENCES users(id)
);

-- 报名记录表
CREATE TABLE IF NOT EXISTS signups (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  position_id INT NOT NULL,
  signup_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (position_id) REFERENCES positions(id)
);

-- 创建默认管理员用户 (密码: admin123)
INSERT INTO users (username, email, password, level) VALUES 
('ADMIN', 'admin@skydream.ca', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADM')
ON DUPLICATE KEY UPDATE username=username; 