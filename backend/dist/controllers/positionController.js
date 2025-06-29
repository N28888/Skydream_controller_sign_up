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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PositionController = void 0;
const Position_1 = require("../models/Position");
const User_1 = require("../models/User");
class PositionController {
    // 获取活动的所有席位
    static getEventPositions(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const eventId = Number(req.params.eventId);
                const positions = yield Position_1.PositionModel.findByEventId(eventId);
                res.json({ success: true, data: positions });
            }
            catch (error) {
                console.error('获取席位列表失败:', error);
                res.status(500).json({ success: false, message: '服务器内部错误' });
            }
        });
    }
    // 创建席位
    static create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { event_id, position_name, position_type } = req.body;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                if (!event_id || !position_name || !position_type) {
                    return res.status(400).json({ success: false, message: '请填写完整席位信息' });
                }
                // 验证席位类型
                const validTypes = ['DEL', 'GND', 'TWR', 'APP', 'CTR', 'FSS'];
                if (!validTypes.includes(position_type)) {
                    return res.status(400).json({ success: false, message: '无效的席位类型' });
                }
                const positionId = yield Position_1.PositionModel.create({
                    event_id,
                    position_name,
                    position_type,
                    is_taken: false
                });
                const position = yield Position_1.PositionModel.findById(positionId);
                res.status(201).json({ success: true, message: '席位创建成功', data: position });
            }
            catch (error) {
                console.error('创建席位失败:', error);
                res.status(500).json({ success: false, message: '服务器内部错误' });
            }
        });
    }
    // 批量创建席位
    static createBatch(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { event_id, positions } = req.body;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                if (!event_id || !positions || !Array.isArray(positions)) {
                    return res.status(400).json({ success: false, message: '请提供有效的席位数据' });
                }
                // 验证席位数据
                const validTypes = ['DEL', 'GND', 'TWR', 'APP', 'CTR', 'FSS'];
                for (const pos of positions) {
                    if (!pos.position_name || !pos.position_type || !validTypes.includes(pos.position_type)) {
                        return res.status(400).json({ success: false, message: '席位数据格式错误' });
                    }
                }
                const positionData = positions.map((pos) => ({
                    event_id,
                    position_name: pos.position_name,
                    position_type: pos.position_type,
                    is_taken: false
                }));
                const positionIds = yield Position_1.PositionModel.createBatch(positionData);
                const createdPositions = yield Promise.all(positionIds.map(id => Position_1.PositionModel.findById(id)));
                res.status(201).json({
                    success: true,
                    message: `成功创建 ${createdPositions.length} 个席位`,
                    data: createdPositions
                });
            }
            catch (error) {
                console.error('批量创建席位失败:', error);
                res.status(500).json({ success: false, message: '服务器内部错误' });
            }
        });
    }
    // 更新席位
    static update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const id = Number(req.params.id);
                const updates = req.body;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                // 只允许更新某些字段
                const allowedFields = ['position_name', 'position_type', 'student_supervised'];
                const filteredUpdates = {};
                for (const field of allowedFields) {
                    if (updates[field] !== undefined) {
                        filteredUpdates[field] = updates[field];
                    }
                }
                if (Object.keys(filteredUpdates).length === 0) {
                    return res.status(400).json({ success: false, message: '没有可更新的字段' });
                }
                const ok = yield Position_1.PositionModel.update(id, filteredUpdates);
                if (!ok) {
                    return res.status(404).json({ success: false, message: '席位不存在或更新失败' });
                }
                const position = yield Position_1.PositionModel.findById(id);
                res.json({ success: true, message: '席位更新成功', data: position });
            }
            catch (error) {
                console.error('更新席位失败:', error);
                res.status(500).json({ success: false, message: '服务器内部错误' });
            }
        });
    }
    // 删除席位
    static delete(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const id = Number(req.params.id);
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const position = yield Position_1.PositionModel.findById(id);
                if (!position) {
                    return res.status(404).json({ success: false, message: '席位不存在' });
                }
                // 检查席位是否已被占用
                if (position.is_taken) {
                    return res.status(400).json({ success: false, message: '无法删除已被占用的席位' });
                }
                const ok = yield Position_1.PositionModel.delete(id);
                if (!ok) {
                    return res.status(404).json({ success: false, message: '席位删除失败' });
                }
                res.json({ success: true, message: '席位已删除' });
            }
            catch (error) {
                console.error('删除席位失败:', error);
                res.status(500).json({ success: false, message: '服务器内部错误' });
            }
        });
    }
    // 报名席位
    static signup(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const positionId = Number(req.params.id);
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const { student_supervised } = req.body;
                if (!userId) {
                    return res.status(401).json({ success: false, message: '请先登录' });
                }
                // 获取用户信息
                const user = yield User_1.UserModel.findById(userId);
                if (!user) {
                    return res.status(404).json({ success: false, message: '用户不存在' });
                }
                // 获取席位信息
                const position = yield Position_1.PositionModel.findById(positionId);
                if (!position) {
                    return res.status(404).json({ success: false, message: '席位不存在' });
                }
                // 检查席位是否已被占用
                if (position.is_taken) {
                    return res.status(400).json({ success: false, message: '席位已被占用' });
                }
                // 检查用户等级权限
                const userLevel = user.level;
                const positionType = position.position_type;
                // 权限检查逻辑
                const canSignup = checkUserPermission(userLevel, positionType);
                if (!canSignup) {
                    return res.status(403).json({
                        success: false,
                        message: `您的等级 ${userLevel} 无法报名 ${positionType} 席位`
                    });
                }
                // 如果是学生等级且指定了监督员，验证监督员是否存在
                if (student_supervised) {
                    const supervisor = yield User_1.UserModel.findByUsername(student_supervised);
                    if (!supervisor || !['I1', 'I2', 'I3', 'SUP', 'ADM'].includes(supervisor.level)) {
                        return res.status(400).json({
                            success: false,
                            message: '指定的监督员不存在或无监督权限'
                        });
                    }
                }
                yield Position_1.PositionModel.signup(positionId, userId, student_supervised);
                const updatedPosition = yield Position_1.PositionModel.findById(positionId);
                res.json({ success: true, message: '席位报名成功', data: updatedPosition });
            }
            catch (error) {
                console.error('报名席位失败:', error);
                if (error instanceof Error) {
                    res.status(400).json({ success: false, message: error.message });
                }
                else {
                    res.status(500).json({ success: false, message: '服务器内部错误' });
                }
            }
        });
    }
    // 取消报名
    static cancelSignup(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const positionId = Number(req.params.id);
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                if (!userId) {
                    return res.status(401).json({ success: false, message: '请先登录' });
                }
                yield Position_1.PositionModel.cancelSignup(positionId, userId);
                const updatedPosition = yield Position_1.PositionModel.findById(positionId);
                res.json({ success: true, message: '取消报名成功', data: updatedPosition });
            }
            catch (error) {
                console.error('取消报名失败:', error);
                if (error instanceof Error) {
                    res.status(400).json({ success: false, message: error.message });
                }
                else {
                    res.status(500).json({ success: false, message: '服务器内部错误' });
                }
            }
        });
    }
    // 获取用户的报名记录
    static getUserSignups(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                if (!userId) {
                    return res.status(401).json({ success: false, message: '请先登录' });
                }
                const signups = yield Position_1.PositionModel.getUserSignups(userId);
                res.json({ success: true, data: signups });
            }
            catch (error) {
                console.error('获取报名记录失败:', error);
                res.status(500).json({ success: false, message: '服务器内部错误' });
            }
        });
    }
    // 获取监管学员数量
    static getSupervisedStudentsCount(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const userLevel = (_b = req.user) === null || _b === void 0 ? void 0 : _b.level;
                if (!userId) {
                    return res.status(401).json({ success: false, message: '请先登录' });
                }
                // 只有监督员等级才能获取监管学员数量
                if (!['I1', 'I2', 'I3', 'SUP', 'ADM'].includes(userLevel)) {
                    return res.status(403).json({ success: false, message: '权限不足' });
                }
                // 获取用户信息
                const user = yield User_1.UserModel.findById(userId);
                if (!user) {
                    return res.status(404).json({ success: false, message: '用户不存在' });
                }
                const count = yield Position_1.PositionModel.getSupervisedStudentsCount(user.username);
                res.json({ success: true, data: { count } });
            }
            catch (error) {
                console.error('获取监管学员数量失败:', error);
                res.status(500).json({ success: false, message: '服务器内部错误' });
            }
        });
    }
}
exports.PositionController = PositionController;
// 检查用户等级是否有权限报名特定类型的席位
function checkUserPermission(userLevel, positionType) {
    var _a;
    const permissions = {
        'S1': ['DEL', 'GND'],
        'S2': ['DEL', 'GND', 'TWR'],
        'S3': ['DEL', 'GND', 'TWR', 'APP'],
        'C1': ['DEL', 'GND', 'TWR', 'APP'],
        'C2': ['DEL', 'GND', 'TWR', 'APP', 'CTR'],
        'C3': ['DEL', 'GND', 'TWR', 'APP', 'CTR', 'FSS'],
        'I1': ['DEL', 'GND', 'TWR', 'APP', 'CTR', 'FSS'],
        'I2': ['DEL', 'GND', 'TWR', 'APP', 'CTR', 'FSS'],
        'I3': ['DEL', 'GND', 'TWR', 'APP', 'CTR', 'FSS'],
        'SUP': ['DEL', 'GND', 'TWR', 'APP', 'CTR', 'FSS'],
        'ADM': ['DEL', 'GND', 'TWR', 'APP', 'CTR', 'FSS'],
    };
    return ((_a = permissions[userLevel]) === null || _a === void 0 ? void 0 : _a.includes(positionType)) || false;
}
