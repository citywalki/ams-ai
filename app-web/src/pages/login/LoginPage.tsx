import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Form, Input, Button, Checkbox, Card, Alert, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/stores/authStore';

const { Title, Text } = Typography;

interface LoginFormValues {
  username: string;
  password: string;
  rememberMe: boolean;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, login, isLoading, error, clearError } = useAuthStore();

  const [rememberMe, setRememberMe] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (values: LoginFormValues) => {
    clearError();
    const ok = await login(values.username, values.password, values.rememberMe);
    if (ok) {
      navigate('/');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.brandSection}>
        <div style={styles.brandContent}>
          <Title level={1} style={{ color: '#fff', marginBottom: 8 }}>AMS-AI</Title>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18 }}>
            晶圆厂设备告警管理系统
          </Text>
          <ul style={{ marginTop: 32, color: 'rgba(255,255,255,0.65)', paddingLeft: 20 }}>
            <li>实时告警监控</li>
            <li>智能告警分析</li>
            <li>多渠道通知</li>
            <li>灵活的策略配置</li>
          </ul>
        </div>
      </div>

      <div style={styles.formSection}>
        <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Title level={3} style={{ marginBottom: 8 }}>欢迎登录</Title>
            <Text type="secondary">请输入账号密码登录系统</Text>
          </div>

          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              closable
              onClose={clearError}
              style={{ marginBottom: 24 }}
            />
          )}

          <Form
            name="login"
            onFinish={handleSubmit}
            layout="vertical"
            initialValues={{ rememberMe: false }}
            size="large"
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="用户名"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="密码"
              />
            </Form.Item>

            <Form.Item name="rememberMe" valuePropName="checked">
              <Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}>
                记住我
              </Checkbox>
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                block
              >
                登录
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  },
  brandSection: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  brandContent: {
    maxWidth: 400,
  },
  formSection: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
    background: '#f5f5f5',
  },
};
