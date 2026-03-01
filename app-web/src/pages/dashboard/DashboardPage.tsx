import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Bell, Clock, CheckCircle, AlertTriangle, TrendingUp, ArrowRight } from 'lucide-react';
import { Button, Card, Skeleton, Tag, Typography } from 'antd';
import { useAlarms } from '@/hooks/useAlarms';
import { QueryErrorDisplay } from '@/components/common/QueryErrorDisplay';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.3,
    },
  }),
};

export default function DashboardPage() {
  const { t } = useTranslation();
  const { data: alarmData, isLoading: loading, error, refetch } = useAlarms(0, 100);
  const alarms = alarmData?.content ?? [];

  const stats = [
    {
      title: t('dashboard.totalAlarms'),
      value: alarms.length,
      icon: Bell,
      color: 'text-sky-600',
      bgColor: 'bg-sky-100',
    },
    {
      title: t('dashboard.pending'),
      value: alarms.filter((a) => a.status === 'pending').length,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
    },
    {
      title: t('dashboard.resolved'),
      value: alarms.filter((a) => a.status === 'resolved').length,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: t('dashboard.todayNew'),
      value: alarms.filter((a) => {
        const today = new Date().toDateString();
        return new Date(a.createdAt).toDateString() === today;
      }).length,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'text-red-600 bg-red-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'resolved':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-amber-600 bg-amber-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-3">
      <div className="bg-gradient-to-r from-sky-600 to-sky-400 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">{t('dashboard.welcome')}</h1>
        <p className="text-sky-100">
          {new Date().toLocaleDateString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            custom={index}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <Card>
              <div className="mb-2 flex items-center justify-between">
                <Typography.Text type="secondary">{stat.title}</Typography.Text>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </div>
              <div>
                {loading ? (
                  <Skeleton.Input active size="small" style={{ width: 80 }} />
                ) : (
                  <div className="text-2xl font-bold">{stat.value}</div>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card
        title={t('dashboard.recentAlarms')}
        extra={(
          <Button type="text" size="small">
            {t('dashboard.viewAll')}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      >
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton.Input key={i} active block style={{ height: 48 }} />
              ))}
            </div>
          ) : error ? (
            <QueryErrorDisplay error={error} onRetry={() => refetch()} size="card" />
          ) : alarms.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No alarms found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alarms.slice(0, 5).map((alarm) => (
                <div
                  key={alarm.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{alarm.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(alarm.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Tag className={getSeverityColor(alarm.severity)}>
                      {alarm.severity}
                    </Tag>
                    <Tag className={getStatusColor(alarm.status)}>
                      {alarm.status}
                    </Tag>
                  </div>
                </div>
              ))}
            </div>
          )}
      </Card>
    </div>
  );
}
