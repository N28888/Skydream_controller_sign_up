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

  // 获取用户列表
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userAPI.getAllUsers();
      setUsers(response.data.data);
    } catch (error: any) {
      message.error(error.response?.data?.message || '获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
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

      if (editingUser) {
        await userAPI.updateUser(editingUser.id!, updateData);
        message.success('用户更新成功');
      }

      setModalVisible(false);
      setEditingUser(null);
      form.resetFields();
      fetchUsers();
    } catch (error: any) {
      message.error(error.response?.data?.message || '操作失败');
    }
  };

  // 表格列定义
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '用户名',
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
      title: '等级',
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
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchUsers}
              loading={loading}
            >
              刷新
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
          onFinish={handleSubmit}
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 2, max: 20, message: '用户名长度在2-20个字符之间' },
            ]}
          >
            <Input placeholder="请输入用户名" />
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
              <Option value="S1">学生1级 (S1)</Option>
              <Option value="S2">学生2级 (S2)</Option>
              <Option value="S3">学生3级 (S3)</Option>
              <Option value="C1">管制员1级 (C1)</Option>
              <Option value="C2">管制员2级 (C2)</Option>
              <Option value="C3">管制员3级 (C3)</Option>
              <Option value="I1">教员1级 (I1)</Option>
              <Option value="I2">教员2级 (I2)</Option>
              <Option value="I3">教员3级 (I3)</Option>
              <Option value="SUP">监督员 (SUP)</Option>
              <Option value="ADM">管理员 (ADM)</Option>
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
              <Button type="primary" htmlType="submit">
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