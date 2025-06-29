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
exports.PositionModel = void 0;
const database_1 = __importDefault(require("../config/database"));
class PositionModel {
    // 创建席位
    static create(position) {
        return __awaiter(this, void 0, void 0, function* () {
            const [result] = yield database_1.default.execute('INSERT INTO positions (event_id, position_name, position_type, is_taken, taken_by, student_supervised) VALUES (?, ?, ?, ?, ?, ?)', [
                position.event_id,
                position.position_name,
                position.position_type,
                position.is_taken,
                typeof position.taken_by === 'undefined' ? null : position.taken_by,
                typeof position.student_supervised === 'undefined' ? null : position.student_supervised
            ]);
            return result.insertId;
        });
    }
    // 根据ID查找席位
    static findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const [rows] = yield database_1.default.execute(`SELECT p.*, u.username as taken_by_username, u.level as taken_by_level 
       FROM positions p 
       LEFT JOIN users u ON p.taken_by = u.id 
       WHERE p.id = ?`, [id]);
            const positions = rows;
            return positions.length > 0 ? positions[0] : null;
        });
    }
    // 根据活动ID查找所有席位
    static findByEventId(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            const [rows] = yield database_1.default.execute(`SELECT p.*, u.username as taken_by_username, u.level as taken_by_level 
       FROM positions p 
       LEFT JOIN users u ON p.taken_by = u.id 
       WHERE p.event_id = ? 
       ORDER BY p.position_type, p.position_name`, [eventId]);
            return rows;
        });
    }
    // 更新席位
    static update(id, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
            const values = Object.values(updates);
            values.push(id);
            const [result] = yield database_1.default.execute(`UPDATE positions SET ${fields} WHERE id = ?`, values);
            return result.affectedRows > 0;
        });
    }
    // 删除席位
    static delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const [result] = yield database_1.default.execute('DELETE FROM positions WHERE id = ?', [id]);
            return result.affectedRows > 0;
        });
    }
    // 报名席位
    static signup(positionId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield database_1.default.getConnection();
            try {
                yield connection.beginTransaction();
                // 检查席位是否已被占用
                const [rows] = yield connection.execute('SELECT is_taken FROM positions WHERE id = ?', [positionId]);
                const positions = rows;
                if (positions.length === 0) {
                    throw new Error('席位不存在');
                }
                if (positions[0].is_taken) {
                    throw new Error('席位已被占用');
                }
                // 更新席位状态
                yield connection.execute('UPDATE positions SET is_taken = TRUE, taken_by = ? WHERE id = ?', [userId, positionId]);
                // 创建报名记录
                yield connection.execute('INSERT INTO signups (user_id, position_id) VALUES (?, ?)', [userId, positionId]);
                yield connection.commit();
                return true;
            }
            catch (error) {
                yield connection.rollback();
                throw error;
            }
            finally {
                connection.release();
            }
        });
    }
    // 取消报名
    static cancelSignup(positionId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield database_1.default.getConnection();
            try {
                yield connection.beginTransaction();
                // 检查席位是否被当前用户占用
                const [rows] = yield connection.execute('SELECT taken_by FROM positions WHERE id = ?', [positionId]);
                const positions = rows;
                if (positions.length === 0) {
                    throw new Error('席位不存在');
                }
                if (positions[0].taken_by !== userId) {
                    throw new Error('您没有权限取消此报名');
                }
                // 更新席位状态
                yield connection.execute('UPDATE positions SET is_taken = FALSE, taken_by = NULL, student_supervised = NULL WHERE id = ?', [positionId]);
                // 删除报名记录
                yield connection.execute('DELETE FROM signups WHERE user_id = ? AND position_id = ?', [userId, positionId]);
                yield connection.commit();
                return true;
            }
            catch (error) {
                yield connection.rollback();
                throw error;
            }
            finally {
                connection.release();
            }
        });
    }
    // 批量创建席位
    static createBatch(positions) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield database_1.default.getConnection();
            try {
                yield connection.beginTransaction();
                const insertIds = [];
                for (const position of positions) {
                    const [result] = yield connection.execute('INSERT INTO positions (event_id, position_name, position_type, is_taken, taken_by, student_supervised) VALUES (?, ?, ?, ?, ?, ?)', [
                        position.event_id,
                        position.position_name,
                        position.position_type,
                        position.is_taken || false,
                        position.taken_by || null,
                        position.student_supervised || null
                    ]);
                    insertIds.push(result.insertId);
                }
                yield connection.commit();
                return insertIds;
            }
            catch (error) {
                yield connection.rollback();
                throw error;
            }
            finally {
                connection.release();
            }
        });
    }
    // 获取用户的报名记录
    static getUserSignups(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const [rows] = yield database_1.default.execute(`SELECT p.*, u.username as taken_by_username, u.level as taken_by_level,
              e.title as event_title, e.event_date, e.event_time, e.departure_airport, e.arrival_airport
       FROM positions p 
       LEFT JOIN users u ON p.taken_by = u.id 
       LEFT JOIN events e ON p.event_id = e.id
       WHERE p.taken_by = ? 
       ORDER BY e.event_date ASC, e.event_time ASC`, [userId]);
            return rows;
        });
    }
    // 获取监管学员数量
    static getSupervisedStudentsCount(supervisorUsername) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const [rows] = yield database_1.default.execute(`SELECT COUNT(*) as count 
       FROM positions p 
       WHERE p.student_supervised = ? AND p.is_taken = TRUE`, [supervisorUsername]);
            const result = rows;
            return ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.count) || 0;
        });
    }
}
exports.PositionModel = PositionModel;
