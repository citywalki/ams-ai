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
import {DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined} from '@ant-design/icons'
import {Menu, Role, systemApi} from '@/utils/api'

export default function MenuManagement() {
  const [form] = Form.useForm()
  const [menus, setMenus] = useState<Menu[]>([])
    const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState<Menu | null>(null)

  const loadMenus = async () => {
    setLoading(true)
    try {
      const response = await systemApi.getMenus()
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
            setRoles(response.data?.data || [])
        } catch (error) {
            console.error('加载角色失败', error)
        }
    }

  useEffect(() => {
    loadMenus()
      loadRoles()
  }, [])

  const handleAdd = () => {
    setEditingRecord(null)
    setModalVisible(true)
    form.resetFields()
      form.setFieldsValue({isVisible: true, sortOrder: 0, rolesAllowed: []})
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
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
        width: 80,
    },
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
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space>
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
    <div style={{ padding: '24px' }}>
      <Card
        title="菜单管理"
        extra={
          <Button icon={<ReloadOutlined />} onClick={loadMenus}>
            刷新
          </Button>
        }
      >
        <Space style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增菜单
          </Button>
        </Space>
        <Table
          columns={columns}
          dataSource={menus}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

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
    </div>
  )
}
