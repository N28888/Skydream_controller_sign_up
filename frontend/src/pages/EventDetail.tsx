import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Descriptions,
  Tag,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Divider,
  message,
  Spin,
  Empty,
  List,
  Avatar,
  Modal,
  Form,
  Input,
  Select,
  Popconfirm,
  Alert,
} from 'antd';
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  LineOutlined,
  EnvironmentOutlined,
  GroupOutlined,
  UserOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ShareAltOutlined,
} from '@ant-design/icons';
import { eventAPI, positionAPI, userAPI } from '../services/api';
import { Event, Position, SignupForm, User } from '../types';
import dayjs from 'dayjs';
import { useMediaQuery } from 'react-responsive';

const { Title, Text } = Typography;
const { Option } = Select;

const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [signupLoading, setSignupLoading] = useState<number | null>(null);
  const isMobile = useMediaQuery({ maxWidth: 768 });

  // 获取活动详情
  const fetchEventDetail = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      // 先获取活动详情和用户信息
      const [eventResponse, userResponse] = await Promise.all([
        eventAPI.getEvent(parseInt(id)),
        userAPI.getProfile(),
      ]);
      
      setEvent(eventResponse.data.data);
      setCurrentUser(userResponse.data.data);
      
      // 获取席位列表
      try {
        const positionsResponse = await positionAPI.getPositions(parseInt(id));
        setPositions(positionsResponse.data.data || []);
      } catch (error) {
        console.error('获取席位列表失败:', error);
        setPositions([]);
      }
    } catch (error) {
      message.error('获取活动详情失败');
      console.error('获取活动详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventDetail();
  }, [id]);

  // 获取席位类型颜色
  const getPositionTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      DEL: 'blue',
      GND: 'green',
      TWR: 'orange',
      APP: 'purple',
      CTR: 'red',
      FSS: 'cyan',
    };
    return colors[type] || 'default';
  };

  // 获取席位类型中文名称
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

  // 检查用户是否有权限报名特定席位
  const canSignupPosition = (positionType: string) => {
    if (!currentUser) return false;
    
    const permissions: { [key: string]: string[] } = {
      'S1': ['DEL', 'GND'],
      'S2': ['DEL', 'GND', 'TWR'],
      'S3': ['DEL', 'GND', 'TWR', 'APP'],
      'C1': ['DEL', 'GND', 'TWR', 'APP'],
      'C2': ['DEL', 'GND', 'TWR', 'APP', 'CTR'],
      'C3': ['DEL', 'GND', 'TWR', 'APP', 'CTR', 'FSS'],
      'I1': ['DEL', 'GND', 'TWR', 'APP', 'CTR', 'FSS'],
      'I2': ['DEL', 'GND', 'TWR', 'APP', 'CTR', 'FSS'],
      'I3': ['DEL', 'GND', 'TWR', 'APP', 'CTR', 'FSS'],
      'SUP': ['DEL', 'GND', 'TWR', 'APP', 'CTR', 'FSS'],
      'ADM': ['DEL', 'GND', 'TWR', 'APP', 'CTR', 'FSS'],
    };

    return permissions[currentUser.level]?.includes(positionType) || false;
  };

  // 处理席位报名
  const handleSignup = async (position: Position) => {
    if (!currentUser) {
      message.error('请先登录');
      return;
    }
    if (!canSignupPosition(position.position_type)) {
      message.error(`您的等级 ${currentUser.level} 无法报名 ${getPositionTypeName(position.position_type)} 席位`);
      return;
    }
    setSignupLoading(position.id);
    await performSignup(position.id, {});
  };

  // 执行报名
  const performSignup = async (positionId: number, signupData: any) => {
    try {
      console.log('开始报名席位:', positionId);
      console.log('报名数据:', signupData);
      console.log('当前用户:', currentUser);
      const response = await positionAPI.signupPosition(positionId, signupData);
      console.log('报名响应:', response);
      message.success('席位报名成功');
      fetchEventDetail(); // 刷新数据
    } catch (error: any) {
      console.error('报名失败:', error);
      console.error('错误详情:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      message.error(error.response?.data?.message || '报名失败');
    } finally {
      setSignupLoading(null);
    }
  };

  // 处理取消报名
  const handleCancelSignup = async (position: Position) => {
    try {
      await positionAPI.cancelSignup(position.id);
      message.success('取消报名成功');
      fetchEventDetail(); // 刷新数据
    } catch (error: any) {
      message.error(error.response?.data?.message || '取消报名失败');
    }
  };

  // 检查是否是当前用户报名的席位
  const isMySignup = (position: Position) => {
    return currentUser && position.taken_by === currentUser.id;
  };

  // 处理分享活动
  const handleShareEvent = async () => {
    try {
      const currentUrl = window.location.href;
      await navigator.clipboard.writeText(currentUrl);
      message.success('活动链接已复制到剪贴板！');
    } catch (error) {
      console.error('复制链接失败:', error);
      message.error('复制链接失败，请手动复制');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: isMobile ? '30px' : '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!event) {
    return (
      <div style={{ textAlign: 'center', padding: isMobile ? '30px' : '50px' }}>
        <Empty description="活动不存在" />
      </div>
    );
  }

  return (
    <div style={{ padding: isMobile ? '16px' : '24px' }}>
      {/* 返回按钮 */}
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/events')}
        style={{ marginBottom: 16 }}
        size={isMobile ? 'large' : 'middle'}
      >
        返回活动列表
      </Button>

      <Title level={isMobile ? 4 : 2}>{event.title}</Title>

      <Row gutter={isMobile ? 16 : 24}>
        {/* 活动详情 */}
        <Col span={isMobile ? 24 : 16}>
          <Card title="活动详情" style={{ marginBottom: 24 }} size={isMobile ? 'small' : 'default'}>
            <Descriptions 
              column={isMobile ? 1 : 2} 
              bordered 
              size={isMobile ? 'small' : 'default'}
            >
              <Descriptions.Item label="出发机场">
                <Tag color="blue" icon={<EnvironmentOutlined />}>
                  {event.departure_airport}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="到达机场">
                <Tag color="green" icon={<EnvironmentOutlined />}>
                  {event.arrival_airport}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="航线" span={isMobile ? 1 : 2}>
                <Text code>{event.route}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="飞行高度">
                <Tag color="orange" icon={<LineOutlined />}>
                  {event.flight_level}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="AIRAC周期">
                <Tag color="purple">{event.airac}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="活动日期">
                <Space>
                  <CalendarOutlined />
                  {dayjs(event.event_date).format('YYYY年MM月DD日')}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="活动时间(UTC+8)">
                <Space>
                  <ClockCircleOutlined />
                  {dayjs(event.event_time, 'HH:mm:ss').format('HH:mm')}
                </Space>
              </Descriptions.Item>
              {event.remarks && (
                <Descriptions.Item label="活动备注" span={isMobile ? 1 : 2}>
                  <Text>{event.remarks}</Text>
                </Descriptions.Item>
              )}
            </Descriptions>
            
            {/* 管理员操作按钮 */}
            {currentUser && ['SUP', 'ADM'].includes(currentUser.level) && (
              <div style={{ marginTop: 16, textAlign: isMobile ? 'center' : 'right' }}>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => navigate(`/events/${event.id}/positions`)}
                  size={isMobile ? 'large' : 'middle'}
                  style={isMobile ? { width: '100%' } : {}}
                >
                  管理席位
                </Button>
              </div>
            )}
          </Card>

          {/* 席位列表 */}
          <Card title="席位信息" size={isMobile ? 'small' : 'default'}>
            {positions.length > 0 ? (
              isMobile ? (
                // 移动端卡片式展示
                <div>
                  {positions.map((position) => (
                    <Card
                      key={position.id}
                      style={{ marginBottom: 12 }}
                      size="small"
                      bodyStyle={{ padding: 12 }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Avatar
                            size={isMobile ? 'small' : 'default'}
                            style={{
                              backgroundColor: getPositionTypeColor(position.position_type),
                            }}
                          >
                            {position.position_type}
                          </Avatar>
                          <div>
                            <div style={{ fontWeight: 'bold', fontSize: 14 }}>
                              {position.position_name}
                            </div>
                            <div style={{ marginTop: 4 }}>
                              <Tag color={getPositionTypeColor(position.position_type)}>
                                {getPositionTypeName(position.position_type)}
                              </Tag>
                              {position.is_taken && (
                                <Tag color="red">已占用</Tag>
                              )}
                              {!canSignupPosition(position.position_type) && (
                                <Tag color="orange">权限不足</Tag>
                              )}
                            </div>
                          </div>
                        </div>
                        <div>
                          {isMySignup(position) ? (
                            <Popconfirm
                              title="确定要取消报名吗？"
                              onConfirm={() => handleCancelSignup(position)}
                              okText="确定"
                              cancelText="取消"
                            >
                              <Button type="default" size="small">
                                取消报名
                              </Button>
                            </Popconfirm>
                          ) : (
                            <Button
                              type={position.is_taken ? 'default' : 'primary'}
                              disabled={position.is_taken || !canSignupPosition(position.position_type) || signupLoading === position.id}
                              size="small"
                              loading={signupLoading === position.id}
                              onClick={() => handleSignup(position)}
                            >
                              {position.is_taken ? '已报名' : '报名'}
                            </Button>
                          )}
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: '#666' }}>
                        {position.is_taken ? (
                          <span>报名人: {position.taken_by_username} ({position.taken_by_level})</span>
                        ) : (
                          <span style={{ color: '#52c41a' }}>可报名</span>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                // 桌面端列表展示
                <List
                  dataSource={positions}
                  renderItem={(position) => (
                    <List.Item
                      actions={[
                        isMySignup(position) ? (
                          <Popconfirm
                            title="确定要取消报名吗？"
                            onConfirm={() => handleCancelSignup(position)}
                            okText="确定"
                            cancelText="取消"
                          >
                            <Button type="default" size="small">
                              取消报名
                            </Button>
                          </Popconfirm>
                        ) : (
                          <Button
                            type={position.is_taken ? 'default' : 'primary'}
                            disabled={position.is_taken || !canSignupPosition(position.position_type) || signupLoading === position.id}
                            size="small"
                            loading={signupLoading === position.id}
                            onClick={() => handleSignup(position)}
                          >
                            {position.is_taken ? '已报名' : '报名'}
                          </Button>
                        )
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            style={{
                              backgroundColor: getPositionTypeColor(position.position_type),
                            }}
                          >
                            {position.position_type}
                          </Avatar>
                        }
                        title={
                          <Space>
                            <Text strong>{position.position_name}</Text>
                            <Tag color={getPositionTypeColor(position.position_type)}>
                              {getPositionTypeName(position.position_type)}
                            </Tag>
                            {position.is_taken && (
                              <Tag color="red">已占用</Tag>
                            )}
                            {!canSignupPosition(position.position_type) && (
                              <Tag color="orange">权限不足</Tag>
                            )}
                          </Space>
                        }
                        description={
                          position.is_taken ? (
                            <Text type="secondary">
                              报名人: {position.taken_by_username} ({position.taken_by_level})
                            </Text>
                          ) : (
                            <Text type="success">可报名</Text>
                          )
                        }
                      />
                    </List.Item>
                  )}
                />
              )
            ) : (
              <Empty description="暂无席位信息" />
            )}
          </Card>
        </Col>

        {/* 侧边栏信息 */}
        <Col span={isMobile ? 24 : 8}>
          <Card title="活动统计" style={{ marginBottom: 16 }} size={isMobile ? 'small' : 'default'}>
            <Row gutter={isMobile ? 8 : 16}>
              <Col span={8}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    fontSize: isMobile ? '20px' : '24px', 
                    fontWeight: 'bold', 
                    color: '#1890ff' 
                  }}>
                    {positions.length}
                  </div>
                  <div style={{ fontSize: isMobile ? '11px' : '12px', color: '#666' }}>总席位</div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    fontSize: isMobile ? '20px' : '24px', 
                    fontWeight: 'bold', 
                    color: '#52c41a' 
                  }}>
                    {positions.filter(p => !p.is_taken).length}
                  </div>
                  <div style={{ fontSize: isMobile ? '11px' : '12px', color: '#666' }}>可报名</div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    fontSize: isMobile ? '20px' : '24px', 
                    fontWeight: 'bold', 
                    color: '#faad14' 
                  }}>
                    {positions.filter(p => p.is_taken).length}
                  </div>
                  <div style={{ fontSize: isMobile ? '11px' : '12px', color: '#666' }}>已报名</div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default EventDetail; 