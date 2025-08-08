"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'skydream_controller',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};
const pool = promise_1.default.createPool(dbConfig);
// 测试数据库连接
pool.getConnection()
    .then(connection => {
    console.log('✅ 数据库连接成功');
    connection.release();
})
    .catch(err => {
    console.error('❌ 数据库连接失败:', err.message);
    console.error('数据库配置:', {
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.user,
        database: dbConfig.database
    });
});
exports.default = pool;
