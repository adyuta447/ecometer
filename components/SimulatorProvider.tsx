"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./AuthProvider";
import { logActivity } from "@/lib/activityLog";

interface MetricSnapshot {
  userId: string;
  deviceId: string;
  timestamp: string;
  voltage: number;
  current: number;
  power: number;
  co2e: number;
  energy_kWh: number;
  anomaly: boolean;
}

interface SimulatorContextType {
  activeSimulations: string[];
  toggleSimulation: (deviceId: string, deviceName?: string) => void;
  latestMetrics: Record<string, MetricSnapshot>;
  metricsHistory: MetricSnapshot[];
  aggregatedStats: {
    totalPower: number;
    totalCo2e: number;
    totalUsageKwh: number;
  };
  isAnySimulationActive: boolean;
  deviceCount: number;
  onlineCount: number;
  anomalyCount: number;
}

const SimulatorContext = createContext<SimulatorContextType>({
  activeSimulations: [],
  toggleSimulation: () => {},
  latestMetrics: {},
  metricsHistory: [],
  aggregatedStats: { totalPower: 0, totalCo2e: 0, totalUsageKwh: 0 },
  isAnySimulationActive: false,
  deviceCount: 0,
  onlineCount: 0,
  anomalyCount: 0,
});

export const useSimulator = () => useContext(SimulatorContext);

export function SimulatorProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [activeSimulations, setActiveSimulations] = useState<string[]>([]);
  const [latestMetrics, setLatestMetrics] = useState<Record<string, MetricSnapshot>>({});
  const [metricsHistory, setMetricsHistory] = useState<MetricSnapshot[]>([]);
  const [anomalyCount, setAnomalyCount] = useState(0);
  const [aggregatedStats, setAggregatedStats] = useState({
    totalPower: 0,
    totalCo2e: 0,
    totalUsageKwh: 0,
  });

  const toggleSimulation = useCallback((deviceId: string, deviceName?: string) => {
    setActiveSimulations((prev) => {
      const isActive = prev.includes(deviceId);
      const next = isActive
        ? prev.filter((id) => id !== deviceId)
        : [...prev, deviceId];

      // Log the activity
      if (user) {
        const label = deviceName || deviceId;
        if (isActive) {
          logActivity(user.uid, "simulation_stop", `Digital Twin stopped for ${label}`, "info", { deviceId });
        } else {
          logActivity(user.uid, "simulation_start", `Digital Twin activated for ${label}`, "success", { deviceId });
        }
      }

      return next;
    });
  }, [user]);

  useEffect(() => {
    if (!user || activeSimulations.length === 0) {
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      const hour = now.getHours();

      let currentCyclePower = 0;
      let currentCycleCo2e = 0;
      let currentCycleKwh = 0;
      let cycleAnomalies = 0;

      activeSimulations.forEach(async (deviceId) => {
        let voltage = 220 + (Math.random() * 4 - 2);
        let isOffHours = hour < 7 || hour > 19;
        let baseCurrent = isOffHours ? 2 : 12;

        const hasAnomaly = isOffHours && Math.random() > 0.8;
        if (hasAnomaly) {
          baseCurrent += 8;
          cycleAnomalies++;
        }

        const current = baseCurrent + (Math.random() * 2 - 1);
        const power = voltage * current;
        const runTimeHours = 1 / 3600;
        const energy_kWh = (power / 1000) * runTimeHours;
        const co2e = energy_kWh * 0.8;

        currentCyclePower += power;
        currentCycleCo2e += co2e;
        currentCycleKwh += energy_kWh;

        const payload: MetricSnapshot = {
          userId: user.uid,
          deviceId: deviceId,
          timestamp: now.toISOString(),
          voltage: parseFloat(voltage.toFixed(2)),
          current: parseFloat(current.toFixed(2)),
          power: parseFloat(power.toFixed(2)),
          co2e: parseFloat(co2e.toFixed(6)),
          energy_kWh: parseFloat(energy_kWh.toFixed(6)),
          anomaly: hasAnomaly,
        };

        setLatestMetrics((prev) => ({
          ...prev,
          [deviceId]: payload,
        }));

        // Keep rolling history (max 200 entries for charting)
        setMetricsHistory((prev) => {
          const next = [...prev, payload];
          return next.length > 200 ? next.slice(-200) : next;
        });

        // Log anomalies as activities
        if (hasAnomaly && user) {
          logActivity(
            user.uid,
            "anomaly_detected",
            `Anomaly detected on device ${deviceId}: ${power.toFixed(0)}W off-hours spike`,
            "critical",
            { deviceId, power, current }
          );
        }

        try {
          const metricRef = doc(collection(db, "realtime_metrics"));
          await setDoc(metricRef, payload);
        } catch (err) {
          console.error("Simulation error", err);
        }
      });

      if (cycleAnomalies > 0) {
        setAnomalyCount((prev) => prev + cycleAnomalies);
      }

      setAggregatedStats((prev) => ({
        totalPower: currentCyclePower,
        totalCo2e: prev.totalCo2e + currentCycleCo2e,
        totalUsageKwh: prev.totalUsageKwh + currentCycleKwh,
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [user, activeSimulations]);

  const isAnySimulationActive = activeSimulations.length > 0;

  return (
    <SimulatorContext.Provider
      value={{
        activeSimulations,
        toggleSimulation,
        latestMetrics,
        metricsHistory,
        aggregatedStats,
        isAnySimulationActive,
        deviceCount: activeSimulations.length,
        onlineCount: activeSimulations.length,
        anomalyCount,
      }}
    >
      {children}
    </SimulatorContext.Provider>
  );
}
