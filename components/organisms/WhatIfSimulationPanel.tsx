import { Sparkles, Wrench } from "lucide-react";

export function WhatIfSimulationPanel({
  isAnySimulationActive,
  activeSimulationsCount,
  efficiencyCut,
  setEfficiencyCut,
  onOverride,
}: {
  isAnySimulationActive: boolean;
  activeSimulationsCount: number;
  efficiencyCut: number;
  setEfficiencyCut: (value: number) => void;
  onOverride: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="p-6 bg-brand-primary text-text-on-dark rounded-2xl flex flex-col h-full">
        <Sparkles className="w-5 h-5 text-brand-accent-amber mb-6" />
        <h3 className="text-xl font-serif font-bold italic mb-2">
          Simulasi What-If
        </h3>
        <p className="text-sm opacity-90 mb-6 leading-relaxed">
          {isAnySimulationActive
            ? `Sedang simulasi dengan ${activeSimulationsCount} perangkat live. Geser buat tes potongan efisiensi.`
            : "Geser buat simulasi pengurangan jam aktif. Prediksi dampak ke tagihan secara real-time lewat AI."}
        </p>

        <div className="mt-auto mb-6">
          <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-amber-50 mb-2">
            <span>0%</span>
            <span>Pengurangan {efficiencyCut}%</span>
            <span>30%</span>
          </div>
          <input
            type="range"
            min="0"
            max="30"
            value={efficiencyCut}
            onChange={(e) => setEfficiencyCut(Number(e.target.value))}
            className="w-full h-2 bg-brand-primary-active rounded-lg appearance-none cursor-pointer accent-surface-canvas"
          />
        </div>

        <button
          className="flex items-center justify-between w-full p-3 bg-surface-dark text-text-on-dark rounded-xl text-sm font-medium hover:bg-surface-dark-elevated transition-colors"
          onClick={onOverride}
        >
          <span>Terapkan Override</span>
          <Wrench className="w-4 h-4 text-brand-accent-teal" />
        </button>
      </div>
    </div>
  );
}