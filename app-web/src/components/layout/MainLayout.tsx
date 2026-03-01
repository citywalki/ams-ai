import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Drawer, Layout } from 'antd';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { APP_BODY_HEIGHT } from '@/styles/ui-patterns';

export default function MainLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const nextIsMobile = window.innerWidth < 768;
      setIsMobile(nextIsMobile);
      if (!nextIsMobile) {
        setIsMobileMenuOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMenuToggle = () => {
    if (isMobile) {
      setIsMobileMenuOpen((open) => !open);
      return;
    }
    setIsSidebarCollapsed((collapsed) => !collapsed);
  };

  return (
    <Layout style={{ height: '100vh', background: 'var(--ams-color-bg)' }}>
      <Header onMenuToggle={handleMenuToggle} />
      <Layout style={{ height: APP_BODY_HEIGHT, minHeight: 0, overflow: 'hidden' }}>
        {!isMobile && <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed((v) => !v)} />}
        {isMobile && (
          <Drawer
            open={isMobileMenuOpen}
            closable={false}
            placement="left"
            width={288}
            onClose={() => setIsMobileMenuOpen(false)}
            styles={{ body: { padding: 0 } }}
          >
            <Sidebar isCollapsed={false} onToggle={() => undefined} />
          </Drawer>
        )}
        <Layout.Content style={{ padding: 12, minHeight: 0, overflow: 'hidden' }}>
          <div className="h-full min-h-0 flex flex-col">
            <Outlet />
          </div>
        </Layout.Content>
      </Layout>
    </Layout>
  );
}
