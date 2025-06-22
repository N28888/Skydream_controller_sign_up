import { Router, Request, Response, NextFunction } from 'express';
import { EventController } from '../controllers/eventController';
import { authenticateToken, requireSupervisor } from '../middleware/auth';

const router = Router();

// 通用异步处理器包装
const asyncHandler = (fn: any) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// 获取活动列表（所有人可见）
router.get('/', asyncHandler(EventController.list));
// 获取活动详情（所有人可见）
router.get('/:id', asyncHandler(EventController.detail));

// 创建活动（仅SUP/ADM）
router.post('/', authenticateToken, requireSupervisor, asyncHandler(EventController.create));
// 更新活动（仅SUP/ADM）
router.put('/:id', authenticateToken, requireSupervisor, asyncHandler(EventController.update));
// 删除活动（仅SUP/ADM）
router.delete('/:id', authenticateToken, requireSupervisor, asyncHandler(EventController.remove));

export default router; 