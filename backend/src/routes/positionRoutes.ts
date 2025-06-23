import { Router, Request, Response, NextFunction } from 'express';
import { PositionController } from '../controllers/positionController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// 通用异步处理器包装
const asyncHandler = (fn: any) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// 获取活动的所有席位（不需要认证）
router.get('/events/:eventId/positions', asyncHandler(PositionController.getEventPositions));

// 以下路由需要认证
router.use(authenticateToken);

// 创建席位（需要管理员权限）
router.post('/', requireAdmin, asyncHandler(PositionController.create));

// 批量创建席位（需要管理员权限）
router.post('/batch', requireAdmin, asyncHandler(PositionController.createBatch));

// 更新席位（需要管理员权限）
router.put('/:id', requireAdmin, asyncHandler(PositionController.update));

// 删除席位（需要管理员权限）
router.delete('/:id', requireAdmin, asyncHandler(PositionController.delete));

// 报名席位
router.post('/:id/signup', asyncHandler(PositionController.signup));

// 取消报名
router.delete('/:id/signup', asyncHandler(PositionController.cancelSignup));

// 获取用户的报名记录
router.get('/my-signups', asyncHandler(PositionController.getUserSignups));

export default router; 