import { Layout, Menu, Skeleton } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMenus } from '@/contexts/MenuContext';
import { convertToAntdMenu } from '@/lib/utils';

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

export default function Sidebar({ collapsed, onCollapse }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { menus, isLoading, error } = useMenus();

  const menuItems = convertToAntdMenu(menus);

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      style={{ background: '#001529' }}
      width={220}
      theme="dark"
    >
      {isLoading ? (
        <div style={{ padding: 16 }}>
          <Skeleton active />
        </div>
      ) : error ? (
        <div style={{ padding: 16, color: '#ff4d4f' }}>{error}</div>
      ) : (
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ background: '#001529' }}
        />
      )}
    </Sider>
  );
}
