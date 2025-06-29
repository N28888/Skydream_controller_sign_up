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
    if (!token) {
        res.status(401).json({
            success: false,
            message: '访问令牌缺失'
        });
        return;
    }
    const jwtSecret = process.env.JWT_SECRET || 'default-secret';
    jsonwebtoken_1.default.verify(token, jwtSecret, (err, decoded) => {
        if (err) {
            res.status(403).json({
                success: false,
                message: '无效的访问令牌'
            });
            return;
        }
        req.user = decoded;
        next();
    });
};
exports.authenticateToken = authenticateToken;
// 检查用户权限等级
const requireLevel = (requiredLevels) => {
    return (req, res, next) => {
        var _a;
        const userLevel = (_a = req.user) === null || _a === void 0 ? void 0 : _a.level;
        if (!userLevel || !requiredLevels.includes(userLevel)) {
            res.status(403).json({
                success: false,
                message: '权限不足'
            });
            return;
        }
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
