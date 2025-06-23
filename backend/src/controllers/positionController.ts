import { Request, Response } from 'express';
import { PositionModel, Position } from '../models/Position';
import { UserModel } from '../models/User';

export class PositionController {
  // 获取活动的所有席位
  static async getEventPositions(req: Request, res: Response) {
    try {
      const eventId = Number(req.params.eventId);
      const positions = await PositionModel.findByEventId(eventId);
      res.json({ success: true, data: positions });
    } catch (error) {
      console.error('获取席位列表失败:', error);
      res.status(500).json({ success: false, message: '服务器内部错误' });
    }
  }

  // 创建席位
  static async create(req: Request, res: Response) {
    try {
      const { event_id, position_name, position_type } = req.body;
      const userId = (req as any).user?.userId;

      if (!event_id || !position_name || !position_type) {
        return res.status(400).json({ success: false, message: '请填写完整席位信息' });
      }

      // 验证席位类型
      const validTypes = ['DEL', 'GND', 'TWR', 'APP', 'CTR', 'FSS'];
      if (!validTypes.includes(position_type)) {
        return res.status(400).json({ success: false, message: '无效的席位类型' });
      }

      const positionId = await PositionModel.create({
        event_id,
        position_name,
        position_type,
        is_taken: false
      });

      const position = await PositionModel.findById(positionId);
      res.status(201).json({ success: true, message: '席位创建成功', data: position });
    } catch (error) {
      console.error('创建席位失败:', error);
      res.status(500).json({ success: false, message: '服务器内部错误' });
    }
  }

  // 批量创建席位
  static async createBatch(req: Request, res: Response) {
    try {
      const { event_id, positions } = req.body;
      const userId = (req as any).user?.userId;

      if (!event_id || !positions || !Array.isArray(positions)) {
        return res.status(400).json({ success: false, message: '请提供有效的席位数据' });
      }

      // 验证席位数据
      const validTypes = ['DEL', 'GND', 'TWR', 'APP', 'CTR', 'FSS'];
      for (const pos of positions) {
        if (!pos.position_name || !pos.position_type || !validTypes.includes(pos.position_type)) {
          return res.status(400).json({ success: false, message: '席位数据格式错误' });
        }
      }

      const positionData = positions.map((pos: any) => ({
        event_id,
        position_name: pos.position_name,
        position_type: pos.position_type,
        is_taken: false
      }));

      const positionIds = await PositionModel.createBatch(positionData);
      const createdPositions = await Promise.all(
        positionIds.map(id => PositionModel.findById(id))
      );

      res.status(201).json({ 
        success: true, 
        message: `成功创建 ${createdPositions.length} 个席位`, 
        data: createdPositions 
      });
    } catch (error) {
      console.error('批量创建席位失败:', error);
      res.status(500).json({ success: false, message: '服务器内部错误' });
    }
  }

  // 更新席位
  static async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const updates = req.body;
      const userId = (req as any).user?.userId;

      // 只允许更新某些字段
      const allowedFields = ['position_name', 'position_type', 'student_supervised'];
      const filteredUpdates: any = {};
      
      for (const field of allowedFields) {
        if (updates[field] !== undefined) {
          filteredUpdates[field] = updates[field];
        }
      }

      if (Object.keys(filteredUpdates).length === 0) {
        return res.status(400).json({ success: false, message: '没有可更新的字段' });
      }

      const ok = await PositionModel.update(id, filteredUpdates);
      if (!ok) {
        return res.status(404).json({ success: false, message: '席位不存在或更新失败' });
      }

      const position = await PositionModel.findById(id);
      res.json({ success: true, message: '席位更新成功', data: position });
    } catch (error) {
      console.error('更新席位失败:', error);
      res.status(500).json({ success: false, message: '服务器内部错误' });
    }
  }

  // 删除席位
  static async delete(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const userId = (req as any).user?.userId;

      const position = await PositionModel.findById(id);
      if (!position) {
        return res.status(404).json({ success: false, message: '席位不存在' });
      }

      // 检查席位是否已被占用
      if (position.is_taken) {
        return res.status(400).json({ success: false, message: '无法删除已被占用的席位' });
      }

      const ok = await PositionModel.delete(id);
      if (!ok) {
        return res.status(404).json({ success: false, message: '席位删除失败' });
      }

      res.json({ success: true, message: '席位已删除' });
    } catch (error) {
      console.error('删除席位失败:', error);
      res.status(500).json({ success: false, message: '服务器内部错误' });
    }
  }

  // 报名席位
  static async signup(req: Request, res: Response) {
    try {
      const positionId = Number(req.params.id);
      const userId = (req as any).user?.userId;
      const { student_supervised } = req.body;

      if (!userId) {
        return res.status(401).json({ success: false, message: '请先登录' });
      }

      // 获取用户信息
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: '用户不存在' });
      }

      // 获取席位信息
      const position = await PositionModel.findById(positionId);
      if (!position) {
        return res.status(404).json({ success: false, message: '席位不存在' });
      }

      // 检查席位是否已被占用
      if (position.is_taken) {
        return res.status(400).json({ success: false, message: '席位已被占用' });
      }

      // 检查用户等级权限
      const userLevel = user.level;
      const positionType = position.position_type;
      
      // 权限检查逻辑
      const canSignup = checkUserPermission(userLevel, positionType);
      if (!canSignup) {
        return res.status(403).json({ 
          success: false, 
          message: `您的等级 ${userLevel} 无法报名 ${positionType} 席位` 
        });
      }

      // 如果是学生等级且指定了监督员，验证监督员是否存在
      if (student_supervised) {
        const supervisor = await UserModel.findByUsername(student_supervised);
        if (!supervisor || !['I1', 'I2', 'I3', 'SUP', 'ADM'].includes(supervisor.level)) {
          return res.status(400).json({ 
            success: false, 
            message: '指定的监督员不存在或无监督权限' 
          });
        }
      }

      await PositionModel.signup(positionId, userId, student_supervised);
      
      const updatedPosition = await PositionModel.findById(positionId);
      res.json({ success: true, message: '席位报名成功', data: updatedPosition });
    } catch (error) {
      console.error('报名席位失败:', error);
      if (error instanceof Error) {
        res.status(400).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: '服务器内部错误' });
      }
    }
  }

  // 取消报名
  static async cancelSignup(req: Request, res: Response) {
    try {
      const positionId = Number(req.params.id);
      const userId = (req as any).user?.userId;

      if (!userId) {
        return res.status(401).json({ success: false, message: '请先登录' });
      }

      await PositionModel.cancelSignup(positionId, userId);
      
      const updatedPosition = await PositionModel.findById(positionId);
      res.json({ success: true, message: '取消报名成功', data: updatedPosition });
    } catch (error) {
      console.error('取消报名失败:', error);
      if (error instanceof Error) {
        res.status(400).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: '服务器内部错误' });
      }
    }
  }

  // 获取用户的报名记录
  static async getUserSignups(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        return res.status(401).json({ success: false, message: '请先登录' });
      }

      const signups = await PositionModel.getUserSignups(userId);
      res.json({ success: true, data: signups });
    } catch (error) {
      console.error('获取报名记录失败:', error);
      res.status(500).json({ success: false, message: '服务器内部错误' });
    }
  }
}

// 检查用户等级是否有权限报名特定类型的席位
function checkUserPermission(userLevel: string, positionType: string): boolean {
  const permissions: { [key: string]: string[] } = {
    'S1': ['DEL', 'GND'],
    'S2': ['DEL', 'GND', 'TWR'],
    'S3': ['DEL', 'GND', 'TWR', 'APP'],
    'C1': ['DEL', 'GND', 'TWR', 'APP'],
    'C2': ['DEL', 'GND', 'TWR', 'APP', 'CTR'],
    'C3': ['DEL', 'GND', 'TWR', 'APP', 'CTR', 'FSS'],
    'I1': ['DEL', 'GND', 'TWR', 'APP', 'CTR', 'FSS'],
    'I2': ['DEL', 'GND', 'TWR', 'APP', 'CTR', 'FSS'],
    'I3': ['DEL', 'GND', 'TWR', 'APP', 'CTR', 'FSS'],
    'SUP': ['DEL', 'GND', 'TWR', 'APP', 'CTR', 'FSS'],
    'ADM': ['DEL', 'GND', 'TWR', 'APP', 'CTR', 'FSS'],
  };

  return permissions[userLevel]?.includes(positionType) || false;
} 