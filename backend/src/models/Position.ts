import pool from '../config/database';

export interface Position {
  id?: number;
  event_id: number;
  position_name: string;
  position_type: 'DEL' | 'GND' | 'TWR' | 'APP' | 'CTR' | 'FSS';
  is_taken: boolean;
  taken_by?: number;
  student_supervised?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface PositionWithUser extends Position {
  taken_by_username?: string;
  taken_by_level?: string;
}

export class PositionModel {
  // 创建席位
  static async create(position: Position): Promise<number> {
    const [result] = await pool.execute(
      'INSERT INTO positions (event_id, position_name, position_type, is_taken, taken_by, student_supervised) VALUES (?, ?, ?, ?, ?, ?)',
      [
        position.event_id,
        position.position_name,
        position.position_type,
        position.is_taken,
        typeof position.taken_by === 'undefined' ? null : position.taken_by,
        typeof position.student_supervised === 'undefined' ? null : position.student_supervised
      ]
    );
    return (result as any).insertId;
  }

  // 根据ID查找席位
  static async findById(id: number): Promise<PositionWithUser | null> {
    const [rows] = await pool.execute(
      `SELECT p.*, u.username as taken_by_username, u.level as taken_by_level 
       FROM positions p 
       LEFT JOIN users u ON p.taken_by = u.id 
       WHERE p.id = ?`,
      [id]
    );
    const positions = rows as PositionWithUser[];
    return positions.length > 0 ? positions[0] : null;
  }

  // 根据活动ID查找所有席位
  static async findByEventId(eventId: number): Promise<PositionWithUser[]> {
    const [rows] = await pool.execute(
      `SELECT p.*, u.username as taken_by_username, u.level as taken_by_level 
       FROM positions p 
       LEFT JOIN users u ON p.taken_by = u.id 
       WHERE p.event_id = ? 
       ORDER BY p.position_type, p.position_name`,
      [eventId]
    );
    return rows as PositionWithUser[];
  }

  // 更新席位
  static async update(id: number, updates: Partial<Position>): Promise<boolean> {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    values.push(id);

    const [result] = await pool.execute(
      `UPDATE positions SET ${fields} WHERE id = ?`,
      values
    );
    return (result as any).affectedRows > 0;
  }

  // 删除席位
  static async delete(id: number): Promise<boolean> {
    const [result] = await pool.execute(
      'DELETE FROM positions WHERE id = ?',
      [id]
    );
    return (result as any).affectedRows > 0;
  }

  // 报名席位
  static async signup(positionId: number, userId: number, studentSupervised?: string): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 检查席位是否已被占用
      const [rows] = await connection.execute(
        'SELECT is_taken FROM positions WHERE id = ?',
        [positionId]
      );
      const positions = rows as Position[];
      
      if (positions.length === 0) {
        throw new Error('席位不存在');
      }
      
      if (positions[0].is_taken) {
        throw new Error('席位已被占用');
      }

      // 更新席位状态
      await connection.execute(
        'UPDATE positions SET is_taken = TRUE, taken_by = ?, student_supervised = ? WHERE id = ?',
        [userId, typeof studentSupervised === 'undefined' ? null : studentSupervised, positionId]
      );

      // 创建报名记录
      await connection.execute(
        'INSERT INTO signups (user_id, position_id) VALUES (?, ?)',
        [userId, positionId]
      );

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // 取消报名
  static async cancelSignup(positionId: number, userId: number): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 检查席位是否被当前用户占用
      const [rows] = await connection.execute(
        'SELECT taken_by FROM positions WHERE id = ?',
        [positionId]
      );
      const positions = rows as Position[];
      
      if (positions.length === 0) {
        throw new Error('席位不存在');
      }
      
      if (positions[0].taken_by !== userId) {
        throw new Error('您没有权限取消此报名');
      }

      // 更新席位状态
      await connection.execute(
        'UPDATE positions SET is_taken = FALSE, taken_by = NULL, student_supervised = NULL WHERE id = ?',
        [positionId]
      );

      // 删除报名记录
      await connection.execute(
        'DELETE FROM signups WHERE user_id = ? AND position_id = ?',
        [userId, positionId]
      );

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // 批量创建席位
  static async createBatch(positions: Position[]): Promise<number[]> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      const insertIds: number[] = [];
      
      for (const position of positions) {
        const [result] = await connection.execute(
          'INSERT INTO positions (event_id, position_name, position_type, is_taken, taken_by, student_supervised) VALUES (?, ?, ?, ?, ?, ?)',
          [
            position.event_id, 
            position.position_name, 
            position.position_type, 
            position.is_taken || false, 
            position.taken_by || null, 
            position.student_supervised || null
          ]
        );
        insertIds.push((result as any).insertId);
      }
      
      await connection.commit();
      return insertIds;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // 获取用户的报名记录
  static async getUserSignups(userId: number): Promise<PositionWithUser[]> {
    const [rows] = await pool.execute(
      `SELECT p.*, u.username as taken_by_username, u.level as taken_by_level 
       FROM positions p 
       LEFT JOIN users u ON p.taken_by = u.id 
       WHERE p.taken_by = ? 
       ORDER BY p.created_at DESC`,
      [userId]
    );
    return rows as PositionWithUser[];
  }
} 