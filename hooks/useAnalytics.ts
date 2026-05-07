import { useState, useEffect, useMemo } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/AuthProvider";
import { useSimulator } from "@/components/SimulatorProvider";
import { useNotification } from "@/components/NotificationProvider";
import { logActivity } from "@/lib/activityLog";

const baseData = [
  { day: "Sen", actual: 14200, predicted: 14200 },
  { day: "Sel", actual: 14800, predicted: 14700 },
  { day: "Rab", actual: 14500, predicted: 14600 },
  { day: "Kam", actual: 15200, predicted: 15100 },
  { day: "Jum", actual: 14900, predicted: 15000 },
  { day: "Sab", actual: null, predicted: 14800 },
  { day: "Min", actual: null, predicted: 14600 },
];

export function useAnalytics() {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const {
    isAnySimulationActive,
    aggregatedStats,
    activeSimulations,
    metricsHistory,
    latestMetrics,
    anomalyCount,
  } = useSimulator();

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
    const grouped = metricsHistory.reduce<
      Record<string, { time: string; power: number; count: number }>
    >((acc, m) => {
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
    const anomalyRate =
      metrics.filter((m) => m.anomaly).length / metrics.length;
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
  }, [metricsHistory, isAnySimulationActive]);

  const handleOverride = () => {
    if (user) {
      logActivity(
        user.uid,
        "efficiency_override",
        `Override efisiensi ${efficiencyCut}% diterapkan ke sistem aktif`,
        "warning",
        { efficiencyCut },
      );
    }
    addNotification(
      `Pengurangan ${efficiencyCut}% diterapkan ke sistem aktif.`,
      "success",
    );
  };

  return {
    loading,
    efficiencyCut,
    setEfficiencyCut,
    tariff,
    chartData,
    powerChartData,
    baseLineTotalKWh,
    currentTotalKWh,
    computedMape,
    lastTrainedAgo,
    handleOverride,
    isAnySimulationActive,
    activeSimulations,
    aggregatedStats,
    anomalyCount,
    metricsHistory,
  };
}
