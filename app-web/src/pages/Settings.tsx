import { Card, Form, Input, Switch, Button, Space, Divider } from 'antd'
import { SaveOutlined, ReloadOutlined } from '@ant-design/icons'

export default function Settings() {
  const [form] = Form.useForm()

  const onFinish = (values: any) => {
    console.log('保存设置:', values)
  }

  const onReset = () => {
    form.resetFields()
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card title="系统设置">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            systemName: 'AMS-AI 告警管理系统',
            notificationEmail: 'admin@example.com',
            autoRefresh: true,
            refreshInterval: 60,
            enableNotifications: true,
          }}
        >
          <Divider>常规设置</Divider>

          <Form.Item
            label="系统名称"
            name="systemName"
            rules={[{ required: true, message: '请输入系统名称' }]}
          >
            <Input placeholder="请输入系统名称" />
          </Form.Item>

          <Form.Item
            label="通知邮箱"
            name="notificationEmail"
            rules={[
              { required: true, message: '请输入通知邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input placeholder="请输入通知邮箱" />
          </Form.Item>

          <Divider>告警设置</Divider>

          <Form.Item
            label="自动刷新"
            name="autoRefresh"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            label="刷新间隔 (秒)"
            name="refreshInterval"
            rules={[{ required: true, message: '请输入刷新间隔' }]}
          >
            <Input type="number" min={10} max={300} placeholder="请输入刷新间隔" />
          </Form.Item>

          <Form.Item
            label="启用通知"
            name="enableNotifications"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Divider>通知设置</Divider>

          <Form.Item
            label="通知阈值 - 严重"
            name="criticalThreshold"
            rules={[{ required: true, message: '请输入阈值' }]}
          >
            <Input type="number" min={1} placeholder="请输入阈值" />
          </Form.Item>

          <Form.Item
            label="通知阈值 - 高"
            name="highThreshold"
            rules={[{ required: true, message: '请输入阈值' }]}
          >
            <Input type="number" min={1} placeholder="请输入阈值" />
          </Form.Item>

          <Form.Item style={{ marginTop: 24 }}>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                保存设置
              </Button>
              <Button onClick={onReset} icon={<ReloadOutlined />}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
