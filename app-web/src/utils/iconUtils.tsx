import React from 'react'
import {
    AlertOutlined,
    AppstoreOutlined,
    BellOutlined,
    DashboardOutlined,
    FileOutlined,
    FolderOutlined,
    HomeOutlined,
    MenuOutlined,
    QuestionCircleOutlined,
    SafetyOutlined,
    SettingOutlined,
    TeamOutlined,
    ToolOutlined,
    UserOutlined,
} from '@ant-design/icons'

const iconMap: Record<string, React.ReactNode> = {
    DashboardOutlined: <DashboardOutlined/>,
    AlertOutlined: <AlertOutlined/>,
    MenuOutlined: <MenuOutlined/>,
    TeamOutlined: <TeamOutlined/>,
    SafetyOutlined: <SafetyOutlined/>,
    SettingOutlined: <SettingOutlined/>,
    AppstoreOutlined: <AppstoreOutlined/>,
    HomeOutlined: <HomeOutlined/>,
    UserOutlined: <UserOutlined/>,
    BellOutlined: <BellOutlined/>,
    ToolOutlined: <ToolOutlined/>,
    FileOutlined: <FileOutlined/>,
    FolderOutlined: <FolderOutlined/>,
    QuestionCircleOutlined: <QuestionCircleOutlined/>,
}

export function renderIcon(iconName: string | undefined | null): React.ReactNode {
    if (!iconName) {
        return <AppstoreOutlined/>
    }
    return iconMap[iconName] || <QuestionCircleOutlined/>
}

export default iconMap
