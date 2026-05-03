"use client";

import { useState } from "react";
import { Plus, Router, WifiHigh, WifiOff, Activity, AlertCircle, X, Check } from "lucide-react";

export default function DevicesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [devices, setDevices] = useState([
    { id: 1, mac: "00:1A:2B:3C:A4:F2", name: "Panel T-1 Server", status: "online", mape: "2.1%", lastPing: "1m ago" },
    { id: 2, mac: "00:1A:2B:3C:B8:11", name: "HVAC Zone A", status: "online", mape: "1.8%", lastPing: "2m ago" },
    { id: 3, mac: "00:1A:2B:3C:C7:99", name: "Lighting Hub 3", status: "offline", mape: "Error", lastPing: "4hrs ago" }
  ]);

  const [newDevice, setNewDevice] = useState({ mac: "", name: "" });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if(newDevice.mac && newDevice.name) {
      setDevices([...devices, { 
        id: Date.now(), 
        mac: newDevice.mac, 
        name: newDevice.name, 
        status: "online", 
        mape: "calculating...", 
        lastPing: "Just now" 
      }]);
      setIsModalOpen(false);
      setNewDevice({ mac: "", name: "" });
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold italic text-text-ink mb-1">Device & Hardware Health</h1>
          <p className="text-sm text-text-muted">Manage plug-and-play IoT sensors. Target MAPE accuracy &lt; 3%.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-brand-primary text-text-on-dark px-5 py-2 rounded-xl text-sm font-bold tracking-wide transition-colors hover:bg-brand-primary-active"
        >
          <Plus className="w-4 h-4" />
          Register Custom Sensor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <div className="bg-surface-card rounded-[24px] p-5 border border-surface-hairline">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] uppercase font-bold text-text-muted-soft tracking-widest">Active Sensors</span>
              <Activity className="w-4 h-4 text-brand-accent-teal" />
            </div>
            <div className="text-2xl font-serif font-bold text-text-ink">{devices.filter(d => d.status === 'online').length}</div>
         </div>
         <div className="bg-surface-card rounded-[24px] p-5 border border-surface-hairline border-brand-primary/30">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] uppercase font-bold text-brand-primary tracking-widest">Offline Systems</span>
              <AlertCircle className="w-4 h-4 text-brand-primary" />
            </div>
            <div className="text-2xl font-serif font-bold text-text-ink">{devices.filter(d => d.status === 'offline').length}</div>
         </div>
         <div className="bg-surface-card rounded-[24px] p-5 border border-surface-hairline md:col-span-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] uppercase font-bold text-text-muted-soft tracking-widest">Global MAPE Accuracy</span>
            </div>
            <div className="text-2xl font-serif font-bold text-text-ink flex items-end gap-2">
              2.8% <span className="text-sm font-sans font-medium text-brand-accent-teal mb-1">Excellent</span>
            </div>
         </div>
      </div>

      <div className="bg-surface-canvas border border-surface-hairline rounded-[32px] overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-soft text-[11px] uppercase tracking-widest text-text-muted-soft">
            <tr>
              <th className="px-6 py-4 font-bold border-b border-surface-hairline">Device Name</th>
              <th className="px-6 py-4 font-bold border-b border-surface-hairline">MAC Address</th>
              <th className="px-6 py-4 font-bold border-b border-surface-hairline">Status</th>
              <th className="px-6 py-4 font-bold border-b border-surface-hairline">MAPE</th>
              <th className="px-6 py-4 font-bold border-b border-surface-hairline">Last Ping</th>
            </tr>
          </thead>
          <tbody className="text-text-body">
            {devices.map(device => (
              <tr key={device.id} className="hover:bg-surface-soft/50 transition-colors border-b border-surface-hairline last:border-0 border-dashed">
                <td className="px-6 py-4 font-medium flex items-center gap-3">
                   <Router className={`w-4 h-4 ${device.status === 'online' ? 'text-text-muted' : 'text-brand-primary'}`} />
                   {device.name}
                </td>
                <td className="px-6 py-4 font-mono text-xs">{device.mac}</td>
                <td className="px-6 py-4">
                  {device.status === 'online' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-accent-teal/10 text-brand-accent-teal text-[10px] font-bold uppercase tracking-widest rounded-md">
                      <WifiHigh className="w-3 h-3" /> Online
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-primary/10 text-brand-primary text-[10px] font-bold uppercase tracking-widest rounded-md">
                      <WifiOff className="w-3 h-3" /> Offline
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">{device.mape}</td>
                <td className="px-6 py-4 text-xs text-text-muted">{device.lastPing}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-surface-dark/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-dark-elevated border border-surface-hairline/20 rounded-[32px] p-8 w-full max-w-md text-text-on-dark shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-serif font-bold italic">Register Sensor</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-text-on-dark-soft hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-text-on-dark-soft mb-2">MAC Address / S.N.</label>
                <input 
                  type="text" 
                  value={newDevice.mac}
                  onChange={e => setNewDevice({...newDevice, mac: e.target.value})}
                  autoFocus
                  placeholder="e.g. 00:1A:2B:3C:D4:E5"
                  className="w-full bg-surface-dark border border-surface-hairline/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-primary font-mono text-white transition-colors placeholder:text-text-on-dark-soft/50"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-text-on-dark-soft mb-2">Location / Placement</label>
                <input 
                  type="text" 
                  value={newDevice.name}
                  onChange={e => setNewDevice({...newDevice, name: e.target.value})}
                  placeholder="e.g. Panel Utama Lantai 3"
                  className="w-full bg-surface-dark border border-surface-hairline/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-primary text-white transition-colors placeholder:text-text-on-dark-soft/50"
                  required
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-brand-primary text-text-on-dark px-4 py-3 rounded-xl text-sm font-bold tracking-wide hover:bg-brand-primary-active transition-colors mt-6 flex justify-center items-center gap-2"
              >
                <Check className="w-4 h-4" /> Save Registration
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
