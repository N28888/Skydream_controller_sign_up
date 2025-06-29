import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Typography,
  Row,
  Col,
  Statistic,
  Button,
  Popconfirm,
  message,
  Space,
  Avatar,
} from 'antd';
import {
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  LineOutlined,
} from '@ant-design/icons';
import { positionAPI } from '../services/api';
import { Position } from '../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const MySignups: React.FC = () => {
  const [signups, setSignups] = useState<Position[]>([]);
  const [loading, setLoading] = useState(false);

  // 获取用户的报名记录
  const fetchMySignups = async () => {
    setLoading(true);
    try {
      const response = await positionAPI.getMySignups();
      setSignups(response.data.data || []);
    } catch (error) {
      message.error('获取报名记录失败');
      console.error('获取报名记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMySignups();
  }, []);

  // 取消报名
  const handleCancelSignup = async (positionId: number) => {
    try {
      await positionAPI.cancelSignup(positionId);
      message.success('取消报名成功');
      fetchMySignups(); // 刷新数据
    } catch (error: any) {
      message.error(error.response?.data?.message || '取消报名失败');
    }
  };

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

  // 表格列定义
  const columns = [
    {
      title: '席位信息',
      key: 'position_info',
      render: (record: Position) => (
        <Space direction="vertical" size="small">
          <div>
            <Avatar
              style={{
                backgroundColor: getPositionTypeColor(record.position_type),
                marginRight: 8,
              }}
            >
              {record.position_type}
            </Avatar>
            <Text strong>{record.position_name}</Text>
            <Tag color={getPositionTypeColor(record.position_type)}>
              {getPositionTypeName(record.position_type)}
            </Tag>
          </div>
          {record.student_supervised && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              监督员: {record.student_supervised}
            </div>
          )}
        </Space>
      ),
    },
    {
      title: '活动信息',
      key: 'event_info',
      render: (record: Position) => (
        <Space direction="vertical" size="small">
          <div>
            <EnvironmentOutlined style={{ marginRight: 4 }} />
            <Text strong>{record.event_title || `活动${record.event_id}`}</Text>
          </div>
          <div>
            <CalendarOutlined style={{ marginRight: 4 }} />
            <Text>活动日期: {record.event_date ? dayjs(record.event_date).format('YYYY-MM-DD') : '未知'}</Text>
          </div>
          <div>
            <ClockCircleOutlined style={{ marginRight: 4 }} />
            <Text>活动时间: {record.event_time ? dayjs(record.event_time, 'HH:mm:ss').format('HH:mm') : '未知'}</Text>
          </div>
          <div>
            <CalendarOutlined style={{ marginRight: 4 }} />
            <Text>报名时间: {dayjs(record.created_at).format('YYYY-MM-DD HH:mm')}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      render: (record: Position) => (
        <Popconfirm
          title="确定要取消报名吗？"
          description="取消后席位将重新开放给其他用户"
          onConfirm={() => handleCancelSignup(record.id)}
          okText="确定"
          cancelText="取消"
        >
          <Button type="default" size="small">
            取消报名
          </Button>
        </Popconfirm>
      ),
    },
  ];

  // 统计数据
  const totalSignups = signups.length;

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>我的报名记录</Title>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card>
            <Statistic
              title="总报名数"
              value={totalSignups}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 报名记录表格 */}
      <Card title="报名详情">
        {signups.length > 0 ? (
          <Table
            columns={columns}
            dataSource={signups}
            rowKey="id"
            loading={loading}
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
            }}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Text type="secondary">暂无报名记录</Text>
          </div>
        )}
      </Card>
    </div>
  );
};

export default MySignups; 