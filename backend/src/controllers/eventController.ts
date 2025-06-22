import { Request, Response } from 'express';
import { EventModel } from '../models/Event';

export class EventController {
  // 创建活动
  static async create(req: Request, res: Response) {
    try {
      const {
        title,
        departure_airport,
        arrival_airport,
        route,
        flight_level,
        airac,
        event_date,
        event_time
      } = req.body;
      const created_by = (req as any).user?.userId;
      if (!title || !departure_airport || !arrival_airport || !event_date || !event_time) {
        return res.status(400).json({ success: false, message: '请填写完整活动信息' });
      }
      const eventId = await EventModel.create({
        title,
        departure_airport,
        arrival_airport,
        route,
        flight_level,
        airac,
        event_date,
        event_time,
        created_by
      });
      const event = await EventModel.findById(eventId);
      res.status(201).json({ success: true, message: '活动创建成功', data: event });
    } catch (error) {
      console.error('创建活动失败:', error);
      res.status(500).json({ success: false, message: '服务器内部错误' });
    }
  }

  // 获取活动列表
  static async list(req: Request, res: Response) {
    try {
      const events = await EventModel.findAll();
      res.json({ success: true, data: events });
    } catch (error) {
      console.error('获取活动列表失败:', error);
      res.status(500).json({ success: false, message: '服务器内部错误' });
    }
  }

  // 获取活动详情
  static async detail(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const event = await EventModel.findById(id);
      if (!event) {
        return res.status(404).json({ success: false, message: '活动不存在' });
      }
      res.json({ success: true, data: event });
    } catch (error) {
      console.error('获取活动详情失败:', error);
      res.status(500).json({ success: false, message: '服务器内部错误' });
    }
  }

  // 更新活动
  static async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const updates = req.body;
      const ok = await EventModel.update(id, updates);
      if (!ok) {
        return res.status(404).json({ success: false, message: '活动不存在或更新失败' });
      }
      const event = await EventModel.findById(id);
      res.json({ success: true, message: '活动更新成功', data: event });
    } catch (error) {
      console.error('更新活动失败:', error);
      res.status(500).json({ success: false, message: '服务器内部错误' });
    }
  }

  // 删除活动
  static async remove(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const ok = await EventModel.delete(id);
      if (!ok) {
        return res.status(404).json({ success: false, message: '活动不存在或删除失败' });
      }
      res.json({ success: true, message: '活动已删除' });
    } catch (error) {
      console.error('删除活动失败:', error);
      res.status(500).json({ success: false, message: '服务器内部错误' });
    }
  }
} 