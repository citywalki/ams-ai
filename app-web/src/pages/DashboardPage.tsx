import { useEffect, useState } from 'react';
import { BusyIndicator, Card, MessageStrip, Title } from '@ui5/webcomponents-react';
import apiClient from '@/utils/api';
import './DashboardPage.css';

type Alarm = {
  id: string;
  title: string;
  severity: string;
  status: string;
  createdAt: string;
};

type AlarmPage = { content?: Alarm[]; items?: Alarm[] };

export default function DashboardPage() {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlarms = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiClient.get<AlarmPage>('/alerts');
        setAlarms(res.data.content ?? res.data.items ?? []);
      } catch {
        setError('后端 API 已连通，但未获取到告警数据（请确认 /api/alerts 是否可用）');
      } finally {
        setLoading(false);
      }
    };
    void fetchAlarms();
  }, []);

  return (
    <main className='dashboard-page-content'>
      <Card className='dashboard-card'>
        <Title level='H4'>主页</Title>
        <div>欢迎使用告警管理系统。</div>
      </Card>

      <Card className='dashboard-card'>
        <Title level='H5'>后端 API 数据（/api/alerts）</Title>
        {loading ? <BusyIndicator active className='dashboard-loading' /> : null}
        {error ? <MessageStrip design='Negative'>{error}</MessageStrip> : null}
        {!loading && !error ? <div>已加载 {alarms.length} 条告警。</div> : null}
      </Card>
    </main>
  );
}
