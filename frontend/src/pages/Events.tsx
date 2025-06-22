import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  DatePicker,
  TimePicker,
  Select,
  message,
  Popconfirm,
  Card,
  Tag,
  Typography,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { eventAPI } from '../services/api';
import { Event, EventForm, ApiResponse } from '../types';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;

const Events: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [form] = Form.useForm();

  // 获取活动列表
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await eventAPI.getEvents();
      setEvents(response.data.data || []);
    } catch (error) {
      message.error('获取活动列表失败');
      console.error('获取活动列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // 处理表单提交
  const handleSubmit = async (values: any) => {
    try {
      const eventData: EventForm = {
        ...values,
        event_date: values.event_date.format('YYYY-MM-DD'),
        event_time: values.event_time.format('HH:mm:ss'),
      };

      if (editingEvent) {
        await eventAPI.updateEvent(editingEvent.id, eventData);
        message.success('活动更新成功');
      } else {
        await eventAPI.createEvent(eventData);
        message.success('活动创建成功');
      }

      setModalVisible(false);
      setEditingEvent(null);
      form.resetFields();
      fetchEvents();
    } catch (error) {
      message.error(editingEvent ? '更新活动失败' : '创建活动失败');
      console.error('提交失败:', error);
    }
  };

  // 打开创建模态框
  const showCreateModal = () => {
    setEditingEvent(null);
    form.resetFields();
    setModalVisible(true);
  };

  // 打开编辑模态框
  const showEditModal = (event: Event) => {
    setEditingEvent(event);
    form.setFieldsValue({
      ...event,
      event_date: dayjs(event.event_date),
      event_time: dayjs(event.event_time, 'HH:mm:ss'),
    });
    setModalVisible(true);
  };

  // 删除活动
  const handleDelete = async (id: number) => {
    try {
      await eventAPI.deleteEvent(id);
      message.success('活动删除成功');
      fetchEvents();
    } catch (error) {
      message.error('删除活动失败');
      console.error('删除失败:', error);
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '活动标题',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: '航线',
      key: 'route',
      render: (record: Event) => (
        <Space direction="vertical" size="small">
          <div>
            <Tag color="blue">{record.departure_airport}</Tag>
            <span>→</span>
            <Tag color="green">{record.arrival_airport}</Tag>
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            航线: {record.route}
          </div>
        </Space>
      ),
    },
    {
      title: '飞行高度',
      dataIndex: 'flight_level',
      key: 'flight_level',
      render: (text: string) => <Tag color="orange">{text}</Tag>,
    },
    {
      title: 'AIRAC周期',
      dataIndex: 'airac',
      key: 'airac',
      render: (text: string) => <Tag color="purple">{text}</Tag>,
    },
    {
      title: '活动时间',
      key: 'datetime',
      render: (record: Event) => (
        <Space direction="vertical" size="small">
          <div>
            <CalendarOutlined style={{ marginRight: 4 }} />
            {dayjs(record.event_date).format('YYYY-MM-DD')}
          </div>
          <div>
            <ClockCircleOutlined style={{ marginRight: 4 }} />
            {dayjs(record.event_time, 'HH:mm:ss').format('HH:mm')}
          </div>
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      render: (record: Event) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/events/${record.id}`)}
          >
            查看
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个活动吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 统计数据
  const totalEvents = events.length;
  const upcomingEvents = events.filter(event => 
    dayjs(event.event_date).isAfter(dayjs(), 'day')
  ).length;
  const todayEvents = events.filter(event => 
    dayjs(event.event_date).isSame(dayjs(), 'day')
  ).length;

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>活动管理</Title>
      
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="总活动数"
              value={totalEvents}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="即将举行的活动"
              value={upcomingEvents}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="今日活动"
              value={todayEvents}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 操作按钮 */}
      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={showCreateModal}
        >
          创建活动
        </Button>
      </div>

      {/* 活动列表表格 */}
      <Table
        columns={columns}
        dataSource={events}
        rowKey="id"
        loading={loading}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
        }}
      />

      {/* 创建/编辑活动模态框 */}
      <Modal
        title={editingEvent ? '编辑活动' : '创建活动'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingEvent(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            flight_level: 'FL300',
            airac: '2301',
          }}
        >
          <Form.Item
            name="title"
            label="活动标题"
            rules={[{ required: true, message: '请输入活动标题' }]}
          >
            <Input placeholder="请输入活动标题" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="departure_airport"
                label="出发机场"
                rules={[{ required: true, message: '请输入出发机场' }]}
              >
                <Input placeholder="如: ZBAA" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="arrival_airport"
                label="到达机场"
                rules={[{ required: true, message: '请输入到达机场' }]}
              >
                <Input placeholder="如: ZSPD" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="route"
            label="航线"
            rules={[{ required: true, message: '请输入航线' }]}
          >
            <Input placeholder="如: A461 B330" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="flight_level"
                label="飞行高度"
                rules={[{ required: true, message: '请选择飞行高度' }]}
              >
                <Select placeholder="选择飞行高度">
                  <Option value="FL180">FL180</Option>
                  <Option value="FL200">FL200</Option>
                  <Option value="FL240">FL240</Option>
                  <Option value="FL280">FL280</Option>
                  <Option value="FL300">FL300</Option>
                  <Option value="FL320">FL320</Option>
                  <Option value="FL340">FL340</Option>
                  <Option value="FL360">FL360</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="airac"
                label="AIRAC周期"
                rules={[{ required: true, message: '请选择AIRAC周期' }]}
              >
                <Select placeholder="选择AIRAC周期">
                  <Option value="2301">2301</Option>
                  <Option value="2302">2302</Option>
                  <Option value="2303">2303</Option>
                  <Option value="2304">2304</Option>
                  <Option value="2305">2305</Option>
                  <Option value="2306">2306</Option>
                  <Option value="2307">2307</Option>
                  <Option value="2308">2308</Option>
                  <Option value="2309">2309</Option>
                  <Option value="2310">2310</Option>
                  <Option value="2311">2311</Option>
                  <Option value="2312">2312</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="event_date"
                label="活动日期"
                rules={[{ required: true, message: '请选择活动日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="event_time"
                label="活动时间"
                rules={[{ required: true, message: '请选择活动时间' }]}
              >
                <TimePicker style={{ width: '100%' }} format="HH:mm" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingEvent ? '更新' : '创建'}
              </Button>
              <Button
                onClick={() => {
                  setModalVisible(false);
                  setEditingEvent(null);
                  form.resetFields();
                }}
              >
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Events; 