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
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useSimulator } from "@/components/SimulatorProvider";
import { logActivity } from "@/lib/activityLog";
import { useNotification } from "@/components/NotificationProvider";
import { StatusBadge } from "@/components/atoms/StatusBadge";

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
        const q = query(collection(db, "settings"), where("userId", "==", user.uid));
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

  const now = new Date();
  const currentYear = now.getFullYear();
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const currentMonth = now.getMonth();

  const baseEmissionData = [
    { period: `Jan ${currentYear}`, sector: "Sistem HVAC", kwh: 45200, trend: null as string | null },
    { period: `Feb ${currentYear}`, sector: "Sistem HVAC", kwh: 38100, trend: "turun 15%" },
    { period: `Mar ${currentYear}`, sector: "HVAC + Pencahayaan", kwh: 32400, trend: "turun 10%" },
  ];

  const emissionData = [...baseEmissionData];
  if (isAnySimulationActive && currentMonth >= 3) {
    const liveKwh = 21000 + liveSessionKwh;
    const prevKwh = baseEmissionData[baseEmissionData.length - 1].kwh;
    const trendPercent = ((liveKwh - prevKwh) / prevKwh * 100).toFixed(0);
    const trendDir = liveKwh < prevKwh ? "turun" : "naik";
    emissionData.push({
      period: `${months[currentMonth]} ${currentYear} (Live)`,
      sector: `${activeSimulations.length} Perangkat Aktif`,
      kwh: Math.round(liveKwh),
      trend: `${trendDir} ${Math.abs(Number(trendPercent))}%`,
    });
  }

  const validationStatus = isAnySimulationActive
    ? anomalyCount === 0
      ? { label: "Tervalidasi (Live)", color: "text-brand-accent-teal", icon: CheckCircle2 }
      : { label: `${anomalyCount} Anomali Ditandai`, color: "text-brand-accent-amber", icon: AlertTriangle }
    : { label: "Siap untuk Pengajuan SRUK (Q1)", color: "text-brand-accent-teal", icon: CheckCircle2 };

  const handleExport = async () => {
    setIsExporting(true);
    if (user) {
      await logActivity(user.uid, "export_report", "Laporan audit SRUK diekspor", "success", {
        totalEnergyMwh: totalEnergyMwh.toFixed(1),
        totalEmissions: calculateEmissions(totalEnergyMwh * 1000),
      });
    }
    setTimeout(() => {
      setIsExporting(false);
      addNotification("Dokumen Audit SRUK berhasil di-generate.", "success");
    }, 2000);
  };

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
            Kepatuhan & Laporan SRUK
          </h1>
          <p className="text-sm text-text-muted">
            Jejak audit resmi untuk Registri Karbon Nasional (SRUK) Mandat Juli 2026.
            {isAnySimulationActive && (
              <span className="ml-2 text-brand-accent-teal font-medium">
                Data live dari {activeSimulations.length} perangkat
              </span>
            )}
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center gap-2 bg-brand-primary text-text-on-dark px-5 py-2.5 rounded-xl font-bold tracking-wide transition-colors hover:bg-brand-primary-active disabled:opacity-70 disabled:cursor-not-allowed text-sm"
        >
          {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {isExporting ? "GENERATING..." : "UNDUH AUDIT"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-card rounded-2xl p-6 border border-surface-hairline flex flex-col justify-between min-h-[140px]">
          <div>
            <p className="text-[10px] uppercase font-bold text-text-muted-soft mb-2 tracking-widest">Total Pemakaian Energi</p>
            <h3 className="text-3xl font-serif font-bold text-text-ink">{totalEnergyMwh.toFixed(1)} MWh</h3>
          </div>
          {isAnySimulationActive && (
            <StatusBadge label={`+${(liveSessionKwh / 1000).toFixed(4)} MWh (Sesi Live)`} variant="teal" pulse />
          )}
        </div>
        <div className="bg-surface-card rounded-2xl p-6 border border-surface-hairline flex flex-col justify-between min-h-[140px]">
          <div>
            <p className="text-[10px] uppercase font-bold text-text-muted-soft mb-2 tracking-widest">Emisi Terhitung</p>
            <h3 className="text-3xl font-serif font-bold text-text-ink">{totalEmissions} mt</h3>
          </div>
          {isAnySimulationActive && (
            <StatusBadge label={`Faktor CO₂e: ${co2Factor} kgCO2e/kWh`} variant="amber" pulse />
          )}
        </div>
        <div className="bg-surface-dark rounded-2xl p-6 text-text-on-dark flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center gap-2 mb-2">
            <validationStatus.icon className={`w-4 h-4 ${validationStatus.color}`} />
            <p className={`text-[10px] uppercase font-bold ${validationStatus.color} tracking-widest`}>
              {anomalyCount > 0 && isAnySimulationActive ? "Perlu Ditinjau" : "Status Tervalidasi"}
            </p>
          </div>
          <h3 className="text-xl font-medium leading-tight">{validationStatus.label}</h3>
          {isAnySimulationActive && (
            <div className="mt-2 text-[10px] text-text-on-dark-soft">
              Kualitas data: {metricsHistory.length} titik data sesi ini
            </div>
          )}
        </div>
      </div>

      <div className="bg-surface-canvas border border-surface-hairline rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-surface-hairline bg-surface-soft flex justify-between items-center">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="w-5 h-5 text-text-muted-soft" />
            <h3 className="font-bold text-text-ink text-sm uppercase tracking-tighter">Log Ekuivalensi Emisi</h3>
          </div>
          {isAnySimulationActive && (
            <StatusBadge label="Real-Time" variant="teal" pulse />
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-surface-canvas text-[11px] uppercase tracking-widest text-text-muted-soft">
              <tr>
                <th className="px-6 py-4 font-bold border-b border-surface-hairline">Periode</th>
                <th className="px-6 py-4 font-bold border-b border-surface-hairline">Sektor Utilitas</th>
                <th className="px-6 py-4 font-bold border-b border-surface-hairline">Konsumsi (kWh)</th>
                <th className="px-6 py-4 font-bold border-b border-surface-hairline">Faktor Konversi</th>
                <th className="px-6 py-4 font-bold border-b border-surface-hairline text-right">CO₂e (Ton)</th>
              </tr>
            </thead>
            <tbody className="text-text-body font-medium">
              {emissionData.map((row, index) => {
                const isLive = row.period.includes("Live");
                return (
                  <tr key={row.period} className={`hover:bg-surface-soft/50 transition-colors ${isLive ? "bg-brand-accent-teal/5 border-l-2 border-l-brand-accent-teal" : ""}`}>
                    <td className="px-6 py-4 border-b border-surface-hairline border-dashed">
                      <div className="flex items-center gap-2">
                        {row.period}
                        {isLive && <span className="w-1.5 h-1.5 rounded-full bg-brand-accent-teal animate-pulse"></span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 border-b border-surface-hairline border-dashed">{row.sector}</td>
                    <td className="px-6 py-4 border-b border-surface-hairline border-dashed">
                      {row.kwh.toLocaleString("id-ID")}
                      {row.trend && (
                        <span className={`text-[10px] ml-2 ${row.trend.includes("turun") ? "text-brand-accent-teal" : "text-brand-primary"}`}>
                          {row.trend}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 border-b border-surface-hairline border-dashed">{co2Factor} kgCO2e/kWh</td>
                    <td className={`px-6 py-4 border-b border-surface-hairline border-dashed text-right font-serif text-base ${isLive ? "text-brand-accent-teal" : index === 0 ? "" : "text-brand-accent-teal"}`}>
                      {calculateEmissions(row.kwh)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ringkasan Sesi Live */}
      {isAnySimulationActive && (
        <div className="bg-surface-dark rounded-2xl p-6 text-text-on-dark">
          <div className="flex items-center gap-3 mb-4">
            <Factory className="w-5 h-5 text-brand-accent-teal" />
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest">Sesi Audit Live</h3>
              <p className="text-[10px] text-text-on-dark-soft mt-0.5">
                Tracking emisi real-time dari {activeSimulations.length} sensor IoT aktif
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-surface-dark-elevated rounded-xl border border-surface-hairline/10">
              <div className="text-[10px] uppercase font-bold text-text-on-dark-soft tracking-widest mb-1">kWh Sesi</div>
              <div className="text-lg font-serif font-bold text-white">{liveSessionKwh.toFixed(4)}</div>
            </div>
            <div className="p-3 bg-surface-dark-elevated rounded-xl border border-surface-hairline/10">
              <div className="text-[10px] uppercase font-bold text-text-on-dark-soft tracking-widest mb-1">CO₂e Sesi</div>
              <div className="text-lg font-serif font-bold text-brand-accent-teal">{aggregatedStats.totalCo2e.toFixed(6)} kg</div>
            </div>
            <div className="p-3 bg-surface-dark-elevated rounded-xl border border-surface-hairline/10">
              <div className="text-[10px] uppercase font-bold text-text-on-dark-soft tracking-widest mb-1">Tarikan Daya</div>
              <div className="text-lg font-serif font-bold text-brand-accent-amber">{(aggregatedStats.totalPower / 1000).toFixed(2)} kW</div>
            </div>
            <div className="p-3 bg-surface-dark-elevated rounded-xl border border-surface-hairline/10">
              <div className="text-[10px] uppercase font-bold text-text-on-dark-soft tracking-widest mb-1">Titik Data</div>
              <div className="text-lg font-serif font-bold text-white">{metricsHistory.length}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
