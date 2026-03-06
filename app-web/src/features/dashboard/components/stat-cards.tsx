import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type LucideIcon } from "lucide-react";

interface StatCard {
  title: string;
  value: string;
  change: string;
  changeType: "increase" | "decrease" | "positive" | "neutral";
  icon: LucideIcon;
  description: string;
}

interface StatCardsProps {
  data: StatCard[];
}

export function StatCards({ data }: StatCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {data.map((stat, index) => (
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
              <span
                className={cn(
                  "text-xs font-medium",
                  stat.changeType === "positive" && "text-[#107E3E]",
                  stat.changeType === "increase" && "text-[#D9363E]",
                  stat.changeType === "neutral" && "text-[#E78C07]"
                )}
              >
                {stat.change}
              </span>
              <span className="text-xs text-[#A9A9A9]">{stat.description}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
