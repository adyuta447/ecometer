"use client";

import { useMemo, useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingDown,
  Wrench,
  Sparkles,
  Activity,
  Loader2,
  Zap,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useSimulator } from "@/components/SimulatorProvider";
import { useNotification } from "@/components/NotificationProvider";
import { logActivity } from "@/lib/activityLog";

const baseData = [
  { day: "Mon", actual: 14200, predicted: 14200 },
  { day: "Tue", actual: 14800, predicted: 14700 },
  { day: "Wed", actual: 14500, predicted: 14600 },
  { day: "Thu", actual: 15200, predicted: 15100 },
  { day: "Fri", actual: 14900, predicted: 15000 },
  { day: "Sat", actual: null, predicted: 14800 },
  { day: "Sun", actual: null, predicted: 14600 },
];

export default function AnalyticsPage() {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const { isAnySimulationActive, aggregatedStats, activeSimulations, metricsHistory, latestMetrics, anomalyCount } = useSimulator();
  const [efficiencyCut, setEfficiencyCut] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tariff, setTariff] = useState(1444.7);

  // Realtime noise for the chart when simulations are active
  const [liveFlux, setLiveFlux] = useState(0);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      try {
        const settingsQ = query(
          collection(db, "settings"),
          where("userId", "==", user.uid),
        );
        const settingsSnap = await getDocs(settingsQ);
        if (!settingsSnap.empty) {
          const s = settingsSnap.docs[0].data();
          if (s.tariff) setTariff(Number(s.tariff));
        }
      } catch (error) {
        console.error("Failed to load analytics data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  // Create a fluctuation effect when simulation is active
  useEffect(() => {
    if (!isAnySimulationActive) {
      return;
    }
    // Update every 2 seconds to match simulator tick
    const interval = setInterval(() => {
      // Create a random +/- noise based on active total power
      const maxNoise = 300 + aggregatedStats.totalPower / 100;
      const noise = Math.random() * maxNoise * 2 - maxNoise;
      setLiveFlux(noise);
    }, 2000);
    return () => clearInterval(interval);
  }, [isAnySimulationActive, aggregatedStats.totalPower]);

  const chartData = useMemo(() => {
    return baseData.map((d) => {
      let adjustedPredicted = d.predicted;
      let adjustedActual = d.actual;

      // Apply reduction cut to future predictions
      if (d.day === "Fri" || d.day === "Sat" || d.day === "Sun") {
        const reductionFactor = efficiencyCut / 100;
        adjustedPredicted =
          d.predicted * (1 - reductionFactor * (d.day === "Fri" ? 0.5 : 1));
      }

      // Inject live simulation noise into 'Today' (Fri)
      if (d.day === "Fri" && isAnySimulationActive && adjustedActual !== null) {
        adjustedActual = adjustedActual + liveFlux;
        // Make predicted slightly follow actual during live sim
        adjustedPredicted = adjustedPredicted + liveFlux * 0.3;
      }

      return {
        ...d,
        actual: adjustedActual,
        predicted: adjustedPredicted,
      };
    });
  }, [efficiencyCut, liveFlux, isAnySimulationActive]);

  // Real-time power chart from metrics history
  const powerChartData = useMemo(() => {
    if (metricsHistory.length === 0) return [];
    // Group by timestamp and sum power
    const grouped = metricsHistory.reduce<Record<string, { time: string; power: number; count: number }>>((acc, m) => {
      const key = m.timestamp.slice(11, 19); // HH:MM:SS
      if (!acc[key]) acc[key] = { time: key, power: 0, count: 0 };
      acc[key].power += m.power;
      acc[key].count++;
      return acc;
    }, {});
    return Object.values(grouped).slice(-20);
  }, [metricsHistory]);

  const baseLineTotalKWh = 15000;
  const currentTotalKWh = useMemo(() => {
    let total = baseLineTotalKWh * (1 - (efficiencyCut / 100) * 0.2);
    if (isAnySimulationActive) {
      total += liveFlux * 2;
    }
    return total;
  }, [efficiencyCut, isAnySimulationActive, liveFlux]);

  // Real-time MAPE calculation from simulation data
  const computedMape = useMemo(() => {
    if (!isAnySimulationActive) return 2.8;
    const metrics = Object.values(latestMetrics);
    if (metrics.length === 0) return 2.8;
    // Simulate error rate based on anomaly ratio
    const anomalyRate = metrics.filter((m) => m.anomaly).length / metrics.length;
    return 2.8 + anomalyRate * 1.5;
  }, [latestMetrics, isAnySimulationActive]);

  const lastTrainedAgo = useMemo(() => {
    if (!isAnySimulationActive) return "45 minutes ago";
    // Show how recent data is
    if (metricsHistory.length === 0) return "45 minutes ago";
    const last = new Date(metricsHistory[metricsHistory.length - 1].timestamp);
    const diff = Math.floor((Date.now() - last.getTime()) / 1000);
    if (diff < 5) return "Just now";
    if (diff < 60) return `${diff}s ago`;
    return `${Math.floor(diff / 60)}m ago`;
  }, [metricsHistory, isAnySimulationActive, liveFlux]);

  const handleOverride = () => {
    if (user) {
      logActivity(
        user.uid,
        "efficiency_override",
        `Applied ${efficiencyCut}% efficiency reduction to active systems`,
        "warning",
        { efficiencyCut }
      );
    }
    addNotification(
      `Applied ${efficiencyCut}% reduction to active systems.`,
      "success",
    );
  };

  if (loading)
    return (
      <div className="p-8 max-w-6xl mx-auto flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
      </div>
    );

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold italic text-text-ink mb-1">
            Predictive Analytics
          </h1>
          <p className="text-sm text-text-muted">
            AI/ML forecasting & automated anomaly detection
          </p>
        </div>
        {isAnySimulationActive && (
          <div className="flex items-center gap-2 px-4 py-2 bg-brand-accent-teal/10 rounded-2xl border border-brand-accent-teal/20">
            <span className="w-2 h-2 rounded-full bg-brand-accent-teal animate-pulse"></span>
            <span className="text-xs font-bold text-brand-accent-teal">
              {activeSimulations.length} Device{activeSimulations.length > 1 ? "s" : ""} Streaming
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-surface-card rounded-3xl p-6 border border-surface-hairline flex flex-col font-sans min-h-[400px]">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-text-ink mb-1">
                Billing Projection
              </h2>
              <p className="text-sm text-text-muted">
                {isAnySimulationActive
                  ? "Live simulation data influencing projections"
                  : "Projected vs actual consumption based on current trends."}
              </p>
            </div>
            <span className={`px-3 py-1 border text-xs font-medium rounded-full flex items-center gap-2 ${
              isAnySimulationActive
                ? "bg-brand-accent-teal/10 border-brand-accent-teal/30 text-brand-accent-teal"
                : "bg-surface-soft border-surface-hairline text-text-body"
            }`}>
              <Activity className={`w-3 h-3 ${isAnySimulationActive ? "animate-pulse" : ""}`} />
              {isAnySimulationActive ? "Live Feed" : "Historical"}
            </span>
          </div>

          <div className="flex items-center gap-12 mb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-text-muted-soft mb-1">
                Projected Billing
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
                  Live Power
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
                    "Consumption",
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
                  x="Fri"
                  stroke="var(--color-brand-accent-amber)"
                  strokeDasharray="3 3"
                  label={{
                    position: "top",
                    value: "Today",
                    fill: "var(--color-brand-accent-amber)",
                    fontSize: 12,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-brand-primary text-text-on-dark rounded-3xl flex flex-col h-full shadow-md">
            <div className="w-10 h-10 rounded-full bg-brand-primary-active flex items-center justify-center mb-6 shadow-inner">
              <Sparkles className="w-5 h-5 text-brand-accent-amber" />
            </div>
            <h3 className="text-xl font-serif font-bold italic mb-2">
              What-If Simulation
            </h3>
            <p className="text-sm opacity-90 mb-6 leading-relaxed">
              {isAnySimulationActive
                ? `Simulating with ${activeSimulations.length} live device(s). Slide to test efficiency cuts.`
                : "Slide to simulate cutting active hours. Predict real-time impact on the projected billing via AI."}
            </p>

            <div className="mt-auto mb-6">
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-text-on-dark-soft mb-2">
                <span>0%</span>
                <span>{efficiencyCut}% Reduction</span>
                <span>30%</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                value={efficiencyCut}
                onChange={(e) => setEfficiencyCut(Number(e.target.value))}
                className="w-full h-2 bg-brand-primary-active rounded-lg appearance-none cursor-pointer accent-surface-canvas"
              />
            </div>

            <button
              className="flex items-center justify-between w-full p-3 bg-surface-dark text-text-on-dark rounded-xl text-sm font-medium hover:bg-surface-dark-elevated transition-colors"
              onClick={handleOverride}
            >
              <span>Execute Override</span>
              <Wrench className="w-4 h-4 text-brand-accent-teal" />
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Power Chart - Only when devices active */}
      {isAnySimulationActive && powerChartData.length > 3 && (
        <div className="bg-surface-card rounded-3xl p-6 border border-surface-hairline">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-brand-accent-teal" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-text-ink">
                Real-Time Power Draw
              </h3>
            </div>
            <span className="flex items-center gap-1.5 text-[10px] text-brand-accent-teal font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-accent-teal animate-pulse"></span>
              Streaming
            </span>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={powerChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="powerGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-brand-accent-teal)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-brand-accent-teal)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-surface-hairline)" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: "var(--color-text-muted-soft)", fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--color-text-muted-soft)", fontSize: 10 }} width={50} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-surface-dark)",
                    borderRadius: "12px",
                    border: "none",
                    color: "var(--color-text-on-dark)",
                  }}
                  formatter={(value: any) => [`${Number(value).toFixed(1)} W`, "Total Power"]}
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
      )}

      <div className="bg-surface-card rounded-3xl p-6 border border-surface-hairline mt-6">
        <h3 className="text-sm font-bold uppercase tracking-widest text-text-ink mb-6">
          Model Accuracy & Training
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-4 bg-surface-canvas rounded-2xl border border-surface-hairline">
            <div className="text-[10px] uppercase font-bold text-text-muted-soft mb-1">
              Algorithm
            </div>
            <div className="text-sm font-medium">Random Forest Regressor</div>
          </div>
          <div className="p-4 bg-surface-canvas rounded-2xl border border-surface-hairline">
            <div className="text-[10px] uppercase font-bold text-text-muted-soft mb-1">
              Dataset Size
            </div>
            <div className="text-sm font-medium">
              {isAnySimulationActive
                ? `${(12400000 + metricsHistory.length * 100).toLocaleString()} Points`
                : "12.4M Datapoints"}
            </div>
          </div>
          <div className="p-4 bg-surface-canvas rounded-2xl border border-surface-hairline">
            <div className="text-[10px] uppercase font-bold text-text-muted-soft mb-1">
              MAPE Error Rate
            </div>
            <div className={`text-sm font-medium ${computedMape < 3 ? "text-brand-accent-teal" : computedMape < 5 ? "text-brand-accent-amber" : "text-brand-primary"}`}>
              {computedMape.toFixed(2)}% {computedMape < 3 ? "(Highly Accurate)" : computedMape < 5 ? "(Acceptable)" : "(Needs Review)"}
            </div>
          </div>
          <div className="p-4 bg-surface-canvas rounded-2xl border border-surface-hairline">
            <div className="text-[10px] uppercase font-bold text-text-muted-soft mb-1">
              Last Trained
            </div>
            <div className="text-sm font-medium flex items-center gap-1">
              {lastTrainedAgo}
              {isAnySimulationActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-brand-accent-teal animate-pulse"></span>
              )}
            </div>
          </div>
        </div>

        {/* Anomaly summary */}
        {isAnySimulationActive && anomalyCount > 0 && (
          <div className="mt-4 p-4 bg-brand-primary/5 rounded-2xl border border-brand-primary/10 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-brand-primary flex-shrink-0" />
            <div>
              <span className="text-xs font-bold text-brand-primary">{anomalyCount} anomalies detected</span>
              <span className="text-xs text-text-muted ml-2">during this session — off-hours power spikes logged to activity feed</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
