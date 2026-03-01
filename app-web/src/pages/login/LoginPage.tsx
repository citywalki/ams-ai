import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Bell, LogIn, Shield, Users } from 'lucide-react';
import { Alert, Button, Card, Checkbox, Form, Input, Space, Typography } from 'antd';
import { useAuthStore } from '@/stores/authStore';
import { changeLanguage, getCurrentLanguage } from '@/i18n';

const features = [
  { icon: Bell, key: 'feature1' },
  { icon: Shield, key: 'feature2' },
  { icon: Users, key: 'feature3' },
];

export default function LoginPage() {
  const { t } = useTranslation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Admin123!');
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const ok = await login(username, password);
    if (ok) {
      navigate('/');
    }
  };

  const currentLang = getCurrentLanguage();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4">
      <div className="flex w-full max-w-5xl items-stretch gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden flex-1 flex-col justify-center md:flex"
        >
          <h1 className="mb-4 text-3xl font-bold text-sky-600">{t('login.welcomeTitle')}</h1>
          <p className="mb-6 text-slate-600">{t('login.welcomeSubtitle')}</p>
          <ul className="space-y-3">
            {features.map((feature, index) => (
              <motion.li
                key={feature.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * (index + 1), duration: 0.3 }}
                className="flex items-center gap-3 text-slate-700"
              >
                <feature.icon className="h-5 w-5 text-sky-500" />
                <span>{t(`login.${feature.key}`)}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex w-full max-w-md items-center"
        >
          <Card className="w-full shadow-xl" styles={{ body: { paddingTop: 12 } }}>
            <Typography.Title level={4} style={{ marginBottom: 2 }}>
              {t('login.title')}
            </Typography.Title>
            <Typography.Paragraph type="secondary">{t('login.subtitle')}</Typography.Paragraph>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <Alert type="error" showIcon message={error} />}

              <Form.Item label={t('login.username')} required>
                <Input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder={t('login.username')}
                  required
                />
              </Form.Item>

              <Form.Item label={t('login.password')} required>
                <Input.Password
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={t('login.password')}
                  required
                />
              </Form.Item>

              <div className="flex items-center justify-between">
                <Checkbox checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)}>
                  {t('login.rememberMe')}
                </Checkbox>
                <Space.Compact size="small">
                  <Button
                    type={currentLang === 'zh-CN' ? 'primary' : 'default'}
                    onClick={() => changeLanguage('zh-CN')}
                  >
                    {t('common.zh')}
                  </Button>
                  <Button
                    type={currentLang === 'en-US' ? 'primary' : 'default'}
                    onClick={() => changeLanguage('en-US')}
                  >
                    {t('common.en')}
                  </Button>
                </Space.Compact>
              </div>

              <Button type="primary" htmlType="submit" block loading={isLoading}>
                {!isLoading && <LogIn className="mr-2 inline h-4 w-4" />}
                {isLoading ? t('login.loggingIn') : t('login.submit')}
              </Button>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
