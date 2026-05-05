"use client";

import { useEffect, useState } from "react";
import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./AuthProvider";
import { Activity, Power, Wifi, StopCircle } from "lucide-react";

export function DigitalTwinSimulator() {
  const { user } = useAuth();
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentMetrics, setCurrentMetrics] = useState<any>(null);

  useEffect(() => {
    if (!user || !isSimulating) return;

    const interval = setInterval(async () => {
      const now = new Date();
      const hour = now.getHours();
      
      // Base simulation values
      let voltage = 220 + (Math.random() * 4 - 2); // 218V - 222V
      let isOffHours = hour < 7 || hour > 19;
      let baseCurrent = isOffHours ? 2 : 12; // 2A off-hours, 12A operational
      
      // Simulate Anomaly (e.g. random HVAC spike during off-hours)
      const hasAnomaly = isOffHours && Math.random() > 0.8;
      if (hasAnomaly) {
        baseCurrent += 8; // Spike current
      }
      
      const current = baseCurrent + (Math.random() * 2 - 1);
      const power = voltage * current; // Watt
      
      // Translasi Emisi Karbon (kg CO2e) - Assuming 0.8 kgCO2e per kWh
      const runTimeHours = 1 / 3600; // 1 second in hours
      const energy_kWh = (power / 1000) * runTimeHours;
      const co2e = energy_kWh * 0.8; 

      const payload = {
        userId: user.uid,
        timestamp: now.toISOString(),
        voltage: parseFloat(voltage.toFixed(2)),
        current: parseFloat(current.toFixed(2)),
        power: parseFloat(power.toFixed(2)),
        co2e: parseFloat(co2e.toFixed(6)),
        anomaly: hasAnomaly,
      };

      setCurrentMetrics(payload);

      // Pushing to Firebase Firestore
      try {
        const metricRef = doc(collection(db, "realtime_metrics"));
        await setDoc(metricRef, payload);
      } catch (err) {
        console.error("Simulation error", err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [user, isSimulating]);

  if (!user) return null;

  return (
    <div className="fixed bottom-4 right-4 w-80 shadow-2xl rounded-xl z-50 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 backdrop-blur overflow-hidden">
      <div className="p-4 border-b border-gray-100 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm flex items-center gap-2 dark:text-zinc-100 text-gray-900">
            <Activity className="w-4 h-4 text-blue-500" />
            Digital Twin Simulator
          </h3>
          <Wifi className={`w-4 h-4 ${isSimulating ? "text-green-500 animate-pulse" : "text-gray-400 dark:text-zinc-500"}`} />
        </div>
        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
          Clamp CT Hardware Mock
        </p>
      </div>
      <div className="p-4">
        {currentMetrics && isSimulating ? (
           <div className="grid grid-cols-2 gap-2 text-xs mb-4">
              <div className="bg-gray-50 dark:bg-zinc-950 p-2 rounded border border-gray-100 dark:border-zinc-800">
                <span className="text-gray-500 dark:text-zinc-400 block mb-1">Voltage</span>
                <span className="font-mono font-medium dark:text-zinc-100">{currentMetrics.voltage} V</span>
              </div>
              <div className="bg-gray-50 dark:bg-zinc-950 p-2 rounded border border-gray-100 dark:border-zinc-800">
                <span className="text-gray-500 dark:text-zinc-400 block mb-1">Current</span>
                <span className="font-mono font-medium dark:text-zinc-100">{currentMetrics.current} A</span>
              </div>
              <div className="bg-gray-50 dark:bg-zinc-950 p-2 rounded border border-gray-100 dark:border-zinc-800">
                <span className="text-gray-500 dark:text-zinc-400 block mb-1">Power</span>
                <span className="font-mono font-medium dark:text-zinc-100">{currentMetrics.power} W</span>
              </div>
              <div className={`p-2 rounded border ${currentMetrics.anomaly ? 'bg-red-50 border-red-100 dark:bg-red-900/20 dark:border-red-900/50' : 'bg-gray-50 border-gray-100 dark:bg-zinc-950 dark:border-zinc-800'}`}>
                <span className={`block mb-1 ${currentMetrics.anomaly ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-zinc-400'}`}>CO₂e (est)</span>
                <span className={`font-mono font-medium ${currentMetrics.anomaly ? 'text-red-600 dark:text-red-300' : 'dark:text-zinc-100'}`}>{currentMetrics.co2e}</span>
              </div>
           </div>
        ) : (
          <div className="text-xs text-gray-500 dark:text-zinc-400 mb-4 p-3 bg-gray-50 dark:bg-zinc-950 rounded-lg border border-gray-100 dark:border-zinc-800 text-center">
            Simulator inactive. Press start to send mock IoT data to Firebase.
          </div>
        )}
        <button 
          className={`w-full py-2 px-4 rounded-lg flex items-center justify-center text-xs font-medium transition-colors ${
            isSimulating 
              ? "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40" 
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
          onClick={() => setIsSimulating(!isSimulating)}
        >
          {isSimulating ? (
            <><StopCircle className="w-4 h-4 mr-2" /> Stop Simulation</>
          ) : (
            <><Power className="w-4 h-4 mr-2" /> Start Digital Twin</>
          )}
        </button>
      </div>
    </div>
  );
}
