import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography, List, Avatar, Tag, message, Space } from 'antd';
import {
  UserOutlined,
  CalendarOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { User, Event, Position } from '../types';
import { userAPI, eventAPI, positionAPI } from '../services/api';
import dayjs from 'dayjs';
import { useMediaQuery } from 'react-responsive';

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalEvents: 0,
    mySignups: 0,
    upcomingEvents: 0,
  });
  const [nextEvent, setNextEvent] = useState<Event | null>(null);
  const [recentEvents, setRecentEvents] = useState<Event[]>([]);
  const [mySignups, setMySignups] = useState<Position[]>([]);
  const isMobile = useMediaQuery({ maxWidth: 768 });

  // 获取用户信息
  const fetchUserProfile = async () => {
    try {
      const response = await userAPI.getProfile();
      setUser(response.data.data);
    } catch (error) {
      console.error('获取用户信息失败:', error);
    }
  };

  // 获取统计数据
  const fetchStats = async () => {
    setLoading(true);
    try {
      // 获取所有活动
      const eventsResponse = await eventAPI.getEvents();
      const allEvents = eventsResponse.data.data || [];
      
      // 获取我的报名
      const signupsResponse = await positionAPI.getMySignups();
      const mySignupsData = signupsResponse.data.data || [];
      
      // 计算统计数据
      const totalEvents = allEvents.length;
      const mySignupsCount = mySignupsData.length;
      const upcomingEvents = allEvents.filter((event: Event) => 
        dayjs(event.event_date).isAfter(dayjs(), 'day')
      ).length;

      // 获取下次活动（最近的未来活动）
      const futureEvents = allEvents.filter((event: Event) => 
        dayjs(event.event_date).isAfter(dayjs(), 'day')
      );
      const nextEventData = futureEvents.length > 0 
        ? futureEvents.sort((a: Event, b: Event) => 
            dayjs(a.event_date).diff(dayjs(b.event_date))
          )[0] 
        : null;

      setStats({
        totalEvents,
        mySignups: mySignupsCount,
        upcomingEvents,
      });
      setNextEvent(nextEventData);

      // 获取最近5个活动
      const sortedEvents = allEvents.sort((a: Event, b: Event) => {
        const dateA = dayjs(a.event_date);
        const dateB = dayjs(b.event_date);
        const now = dayjs();
        
        // 计算距离当前日期的天数差
        const diffA = Math.abs(dateA.diff(now, 'day'));
        const diffB = Math.abs(dateB.diff(now, 'day'));
        
        // 按距离排序，距离最近的排在前面
        return diffA - diffB;
      });
      
      setRecentEvents(sortedEvents.slice(0, 5));
      setMySignups(mySignupsData.slice(0, 5));
    } catch (error) {
      message.error('获取统计数据失败');
      console.error('获取统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

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
      'S1': 'S1',
      'S2': 'S2',
      'S3': 'S3',
      'C1': 'C1',
      'C2': 'C2',
      'C3': 'C3',
      'I1': 'I1',
      'I2': 'I2',
      'I3': 'I3',
      'SUP': 'SUP',
      'ADM': 'ADM',
    };
    return texts[level] || level;
  };

  const getPositionTypeName = (type: string) => {
    const names: { [key: string]: string } = {
      DEL: '放行',
      GND: '地面',
      TWR: '塔台',
      APP: '进近',
      CTR: '区调',
      FSS: '飞行服务站',
    };
    return names[type] || type;
  };

  return (
    <div style={{ padding: isMobile ? '16px' : '24px' }}>
      <Title level={isMobile ? 4 : 2}>仪表板</Title>
      
      {/* 用户信息卡片 */}
      <Card style={{ marginBottom: 24 }} size={isMobile ? 'small' : 'default'}>
        <Row gutter={isMobile ? 12 : 16} align="middle">
          <Col>
            <Avatar size={isMobile ? 48 : 64} icon={<UserOutlined />} />
          </Col>
          <Col flex="1">
            <Title level={isMobile ? 4 : 3} style={{ margin: 0 }}>
              {user?.username}
            </Title>
            <Tag color={getLevelColor(user?.level || '')} style={{ fontSize: isMobile ? '12px' : '14px' }}>
              {getLevelText(user?.level || '')}
            </Tag>
            <br />
            <Text type="secondary" style={{ fontSize: isMobile ? '12px' : '14px' }}>{user?.email}</Text>
          </Col>
        </Row>
      </Card>

      {/* 统计卡片 */}
      <Row gutter={isMobile ? 8 : 16} style={{ marginBottom: 24 }}>
        <Col span={isMobile ? 12 : 8}>
          <Card size={isMobile ? 'small' : 'default'}>
            <Statistic
              title="即将举行的活动"
              value={stats.upcomingEvents}
              prefix={<CalendarOutlined />}
              valueStyle={{ 
                color: '#3f8600',
                fontSize: isMobile ? '20px' : '24px'
              }}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={isMobile ? 12 : 8}>
          <Card size={isMobile ? 'small' : 'default'}>
            <Statistic
              title="已报名席位"
              value={stats.mySignups}
              prefix={<TeamOutlined />}
              valueStyle={{ 
                color: '#1890ff',
                fontSize: isMobile ? '20px' : '24px'
              }}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={isMobile ? 24 : 8}>
          <Card size={isMobile ? 'small' : 'default'}>
            <Statistic
              title="下次活动"
              value={nextEvent ? dayjs(nextEvent.event_date).format('MM-DD') : '暂无'}
              prefix={<CalendarOutlined />}
              valueStyle={{ 
                color: '#cf1322',
                fontSize: isMobile ? '20px' : '24px'
              }}
              loading={loading}
              suffix={nextEvent ? dayjs(nextEvent.event_time, 'HH:mm:ss').format('HH:mm') : ''}
            />
            {nextEvent && (
              <div style={{ 
                marginTop: 8, 
                fontSize: isMobile ? '11px' : '12px', 
                color: '#666' 
              }}>
                {nextEvent.title}
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* 最近活动 */}
      <Row gutter={isMobile ? 16 : 16}>
        <Col span={isMobile ? 24 : 12}>
          <Card 
            title="最近活动" 
            extra={<a href="/events">查看全部</a>}
            size={isMobile ? 'small' : 'default'}
            style={{ marginBottom: isMobile ? 16 : 0 }}
          >
            <List
              dataSource={recentEvents}
              loading={loading}
              size={isMobile ? 'small' : 'default'}
              renderItem={(event: Event) => (
                <List.Item style={{ padding: isMobile ? '8px 0' : '12px 0' }}>
                  <List.Item.Meta
                    avatar={<Avatar size={isMobile ? 'small' : 'default'} icon={<CalendarOutlined />} />}
                    title={
                      <div>
                        <Text strong style={{ fontSize: isMobile ? '13px' : '14px' }}>{event.title}</Text>
                        <br />
                        <Space size="small" style={{ marginTop: 4 }}>
                          <Tag color="blue" icon={<EnvironmentOutlined />} style={{ fontSize: isMobile ? '11px' : '12px' }}>
                            {event.departure_airport}
                          </Tag>
                          <span style={{ fontSize: isMobile ? '11px' : '12px' }}>→</span>
                          <Tag color="green" icon={<EnvironmentOutlined />} style={{ fontSize: isMobile ? '11px' : '12px' }}>
                            {event.arrival_airport}
                          </Tag>
                        </Space>
                      </div>
                    }
                    description={
                      <div style={{ fontSize: isMobile ? '11px' : '12px' }}>
                        <Text type="secondary">
                          <ClockCircleOutlined /> {dayjs(event.event_date).format('YYYY年MM月DD日')} {dayjs(event.event_time, 'HH:mm:ss').format('HH:mm')}
                        </Text>
                        <br />
                        <Text type="secondary">AIRAC: {event.airac}</Text>
                        <br />
                        <Text type="secondary" style={{ fontFamily: 'monospace' }}>
                          ID: {event.custom_id || event.id}
                        </Text>
                        {event.remarks && (
                          <>
                            <br />
                            <Text type="secondary" style={{ fontStyle: 'italic' }}>
                              备注: {event.remarks}
                            </Text>
                          </>
                        )}
                      </div>
                    }
                  />
                </List.Item>
              )}
              locale={{
                emptyText: (
                  <div style={{ textAlign: 'center', padding: isMobile ? '16px' : '20px' }}>
                    <CalendarOutlined style={{ 
                      fontSize: isMobile ? '36px' : '48px', 
                      color: '#d9d9d9', 
                      marginBottom: isMobile ? '12px' : '16px' 
                    }} />
                    <div style={{ fontSize: isMobile ? '13px' : '14px' }}>暂无活动</div>
                    <div style={{ color: '#999', fontSize: isMobile ? '11px' : '12px' }}>还没有创建任何活动</div>
                  </div>
                )
              }}
            />
          </Card>
        </Col>
        <Col span={isMobile ? 24 : 12}>
          <Card 
            title="我的报名" 
            extra={<a href="/positions">查看全部</a>}
            size={isMobile ? 'small' : 'default'}
          >
            <List
              dataSource={mySignups}
              loading={loading}
              size={isMobile ? 'small' : 'default'}
              renderItem={(position: Position) => (
                <List.Item style={{ padding: isMobile ? '8px 0' : '12px 0' }}>
                  <List.Item.Meta
                    avatar={<Avatar size={isMobile ? 'small' : 'default'} icon={<TeamOutlined />} />}
                    title={
                      <div>
                        <Text strong style={{ fontSize: isMobile ? '13px' : '14px' }}>{position.position_name}</Text>
                        <Tag color="blue" style={{ 
                          marginLeft: 8,
                          fontSize: isMobile ? '11px' : '12px'
                        }}>
                          {getPositionTypeName(position.position_type)}
                        </Tag>
                      </div>
                    }
                    description={
                      <div style={{ fontSize: isMobile ? '11px' : '12px' }}>
                        <Text type="secondary">
                          {position.event_date ? dayjs(position.event_date).format('YYYY-MM-DD') : '未知日期'} {position.event_time ? dayjs(position.event_time, 'HH:mm:ss').format('HH:mm') : ''}
                        </Text>
                        {position.student_supervised && (
                          <div>
                            <Text type="secondary">监督员: {position.student_supervised}</Text>
                          </div>
                        )}
                      </div>
                    }
                  />
                </List.Item>
              )}
              locale={{
                emptyText: (
                  <div style={{ textAlign: 'center', padding: isMobile ? '16px' : '20px' }}>
                    <TeamOutlined style={{ 
                      fontSize: isMobile ? '36px' : '48px', 
                      color: '#d9d9d9', 
                      marginBottom: isMobile ? '12px' : '16px' 
                    }} />
                    <div style={{ fontSize: isMobile ? '13px' : '14px' }}>暂无报名</div>
                    <div style={{ color: '#999', fontSize: isMobile ? '11px' : '12px' }}>还没有报名任何席位</div>
                  </div>
                )
              }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 