import { useState } from "react";
import { X, Loader2, Check } from "lucide-react";

export function RegisterDeviceModal({
  saving,
  onClose,
  onRegister,
}: {
  saving: boolean;
  onClose: () => void;
  onRegister: (device: any) => Promise<boolean>;
}) {
  const [newDevice, setNewDevice] = useState({
    mac: "",
    name: "",
    location: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onRegister(newDevice);
    if (success) {
      onClose();
      setNewDevice({ mac: "", name: "", location: "" });
    }
  };

  return (
    <div className="fixed inset-0 bg-surface-dark/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface-dark-elevated border border-surface-hairline/20 rounded-2xl p-8 w-full max-w-md text-text-on-dark">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-serif font-bold italic">
            Daftarkan Sensor IoT
          </h2>
          <button
            onClick={onClose}
            className="text-text-on-dark-soft hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-text-on-dark-soft mb-2">
              ALAMAT MAC SENSOR
            </label>
            <input
              type="text"
              value={newDevice.mac}
              onChange={(e) =>
                setNewDevice({
                  ...newDevice,
                  mac: e.target.value.toUpperCase(),
                })
              }
              placeholder="00:1A:2B:3C:4D:5E"
              className="w-full bg-surface-dark border border-surface-hairline/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-primary text-white transition-colors placeholder:text-text-on-dark-soft/50 font-mono"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-text-on-dark-soft mb-2">
              SEBUTAN PERANGKAT
            </label>
            <input
              type="text"
              value={newDevice.name}
              onChange={(e) =>
                setNewDevice({ ...newDevice, name: e.target.value })
              }
              placeholder="cth. Sensor AC Ruang Tamu"
              className="w-full bg-surface-dark border border-surface-hairline/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-primary text-white transition-colors placeholder:text-text-on-dark-soft/50"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-text-on-dark-soft mb-2">
              LOKASI INSTALASI (Opsional)
            </label>
            <input
              type="text"
              value={newDevice.location}
              onChange={(e) =>
                setNewDevice({ ...newDevice, location: e.target.value })
              }
              placeholder="cth. Gedung A Lantai 2"
              className="w-full bg-surface-dark border border-surface-hairline/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-primary text-white transition-colors placeholder:text-text-on-dark-soft/50"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-brand-primary text-text-on-dark px-4 py-3 rounded-xl text-sm font-bold tracking-wide hover:bg-brand-primary-active transition-colors mt-6 flex justify-center items-center gap-2"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            {saving ? "Mendaftarkan..." : "Daftarkan Perangkat"}
          </button>
        </form>
      </div>
    </div>
  );
}
