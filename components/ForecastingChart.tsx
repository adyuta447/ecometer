"use client";

import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/AuthProvider";
import { Loader2 } from "lucide-react";

export function ForecastingChart() {
  const { user } = useAuth();
  const [budget, setBudget] = useState(50000000);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchSettings() {
      if (!user) return;
      try {
        const q = query(collection(db, "settings"), where("userId", "==", user.uid));
        const qs = await getDocs(q);
        if (!qs.empty) {
          const s = qs.docs[0].data();
          if (s.budget) setBudget(Number(s.budget));
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, [user]);

  const savings = Math.max(0, budget - 33200000); // Mocked projection is 33.2M

  if (loading) return <div className="col-span-12 md:col-span-8 bg-brand-primary rounded-[32px] p-8 flex justify-center items-center"><Loader2 className="w-8 h-8 animate-spin text-text-on-dark" /></div>;

  return (
    <section className="col-span-12 md:col-span-8 bg-brand-primary rounded-[32px] p-8 text-text-on-dark flex flex-col justify-between">
      <div>
        <div className="text-sm font-medium opacity-80 mb-1">AI/ML Financial Forecast</div>
        <h2 className="text-5xl font-serif italic mb-6 text-text-on-dark leading-tight">Saving Rp {savings.toLocaleString('id-ID')} next month</h2>
      </div>
      <div className="flex items-end justify-between">
        <div className="flex gap-8">
          <div>
            <div className="text-[11px] uppercase tracking-widest opacity-60">Utility Baseline (Budget)</div>
            <div className="text-lg font-serif">Rp {(budget / 1000000).toFixed(1)}M</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-widest opacity-60">Projected OpEx</div>
            <div className="text-lg font-serif">Rp 33.2M</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[11px] uppercase tracking-widest opacity-60">CO2e Target</div>
          <div className="text-2xl font-serif tracking-tight">-4.2 tons eCO₂</div>
        </div>
      </div>
    </section>
  );
}
