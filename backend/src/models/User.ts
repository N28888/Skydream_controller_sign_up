import pool from '../config/database';

export interface User {
  id?: number;
  username: string;
  email: string;
  password: string;
  level: 'S1' | 'S2' | 'S3' | 'C1' | 'C2' | 'C3' | 'I1' | 'I2' | 'I3' | 'SUP' | 'ADM';
  created_at?: Date;
  updated_at?: Date;
}

export interface UserWithoutPassword {
  id: number;
  username: string;
  email: string;
  level: string;
  created_at: Date;
  updated_at: Date;
}

export class UserModel {
  // 创建用户
  static async create(user: User): Promise<number> {
    const [result] = await pool.execute(
      'INSERT INTO users (username, email, password, level) VALUES (?, ?, ?, ?)',
      [user.username, user.email, user.password, user.level]
    );
    return (result as any).insertId;
  }

  // 根据用户名查找用户
  static async findByUsername(username: string): Promise<User | null> {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    const users = rows as User[];
    return users.length > 0 ? users[0] : null;
  }

  // 根据邮箱查找用户
  static async findByEmail(email: string): Promise<User | null> {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    const users = rows as User[];
    return users.length > 0 ? users[0] : null;
  }

  // 根据ID查找用户（不返回密码）
  static async findById(id: number): Promise<UserWithoutPassword | null> {
    const [rows] = await pool.execute(
      'SELECT id, username, email, level, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    const users = rows as UserWithoutPassword[];
    return users.length > 0 ? users[0] : null;
  }

  // 更新用户信息
  static async update(id: number, updates: Partial<User>): Promise<boolean> {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    values.push(id);

    const [result] = await pool.execute(
      `UPDATE users SET ${fields} WHERE id = ?`,
      values
    );
    return (result as any).affectedRows > 0;
  }

  // 获取所有用户（不返回密码）
  static async findAll(): Promise<UserWithoutPassword[]> {
    const [rows] = await pool.execute(
      'SELECT id, username, email, level, created_at, updated_at FROM users ORDER BY created_at DESC'
    );
    return rows as UserWithoutPassword[];
  }

  // 删除用户
  static async delete(id: number): Promise<boolean> {
    const [result] = await pool.execute(
      'DELETE FROM users WHERE id = ?',
      [id]
    );
    return (result as any).affectedRows > 0;
  }
} 