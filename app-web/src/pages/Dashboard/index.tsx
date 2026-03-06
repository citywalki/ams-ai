import { cn } from "@/lib/utils";
import { 
    Card, 
    CardContent, 
    CardDescription, 
    CardHeader, 
    CardTitle 
} from "@/components/ui/card";
import { 
    AlertCircle, 
    CheckCircle2, 
    Clock, 
    TrendingUp,
    ChevronRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// 统计卡片数据
const statsData = [
    {
        title: "今日告警",
        value: "128",
        change: "+12%",
        changeType: "increase" as const,
        icon: AlertCircle,
        description: "较昨日"
    },
    {
        title: "待处理",
        value: "23",
        change: "5 个致命",
        changeType: "neutral" as const,
        icon: Clock,
        description: "需立即关注"
    },
    {
        title: "已解决",
        value: "98",
        change: "76.6%",
        changeType: "positive" as const,
        icon: CheckCircle2,
        description: "解决率"
    },
    {
        title: "平均处理时间",
        value: "15m",
        change: "-3m",
        changeType: "positive" as const,
        icon: TrendingUp,
        description: "较上周"
    }
];

// 最近告警数据
const recentAlarms = [
    { id: 1, title: "服务器 CPU 使用率过高", severity: "CRITICAL", time: "5分钟前", source: "server-01" },
    { id: 2, title: "数据库连接数超限", severity: "HIGH", time: "12分钟前", source: "db-master" },
    { id: 3, title: "磁盘空间不足", severity: "MEDIUM", time: "25分钟前", source: "storage-03" },
    { id: 4, title: "服务响应超时", severity: "LOW", time: "1小时前", source: "api-gateway" },
    { id: 5, title: "网络延迟异常", severity: "INFO", time: "2小时前", source: "network-monitor" },
];

const severityConfig = {
    CRITICAL: { color: "bg-[#FFF0F0] text-[#D9363E] border-[#D9363E]", label: "致命" },
    HIGH: { color: "bg-[#FFFBF2] text-[#E78C07] border-[#E78C07]", label: "高" },
    MEDIUM: { color: "bg-[#F5F9FF] text-[#0A6ED1] border-[#0A6ED1]", label: "中" },
    LOW: { color: "bg-[#F6FDF8] text-[#107E3E] border-[#107E3E]", label: "低" },
    INFO: { color: "bg-[#F5F5F5] text-[#6A6D70] border-[#E5E5E5]", label: "信息" },
};

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            {/* 页面标题 */}
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold text-[#32363A]">仪表盘</h1>
                <p className="text-sm text-[#6A6D70]">告警系统概览与实时监控</p>
            </div>

            {/* 第一行: 4 统计卡片 */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statsData.map((stat, index) => (
                    <Card 
                        key={index} 
                        className="bg-white border-[#E5E5E5] shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] transition-shadow"
                    >
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium text-[#6A6D70]">
                                {stat.title}
                            </CardTitle>
                            <div className="h-8 w-8 rounded bg-[#F5F5F5] flex items-center justify-center">
                                <stat.icon className="h-4 w-4 text-[#0070D2]" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-[#32363A]">{stat.value}</div>
                            <div className="flex items-center gap-1 mt-1">
                                <span className={cn(
                                    "text-xs font-medium",
                                    stat.changeType === "positive" && "text-[#107E3E]",
                                    stat.changeType === "increase" && "text-[#D9363E]",
                                    stat.changeType === "neutral" && "text-[#E78C07]"
                                )}>
                                    {stat.change}
                                </span>
                                <span className="text-xs text-[#A9A9A9]">{stat.description}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* 第二行: 1 告警趋势图表 */}
            <Card className="bg-white border-[#E5E5E5] shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-base font-semibold text-[#32363A]">
                                告警趋势
                            </CardTitle>
                            <CardDescription className="text-sm text-[#6A6D70] mt-1">
                                过去 7 天告警数量统计
                            </CardDescription>
                        </div>
                        <Button 
                            variant="outline" 
                            size="sm"
                            className="text-[#0070D2] border-[#0070D2] hover:bg-[#EBF5FF]"
                        >
                            查看详情
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] flex items-center justify-center bg-[#FAFAFA] rounded border border-dashed border-[#E5E5E5]">
                        <div className="text-center">
                            <p className="text-sm text-[#6A6D70]">图表区域（待实现）</p>
                            <p className="text-xs text-[#A9A9A9] mt-1">将集成告警趋势图表组件</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 第三行: 1 最近告警列表 */}
            <Card className="bg-white border-[#E5E5E5] shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-base font-semibold text-[#32363A]">
                                最近告警
                            </CardTitle>
                            <CardDescription className="text-sm text-[#6A6D70] mt-1">
                                最新产生的 10 条告警
                            </CardDescription>
                        </div>
                        <Button 
                            variant="outline" 
                            size="sm"
                            className="text-[#0070D2] border-[#0070D2] hover:bg-[#EBF5FF]"
                        >
                            查看全部
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {recentAlarms.map((alarm) => (
                            <div 
                                key={alarm.id}
                                className="flex items-center justify-between p-3 rounded hover:bg-[#FAFAFA] transition-colors cursor-pointer group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-1 h-8 rounded-full",
                                        alarm.severity === "CRITICAL" && "bg-[#D9363E]",
                                        alarm.severity === "HIGH" && "bg-[#E78C07]",
                                        alarm.severity === "MEDIUM" && "bg-[#0A6ED1]",
                                        alarm.severity === "LOW" && "bg-[#107E3E]",
                                        alarm.severity === "INFO" && "bg-[#6A6D70]"
                                    )} />
                                    
                                    <div>
                                        <p className="text-sm font-medium text-[#32363A] group-hover:text-[#0070D2] transition-colors">
                                            {alarm.title}
                                        </p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-xs text-[#6A6D70]">{alarm.source}</span>
                                            <span className="text-xs text-[#A9A9A9]">·</span>
                                            <span className="text-xs text-[#A9A9A9]">{alarm.time}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <Badge 
                                    variant="outline"
                                    className={cn(
                                        "text-xs font-medium",
                                        severityConfig[alarm.severity as keyof typeof severityConfig].color
                                    )}
                                >
                                    {severityConfig[alarm.severity as keyof typeof severityConfig].label}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
