import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Typography, Divider, Modal } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { userAPI } from '../services/api';
import { LoginForm } from '../types';

const { Title, Text } = Typography;

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: LoginForm) => {
    setLoading(true);
    try {
      console.log('开始登录，用户名:', values.username);
      const response = await userAPI.login(values);
      console.log('登录成功，响应:', response);
      
      const { token, user } = response.data.data;
      
      // 保存token和用户信息
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      message.success('登录成功！');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('登录错误详情:', {
        error: error,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      // 根据不同的错误情况显示不同的提示
      if (error.response?.status === 401 || 
          (error.response?.data?.message && error.response.data.message.includes('呼号或密码错误'))) {
        console.log('显示登录错误确认弹窗');
        Modal.confirm({
          title: '登录失败',
          content: '用户名或密码错误',
          okText: '确定',
          cancelText: '取消',
          onOk() {
            console.log('用户确认了登录错误');
          },
          onCancel() {
            console.log('用户取消了登录错误确认');
          },
        });
      } else if (error.response?.data?.message) {
        console.log('显示后端错误消息:', error.response.data.message);
        message.error(error.response.data.message);
      } else if (error.message) {
        console.log('显示错误消息:', error.message);
        message.error(error.message);
      } else {
        console.log('显示默认错误消息');
        message.error('登录失败，请检查网络连接后重试');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Card 
        style={{ 
          width: 400, 
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          borderRadius: '12px'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Title level={2} style={{ color: '#1890ff', marginBottom: '8px' }}>
            <LoginOutlined /> 管制员登录
          </Title>
          <Text type="secondary">欢迎使用Skydream管制员活动报名系统</Text>
        </div>

        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入呼号！' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="呼号" 
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码！' }]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="密码"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              style={{ 
                width: '100%', 
                height: '48px',
                borderRadius: '8px',
                fontSize: '16px'
              }}
            >
              登录
            </Button>
          </Form.Item>
        </Form>

        <Divider>
          <Text type="secondary">还没有账号？</Text>
        </Divider>

        <div style={{ textAlign: 'center' }}>
          <Link to="/register">
            <Button type="link" size="large">
              立即注册
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Login; 