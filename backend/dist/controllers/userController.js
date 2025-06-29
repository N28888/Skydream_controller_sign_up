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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
class UserController {
    // 用户注册
    static register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { username, password, email } = req.body;
                // 检查用户是否已存在
                const existingUser = yield User_1.UserModel.findByUsername(username);
                if (existingUser) {
                    return res.status(400).json({ message: '呼号已存在' });
                }
                // 加密密码
                const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
                // 创建新用户，默认等级为S1
                const userId = yield User_1.UserModel.create({
                    username,
                    password: hashedPassword,
                    email,
                    level: 'S1',
                });
                const user = yield User_1.UserModel.findById(userId);
                res.status(201).json({
                    message: '注册成功',
                    user,
                });
            }
            catch (error) {
                console.error('注册错误:', error);
                res.status(500).json({ message: '注册失败' });
            }
        });
    }
    // 用户登录
    static login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { username, password } = req.body;
                // 验证必填字段
                if (!username || !password) {
                    return res.status(400).json({
                        success: false,
                        message: '呼号和密码都是必填项'
                    });
                }
                // 查找用户
                const user = yield User_1.UserModel.findByUsername(username);
                if (!user) {
                    return res.status(401).json({
                        success: false,
                        message: '呼号或密码错误'
                    });
                }
                // 验证密码
                const isValidPassword = yield bcryptjs_1.default.compare(password, user.password);
                if (!isValidPassword) {
                    return res.status(401).json({
                        success: false,
                        message: '呼号或密码错误'
                    });
                }
                // 生成JWT令牌
                const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
                const token = jsonwebtoken_1.default.sign({
                    userId: user.id,
                    username: user.username,
                    level: user.level
                }, jwtSecret, { expiresIn: '24h' });
                // 返回用户信息（不包含密码）
                const { password: _ } = user, userWithoutPassword = __rest(user, ["password"]);
                res.json({
                    success: true,
                    message: '登录成功',
                    data: {
                        user: userWithoutPassword,
                        token
                    }
                });
            }
            catch (error) {
                console.error('登录错误:', error);
                res.status(500).json({
                    success: false,
                    message: '服务器内部错误'
                });
            }
        });
    }
    // 获取当前用户信息
    static getProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                if (!userId) {
                    return res.status(401).json({
                        success: false,
                        message: '未授权访问'
                    });
                }
                const user = yield User_1.UserModel.findById(userId);
                if (!user) {
                    return res.status(404).json({
                        success: false,
                        message: '用户不存在'
                    });
                }
                res.json({
                    success: true,
                    data: user
                });
            }
            catch (error) {
                console.error('获取用户信息错误:', error);
                res.status(500).json({
                    success: false,
                    message: '服务器内部错误'
                });
            }
        });
    }
    // 获取所有用户（管理员权限）
    static getAllUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userLevel = (_a = req.user) === null || _a === void 0 ? void 0 : _a.level;
                if (!userLevel || !['SUP', 'ADM'].includes(userLevel)) {
                    return res.status(403).json({
                        success: false,
                        message: '权限不足'
                    });
                }
                const users = yield User_1.UserModel.findAll();
                res.json({
                    success: true,
                    data: users
                });
            }
            catch (error) {
                console.error('获取用户列表错误:', error);
                res.status(500).json({
                    success: false,
                    message: '服务器内部错误'
                });
            }
        });
    }
    // 更新用户信息（管理员权限）
    static updateUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userLevel = (_a = req.user) === null || _a === void 0 ? void 0 : _a.level;
                if (!userLevel || !['SUP', 'ADM'].includes(userLevel)) {
                    return res.status(403).json({
                        success: false,
                        message: '权限不足'
                    });
                }
                const userId = Number(req.params.id);
                const updates = req.body;
                // 验证等级是否有效
                if (updates.level) {
                    const validLevels = ['S1', 'S2', 'S3', 'C1', 'C2', 'C3', 'I1', 'I2', 'I3', 'SUP', 'ADM'];
                    if (!validLevels.includes(updates.level)) {
                        return res.status(400).json({
                            success: false,
                            message: '无效的管制员等级'
                        });
                    }
                }
                // 检查用户是否存在
                const existingUser = yield User_1.UserModel.findById(userId);
                if (!existingUser) {
                    return res.status(404).json({
                        success: false,
                        message: '用户不存在'
                    });
                }
                // 如果更新密码，需要加密
                if (updates.password) {
                    const saltRounds = 10;
                    updates.password = yield bcryptjs_1.default.hash(updates.password, saltRounds);
                }
                // 更新用户
                const success = yield User_1.UserModel.update(userId, updates);
                if (!success) {
                    return res.status(500).json({
                        success: false,
                        message: '更新用户失败'
                    });
                }
                // 获取更新后的用户信息
                const updatedUser = yield User_1.UserModel.findById(userId);
                res.json({
                    success: true,
                    message: '用户更新成功',
                    data: updatedUser
                });
            }
            catch (error) {
                console.error('更新用户错误:', error);
                res.status(500).json({
                    success: false,
                    message: '服务器内部错误'
                });
            }
        });
    }
    // 创建用户（管理员权限）
    static createUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userLevel = (_a = req.user) === null || _a === void 0 ? void 0 : _a.level;
                if (!userLevel || !['SUP', 'ADM'].includes(userLevel)) {
                    return res.status(403).json({
                        success: false,
                        message: '权限不足'
                    });
                }
                const { username, password, email, level } = req.body;
                // 验证必填字段
                if (!username || !password || !email || !level) {
                    return res.status(400).json({
                        success: false,
                        message: '呼号、密码、邮箱和等级都是必填项'
                    });
                }
                // 验证等级是否有效
                const validLevels = ['S1', 'S2', 'S3', 'C1', 'C2', 'C3', 'I1', 'I2', 'I3', 'SUP', 'ADM'];
                if (!validLevels.includes(level)) {
                    return res.status(400).json({
                        success: false,
                        message: '无效的管制员等级'
                    });
                }
                // 检查用户是否已存在
                const existingUser = yield User_1.UserModel.findByUsername(username);
                if (existingUser) {
                    return res.status(400).json({
                        success: false,
                        message: '呼号已存在'
                    });
                }
                // 加密密码
                const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
                // 创建新用户
                const userId = yield User_1.UserModel.create({
                    username,
                    password: hashedPassword,
                    email,
                    level,
                });
                // 获取创建的用户信息（不包含密码）
                const user = yield User_1.UserModel.findById(userId);
                res.status(201).json({
                    success: true,
                    message: '用户创建成功',
                    data: user
                });
            }
            catch (error) {
                console.error('创建用户错误:', error);
                res.status(500).json({
                    success: false,
                    message: '服务器内部错误'
                });
            }
        });
    }
    // 删除用户（管理员权限）
    static deleteUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const userLevel = (_a = req.user) === null || _a === void 0 ? void 0 : _a.level;
                if (!userLevel || !['SUP', 'ADM'].includes(userLevel)) {
                    return res.status(403).json({
                        success: false,
                        message: '权限不足'
                    });
                }
                const userId = Number(req.params.id);
                const currentUserId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.userId;
                // 不能删除自己
                if (userId === currentUserId) {
                    return res.status(400).json({
                        success: false,
                        message: '不能删除自己的账户'
                    });
                }
                // 检查用户是否存在
                const existingUser = yield User_1.UserModel.findById(userId);
                if (!existingUser) {
                    return res.status(404).json({
                        success: false,
                        message: '用户不存在'
                    });
                }
                // 删除用户
                const success = yield User_1.UserModel.delete(userId);
                if (!success) {
                    return res.status(500).json({
                        success: false,
                        message: '删除用户失败'
                    });
                }
                res.json({
                    success: true,
                    message: '用户删除成功'
                });
            }
            catch (error) {
                console.error('删除用户错误:', error);
                res.status(500).json({
                    success: false,
                    message: '服务器内部错误'
                });
            }
        });
    }
}
exports.UserController = UserController;
