import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Table,
  Tag,
  Typography,
  Row,
  Col,
  Statistic,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  TeamOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { positionAPI, eventAPI } from '../services/api';
import { Position, PositionForm, PositionBatchForm, Event, POSITION_TYPE_OPTIONS } from '../types';

const { Title } = Typography;
const { Option } = Select;

const Positions: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [positions, setPositions] = useState<Position[]>([]);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [batchModalVisible, setBatchModalVisible] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [form] = Form.useForm();
  const [batchForm] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState(false);

  // 获取席位列表
  const fetchPositions = async () => {
    if (!eventId) return;
    
    setLoading(true);
    try {
      const [positionsResponse, eventResponse] = await Promise.all([
        positionAPI.getPositions(parseInt(eventId)),
        eventAPI.getEvent(parseInt(eventId)),
      ]);
      
      setPositions(positionsResponse.data.data || []);
      setEvent(eventResponse.data.data);
    } catch (error) {
      message.error('获取席位列表失败');
      console.error('获取席位列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
  }, [eventId]);

  // 处理表单提交
  const handleSubmit = async (values: PositionForm) => {
    if (!eventId) return;
    setSubmitLoading(true);
    try {
      if (editingPosition) {
        console.log('开始调用API更新席位:', editingPosition.id);
        const response = await positionAPI.updatePosition(editingPosition.id, values);
        console.log('API响应:', response);
        if (response.data.success) {
          message.success('席位更新成功');
        } else {
          message.error(response.data.message || '更新失败');
          return;
        }
      } else {
        console.log('开始调用API创建席位');
        const response = await positionAPI.createPosition({
          ...values,
          event_id: parseInt(eventId),
        });
        console.log('API响应:', response);
        if (response.data.success) {
          message.success('席位创建成功');
        } else {
          message.error(response.data.message || '创建失败');
          return;
        }
      }
      setModalVisible(false);
      setEditingPosition(null);
      form.resetFields();
      fetchPositions();
    } catch (error: any) {
      console.error('席位操作时发生错误:', error);
      console.error('错误详情:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      message.error(error.response?.data?.message || (editingPosition ? '更新席位失败' : '创建席位失败'));
    } finally {
      setSubmitLoading(false);
    }
  };

  // 处理批量创建
  const handleBatchSubmit = async (values: PositionBatchForm) => {
    if (!eventId) return;
    
    try {
      await positionAPI.createBatchPositions({
        event_id: parseInt(eventId),
        positions: values.positions,
      });
      message.success('批量创建席位成功');
      setBatchModalVisible(false);
      batchForm.resetFields();
      fetchPositions();
    } catch (error: any) {
      message.error(error.response?.data?.message || '批量创建席位失败');
    }
  };

  // 删除席位
  const handleDelete = async (id: number) => {
    try {
      await positionAPI.deletePosition(id);
      message.success('席位删除成功');
      fetchPositions();
    } catch (error: any) {
      message.error(error.response?.data?.message || '删除席位失败');
    }
  };

  // 打开创建模态框
  const showCreateModal = () => {
    setEditingPosition(null);
    form.resetFields();
    setModalVisible(true);
  };

  // 打开编辑模态框
  const showEditModal = (position: Position) => {
    setEditingPosition(position);
    form.setFieldsValue({
      position_name: position.position_name,
      position_type: position.position_type,
    });
    setModalVisible(true);
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
      title: '席位名称',
      dataIndex: 'position_name',
      key: 'position_name',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: '席位类型',
      dataIndex: 'position_type',
      key: 'position_type',
      render: (type: string) => (
        <Tag color={getPositionTypeColor(type)}>
          {getPositionTypeName(type)}
        </Tag>
      ),
    },
    {
      title: '状态',
      key: 'status',
      render: (record: Position) => (
        <Tag color={record.is_taken ? 'red' : 'green'}>
          {record.is_taken ? '已占用' : '可报名'}
        </Tag>
      ),
    },
    {
      title: '报名人',
      key: 'signup_info',
      render: (record: Position) => (
        record.is_taken ? (
          <Space direction="vertical" size="small">
            <div>
              <UserOutlined style={{ marginRight: 4 }} />
              {record.taken_by_username} ({record.taken_by_level})
            </div>
            {record.student_supervised && (
              <div style={{ fontSize: '12px', color: '#666' }}>
                监督员: {record.student_supervised}
              </div>
            )}
          </Space>
        ) : (
          <span style={{ color: '#999' }}>无人报名</span>
        )
      ),
    },
    {
      title: '操作',
      key: 'actions',
      render: (record: Position) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
            disabled={record.is_taken}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个席位吗？"
            description="删除后无法恢复"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
            disabled={record.is_taken}
          >
            <Button 
              type="link" 
              danger 
              icon={<DeleteOutlined />}
              disabled={record.is_taken}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 统计数据
  const totalPositions = positions.length;
  const availablePositions = positions.filter(p => !p.is_taken).length;
  const takenPositions = positions.filter(p => p.is_taken).length;
  const supervisedPositions = positions.filter(p => p.student_supervised).length;

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 16 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/events')}
          style={{ marginBottom: 16 }}
        >
          返回活动列表
        </Button>
      </div>
      
      <Title level={2}>
        席位管理 - {event?.title}
      </Title>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总席位"
              value={totalPositions}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="可报名"
              value={availablePositions}
              valueStyle={{ color: '#3f8600' }}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已报名"
              value={takenPositions}
              valueStyle={{ color: '#faad14' }}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="需监督"
              value={supervisedPositions}
              valueStyle={{ color: '#f5222d' }}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 操作按钮 */}
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={showCreateModal}
          >
            创建席位
          </Button>
          <Button
            icon={<PlusOutlined />}
            onClick={() => setBatchModalVisible(true)}
          >
            批量创建
          </Button>
        </Space>
      </div>

      {/* 席位列表表格 */}
      <Table
        columns={columns}
        dataSource={positions}
        rowKey="id"
        loading={loading}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
        }}
      />

      {/* 创建/编辑席位模态框 */}
      <Modal
        title={editingPosition ? '编辑席位' : '创建席位'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingPosition(null);
          form.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="position_name"
            label="席位名称"
            rules={[{ required: true, message: '请输入席位名称' }]}
          >
            <Input placeholder="如: ZSHA_CTR" />
          </Form.Item>

          <Form.Item
            name="position_type"
            label="席位类型"
            rules={[{ required: true, message: '请选择席位类型' }]}
          >
            <Select placeholder="选择席位类型">
              {POSITION_TYPE_OPTIONS.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={submitLoading}>
                {editingPosition ? '更新' : '创建'}
              </Button>
              <Button
                onClick={() => {
                  setModalVisible(false);
                  setEditingPosition(null);
                  form.resetFields();
                }}
              >
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 批量创建模态框 */}
      <Modal
        title="批量创建席位"
        open={batchModalVisible}
        onCancel={() => {
          setBatchModalVisible(false);
          batchForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={batchForm}
          layout="vertical"
          onFinish={handleBatchSubmit}
        >
          <Form.Item
            name="positions"
            label="席位列表"
            rules={[{ required: true, message: '请添加至少一个席位' }]}
          >
            <Form.List name="positions">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Row gutter={16} key={key} style={{ marginBottom: 8 }}>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, 'position_name']}
                          rules={[{ required: true, message: '请输入席位名称' }]}
                        >
                          <Input placeholder="席位名称" />
                        </Form.Item>
                      </Col>
                      <Col span={10}>
                        <Form.Item
                          {...restField}
                          name={[name, 'position_type']}
                          rules={[{ required: true, message: '请选择席位类型' }]}
                        >
                          <Select placeholder="席位类型">
                            {POSITION_TYPE_OPTIONS.map(option => (
                              <Option key={option.value} value={option.value}>
                                {option.label}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={2}>
                        <Button
                          type="link"
                          danger
                          onClick={() => remove(name)}
                        >
                          删除
                        </Button>
                      </Col>
                    </Row>
                  ))}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                    >
                      添加席位
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                批量创建
              </Button>
              <Button
                onClick={() => {
                  setBatchModalVisible(false);
                  batchForm.resetFields();
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

export default Positions; 