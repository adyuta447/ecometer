import { Sparkles } from "lucide-react";

export function TotalSavedCard({ totalSavedKwh }: { totalSavedKwh: number }) {
  return (
    <div className="flex-1 min-h-[300px]">
      <div className="bg-surface-card rounded-2xl p-6 border border-surface-hairline h-full flex flex-col justify-center items-center text-center">
        <Sparkles className="w-8 h-8 text-brand-accent-amber mb-4" />
        <h3 className="text-3xl font-serif font-bold text-text-ink mb-2">
          {totalSavedKwh.toLocaleString("id-ID")}
        </h3>
        <p className="text-sm text-text-muted">
          Total kWh yang dihemat seluruh perusahaan lewat gamifikasi bulan ini.
        </p>
      </div>
    </div>
  );
}
