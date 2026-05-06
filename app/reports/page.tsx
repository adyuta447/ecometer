"use client";

import { Download, Loader2 } from "lucide-react";
import { useReports } from "@/hooks/useReports";
import { ReportSummaryCards } from "@/components/organisms/ReportSummaryCards";
import { ReportEmissionsTable } from "@/components/organisms/ReportEmissionsTable";
import { ReportSessionSummary } from "@/components/organisms/ReportSessionSummary";

export default function ReportsPage() {
  const {
    loading,
    isExporting,
    co2Factor,
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
  } = useReports();

  if (loading) {
    return (
      <div className="p-4 md:p-8 max-w-6xl mx-auto flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
      </div>
    );
  }

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
    const trendPercent = (((liveKwh - prevKwh) / prevKwh) * 100).toFixed(0);
    const trendDir = liveKwh < prevKwh ? "turun" : "naik";
    emissionData.push({
      period: `${months[currentMonth]} ${currentYear} (Live)`,
      sector: `${activeSimulations.length} Perangkat Aktif`,
      kwh: Math.round(liveKwh),
      trend: `${trendDir} ${Math.abs(Number(trendPercent))}%`,
    });
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 relative pb-20">
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

      <ReportSummaryCards
        totalEnergyMwh={totalEnergyMwh}
        liveSessionKwh={liveSessionKwh}
        totalEmissions={totalEmissions}
        co2Factor={co2Factor}
        isAnySimulationActive={isAnySimulationActive}
        anomalyCount={anomalyCount}
        metricsHistoryCount={metricsHistory.length}
      />

      <ReportEmissionsTable
        emissionData={emissionData}
        co2Factor={co2Factor}
        calculateEmissions={calculateEmissions}
        isAnySimulationActive={isAnySimulationActive}
      />

      {isAnySimulationActive && (
        <ReportSessionSummary
          activeSimulationsCount={activeSimulations.length}
          liveSessionKwh={liveSessionKwh}
          totalCo2e={aggregatedStats.totalCo2e}
          totalPower={aggregatedStats.totalPower}
        />
      )}
    </div>
  );
}
