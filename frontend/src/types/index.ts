// 用户相关类型
export interface User {
  id: number;
  username: string;
  email: string;
  level: string;
  created_at: string;
  updated_at: string;
}

export interface LoginForm {
  username: string;
  password: string;
}

export interface RegisterForm {
  username: string;
  email: string;
  password: string;
  level: string;
}

// 活动相关类型
export interface Event {
  id: number;
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
  created_at: string;
  updated_at: string;
}

export interface EventForm {
  title: string;
  departure_airport: string;
  arrival_airport: string;
  route: string;
  flight_level: string;
  airac: string;
  event_date: string;
  event_time: string;
  remarks?: string;
}

// 席位相关类型
export interface Position {
  id: number;
  event_id: number;
  position_name: string;
  position_type: 'DEL' | 'GND' | 'TWR' | 'APP' | 'CTR' | 'FSS';
  is_taken: boolean;
  taken_by?: number;
  taken_by_username?: string;
  taken_by_level?: string;
  student_supervised?: string;
  created_at: string;
  updated_at: string;
}

export interface PositionForm {
  position_name: string;
  position_type: 'DEL' | 'GND' | 'TWR' | 'APP' | 'CTR' | 'FSS';
}

export interface PositionBatchForm {
  event_id: number;
  positions: PositionForm[];
}

export interface SignupForm {
  student_supervised?: string;
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface LoginResponse {
  user: User;
  token: string;
}

// 管制员等级选项
export const LEVEL_OPTIONS = [
  { label: 'S1', value: 'S1' },
  { label: 'S2', value: 'S2' },
  { label: 'S3', value: 'S3' },
  { label: 'C1', value: 'C1' },
  { label: 'C2', value: 'C2' },
  { label: 'C3', value: 'C3' },
  { label: 'I1', value: 'I1' },
  { label: 'I2', value: 'I2' },
  { label: 'I3', value: 'I3' },
  { label: 'SUP', value: 'SUP' },
  { label: 'ADM', value: 'ADM' },
];

// 席位类型选项
export const POSITION_TYPE_OPTIONS = [
  { label: 'DEL - 放行', value: 'DEL' },
  { label: 'GND - 地面', value: 'GND' },
  { label: 'TWR - 塔台', value: 'TWR' },
  { label: 'APP - 进近', value: 'APP' },
  { label: 'CTR - 区调', value: 'CTR' },
  { label: 'FSS - 飞行服务站', value: 'FSS' },
]; 