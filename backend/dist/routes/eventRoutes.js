"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const eventController_1 = require("../controllers/eventController");
const positionController_1 = require("../controllers/positionController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// 通用异步处理器包装
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
// 数据库连接测试
router.get('/test-db', asyncHandler(eventController_1.EventController.testDatabaseConnection));
// 获取活动列表（所有人可见）
router.get('/', asyncHandler(eventController_1.EventController.list));
// 获取活动详情（所有人可见）
router.get('/:id', asyncHandler(eventController_1.EventController.detail));
// 获取活动的所有席位（所有人可见）
router.get('/:eventId/positions', asyncHandler(positionController_1.PositionController.getEventPositions));
// 创建活动（仅SUP/ADM）
router.post('/', auth_1.authenticateToken, auth_1.requireSupervisor, asyncHandler(eventController_1.EventController.create));
// 更新活动（仅SUP/ADM）
router.put('/:id', auth_1.authenticateToken, auth_1.requireSupervisor, asyncHandler(eventController_1.EventController.update));
// 删除活动（仅SUP/ADM）
router.delete('/:id', auth_1.authenticateToken, auth_1.requireSupervisor, asyncHandler(eventController_1.EventController.remove));
exports.default = router;
