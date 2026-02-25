import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Shield, Bell, Users, LogIn } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await login(username, password);
    if (ok) {
      navigate('/');
    }
  };

  const handleLanguageChange = (lng: string) => {
    changeLanguage(lng);
  };

  const currentLang = getCurrentLanguage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4">
      <div className="w-full max-w-5xl grid md:grid-cols-5 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="md:col-span-3 hidden md:block"
          >
            <h1 className="text-3xl font-bold text-sky-600 mb-4">
              {t('login.welcomeTitle')}
            </h1>
            <p className="text-slate-600 mb-6">{t('login.welcomeSubtitle')}</p>
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
            className="md:col-span-2 w-full max-w-md mx-auto md:mx-0"
          >
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>{t('login.title')}</CardTitle>
                <CardDescription>{t('login.subtitle')}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="username">{t('login.username')}</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={t('login.username')}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">{t('login.password')}</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('login.password')}
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    />
                    <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                      {t('login.rememberMe')}
                    </Label>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      t('login.loggingIn')
                    ) : (
                      <>
                        <LogIn className="mr-2 h-4 w-4" />
                        {t('login.submit')}
                      </>
                    )}
                  </Button>

                  <div className="flex justify-center gap-2 pt-4 border-t">
                    <Button
                      type="button"
                      variant={currentLang === 'zh-CN' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleLanguageChange('zh-CN')}
                    >
                      中文
                    </Button>
                    <Button
                      type="button"
                      variant={currentLang === 'en-US' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleLanguageChange('en-US')}
                    >
                      English
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }
