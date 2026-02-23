import {useEffect, useState} from 'react'
import {Tree, Spin} from 'antd'
import {FolderOutlined} from '@ant-design/icons'
import type {DataNode, TreeProps} from 'antd/es/tree'
import {Menu, systemApi} from '@/utils/api'

interface MenuTreeProps {
  onSelect: (parentId: number | null) => void
  selectedKey?: string
}

export default function MenuTree({onSelect, selectedKey}: MenuTreeProps) {
  const [loading, setLoading] = useState(false)
  const [treeData, setTreeData] = useState<DataNode[]>([])

  const loadFolders = async () => {
    setLoading(true)
    try {
      const response = await systemApi.getMenuFolders()
      const folderList = response.data || []
      setTreeData(buildTreeData(folderList))
    } catch (error) {
      console.error('加载文件夹失败', error)
    } finally {
      setLoading(false)
    }
  }

  const buildTreeData = (items: Menu[]): DataNode[] => {
    const map = new Map<number, Menu>()
    const roots: Menu[] = []

    items.forEach(item => {
      map.set(item.id, item)
    })

    items.forEach(item => {
      if (item.parentId && map.has(item.parentId)) {
      } else {
        roots.push(item)
      }
    })

    const buildNode = (menu: Menu): DataNode => {
      const children = items.filter(m => m.parentId === menu.id)
      return {
        key: String(menu.id),
        title: menu.label,
        icon: <FolderOutlined />,
        children: children.length > 0 ? children.map(buildNode) : undefined,
      }
    }

    return [
      {
        key: 'all',
        title: '全部菜单',
        icon: <FolderOutlined />,
        children: roots.map(buildNode),
      },
    ]
  }

  useEffect(() => {
    loadFolders()
  }, [])

  const handleSelect: TreeProps['onSelect'] = (selectedKeys) => {
    if (selectedKeys.length === 0) return
    const key = selectedKeys[0] as string
    if (key === 'all') {
      onSelect(null)
    } else {
      onSelect(Number(key))
    }
  }

  if (loading) {
    return <Spin style={{marginLeft: 12, marginTop: 12}} />
  }

  return (
    <Tree
      showIcon
      defaultExpandAll
      selectedKeys={selectedKey ? [selectedKey] : ['all']}
      treeData={treeData}
      onSelect={handleSelect}
      style={{padding: 12}}
    />
  )
}
