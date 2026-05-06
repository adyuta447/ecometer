"use client";

import { useAnalytics } from "@/hooks/useAnalytics";
import { BrainCircuit, LineChart as LineChartIcon } from "lucide-react";
import SectionLabel from "@/components/atoms/SectionLabel";
import StatCard from "@/components/atoms/StatCard";
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
      <div className="flex h-full items-center justify-center text-text-muted-soft">
        <p className="animate-pulse">Loading engine AI...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <SectionLabel icon={<BrainCircuit />} text="Kecerdasan Buatan" />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Baseline Konsumsi"
          value={`${baseLineTotalKWh.toLocaleString()} kWh`}
          subValue="Prediksi awal tanpa efisiensi"
          icon={<LineChartIcon />}
        />
        <StatCard
          title="Proyeksi Baru"
          value={`${currentTotalKWh.toLocaleString(undefined, { maximumFractionDigits: 0 })} kWh`}
          subValue={
            efficiencyCut > 0
              ? `Dengan potongan ${efficiencyCut}%`
              : "Tanpa potongan efisiensi"
          }
          icon={<BrainCircuit />}
          trend={
            efficiencyCut > 0
              ? { value: efficiencyCut, label: "Lebih Efisien", isPositive: true }
              : undefined
          }
        />
        <StatCard
          title="Tingkat Akurasi"
          value={`${computedMape.toFixed(2)}%`}
          subValue={`MAPE (Mean Abs. Percentage Error)`}
        />
        <StatCard
          title="Status Pembaruan Model"
          value="Siap"
          subValue={`Dilatih ualng: ${lastTrainedAgo}`}
          trend={isAnySimulationActive ? { value: 0, label: "Live Data Feed", isPositive: true } : undefined}
        />
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
