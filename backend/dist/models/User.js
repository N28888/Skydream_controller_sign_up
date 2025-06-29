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
exports.UserModel = void 0;
const database_1 = __importDefault(require("../config/database"));
class UserModel {
    // 创建用户
    static create(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const [result] = yield database_1.default.execute('INSERT INTO users (username, email, password, level) VALUES (?, ?, ?, ?)', [user.username, user.email, user.password, user.level]);
            return result.insertId;
        });
    }
    // 根据用户名查找用户
    static findByUsername(username) {
        return __awaiter(this, void 0, void 0, function* () {
            const [rows] = yield database_1.default.execute('SELECT * FROM users WHERE username = ?', [username]);
            const users = rows;
            return users.length > 0 ? users[0] : null;
        });
    }
    // 根据邮箱查找用户
    static findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const [rows] = yield database_1.default.execute('SELECT * FROM users WHERE email = ?', [email]);
            const users = rows;
            return users.length > 0 ? users[0] : null;
        });
    }
    // 根据ID查找用户（不返回密码）
    static findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const [rows] = yield database_1.default.execute('SELECT id, username, email, level, created_at, updated_at FROM users WHERE id = ?', [id]);
            const users = rows;
            return users.length > 0 ? users[0] : null;
        });
    }
    // 更新用户信息
    static update(id, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
            const values = Object.values(updates);
            values.push(id);
            const [result] = yield database_1.default.execute(`UPDATE users SET ${fields} WHERE id = ?`, values);
            return result.affectedRows > 0;
        });
    }
    // 获取所有用户（不返回密码）
    static findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const [rows] = yield database_1.default.execute('SELECT id, username, email, level, created_at, updated_at FROM users ORDER BY created_at DESC');
            return rows;
        });
    }
    // 删除用户
    static delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const [result] = yield database_1.default.execute('DELETE FROM users WHERE id = ?', [id]);
            return result.affectedRows > 0;
        });
    }
}
exports.UserModel = UserModel;
