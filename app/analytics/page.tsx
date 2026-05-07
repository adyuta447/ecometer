"use client";

import { useAnalytics } from "@/hooks/useAnalytics";
import { Loader2 } from "lucide-react";
import { StatusBadge } from "@/components/atoms/StatusBadge";
import { BillProjectionChart } from "@/components/organisms/BillProjectionChart";
import { WhatIfSimulationPanel } from "@/components/organisms/WhatIfSimulationPanel";
import { RealTimePowerChart } from "@/components/organisms/RealTimePowerChart";
import { ModelAccuracyMetrics } from "@/components/organisms/ModelAccuracyMetrics";

export default function AnalyticsPage() {
  const {
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
  } = useAnalytics();

  if (loading) {
    return (
      <div className="p-4 md:p-8 max-w-6xl mx-auto flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
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
          <StatusBadge
            label={`${activeSimulations.length} Perangkat Streaming`}
            variant="teal"
            pulse
          />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <BillProjectionChart
          isAnySimulationActive={isAnySimulationActive}
          currentTotalKWh={currentTotalKWh}
          baseLineTotalKWh={baseLineTotalKWh}
          efficiencyCut={efficiencyCut}
          tariff={tariff}
          aggregatedStats={aggregatedStats}
          chartData={chartData}
        />

        <WhatIfSimulationPanel
          isAnySimulationActive={isAnySimulationActive}
          activeSimulationsCount={activeSimulations.length}
          efficiencyCut={efficiencyCut}
          setEfficiencyCut={setEfficiencyCut}
          onOverride={handleOverride}
        />
      </div>

      {isAnySimulationActive && (
        <RealTimePowerChart powerChartData={powerChartData} />
      )}

      <ModelAccuracyMetrics
        isAnySimulationActive={isAnySimulationActive}
        metricsHistoryLength={metricsHistory.length}
        computedMape={computedMape}
      />
    </div>
  );
}
