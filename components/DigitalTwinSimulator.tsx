"use client";

import { useAuth } from "./AuthProvider";
import { Activity, Power, Wifi, StopCircle, X } from "lucide-react";
import { useSimulator } from "./SimulatorProvider";

interface DigitalTwinSimulatorProps {
  device?: any;
  onClose: () => void;
}

export function DigitalTwinSimulator({
  device,
  onClose,
}: DigitalTwinSimulatorProps) {
  const { user } = useAuth();
  const { activeSimulations, toggleSimulation, latestMetrics } = useSimulator();

  if (!user || !device) return null;

  const isSimulating = activeSimulations.includes(device.id);
  const currentMetrics = latestMetrics[device.id];

  return (
    <div className="fixed inset-0 bg-surface-dark/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface-dark-elevated border border-surface-hairline/20 rounded-2xl p-8 w-full max-w-md text-text-on-dark relative">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-serif font-bold italic flex items-center gap-2">
              <Activity className="w-5 h-5 text-brand-primary" />
              Simulator Digital Twin
            </h2>
            <p className="text-[10px] uppercase font-bold text-text-on-dark-soft tracking-widest mt-1">
              {device.name}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Wifi
              className={`w-5 h-5 ${isSimulating ? "text-brand-accent-teal animate-pulse" : "text-text-on-dark-soft"}`}
            />
            <button
              onClick={onClose}
              className="text-text-on-dark-soft hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="mb-6">
          {currentMetrics && isSimulating ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface-dark p-4 rounded-2xl border border-surface-hairline/10">
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-on-dark-soft block mb-1">
                  Tegangan
                </span>
                <span className="font-mono text-lg font-medium text-white">
                  {currentMetrics.voltage}{" "}
                  <span className="text-sm text-text-on-dark-soft">V</span>
                </span>
              </div>
              <div className="bg-surface-dark p-4 rounded-2xl border border-surface-hairline/10">
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-on-dark-soft block mb-1">
                  Arus
                </span>
                <span className="font-mono text-lg font-medium text-white">
                  {currentMetrics.current}{" "}
                  <span className="text-sm text-text-on-dark-soft">A</span>
                </span>
              </div>
              <div className="bg-surface-dark p-4 rounded-2xl border border-surface-hairline/10">
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-on-dark-soft block mb-1">
                  Daya
                </span>
                <span className="font-mono text-lg font-medium text-white">
                  {currentMetrics.power}{" "}
                  <span className="text-sm text-text-on-dark-soft">W</span>
                </span>
              </div>
              <div
                className={`p-4 rounded-2xl border ${currentMetrics.anomaly ? "bg-brand-primary/20 border-brand-primary/50" : "bg-surface-dark border-surface-hairline/10"}`}
              >
                <span
                  className={`text-[10px] font-bold uppercase tracking-widest block mb-1 ${currentMetrics.anomaly ? "text-brand-primary" : "text-text-on-dark-soft"}`}
                >
                  CO₂e (est)
                </span>
                <span
                  className={`font-mono text-lg font-medium ${currentMetrics.anomaly ? "text-brand-primary" : "text-white"}`}
                >
                  {currentMetrics.co2e}{" "}
                  <span className="text-sm opacity-50">kg</span>
                </span>
              </div>
            </div>
          ) : (
            <div className="text-sm text-text-on-dark-soft p-6 bg-surface-dark border border-surface-hairline/10 rounded-2xl text-center">
              Sistem standby. Aktifkan untuk mulai transmisi telemetri real-time.
            </div>
          )}
        </div>

        <button
          className={`w-full py-4 rounded-2xl flex items-center justify-center text-sm font-bold tracking-wide transition-colors ${
            isSimulating
              ? "bg-surface-dark border border-brand-primary/30 text-brand-primary hover:bg-brand-primary/10"
              : "bg-brand-primary text-text-on-dark hover:bg-brand-primary-active"
          }`}
          onClick={() => toggleSimulation(device.id)}
        >
          {isSimulating ? (
            <>
              <StopCircle className="w-5 h-5 mr-2" /> Hentikan Telemetri
            </>
          ) : (
            <>
              <Power className="w-5 h-5 mr-2" /> Aktifkan Digital Twin
            </>
          )}
        </button>
      </div>
    </div>
  );
}
