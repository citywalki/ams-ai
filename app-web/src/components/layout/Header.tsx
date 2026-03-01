import { Bell, LogOut, Menu, Search } from 'lucide-react';
import { Avatar, Badge, Button, Dropdown, Input, Layout, Space, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/authStore';

interface HeaderProps {
  onMenuToggle: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <Layout.Header
      style={{
        height: 56,
        lineHeight: '56px',
        background: 'var(--app-color-surface)',
        borderBottom: '1px solid var(--app-color-border)',
        paddingInline: 16,
      }}
    >
      <div className="flex h-full items-center justify-between gap-3">
        <Space align="center" size={12}>
          <Button type="text" icon={<Menu className="h-5 w-5" />} onClick={onMenuToggle} />
          <div className="flex items-center gap-2">
            <Avatar shape="square" style={{ background: 'var(--app-color-primary)' }}>A</Avatar>
            <div className="hidden sm:block leading-tight">
              <Typography.Text strong>AMS</Typography.Text>
              <br />
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {t('layout.systemName')}
              </Typography.Text>
            </div>
          </div>
        </Space>

        <div className="hidden md:block max-w-md flex-1">
          <Input prefix={<Search className="h-4 w-4" />} placeholder={t('layout.search')} />
        </div>

        <Space align="center" size={4}>
          <Badge count={3}>
            <Button type="text" icon={<Bell className="h-5 w-5" />} />
          </Badge>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'logout',
                  label: t('layout.logout'),
                  icon: <LogOut className="h-4 w-4" />,
                  danger: true,
                  onClick: () => void logout(),
                },
              ],
            }}
            trigger={['click']}
          >
            <Button type="text" shape="circle">
              <Avatar>{user?.username?.charAt(0).toUpperCase() || 'U'}</Avatar>
            </Button>
          </Dropdown>
        </Space>
      </div>
    </Layout.Header>
  );
}
