export function ModelAccuracyMetrics({
  isAnySimulationActive,
  metricsHistoryLength,
  computedMape,
}: {
  isAnySimulationActive: boolean;
  metricsHistoryLength: number;
  computedMape: number;
}) {
  return (
    <div className="bg-surface-card rounded-2xl p-6 border border-surface-hairline mt-6">
      <h3 className="text-sm font-bold uppercase tracking-widest text-text-ink mb-6">
        Akurasi & Pelatihan Model
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-4 bg-surface-canvas rounded-2xl border border-surface-hairline">
          <div className="text-[10px] uppercase font-bold text-text-muted-soft mb-1">
            Algoritma
          </div>
          <div className="text-sm font-medium">Random Forest Regressor</div>
        </div>
        <div className="p-4 bg-surface-canvas rounded-2xl border border-surface-hairline">
          <div className="text-[10px] uppercase font-bold text-text-muted-soft mb-1">
            Ukuran Dataset
          </div>
          <div className="text-sm font-medium">
            {isAnySimulationActive
              ? `${(12400000 + metricsHistoryLength * 100).toLocaleString()} Titik Data`
              : "12,4 Juta Titik Data"}
          </div>
        </div>
        <div className="p-4 bg-surface-canvas rounded-2xl border border-surface-hairline">
          <div className="text-[10px] uppercase font-bold text-text-muted-soft mb-1">
            Tingkat Error MAPE
          </div>
          <div
            className={`text-sm font-medium ${computedMape < 3 ? "text-brand-accent-teal" : computedMape < 5 ? "text-brand-accent-amber" : "text-brand-primary"}`}
          >
            {computedMape.toFixed(2)}%{" "}
            {computedMape < 3
              ? "(Sangat Akurat)"
              : computedMape < 5
                ? "(Cukup Baik)"
                : "(Perlu Review)"}
          </div>
        </div>
      </div>
    </div>
  );
}
