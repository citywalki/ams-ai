import {useEffect, useState} from 'react'
import type {TableProps} from 'antd'
import {
    Button,
    Card,
    Form,
    Input,
    InputNumber,
    message,
    Modal,
    Popconfirm,
    Select,
    Space,
    Switch,
    Table,
    Tag,
} from 'antd'
import {DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined, SafetyOutlined} from '@ant-design/icons'
import {Menu, Permission, Role, systemApi} from '@/utils/api'
import MenuTree from '@/components/MenuTree'

const BUTTON_TYPES = [
    {label: '默认', value: 'DEFAULT'},
    {label: '主要', value: 'PRIMARY'},
    {label: '危险', value: 'DANGER'},
]

const MENU_TYPES = [
    {label: '文件夹', value: 'FOLDER'},
    {label: '菜单', value: 'MENU'},
]

export default function MenuManagement() {
  const [form] = Form.useForm()
  const [permissionForm] = Form.useForm()
  const [menus, setMenus] = useState<Menu[]>([])
    const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState<Menu | null>(null)

    const [permissionModalVisible, setPermissionModalVisible] = useState(false)
    const [currentMenu, setCurrentMenu] = useState<Menu | null>(null)
    const [permissions, setPermissions] = useState<Permission[]>([])
    const [permissionLoading, setPermissionLoading] = useState(false)
    const [editingPermission, setEditingPermission] = useState<Permission | null>(null)
    const [permissionFormModalVisible, setPermissionFormModalVisible] = useState(false)
    const [permissionCodeSuffix, setPermissionCodeSuffix] = useState('')
    const [selectedParentId, setSelectedParentId] = useState<number | null>(null)

  const loadMenus = async (parentId: number | null = selectedParentId) => {
    setLoading(true)
    try {
      const params = parentId !== null ? {parentId} : {}
      const response = await systemApi.getMenus(params)
        setMenus(response.data || [])
    } catch (error) {
      message.error('加载菜单失败')
    } finally {
      setLoading(false)
    }
  }

    const loadRoles = async () => {
        try {
            const response = await systemApi.getRoles()
            setRoles(response.data || [])
        } catch (error) {
            console.error('加载角色失败', error)
        }
    }

    const handleTreeSelect = (parentId: number | null) => {
        setSelectedParentId(parentId)
        loadMenus(parentId)
    }

  useEffect(() => {
    loadMenus()
      loadRoles()
  }, [])

    const handleManagePermissions = async (menu: Menu) => {
        setCurrentMenu(menu)
        setPermissionModalVisible(true)
        await loadPermissions(menu.id)
    }

    const loadPermissions = async (menuId: number) => {
        setPermissionLoading(true)
        try {
            const response = await systemApi.getMenuPermissions(menuId)
            setPermissions(response.data || [])
        } catch (error) {
            message.error('加载权限失败')
        } finally {
            setPermissionLoading(false)
        }
    }

    const handleAddPermission = () => {
        setEditingPermission(null)
        setPermissionFormModalVisible(true)
        setPermissionCodeSuffix('')
        permissionForm.resetFields()
        permissionForm.setFieldsValue({
            sortOrder: 0,
            buttonType: 'DEFAULT',
            menuId: currentMenu?.id,
        })
    }

    const handleEditPermission = (record: Permission) => {
        setEditingPermission(record)
        setPermissionFormModalVisible(true)
        const prefix = currentMenu?.key ? `${currentMenu.key}:` : ''
        const suffix = record.code?.startsWith(prefix) ? record.code.slice(prefix.length) : record.code
        setPermissionCodeSuffix(suffix)
        permissionForm.setFieldsValue({...record})
    }

    const handleDeletePermission = async (id: number) => {
        try {
            await systemApi.deletePermission(id)
            message.success('删除成功')
            if (currentMenu) {
                loadPermissions(currentMenu.id)
            }
        } catch (error) {
            message.error('删除失败')
        }
    }

    const handleSubmitPermission = async (values: any) => {
        try {
            const prefix = currentMenu?.key ? `${currentMenu.key}:` : ''
            const fullCode = prefix + permissionCodeSuffix
            const data = {...values, code: fullCode, menuId: currentMenu?.id}
            if (editingPermission) {
                await systemApi.updatePermission(editingPermission.id, data)
                message.success('更新成功')
            } else {
                await systemApi.createPermission(data)
                message.success('创建成功')
            }
            setPermissionFormModalVisible(false)
            if (currentMenu) {
                loadPermissions(currentMenu.id)
            }
        } catch (error) {
            message.error(editingPermission ? '更新失败' : '创建失败')
        }
    }

    const getButtonTypeTag = (buttonType: string) => {
        const colors: Record<string, string> = {
            DEFAULT: 'default',
            PRIMARY: 'blue',
            DANGER: 'red',
        }
        const labels: Record<string, string> = {
            DEFAULT: '默认',
            PRIMARY: '主要',
            DANGER: '危险',
        }
        return <Tag color={colors[buttonType] || 'default'}>{labels[buttonType] || buttonType}</Tag>
    }

    const permissionColumns: TableProps<Permission>['columns'] = [
        {
            title: '权限代码',
            dataIndex: 'code',
            key: 'code',
            width: 180,
            render: (code) => <code>{code}</code>,
        },
        {
            title: '权限名称',
            dataIndex: 'name',
            key: 'name',
            width: 120,
        },
        {
            title: '按钮类型',
            dataIndex: 'buttonType',
            key: 'buttonType',
            width: 100,
            render: (buttonType) => buttonType ? getButtonTypeTag(buttonType) : '-',
        },
        {
            title: '排序',
            dataIndex: 'sortOrder',
            key: 'sortOrder',
            width: 80,
        },
        {
            title: '描述',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
        },
        {
            title: '操作',
            key: 'action',
            width: 150,
            fixed: 'right',
            render: (_, record) => (
                <Space>
                    <Button
                        type="link"
                        size="small"
                        icon={<EditOutlined/>}
                        onClick={() => handleEditPermission(record)}
                    >
                        编辑
                    </Button>
                    <Popconfirm
                        title="确认删除"
                        description="确定要删除此权限吗？"
                        onConfirm={() => handleDeletePermission(record.id)}
                        okText="确认"
                        cancelText="取消"
                    >
                        <Button type="link" size="small" danger icon={<DeleteOutlined/>}>
                            删除
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ]

  const handleAdd = () => {
    setEditingRecord(null)
    setModalVisible(true)
    form.resetFields()
      form.setFieldsValue({isVisible: true, sortOrder: 0, rolesAllowed: [], menuType: 'MENU'})
  }

  const handleEdit = (record: Menu) => {
    setEditingRecord(record)
    setModalVisible(true)
      form.setFieldsValue({
          ...record,
          rolesAllowed: record.rolesAllowed || [],
      })
  }

    const handleDelete = async (id: number) => {
    try {
      await systemApi.deleteMenu(id)
      message.success('删除成功')
      loadMenus()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleSubmit = async (values: any) => {
    try {
      if (editingRecord) {
        await systemApi.updateMenu(editingRecord.id, values)
        message.success('更新成功')
      } else {
        await systemApi.createMenu(values)
        message.success('创建成功')
      }
      setModalVisible(false)
      loadMenus()
    } catch (error) {
      message.error(editingRecord ? '更新失败' : '创建失败')
    }
  }

    const getVisibilityTag = (isVisible: boolean) => {
        return isVisible
            ? <Tag color="green">可见</Tag>
            : <Tag color="red">隐藏</Tag>
    }

    const getRolesTags = (rolesAllowed: string[]) => {
        if (!rolesAllowed || rolesAllowed.length === 0) {
            return <Tag>所有角色</Tag>
        }
        return (
            <>
                {rolesAllowed.map(role => (
                    <Tag key={role} color="blue">{role}</Tag>
                ))}
            </>
        )
  }

  const columns: TableProps<Menu>['columns'] = [
      {
          title: '标识符',
          dataIndex: 'key',
          key: 'key',
      width: 120,
    },
    {
      title: '名称',
        dataIndex: 'label',
        key: 'label',
      width: 150,
    },
    {
        title: '路由',
        dataIndex: 'route',
        key: 'route',
        width: 180,
        ellipsis: true,
    },
    {
      title: '图标',
      dataIndex: 'icon',
      key: 'icon',
      width: 120,
    },
    {
      title: '类型',
      dataIndex: 'menuType',
      key: 'menuType',
      width: 100,
      render: (menuType) => (
        <Tag color={menuType === 'FOLDER' ? 'blue' : 'green'}>
          {menuType === 'FOLDER' ? '文件夹' : '菜单'}
        </Tag>
      ),
    },
    {
      title: '排序',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 80,
    },
    {
        title: '可见',
        dataIndex: 'isVisible',
        key: 'isVisible',
        width: 80,
        render: (isVisible) => getVisibilityTag(isVisible),
    },
    {
        title: '允许角色',
        dataIndex: 'rolesAllowed',
        key: 'rolesAllowed',
        width: 200,
        render: (rolesAllowed) => getRolesTags(rolesAllowed),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<SafetyOutlined/>}
            onClick={() => handleManagePermissions(record)}
          >
            权限
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除"
            description="确定要删除此菜单吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确认"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div style={{padding: '24px', height: 'calc(100vh - 64px)', overflow: 'hidden'}}>
      <div style={{display: 'flex', gap: 16, height: '100%'}}>
        <Card
            title="菜单目录"
            style={{width: 240, flexShrink: 0, overflow: 'auto'}}
            styles={{body: {padding: 0}}}
        >
          <MenuTree
              onSelect={handleTreeSelect}
              selectedKey={selectedParentId !== null ? String(selectedParentId) : 'all'}
          />
        </Card>

        <Card
          title={selectedParentId !== null ? '子菜单列表' : '菜单管理'}
          extra={
            <Button icon={<ReloadOutlined/>} onClick={() => loadMenus()}>
              刷新
            </Button>
          }
          style={{flex: 1, overflow: 'auto'}}
        >
          <Space style={{marginBottom: 16}}>
            <Button type="primary" icon={<PlusOutlined/>} onClick={handleAdd}>
              新增菜单
            </Button>
          </Space>
          <Table
            columns={columns}
            dataSource={menus}
            loading={loading}
            rowKey="id"
            childrenColumnName="none"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条`,
            }}
            scroll={{x: 1300}}
          />
        </Card>
      </div>

      <Modal
        title={editingRecord ? '编辑菜单' : '新增菜单'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
                label="菜单标识符"
                name="key"
                rules={[{required: true, message: '请输入菜单标识符'}]}
            >
                <Input placeholder="请输入菜单标识符，如：dashboard"/>
            </Form.Item>

          <Form.Item
            label="菜单名称"
            name="label"
            rules={[{ required: true, message: '请输入菜单名称' }]}
          >
            <Input placeholder="请输入菜单名称" />
          </Form.Item>

          <Form.Item
              label="菜单类型"
              name="menuType"
              initialValue="MENU"
              rules={[{required: true, message: '请选择菜单类型'}]}
          >
              <Select options={MENU_TYPES}/>
          </Form.Item>

          <Form.Item label="父级ID" name="parentId">
              <InputNumber style={{width: '100%'}} placeholder="请输入父级菜单ID"/>
          </Form.Item>

            <Form.Item label="路由路径" name="route">
            <Input placeholder="请输入路由路径，如：/dashboard" />
          </Form.Item>

          <Form.Item label="图标" name="icon">
            <Input placeholder="请输入图标名称，如：DashboardOutlined" />
          </Form.Item>

            <Form.Item label="排序" name="sortOrder" initialValue={0}>
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入排序值" />
          </Form.Item>

          <Form.Item
              label="是否可见"
              name="isVisible"
              valuePropName="checked"
              initialValue={true}
          >
              <Switch checkedChildren="可见" unCheckedChildren="隐藏"/>
          </Form.Item>

            <Form.Item
                label="允许访问的角色"
                name="rolesAllowed"
                extra="不选择任何角色表示所有角色都可访问"
            >
                <Select
                    mode="multiple"
                    placeholder="选择允许访问的角色"
                    options={roles.map(r => ({label: r.name, value: r.code}))}
                    allowClear
                />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingRecord ? '更新' : '创建'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

        <Modal
            title={`权限管理 - ${currentMenu?.label || ''}`}
            open={permissionModalVisible}
            onCancel={() => {
                setPermissionModalVisible(false)
                setCurrentMenu(null)
                setPermissions([])
            }}
            footer={null}
            width={900}
        >
            <Space style={{marginBottom: 16}}>
                <Button type="primary" icon={<PlusOutlined/>} onClick={handleAddPermission}>
                    新增权限
                </Button>
                <Button
                    icon={<ReloadOutlined/>}
                    onClick={() => currentMenu && loadPermissions(currentMenu.id)}
                >
                    刷新
                </Button>
            </Space>
            <Table
                columns={permissionColumns}
                dataSource={permissions}
                loading={permissionLoading}
                rowKey="id"
                pagination={{
                    pageSize: 5,
                    showSizeChanger: true,
                    showTotal: (total) => `共 ${total} 条`,
                }}
                scroll={{x: 800}}
            />
        </Modal>

        <Modal
            title={editingPermission ? '编辑权限' : '新增权限'}
            open={permissionFormModalVisible}
            onCancel={() => setPermissionFormModalVisible(false)}
            footer={null}
            width={600}
        >
            <Form form={permissionForm} layout="vertical" onFinish={handleSubmitPermission}>
                <Form.Item
                    label="权限代码"
                    required
                    extra="前缀已自动填充，只需输入操作名"
                >
                    <Input
                        addonBefore={currentMenu?.key ? `${currentMenu.key}:` : ''}
                        value={permissionCodeSuffix}
                        onChange={(e) => setPermissionCodeSuffix(e.target.value)}
                        placeholder="create"
                    />
                </Form.Item>

                <Form.Item
                    label="权限名称"
                    name="name"
                    rules={[{required: true, message: '请输入权限名称'}]}
                >
                    <Input placeholder="请输入权限名称"/>
                </Form.Item>

                <Form.Item
                    label="按钮类型"
                    name="buttonType"
                    initialValue="DEFAULT"
                >
                    <Select options={BUTTON_TYPES}/>
                </Form.Item>

                <Form.Item
                    label="排序"
                    name="sortOrder"
                    initialValue={0}
                >
                    <InputNumber min={0} style={{width: '100%'}} placeholder="显示顺序"/>
                </Form.Item>

                <Form.Item label="描述" name="description">
                    <Input.TextArea rows={3} placeholder="请输入权限描述"/>
                </Form.Item>

                <Form.Item>
                    <Space>
                        <Button type="primary" htmlType="submit">
                            {editingPermission ? '更新' : '创建'}
                        </Button>
                        <Button onClick={() => setPermissionFormModalVisible(false)}>取消</Button>
                    </Space>
                </Form.Item>
            </Form>
        </Modal>
    </div>
  )
}
