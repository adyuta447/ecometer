import { useState, useEffect } from "react";
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

export function useDevices() {
  const { user } = useAuth();
  const { activeSimulations, latestMetrics } = useSimulator();
  const { addNotification } = useNotification();

  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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

  const registerDevice = async (newDevice: any) => {
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

        await logActivity(
          user.uid,
          "device_registered",
          `Perangkat baru terdaftar: ${newDevice.name} (${newDevice.mac}) di ${newDevice.location || "-"}`,
          "success",
          {
            deviceId: docRef.id,
            mac: newDevice.mac,
            location: newDevice.location,
          },
        );
        addNotification(
          `Perangkat "${newDevice.name}" berhasil didaftarkan.`,
          "success",
        );
        return true;
      } catch (error) {
        console.error("Gagal menambah perangkat", error);
        addNotification("Gagal mendaftarkan perangkat.", "error");
        return false;
      } finally {
        setSaving(false);
      }
    }
    return false;
  };

  const deleteDevice = async (id: string) => {
    const device = devices.find((d) => d.id === id);
    if (confirm("Yakin mau hapus perangkat ini?")) {
      try {
        await deleteDoc(doc(db, "devices", id));
        setDevices(devices.filter((d) => d.id !== id));
        if (user && device) {
          await logActivity(
            user.uid,
            "device_deleted",
            `Perangkat dihapus: ${device.name}`,
            "warning",
            { deviceId: id },
          );
        }
        addNotification(`Perangkat "${device?.name}" dihapus.`, "info");
      } catch (error) {
        console.error("Gagal menghapus perangkat", error);
      }
    }
  };

  const activeSensorsCount = devices.filter(
    (d) =>
      d.status === "online" ||
      d.status === "Active" ||
      activeSimulations.includes(d.id),
  ).length;

  const offlineSystemsCount = devices.filter(
    (d) => d.status === "offline" && !activeSimulations.includes(d.id),
  ).length;

  const globalMape = activeSimulations.length > 0 ? "2.84%" : "2.8%";

  return {
    devices,
    loading,
    saving,
    activeSimulations,
    latestMetrics,
    registerDevice,
    deleteDevice,
    stats: {
      activeSensorsCount,
      offlineSystemsCount,
      globalMape,
    },
  };
}
