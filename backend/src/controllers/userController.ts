import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';

export class UserController {
  // 用户注册
  static async register(req: Request, res: Response) {
    try {
      const { username, password, email } = req.body;

      // 检查用户是否已存在
      const existingUser = await UserModel.findByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: '呼号已存在' });
      }

      // 加密密码
      const hashedPassword = await bcrypt.hash(password, 10);

      // 创建新用户，默认等级为S1
      const userId = await UserModel.create({
        username,
        password: hashedPassword,
        email,
        level: 'S1',
      });
      const user = await UserModel.findById(userId);

      res.status(201).json({
        message: '注册成功',
        user,
      });
    } catch (error) {
      console.error('注册错误:', error);
      res.status(500).json({ message: '注册失败' });
    }
  }

  // 用户登录
  static async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;

      // 验证必填字段
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: '呼号和密码都是必填项'
        });
      }

      // 查找用户
      const user = await UserModel.findByUsername(username);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: '呼号或密码错误'
        });
      }

      // 验证密码
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: '呼号或密码错误'
        });
      }

      // 生成JWT令牌
      const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
      const token = jwt.sign(
        { 
          userId: user.id, 
          username: user.username, 
          level: user.level 
        },
        jwtSecret,
        { expiresIn: '24h' }
      );

      // 返回用户信息（不包含密码）
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        success: true,
        message: '登录成功',
        data: {
          user: userWithoutPassword,
          token
        }
      });
    } catch (error) {
      console.error('登录错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  // 获取当前用户信息
  static async getProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '未授权访问'
        });
      }

      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('获取用户信息错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  // 获取所有用户（管理员权限）
  static async getAllUsers(req: Request, res: Response) {
    try {
      const userLevel = (req as any).user?.level;
      if (!userLevel || !['SUP', 'ADM'].includes(userLevel)) {
        return res.status(403).json({
          success: false,
          message: '权限不足'
        });
      }

      const users = await UserModel.findAll();
      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      console.error('获取用户列表错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  // 更新用户信息（管理员权限）
  static async updateUser(req: Request, res: Response) {
    try {
      const userLevel = (req as any).user?.level;
      if (!userLevel || !['SUP', 'ADM'].includes(userLevel)) {
        return res.status(403).json({
          success: false,
          message: '权限不足'
        });
      }

      const userId = Number(req.params.id);
      const updates = req.body;

      // 验证等级是否有效
      if (updates.level) {
        const validLevels = ['S1', 'S2', 'S3', 'C1', 'C2', 'C3', 'I1', 'I2', 'I3', 'SUP', 'ADM'];
        if (!validLevels.includes(updates.level)) {
          return res.status(400).json({
            success: false,
            message: '无效的管制员等级'
          });
        }
      }

      // 检查用户是否存在
      const existingUser = await UserModel.findById(userId);
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      // 如果更新密码，需要加密
      if (updates.password) {
        const saltRounds = 10;
        updates.password = await bcrypt.hash(updates.password, saltRounds);
      }

      // 更新用户
      const success = await UserModel.update(userId, updates);
      if (!success) {
        return res.status(500).json({
          success: false,
          message: '更新用户失败'
        });
      }

      // 获取更新后的用户信息
      const updatedUser = await UserModel.findById(userId);

      res.json({
        success: true,
        message: '用户更新成功',
        data: updatedUser
      });
    } catch (error) {
      console.error('更新用户错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  // 创建用户（管理员权限）
  static async createUser(req: Request, res: Response) {
    try {
      const userLevel = (req as any).user?.level;
      if (!userLevel || !['SUP', 'ADM'].includes(userLevel)) {
        return res.status(403).json({
          success: false,
          message: '权限不足'
        });
      }

      const { username, password, email, level } = req.body;

      // 验证必填字段
      if (!username || !password || !email || !level) {
        return res.status(400).json({
          success: false,
          message: '呼号、密码、邮箱和等级都是必填项'
        });
      }

      // 验证等级是否有效
      const validLevels = ['S1', 'S2', 'S3', 'C1', 'C2', 'C3', 'I1', 'I2', 'I3', 'SUP', 'ADM'];
      if (!validLevels.includes(level)) {
        return res.status(400).json({
          success: false,
          message: '无效的管制员等级'
        });
      }

      // 检查用户是否已存在
      const existingUser = await UserModel.findByUsername(username);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: '呼号已存在'
        });
      }

      // 加密密码
      const hashedPassword = await bcrypt.hash(password, 10);

      // 创建新用户
      const userId = await UserModel.create({
        username,
        password: hashedPassword,
        email,
        level,
      });

      // 获取创建的用户信息（不包含密码）
      const user = await UserModel.findById(userId);

      res.status(201).json({
        success: true,
        message: '用户创建成功',
        data: user
      });
    } catch (error) {
      console.error('创建用户错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  // 更改密码
  static async changePassword(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '未授权访问'
        });
      }

      const { currentPassword, newPassword } = req.body;

      // 验证必填字段
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: '当前密码和新密码都是必填项'
        });
      }

      // 验证新密码长度
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: '新密码长度至少6个字符'
        });
      }

      // 获取用户信息
      const user = await UserModel.findByUsername((req as any).user?.username);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      // 验证当前密码
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(400).json({
          success: false,
          message: '当前密码错误'
        });
      }

      // 检查新密码是否与当前密码相同
      const isSamePassword = await bcrypt.compare(newPassword, user.password);
      if (isSamePassword) {
        return res.status(400).json({
          success: false,
          message: '新密码不能与当前密码相同'
        });
      }

      // 加密新密码
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // 更新密码
      const success = await UserModel.update(userId, { password: hashedNewPassword });
      if (!success) {
        return res.status(500).json({
          success: false,
          message: '密码更新失败'
        });
      }

      res.json({
        success: true,
        message: '密码更改成功'
      });
    } catch (error) {
      console.error('更改密码错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  // 删除用户（管理员权限）
  static async deleteUser(req: Request, res: Response) {
    try {
      const userLevel = (req as any).user?.level;
      if (!userLevel || !['SUP', 'ADM'].includes(userLevel)) {
        return res.status(403).json({
          success: false,
          message: '权限不足'
        });
      }

      const userId = Number(req.params.id);
      const currentUserId = (req as any).user?.userId;

      // 不能删除自己
      if (userId === currentUserId) {
        return res.status(400).json({
          success: false,
          message: '不能删除自己的账户'
        });
      }

      // 检查用户是否存在
      const existingUser = await UserModel.findById(userId);
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      // 删除用户
      const success = await UserModel.delete(userId);
      if (!success) {
        return res.status(500).json({
          success: false,
          message: '删除用户失败'
        });
      }

      res.json({
        success: true,
        message: '用户删除成功'
      });
    } catch (error) {
      console.error('删除用户错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }
} 