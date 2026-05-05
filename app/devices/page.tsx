"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Router,
  WifiHigh,
  WifiOff,
  Activity,
  AlertCircle,
  X,
  Check,
  Trash2,
  Loader2,
  Power,
  MapPin,
} from "lucide-react";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/AuthProvider";
import { useSimulator } from "@/components/SimulatorProvider";
import { DigitalTwinSimulator } from "@/components/DigitalTwinSimulator";
import { logActivity } from "@/lib/activityLog";
import { useNotification } from "@/components/NotificationProvider";

export default function DevicesPage() {
  const { user } = useAuth();
  const { activeSimulations, latestMetrics } = useSimulator();
  const { addNotification } = useNotification();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [simulatorDevice, setSimulatorDevice] = useState<any>(null);

  const [newDevice, setNewDevice] = useState({ mac: "", name: "", location: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchDevices() {
      if (!user) return;
      try {
        const q = query(
          collection(db, "devices"),
          where("userId", "==", user.uid),
        );
        const qs = await getDocs(q);
        setDevices(qs.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (error) {
        console.error("Error fetching devices:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDevices();
  }, [user]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newDevice.mac && newDevice.name && user) {
      setSaving(true);
      try {
        const docRef = await addDoc(collection(db, "devices"), {
          name: newDevice.name,
          mac: newDevice.mac,
          status: "online",
          mape: "menghitung...",
          userId: user.uid,
          location: newDevice.location || "-",
          createdAt: new Date().toISOString(),
        });
        const created = {
          id: docRef.id,
          mac: newDevice.mac,
          name: newDevice.name,
          status: "online",
          mape: "menghitung...",
          location: newDevice.location || "-",
        };
        setDevices([...devices, created]);
        setIsModalOpen(false);
        setNewDevice({ mac: "", name: "", location: "" });

        await logActivity(user.uid, "device_registered", `Perangkat baru terdaftar: ${newDevice.name} (${newDevice.mac}) di ${newDevice.location || "-"}`, "success", {
          deviceId: docRef.id,
          mac: newDevice.mac,
          location: newDevice.location,
        });
        addNotification(`Perangkat "${newDevice.name}" berhasil didaftarkan.`, "success");
      } catch (error) {
        console.error("Gagal menambah perangkat", error);
        addNotification("Gagal mendaftarkan perangkat.", "error");
      } finally {
        setSaving(false);
      }
    }
  };

  const handleDelete = async (id: string) => {
    const device = devices.find((d) => d.id === id);
    if (confirm("Yakin mau hapus perangkat ini?")) {
      try {
        await deleteDoc(doc(db, "devices", id));
        setDevices(devices.filter((d) => d.id !== id));
        if (user && device) {
          await logActivity(user.uid, "device_deleted", `Perangkat dihapus: ${device.name}`, "warning", { deviceId: id });
        }
        addNotification(`Perangkat "${device?.name}" dihapus.`, "info");
      } catch (error) {
        console.error("Gagal menghapus perangkat", error);
      }
    }
  };

  if (loading)
    return (
      <div className="p-8 max-w-6xl mx-auto flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
      </div>
    );

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold italic text-text-ink mb-1">
            Kesehatan Perangkat IoT
          </h1>
          <p className="text-sm text-text-muted">
            Kelola sensor IoT plug-and-play. Target akurasi MAPE &lt; 3%.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-brand-primary text-text-on-dark px-5 py-2 rounded-xl text-sm font-bold tracking-wide transition-colors hover:bg-brand-primary-active"
        >
          <Plus className="w-4 h-4" />
          Daftarkan Sensor Baru
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-surface-card rounded-[24px] p-5 border border-surface-hairline">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] uppercase font-bold text-text-muted-soft tracking-widest">
              Sensor Aktif
            </span>
            <Activity className="w-4 h-4 text-brand-accent-teal" />
          </div>
          <div className="text-2xl font-serif font-bold text-text-ink">
            {
              devices.filter(
                (d) => d.status === "online" || d.status === "Active" || activeSimulations.includes(d.id),
              ).length
            }
          </div>
        </div>
        <div className="bg-surface-card rounded-[24px] p-5 border border-surface-hairline border-brand-primary/30">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] uppercase font-bold text-brand-primary tracking-widest">
              Sistem Offline
            </span>
            <AlertCircle className="w-4 h-4 text-brand-primary" />
          </div>
          <div className="text-2xl font-serif font-bold text-text-ink">
            {devices.filter((d) => d.status === "offline" && !activeSimulations.includes(d.id)).length}
          </div>
        </div>
        <div className="bg-surface-card rounded-[24px] p-5 border border-surface-hairline md:col-span-2">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] uppercase font-bold text-text-muted-soft tracking-widest">
              Akurasi MAPE Global
            </span>
          </div>
          <div className="text-2xl font-serif font-bold text-text-ink flex items-end gap-2">
            {activeSimulations.length > 0 ? "2.84%" : "2.8%"}{" "}
            <span className="text-sm font-sans font-medium text-brand-accent-teal mb-1">
              Sangat Baik
            </span>
          </div>
        </div>
      </div>

      <div className="bg-surface-canvas border border-surface-hairline rounded-[32px] overflow-hidden">
        <table className="w-full text-left text-sm">
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
                      className={`w-4 h-4 ${device.status === "online" || device.status === "Active" || isSimulating ? "text-text-muted" : "text-brand-primary"}`}
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
                  <td className="px-6 py-4 font-mono text-xs">{device.mac}</td>
                  <td className="px-6 py-4 text-xs">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-text-muted-soft" />
                      {device.location || "—"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {device.status === "online" ||
                    device.status === "Active" ||
                    isSimulating ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-accent-teal/10 text-brand-accent-teal text-[10px] font-bold uppercase tracking-widest rounded-md">
                        <WifiHigh className="w-3 h-3" /> Online{" "}
                        {isSimulating ? "(Sim)" : ""}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-primary/10 text-brand-primary text-[10px] font-bold uppercase tracking-widest rounded-md">
                        <WifiOff className="w-3 h-3" /> Offline
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-mono font-medium">
                    {isSimulating
                      ? "2.84%"
                      : device.mape}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 text-xs">
                      <span className="font-bold flex items-center gap-1.5">
                        <Activity className={`w-3 h-3 ${metrics?.anomaly ? "text-brand-primary" : "text-brand-accent-teal"}`} />{" "}
                        {metrics?.anomaly ? "Harmonik Tidak Normal" : "Harmonik Normal"} (THD &lt; 5%)
                      </span>
                      {isSimulating && metrics && (
                        <span className="text-brand-accent-teal font-mono">
                          {metrics.voltage}V · {metrics.current}A · {metrics.power}W
                        </span>
                      )}
                      <span className="text-text-muted-soft">
                        Est. Umur Kompresor: ~4.2 Tahun
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSimulatorDevice(device)}
                      className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                        isSimulating
                          ? "bg-brand-accent-teal/20 text-brand-accent-teal hover:bg-brand-accent-teal hover:text-white"
                          : "bg-brand-primary-light text-brand-primary hover:bg-brand-primary hover:text-white"
                      }`}
                      title="Toggle Relay Pintar (Simulator Digital Twin)"
                    >
                      <Power
                        className={`w-4 h-4 ${isSimulating ? "animate-pulse" : ""}`}
                      />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(device.id)}
                      className="text-text-muted hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 ml-auto" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-surface-dark/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-dark-elevated border border-surface-hairline/20 rounded-[32px] p-8 w-full max-w-md text-text-on-dark shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-serif font-bold italic">
                Daftarkan Sensor
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-text-on-dark-soft hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-text-on-dark-soft mb-2">
                  Alamat MAC / Nomor Seri
                </label>
                <input
                  type="text"
                  value={newDevice.mac}
                  onChange={(e) =>
                    setNewDevice({ ...newDevice, mac: e.target.value })
                  }
                  autoFocus
                  placeholder="cth. 00:1A:2B:3C:D4:E5"
                  className="w-full bg-surface-dark border border-surface-hairline/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-primary font-mono text-white transition-colors placeholder:text-text-on-dark-soft/50"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-text-on-dark-soft mb-2">
                  Nama / Penempatan Perangkat
                </label>
                <input
                  type="text"
                  value={newDevice.name}
                  onChange={(e) =>
                    setNewDevice({ ...newDevice, name: e.target.value })
                  }
                  placeholder="cth. Panel Utama Lantai 3"
                  className="w-full bg-surface-dark border border-surface-hairline/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-primary text-white transition-colors placeholder:text-text-on-dark-soft/50"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-text-on-dark-soft mb-2">
                  Lokasi Perangkat
                </label>
                <input
                  type="text"
                  value={newDevice.location}
                  onChange={(e) =>
                    setNewDevice({ ...newDevice, location: e.target.value })
                  }
                  placeholder="cth. Gedung A, Jl. Sudirman No. 10"
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
                {saving ? "Menyimpan..." : "Simpan Pendaftaran"}
              </button>
            </form>
          </div>
        </div>
      )}

      {simulatorDevice && (
        <DigitalTwinSimulator
          device={simulatorDevice}
          onClose={() => setSimulatorDevice(null)}
        />
      )}
    </div>
  );
}
