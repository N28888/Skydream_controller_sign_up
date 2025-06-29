"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// 通用异步处理器包装
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
// 公开路由
router.post('/register', asyncHandler(userController_1.UserController.register));
router.post('/login', asyncHandler(userController_1.UserController.login));
// 需要认证的路由
router.get('/profile', auth_1.authenticateToken, asyncHandler(userController_1.UserController.getProfile));
router.post('/change-password', auth_1.authenticateToken, asyncHandler(userController_1.UserController.changePassword));
// 需要管理员权限的路由
router.post('/create', auth_1.authenticateToken, auth_1.requireAdmin, asyncHandler(userController_1.UserController.createUser));
router.get('/all', auth_1.authenticateToken, auth_1.requireAdmin, asyncHandler(userController_1.UserController.getAllUsers));
router.put('/:id', auth_1.authenticateToken, auth_1.requireAdmin, asyncHandler(userController_1.UserController.updateUser));
router.delete('/:id', auth_1.authenticateToken, auth_1.requireAdmin, asyncHandler(userController_1.UserController.deleteUser));
exports.default = router;
