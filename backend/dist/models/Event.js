"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventModel = void 0;
const database_1 = __importDefault(require("../config/database"));
class EventModel {
    // 测试数据库连接
    static testConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const connection = yield database_1.default.getConnection();
                connection.release();
                return true;
            }
            catch (error) {
                console.error('数据库连接测试失败:', error);
                return false;
            }
        });
    }
    // 生成自定义活动ID
    static generateEventId(eventDate) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // 查询同一天的活动数量
                const [rows] = yield database_1.default.execute('SELECT COUNT(*) as count FROM events WHERE DATE(event_date) = ?', [eventDate]);
                const count = rows[0].count;
                // 返回格式：YYYY-MM-DD-序号
                return `${eventDate}-${count + 1}`;
            }
            catch (error) {
                console.error('生成活动ID失败:', error);
                throw new Error('生成活动ID失败');
            }
        });
    }
    // 创建活动
    static create(event) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // 生成自定义活动ID
                const customId = yield this.generateEventId(event.event_date);
                const [result] = yield database_1.default.execute(`INSERT INTO events (title, departure_airport, arrival_airport, route, flight_level, airac, event_date, event_time, remarks, created_by, custom_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                    event.title,
                    event.departure_airport,
                    event.arrival_airport,
                    event.route,
                    event.flight_level,
                    event.airac,
                    event.event_date,
                    event.event_time,
                    event.remarks || null,
                    event.created_by,
                    customId
                ]);
                return result.insertId;
            }
            catch (error) {
                console.error('创建活动失败:', error);
                throw new Error('创建活动失败');
            }
        });
    }
    // 获取活动列表
    static findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const [rows] = yield database_1.default.execute('SELECT * FROM events ORDER BY event_date DESC, event_time DESC');
                return rows;
            }
            catch (error) {
                console.error('获取活动列表失败:', error);
                throw new Error('获取活动列表失败');
            }
        });
    }
    // 获取活动详情
    static findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const [rows] = yield database_1.default.execute('SELECT * FROM events WHERE id = ?', [id]);
                const events = rows;
                return events.length > 0 ? events[0] : null;
            }
            catch (error) {
                console.error('获取活动详情失败:', error);
                throw new Error('获取活动详情失败');
            }
        });
    }
    // 更新活动
    static update(id, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
                const values = Object.values(updates);
                values.push(id);
                const [result] = yield database_1.default.execute(`UPDATE events SET ${fields} WHERE id = ?`, values);
                return result.affectedRows > 0;
            }
            catch (error) {
                console.error('更新活动失败:', error);
                throw new Error('更新活动失败');
            }
        });
    }
    // 删除活动
    static delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const [result] = yield database_1.default.execute('DELETE FROM events WHERE id = ?', [id]);
                return result.affectedRows > 0;
            }
            catch (error) {
                console.error('删除活动失败:', error);
                throw new Error('删除活动失败');
            }
        });
    }
    // 查找已过期活动（活动日早于指定日期）
    static findExpired(date) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const [rows] = yield database_1.default.execute('SELECT * FROM events WHERE event_date < ?', [date]);
                return rows;
            }
            catch (error) {
                console.error('查找过期活动失败:', error);
                throw new Error('查找过期活动失败');
            }
        });
    }
}
exports.EventModel = EventModel;
