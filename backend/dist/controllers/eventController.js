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
exports.EventController = void 0;
const Event_1 = require("../models/Event");
class EventController {
    // 测试数据库连接
    static testDatabaseConnection(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const isConnected = yield Event_1.EventModel.testConnection();
                if (isConnected) {
                    res.json({ success: true, message: '数据库连接正常' });
                }
                else {
                    res.status(500).json({ success: false, message: '数据库连接失败' });
                }
            }
            catch (error) {
                console.error('数据库连接测试失败:', error);
                res.status(500).json({ success: false, message: '数据库连接测试失败' });
            }
        });
    }
    // 创建活动
    static create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { title, departure_airport, arrival_airport, route, flight_level, airac, event_date, event_time } = req.body;
                const created_by = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                if (!title || !departure_airport || !arrival_airport || !event_date || !event_time) {
                    return res.status(400).json({ success: false, message: '请填写完整活动信息' });
                }
                const eventId = yield Event_1.EventModel.create({
                    title,
                    departure_airport,
                    arrival_airport,
                    route,
                    flight_level,
                    airac,
                    event_date,
                    event_time,
                    created_by
                });
                const event = yield Event_1.EventModel.findById(eventId);
                res.status(201).json({ success: true, message: '活动创建成功', data: event });
            }
            catch (error) {
                console.error('创建活动失败:', error);
                res.status(500).json({ success: false, message: error instanceof Error ? error.message : '服务器内部错误' });
            }
        });
    }
    // 获取活动列表
    static list(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const events = yield Event_1.EventModel.findAll();
                res.json({ success: true, data: events });
            }
            catch (error) {
                console.error('获取活动列表失败:', error);
                res.status(500).json({ success: false, message: error instanceof Error ? error.message : '服务器内部错误' });
            }
        });
    }
    // 获取活动详情
    static detail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = Number(req.params.id);
                const event = yield Event_1.EventModel.findById(id);
                if (!event) {
                    return res.status(404).json({ success: false, message: '活动不存在' });
                }
                res.json({ success: true, data: event });
            }
            catch (error) {
                console.error('获取活动详情失败:', error);
                res.status(500).json({ success: false, message: error instanceof Error ? error.message : '服务器内部错误' });
            }
        });
    }
    // 更新活动
    static update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = Number(req.params.id);
                const updates = req.body;
                const ok = yield Event_1.EventModel.update(id, updates);
                if (!ok) {
                    return res.status(404).json({ success: false, message: '活动不存在或更新失败' });
                }
                const event = yield Event_1.EventModel.findById(id);
                res.json({ success: true, message: '活动更新成功', data: event });
            }
            catch (error) {
                console.error('更新活动失败:', error);
                res.status(500).json({ success: false, message: error instanceof Error ? error.message : '服务器内部错误' });
            }
        });
    }
    // 删除活动
    static remove(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const id = Number(req.params.id);
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const userLevel = (_b = req.user) === null || _b === void 0 ? void 0 : _b.level;
                console.log(`删除活动请求 - ID: ${id}, 用户ID: ${userId}, 用户级别: ${userLevel}`);
                // 检查活动是否存在
                const event = yield Event_1.EventModel.findById(id);
                if (!event) {
                    console.log(`活动不存在 - ID: ${id}`);
                    return res.status(404).json({ success: false, message: '活动不存在' });
                }
                console.log(`找到活动 - ID: ${id}, 标题: ${event.title}`);
                const ok = yield Event_1.EventModel.delete(id);
                if (!ok) {
                    console.log(`删除活动失败 - ID: ${id}`);
                    return res.status(500).json({ success: false, message: '删除活动失败' });
                }
                console.log(`活动删除成功 - ID: ${id}`);
                res.json({ success: true, message: '活动已删除' });
            }
            catch (error) {
                console.error('删除活动失败:', error);
                res.status(500).json({ success: false, message: error instanceof Error ? error.message : '服务器内部错误' });
            }
        });
    }
}
exports.EventController = EventController;
