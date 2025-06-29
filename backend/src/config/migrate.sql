-- 数据库迁移脚本
-- 修改机场字段长度

USE skydream_controller;

-- 修改departure_airport字段长度
ALTER TABLE events MODIFY COLUMN departure_airport VARCHAR(20) NOT NULL;

-- 修改arrival_airport字段长度  
ALTER TABLE events MODIFY COLUMN arrival_airport VARCHAR(20) NOT NULL;

-- 添加custom_id字段
ALTER TABLE events ADD COLUMN custom_id VARCHAR(20) UNIQUE AFTER id;

-- 为现有活动生成custom_id
UPDATE events SET custom_id = CONCAT(event_date, '-', id) WHERE custom_id IS NULL;

-- 添加remarks字段
ALTER TABLE events ADD COLUMN remarks TEXT AFTER event_time;

-- 检查修改结果
DESCRIBE events; 