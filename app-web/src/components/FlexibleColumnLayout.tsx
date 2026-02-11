import { ReactNode } from 'react'
import { Layout } from 'antd'

const { Content, Sider } = Layout

interface FlexibleColumnLayoutProps {
  children?: ReactNode
  sidebar?: ReactNode
  sidebarWidth?: number
}

export default function FlexibleColumnLayout({
  children,
  sidebar,
  sidebarWidth = 280,
}: FlexibleColumnLayoutProps) {
  return (
    <Layout
      style={{
        height: 'calc(100vh - 48px)',
        background: '#F5F6F7',
        overflow: 'hidden',
      }}
    >
      {sidebar && (
        <Sider
          width={sidebarWidth}
          style={{
            background: '#FFFFFF',
            borderRight: '1px solid #E0E0E0',
            overflow: 'auto',
            height: '100%',
          }}
        >
          {sidebar}
        </Sider>
      )}
      <Content
        style={{
          padding: '24px',
          background: '#F5F6F7',
          overflow: 'auto',
          height: '100%',
        }}
      >
        {children}
      </Content>
    </Layout>
  )
}
