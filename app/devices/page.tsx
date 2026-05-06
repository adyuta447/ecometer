"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { useDevices } from "@/hooks/useDevices";
import { DeviceStatsCards } from "@/components/organisms/DeviceStatsCards";
import { DeviceTable } from "@/components/organisms/DeviceTable";
import { RegisterDeviceModal } from "@/components/organisms/RegisterDeviceModal";
import { DigitalTwinSimulator } from "@/components/DigitalTwinSimulator";

export default function DevicesPage() {
  const {
    devices,
    loading,
    saving,
    stats,
    activeSimulations,
    latestMetrics,
    registerDevice,
    deleteDevice,
  } = useDevices();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [simulatorDevice, setSimulatorDevice] = useState<any>(null);

  if (loading) {
    return (
      <div className="p-4 md:p-8 max-w-6xl mx-auto flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold italic text-text-ink mb-1">
            Kesehatan Perangkat IoT
          </h1>
          <p className="text-sm text-text-muted">
            Kelola sensor IoT plug-and-play. Target akurasi MAPE &lt; 3%.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-brand-primary text-text-on-dark px-5 py-2 rounded-xl text-sm font-bold tracking-wide transition-colors hover:bg-brand-primary-active"
        >
          <Plus className="w-4 h-4" />
          Daftarkan Sensor Baru
        </button>
      </div>

      <DeviceStatsCards
        activeSensorsCount={stats.activeSensorsCount}
        offlineSystemsCount={stats.offlineSystemsCount}
        globalMape={stats.globalMape}
      />

      <DeviceTable
        devices={devices}
        activeSimulations={activeSimulations}
        latestMetrics={latestMetrics}
        onDelete={deleteDevice}
        onOpenSimulator={setSimulatorDevice}
      />

      {isModalOpen && (
        <RegisterDeviceModal
          saving={saving}
          onClose={() => setIsModalOpen(false)}
          onRegister={registerDevice}
        />
      )}

      {/* Simulator Modal */}
      {simulatorDevice && (
        <div className="fixed inset-0 bg-surface-dark/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <DigitalTwinSimulator
            device={simulatorDevice}
            onClose={() => setSimulatorDevice(null)}
          />
        </div>
      )}
    </div>
  );
}
