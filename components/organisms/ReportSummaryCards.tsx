import { CheckCircle2, AlertTriangle } from "lucide-react";
import { StatusBadge } from "@/components/atoms/StatusBadge";

export function ReportSummaryCards({
  totalEnergyMwh,
  liveSessionKwh,
  totalEmissions,
  co2Factor,
  isAnySimulationActive,
  anomalyCount,
  metricsHistoryCount,
}: {
  totalEnergyMwh: number;
  liveSessionKwh: number;
  totalEmissions: string;
  co2Factor: number;
  isAnySimulationActive: boolean;
  anomalyCount: number;
  metricsHistoryCount: number;
}) {
  const validationStatus = isAnySimulationActive
    ? anomalyCount === 0
      ? { label: "Tervalidasi (Live)", color: "text-brand-accent-teal", icon: CheckCircle2 }
      : { label: `${anomalyCount} Anomali Ditandai`, color: "text-brand-accent-amber", icon: AlertTriangle }
    : { label: "Siap untuk Pengajuan SRUK (Q1)", color: "text-brand-accent-teal", icon: CheckCircle2 };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-surface-card rounded-2xl p-6 border border-surface-hairline flex flex-col justify-between min-h-[140px]">
        <div>
          <p className="text-[10px] uppercase font-bold text-text-muted-soft mb-2 tracking-widest">
            Total Pemakaian Energi
          </p>
          <h3 className="text-3xl font-serif font-bold text-text-ink">
            {totalEnergyMwh.toFixed(1)} MWh
          </h3>
        </div>
        {isAnySimulationActive && (
          <StatusBadge label={`+${(liveSessionKwh / 1000).toFixed(4)} MWh (Sesi Live)`} variant="teal" pulse />
        )}
      </div>
      <div className="bg-surface-card rounded-2xl p-6 border border-surface-hairline flex flex-col justify-between min-h-[140px]">
        <div>
          <p className="text-[10px] uppercase font-bold text-text-muted-soft mb-2 tracking-widest">
            Emisi Terhitung
          </p>
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
            Kualitas data: {metricsHistoryCount} titik data sesi ini
          </div>
        )}
      </div>
    </div>
  );
}