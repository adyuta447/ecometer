"use client";

import { useState, useEffect, useMemo } from "react";
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
  Zap,
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
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/AuthProvider";
import { useSimulator } from "@/components/SimulatorProvider";
import { DigitalTwinSimulator } from "@/components/DigitalTwinSimulator";
import { logActivity } from "@/lib/activityLog";
import { useNotification } from "@/components/NotificationProvider";

// Predefined Jakarta locations for the map
const JAKARTA_LOCATIONS: Record<string, { lat: number; lng: number; label: string }> = {
  "Sudirman": { lat: -6.2088, lng: 106.8226, label: "Jl. Sudirman" },
  "Kuningan": { lat: -6.2297, lng: 106.8295, label: "Kuningan" },
  "Kemang": { lat: -6.2600, lng: 106.8130, label: "Kemang" },
  "Senayan": { lat: -6.2271, lng: 106.8021, label: "Senayan" },
  "TB Simatupang": { lat: -6.2901, lng: 106.8355, label: "TB Simatupang" },
  "Menteng": { lat: -6.1944, lng: 106.8440, label: "Menteng" },
  "Kelapa Gading": { lat: -6.1580, lng: 106.9050, label: "Kelapa Gading" },
  "PIK": { lat: -6.1090, lng: 106.7480, label: "Pantai Indah Kapuk" },
};

export default function DevicesPage() {
  const { user } = useAuth();
  const { activeSimulations, latestMetrics } = useSimulator();
  const { addNotification } = useNotification();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [simulatorDevice, setSimulatorDevice] = useState<any>(null);

  const [newDevice, setNewDevice] = useState({ mac: "", name: "", location: "Sudirman" });
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
        const loc = JAKARTA_LOCATIONS[newDevice.location] || JAKARTA_LOCATIONS["Sudirman"];
        const docRef = await addDoc(collection(db, "devices"), {
          name: newDevice.name,
          mac: newDevice.mac,
          status: "online",
          mape: "calculating...",
          userId: user.uid,
          location: newDevice.location,
          lat: loc.lat,
          lng: loc.lng,
          createdAt: new Date().toISOString(),
        });
        const created = {
          id: docRef.id,
          mac: newDevice.mac,
          name: newDevice.name,
          status: "online",
          mape: "calculating...",
          location: newDevice.location,
          lat: loc.lat,
          lng: loc.lng,
        };
        setDevices([...devices, created]);
        setIsModalOpen(false);
        setNewDevice({ mac: "", name: "", location: "Sudirman" });

        await logActivity(user.uid, "device_registered", `New device registered: ${newDevice.name} (${newDevice.mac}) at ${newDevice.location}`, "success", {
          deviceId: docRef.id,
          mac: newDevice.mac,
          location: newDevice.location,
        });
        addNotification(`Device "${newDevice.name}" registered successfully.`, "success");
      } catch (error) {
        console.error("Failed to add device", error);
        addNotification("Failed to register device.", "error");
      } finally {
        setSaving(false);
      }
    }
  };

  const handleDelete = async (id: string) => {
    const device = devices.find((d) => d.id === id);
    if (confirm("Are you sure you want to delete this device?")) {
      try {
        await deleteDoc(doc(db, "devices", id));
        setDevices(devices.filter((d) => d.id !== id));
        if (user && device) {
          await logActivity(user.uid, "device_deleted", `Device removed: ${device.name}`, "warning", { deviceId: id });
        }
        addNotification(`Device "${device?.name}" deleted.`, "info");
      } catch (error) {
        console.error("Failed to delete device", error);
      }
    }
  };

  // Generate device coordinates for the visual map
  const deviceMapData = useMemo(() => {
    return devices.map((d) => {
      const isActive = activeSimulations.includes(d.id) || d.status === "online" || d.status === "Active";
      const metrics = latestMetrics[d.id];
      return {
        ...d,
        isActive,
        hasAnomaly: metrics?.anomaly || false,
        power: metrics?.power || 0,
      };
    });
  }, [devices, activeSimulations, latestMetrics]);

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
            Device & Hardware Health
          </h1>
          <p className="text-sm text-text-muted">
            Manage plug-and-play IoT sensors. Target MAPE accuracy &lt; 3%.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-brand-primary text-text-on-dark px-5 py-2 rounded-xl text-sm font-bold tracking-wide transition-colors hover:bg-brand-primary-active"
        >
          <Plus className="w-4 h-4" />
          Register Custom Sensor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-surface-card rounded-[24px] p-5 border border-surface-hairline">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] uppercase font-bold text-text-muted-soft tracking-widest">
              Active Sensors
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
              Offline Systems
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
              Global MAPE Accuracy
            </span>
          </div>
          <div className="text-2xl font-serif font-bold text-text-ink flex items-end gap-2">
            {activeSimulations.length > 0 ? "2.84%" : "2.8%"}{" "}
            <span className="text-sm font-sans font-medium text-brand-accent-teal mb-1">
              Excellent
            </span>
          </div>
        </div>
      </div>

      {/* Real-time Visual Device Map */}
      <div className="bg-surface-card rounded-[32px] p-6 border border-surface-hairline">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-primary" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-text-ink">
              Device Location Map
            </h3>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest">
            <span className="flex items-center gap-1.5 text-brand-accent-teal">
              <span className="w-2 h-2 rounded-full bg-brand-accent-teal"></span> Online
            </span>
            <span className="flex items-center gap-1.5 text-brand-primary">
              <span className="w-2 h-2 rounded-full bg-brand-primary"></span> Offline
            </span>
            <span className="flex items-center gap-1.5 text-brand-accent-amber">
              <span className="w-2 h-2 rounded-full bg-brand-accent-amber animate-pulse"></span> Anomaly
            </span>
          </div>
        </div>

        {/* SVG-based visual map */}
        <div className="relative bg-surface-soft rounded-2xl overflow-hidden min-h-[300px] border border-surface-hairline">
          {/* Grid lines */}
          <svg className="absolute inset-0 w-full h-full opacity-20" preserveAspectRatio="none">
            {Array.from({ length: 10 }).map((_, i) => (
              <line key={`h-${i}`} x1="0" y1={`${i * 10}%`} x2="100%" y2={`${i * 10}%`} stroke="var(--color-surface-hairline)" strokeWidth="1" />
            ))}
            {Array.from({ length: 10 }).map((_, i) => (
              <line key={`v-${i}`} x1={`${i * 10}%`} y1="0" x2={`${i * 10}%`} y2="100%" stroke="var(--color-surface-hairline)" strokeWidth="1" />
            ))}
          </svg>

          {/* Map label */}
          <div className="absolute top-3 left-3 px-3 py-1.5 bg-surface-dark/80 backdrop-blur-sm rounded-xl text-[10px] font-bold uppercase tracking-widest text-text-on-dark z-10">
            Jakarta Metropolitan Area
          </div>

          {/* Device pins positioned on the map */}
          {deviceMapData.length === 0 ? (
            <div className="flex items-center justify-center h-full min-h-[300px] text-text-muted text-sm">
              No devices registered. Register a sensor to see it on the map.
            </div>
          ) : (
            deviceMapData.map((device, index) => {
              // Calculate position based on lat/lng or distribute evenly
              const baseLat = -6.2088;
              const baseLng = 106.8226;
              const lat = device.lat || baseLat + (index * 0.02 - 0.04);
              const lng = device.lng || baseLng + (index * 0.03 - 0.06);

              // Map lat/lng to percentage positions
              const x = ((lng - 106.70) / 0.25) * 100;
              const y = ((lat - (-6.30)) / 0.25) * 100;

              const clampedX = Math.max(8, Math.min(92, x));
              const clampedY = Math.max(8, Math.min(92, y));

              const pinColor = device.hasAnomaly
                ? "bg-brand-accent-amber"
                : device.isActive
                ? "bg-brand-accent-teal"
                : "bg-brand-primary";

              const ringColor = device.hasAnomaly
                ? "ring-brand-accent-amber/30"
                : device.isActive
                ? "ring-brand-accent-teal/30"
                : "ring-brand-primary/30";

              return (
                <div
                  key={device.id}
                  className="absolute group cursor-pointer z-10"
                  style={{ left: `${clampedX}%`, top: `${clampedY}%`, transform: "translate(-50%, -50%)" }}
                  onClick={() => setSimulatorDevice(device)}
                >
                  {/* Pulse ring for active devices */}
                  {device.isActive && activeSimulations.includes(device.id) && (
                    <div className={`absolute inset-0 w-8 h-8 -m-1 rounded-full ${pinColor} opacity-30 animate-ping`}></div>
                  )}

                  {/* Pin dot */}
                  <div className={`w-6 h-6 rounded-full ${pinColor} ring-4 ${ringColor} shadow-lg flex items-center justify-center transition-transform group-hover:scale-125`}>
                    <Router className="w-3 h-3 text-white" />
                  </div>

                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-surface-dark text-text-on-dark px-3 py-2 rounded-xl text-[10px] whitespace-nowrap shadow-xl">
                      <div className="font-bold">{device.name}</div>
                      <div className="text-text-on-dark-soft">{device.location || "Unknown"}</div>
                      {activeSimulations.includes(device.id) && device.power > 0 && (
                        <div className="text-brand-accent-teal mt-0.5">{device.power.toFixed(0)}W live</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="bg-surface-canvas border border-surface-hairline rounded-[32px] overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-soft text-[11px] uppercase tracking-widest text-text-muted-soft">
            <tr>
              <th className="px-6 py-4 font-bold border-b border-surface-hairline">
                Device Name
              </th>
              <th className="px-6 py-4 font-bold border-b border-surface-hairline">
                MAC Address
              </th>
              <th className="px-6 py-4 font-bold border-b border-surface-hairline">
                Location
              </th>
              <th className="px-6 py-4 font-bold border-b border-surface-hairline">
                Status
              </th>
              <th className="px-6 py-4 font-bold border-b border-surface-hairline">
                MAPE
              </th>
              <th className="px-6 py-4 font-bold border-b border-surface-hairline">
                Asset Health (Predictive)
              </th>
              <th className="px-6 py-4 font-bold border-b border-surface-hairline">
                Smart Actuation
              </th>
              <th className="px-6 py-4 font-bold border-b border-surface-hairline text-right">
                Actions
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
                  No devices registered.
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
                          Anomaly
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
                        {metrics?.anomaly ? "Harmonic Abnormal" : "Harmonic Normal"} (THD &lt; 5%)
                      </span>
                      {isSimulating && metrics && (
                        <span className="text-brand-accent-teal font-mono">
                          {metrics.voltage}V · {metrics.current}A · {metrics.power}W
                        </span>
                      )}
                      <span className="text-text-muted-soft">
                        Est. Compressor End-of-Life: ~4.2 Yrs
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
                      title="Toggle Smart Relay (Digital Twin Simulator)"
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
                Register Sensor
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
                  MAC Address / S.N.
                </label>
                <input
                  type="text"
                  value={newDevice.mac}
                  onChange={(e) =>
                    setNewDevice({ ...newDevice, mac: e.target.value })
                  }
                  autoFocus
                  placeholder="e.g. 00:1A:2B:3C:D4:E5"
                  className="w-full bg-surface-dark border border-surface-hairline/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-primary font-mono text-white transition-colors placeholder:text-text-on-dark-soft/50"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-text-on-dark-soft mb-2">
                  Device Name / Placement
                </label>
                <input
                  type="text"
                  value={newDevice.name}
                  onChange={(e) =>
                    setNewDevice({ ...newDevice, name: e.target.value })
                  }
                  placeholder="e.g. Panel Utama Lantai 3"
                  className="w-full bg-surface-dark border border-surface-hairline/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-primary text-white transition-colors placeholder:text-text-on-dark-soft/50"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-text-on-dark-soft mb-2">
                  Location Zone
                </label>
                <select
                  value={newDevice.location}
                  onChange={(e) =>
                    setNewDevice({ ...newDevice, location: e.target.value })
                  }
                  className="w-full bg-surface-dark border border-surface-hairline/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-primary text-white transition-colors"
                >
                  {Object.entries(JAKARTA_LOCATIONS).map(([key, val]) => (
                    <option key={key} value={key}>
                      {val.label}
                    </option>
                  ))}
                </select>
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
                {saving ? "Saving..." : "Save Registration"}
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
