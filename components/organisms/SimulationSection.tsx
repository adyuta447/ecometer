import { Calculator, Info } from "lucide-react";

interface SimulationSectionProps {
  tariffNum: number;
  budgetNum: number;
  co2Num: number;
  estimatedKwh: number;
  estimatedEmissions: number;
  dailyCost: number;
}

export function SimulationSection({
  tariffNum,
  budgetNum,
  co2Num,
  estimatedKwh,
  estimatedEmissions,
  dailyCost,
}: SimulationSectionProps) {
  return (
    <div className="p-5 bg-surface-canvas rounded-2xl border border-surface-hairline space-y-4">
      <h3 className="font-bold text-text-ink text-sm uppercase tracking-tight flex items-center gap-2 border-b border-surface-hairline pb-4">
        <Calculator className="w-4 h-4 text-brand-accent-teal" /> Simulasi
        Perhitungan
      </h3>

      <p className="text-xs text-text-muted leading-relaxed">
        Berdasarkan parameter yang kamu isi di atas, berikut estimasi
        perhitungan yang dipakai dashboard untuk proyeksi dan laporan audit.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        <div className="p-4 bg-surface-soft rounded-xl border border-surface-hairline">
          <div className="text-[10px] uppercase font-bold text-text-muted-soft tracking-widest mb-1">
            Estimasi Pemakaian Maksimal
          </div>
          <div className="text-lg font-serif font-bold text-text-ink">
            {estimatedKwh.toLocaleString("id-ID", { maximumFractionDigits: 0 })}{" "}
            kWh
          </div>
          <p className="text-[10px] text-text-muted-soft mt-1">
            Rumus: Anggaran / Tarif = Rp {budgetNum.toLocaleString("id-ID")} /
            Rp {tariffNum.toLocaleString("id-ID")}
          </p>
        </div>

        <div className="p-4 bg-surface-soft rounded-xl border border-surface-hairline">
          <div className="text-[10px] uppercase font-bold text-text-muted-soft tracking-widest mb-1">
            Estimasi Emisi Bulanan
          </div>
          <div className="text-lg font-serif font-bold text-text-ink">
            {estimatedEmissions.toFixed(1)} ton CO₂e
          </div>
          <p className="text-[10px] text-text-muted-soft mt-1">
            Rumus: kWh x Faktor CO₂e ={" "}
            {estimatedKwh.toLocaleString("id-ID", { maximumFractionDigits: 0 })}{" "}
            x {co2Num}
          </p>
        </div>

        <div className="p-4 bg-surface-soft rounded-xl border border-surface-hairline">
          <div className="text-[10px] uppercase font-bold text-text-muted-soft tracking-widest mb-1">
            Biaya Harian Rata-rata
          </div>
          <div className="text-lg font-serif font-bold text-text-ink">
            Rp {dailyCost.toLocaleString("id-ID", { maximumFractionDigits: 0 })}
          </div>
          <p className="text-[10px] text-text-muted-soft mt-1">
            Rumus: Anggaran / 30 hari
          </p>
        </div>

        <div className="p-4 bg-surface-soft rounded-xl border border-surface-hairline">
          <div className="text-[10px] uppercase font-bold text-text-muted-soft tracking-widest mb-1">
            Biaya per Ton CO₂e
          </div>
          <div className="text-lg font-serif font-bold text-text-ink">
            Rp{" "}
            {estimatedEmissions > 0
              ? (budgetNum / estimatedEmissions).toLocaleString("id-ID", {
                  maximumFractionDigits: 0,
                })
              : "0"}
          </div>
          <p className="text-[10px] text-text-muted-soft mt-1">
            Rumus: Anggaran / Estimasi Emisi
          </p>
        </div>
      </div>

      <div className="flex items-start gap-2 p-3 bg-surface-soft rounded-xl border border-surface-hairline mt-2">
        <Info className="w-4 h-4 text-brand-primary flex-shrink-0 mt-0.5" />
        <p className="text-xs text-text-muted leading-relaxed">
          Angka di atas bersifat estimasi berdasarkan konfigurasi. Perhitungan
          aktual akan mempertimbangkan pola penggunaan perangkat IoT, anomali
          terdeteksi, dan penyesuaian prediksi AI/ML secara real-time.
        </p>
      </div>
    </div>
  );
}
