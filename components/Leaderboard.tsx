"use client";

import { useState, useEffect, useMemo } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/AuthProvider";
import { useSimulator } from "@/components/SimulatorProvider";
import { Loader2 } from "lucide-react";

export function Leaderboard() {
  const { user } = useAuth();
  const { isAnySimulationActive, latestMetrics, activeSimulations } = useSimulator();
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGroups() {
      if (!user) return;
      try {
        const q = query(collection(db, "groups"), where("userId", "==", user.uid));
        const qs = await getDocs(q);
        const data: any[] = qs.docs.map(d => ({ id: d.id, ...d.data() }));
        setGroups(data.slice(0, 5));
      } catch (error) {
        console.error("Error fetching groups for leaderboard:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchGroups();
  }, [user]);

  const rankedGroups = useMemo(() => {
    return groups.map((g, index) => {
      const groupDeviceIds = g.deviceIds || [];
      const activeInGroup = groupDeviceIds.filter((id: string) => activeSimulations.includes(id));

      let efficiency: number;
      if (isAnySimulationActive && activeInGroup.length > 0) {
        const totalPower = activeInGroup.reduce((acc: number, id: string) => {
          return acc + (latestMetrics[id]?.power || 0);
        }, 0);
        const anomalyCount = activeInGroup.filter((id: string) => latestMetrics[id]?.anomaly).length;
        efficiency = 20 - (totalPower / 500) - (anomalyCount * 5);
      } else {
        efficiency = 18 - (index * 4);
      }

      return {
        ...g,
        efficiency: parseFloat(efficiency.toFixed(1)),
        activeDeviceCount: activeInGroup.length,
      };
    }).sort((a, b) => b.efficiency - a.efficiency);
  }, [groups, isAnySimulationActive, latestMetrics, activeSimulations]);

  return (
    <div className="bg-surface-dark rounded-2xl p-5 text-text-on-dark h-full font-sans">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold uppercase tracking-tighter text-brand-primary">Papan Peringkat</h3>
        <span className="text-[10px] text-text-on-dark-soft flex items-center gap-1.5">
          {isAnySimulationActive && (
            <span className="w-1.5 h-1.5 rounded-full bg-brand-accent-teal animate-pulse"></span>
          )}
          {isAnySimulationActive ? "Peringkat Live" : "Performa Terbaik"}
        </span>
      </div>
      {loading ? (
         <div className="flex justify-center p-4"><Loader2 className="w-4 h-4 animate-spin text-brand-primary" /></div>
      ) : (
        <div className="space-y-3">
          {rankedGroups.length === 0 && <p className="text-xs text-text-on-dark-soft">Belum ada data grup.</p>}
          {rankedGroups.map((g, index) => {
             const isPositive = g.efficiency >= 0;
             return (
              <div key={g.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-on-dark-soft">{(index + 1).toString().padStart(2, '0')}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs truncate max-w-[100px]">{g.name}</span>
                    {g.activeDeviceCount > 0 && (
                      <span className="w-1 h-1 rounded-full bg-brand-accent-teal animate-pulse"></span>
                    )}
                  </div>
                </div>
                <span className={`text-[10px] font-bold ${isPositive ? 'text-brand-accent-teal' : 'text-brand-primary'}`}>
                   {isPositive ? '+' : ''}{g.efficiency}% Efisiensi
                </span>
              </div>
             );
          })}
        </div>
      )}
    </div>
  );
}
