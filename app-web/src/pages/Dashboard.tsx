import { Row, Col, Card, Statistic, List } from 'antd'
import { AlertOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'

interface Alert {
  id: string
  message: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  timestamp: string
}

const mockAlerts: Alert[] = [
  {
    id: '1',
    message: '设备A 温度异常',
    severity: 'critical',
    timestamp: '2026-02-07 08:00:00',
  },
  {
    id: '2',
    message: '设备B 响应超时',
    severity: 'high',
    timestamp: '2026-02-07 07:45:00',
  },
  {
    id: '3',
    message: '设备C 性能下降',
    severity: 'medium',
    timestamp: '2026-02-07 07:30:00',
  },
]

export default function Dashboard() {
  const getSeverityColor = (severity: string) => {
    const colors = {
      critical: '#BB0000',
      high: '#E9730C',
      medium: '#E9730C',
      low: '#107E3E',
    }
    return colors[severity as keyof typeof colors] || '#107E3E'
  }

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="活跃告警"
              value={156}
              valueStyle={{ color: '#BB0000' }}
              prefix={<AlertOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="已处理"
              value={892}
              valueStyle={{ color: '#107E3E' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="待处理"
              value={42}
              valueStyle={{ color: '#E9730C' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="设备总数" value={2456} />
          </Card>
        </Col>
      </Row>

      <Card title="最新告警" style={{ marginTop: '16px' }}>
        <List
          dataSource={mockAlerts}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: getSeverityColor(item.severity),
                    }}
                  />
                }
                title={item.message}
                description={item.timestamp}
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  )
}
