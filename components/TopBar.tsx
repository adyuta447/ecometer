"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Calendar, Bell, Download, ChevronDown, X, Menu } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { useSimulator } from "./SimulatorProvider";
import { ActivityItem } from "@/components/molecules/ActivityItem";
import {
  fetchActivities,
  type ActivityEntry,
} from "@/lib/activityLog";

interface TopBarProps {
  onMenuToggle?: () => void;
}

export function TopBar({ onMenuToggle }: TopBarProps) {
  const { user } = useAuth();
  const { isAnySimulationActive, activeSimulations, aggregatedStats } = useSimulator();
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const [isDateOpen, setIsDateOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });
  const [dateLabel, setDateLabel] = useState("30 Hari Terakhir");

  const alertsRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);

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
    <header className="h-14 md:h-20 flex-shrink-0 bg-surface-canvas border-b border-surface-hairline flex items-center justify-between px-4 md:px-8 py-3 md:py-4 font-sans z-10 sticky top-0 relative">
      <div className="flex items-center gap-3 min-w-0">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuToggle}
          className="md:hidden p-1.5 rounded-xl hover:bg-surface-soft transition-colors flex-shrink-0"
        >
          <Menu className="w-5 h-5 text-text-ink" />
        </button>

        <div className="min-w-0">
          <h1 className="text-base md:text-xl font-serif italic text-text-ink truncate">
            Ekosistem Startup Jakarta
            <span className="text-text-muted-soft not-italic text-sm ml-2 font-sans font-normal hidden sm:inline">/ Kantor Pusat</span>
          </h1>
          {isAnySimulationActive && (
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-accent-teal animate-pulse"></span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-brand-accent-teal">
                {activeSimulations.length} Aktif · {(aggregatedStats.totalPower / 1000).toFixed(2)} kW
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
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
            <div className="absolute right-0 top-12 w-72 bg-surface-card border border-surface-hairline rounded-2xl p-4 z-50">
              <div className="text-[11px] font-bold uppercase tracking-widest text-text-muted-soft mb-3 px-1">
                Pilih Cepat
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  { label: "Hari Ini", days: 1 },
                  { label: "7 Hari Terakhir", days: 7 },
                  { label: "30 Hari Terakhir", days: 30 },
                  { label: "90 Hari Terakhir", days: 90 },
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
                  Rentang Kustom
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] text-text-muted-soft block mb-1 px-1">Dari</label>
                    <input
                      type="date"
                      onChange={(e) => handleCustomDate("start", e.target.value)}
                      className="w-full bg-surface-soft border border-surface-hairline rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-primary text-text-ink"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-text-muted-soft block mb-1 px-1">Sampai</label>
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

        <div className="relative" ref={alertsRef}>
          <button 
            onClick={() => {
              setIsAlertsOpen(!isAlertsOpen);
              if (!isAlertsOpen) setUnreadCount(0);
            }}
            className="p-2 border border-surface-hairline rounded-2xl hover:bg-surface-soft transition-colors relative"
          >
            <Bell className="w-5 h-5 text-text-ink" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-brand-primary text-text-on-dark text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
          
          {isAlertsOpen && (
            <div className="fixed inset-x-4 top-16 md:absolute md:inset-x-auto md:right-0 md:top-12 md:w-96 bg-surface-card border border-surface-hairline rounded-2xl overflow-hidden z-50">
              <div className="flex justify-between items-center p-4 border-b border-surface-hairline bg-surface-soft">
                <span className="text-[11px] font-bold uppercase tracking-widest text-text-muted">
                  Riwayat Aktivitas
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
                    <p className="text-xs text-text-muted mt-2">Memuat aktivitas...</p>
                  </div>
                ) : activities.length === 0 ? (
                  <div className="p-6 text-center">
                    <Bell className="w-6 h-6 text-text-muted-soft mx-auto mb-2" />
                    <p className="text-sm text-text-muted">Belum ada aktivitas</p>
                    <p className="text-xs text-text-muted-soft mt-1">Nyalakan simulasi perangkat buat mulai tracking</p>
                  </div>
                ) : (
                  <div className="divide-y divide-surface-hairline">
                    {activities.map((activity) => (
                      <ActivityItem key={activity.id} activity={activity} />
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
                    Muat Ulang Aktivitas
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <button className="hidden sm:flex px-5 py-2.5 bg-text-ink hover:bg-brand-primary text-text-on-dark rounded-2xl text-xs font-bold tracking-wide transition-colors items-center gap-2">
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">EKSPOR</span>
        </button>
      </div>
    </header>
  );
}
