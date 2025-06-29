import { Router, Request, Response, NextFunction } from 'express';
import { UserController } from '../controllers/userController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// 通用异步处理器包装
const asyncHandler = (fn: any) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// 公开路由
router.post('/register', asyncHandler(UserController.register));
router.post('/login', asyncHandler(UserController.login));

// 需要认证的路由
router.get('/profile', authenticateToken, asyncHandler(UserController.getProfile));
router.post('/change-password', authenticateToken, asyncHandler(UserController.changePassword));

// 需要管理员权限的路由
router.post('/create', authenticateToken, requireAdmin, asyncHandler(UserController.createUser));
router.get('/all', authenticateToken, requireAdmin, asyncHandler(UserController.getAllUsers));
router.put('/:id', authenticateToken, requireAdmin, asyncHandler(UserController.updateUser));
router.delete('/:id', authenticateToken, requireAdmin, asyncHandler(UserController.deleteUser));

export default router; 