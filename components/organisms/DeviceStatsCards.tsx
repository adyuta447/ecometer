import { Activity, AlertCircle } from "lucide-react";

export function DeviceStatsCards({
  activeSensorsCount,
  offlineSystemsCount,
  globalMape,
}: {
  activeSensorsCount: number;
  offlineSystemsCount: number;
  globalMape: string;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-surface-card rounded-2xl p-5 border border-surface-hairline">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] uppercase font-bold text-text-muted-soft tracking-widest">
            Sensor Aktif
          </span>
          <Activity className="w-4 h-4 text-brand-accent-teal" />
        </div>
        <div className="text-2xl font-serif font-bold text-text-ink">
          {activeSensorsCount}
        </div>
      </div>
      <div className="bg-surface-card rounded-2xl p-5 border border-surface-hairline border-brand-primary/30">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] uppercase font-bold text-brand-primary tracking-widest">
            Sistem Offline
          </span>
          <AlertCircle className="w-4 h-4 text-brand-primary" />
        </div>
        <div className="text-2xl font-serif font-bold text-text-ink">
          {offlineSystemsCount}
        </div>
      </div>
      <div className="bg-surface-card rounded-2xl p-5 border border-surface-hairline md:col-span-2">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] uppercase font-bold text-text-muted-soft tracking-widest">
            Akurasi MAPE Global
          </span>
        </div>
        <div className="text-2xl font-serif font-bold text-text-ink flex items-end gap-2">
          {globalMape}{" "}
          <span className="text-sm font-sans font-medium text-brand-accent-teal mb-1">
            Sangat Baik
          </span>
        </div>
      </div>
    </div>
  );
}
