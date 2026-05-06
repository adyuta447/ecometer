import { Factory } from "lucide-react";

export function ReportSessionSummary({
  activeSimulationsCount,
  liveSessionKwh,
  totalCo2e,
  totalPower,
}: {
  activeSimulationsCount: number;
  liveSessionKwh: number;
  totalCo2e: number;
  totalPower: number;
}) {
  return (
    <div className="bg-surface-dark rounded-2xl p-6 text-text-on-dark">
      <div className="flex items-center gap-3 mb-4">
        <Factory className="w-5 h-5 text-brand-accent-teal" />
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest">Sesi Audit Live</h3>
          <p className="text-[10px] text-text-on-dark-soft mt-0.5">
            Tracking emisi real-time dari {activeSimulationsCount} sensor IoT aktif
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
          <div className="text-lg font-serif font-bold text-brand-accent-teal">{totalCo2e.toFixed(6)} kg</div>
        </div>
        <div className="p-3 bg-surface-dark-elevated rounded-xl border border-surface-hairline/10">
          <div className="text-[10px] uppercase font-bold text-text-on-dark-soft tracking-widest mb-1">Tarikan Daya</div>
          <div className="text-lg font-serif font-bold text-brand-accent-amber">{(totalPower / 1000).toFixed(2)} kW</div>
        </div>
      </div>
    </div>
  );
}