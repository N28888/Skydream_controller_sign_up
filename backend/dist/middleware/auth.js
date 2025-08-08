"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireSupervisor = exports.requireAdmin = exports.requireLevel = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    console.log(`Token验证 - 请求路径: ${req.path}`);
    console.log(`Token验证 - Authorization头: ${authHeader ? '存在' : '不存在'}`);
    console.log(`Token验证 - Token: ${token ? token.substring(0, 20) + '...' : '不存在'}`);
    if (!token) {
        console.log('Token验证失败 - 缺少Token');
        res.status(401).json({
            success: false,
            message: '访问令牌缺失'
        });
        return;
    }
    const jwtSecret = process.env.JWT_SECRET || 'default-secret';
    console.log(`Token验证 - JWT密钥长度: ${jwtSecret.length}`);
    jsonwebtoken_1.default.verify(token, jwtSecret, (err, decoded) => {
        if (err) {
            console.log(`Token验证失败 - 错误: ${err.message}`);
            res.status(403).json({
                success: false,
                message: '无效的访问令牌'
            });
            return;
        }
        console.log(`Token验证成功 - 用户ID: ${decoded.userId}, 用户名: ${decoded.username}, 级别: ${decoded.level}`);
        req.user = decoded;
        next();
    });
};
exports.authenticateToken = authenticateToken;
// 检查用户权限等级
const requireLevel = (requiredLevels) => {
    return (req, res, next) => {
        var _a, _b, _c;
        const userLevel = (_a = req.user) === null || _a === void 0 ? void 0 : _a.level;
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.userId;
        const username = (_c = req.user) === null || _c === void 0 ? void 0 : _c.username;
        console.log(`权限检查 - 用户ID: ${userId}, 用户名: ${username}, 用户级别: ${userLevel}`);
        console.log(`权限检查 - 需要的级别: ${requiredLevels.join(', ')}`);
        if (!userLevel || !requiredLevels.includes(userLevel)) {
            console.log(`权限检查失败 - 用户级别: ${userLevel}, 需要级别: ${requiredLevels.join(', ')}`);
            res.status(403).json({
                success: false,
                message: '权限不足'
            });
            return;
        }
        console.log(`权限检查通过 - 用户级别: ${userLevel}`);
        next();
    };
};
exports.requireLevel = requireLevel;
// 检查是否为管理员
const requireAdmin = (req, res, next) => {
    (0, exports.requireLevel)(['SUP', 'ADM'])(req, res, next);
};
exports.requireAdmin = requireAdmin;
// 检查是否为监督员或管理员
const requireSupervisor = (req, res, next) => {
    (0, exports.requireLevel)(['SUP', 'ADM'])(req, res, next);
};
exports.requireSupervisor = requireSupervisor;
