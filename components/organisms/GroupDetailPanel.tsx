import { Shield, MapPin, Building2, Trash2, Router } from "lucide-react";

export function GroupDetailPanel({
  activeSegment,
  groupDeviceStats,
  devices,
  activeSimulations,
  latestMetrics,
  onDelete,
}: {
  activeSegment: any;
  groupDeviceStats: any;
  devices: any[];
  activeSimulations: string[];
  latestMetrics: any;
  onDelete: (id: string) => void;
}) {
  if (!activeSegment) {
    return (
      <div className="col-span-3 bg-surface-card rounded-2xl p-12 border border-surface-hairline text-center flex flex-col items-center justify-center min-h-[300px]">
        <Shield className="w-12 h-12 text-surface-hairline mb-4" />
        <p className="text-text-muted">
          Pilih atau buat grup virtual buat lihat data telemetrinya.
        </p>
      </div>
    );
  }

  return (
    <div className="col-span-3 space-y-6">
      <div className="bg-surface-card rounded-2xl p-6 border border-surface-hairline flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Shield className="w-6 h-6 text-brand-accent-teal" />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-text-ink">{activeSegment.name}</h2>
              <span className="px-2 py-0.5 bg-brand-accent-teal/10 text-brand-accent-teal text-[10px] font-bold uppercase tracking-widest rounded-md">
                Terisolasi
              </span>
              {groupDeviceStats && groupDeviceStats.activeDevices > 0 && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-brand-accent-teal/10 text-brand-accent-teal text-[10px] font-bold uppercase tracking-widest rounded-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-accent-teal animate-pulse"></span>
                  Live
                </span>
              )}
            </div>
            <p className="text-sm text-text-muted">
              {activeSegment.description || `Pemakaian: ${activeSegment.usage} | Emisi: ${activeSegment.co2}`}
            </p>
            {(activeSegment.location || activeSegment.floor) && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {activeSegment.location && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface-soft rounded-md text-[10px] text-text-muted font-medium">
                    <MapPin className="w-2.5 h-2.5" />
                    {activeSegment.location}
                  </span>
                )}
                {activeSegment.floor && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface-soft rounded-md text-[10px] text-text-muted font-medium">
                    <Building2 className="w-2.5 h-2.5" />
                    {activeSegment.floor}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="text-right flex items-center gap-4">
          <button
            onClick={() => onDelete(activeSegment.id)}
            className="p-2 text-text-muted hover:text-red-500 transition-colors rounded-lg bg-surface-soft"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {groupDeviceStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-surface-card rounded-2xl p-4 border border-surface-hairline">
            <div className="text-[10px] uppercase font-bold text-text-muted-soft tracking-widest mb-1">Total Perangkat</div>
            <div className="text-xl font-serif font-bold text-text-ink">{groupDeviceStats.totalDevices}</div>
          </div>
          <div className="bg-surface-card rounded-2xl p-4 border border-surface-hairline">
            <div className="text-[10px] uppercase font-bold text-text-muted-soft tracking-widest mb-1">Aktif (Sim)</div>
            <div className="text-xl font-serif font-bold text-brand-accent-teal">{groupDeviceStats.activeDevices}</div>
          </div>
          <div className="bg-surface-card rounded-2xl p-4 border border-surface-hairline">
            <div className="text-[10px] uppercase font-bold text-text-muted-soft tracking-widest mb-1">Daya Grup</div>
            <div className="text-xl font-serif font-bold text-brand-accent-amber">{(groupDeviceStats.totalPower / 1000).toFixed(2)} kW</div>
          </div>
          <div className="bg-surface-card rounded-2xl p-4 border border-surface-hairline">
            <div className="text-[10px] uppercase font-bold text-text-muted-soft tracking-widest mb-1">Anomali</div>
            <div className={`text-xl font-serif font-bold ${groupDeviceStats.anomalies > 0 ? "text-brand-primary" : "text-brand-accent-teal"}`}>
              {groupDeviceStats.anomalies}
            </div>
          </div>
        </div>
      )}

      {activeSegment.deviceIds?.length > 0 && (
        <div className="bg-surface-card rounded-2xl p-5 border border-surface-hairline">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-text-muted-soft mb-4">Perangkat di Grup Ini</h3>
          <div className="space-y-2">
            {devices
              .filter((d) => activeSegment.deviceIds.includes(d.id))
              .map((device) => {
                const isSimulating = activeSimulations.includes(device.id);
                const metrics = latestMetrics[device.id];
                return (
                  <div key={device.id} className="flex items-center justify-between p-3 bg-surface-soft rounded-xl">
                    <div className="flex items-center gap-3">
                      <Router className={`w-4 h-4 ${isSimulating ? "text-brand-accent-teal" : "text-text-muted"}`} />
                      <div>
                        <div className="text-sm font-medium text-text-ink">{device.name}</div>
                        <div className="text-[10px] text-text-muted-soft font-mono">{device.mac}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {isSimulating && metrics && (
                        <span className="text-[10px] font-mono text-brand-accent-teal font-medium">
                          {metrics.power.toFixed(0)}W
                        </span>
                      )}
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest ${
                        isSimulating ? "bg-brand-accent-teal/10 text-brand-accent-teal" : "bg-surface-hairline text-text-muted"
                      }`}>
                        {isSimulating ? "Live" : "Idle"}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      <div className="bg-surface-soft rounded-2xl p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold uppercase tracking-tighter text-text-ink">{activeSegment.name}</h3>
          <span className="text-xs text-brand-accent-teal font-medium tracking-tight">
            {groupDeviceStats && groupDeviceStats.activeDevices > 0
              ? `${(groupDeviceStats.totalPower / 1000).toFixed(2)} kW (Live)`
              : activeSegment.usage}
          </span>
        </div>
        <div className="h-2 bg-surface-hairline rounded-full overflow-hidden mb-2">
          <div className="bg-brand-primary h-full transition-all duration-1000" style={{ width: activeSegment.capacityPercentage || "0%" }}></div>
        </div>
        <div className="flex justify-between text-[10px] text-text-muted-soft">
          <span>{activeSegment.capacityPercentage || "0%"} Kapasitas</span>
          <span>{activeSegment.co2}</span>
        </div>
      </div>
    </div>
  );
}