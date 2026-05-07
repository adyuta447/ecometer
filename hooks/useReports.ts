import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/AuthProvider";
import { useSimulator } from "@/components/SimulatorProvider";
import { logActivity } from "@/lib/activityLog";
import { useNotification } from "@/components/NotificationProvider";

export function useReports() {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const {
    isAnySimulationActive,
    aggregatedStats,
    activeSimulations,
    metricsHistory,
    anomalyCount,
  } = useSimulator();

  const [isExporting, setIsExporting] = useState(false);
  const [co2Factor, setCo2Factor] = useState(0.87);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      if (!user) return;
      try {
        const q = query(
          collection(db, "settings"),
          where("userId", "==", user.uid),
        );
        const qs = await getDocs(q);
        if (!qs.empty) {
          const s = qs.docs[0].data();
          if (s.co2Factor) setCo2Factor(Number(s.co2Factor));
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, [user]);

  const calculateEmissions = (kwh: number) => {
    return ((kwh * co2Factor) / 1000).toFixed(1);
  };

  const baseEnergyMwh = 104.3;
  const liveSessionKwh = aggregatedStats.totalUsageKwh;
  const totalEnergyMwh = isAnySimulationActive
    ? baseEnergyMwh + liveSessionKwh / 1000
    : baseEnergyMwh;

  const totalEmissions = calculateEmissions(totalEnergyMwh * 1000);

  const handleExport = async () => {
    setIsExporting(true);
    if (user) {
      await logActivity(
        user.uid,
        "export_report",
        "Laporan audit SRUK diekspor",
        "success",
        {
          totalEnergyMwh: totalEnergyMwh.toFixed(1),
          totalEmissions,
        },
      );
    }
    setTimeout(() => {
      setIsExporting(false);
      addNotification("Dokumen Audit SRUK berhasil di-generate.", "success");
    }, 2000);
  };

  return {
    loading,
    isExporting,
    co2Factor,
    baseEnergyMwh,
    liveSessionKwh,
    totalEnergyMwh,
    totalEmissions,
    isAnySimulationActive,
    activeSimulations,
    aggregatedStats,
    metricsHistory,
    anomalyCount,
    calculateEmissions,
    handleExport,
  };
}
