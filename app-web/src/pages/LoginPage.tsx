import { useState } from 'react';
import { Button, Input, MessageStrip, Title } from '@ui5/webcomponents-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import './LoginPage.css';

export default function LoginPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Admin123!');
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to='/' replace />;
  }

  const submit = async () => {
    const ok = await login(username, password);
    if (ok) {
      navigate('/');
    }
  };

  return (
    <div className='fiori-page-root login-page-root'>
      <div className='login-topbar'>
        <div className='login-topbar-brand'>AMS</div>
      </div>
      <div className='fiori-page-content login-page-content'>
        <div className='login-layout'>
          <section className='welcome-panel'>
            <h1>欢迎使用 AMS 告警管理平台</h1>
            <p className='welcome-subtitle'>统一处理设备告警、状态追踪与运维协同</p>
            <ul>
              <li>告警集中监控</li>
              <li>告警生命周期管理</li>
              <li>通知与权限协同</li>
            </ul>
          </section>

          <div className='login-card-wrap'>
            <div className='login-card'>
              <Title level='H3'>AMS 登录</Title>
              <p className='login-subtitle'>设备告警管理系统</p>
              {error ? <MessageStrip design='Negative' hideCloseButton>{error}</MessageStrip> : null}
              <div className='login-form'>
                <Input value={username} onInput={(e) => setUsername(e.target.value)} placeholder='用户名' />
                <Input type='Password' value={password} onInput={(e) => setPassword(e.target.value)} placeholder='密码' />
                <Button design='Emphasized' onClick={submit} disabled={isLoading}>
                  {isLoading ? '登录中...' : '登录'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
