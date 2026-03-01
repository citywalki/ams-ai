import { useMemo } from 'react';
import { Row, Col, Card, Typography, List, Tag, Skeleton, Alert, Space } from 'antd';
import { BellOutlined, ClockCircleOutlined, CheckCircleOutlined, LineChartOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { formatRelativeTime, getSeverityColor, getStatusColor } from '@/lib/utils';
import type { AlarmItem } from '@/lib/types';
import type { ReactNode } from 'react';

const { Title, Text } = Typography;

// StatCard color theme mapping
const colorMap = {
  sky: { bg: '#e0f2fe', icon: '#0ea5e9', text: '#0369a1' },
  orange: { bg: '#ffedd5', icon: '#f97316', text: '#c2410c' },
  green: { bg: '#dcfce7', icon: '#22c55e', text: '#15803d' },
  blue: { bg: '#dbeafe', icon: '#3b82f6', text: '#1d4ed8' },
} as const;

type StatCardColor = keyof typeof colorMap;

interface StatCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  color: StatCardColor;
  trend?: number;
}

function StatCard({ title, value, icon, color, trend }: StatCardProps) {
  const colors = colorMap[color];
  
  const renderTrend = () => {
    if (trend === undefined) return null;
    
    const isPositive = trend > 0;
    const trendColor = isPositive ? '#cf1322' : '#389e0d'; // red for up, green for down
    const TrendIcon = isPositive ? ArrowUpOutlined : ArrowDownOutlined;
    
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: trendColor }}>
        <TrendIcon />
        <span>{Math.abs(trend)}%</span>
      </div>
    );
  };
  
  return (
    <Card styles={{ body: { padding: '16px 20px' } }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Text type="secondary" style={{ fontSize: 14 }}>
            {title}
          </Text>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 28, fontWeight: 600, color: colors.text }}>
              {value}
            </span>
            {renderTrend()}
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 48,
            height: 48,
            borderRadius: 8,
            backgroundColor: colors.bg,
          }}
        >
          <span style={{ fontSize: 24, color: colors.icon }}>{icon}</span>
        </div>
      </div>
    </Card>
  );
}

// Helper function to check if a date is today
function isToday(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

// 模拟告警数据查询
async function fetchAlarms() {
  // 实际项目中使用 GraphQL 查询
  // const query = `
  //   query Alarms($page: Int, $size: Int) {
  //     alarms(page: $page, size: $size, orderBy: [{ field: "createdAt", direction: DESC }]) {
  //       content { id title severity status createdAt }
  //       totalElements
  //     }
  //   }
  // `;
  // return graphqlClient.request<{ alarms: PageResponse<AlarmItem> }>(query, { page: 0, size: 100 });

  // 模拟数据
  return {
    alarms: {
      content: [
        { id: '1', title: '设备A温度过高', severity: 'CRITICAL', status: 'NEW', createdAt: new Date().toISOString() },
        { id: '2', title: '网络连接中断', severity: 'HIGH', status: 'IN_PROGRESS', createdAt: new Date(Date.now() - 3600000).toISOString() },
        { id: '3', title: '磁盘空间不足', severity: 'MEDIUM', status: 'ACKNOWLEDGED', createdAt: new Date(Date.now() - 7200000).toISOString() },
        { id: '4', title: 'CPU使用率过高', severity: 'HIGH', status: 'NEW', createdAt: new Date(Date.now() - 10800000).toISOString() },
        { id: '5', title: '内存泄漏警告', severity: 'MEDIUM', status: 'RESOLVED', createdAt: new Date(Date.now() - 86400000).toISOString() },
      ] as AlarmItem[],
      totalElements: 128,
    },
  };
}

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-alarms'],
    queryFn: fetchAlarms,
  });

  const stats = useMemo(() => {
    const alarms = data?.alarms.content || [];
    return {
      total: data?.alarms.totalElements ?? 0,
      pending: alarms.filter((a) => a.status === 'NEW' || a.status === 'ACKNOWLEDGED').length,
      resolved: alarms.filter((a) => a.status === 'RESOLVED' || a.status === 'CLOSED').length,
      todayNew: alarms.filter((a) => isToday(a.createdAt || '')).length,
      // Trend data (mock percentages - in real app would come from API)
      totalTrend: 5.2,
      pendingTrend: -2.1,
      resolvedTrend: 8.3,
      todayNewTrend: 3,
    };
  }, [data]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* 欢迎横幅 */}
      <Card
        style={{
          background: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
          color: '#fff',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} style={{ color: '#fff', marginBottom: 8 }}>
              欢迎回来，{user?.username || '用户'}
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.9)' }}>
              今天是 {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
            </Text>
          </div>
        </div>
      </Card>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="总告警"
            value={stats.total}
            icon={<BellOutlined />}
            color="sky"
            trend={stats.totalTrend}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="待处理"
            value={stats.pending}
            icon={<ClockCircleOutlined />}
            color="orange"
            trend={stats.pendingTrend}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="今日新增"
            value={stats.todayNew}
            icon={<LineChartOutlined />}
            color="blue"
            trend={stats.todayNewTrend}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="已解决"
            value={stats.resolved}
            icon={<CheckCircleOutlined />}
            color="green"
            trend={stats.resolvedTrend}
          />
        </Col>
      </Row>

      {/* 最近告警列表 */}
      <Card
        title="最近告警"
        extra={<a href="/alarms">查看全部</a>}
      >
        {isLoading ? (
          <Skeleton active />
        ) : error ? (
          <Alert type="error" message="加载失败" description={error instanceof Error ? error.message : '未知错误'} showIcon />
        ) : (
          <List
            dataSource={data?.alarms.content.slice(0, 5) || []}
            renderItem={(alarm) => (
              <List.Item>
                <List.Item.Meta
                  title={alarm.title}
                  description={formatRelativeTime(alarm.createdAt || '')}
                />
                <Space>
                  <Tag color={getSeverityColor(alarm.severity)}>{alarm.severity}</Tag>
                  <Tag color={getStatusColor(alarm.status)}>{alarm.status}</Tag>
                </Space>
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
}
