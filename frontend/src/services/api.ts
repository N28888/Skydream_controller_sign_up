import axios from 'axios';

const API_BASE_URL = 'http://sj.yfanj.ca:3001/api';

// 创建axios实例
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 清除token并跳转到登录页
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 用户相关API
export const userAPI = {
  // 用户注册
  register: (data: {
    username: string;
    email: string;
    password: string;
    level: string;
  }) => api.post('/users/register', data),

  // 用户登录
  login: (data: { username: string; password: string }) =>
    api.post('/users/login', data),

  // 获取用户信息
  getProfile: () => api.get('/users/profile'),

  // 获取所有用户（管理员）
  getAllUsers: () => api.get('/users/all'),
};

// 活动相关API（待实现）
export const eventAPI = {
  // 获取活动列表
  getEvents: () => api.get('/events'),

  // 获取活动详情
  getEvent: (id: number) => api.get(`/events/${id}`),

  // 创建活动
  createEvent: (data: any) => api.post('/events', data),

  // 更新活动
  updateEvent: (id: number, data: any) => api.put(`/events/${id}`, data),

  // 删除活动
  deleteEvent: (id: number) => api.delete(`/events/${id}`),
};

// 席位相关API（待实现）
export const positionAPI = {
  // 获取席位列表
  getPositions: (eventId: number) => api.get(`/events/${eventId}/positions`),

  // 报名席位
  signupPosition: (positionId: number, data?: any) =>
    api.post(`/positions/${positionId}/signup`, data),

  // 取消报名
  cancelSignup: (positionId: number) =>
    api.delete(`/positions/${positionId}/signup`),
};

export default api; 