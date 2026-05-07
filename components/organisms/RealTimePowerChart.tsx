import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Zap } from "lucide-react";
import { StatusBadge } from "@/components/atoms/StatusBadge";

export function RealTimePowerChart({
  powerChartData,
}: {
  powerChartData: any[];
}) {
  if (powerChartData.length <= 3) return null;

  return (
    <div className="bg-surface-card rounded-2xl p-6 border border-surface-hairline mt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-brand-accent-teal" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-text-ink">
            Tarikan Daya Real-Time
          </h3>
        </div>
        <StatusBadge label="Streaming" variant="teal" pulse />
      </div>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={powerChartData}
            margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="powerGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-brand-accent-teal)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-brand-accent-teal)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--color-surface-hairline)"
            />
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--color-text-muted-soft)", fontSize: 10 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--color-text-muted-soft)", fontSize: 10 }}
              width={50}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-surface-dark)",
                borderRadius: "12px",
                border: "none",
                color: "var(--color-text-on-dark)",
              }}
              formatter={(value: any) => [
                `${Number(value).toFixed(1)} W`,
                "Total Daya",
              ]}
            />
            <Area
              type="monotone"
              dataKey="power"
              stroke="var(--color-brand-accent-teal)"
              strokeWidth={2}
              fill="url(#powerGradient)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
