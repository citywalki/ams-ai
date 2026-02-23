import React, { useEffect, useState } from 'react'
import {
    Button,
    Card,
    Col,
    Form,
    Input,
    message,
    Modal,
    Row,
    Space,
    Table,
    Tag,
    Tree,
    InputNumber,
    Select,
} from 'antd'
import {
    DeleteOutlined,
    EditOutlined,
    FolderOutlined,
    PlusOutlined,
} from '@ant-design/icons'
import type { DataNode } from 'antd/es/tree'
import type { ColumnsType } from 'antd/es/table'
import { dictApi, DictCategory, DictItem, DictCategoryDto, DictItemDto } from '@/utils/api'

const DictManagement: React.FC = () => {
    const [categories, setCategories] = useState<DictCategory[]>([])
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
    const [items, setItems] = useState<DictItem[]>([])
    const [loading, setLoading] = useState(false)
    const [categoryModalVisible, setCategoryModalVisible] = useState(false)
    const [itemModalVisible, setItemModalVisible] = useState(false)
    const [editingCategory, setEditingCategory] = useState<DictCategory | null>(null)
    const [editingItem, setEditingItem] = useState<DictItem | null>(null)
    const [categoryForm] = Form.useForm()
    const [itemForm] = Form.useForm()

    useEffect(() => {
        loadCategories()
    }, [])

    useEffect(() => {
        if (selectedCategoryId) {
            loadItems(selectedCategoryId)
        }
    }, [selectedCategoryId])

    const loadCategories = async () => {
        setLoading(true)
        try {
            const response = await dictApi.getCategories()
            const data = response.data || []
            setCategories(data)
            if (data.length > 0 && !selectedCategoryId) {
                setSelectedCategoryId(data[0].id)
            }
        } catch {
            message.error('加载分类失败')
        } finally {
            setLoading(false)
        }
    }

    const loadItems = async (categoryId: number) => {
        setLoading(true)
        try {
            const response = await dictApi.getCategoryItems(categoryId)
            setItems(response.data || [])
        } catch {
            message.error('加载字典项失败')
        } finally {
            setLoading(false)
        }
    }

    const treeData: DataNode[] = [
        {
            title: '全部分类',
            key: 'root',
            icon: <FolderOutlined />,
            children: categories.map((c) => ({
                title: `${c.name} (${c.itemCount || 0})`,
                key: c.id.toString(),
                icon: <FolderOutlined />,
            })),
        },
    ]

    const itemColumns: ColumnsType<DictItem> = [
        { title: '编码', dataIndex: 'code', width: 120 },
        { title: '名称', dataIndex: 'name', width: 150 },
        { title: '值', dataIndex: 'value', width: 150, ellipsis: true },
        { title: '排序', dataIndex: 'sort', width: 80 },
        {
            title: '状态',
            dataIndex: 'status',
            width: 80,
            render: (v) => (
                <Tag color={v === 1 ? 'green' : 'red'}>
                    {v === 1 ? '启用' : '禁用'}
                </Tag>
            ),
        },
        { title: '备注', dataIndex: 'remark', ellipsis: true },
        {
            title: '操作',
            width: 120,
            render: (_, record) => (
                <Space>
                    <Button
                        type="link"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => openItemModal(record)}
                    />
                    <Button
                        type="link"
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteItem(record.id)}
                    />
                </Space>
            ),
        },
    ]

    const openCategoryModal = (category?: DictCategory) => {
        setEditingCategory(category || null)
        if (category) {
            categoryForm.setFieldsValue(category)
        } else {
            categoryForm.resetFields()
        }
        setCategoryModalVisible(true)
    }

    const openItemModal = (item?: DictItem) => {
        setEditingItem(item || null)
        if (item) {
            itemForm.setFieldsValue(item)
        } else {
            itemForm.resetFields()
            if (selectedCategoryId) {
                itemForm.setFieldValue('categoryId', selectedCategoryId)
            }
        }
        setItemModalVisible(true)
    }

    const handleSaveCategory = async () => {
        try {
            const values = await categoryForm.validateFields()
            if (editingCategory) {
                await dictApi.updateCategory(editingCategory.id, values as DictCategoryDto)
                message.success('更新成功')
            } else {
                await dictApi.createCategory(values as DictCategoryDto)
                message.success('创建成功')
            }
            setCategoryModalVisible(false)
            loadCategories()
        } catch {
            message.error('保存失败')
        }
    }

    const handleSaveItem = async () => {
        try {
            const values = await itemForm.validateFields()
            if (editingItem) {
                await dictApi.updateItem(editingItem.id, values as DictItemDto)
                message.success('更新成功')
            } else {
                await dictApi.createItem(selectedCategoryId!, values as DictItemDto)
                message.success('创建成功')
            }
            setItemModalVisible(false)
            if (selectedCategoryId) {
                loadItems(selectedCategoryId)
            }
        } catch {
            message.error('保存失败')
        }
    }

    const handleDeleteCategory = async (id: number) => {
        Modal.confirm({
            title: '确认删除',
            content: '确定要删除此分类吗？',
            onOk: async () => {
                try {
                    await dictApi.deleteCategory(id)
                    message.success('删除成功')
                    loadCategories()
                } catch {
                    message.error('删除失败')
                }
            },
        })
    }

    const handleDeleteItem = async (id: number) => {
        Modal.confirm({
            title: '确认删除',
            content: '确定要删除此字典项吗？',
            onOk: async () => {
                try {
                    await dictApi.deleteItem(id)
                    message.success('删除成功')
                    if (selectedCategoryId) {
                        loadItems(selectedCategoryId)
                    }
                } catch {
                    message.error('删除失败')
                }
            },
        })
    }

    return (
        <div style={{ padding: 24 }}>
            <Row gutter={16}>
                <Col span={6}>
                    <Card
                        title="字典分类"
                        extra={
                            <Space>
                                <Button
                                    type="primary"
                                    size="small"
                                    icon={<PlusOutlined />}
                                    onClick={() => openCategoryModal()}
                                >
                                    新增
                                </Button>
                            </Space>
                        }
                    >
                        <Tree
                            showIcon
                            defaultExpandAll
                            selectedKeys={selectedCategoryId ? [selectedCategoryId.toString()] : []}
                            treeData={treeData}
                            onSelect={(keys) => {
                                if (keys[0] && keys[0] !== 'root') {
                                    setSelectedCategoryId(Number(keys[0]))
                                }
                            }}
                        />
                        <div style={{ marginTop: 16 }}>
                            {categories.map((c) => (
                                <div key={c.id} style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                                    <span>{c.code} - {c.name}</span>
                                    <Space size={0}>
                                        <Button
                                            type="text"
                                            size="small"
                                            icon={<EditOutlined />}
                                            onClick={() => openCategoryModal(c)}
                                        />
                                        <Button
                                            type="text"
                                            size="small"
                                            danger
                                            icon={<DeleteOutlined />}
                                            onClick={() => handleDeleteCategory(c.id)}
                                        />
                                    </Space>
                                </div>
                            ))}
                        </div>
                    </Card>
                </Col>
                <Col span={18}>
                    <Card
                        title="字典项"
                        extra={
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => openItemModal()}
                                disabled={!selectedCategoryId}
                            >
                                新增
                            </Button>
                        }
                    >
                        <Table
                            rowKey="id"
                            columns={itemColumns}
                            dataSource={items}
                            loading={loading}
                            pagination={{ pageSize: 20 }}
                        />
                    </Card>
                </Col>
            </Row>

            <Modal
                title={editingCategory ? '编辑分类' : '新增分类'}
                open={categoryModalVisible}
                onOk={handleSaveCategory}
                onCancel={() => setCategoryModalVisible(false)}
            >
                <Form form={categoryForm} layout="vertical">
                    <Form.Item
                        name="code"
                        label="编码"
                        rules={[{ required: true, message: '请输入编码' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="name"
                        label="名称"
                        rules={[{ required: true, message: '请输入名称' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item name="description" label="描述">
                        <Input.TextArea />
                    </Form.Item>
                    <Form.Item name="sort" label="排序">
                        <InputNumber min={0} />
                    </Form.Item>
                    <Form.Item name="status" label="状态">
                        <Select>
                            <Select.Option value={1}>启用</Select.Option>
                            <Select.Option value={0}>禁用</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title={editingItem ? '编辑字典项' : '新增字典项'}
                open={itemModalVisible}
                onOk={handleSaveItem}
                onCancel={() => setItemModalVisible(false)}
            >
                <Form form={itemForm} layout="vertical">
                    <Form.Item name="categoryId" hidden>
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="code"
                        label="编码"
                        rules={[{ required: true, message: '请输入编码' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="name"
                        label="名称"
                        rules={[{ required: true, message: '请输入名称' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item name="value" label="值">
                        <Input />
                    </Form.Item>
                    <Form.Item name="parentId" label="父级">
                        <Select allowClear>
                            {items
                                .filter((i) => i.id !== editingItem?.id)
                                .map((i) => (
                                    <Select.Option key={i.id} value={i.id}>
                                        {i.name}
                                    </Select.Option>
                                ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="sort" label="排序">
                        <InputNumber min={0} />
                    </Form.Item>
                    <Form.Item name="status" label="状态">
                        <Select>
                            <Select.Option value={1}>启用</Select.Option>
                            <Select.Option value={0}>禁用</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="remark" label="备注">
                        <Input.TextArea />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}

export default DictManagement
