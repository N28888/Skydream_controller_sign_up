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

  if (!token) {
    res.status(401).json({
      success: false,
      message: '访问令牌缺失'
    });
    return;
  }

  const jwtSecret = process.env.JWT_SECRET || 'default-secret';

  jwt.verify(token, jwtSecret, (err: any, decoded: any) => {
    if (err) {
      res.status(403).json({
        success: false,
        message: '无效的访问令牌'
      });
      return;
    }

    req.user = decoded as JwtPayload;
    next();
  });
};

// 检查用户权限等级
export const requireLevel = (requiredLevels: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userLevel = req.user?.level;
    
    if (!userLevel || !requiredLevels.includes(userLevel)) {
      res.status(403).json({
        success: false,
        message: '权限不足'
      });
      return;
    }
    
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