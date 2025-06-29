import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, message, Modal, Spin, Switch } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  CalendarOutlined,
  TeamOutlined,
  LogoutOutlined,
  DashboardOutlined,
  SettingOutlined,
  LockOutlined,
  BulbOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { User } from '../types';
import { useTheme } from '../contexts/ThemeContext';

const { Header, Sider, Content } = Layout;

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const handleLogout = () => {
    console.log('handleLogout被调用');
    
    // 先测试简单的alert
    if (window.confirm('确定要退出登录吗？')) {
      console.log('用户确认退出');
      setLogoutLoading(true);
      setTimeout(() => {
        console.log('开始清除本地存储');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        message.success('已退出登录');
        navigate('/login');
        setLogoutLoading(false);
      }, 1000);
    } else {
      console.log('用户取消退出');
    }
  };

  const userMenu = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
      onClick: () => navigate('/settings'),
    },
    {
      key: 'change-password',
      icon: <UserOutlined />,
      label: '更改密码',
      onClick: () => navigate('/change-password'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: logoutLoading ? <Spin size="small" /> : <LogoutOutlined />,
      label: logoutLoading ? '退出中...' : '退出登录',
      onClick: handleLogout,
      disabled: logoutLoading,
    },
  ];

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '仪表板',
    },
    {
      key: '/events',
      icon: <CalendarOutlined />,
      label: '活动管理',
    },
    {
      key: '/positions',
      icon: <TeamOutlined />,
      label: '我的报名',
    },
    {
      key: '/change-password',
      icon: <LockOutlined />,
      label: '更改密码',
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: '用户管理',
      hidden: !user || !['SUP', 'ADM'].includes(user.level),
    },
  ].filter(item => !item.hidden);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} theme="dark">
        <div style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: 'white',
          fontSize: collapsed ? '16px' : '18px',
          fontWeight: 'bold'
        }}>
          {collapsed ? 'Skydream' : '天梦活动报名系统'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '16px',
          borderTop: '1px solid #303030',
          display: 'flex',
          justifyContent: 'center',
          background: '#001529'
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              color: 'white',
              border: 'none',
              fontSize: '16px',
              width: collapsed ? '32px' : 'auto',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title={collapsed ? '展开侧边栏' : '收缩侧边栏'}
          />
        </div>
      </Sider>
      <Layout>
        <Header style={{ 
          padding: '0 24px', 
          background: isDarkMode ? '#1f1f1f' : '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderBottom: isDarkMode ? '1px solid #303030' : 'none'
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: isDarkMode ? '#ffffff' : '#666' }}>
              欢迎，{user?.username} ({user?.level})
            </span>
            <Switch
              checked={isDarkMode}
              onChange={toggleTheme}
              checkedChildren={<BulbOutlined />}
              unCheckedChildren={<BulbOutlined />}
              style={{ marginRight: 8 }}
            />
            <Dropdown menu={{ items: userMenu }} placement="bottomRight">
              <Avatar 
                icon={<UserOutlined />} 
                style={{ cursor: 'pointer' }}
              />
            </Dropdown>
          </div>
        </Header>
        <Content style={{ 
          margin: '24px', 
          padding: '24px', 
          background: isDarkMode ? '#1f1f1f' : '#fff',
          borderRadius: '8px',
          minHeight: 280
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout; 