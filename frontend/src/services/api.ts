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
    console.log('API请求拦截器:', {
      url: config.url,
      method: config.method,
      hasToken: !!token,
      headers: config.headers
    });
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('已添加Authorization头:', `Bearer ${token.substring(0, 20)}...`);
    }
    return config;
  },
  (error) => {
    console.error('请求拦截器错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('API响应错误:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.config?.headers
    });
    
    // 只有在非登录页面时才自动跳转
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      console.log('检测到401错误，清除token并跳转到登录页');
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

  // 创建用户（管理员）
  createUser: (data: {
    username: string;
    email: string;
    password: string;
    level: string;
  }) => api.post('/users/create', data),

  // 更新用户信息（管理员）
  updateUser: (id: number, data: any) => api.put(`/users/${id}`, data),

  // 删除用户（管理员）
  deleteUser: (id: number) => api.delete(`/users/${id}`),

  // 更改密码
  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
  }) => api.post('/users/change-password', data),
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

// 席位相关API
export const positionAPI = {
  // 获取席位列表
  getPositions: (eventId: number) => api.get(`/events/${eventId}/positions`),

  // 创建席位（管理员）
  createPosition: (data: any) => api.post('/positions', data),

  // 批量创建席位（管理员）
  createBatchPositions: (data: any) => api.post('/positions/batch', data),

  // 更新席位（管理员）
  updatePosition: (id: number, data: any) => api.put(`/positions/${id}`, data),

  // 删除席位（管理员）
  deletePosition: (id: number) => api.delete(`/positions/${id}`),

  // 报名席位
  signupPosition: (positionId: number, data?: any) =>
    api.post(`/positions/${positionId}/signup`, data),

  // 取消报名
  cancelSignup: (positionId: number) =>
    api.delete(`/positions/${positionId}/signup`),

  // 获取用户的报名记录
  getMySignups: () => api.get('/positions/my-signups'),

  // 获取监管学员数量
  getSupervisedStudentsCount: () => api.get('/positions/supervised-students-count'),
};

export default api; 