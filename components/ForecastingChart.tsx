"use client";

import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/AuthProvider";
import { useSimulator } from "@/components/SimulatorProvider";
import { Loader2, TrendingDown, TrendingUp } from "lucide-react";

export function ForecastingChart() {
  const { user } = useAuth();
  const { isAnySimulationActive, aggregatedStats, activeSimulations } = useSimulator();
  const [budget, setBudget] = useState(50000000);
  const [loading, setLoading] = useState(true);
  const [tariff, setTariff] = useState(1444.7);
  
  useEffect(() => {
    async function fetchSettings() {
      if (!user) return;
      try {
        const q = query(collection(db, "settings"), where("userId", "==", user.uid));
        const qs = await getDocs(q);
        if (!qs.empty) {
          const s = qs.docs[0].data();
          if (s.budget) setBudget(Number(s.budget));
          if (s.tariff) setTariff(Number(s.tariff));
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, [user]);

  // Calculate projected OpEx based on real-time simulation data
  const baseProjectedKwh = 33200; // base monthly projection in kWh
  const liveExtrapolatedMonthlyKwh = isAnySimulationActive
    ? aggregatedStats.totalUsageKwh * (30 * 24 * 3600 / 2) // Extrapolate from 2s intervals to monthly
    : 0;
  
  const projectedOpEx = isAnySimulationActive
    ? Math.max(baseProjectedKwh * tariff * 0.7, (baseProjectedKwh + liveExtrapolatedMonthlyKwh * 0.001) * tariff)
    : baseProjectedKwh * tariff;

  const projectedOpExFormatted = (projectedOpEx / 1000000).toFixed(1);
  const savings = Math.max(0, budget - projectedOpEx);
  const savingsPercent = ((savings / budget) * 100).toFixed(1);

  // CO2e target calculation from live data
  const liveCo2eMonthly = isAnySimulationActive
    ? aggregatedStats.totalCo2e * (30 * 24 * 3600 / 2) / 1000 // Convert to tons
    : 4.2;

  if (loading) return <div className="col-span-12 md:col-span-8 bg-brand-primary rounded-[32px] p-8 flex justify-center items-center"><Loader2 className="w-8 h-8 animate-spin text-text-on-dark" /></div>;

  return (
    <section className="col-span-12 md:col-span-8 bg-brand-primary rounded-[32px] p-8 text-text-on-dark flex flex-col justify-between relative overflow-hidden">
      {/* Subtle animated background */}
      {isAnySimulationActive && (
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-[80px] animate-pulse" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-accent-teal rounded-full blur-[60px] animate-pulse" style={{ animationDelay: "1s" }} />
        </div>
      )}

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium opacity-80">AI/ML Financial Forecast</span>
          {isAnySimulationActive && (
            <span className="px-2 py-0.5 bg-white/20 text-[10px] font-bold uppercase tracking-widest rounded-md flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-accent-teal animate-pulse"></span>
              Live Data
            </span>
          )}
        </div>
        <h2 className="text-5xl font-serif italic mb-6 text-text-on-dark leading-tight">
          Saving Rp {savings.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
          {isAnySimulationActive && (
            <span className="text-lg font-sans not-italic ml-3 opacity-70">
              ({savingsPercent}% of budget)
            </span>
          )}
        </h2>
      </div>
      <div className="flex items-end justify-between relative z-10">
        <div className="flex gap-8">
          <div>
            <div className="text-[11px] uppercase tracking-widest opacity-60">Utility Baseline (Budget)</div>
            <div className="text-lg font-serif">Rp {(budget / 1000000).toFixed(1)}M</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-widest opacity-60 flex items-center gap-1">
              Projected OpEx
              {isAnySimulationActive && <TrendingDown className="w-3 h-3 text-brand-accent-teal" />}
            </div>
            <div className="text-lg font-serif">
              Rp {projectedOpExFormatted}M
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[11px] uppercase tracking-widest opacity-60">CO2e Target</div>
          <div className="text-2xl font-serif tracking-tight">
            -{liveCo2eMonthly.toFixed(1)} tons eCO₂
          </div>
        </div>
      </div>

      {/* Live device count indicator */}
      {isAnySimulationActive && (
        <div className="mt-4 pt-4 border-t border-white/10 relative z-10 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest opacity-50">
            Based on {activeSimulations.length} active device{activeSimulations.length > 1 ? "s" : ""} telemetry
          </span>
          <span className="text-[10px] uppercase tracking-widest text-brand-accent-teal font-bold">
            {(aggregatedStats.totalPower / 1000).toFixed(2)} kW draw
          </span>
        </div>
      )}
    </section>
  );
}
