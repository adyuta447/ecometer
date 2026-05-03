"use client";

import { useState } from "react";
import { Calendar, Bell, Download, Filter } from "lucide-react";

export function TopBar() {
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);

  return (
    <header className="h-20 flex-shrink-0 bg-surface-canvas border-b border-surface-hairline flex items-center justify-between px-8 py-4 font-sans z-10 sticky top-0 relative">
      <div>
        <h1 className="text-xl font-serif italic text-text-ink">
          Startup Ecosystem Jakarta 
          <span className="text-text-muted-soft not-italic text-sm ml-2 font-sans font-normal">/ Central Office Hub</span>
        </h1>
      </div>
      <div className="flex items-center gap-4">
        {/* Date Range Picker Placeholder */}
        <button className="hidden md:flex px-4 py-2 bg-surface-card border border-surface-hairline rounded-2xl items-center gap-2 text-xs text-text-ink hover:bg-surface-soft transition-colors font-medium">
          <Calendar className="w-4 h-4 text-brand-primary" />
          <span>Last 30 Days</span>
        </button>

        <div className="h-6 w-px bg-surface-hairline mx-2 hidden md:block"></div>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setIsAlertsOpen(!isAlertsOpen)}
            className="p-2 border border-surface-hairline rounded-xl hover:bg-surface-soft transition-colors relative"
          >
            <Bell className="w-5 h-5 text-text-ink" />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-brand-primary border-2 border-surface-canvas rounded-full translate-x-1/3 -translate-y-1/3"></span>
          </button>
          
          {isAlertsOpen && (
            <div className="absolute right-0 top-12 w-80 bg-surface-card border border-surface-hairline rounded-[24px] shadow-2xl p-4 animate-in slide-in-from-top-2 fade-in">
              <div className="flex justify-between items-center mb-3 px-2">
                <span className="text-[11px] font-bold uppercase tracking-widest text-text-muted">Anomaly Alerts</span>
                <span className="text-xs text-brand-primary font-medium cursor-pointer">Mark all read</span>
              </div>
              <div className="space-y-2">
                <div className="p-3 bg-brand-primary/5 rounded-xl border border-brand-primary/10">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-bold uppercase text-brand-primary">Critical</span>
                    <span className="text-[10px] text-text-muted-soft">2m ago</span>
                  </div>
                  <p className="text-xs text-text-ink">HVAC Cluster B usage spiked 40% vs historical average.</p>
                </div>
                <div className="p-3 bg-surface-soft rounded-xl border border-transparent">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-bold uppercase text-brand-accent-teal">Resolved</span>
                    <span className="text-[10px] text-text-muted-soft">1h ago</span>
                  </div>
                  <p className="text-xs text-text-ink">Server load normalized after load balancing.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <button className="px-5 py-2.5 bg-text-ink hover:bg-brand-primary text-text-on-dark rounded-2xl text-xs font-bold tracking-wide transition-colors flex items-center gap-2">
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">EXPORT</span>
        </button>
      </div>
    </header>
  );
}
