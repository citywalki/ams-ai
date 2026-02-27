import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Shield, Bell, Users, LogIn } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  FormItem,
  FormLabel,
  FormControl,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Label } from '@/components/ui/label';
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

  const currentLang = getCurrentLanguage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4">
      <div className="w-full max-w-5xl flex gap-8 items-stretch">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1 hidden md:flex flex-col justify-center"
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
            className="w-full max-w-md flex items-center"
          >
            <Card className="shadow-xl w-full bg-white/90 backdrop-blur">
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

                  <FormItem>
                    <FormLabel required>{t('login.username')}</FormLabel>
                    <FormControl>
                      <Input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder={t('login.username')}
                        required
                      />
                    </FormControl>
                  </FormItem>

                  <FormItem>
                    <FormLabel required>{t('login.password')}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t('login.password')}
                        required
                      />
                    </FormControl>
                  </FormItem>

                  <div className="flex items-center justify-between">
                    <FormItem className="flex items-center gap-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={rememberMe}
                          onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                        />
                      </FormControl>
                      <Label className="text-sm font-normal cursor-pointer">{t('login.rememberMe')}</Label>
                    </FormItem>
                    <ToggleGroup
                      type="single"
                      value={currentLang}
                      onValueChange={(value) => {
                        if (value) changeLanguage(value);
                      }}
                      variant="outline"
                      size="xs"
                    >
                      <ToggleGroupItem value="zh-CN">
                        中文
                      </ToggleGroupItem>
                      <ToggleGroupItem value="en-US">
                        EN
                      </ToggleGroupItem>
                    </ToggleGroup>
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
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }
