import { AlertCircle, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import { StatCards } from "@/features/dashboard/components/stat-cards";
import { AlarmTrendChart } from "@/features/dashboard/components/alarm-trend-chart";
import { RecentAlarmList } from "@/features/dashboard/components/recent-alarm-list";
import type { Alarm } from "@/features/dashboard/components/recent-alarm-list";

const statsData = [
  {
    title: "今日告警",
    value: "128",
    change: "+12%",
    changeType: "increase" as const,
    icon: AlertCircle,
    description: "较昨日",
  },
  {
    title: "待处理",
    value: "23",
    change: "5 个致命",
    changeType: "neutral" as const,
    icon: Clock,
    description: "需立即关注",
  },
  {
    title: "已解决",
    value: "98",
    change: "76.6%",
    changeType: "positive" as const,
    icon: CheckCircle2,
    description: "解决率",
  },
  {
    title: "平均处理时间",
    value: "15m",
    change: "-3m",
    changeType: "positive" as const,
    icon: TrendingUp,
    description: "较上周",
  },
];

const recentAlarms: Alarm[] = [
  { id: 1, title: "服务器 CPU 使用率过高", severity: "CRITICAL", time: "5分钟前", source: "server-01" },
  { id: 2, title: "数据库连接数超限", severity: "HIGH", time: "12分钟前", source: "db-master" },
  { id: 3, title: "磁盘空间不足", severity: "MEDIUM", time: "25分钟前", source: "storage-03" },
  { id: 4, title: "服务响应超时", severity: "LOW", time: "1小时前", source: "api-gateway" },
  { id: 5, title: "网络延迟异常", severity: "INFO", time: "2小时前", source: "network-monitor" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-[#32363A]">仪表盘</h1>
        <p className="text-sm text-[#6A6D70]">告警系统概览与实时监控</p>
      </div>

      {/* 第一行: 4 统计卡片 */}
      <StatCards data={statsData} />

      {/* 第二行: 1 告警趋势图表 */}
      <AlarmTrendChart />

      {/* 第三行: 1 最近告警列表 */}
      <RecentAlarmList alarms={recentAlarms} />
    </div>
  );
}
