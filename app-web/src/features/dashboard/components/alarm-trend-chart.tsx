import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

export function AlarmTrendChart() {
  return (
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
  );
}
