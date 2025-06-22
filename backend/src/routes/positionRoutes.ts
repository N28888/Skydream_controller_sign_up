import { Router, Request, Response, NextFunction } from 'express';
import { PositionController } from '../controllers/positionController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// 通用异步处理器包装
const asyncHandler = (fn: any) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// 所有路由都需要认证
router.use(authenticateToken);

// 获取活动的所有席位
router.get('/events/:eventId/positions', asyncHandler(PositionController.getEventPositions));

// 创建席位（需要管理员权限）
router.post('/positions', requireAdmin, asyncHandler(PositionController.create));

// 批量创建席位（需要管理员权限）
router.post('/positions/batch', requireAdmin, asyncHandler(PositionController.createBatch));

// 更新席位（需要管理员权限）
router.put('/positions/:id', requireAdmin, asyncHandler(PositionController.update));

// 删除席位（需要管理员权限）
router.delete('/positions/:id', requireAdmin, asyncHandler(PositionController.delete));

// 报名席位
router.post('/positions/:id/signup', asyncHandler(PositionController.signup));

// 取消报名
router.delete('/positions/:id/signup', asyncHandler(PositionController.cancelSignup));

// 获取用户的报名记录
router.get('/positions/my-signups', asyncHandler(PositionController.getUserSignups));

export default router; 