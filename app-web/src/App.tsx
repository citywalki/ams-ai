import {useLocation, useNavigate} from 'react-router-dom'
import {ConfigProvider, Layout} from 'antd'
import ShellBar from './components/ShellBar'
import FlexibleColumnLayout from './components/FlexibleColumnLayout'
import Navigation from './components/Navigation'
import fioriTheme from './theme/fioriTheme'
import {useMenus} from './contexts/MenuContext'

const { Content } = Layout

interface AppLayoutProps {
  children: React.ReactNode
}

function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
    const {findMenuByRoute, findMenuByKey} = useMenus()

  const getActiveKey = () => {
      const menu = findMenuByRoute(location.pathname)
      return menu?.key || 'dashboard'
  }

    const handleNavigate = (key: string, route?: string) => {
        if (route) {
            navigate(route)
        } else {
            const menu = findMenuByKey(key)
            if (menu?.route) {
                navigate(menu.route)
            } else {
                navigate('/dashboard')
            }
        }
  }

  return (
    <ConfigProvider theme={fioriTheme}>
      <Layout style={{ height: '100vh', overflow: 'hidden' }}>
        <ShellBar appName="AMS-AI" />
        <FlexibleColumnLayout
          sidebar={<Navigation activeKey={getActiveKey()} onNavigate={handleNavigate} />}
        >
          <Content>{children}</Content>
        </FlexibleColumnLayout>
      </Layout>
    </ConfigProvider>
  )
}

export default AppLayout
