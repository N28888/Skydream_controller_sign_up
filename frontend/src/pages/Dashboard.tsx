import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography, List, Avatar, Tag } from 'antd';
import {
  UserOutlined,
  CalendarOutlined,
  TeamOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { User } from '../types';

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const getLevelColor = (level: string) => {
    const colors: { [key: string]: string } = {
      'S1': 'blue',
      'S2': 'cyan',
      'S3': 'geekblue',
      'C1': 'green',
      'C2': 'lime',
      'C3': 'orange',
      'I1': 'purple',
      'I2': 'magenta',
      'I3': 'red',
      'SUP': 'gold',
      'ADM': 'volcano',
    };
    return colors[level] || 'default';
  };

  const getLevelText = (level: string) => {
    const texts: { [key: string]: string } = {
      'S1': '学员1级',
      'S2': '学员2级',
      'S3': '学员3级',
      'C1': '管制员1级',
      'C2': '管制员2级',
      'C3': '管制员3级',
      'I1': '教员1级',
      'I2': '教员2级',
      'I3': '教员3级',
      'SUP': '监督员',
      'ADM': '管理员',
    };
    return texts[level] || level;
  };

  return (
    <div>
      <Title level={2}>仪表板</Title>
      
      {/* 用户信息卡片 */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col>
            <Avatar size={64} icon={<UserOutlined />} />
          </Col>
          <Col flex="1">
            <Title level={3} style={{ margin: 0 }}>
              {user?.username}
            </Title>
            <Tag color={getLevelColor(user?.level || '')} style={{ fontSize: '14px' }}>
              {getLevelText(user?.level || '')}
            </Tag>
            <br />
            <Text type="secondary">{user?.email}</Text>
          </Col>
        </Row>
      </Card>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="我的活动"
              value={0}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已报名席位"
              value={0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="监管学员"
              value={0}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总活动数"
              value={0}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 最近活动 */}
      <Row gutter={16}>
        <Col span={12}>
          <Card title="最近活动" extra={<a href="/events">查看全部</a>}>
            <List
              dataSource={[]}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<CalendarOutlined />} />}
                    title="暂无活动"
                    description="还没有创建任何活动"
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="我的报名" extra={<a href="/positions">查看全部</a>}>
            <List
              dataSource={[]}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<TeamOutlined />} />}
                    title="暂无报名"
                    description="还没有报名任何席位"
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 