"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Server,
  Filter,
  Plus,
  Shield,
  Loader2,
  X,
  Check,
  Trash2,
  MapPin,
  Router,
  Building2,
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
import { logActivity } from "@/lib/activityLog";
import { useNotification } from "@/components/NotificationProvider";

export default function GroupsPage() {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const { activeSimulations, latestMetrics, aggregatedStats, isAnySimulationActive } = useSimulator();
  const [groups, setGroups] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeSegment, setActiveSegment] = useState<any>(null);

  // State form grup baru
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    location: "",
    floor: "",
    deviceIds: [] as string[],
  });

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      try {
        // Ambil data grup
        const gq = query(collection(db, "groups"), where("userId", "==", user.uid));
        const gqs = await getDocs(gq);
        const groupData = gqs.docs.map((d) => ({ id: d.id, ...d.data() }));
        setGroups(groupData);
        if (groupData.length > 0) setActiveSegment(groupData[0]);

        // Ambil data perangkat untuk assignment
        const dq = query(collection(db, "devices"), where("userId", "==", user.uid));
        const dqs = await getDocs(dq);
        setDevices(dqs.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newGroup.name && user) {
      setSaving(true);
      try {
        const selectedDevices = devices.filter((d) => newGroup.deviceIds.includes(d.id));
        const usage = selectedDevices.length > 0
          ? `${(selectedDevices.length * 420).toLocaleString()} kWh`
          : "0 kWh";
        const co2 = selectedDevices.length > 0
          ? `${(selectedDevices.length * 1.1).toFixed(1)}t CO2e`
          : "0t CO2e";
        const capacity = selectedDevices.length > 0
          ? `${Math.min(100, selectedDevices.length * 20)}%`
          : "0%";

        const groupPayload = {
          name: newGroup.name,
          description: newGroup.description,
          location: newGroup.location,
          floor: newGroup.floor,
          locations: [newGroup.location, newGroup.floor].filter(Boolean),
          deviceIds: newGroup.deviceIds,
          usage,
          co2,
          capacityPercentage: capacity,
          userId: user.uid,
          createdAt: new Date().toISOString(),
        };

        const docRef = await addDoc(collection(db, "groups"), groupPayload);
        const created = { id: docRef.id, ...groupPayload };
        setGroups([...groups, created]);
        setIsModalOpen(false);
        setNewGroup({ name: "", description: "", location: "", floor: "", deviceIds: [] });
        if (!activeSegment) setActiveSegment(created);

        await logActivity(user.uid, "group_created", `Grup virtual dibuat: ${newGroup.name} dengan ${newGroup.deviceIds.length} perangkat`, "success", {
          groupId: docRef.id,
          location: newGroup.location,
          floor: newGroup.floor,
          deviceCount: newGroup.deviceIds.length,
        });
        addNotification(`Grup "${newGroup.name}" berhasil dibuat.`, "success");
      } catch (error) {
        console.error("Gagal membuat grup", error);
        addNotification("Gagal membuat grup.", "error");
      } finally {
        setSaving(false);
      }
    }
  };

  const handleDelete = async (id: string) => {
    const group = groups.find((g) => g.id === id);
    if (confirm("Hapus grup virtual ini?")) {
      try {
        await deleteDoc(doc(db, "groups", id));
        setGroups(groups.filter((g) => g.id !== id));
        if (activeSegment?.id === id) {
          setActiveSegment(groups.find((g) => g.id !== id) || null);
        }
        if (user && group) {
          await logActivity(user.uid, "group_deleted", `Grup virtual dihapus: ${group.name}`, "warning", { groupId: id });
        }
        addNotification(`Grup "${group?.name}" dihapus.`, "info");
      } catch (error) {
        console.error("Gagal menghapus grup", error);
      }
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

  // Hitung statistik real-time untuk grup aktif
  const groupDeviceStats = useMemo(() => {
    if (!activeSegment?.deviceIds?.length) return null;
    const groupDeviceIds = activeSegment.deviceIds as string[];
    const activeInGroup = groupDeviceIds.filter((id: string) => activeSimulations.includes(id));
    const totalPower = activeInGroup.reduce((acc: number, id: string) => {
      const m = latestMetrics[id];
      return acc + (m?.power || 0);
    }, 0);
    const anomalies = activeInGroup.filter((id: string) => latestMetrics[id]?.anomaly).length;

    return {
      totalDevices: groupDeviceIds.length,
      activeDevices: activeInGroup.length,
      totalPower,
      anomalies,
    };
  }, [activeSegment, activeSimulations, latestMetrics]);

  if (loading)
    return (
      <div className="p-4 md:p-8 max-w-6xl mx-auto flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
      </div>
    );

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold italic text-text-ink mb-1">
            Grup Perangkat Virtual
          </h1>
          <p className="text-sm text-text-muted">
            Kelompokkan dan pisahkan data jaringan seperti VLAN.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-brand-primary text-text-on-dark px-4 py-2 rounded-xl text-sm font-medium hover:bg-brand-primary-active transition-colors"
        >
          <Plus className="w-4 h-4" />
          Buat Grup Baru
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Panel kiri: Daftar Segmen */}
        <div className="col-span-1 bg-surface-card rounded-2xl p-5 border border-surface-hairline">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-text-muted-soft">
              Segmen
            </h3>
            <Filter className="w-3 h-3 text-text-muted-soft" />
          </div>
          <div className="space-y-1">
            {groups.map((g) => {
              const hasActiveDevices = g.deviceIds?.some((id: string) => activeSimulations.includes(id));
              return (
                <div
                  key={g.id}
                  onClick={() => setActiveSegment(g)}
                  className={`p-2.5 rounded-lg text-sm font-medium flex items-center justify-between cursor-pointer transition-colors ${
                    activeSegment?.id === g.id
                      ? "bg-brand-primary/10 text-brand-primary"
                      : "text-text-body hover:bg-surface-soft"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {hasActiveDevices && (
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-accent-teal animate-pulse flex-shrink-0"></span>
                    )}
                    <span className="truncate">{g.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {g.deviceIds?.length > 0 && (
                      <span className="text-[9px] px-1.5 py-0.5 bg-surface-soft text-text-muted rounded-md">
                        {g.deviceIds.length} alat
                      </span>
                    )}
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                        activeSegment?.id === g.id
                          ? "bg-brand-primary/20"
                          : "bg-surface-soft text-text-muted"
                      }`}
                    >
                      {g.capacityPercentage || "0%"}
                    </span>
                  </div>
                </div>
              );
            })}
            {groups.length === 0 && (
              <div className="text-xs text-text-muted p-2">
                Belum ada segmen. Yuk bikin!
              </div>
            )}
          </div>
        </div>

        {/* Panel kanan: Detail Grup */}
        <div className="col-span-3 space-y-6">
          {activeSegment ? (
            <>
              <div className="bg-surface-card rounded-2xl p-6 border border-surface-hairline flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Shield className="w-6 h-6 text-brand-accent-teal" />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-xl font-bold text-text-ink">
                        {activeSegment.name}
                      </h2>
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
                    onClick={() => handleDelete(activeSegment.id)}
                    className="p-2 text-text-muted hover:text-red-500 transition-colors rounded-lg bg-surface-soft"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Statistik real-time per grup */}
              {groupDeviceStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-surface-card rounded-2xl p-4 border border-surface-hairline">
                    <div className="text-[10px] uppercase font-bold text-text-muted-soft tracking-widest mb-1">
                      Total Perangkat
                    </div>
                    <div className="text-xl font-serif font-bold text-text-ink">
                      {groupDeviceStats.totalDevices}
                    </div>
                  </div>
                  <div className="bg-surface-card rounded-2xl p-4 border border-surface-hairline">
                    <div className="text-[10px] uppercase font-bold text-text-muted-soft tracking-widest mb-1">
                      Aktif (Sim)
                    </div>
                    <div className="text-xl font-serif font-bold text-brand-accent-teal">
                      {groupDeviceStats.activeDevices}
                    </div>
                  </div>
                  <div className="bg-surface-card rounded-2xl p-4 border border-surface-hairline">
                    <div className="text-[10px] uppercase font-bold text-text-muted-soft tracking-widest mb-1">
                      Daya Grup
                    </div>
                    <div className="text-xl font-serif font-bold text-brand-accent-amber">
                      {(groupDeviceStats.totalPower / 1000).toFixed(2)} kW
                    </div>
                  </div>
                  <div className="bg-surface-card rounded-2xl p-4 border border-surface-hairline">
                    <div className="text-[10px] uppercase font-bold text-text-muted-soft tracking-widest mb-1">
                      Anomali
                    </div>
                    <div className={`text-xl font-serif font-bold ${groupDeviceStats.anomalies > 0 ? "text-brand-primary" : "text-brand-accent-teal"}`}>
                      {groupDeviceStats.anomalies}
                    </div>
                  </div>
                </div>
              )}

              {/* Perangkat yang Ditugaskan */}
              {activeSegment.deviceIds?.length > 0 && (
                <div className="bg-surface-card rounded-2xl p-5 border border-surface-hairline">
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-text-muted-soft mb-4">
                    Perangkat di Grup Ini
                  </h3>
                  <div className="space-y-2">
                    {devices
                      .filter((d) => activeSegment.deviceIds.includes(d.id))
                      .map((device) => {
                        const isSimulating = activeSimulations.includes(device.id);
                        const metrics = latestMetrics[device.id];
                        return (
                          <div
                            key={device.id}
                            className="flex items-center justify-between p-3 bg-surface-soft rounded-xl"
                          >
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
                                isSimulating
                                  ? "bg-brand-accent-teal/10 text-brand-accent-teal"
                                  : "bg-surface-hairline text-text-muted"
                              }`}>
                                {isSimulating ? "Live" : "Idle"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    {devices.filter((d) => activeSegment.deviceIds.includes(d.id)).length === 0 && (
                      <p className="text-xs text-text-muted p-2">
                        Perangkat yang ditugaskan tidak ditemukan. Mungkin sudah dihapus.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Visualisasi kapasitas */}
              <div className="bg-surface-soft rounded-2xl p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-tighter text-text-ink">
                    {activeSegment.name}
                  </h3>
                  <span className="text-xs text-brand-accent-teal font-medium tracking-tight">
                    {groupDeviceStats && groupDeviceStats.activeDevices > 0
                      ? `${(groupDeviceStats.totalPower / 1000).toFixed(2)} kW (Live)`
                      : activeSegment.usage}
                  </span>
                </div>
                <div className="h-2 bg-surface-hairline rounded-full overflow-hidden mb-2">
                  <div
                    className="bg-brand-primary h-full transition-all duration-1000"
                    style={{ width: activeSegment.capacityPercentage || "0%" }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] text-text-muted-soft">
                  <span>{activeSegment.capacityPercentage || "0%"} Kapasitas</span>
                  <span>{activeSegment.co2}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-surface-card rounded-2xl p-12 border border-surface-hairline text-center flex flex-col items-center justify-center min-h-[300px]">
              <Shield className="w-12 h-12 text-surface-hairline mb-4" />
              <p className="text-text-muted">
                Pilih atau buat grup virtual buat lihat data telemetrinya.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Buat Grup */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-surface-dark/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-dark-elevated border border-surface-hairline/20 rounded-2xl p-8 w-full max-w-lg text-text-on-dark max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-serif font-bold italic">
                Buat Grup Virtual
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-text-on-dark-soft hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-5">
              {/* Nama Grup */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-text-on-dark-soft mb-2">
                  Nama Grup
                </label>
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

              {/* Deskripsi */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-text-on-dark-soft mb-2">
                  Deskripsi (Opsional)
                </label>
                <textarea
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  placeholder="Deskripsi singkat grup ini"
                  rows={2}
                  className="w-full bg-surface-dark border border-surface-hairline/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-primary text-white transition-colors placeholder:text-text-on-dark-soft/50 resize-none"
                />
              </div>

              {/* Lokasi — input biasa */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-text-on-dark-soft mb-2">
                  Lokasi
                </label>
                <input
                  type="text"
                  value={newGroup.location}
                  onChange={(e) => setNewGroup({ ...newGroup, location: e.target.value })}
                  placeholder="cth. Gedung Utama, Jl. Sudirman No.10"
                  className="w-full bg-surface-dark border border-surface-hairline/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-primary text-white transition-colors placeholder:text-text-on-dark-soft/50"
                />
              </div>

              {/* Lantai — input biasa */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-text-on-dark-soft mb-2">
                  Lantai
                </label>
                <input
                  type="text"
                  value={newGroup.floor}
                  onChange={(e) => setNewGroup({ ...newGroup, floor: e.target.value })}
                  placeholder="cth. Lantai 3, Sayap Barat"
                  className="w-full bg-surface-dark border border-surface-hairline/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-primary text-white transition-colors placeholder:text-text-on-dark-soft/50"
                />
              </div>

              {/* Pilih Perangkat */}
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
      )}
    </div>
  );
}
