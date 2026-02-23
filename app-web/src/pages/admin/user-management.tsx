import {useEffect, useState} from 'react'
import type {TableProps} from 'antd'
import {
    Button,
    Card,
    Form,
    Input,
    message,
    Modal,
    Popconfirm,
    Select,
    Space,
    Table,
    Tag,
    Radio,
} from 'antd'
import {
    DeleteOutlined,
    EditOutlined,
    KeyOutlined,
    PlusOutlined,
    ReloadOutlined,
    SearchOutlined,
} from '@ant-design/icons'
import {Role, User, UserCreateRequest, UserUpdateRequest, systemApi} from '@/utils/api'

export default function UserManagement() {
    const [form] = Form.useForm()
    const [passwordForm] = Form.useForm()
    const [users, setUsers] = useState<User[]>([])
    const [roles, setRoles] = useState<Role[]>([])
    const [loading, setLoading] = useState(false)
    const [modalVisible, setModalVisible] = useState(false)
    const [passwordModalVisible, setPasswordModalVisible] = useState(false)
    const [editingRecord, setEditingRecord] = useState<User | null>(null)
    const [passwordUserId, setPasswordUserId] = useState<number | null>(null)

    const [searchParams, setSearchParams] = useState({
        username: '',
        email: '',
        status: '',
    })

    const loadUsers = async () => {
        setLoading(true)
        try {
            const params: any = {}
            if (searchParams.username) params.username = searchParams.username
            if (searchParams.email) params.email = searchParams.email
            if (searchParams.status) params.status = searchParams.status

            const response = await systemApi.getUsers(params)
            setUsers(response.data || [])
        } catch (error) {
            message.error('加载用户失败')
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

    useEffect(() => {
        loadUsers()
        loadRoles()
    }, [])

    const handleAdd = () => {
        setEditingRecord(null)
        setModalVisible(true)
        form.resetFields()
        form.setFieldsValue({status: 'ACTIVE'})
    }

    const handleEdit = (record: User) => {
        setEditingRecord(record)
        setModalVisible(true)
        form.setFieldsValue({
            username: record.username,
            email: record.email,
            roleIds: record.roles?.map(r => r.id),
            status: record.status,
        })
    }

    const handleDelete = async (id: number) => {
        try {
            await systemApi.deleteUser(id)
            message.success('删除成功')
            loadUsers()
        } catch (error: any) {
            message.error(error.response?.data?.message || '删除失败')
        }
    }

    const handleSubmit = async (values: any) => {
        try {
            if (editingRecord) {
                const updateData: UserUpdateRequest = {
                    username: values.username,
                    email: values.email,
                    roleIds: values.roleIds,
                    status: values.status,
                }
                await systemApi.updateUser(editingRecord.id, updateData)
                message.success('更新成功')
            } else {
                const createData: UserCreateRequest = {
                    username: values.username,
                    email: values.email,
                    password: values.password,
                    roleIds: values.roleIds,
                    status: values.status,
                }
                await systemApi.createUser(createData)
                message.success('创建成功')
            }
            setModalVisible(false)
            loadUsers()
        } catch (error: any) {
            message.error(error.response?.data?.message || (editingRecord ? '更新失败' : '创建失败'))
        }
    }

    const handleStatusChange = async (id: number, status: string) => {
        try {
            await systemApi.updateUserStatus(id, status)
            message.success('状态更新成功')
            loadUsers()
        } catch (error: any) {
            message.error(error.response?.data?.message || '状态更新失败')
        }
    }

    const handleResetPassword = async (values: {password: string}) => {
        if (!passwordUserId) return
        try {
            await systemApi.resetUserPassword(passwordUserId, values.password)
            message.success('密码重置成功')
            setPasswordModalVisible(false)
            passwordForm.resetFields()
        } catch (error: any) {
            message.error(error.response?.data?.message || '密码重置失败')
        }
    }

    const openPasswordModal = (id: number) => {
        setPasswordUserId(id)
        setPasswordModalVisible(true)
        passwordForm.resetFields()
    }

    const handleSearch = () => {
        loadUsers()
    }

    const handleResetSearch = () => {
        setSearchParams({username: '', email: '', status: ''})
        setTimeout(loadUsers, 0)
    }

    const columns: TableProps<User>['columns'] = [
        {
            title: '用户名',
            dataIndex: 'username',
            key: 'username',
            width: 120,
        },
        {
            title: '邮箱',
            dataIndex: 'email',
            key: 'email',
            width: 180,
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: 80,
            render: (status: string) => (
                <Tag color={status === 'ACTIVE' ? 'green' : 'red'}>
                    {status === 'ACTIVE' ? '启用' : '禁用'}
                </Tag>
            ),
        },
        {
            title: '角色',
            dataIndex: 'roles',
            key: 'roles',
            width: 200,
            render: (roles: User['roles']) => (
                <Space size="small" wrap>
                    {roles?.map(role => (
                        <Tag key={role.id} color="blue">{role.name}</Tag>
                    ))}
                </Space>
            ),
        },
        {
            title: '创建时间',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 160,
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
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        编辑
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        icon={<KeyOutlined />}
                        onClick={() => openPasswordModal(record.id)}
                    >
                        重置密码
                    </Button>
                    {record.status === 'ACTIVE' ? (
                        <Popconfirm
                            title="确认禁用"
                            description="确定要禁用此用户吗？"
                            onConfirm={() => handleStatusChange(record.id, 'INACTIVE')}
                            okText="确认"
                            cancelText="取消"
                        >
                            <Button type="link" size="small" danger>
                                禁用
                            </Button>
                        </Popconfirm>
                    ) : (
                        <Button
                            type="link"
                            size="small"
                            onClick={() => handleStatusChange(record.id, 'ACTIVE')}
                        >
                            启用
                        </Button>
                    )}
                    <Popconfirm
                        title="确认删除"
                        description="确定要删除此用户吗？"
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
        <div style={{padding: '24px'}}>
            <Card
                title="用户管理"
                extra={
                    <Button icon={<ReloadOutlined />} onClick={loadUsers}>
                        刷新
                    </Button>
                }
            >
                <Space style={{marginBottom: 16}} wrap>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                        新增用户
                    </Button>
                </Space>

                <div style={{marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap'}}>
                    <Input
                        placeholder="用户名"
                        value={searchParams.username}
                        onChange={e => setSearchParams({...searchParams, username: e.target.value})}
                        style={{width: 150}}
                        onPressEnter={handleSearch}
                    />
                    <Input
                        placeholder="邮箱"
                        value={searchParams.email}
                        onChange={e => setSearchParams({...searchParams, email: e.target.value})}
                        style={{width: 180}}
                        onPressEnter={handleSearch}
                    />
                    <Select
                        placeholder="状态"
                        value={searchParams.status || undefined}
                        onChange={value => setSearchParams({...searchParams, status: value || ''})}
                        style={{width: 100}}
                        allowClear
                        options={[
                            {value: 'ACTIVE', label: '启用'},
                            {value: 'INACTIVE', label: '禁用'},
                        ]}
                    />
                    <Button icon={<SearchOutlined />} onClick={handleSearch}>
                        搜索
                    </Button>
                    <Button onClick={handleResetSearch}>重置</Button>
                </div>

                <Table
                    columns={columns}
                    dataSource={users}
                    loading={loading}
                    rowKey="id"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `共 ${total} 条`,
                    }}
                    scroll={{x: 1000}}
                />
            </Card>

            <Modal
                title={editingRecord ? '编辑用户' : '新增用户'}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                width={600}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item
                        label="用户名"
                        name="username"
                        rules={[
                            {required: true, message: '请输入用户名'},
                            {min: 3, max: 50, message: '用户名长度3-50字符'},
                            {pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线'},
                        ]}
                    >
                        <Input placeholder="请输入用户名"/>
                    </Form.Item>

                    <Form.Item
                        label="邮箱"
                        name="email"
                        rules={[{type: 'email', message: '邮箱格式不正确'}]}
                    >
                        <Input placeholder="请输入邮箱"/>
                    </Form.Item>

                    {!editingRecord && (
                        <Form.Item
                            label="密码"
                            name="password"
                            rules={[
                                {required: true, message: '请输入密码'},
                                {min: 8, message: '密码长度至少8位'},
                                {
                                    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                                    message: '密码必须包含大小写字母和数字',
                                },
                            ]}
                        >
                            <Input.Password placeholder="请输入密码"/>
                        </Form.Item>
                    )}

                    <Form.Item label="角色" name="roleIds">
                        <Select
                            mode="multiple"
                            placeholder="请选择角色"
                            options={roles.map(r => ({value: r.id, label: r.name}))}
                        />
                    </Form.Item>

                    <Form.Item
                        label="状态"
                        name="status"
                        rules={[{required: true, message: '请选择状态'}]}
                    >
                        <Radio.Group>
                            <Radio value="ACTIVE">启用</Radio>
                            <Radio value="INACTIVE">禁用</Radio>
                        </Radio.Group>
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
                title="重置密码"
                open={passwordModalVisible}
                onCancel={() => setPasswordModalVisible(false)}
                footer={null}
                width={400}
            >
                <Form form={passwordForm} layout="vertical" onFinish={handleResetPassword}>
                    <Form.Item
                        label="新密码"
                        name="password"
                        rules={[
                            {required: true, message: '请输入新密码'},
                            {min: 8, message: '密码长度至少8位'},
                            {
                                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                                message: '密码必须包含大小写字母和数字',
                            },
                        ]}
                    >
                        <Input.Password placeholder="请输入新密码"/>
                    </Form.Item>
                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                确认重置
                            </Button>
                            <Button onClick={() => setPasswordModalVisible(false)}>取消</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}
