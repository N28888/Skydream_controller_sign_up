import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { userAPI } from '../services/api';

const { Title, Text } = Typography;

interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ChangePassword: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values: ChangePasswordForm) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('新密码和确认密码不匹配');
      return;
    }

    setLoading(true);
    try {
      const response = await userAPI.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      if (response.data.success) {
        message.success('密码更改成功！');
        form.resetFields();
      } else {
        message.error(response.data.message || '密码更改失败');
      }
    } catch (error: any) {
      console.error('密码更改错误:', error);
      message.error(error.response?.data?.message || '密码更改失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '0 auto' }}>
      <Card>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2}>
            <LockOutlined /> 更改密码
          </Title>
          <Text type="secondary">请输入当前密码和新密码</Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            name="currentPassword"
            label="当前密码"
            rules={[
              { required: true, message: '请输入当前密码' },
              { min: 6, message: '密码长度至少6个字符' },
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />}
              placeholder="请输入当前密码"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码长度至少6个字符' },
              { 
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message: '密码必须包含大小写字母和数字'
              }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />}
              placeholder="请输入新密码"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="确认新密码"
            rules={[
              { required: true, message: '请确认新密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不匹配'));
                },
              }),
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />}
              placeholder="请再次输入新密码"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              size="large"
              style={{ width: '100%' }}
            >
              更改密码
            </Button>
          </Form.Item>
        </Form>

        <div style={{ 
          marginTop: 16, 
          padding: 16, 
          background: 'var(--password-requirements-bg, #f6f8fa)', 
          borderRadius: 6,
          border: '1px solid var(--password-requirements-border, #e1e4e8)'
        }}>
          <Text type="secondary">
            <strong>密码要求：</strong>
            <ul style={{ margin: '8px 0 0 20px', padding: 0 }}>
              <li>长度至少6个字符</li>
              <li>包含大小写字母和数字</li>
              <li>不能与当前密码相同</li>
            </ul>
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default ChangePassword; 