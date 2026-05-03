"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./AuthProvider";
import { Loader2 } from "lucide-react";

export function DeviceGroups() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGroups() {
      if (!user) return;
      try {
        const q = query(collection(db, "groups"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setGroups(data);
      } catch (error) {
        console.error("Error fetching groups:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchGroups();
  }, [user]);

  if (loading) return <div className="col-span-2 flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin" /></div>;

  return (
    <>
      {groups.length === 0 && (
         <div className="col-span-2 flex justify-center py-4 text-sm text-text-muted">No groups data available.</div>
      )}
      {groups.map((group) => (
        <div key={group.id} className="bg-surface-soft rounded-[24px] p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold uppercase tracking-tighter text-text-ink">{group.name}</h3>
            <span className="text-xs text-brand-accent-teal font-medium tracking-tight">{group.usage}</span>
          </div>
          <div className="h-2 bg-surface-hairline rounded-full overflow-hidden mb-2">
            <div className="bg-brand-primary h-full" style={{ width: group.capacityPercentage }}></div>
          </div>
          <div className="flex justify-between text-[10px] text-text-muted-soft">
            <span>{group.capacityPercentage} Capacity</span>
            <span>{group.co2}</span>
          </div>
        </div>
      ))}
    </>
  );
}
