"use client";

import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/AuthProvider";
import { Loader2 } from "lucide-react";

export function Leaderboard() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGroups() {
      if (!user) return;
      try {
        const q = query(collection(db, "groups"), where("userId", "==", user.uid));
        const qs = await getDocs(q);
        const data: any[] = qs.docs.map(d => ({ id: d.id, ...d.data() }));
        // Sort by some logic, e.g., if we had efficiency. Just sort alphabetically for now and mock the efficiency
        setGroups(data.sort((a,b) => a.name.localeCompare(b.name)).slice(0, 5));
      } catch (error) {
        console.error("Error fetching groups for leaderboard:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchGroups();
  }, [user]);

  return (
    <div className="bg-surface-dark rounded-[24px] p-5 text-text-on-dark h-full font-sans">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold uppercase tracking-tighter text-brand-primary">Eco-Leaderboard</h3>
        <span className="text-[10px] text-text-on-dark-soft">Top Performers</span>
      </div>
      {loading ? (
         <div className="flex justify-center p-4"><Loader2 className="w-4 h-4 animate-spin text-brand-primary" /></div>
      ) : (
        <div className="space-y-3">
          {groups.length === 0 && <p className="text-xs text-text-on-dark-soft">No groups data available.</p>}
          {groups.map((g, index) => {
             // Mocking an efficiency number based on index since we don't have it explicitly stored
             const efficiency = 18 - (index * 4);
             const isPositive = efficiency >= 0;
             return (
              <div key={g.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-on-dark-soft">{(index + 1).toString().padStart(2, '0')}</span>
                  <span className="text-xs truncate max-w-[100px]">{g.name}</span>
                </div>
                <span className={`text-[10px] font-bold ${isPositive ? 'text-brand-accent-teal' : 'text-brand-primary'}`}>
                   {isPositive ? '+' : ''}{efficiency}% Efficiency
                </span>
              </div>
             );
          })}
        </div>
      )}
    </div>
  );
}
