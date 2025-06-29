"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const positionController_1 = require("../controllers/positionController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// 通用异步处理器包装
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
// 获取活动的所有席位（不需要认证）
router.get('/events/:eventId/positions', asyncHandler(positionController_1.PositionController.getEventPositions));
// 以下路由需要认证
router.use(auth_1.authenticateToken);
// 创建席位（需要管理员权限）
router.post('/', auth_1.requireAdmin, asyncHandler(positionController_1.PositionController.create));
// 批量创建席位（需要管理员权限）
router.post('/batch', auth_1.requireAdmin, asyncHandler(positionController_1.PositionController.createBatch));
// 更新席位（需要管理员权限）
router.put('/:id', auth_1.requireAdmin, asyncHandler(positionController_1.PositionController.update));
// 删除席位（需要管理员权限）
router.delete('/:id', auth_1.requireAdmin, asyncHandler(positionController_1.PositionController.delete));
// 报名席位
router.post('/:id/signup', asyncHandler(positionController_1.PositionController.signup));
// 取消报名
router.delete('/:id/signup', asyncHandler(positionController_1.PositionController.cancelSignup));
// 获取用户的报名记录
router.get('/my-signups', asyncHandler(positionController_1.PositionController.getUserSignups));
// 获取监管学员数量
router.get('/supervised-students-count', asyncHandler(positionController_1.PositionController.getSupervisedStudentsCount));
exports.default = router;
