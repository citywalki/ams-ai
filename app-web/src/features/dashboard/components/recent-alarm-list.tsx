import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface Alarm {
  id: number;
  title: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";
  time: string;
  source: string;
}

const severityConfig = {
  CRITICAL: { color: "bg-[#FFF0F0] text-[#D9363E] border-[#D9363E]", label: "致命" },
  HIGH: { color: "bg-[#FFFBF2] text-[#E78C07] border-[#E78C07]", label: "高" },
  MEDIUM: { color: "bg-[#F5F9FF] text-[#0A6ED1] border-[#0A6ED1]", label: "中" },
  LOW: { color: "bg-[#F6FDF8] text-[#107E3E] border-[#107E3E]", label: "低" },
  INFO: { color: "bg-[#F5F5F5] text-[#6A6D70] border-[#E5E5E5]", label: "信息" },
};

interface RecentAlarmListProps {
  alarms: Alarm[];
}

export function RecentAlarmList({ alarms }: RecentAlarmListProps) {
  return (
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
          {alarms.map((alarm) => (
            <div
              key={alarm.id}
              className="flex items-center justify-between p-3 rounded hover:bg-[#FAFAFA] transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "w-1 h-8 rounded-full",
                    alarm.severity === "CRITICAL" && "bg-[#D9363E]",
                    alarm.severity === "HIGH" && "bg-[#E78C07]",
                    alarm.severity === "MEDIUM" && "bg-[#0A6ED1]",
                    alarm.severity === "LOW" && "bg-[#107E3E]",
                    alarm.severity === "INFO" && "bg-[#6A6D70]"
                  )}
                />

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
                  severityConfig[alarm.severity].color
                )}
              >
                {severityConfig[alarm.severity].label}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
