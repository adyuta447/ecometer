"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Calendar, Bell, Download, ChevronDown, X } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { useSimulator } from "./SimulatorProvider";
import {
  fetchActivities,
  formatTimeAgo,
  getSeverityColor,
  getSeverityBg,
  getActivityIcon,
  type ActivityEntry,
} from "@/lib/activityLog";

export function TopBar() {
  const { user } = useAuth();
  const { isAnySimulationActive, activeSimulations, aggregatedStats } = useSimulator();
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Date picker state
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });
  const [dateLabel, setDateLabel] = useState("Last 30 Days");

  const alertsRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (alertsRef.current && !alertsRef.current.contains(event.target as Node)) {
        setIsAlertsOpen(false);
      }
      if (dateRef.current && !dateRef.current.contains(event.target as Node)) {
        setIsDateOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch activities whenever the notification panel is opened or date range changes
  const loadActivities = useCallback(async () => {
    if (!user) return;
    setLoadingActivities(true);
    const startDate = dateRange.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = dateRange.end || new Date();
    const data = await fetchActivities(user.uid, 50, startDate, endDate);
    setActivities(data);
    setLoadingActivities(false);
  }, [user, dateRange]);

  useEffect(() => {
    if (isAlertsOpen) {
      loadActivities();
    }
  }, [isAlertsOpen, loadActivities]);

  // Poll for new activities every 10s to update the badge
  useEffect(() => {
    if (!user) return;
    const pollActivities = async () => {
      const data = await fetchActivities(user.uid, 10);
      const newCount = data.filter(
        (a) => new Date(a.timestamp) > new Date(Date.now() - 5 * 60 * 1000)
      ).length;
      setUnreadCount(newCount);
    };
    pollActivities();
    const interval = setInterval(pollActivities, 10000);
    return () => clearInterval(interval);
  }, [user, activeSimulations]);

  // Quick date range presets
  const setPreset = (label: string, days: number) => {
    const end = new Date();
    const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    setDateRange({ start, end });
    setDateLabel(label);
    setIsDateOpen(false);
  };

  const handleCustomDate = (type: "start" | "end", value: string) => {
    const date = new Date(value);
    setDateRange((prev) => ({ ...prev, [type]: date }));
    if (dateRange.start && dateRange.end) {
      setDateLabel(
        `${dateRange.start.toLocaleDateString("id-ID", { day: "numeric", month: "short" })} — ${dateRange.end.toLocaleDateString("id-ID", { day: "numeric", month: "short" })}`
      );
    }
  };

  return (
    <header className="h-20 flex-shrink-0 bg-surface-canvas border-b border-surface-hairline flex items-center justify-between px-8 py-4 font-sans z-10 sticky top-0 relative">
      <div>
        <h1 className="text-xl font-serif italic text-text-ink">
          Startup Ecosystem Jakarta 
          <span className="text-text-muted-soft not-italic text-sm ml-2 font-sans font-normal">/ Central Office Hub</span>
        </h1>
        {isAnySimulationActive && (
          <div className="flex items-center gap-2 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-accent-teal animate-pulse"></span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-brand-accent-teal">
              {activeSimulations.length} Device{activeSimulations.length > 1 ? "s" : ""} Live · {(aggregatedStats.totalPower / 1000).toFixed(2)} kW
            </span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-4">
        {/* Interactive Date Range Picker */}
        <div className="relative" ref={dateRef}>
          <button
            onClick={() => setIsDateOpen(!isDateOpen)}
            className="hidden md:flex px-4 py-2 bg-surface-card border border-surface-hairline rounded-2xl items-center gap-2 text-xs text-text-ink hover:bg-surface-soft transition-colors font-medium"
          >
            <Calendar className="w-4 h-4 text-brand-primary" />
            <span>{dateLabel}</span>
            <ChevronDown className="w-3 h-3 text-text-muted-soft" />
          </button>

          {isDateOpen && (
            <div className="absolute right-0 top-12 w-72 bg-surface-card border border-surface-hairline rounded-[24px] shadow-2xl p-4 z-50 animate-in slide-in-from-top-2 fade-in">
              <div className="text-[11px] font-bold uppercase tracking-widest text-text-muted-soft mb-3 px-1">
                Quick Presets
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  { label: "Today", days: 1 },
                  { label: "Last 7 Days", days: 7 },
                  { label: "Last 30 Days", days: 30 },
                  { label: "Last 90 Days", days: 90 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => setPreset(preset.label, preset.days)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                      dateLabel === preset.label
                        ? "bg-brand-primary text-text-on-dark"
                        : "bg-surface-soft text-text-body hover:bg-surface-hairline"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <div className="border-t border-surface-hairline pt-3">
                <div className="text-[11px] font-bold uppercase tracking-widest text-text-muted-soft mb-2 px-1">
                  Custom Range
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] text-text-muted-soft block mb-1 px-1">From</label>
                    <input
                      type="date"
                      onChange={(e) => handleCustomDate("start", e.target.value)}
                      className="w-full bg-surface-soft border border-surface-hairline rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-primary text-text-ink"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-text-muted-soft block mb-1 px-1">To</label>
                    <input
                      type="date"
                      onChange={(e) => handleCustomDate("end", e.target.value)}
                      className="w-full bg-surface-soft border border-surface-hairline rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-primary text-text-ink"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-surface-hairline mx-2 hidden md:block"></div>

        {/* Notifications Bell - Real Activities */}
        <div className="relative" ref={alertsRef}>
          <button 
            onClick={() => {
              setIsAlertsOpen(!isAlertsOpen);
              if (!isAlertsOpen) setUnreadCount(0);
            }}
            className="p-2 border border-surface-hairline rounded-xl hover:bg-surface-soft transition-colors relative"
          >
            <Bell className="w-5 h-5 text-text-ink" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-brand-primary text-text-on-dark text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
          
          {isAlertsOpen && (
            <div className="absolute right-0 top-12 w-96 bg-surface-card border border-surface-hairline rounded-[24px] shadow-2xl overflow-hidden animate-in slide-in-from-top-2 fade-in z-50">
              <div className="flex justify-between items-center p-4 border-b border-surface-hairline bg-surface-soft">
                <span className="text-[11px] font-bold uppercase tracking-widest text-text-muted">
                  Activity Feed
                </span>
                <div className="flex items-center gap-2">
                  {isAnySimulationActive && (
                    <span className="flex items-center gap-1 text-[10px] text-brand-accent-teal font-bold uppercase tracking-widest">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-accent-teal animate-pulse"></span>
                      Live
                    </span>
                  )}
                  <button
                    onClick={() => setIsAlertsOpen(false)}
                    className="text-text-muted hover:text-text-ink transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {loadingActivities ? (
                  <div className="p-6 text-center">
                    <div className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-xs text-text-muted mt-2">Loading activities...</p>
                  </div>
                ) : activities.length === 0 ? (
                  <div className="p-6 text-center">
                    <Bell className="w-8 h-8 text-surface-hairline mx-auto mb-2" />
                    <p className="text-sm text-text-muted">No recent activities</p>
                    <p className="text-xs text-text-muted-soft mt-1">Enable Device Simulation to generate events</p>
                  </div>
                ) : (
                  <div className="divide-y divide-surface-hairline">
                    {activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="p-3 hover:bg-surface-soft/50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-xl ${getSeverityBg(activity.severity)} flex items-center justify-center flex-shrink-0 text-sm mt-0.5`}>
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <span className={`text-[10px] font-bold uppercase tracking-widest ${getSeverityColor(activity.severity)}`}>
                                {activity.type.replace(/_/g, " ")}
                              </span>
                              <span className="text-[10px] text-text-muted-soft flex-shrink-0">
                                {formatTimeAgo(activity.timestamp)}
                              </span>
                            </div>
                            <p className="text-xs text-text-body mt-0.5 leading-relaxed">
                              {activity.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {activities.length > 0 && (
                <div className="p-3 border-t border-surface-hairline bg-surface-soft">
                  <button
                    onClick={loadActivities}
                    className="w-full text-center text-xs text-brand-primary font-medium hover:text-brand-primary-active transition-colors"
                  >
                    Refresh Activity Feed
                  </button>
                </div>
              )}
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
