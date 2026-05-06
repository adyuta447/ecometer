import { useState } from "react";
import { X, Loader2, Check, Router } from "lucide-react";

export function CreateGroupModal({
  devices,
  activeSimulations,
  saving,
  onClose,
  onCreate,
}: {
  devices: any[];
  activeSimulations: string[];
  saving: boolean;
  onClose: () => void;
  onCreate: (groupData: any) => Promise<boolean>;
}) {
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    location: "",
    floor: "",
    deviceIds: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onCreate(newGroup);
    if (success) {
      onClose();
    }
  };

  const toggleDevice = (deviceId: string) => {
    setNewGroup((prev) => ({
      ...prev,
      deviceIds: prev.deviceIds.includes(deviceId)
        ? prev.deviceIds.filter((id) => id !== deviceId)
        : [...prev.deviceIds, deviceId],
    }));
  };

  return (
    <div className="fixed inset-0 bg-surface-dark/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface-dark-elevated border border-surface-hairline/20 rounded-2xl p-8 w-full max-w-lg text-text-on-dark max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-serif font-bold italic">Buat Grup Virtual</h2>
          <button onClick={onClose} className="text-text-on-dark-soft hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-text-on-dark-soft mb-2">Nama Grup</label>
            <input
              type="text"
              value={newGroup.name}
              onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
              autoFocus
              placeholder="cth. Server Room B"
              className="w-full bg-surface-dark border border-surface-hairline/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-primary text-white transition-colors placeholder:text-text-on-dark-soft/50"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-text-on-dark-soft mb-2">Deskripsi (Opsional)</label>
            <textarea
              value={newGroup.description}
              onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
              placeholder="Deskripsi singkat grup ini"
              rows={2}
              className="w-full bg-surface-dark border border-surface-hairline/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-primary text-white transition-colors placeholder:text-text-on-dark-soft/50 resize-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-text-on-dark-soft mb-2">Lokasi</label>
            <input
              type="text"
              value={newGroup.location}
              onChange={(e) => setNewGroup({ ...newGroup, location: e.target.value })}
              placeholder="cth. Gedung Utama, Jl. Sudirman No.10"
              className="w-full bg-surface-dark border border-surface-hairline/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-primary text-white transition-colors placeholder:text-text-on-dark-soft/50"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-text-on-dark-soft mb-2">Lantai</label>
            <input
              type="text"
              value={newGroup.floor}
              onChange={(e) => setNewGroup({ ...newGroup, floor: e.target.value })}
              placeholder="cth. Lantai 3, Sayap Barat"
              className="w-full bg-surface-dark border border-surface-hairline/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-primary text-white transition-colors placeholder:text-text-on-dark-soft/50"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-text-on-dark-soft mb-2">
              Pilih Perangkat ({newGroup.deviceIds.length} dipilih)
            </label>
            {devices.length === 0 ? (
              <p className="text-xs text-text-on-dark-soft p-3 bg-surface-dark rounded-xl border border-surface-hairline/10">
                Belum ada perangkat terdaftar. Daftarkan dulu di halaman Perangkat IoT.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                {devices.map((device) => {
                  const isSelected = newGroup.deviceIds.includes(device.id);
                  const isSimulating = activeSimulations.includes(device.id);
                  return (
                    <button
                      key={device.id}
                      type="button"
                      onClick={() => toggleDevice(device.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-medium transition-colors ${
                        isSelected
                          ? "bg-brand-accent-teal/10 border border-brand-accent-teal/30 text-brand-accent-teal"
                          : "bg-surface-dark border border-surface-hairline/10 text-text-on-dark-soft hover:border-surface-hairline/30"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Router className="w-3.5 h-3.5" />
                        <div className="text-left">
                          <div className="font-medium">{device.name}</div>
                          <div className="text-[10px] opacity-60 font-mono">{device.mac}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isSimulating && (
                          <span className="flex items-center gap-1 text-[10px] text-brand-accent-teal">
                            <span className="w-1 h-1 rounded-full bg-brand-accent-teal animate-pulse"></span>
                            Live
                          </span>
                        )}
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                          isSelected
                            ? "bg-brand-accent-teal border-brand-accent-teal"
                            : "border-surface-hairline/30"
                        }`}>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-brand-primary text-text-on-dark px-4 py-3 rounded-xl text-sm font-bold tracking-wide hover:bg-brand-primary-active transition-colors mt-6 flex justify-center items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {saving ? "Membuat..." : "Buat Grup Virtual"}
          </button>
        </form>
      </div>
    </div>
  );
}