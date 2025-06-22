import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// 公开路由
router.post('/register', (req, res) => UserController.register(req, res));
router.post('/login', (req, res) => UserController.login(req, res));

// 需要认证的路由
router.get('/profile', authenticateToken, (req, res) => UserController.getProfile(req, res));

// 需要管理员权限的路由
router.get('/all', authenticateToken, requireAdmin, (req, res) => UserController.getAllUsers(req, res));

export default router; 