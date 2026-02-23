import {useEffect, useState} from 'react'
import type {TableProps} from 'antd'
import {Button, Card, Form, Input, message, Modal, Popconfirm, Space, Table,} from 'antd'
import {DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined} from '@ant-design/icons'
import {Role, systemApi} from '@/utils/api'

export default function RoleManagement() {
  const [form] = Form.useForm()
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState<Role | null>(null)

  const loadRoles = async () => {
    setLoading(true)
    try {
      const response = await systemApi.getRoles()
      setRoles(response.data || [])
    } catch (error) {
      message.error('加载角色失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRoles()
  }, [])

  const handleAdd = () => {
    setEditingRecord(null)
    setModalVisible(true)
    form.resetFields()
  }

  const handleEdit = (record: Role) => {
    setEditingRecord(record)
    setModalVisible(true)
    form.setFieldsValue(record)
  }

    const handleDelete = async (id: number) => {
    try {
      await systemApi.deleteRole(id)
      message.success('删除成功')
      loadRoles()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleSubmit = async (values: any) => {
    try {
      if (editingRecord) {
        await systemApi.updateRole(editingRecord.id, values)
        message.success('更新成功')
      } else {
        await systemApi.createRole(values)
        message.success('创建成功')
      }
      setModalVisible(false)
      loadRoles()
    } catch (error) {
      message.error(editingRecord ? '更新失败' : '创建失败')
    }
  }

  const columns: TableProps<Role>['columns'] = [
       {
           title: '角色代码',
          dataIndex: 'code',
          key: 'code',
          width: 150,
          render: (code) => <code>{code}</code>,
    },
    {
      title: '角色名称',
      dataIndex: 'name',
      key: 'name',
      width: 180,
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
            description="确定要删除此角色吗？"
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
        title="角色管理"
        extra={
          <Button icon={<ReloadOutlined />} onClick={loadRoles}>
            刷新
          </Button>
        }
      >
        <Space style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增角色
          </Button>
        </Space>
        <Table
          columns={columns}
          dataSource={roles}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
          scroll={{x: 900}}
        />
      </Card>

      <Modal
        title={editingRecord ? '编辑角色' : '新增角色'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="角色代码"
            name="code"
            rules={[{ required: true, message: '请输入角色代码' }]}
            extra="角色代码用于权限判断，建议使用大写英文字母，如：ADMIN, MANAGER"
          >
              <Input placeholder="请输入角色代码，如：ADMIN"/>
          </Form.Item>

          <Form.Item
              label="角色名称"
              name="name"
              rules={[{required: true, message: '请输入角色名称'}]}
          >
              <Input placeholder="请输入角色名称"/>
          </Form.Item>

          <Form.Item label="描述" name="description">
            <Input.TextArea rows={3} placeholder="请输入角色描述" />
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
