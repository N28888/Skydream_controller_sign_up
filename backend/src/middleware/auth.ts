import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: number;
  username: string;
  level: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  console.log(`Token验证 - 请求路径: ${req.path}`);
  console.log(`Token验证 - Authorization头: ${authHeader ? '存在' : '不存在'}`);
  console.log(`Token验证 - Token: ${token ? token.substring(0, 20) + '...' : '不存在'}`);

  if (!token) {
    console.log('Token验证失败 - 缺少Token');
    res.status(401).json({
      success: false,
      message: '访问令牌缺失'
    });
    return;
  }

  const jwtSecret = process.env.JWT_SECRET || 'default-secret';
  console.log(`Token验证 - JWT密钥长度: ${jwtSecret.length}`);

  jwt.verify(token, jwtSecret, (err: any, decoded: any) => {
    if (err) {
      console.log(`Token验证失败 - 错误: ${err.message}`);
      res.status(403).json({
        success: false,
        message: '无效的访问令牌'
      });
      return;
    }

    console.log(`Token验证成功 - 用户ID: ${decoded.userId}, 用户名: ${decoded.username}, 级别: ${decoded.level}`);
    req.user = decoded as JwtPayload;
    next();
  });
};

// 检查用户权限等级
export const requireLevel = (requiredLevels: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userLevel = req.user?.level;
    const userId = req.user?.userId;
    const username = req.user?.username;
    
    console.log(`权限检查 - 用户ID: ${userId}, 用户名: ${username}, 用户级别: ${userLevel}`);
    console.log(`权限检查 - 需要的级别: ${requiredLevels.join(', ')}`);
    
    if (!userLevel || !requiredLevels.includes(userLevel)) {
      console.log(`权限检查失败 - 用户级别: ${userLevel}, 需要级别: ${requiredLevels.join(', ')}`);
      res.status(403).json({
        success: false,
        message: '权限不足'
      });
      return;
    }
    
    console.log(`权限检查通过 - 用户级别: ${userLevel}`);
    next();
  };
};

// 检查是否为管理员
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  requireLevel(['SUP', 'ADM'])(req, res, next);
};

// 检查是否为监督员或管理员
export const requireSupervisor = (req: Request, res: Response, next: NextFunction) => {
  requireLevel(['SUP', 'ADM'])(req, res, next);
}; 