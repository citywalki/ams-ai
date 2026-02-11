import { useState } from 'react'
import { Table, Card, Input, Select, Space, Button, Tag } from 'antd'
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import type { TableProps } from 'antd'

interface Alert {
  key: string
  id: string
  message: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  status: 'new' | 'acknowledged' | 'resolved'
  source: string
  timestamp: string
}

const mockAlerts: Alert[] = [
  {
    key: '1',
    id: 'ALERT-001',
    message: '设备A 温度异常 (85°C)',
    severity: 'critical',
    status: 'new',
    source: '生产车间A',
    timestamp: '2026-02-07 08:00:00',
  },
  {
    key: '2',
    id: 'ALERT-002',
    message: '设备B 响应超时',
    severity: 'high',
    status: 'acknowledged',
    source: '生产车间B',
    timestamp: '2026-02-07 07:45:00',
  },
  {
    key: '3',
    id: 'ALERT-003',
    message: '设备C 性能下降 (CPU 85%)',
    severity: 'medium',
    status: 'new',
    source: '数据中心',
    timestamp: '2026-02-07 07:30:00',
  },
  {
    key: '4',
    id: 'ALERT-004',
    message: '设备D 内存使用率高 (90%)',
    severity: 'medium',
    status: 'resolved',
    source: '生产车间A',
    timestamp: '2026-02-07 07:15:00',
  },
  {
    key: '5',
    id: 'ALERT-005',
    message: '设备E 磁盘空间不足 (10GB可用)',
    severity: 'low',
    status: 'new',
    source: '数据中心',
    timestamp: '2026-02-07 07:00:00',
  },
]

export default function AlertsList() {
  const [searchText, setSearchText] = useState('')
  const [severityFilter, setSeverityFilter] = useState<string | undefined>(undefined)

  const getSeverityTag = (severity: string) => {
    const colors = {
      critical: 'red',
      high: 'orange',
      medium: 'orange',
      low: 'green',
    } as const
    return <Tag color={colors[severity as keyof typeof colors]}>{severity.toUpperCase()}</Tag>
  }

  const getStatusTag = (status: string) => {
    const colors = {
      new: 'blue',
      acknowledged: 'gold',
      resolved: 'green',
    } as const
    return <Tag color={colors[status as keyof typeof colors]}>{status.toUpperCase()}</Tag>
  }

  const columns: TableProps<Alert>['columns'] = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
    },
    {
      title: '消息',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
    },
    {
      title: '严重程度',
      dataIndex: 'severity',
      key: 'severity',
      width: 100,
      render: (severity) => getSeverityTag(severity),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => getStatusTag(status),
    },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
      width: 150,
    },
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
    },
  ]

  const filteredData = mockAlerts.filter(
    (item) =>
      item.message.toLowerCase().includes(searchText.toLowerCase()) &&
      (!severityFilter || item.severity === severityFilter),
  )

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title="告警列表"
        extra={
          <Button type="primary" icon={<ReloadOutlined />}>
            刷新
          </Button>
        }
      >
        <Space style={{ marginBottom: 16, width: '100%' }} size="middle">
          <Input
            placeholder="搜索告警消息..."
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Select
            placeholder="严重程度"
            style={{ width: 120 }}
            allowClear
            value={severityFilter}
            onChange={setSeverityFilter}
            options={[
              { label: 'Critical', value: 'critical' },
              { label: 'High', value: 'high' },
              { label: 'Medium', value: 'medium' },
              { label: 'Low', value: 'low' },
            ]}
          />
        </Space>
        <Table
          columns={columns}
          dataSource={filteredData}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条告警`,
          }}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  )
}
