import { ReactNode } from 'react'
import { Layout, Menu, Typography, Space, Dropdown } from 'antd'
import { UserOutlined, SettingOutlined, BellOutlined, LogoutOutlined } from '@ant-design/icons'
import { useAuthStore } from '@/stores/authStore'

const { Header } = Layout
const { Title } = Typography

interface ShellBarProps {
  appName?: string
  onMenuClick?: (key: string) => void
  children?: ReactNode
}

export default function ShellBar({ appName = 'AMS-AI', onMenuClick, children }: ShellBarProps) {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  const menuItems = [
    {
      key: 'notifications',
      icon: <BellOutlined />,
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
    },
  ]

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: user?.username || '用户',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
    },
  ]

  const handleUserMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      logout()
    }
  }

  return (
    <Header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        background: '#0A6ED1',
        height: 48,
      }}
    >
      <Space align="center">
        <Title
          level={5}
          style={{
            color: '#FFFFFF',
            margin: 0,
            fontWeight: 600,
          }}
        >
          {appName}
        </Title>
      </Space>
      <Space align="center">
        {children || (
          <Menu
            theme="dark"
            mode="horizontal"
            items={menuItems}
            onClick={({ key }) => onMenuClick?.(key)}
            style={{
              background: 'transparent',
              border: 'none',
              lineHeight: '48px',
            }}
          />
        )}
        <Dropdown
          menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
          placement="bottomRight"
          trigger={['click']}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            padding: '8px 12px',
            borderRadius: '4px',
            transition: 'background 0.2s',
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
            }}
          >
            <UserOutlined style={{ color: '#fff', fontSize: '18px' }} />
          </div>
        </Dropdown>
      </Space>
    </Header>
  )
}
