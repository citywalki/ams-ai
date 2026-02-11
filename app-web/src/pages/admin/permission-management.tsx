import {useEffect, useState} from 'react'
import type {TableProps} from 'antd'
import {Button, Card, Form, Input, InputNumber, message, Modal, Popconfirm, Select, Space, Table, Tag,} from 'antd'
import {DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined} from '@ant-design/icons'
import {Menu, Permission, systemApi} from '@/utils/api'

const BUTTON_TYPES = [
    {label: '默认', value: 'DEFAULT'},
    {label: '主要', value: 'PRIMARY'},
    {label: '危险', value: 'DANGER'},
]

export default function PermissionManagement() {
  const [form] = Form.useForm()
  const [permissions, setPermissions] = useState<Permission[]>([])
    const [menus, setMenus] = useState<Menu[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState<Permission | null>(null)

  const loadPermissions = async () => {
    setLoading(true)
    try {
      const response = await systemApi.getPermissions()
      setPermissions(response.data.data || [])
    } catch (error) {
      message.error('加载权限失败')
    } finally {
      setLoading(false)
    }
  }

    const loadMenus = async () => {
        try {
            const response = await systemApi.getMenus()
            setMenus(response.data || [])
        } catch (error) {
            console.error('加载菜单失败', error)
        }
    }

  useEffect(() => {
    loadPermissions()
      loadMenus()
  }, [])

  const handleAdd = () => {
    setEditingRecord(null)
    setModalVisible(true)
    form.resetFields()
      form.setFieldsValue({sortOrder: 0, buttonType: 'DEFAULT'})
  }

  const handleEdit = (record: Permission) => {
    setEditingRecord(record)
    setModalVisible(true)
      form.setFieldsValue({
          ...record,
          menuId: record.menuId || undefined,
      })
  }

    const handleDelete = async (id: number) => {
    try {
      await systemApi.deletePermission(id)
      message.success('删除成功')
      loadPermissions()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleSubmit = async (values: any) => {
    try {
      if (editingRecord) {
        await systemApi.updatePermission(editingRecord.id, values)
        message.success('更新成功')
      } else {
        await systemApi.createPermission(values)
        message.success('创建成功')
      }
      setModalVisible(false)
      loadPermissions()
    } catch (error) {
      message.error(editingRecord ? '更新失败' : '创建失败')
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

  const columns: TableProps<Permission>['columns'] = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
        width: 80,
    },
    {
      title: '权限代码',
      dataIndex: 'code',
      key: 'code',
      width: 200,
        render: (code) => <code>{code}</code>,
    },
    {
      title: '权限名称',
      dataIndex: 'name',
      key: 'name',
        width: 150,
    },
      {
          title: '所属菜单',
          dataIndex: 'menuName',
          key: 'menuName',
          width: 150,
          render: (menuName) => menuName || <Tag>全局</Tag>,
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
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
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
            description="确定要删除此权限吗？"
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
        title="权限管理"
        extra={
          <Button icon={<ReloadOutlined />} onClick={loadPermissions}>
            刷新
          </Button>
        }
      >
        <Space style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增权限
          </Button>
        </Space>
        <Table
          columns={columns}
          dataSource={permissions}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
          scroll={{x: 1200}}
        />
      </Card>

      <Modal
        title={editingRecord ? '编辑权限' : '新增权限'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="权限代码"
            name="code"
            rules={[{ required: true, message: '请输入权限代码' }]}
            extra="命名规范: {菜单code}:{操作}，如: alerts:create, users:delete"
          >
              <Input placeholder="请输入权限代码，如：alerts:create"/>
          </Form.Item>

          <Form.Item
            label="权限名称"
            name="name"
            rules={[{ required: true, message: '请输入权限名称' }]}
          >
            <Input placeholder="请输入权限名称" />
          </Form.Item>

            <Form.Item
                label="所属菜单"
                name="menuId"
                extra="选择菜单后，该权限将作为该菜单下的按钮权限"
            >
                <Select
                    placeholder="选择所属菜单（可选）"
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    options={menus.map(m => ({label: `${m.label} (${m.key})`, value: m.id}))}
                />
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
            <Input.TextArea rows={3} placeholder="请输入权限描述" />
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
