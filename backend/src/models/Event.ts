import pool from '../config/database';

export interface Event {
  id?: number;
  custom_id?: string;
  title: string;
  departure_airport: string;
  arrival_airport: string;
  route: string;
  flight_level: string;
  airac: string;
  event_date: string;
  event_time: string;
  remarks?: string;
  created_by: number;
  created_at?: Date;
  updated_at?: Date;
}

export class EventModel {
  // 测试数据库连接
  static async testConnection(): Promise<boolean> {
    try {
      const connection = await pool.getConnection();
      connection.release();
      return true;
    } catch (error) {
      console.error('数据库连接测试失败:', error);
      return false;
    }
  }

  // 生成自定义活动ID
  static async generateEventId(eventDate: string): Promise<string> {
    try {
      // 查询同一天的活动数量
      const [rows] = await pool.execute(
        'SELECT COUNT(*) as count FROM events WHERE DATE(event_date) = ?',
        [eventDate]
      );
      const count = (rows as any)[0].count;
      // 返回格式：YYYY-MM-DD-序号
      return `${eventDate}-${count + 1}`;
    } catch (error) {
      console.error('生成活动ID失败:', error);
      throw new Error('生成活动ID失败');
    }
  }

  // 创建活动
  static async create(event: Event): Promise<number> {
    try {
      // 生成自定义活动ID
      const customId = await this.generateEventId(event.event_date);
      
      const [result] = await pool.execute(
        `INSERT INTO events (title, departure_airport, arrival_airport, route, flight_level, airac, event_date, event_time, remarks, created_by, custom_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          event.title,
          event.departure_airport,
          event.arrival_airport,
          event.route,
          event.flight_level,
          event.airac,
          event.event_date,
          event.event_time,
          event.remarks || null,
          event.created_by,
          customId
        ]
      );
      return (result as any).insertId;
    } catch (error) {
      console.error('创建活动失败:', error);
      throw new Error('创建活动失败');
    }
  }

  // 获取活动列表
  static async findAll(): Promise<Event[]> {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM events ORDER BY event_date DESC, event_time DESC'
      );
      return rows as Event[];
    } catch (error) {
      console.error('获取活动列表失败:', error);
      throw new Error('获取活动列表失败');
    }
  }

  // 获取活动详情
  static async findById(id: number): Promise<Event | null> {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM events WHERE id = ?',
        [id]
      );
      const events = rows as Event[];
      return events.length > 0 ? events[0] : null;
    } catch (error) {
      console.error('获取活动详情失败:', error);
      throw new Error('获取活动详情失败');
    }
  }

  // 更新活动
  static async update(id: number, updates: Partial<Event>): Promise<boolean> {
    try {
      const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
      const values = Object.values(updates);
      values.push(id);
      const [result] = await pool.execute(
        `UPDATE events SET ${fields} WHERE id = ?`,
        values
      );
      return (result as any).affectedRows > 0;
    } catch (error) {
      console.error('更新活动失败:', error);
      throw new Error('更新活动失败');
    }
  }

  // 删除活动
  static async delete(id: number): Promise<boolean> {
    try {
      const [result] = await pool.execute(
        'DELETE FROM events WHERE id = ?',
        [id]
      );
      return (result as any).affectedRows > 0;
    } catch (error) {
      console.error('删除活动失败:', error);
      throw new Error('删除活动失败');
    }
  }

  // 查找已过期活动（活动日早于指定日期）
  static async findExpired(date: string): Promise<Event[]> {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM events WHERE event_date < ?',
        [date]
      );
      return rows as Event[];
    } catch (error) {
      console.error('查找过期活动失败:', error);
      throw new Error('查找过期活动失败');
    }
  }
} 