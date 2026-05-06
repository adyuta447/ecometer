import { Router, Trash2, Power, WifiHigh, WifiOff } from "lucide-react";

export function DeviceTable({
  devices,
  activeSimulations,
  latestMetrics,
  onDelete,
  onOpenSimulator,
}: {
  devices: any[];
  activeSimulations: string[];
  latestMetrics: any;
  onDelete: (id: string) => void;
  onOpenSimulator: (device: any) => void;
}) {
  return (
    <div className="bg-surface-canvas border border-surface-hairline rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[800px]">
          <thead className="bg-surface-soft text-[11px] uppercase tracking-widest text-text-muted-soft">
            <tr>
              <th className="px-6 py-4 font-bold border-b border-surface-hairline">
                Nama Perangkat
              </th>
              <th className="px-6 py-4 font-bold border-b border-surface-hairline">
                Alamat MAC
              </th>
              <th className="px-6 py-4 font-bold border-b border-surface-hairline">
                Lokasi
              </th>
              <th className="px-6 py-4 font-bold border-b border-surface-hairline">
                Status
              </th>
              <th className="px-6 py-4 font-bold border-b border-surface-hairline">
                MAPE
              </th>
              <th className="px-6 py-4 font-bold border-b border-surface-hairline">
                Kesehatan Aset (Prediktif)
              </th>
              <th className="px-6 py-4 font-bold border-b border-surface-hairline">
                Aktuasi Pintar
              </th>
              <th className="px-6 py-4 font-bold border-b border-surface-hairline text-right">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="text-text-body">
            {devices.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-8 text-center text-text-muted"
                >
                  Belum ada perangkat terdaftar.
                </td>
              </tr>
            )}
            {devices.map((device) => {
              const metrics = latestMetrics[device.id];
              const isSimulating = activeSimulations.includes(device.id);

              return (
                <tr
                  key={device.id}
                  className={`hover:bg-surface-soft/50 transition-colors border-b border-surface-hairline last:border-0 border-dashed ${
                    metrics?.anomaly ? "bg-brand-primary/5" : ""
                  }`}
                >
                  <td className="px-6 py-4 font-medium flex items-center gap-3">
                    <Router
                      className={`w-4 h-4 ${
                        device.status === "online" ||
                        device.status === "Active" ||
                        isSimulating
                          ? "text-text-muted"
                          : "text-brand-primary"
                      }`}
                    />
                    <div>
                      {device.name}
                      {metrics?.anomaly && (
                        <span className="ml-2 px-1.5 py-0.5 bg-brand-primary/10 text-brand-primary text-[9px] font-bold uppercase rounded">
                          Anomali
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-[11px] opacity-70">
                    {device.mac}
                  </td>
                  <td className="px-6 py-4 opacity-70">
                    {device.location || "-"}
                  </td>
                  <td className="px-6 py-4">
                    {device.status === "online" ||
                    device.status === "Active" ||
                    isSimulating ? (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-brand-accent-teal bg-brand-accent-teal/10 px-2 py-1 rounded-md">
                        {isSimulating ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-accent-teal animate-pulse"></span>
                        ) : (
                          <WifiHigh className="w-3 h-3" />
                        )}
                        {isSimulating ? "Live Sim" : "Online"}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-brand-primary bg-brand-primary/10 px-2 py-1 rounded-md">
                        <WifiOff className="w-3 h-3" />
                        Offline
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {isSimulating ? (
                      <span className="font-mono text-xs">
                        {(2 + Math.random() * 1).toFixed(2)}%
                      </span>
                    ) : (
                      <span className="text-text-muted-soft text-xs">
                        {device.mape}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-full bg-surface-soft rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-1000 ${
                          metrics?.anomaly
                            ? "bg-brand-primary w-2/3"
                            : isSimulating
                              ? "bg-brand-accent-teal w-full"
                              : "bg-surface-hairline w-1/4"
                        }`}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button className="px-3 py-1 bg-surface-soft border border-surface-hairline rounded-md text-[10px] font-bold uppercase tracking-widest text-text-muted hover:text-brand-accent-teal hover:border-brand-accent-teal transition-colors">
                      Picu
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onOpenSimulator(device)}
                        className={`p-2 transition-colors rounded-lg ${
                          isSimulating
                            ? "text-brand-accent-teal bg-brand-accent-teal/10 hit-box"
                            : "text-text-muted hover:text-brand-accent-teal bg-surface-soft"
                        }`}
                        title="Simulator Digital Twin"
                      >
                        <Power className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(device.id)}
                        className="p-2 text-text-muted hover:text-red-500 transition-colors rounded-lg bg-surface-soft"
                        title="Hapus Perangkat"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
