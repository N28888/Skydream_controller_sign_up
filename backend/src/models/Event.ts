import pool from '../config/database';

export interface Event {
  id?: number;
  title: string;
  departure_airport: string;
  arrival_airport: string;
  route: string;
  flight_level: string;
  airac: string;
  event_date: string;
  event_time: string;
  created_by: number;
  created_at?: Date;
  updated_at?: Date;
}

export class EventModel {
  // 创建活动
  static async create(event: Event): Promise<number> {
    const [result] = await pool.execute(
      `INSERT INTO events (title, departure_airport, arrival_airport, route, flight_level, airac, event_date, event_time, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        event.title,
        event.departure_airport,
        event.arrival_airport,
        event.route,
        event.flight_level,
        event.airac,
        event.event_date,
        event.event_time,
        event.created_by
      ]
    );
    return (result as any).insertId;
  }

  // 获取活动列表
  static async findAll(): Promise<Event[]> {
    const [rows] = await pool.execute(
      'SELECT * FROM events ORDER BY event_date DESC, event_time DESC'
    );
    return rows as Event[];
  }

  // 获取活动详情
  static async findById(id: number): Promise<Event | null> {
    const [rows] = await pool.execute(
      'SELECT * FROM events WHERE id = ?',
      [id]
    );
    const events = rows as Event[];
    return events.length > 0 ? events[0] : null;
  }

  // 更新活动
  static async update(id: number, updates: Partial<Event>): Promise<boolean> {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    values.push(id);
    const [result] = await pool.execute(
      `UPDATE events SET ${fields} WHERE id = ?`,
      values
    );
    return (result as any).affectedRows > 0;
  }

  // 删除活动
  static async delete(id: number): Promise<boolean> {
    const [result] = await pool.execute(
      'DELETE FROM events WHERE id = ?',
      [id]
    );
    return (result as any).affectedRows > 0;
  }
} 