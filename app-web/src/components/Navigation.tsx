import type {MenuProps} from 'antd'
import {Menu, Spin} from 'antd'
import {useMenus} from '@/contexts/MenuContext'
import {renderIcon} from '@/utils/iconUtils'
import type {Menu as MenuType} from '@/utils/api'

interface NavigationProps {
  activeKey: string
    onNavigate: (key: string, route?: string) => void
}

export default function Navigation({ activeKey, onNavigate }: NavigationProps) {
    const {menus, loading} = useMenus()

    if (loading) {
        return <div style={{display: 'flex', justifyContent: 'center', padding: '20px'}}><Spin/></div>
    }

    const convertMenusToItems = (menuList: MenuType[]): MenuProps['items'] => {
        return menuList
            .filter(menu => menu.isVisible !== false)
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
            .map(menu => {
                const item: any = {
                    key: menu.key,
                    icon: renderIcon(menu.icon),
                    label: menu.label,
                }

                if (menu.children && menu.children.length > 0) {
                    item.children = convertMenusToItems(menu.children)
                }

                return item
            })
    }

    const menuItems = convertMenusToItems(menus)

    const handleMenuClick = ({key}: { key: string }) => {
        const findMenu = (menuList: MenuType[]): MenuType | undefined => {
            for (const menu of menuList) {
                if (menu.key === key) return menu
                if (menu.children) {
                    const found = findMenu(menu.children)
                    if (found) return found
                }
            }
            return undefined
        }

        const menu = findMenu(menus)
        onNavigate(key, menu?.route)
    }

  return (
    <Menu
      mode="inline"
      selectedKeys={[activeKey]}
      items={menuItems}
      onClick={handleMenuClick}
      style={{ height: '100%', borderRight: 0 }}
    />
  )
}
