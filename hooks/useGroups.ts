import { useState, useEffect, useMemo } from "react";
import { collection, query, where, getDocs, addDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/AuthProvider";
import { useSimulator } from "@/components/SimulatorProvider";
import { logActivity } from "@/lib/activityLog";
import { useNotification } from "@/components/NotificationProvider";

export function useGroups() {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const { activeSimulations, latestMetrics } = useSimulator();
  
  const [groups, setGroups] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSegment, setActiveSegment] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      try {
        const gq = query(collection(db, "groups"), where("userId", "==", user.uid));
        const gqs = await getDocs(gq);
        const groupData = gqs.docs.map((d) => ({ id: d.id, ...d.data() }));
        setGroups(groupData);
        if (groupData.length > 0) setActiveSegment(groupData[0]);

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

  const createGroup = async (newGroup: any) => {
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
        if (!activeSegment) setActiveSegment(created);

        await logActivity(user.uid, "group_created", `Grup virtual dibuat: ${newGroup.name} dengan ${newGroup.deviceIds.length} perangkat`, "success", {
          groupId: docRef.id,
          location: newGroup.location,
          floor: newGroup.floor,
          deviceCount: newGroup.deviceIds.length,
        });
        addNotification(`Grup "${newGroup.name}" berhasil dibuat.`, "success");
        return true;
      } catch (error) {
        console.error("Gagal membuat grup", error);
        addNotification("Gagal membuat grup.", "error");
        return false;
      } finally {
        setSaving(false);
      }
    }
    return false;
  };

  const deleteGroup = async (id: string) => {
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

  return {
    groups,
    devices,
    loading,
    saving,
    activeSegment,
    setActiveSegment,
    createGroup,
    deleteGroup,
    groupDeviceStats,
    activeSimulations,
    latestMetrics,
  };
}