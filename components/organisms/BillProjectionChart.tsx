import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Activity } from "lucide-react";

export function BillProjectionChart({
  isAnySimulationActive,
  currentTotalKWh,
  baseLineTotalKWh,
  efficiencyCut,
  tariff,
  aggregatedStats,
  chartData,
}: {
  isAnySimulationActive: boolean;
  currentTotalKWh: number;
  baseLineTotalKWh: number;
  efficiencyCut: number;
  tariff: number;
  aggregatedStats: any;
  chartData: any[];
}) {
  return (
    <div className="md:col-span-2 bg-surface-card rounded-2xl p-6 border border-surface-hairline flex flex-col font-sans min-h-[400px]">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-text-ink mb-1">
            Proyeksi Tagihan
          </h2>
          <p className="text-sm text-text-muted">
            {isAnySimulationActive
              ? "Data simulasi live sedang mempengaruhi proyeksi"
              : "Perbandingan konsumsi aktual vs prediksi berdasarkan tren saat ini."}
          </p>
        </div>
        <span
          className={`px-3 py-1 border text-xs font-medium rounded-full flex items-center gap-2 ${
            isAnySimulationActive
              ? "bg-brand-accent-teal/10 border-brand-accent-teal/30 text-brand-accent-teal"
              : "bg-surface-soft border-surface-hairline text-text-body"
          }`}
        >
          <Activity
            className={`w-3 h-3 ${isAnySimulationActive ? "animate-pulse" : ""}`}
          />
          {isAnySimulationActive ? "Feed Live" : "Historis"}
        </span>
      </div>

      <div className="flex items-center gap-12 mb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-text-muted-soft mb-1">
            Proyeksi Tagihan
          </p>
          <div className="flex items-baseline gap-2 transition-all duration-300">
            <span className="text-3xl font-serif font-bold text-text-ink">
              Rp{" "}
              {(currentTotalKWh * tariff).toLocaleString("id-ID", {
                maximumFractionDigits: 0,
              })}
            </span>
          </div>
        </div>
        {efficiencyCut > 0 && (
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-text-muted-soft mb-1">
              Baseline
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-serif text-brand-primary line-through opacity-70">
                Rp{" "}
                {(baseLineTotalKWh * tariff).toLocaleString("id-ID", {
                  maximumFractionDigits: 0,
                })}
              </span>
            </div>
          </div>
        )}
        {isAnySimulationActive && (
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-text-muted-soft mb-1">
              Daya Live
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-serif text-brand-accent-teal font-bold">
                {(aggregatedStats.totalPower / 1000).toFixed(2)}
              </span>
              <span className="text-sm text-text-muted">kW</span>
            </div>
          </div>
        )}
      </div>

      <div className="h-64 w-full mt-auto transition-all duration-500 ease-in-out">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--color-surface-hairline)"
            />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--color-text-muted-soft)", fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--color-text-muted-soft)", fontSize: 12 }}
              width={60}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-surface-dark)",
                borderRadius: "12px",
                border: "none",
                color: "var(--color-text-on-dark)",
              }}
              itemStyle={{ color: "var(--color-text-on-dark)" }}
              formatter={(value: any) => [
                `${Number(value).toFixed(0)} kWh`,
                "Konsumsi",
              ]}
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="var(--color-text-ink)"
              strokeWidth={2}
              dot={{
                r: 4,
                fill: "var(--color-surface-canvas)",
                strokeWidth: 2,
              }}
              activeDot={{ r: 6 }}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="var(--color-brand-primary)"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              isAnimationActive={true}
              animationDuration={500}
            />
            <ReferenceLine
              x="Jum"
              stroke="var(--color-brand-accent-amber)"
              strokeDasharray="3 3"
              label={{
                position: "top",
                value: "Hari Ini",
                fill: "var(--color-brand-accent-amber)",
                fontSize: 12,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
