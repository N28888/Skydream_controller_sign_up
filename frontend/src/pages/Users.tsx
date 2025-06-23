import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Tag,
  Space,
  Card,
  Typography,
  Tooltip,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { userAPI } from '../services/api';
import { User } from '../types';

const { Title } = Typography;
const { Option } = Select;

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // 获取用户列表
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userAPI.getAllUsers();
      setUsers(response.data.data);
    } catch (error: any) {
      console.error('获取用户列表失败:', error);
      console.error('错误详情:', {
        status: error.response?.status,
        data: error.response?.data
      });
      message.error(error.response?.data?.message || '获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchCurrentUser();
  }, []);

  // 获取等级颜色
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
      'SUP': 'volcano',
      'ADM': 'gold',
    };
    return colors[level] || 'default';
  };

  // 获取等级中文名称
  const getLevelName = (level: string) => {
    const names: { [key: string]: string } = {
      'S1': '学生1级',
      'S2': '学生2级',
      'S3': '学生3级',
      'C1': '管制员1级',
      'C2': '管制员2级',
      'C3': '管制员3级',
      'I1': '教员1级',
      'I2': '教员2级',
      'I3': '教员3级',
      'SUP': '监督员',
      'ADM': '管理员',
    };
    return names[level] || level;
  };

  // 处理编辑用户
  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      username: user.username,
      email: user.email,
      level: user.level,
      password: '', // 密码字段留空
    });
    setModalVisible(true);
  };

  // 处理删除用户
  const handleDelete = async (userId: number) => {
    try {
      await userAPI.deleteUser(userId);
      message.success('用户删除成功');
      fetchUsers();
    } catch (error: any) {
      message.error(error.response?.data?.message || '删除用户失败');
    }
  };

  // 处理表单提交
  const handleSubmit = async (values: any) => {
    console.log('handleSubmit被调用，参数:', values);
    console.log('editingUser:', editingUser);
    
    setSubmitLoading(true);
    
    try {
      const updateData: any = {
        username: values.username,
        email: values.email,
        level: values.level,
      };

      // 只有当密码字段不为空时才更新密码
      if (values.password) {
        updateData.password = values.password;
      }

      console.log('准备更新的数据:', updateData);

      if (editingUser) {
        console.log('开始调用API更新用户:', editingUser.id);
        console.log('API URL:', `/api/users/${editingUser.id}`);
        console.log('请求数据:', updateData);
        
        const response = await userAPI.updateUser(editingUser.id!, updateData);
        console.log('API响应:', response);
        console.log('响应状态:', response.status);
        console.log('响应数据:', response.data);
        
        if (response.data.success) {
        message.success('用户更新成功');
        } else {
          message.error(response.data.message || '更新失败');
          return;
        }
      }

      setModalVisible(false);
      setEditingUser(null);
      form.resetFields();
      fetchUsers();
    } catch (error: any) {
      console.error('更新用户时发生错误:', error);
      console.error('错误详情:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      message.error(error.response?.data?.message || '操作失败');
    } finally {
      setSubmitLoading(false);
    }
  };

  // 测试状态更新
  const testStateUpdate = () => {
    console.log('测试状态更新');
    setSubmitLoading(true);
    setTimeout(() => {
      setSubmitLoading(false);
      message.success('状态更新测试成功');
    }, 1000);
  };

  // 获取当前用户信息
  const fetchCurrentUser = async () => {
    try {
      const response = await userAPI.getProfile();
      setCurrentUser(response.data.data);
      console.log('当前用户信息:', response.data.data);
    } catch (error: any) {
      console.error('获取当前用户信息失败:', error);
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '呼号',
      dataIndex: 'username',
      key: 'username',
      render: (text: string) => (
        <Space>
          <UserOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '权限',
      dataIndex: 'level',
      key: 'level',
      render: (level: string) => (
        <Tag color={getLevelColor(level)}>
          {getLevelName(level)}
        </Tag>
      ),
    },
    {
      title: '注册时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: User) => (
        <Space>
          <Tooltip title="编辑用户">
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEdit(record)}
            >
              编辑
            </Button>
          </Tooltip>
          <Popconfirm
            title="确定要删除这个用户吗？"
            description="此操作不可撤销"
            onConfirm={() => handleDelete(record.id!)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除用户">
              <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
                size="small"
              >
                删除
              </Button>
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title level={3} style={{ margin: 0 }}>
            <UserOutlined /> 用户管理
          </Title>
          <Space>
            {currentUser && (
              <span style={{ color: '#666' }}>
                当前用户: {currentUser.username} ({currentUser.level})
              </span>
            )}
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchUsers}
              loading={loading}
            >
              刷新
            </Button>
            <Button
              onClick={() => {
                console.log('测试按钮被点击');
                message.info('测试按钮工作正常');
              }}
              type="default"
            >
              测试点击
            </Button>
            <Button
              onClick={testStateUpdate}
              type="dashed"
              loading={submitLoading}
            >
              测试状态
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 个用户`,
            pageSize: 10,
          }}
        />
      </Card>

      {/* 编辑用户模态框 */}
      <Modal
        title={editingUser ? '编辑用户' : '添加用户'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingUser(null);
          form.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            console.log('表单onFinish被触发，数据:', values);
            handleSubmit(values);
          }}
          onFinishFailed={(errorInfo) => {
            console.log('表单验证失败:', errorInfo);
            message.error('请检查表单输入');
          }}
          onValuesChange={(changedValues, allValues) => {
            console.log('表单值变化:', changedValues, allValues);
          }}
        >
          <Form.Item
            name="username"
            label="呼号"
            rules={[
              { required: true, message: '请输入呼号' },
              { min: 2, max: 20, message: '呼号长度在2-20个字符之间' },
            ]}
          >
            <Input placeholder="请输入呼号" />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          <Form.Item
            name="level"
            label="管制员等级"
            rules={[{ required: true, message: '请选择管制员等级' }]}
          >
            <Select placeholder="请选择管制员等级">
              <Option value="S1">S1</Option>
              <Option value="S2">S2</Option>
              <Option value="S3">S3</Option>
              <Option value="C1">C1</Option>
              <Option value="C2">C2</Option>
              <Option value="C3">C3</Option>
              <Option value="I1">I1</Option>
              <Option value="I2">I2</Option>
              <Option value="I3">I3</Option>
              <Option value="SUP">SUP</Option>
              <Option value="ADM">ADM</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[
              { min: 6, message: '密码长度至少6个字符' },
            ]}
          >
            <Input.Password 
              placeholder={editingUser ? '留空则不修改密码' : '请输入密码'} 
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={submitLoading}
              >
                {editingUser ? '更新' : '创建'}
              </Button>
              <Button
                onClick={() => {
                  setModalVisible(false);
                  setEditingUser(null);
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

export default Users; 