import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel, User } from '../models/User';

export class UserController {
  // 用户注册
  static async register(req: Request, res: Response) {
    try {
      const { username, email, password, level } = req.body;

      // 验证必填字段
      if (!username || !email || !password || !level) {
        return res.status(400).json({
          success: false,
          message: '用户名、邮箱、密码和等级都是必填项'
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

      // 检查用户名是否已存在
      const existingUser = await UserModel.findByUsername(username);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: '用户名已存在'
        });
      }

      // 检查邮箱是否已存在
      const existingEmail = await UserModel.findByEmail(email);
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: '邮箱已被注册'
        });
      }

      // 加密密码
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // 创建用户
      const userId = await UserModel.create({
        username,
        email,
        password: hashedPassword,
        level
      });

      // 获取用户信息（不包含密码）
      const user = await UserModel.findById(userId);

      res.status(201).json({
        success: true,
        message: '用户注册成功',
        data: user
      });
    } catch (error) {
      console.error('注册错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
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
          message: '用户名和密码都是必填项'
        });
      }

      // 查找用户
      const user = await UserModel.findByUsername(username);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: '用户名或密码错误'
        });
      }

      // 验证密码
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: '用户名或密码错误'
        });
      }

      // 生成JWT令牌
      const jwtSecret = process.env.JWT_SECRET || 'default-secret';
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
} 