"use client";

import { useState, useEffect } from "react";
import {
  Download,
  FileText,
  CheckCircle2,
  Loader2,
  Factory,
  FileSpreadsheet,
  AlertTriangle,
  TrendingDown,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useSimulator } from "@/components/SimulatorProvider";
import { logActivity } from "@/lib/activityLog";
import { useNotification } from "@/components/NotificationProvider";

export default function ReportsPage() {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const { isAnySimulationActive, aggregatedStats, activeSimulations, metricsHistory, anomalyCount } = useSimulator();
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

  const handleExport = async () => {
    setIsExporting(true);
    if (user) {
      await logActivity(user.uid, "export_report", "SRUK Audit report exported", "success", {
        totalEnergyMwh: totalEnergyMwh.toFixed(1),
        totalEmissions: calculateEmissions(totalEnergyMwh * 1000),
      });
    }
    setTimeout(() => {
      setIsExporting(false);
      addNotification("Dokumen Audit SRUK berhasil di-generate.", "success");
    }, 2000);
  };

  const calculateEmissions = (kwh: number) => {
    return ((kwh * co2Factor) / 1000).toFixed(1);
  };
  const baseEnergyMwh = 104.3;
  const liveSessionKwh = aggregatedStats.totalUsageKwh;
  const totalEnergyMwh = isAnySimulationActive
    ? baseEnergyMwh + liveSessionKwh / 1000
    : baseEnergyMwh;

  const totalEmissions = calculateEmissions(totalEnergyMwh * 1000);
  const now = new Date();
  const currentYear = now.getFullYear();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonth = now.getMonth();
  const baseEmissionData = [
    { period: `Jan ${currentYear}`, sector: "HVAC Systems", kwh: 45200, trend: null as string | null },
    { period: `Feb ${currentYear}`, sector: "HVAC Systems", kwh: 38100, trend: "↓ 15%" },
    { period: `Mar ${currentYear}`, sector: "HVAC + Lighting", kwh: 32400, trend: "↓ 10%" },
  ];
  const emissionData = [...baseEmissionData];
  if (isAnySimulationActive && currentMonth >= 3) {
    const liveKwh = 21000 + liveSessionKwh;
    const prevKwh = baseEmissionData[baseEmissionData.length - 1].kwh;
    const trendPercent = ((liveKwh - prevKwh) / prevKwh * 100).toFixed(0);
    const trendDir = liveKwh < prevKwh ? "↓" : "↑";
    emissionData.push({
      period: `${months[currentMonth]} ${currentYear} (Live)`,
      sector: `${activeSimulations.length} Active Device(s)`,
      kwh: Math.round(liveKwh),
      trend: `${trendDir} ${Math.abs(Number(trendPercent))}%`,
    });
  }

  // Determine validation status based on simulation data
  const validationStatus = isAnySimulationActive
    ? anomalyCount === 0
      ? { label: "Validated (Live)", color: "text-brand-accent-teal", icon: CheckCircle2 }
      : { label: `${anomalyCount} Anomalies Flagged`, color: "text-brand-accent-amber", icon: AlertTriangle }
    : { label: "Ready for SRUK Submission (Q1)", color: "text-brand-accent-teal", icon: CheckCircle2 };

  if (loading)
    return (
      <div className="p-8 max-w-6xl mx-auto flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
      </div>
    );

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 relative pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold italic text-text-ink mb-1">
            SRUK Compliance & Reports
          </h1>
          <p className="text-sm text-text-muted">
            Formal audit trail for National Carbon Registry (SRUK) July 2026 Mandate.
            {isAnySimulationActive && (
              <span className="ml-2 text-brand-accent-teal font-medium">
                • Live data from {activeSimulations.length} device(s)
              </span>
            )}
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center gap-2 bg-brand-primary text-text-on-dark px-5 py-2.5 rounded-xl font-bold tracking-wide transition-colors hover:bg-brand-primary-active disabled:opacity-70 disabled:cursor-not-allowed text-sm"
        >
          {isExporting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {isExporting ? "GENERATING..." : "DOWNLOAD AUDIT"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-card rounded-[24px] p-6 border border-surface-hairline flex flex-col justify-between min-h-[140px]">
          <div>
            <p className="text-[10px] uppercase font-bold text-text-muted-soft mb-2 tracking-widest">
              Total Energy Usage
            </p>
            <h3 className="text-3xl font-serif font-bold text-text-ink">
              {totalEnergyMwh.toFixed(1)} MWh
            </h3>
          </div>
          {isAnySimulationActive && (
            <div className="mt-3 flex items-center gap-1.5 text-[10px] text-brand-accent-teal font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-accent-teal animate-pulse"></span>
              +{(liveSessionKwh / 1000).toFixed(4)} MWh (Live Session)
            </div>
          )}
        </div>
        <div className="bg-surface-card rounded-[24px] p-6 border border-surface-hairline flex flex-col justify-between min-h-[140px]">
          <div>
            <p className="text-[10px] uppercase font-bold text-text-muted-soft mb-2 tracking-widest">
              Calculated Emissions
            </p>
            <h3 className="text-3xl font-serif font-bold text-text-ink">
              {totalEmissions} mt
            </h3>
          </div>
          {isAnySimulationActive && (
            <div className="mt-3 flex items-center gap-1.5 text-[10px] text-brand-accent-amber font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-accent-amber animate-pulse"></span>
              CO₂e Factor: {co2Factor} kgCO2e/kWh
            </div>
          )}
        </div>
        <div className="bg-surface-dark rounded-[24px] p-6 text-text-on-dark flex flex-col justify-between min-h-[140px] shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <validationStatus.icon className={`w-4 h-4 ${validationStatus.color}`} />
            <p className={`text-[10px] uppercase font-bold ${validationStatus.color} tracking-widest`}>
              {anomalyCount > 0 && isAnySimulationActive ? "Review Required" : "Status Validated"}
            </p>
          </div>
          <h3 className="text-xl font-medium leading-tight">
            {validationStatus.label}
          </h3>
          {isAnySimulationActive && (
            <div className="mt-2 text-[10px] text-text-on-dark-soft">
              Data quality: {metricsHistory.length} datapoints this session
            </div>
          )}
        </div>
      </div>

      <div className="bg-surface-canvas border border-surface-hairline rounded-[32px] overflow-hidden">
        <div className="p-6 border-b border-surface-hairline bg-surface-soft flex justify-between items-center">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="w-5 h-5 text-text-muted-soft" />
            <h3 className="font-bold text-text-ink text-sm uppercase tracking-tighter">
              Emission Equivalency Log
            </h3>
          </div>
          {isAnySimulationActive && (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-brand-accent-teal/10 text-brand-accent-teal text-[10px] font-bold uppercase tracking-widest rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-accent-teal animate-pulse"></span>
              Real-Time
            </span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-surface-canvas text-[11px] uppercase tracking-widest text-text-muted-soft">
              <tr>
                <th className="px-6 py-4 font-bold border-b border-surface-hairline">
                  Period
                </th>
                <th className="px-6 py-4 font-bold border-b border-surface-hairline">
                  Utility Sector
                </th>
                <th className="px-6 py-4 font-bold border-b border-surface-hairline">
                  Consumption (kWh)
                </th>
                <th className="px-6 py-4 font-bold border-b border-surface-hairline">
                  Conversion Factor
                </th>
                <th className="px-6 py-4 font-bold border-b border-surface-hairline text-right">
                  CO₂e (Tons)
                </th>
              </tr>
            </thead>
            <tbody className="text-text-body font-medium">
              {emissionData.map((row, index) => {
                const isLive = row.period.includes("Live");
                const isLastBase = index === baseEmissionData.length - 1 && !isLive;
                return (
                  <tr
                    key={row.period}
                    className={`hover:bg-surface-soft/50 transition-colors ${
                      isLive
                        ? "bg-brand-accent-teal/5 border-l-2 border-l-brand-accent-teal"
                        : isLastBase
                        ? "bg-brand-primary/5"
                        : ""
                    }`}
                  >
                    <td className="px-6 py-4 border-b border-surface-hairline border-dashed">
                      <div className="flex items-center gap-2">
                        {row.period}
                        {isLive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-accent-teal animate-pulse"></span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 border-b border-surface-hairline border-dashed">
                      {row.sector}
                    </td>
                    <td className="px-6 py-4 border-b border-surface-hairline border-dashed">
                      {row.kwh.toLocaleString("id-ID")}
                      {row.trend && (
                        <span className={`text-[10px] ml-2 ${
                          row.trend.includes("↓") ? "text-brand-accent-teal" : "text-brand-primary"
                        }`}>
                          {row.trend}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 border-b border-surface-hairline border-dashed">
                      {co2Factor} kgCO2e/kWh
                    </td>
                    <td className={`px-6 py-4 border-b border-surface-hairline border-dashed text-right font-serif text-base ${
                      isLive
                        ? "text-brand-accent-teal"
                        : index === 0
                        ? ""
                        : "text-brand-accent-teal"
                    }`}>
                      {calculateEmissions(row.kwh)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Session Summary */}
      {isAnySimulationActive && (
        <div className="bg-surface-dark rounded-[24px] p-6 text-text-on-dark">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-brand-accent-teal/20 flex items-center justify-center">
              <Factory className="w-5 h-5 text-brand-accent-teal" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest">Live Audit Session</h3>
              <p className="text-[10px] text-text-on-dark-soft mt-0.5">
                Real-time emission tracking from {activeSimulations.length} active IoT sensor(s)
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-surface-dark-elevated rounded-xl border border-surface-hairline/10">
              <div className="text-[10px] uppercase font-bold text-text-on-dark-soft tracking-widest mb-1">Session kWh</div>
              <div className="text-lg font-serif font-bold text-white">{liveSessionKwh.toFixed(4)}</div>
            </div>
            <div className="p-3 bg-surface-dark-elevated rounded-xl border border-surface-hairline/10">
              <div className="text-[10px] uppercase font-bold text-text-on-dark-soft tracking-widest mb-1">Session CO₂e</div>
              <div className="text-lg font-serif font-bold text-brand-accent-teal">{aggregatedStats.totalCo2e.toFixed(6)} kg</div>
            </div>
            <div className="p-3 bg-surface-dark-elevated rounded-xl border border-surface-hairline/10">
              <div className="text-[10px] uppercase font-bold text-text-on-dark-soft tracking-widest mb-1">Current Draw</div>
              <div className="text-lg font-serif font-bold text-brand-accent-amber">{(aggregatedStats.totalPower / 1000).toFixed(2)} kW</div>
            </div>
            <div className="p-3 bg-surface-dark-elevated rounded-xl border border-surface-hairline/10">
              <div className="text-[10px] uppercase font-bold text-text-on-dark-soft tracking-widest mb-1">Data Points</div>
              <div className="text-lg font-serif font-bold text-white">{metricsHistory.length}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
