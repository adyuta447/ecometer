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
import { StatusBadge } from "@/components/atoms/StatusBadge";

const baseData = [
  { day: "Sen", actual: 14200, predicted: 14200 },
  { day: "Sel", actual: 14800, predicted: 14700 },
  { day: "Rab", actual: 14500, predicted: 14600 },
  { day: "Kam", actual: 15200, predicted: 15100 },
  { day: "Jum", actual: 14900, predicted: 15000 },
  { day: "Sab", actual: null, predicted: 14800 },
  { day: "Min", actual: null, predicted: 14600 },
];

export default function AnalyticsPage() {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const { isAnySimulationActive, aggregatedStats, activeSimulations, metricsHistory, latestMetrics, anomalyCount } = useSimulator();
  const [efficiencyCut, setEfficiencyCut] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tariff, setTariff] = useState(1444.7);

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
        console.error("Gagal memuat data analitik:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);
  useEffect(() => {
    if (!isAnySimulationActive) return;
    const interval = setInterval(() => {
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

      if (d.day === "Jum" || d.day === "Sab" || d.day === "Min") {
        const reductionFactor = efficiencyCut / 100;
        adjustedPredicted =
          d.predicted * (1 - reductionFactor * (d.day === "Jum" ? 0.5 : 1));
      }

      if (d.day === "Jum" && isAnySimulationActive && adjustedActual !== null) {
        adjustedActual = adjustedActual + liveFlux;
        adjustedPredicted = adjustedPredicted + liveFlux * 0.3;
      }

      return {
        ...d,
        actual: adjustedActual,
        predicted: adjustedPredicted,
      };
    });
  }, [efficiencyCut, liveFlux, isAnySimulationActive]);
  const powerChartData = useMemo(() => {
    if (metricsHistory.length === 0) return [];
    const grouped = metricsHistory.reduce<Record<string, { time: string; power: number; count: number }>>((acc, m) => {
      const key = m.timestamp.slice(11, 19);
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

  const computedMape = useMemo(() => {
    if (!isAnySimulationActive) return 2.8;
    const metrics = Object.values(latestMetrics);
    if (metrics.length === 0) return 2.8;
    const anomalyRate = metrics.filter((m) => m.anomaly).length / metrics.length;
    return 2.8 + anomalyRate * 1.5;
  }, [latestMetrics, isAnySimulationActive]);

  const lastTrainedAgo = useMemo(() => {
    if (!isAnySimulationActive) return "45 menit lalu";
    if (metricsHistory.length === 0) return "45 menit lalu";
    const last = new Date(metricsHistory[metricsHistory.length - 1].timestamp);
    const diff = Math.floor((Date.now() - last.getTime()) / 1000);
    if (diff < 5) return "Baru aja";
    if (diff < 60) return `${diff} detik lalu`;
    return `${Math.floor(diff / 60)} menit lalu`;
  }, [metricsHistory, isAnySimulationActive, liveFlux]);

  const handleOverride = () => {
    if (user) {
      logActivity(
        user.uid,
        "efficiency_override",
        `Override efisiensi ${efficiencyCut}% diterapkan ke sistem aktif`,
        "warning",
        { efficiencyCut }
      );
    }
    addNotification(
      `Pengurangan ${efficiencyCut}% diterapkan ke sistem aktif.`,
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
            Analitik Prediktif
          </h1>
          <p className="text-sm text-text-muted">
            Prediksi AI/ML dan deteksi anomali otomatis
          </p>
        </div>
        {isAnySimulationActive && (
          <StatusBadge label={`${activeSimulations.length} Perangkat Streaming`} variant="teal" pulse />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <span className={`px-3 py-1 border text-xs font-medium rounded-full flex items-center gap-2 ${
              isAnySimulationActive
                ? "bg-brand-accent-teal/10 border-brand-accent-teal/30 text-brand-accent-teal"
                : "bg-surface-soft border-surface-hairline text-text-body"
            }`}>
              <Activity className={`w-3 h-3 ${isAnySimulationActive ? "animate-pulse" : ""}`} />
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

        <div className="space-y-6">
          <div className="p-6 bg-brand-primary text-text-on-dark rounded-2xl flex flex-col h-full">
            <Sparkles className="w-5 h-5 text-brand-accent-amber mb-6" />
            <h3 className="text-xl font-serif font-bold italic mb-2">
              Simulasi What-If
            </h3>
            <p className="text-sm opacity-90 mb-6 leading-relaxed">
              {isAnySimulationActive
                ? `Sedang simulasi dengan ${activeSimulations.length} perangkat live. Geser buat tes potongan efisiensi.`
                : "Geser buat simulasi pengurangan jam aktif. Prediksi dampak ke tagihan secara real-time lewat AI."}
            </p>

            <div className="mt-auto mb-6">
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-text-on-dark-soft mb-2">
                <span>0%</span>
                <span>Pengurangan {efficiencyCut}%</span>
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
              <span>Terapkan Override</span>
              <Wrench className="w-4 h-4 text-brand-accent-teal" />
            </button>
          </div>
        </div>
      </div>

      {/* Chart Daya Real-Time — hanya saat perangkat aktif */}
      {isAnySimulationActive && powerChartData.length > 3 && (
        <div className="bg-surface-card rounded-2xl p-6 border border-surface-hairline">
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
                  formatter={(value: any) => [`${Number(value).toFixed(1)} W`, "Total Daya"]}
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

      <div className="bg-surface-card rounded-2xl p-6 border border-surface-hairline mt-6">
        <h3 className="text-sm font-bold uppercase tracking-widest text-text-ink mb-6">
          Akurasi & Pelatihan Model
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-4 bg-surface-canvas rounded-2xl border border-surface-hairline">
            <div className="text-[10px] uppercase font-bold text-text-muted-soft mb-1">
              Algoritma
            </div>
            <div className="text-sm font-medium">Random Forest Regressor</div>
          </div>
          <div className="p-4 bg-surface-canvas rounded-2xl border border-surface-hairline">
            <div className="text-[10px] uppercase font-bold text-text-muted-soft mb-1">
              Ukuran Dataset
            </div>
            <div className="text-sm font-medium">
              {isAnySimulationActive
                ? `${(12400000 + metricsHistory.length * 100).toLocaleString()} Titik Data`
                : "12,4 Juta Titik Data"}
            </div>
          </div>
          <div className="p-4 bg-surface-canvas rounded-2xl border border-surface-hairline">
            <div className="text-[10px] uppercase font-bold text-text-muted-soft mb-1">
              Tingkat Error MAPE
            </div>
            <div className={`text-sm font-medium ${computedMape < 3 ? "text-brand-accent-teal" : computedMape < 5 ? "text-brand-accent-amber" : "text-brand-primary"}`}>
              {computedMape.toFixed(2)}% {computedMape < 3 ? "(Sangat Akurat)" : computedMape < 5 ? "(Cukup Baik)" : "(Perlu Review)"}
            </div>
          </div>
          <div className="p-4 bg-surface-canvas rounded-2xl border border-surface-hairline">
            <div className="text-[10px] uppercase font-bold text-text-muted-soft mb-1">
              Terakhir Dilatih
            </div>
            <div className="text-sm font-medium flex items-center gap-1">
              {lastTrainedAgo}
              {isAnySimulationActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-brand-accent-teal animate-pulse"></span>
              )}
            </div>
          </div>
        </div>

        {/* Ringkasan anomali */}
        {isAnySimulationActive && anomalyCount > 0 && (
          <div className="mt-4 p-4 bg-brand-primary/5 rounded-2xl border border-brand-primary/10 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-brand-primary flex-shrink-0" />
            <div>
              <span className="text-xs font-bold text-brand-primary">{anomalyCount} anomali terdeteksi</span>
              <span className="text-xs text-text-muted ml-2">selama sesi ini — lonjakan daya di luar jam kerja tercatat di feed aktivitas</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
