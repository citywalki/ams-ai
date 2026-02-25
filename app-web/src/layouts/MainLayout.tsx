import { useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Avatar,
  BusyIndicator,
  Button,
  MessageStrip,
  ShellBar,
  ShellBarItem,
  SideNavigation,
  SideNavigationItem
} from '@ui5/webcomponents-react';
import { useAuthStore } from '@/stores/authStore';
import { useMenus } from '@/contexts/MenuContext';
import type { MenuItem } from '@/services';
import './MainLayout.css';

function flattenMenus(items: MenuItem[]): MenuItem[] {
  return items.flatMap((item) => [item, ...(item.children ? flattenMenus(item.children) : [])]);
}

function getMenuLabel(item: MenuItem): string {
  if (item.name && item.name.trim().length > 0) {
    return item.name;
  }
  if (item.route && item.route !== '/') {
    return item.route.replace(/^\//, '');
  }
  return '首页';
}

function isActivePath(currentPath: string, itemPath: string): boolean {
  if (itemPath === '/') {
    return currentPath === '/';
  }
  return currentPath.startsWith(itemPath);
}

function findBestActiveRoute(items: MenuItem[], currentPath: string): string | null {
  const routes = flattenMenus(items).map((item) => item.route).filter(Boolean);
  const matched = routes
    .filter((route) => isActivePath(currentPath, route))
    .sort((a, b) => b.length - a.length);
  return matched[0] ?? null;
}

function hasActiveDescendant(item: MenuItem, activeRoute: string): boolean {
  if (!item.children || item.children.length === 0) {
    return false;
  }

  return item.children.some((child) => child.route === activeRoute || hasActiveDescendant(child, activeRoute));
}

function renderNavigationItems(
  items: MenuItem[],
  activeRoute: string,
  onClick: (path: string) => void,
  isCollapsed: boolean
): JSX.Element[] {
  return items.map((item) => (
    <SideNavigationItem
      key={item.id}
      text={getMenuLabel(item)}
      icon={item.icon || 'folder'}
      selected={item.route === activeRoute}
      expanded={!isCollapsed && hasActiveDescendant(item, activeRoute)}
      onClick={() => onClick(item.route)}
    >
      {item.children ? renderNavigationItems(item.children, activeRoute, onClick, isCollapsed) : null}
    </SideNavigationItem>
  ));
}

export default function MainLayout() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { menus, isLoading, error } = useMenus();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const syncMobileState = (matches: boolean) => {
      setIsMobile(matches);
      if (!matches) {
        setIsDrawerOpen(false);
      }
    };

    syncMobileState(mediaQuery.matches);

    const onMediaChange = (event: MediaQueryListEvent) => {
      syncMobileState(event.matches);
    };

    mediaQuery.addEventListener('change', onMediaChange);
    return () => {
      mediaQuery.removeEventListener('change', onMediaChange);
    };
  }, []);

  const allMenus = useMemo(() => flattenMenus(menus), [menus]);
  const activeRoute = useMemo(() => findBestActiveRoute(allMenus, location.pathname) ?? '/dashboard', [allMenus, location.pathname]);

  const handleMenuToggle = () => {
    if (isMobile) {
      setIsDrawerOpen((value) => !value);
      return;
    }
    setIsNavCollapsed((value) => !value);
  };

  const handleNavigate = (path: string) => {
    if (location.pathname !== path) {
      navigate(path);
    }
    setMenuOpen(false);
    setIsDrawerOpen(false);
  };

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
  };

  return (
    <div className='fiori-page-root main-layout-root'>
      <ShellBar className='main-layout-shellbar' primaryTitle='Product Name' secondaryTitle={user?.username ?? '用户'}>
        <div slot='logo' className='main-layout-logo'>
          <span className='main-layout-logo-dot' />
        </div>
        <Button slot='startButton' icon='menu2' design='Transparent' onClick={handleMenuToggle} />
        <ShellBarItem icon='search' text='Search' />
        <ShellBarItem icon='process' text='Actions' />
        <ShellBarItem icon='picture' text='Gallery' />
        <ShellBarItem icon='camera' text='Capture' />
        <ShellBarItem icon='settings' text='Settings' />
        <ShellBarItem icon='bell' text='Notifications' />
        <Avatar slot='profile' className='main-layout-profile' icon='employee' onClick={() => setMenuOpen((value) => !value)} />
      </ShellBar>

      {menuOpen ? (
        <div className='main-layout-user-menu'>
          <Button design='Transparent' icon='employee' disabled>
            {user?.username ?? '当前用户'}
          </Button>
          <Button design='Transparent' icon='log' onClick={() => void handleLogout()}>
            退出登录
          </Button>
        </div>
      ) : null}

      {isMobile && isDrawerOpen ? <button className='main-layout-backdrop' type='button' onClick={() => setIsDrawerOpen(false)} /> : null}

      <div className='main-layout-body'>
        <aside
          className={[
            'main-layout-nav',
            isNavCollapsed && !isMobile ? 'main-layout-nav-collapsed' : '',
            isMobile ? 'main-layout-nav-drawer' : '',
            isMobile && isDrawerOpen ? 'main-layout-nav-drawer-open' : ''
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {isLoading ? (
            <div className='main-layout-nav-status'>
              <BusyIndicator active />
            </div>
          ) : null}
          {error ? <MessageStrip design='Negative'>{error}</MessageStrip> : null}
          {!isLoading ? (
            <SideNavigation
              collapsed={isMobile ? false : isNavCollapsed}
              fixedItems={[
                <SideNavigationItem key='quick-links' icon='chain-link' text='Useful Links' onClick={() => handleNavigate('/dashboard')} />,
                <SideNavigationItem key='history' icon='history' text='History' onClick={() => handleNavigate('/dashboard')} />
              ]}
            >
              {renderNavigationItems(menus, activeRoute, handleNavigate, isMobile ? false : isNavCollapsed)}
            </SideNavigation>
          ) : null}
        </aside>

        <section className='main-layout-content'>
          <div className='main-layout-content-panel'>
            <Outlet />
          </div>
        </section>
      </div>
    </div>
  );
}
