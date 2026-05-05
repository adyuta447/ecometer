"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Plug, Trophy, Settings, Box, LayoutDashboard, Activity, FileText, Router, LogOut } from "lucide-react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useAuth } from "./AuthProvider";
import { useSimulator } from "./SimulatorProvider";
import { logActivity } from "@/lib/activityLog";

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { isAnySimulationActive, activeSimulations, aggregatedStats, anomalyCount } = useSimulator();

  const getLinkClasses = (path: string) => {
    const isActive = pathname === path;
    return `flex items-center gap-3 p-2 rounded-xl transition-colors font-medium text-sm ${
      isActive 
        ? "bg-surface-card text-brand-primary" 
        : "text-text-muted hover:bg-surface-soft"
    }`;
  };

  const handleLogout = async () => {
    if (user) {
      await logActivity(user.uid, "logout", "Pengguna keluar dari sistem", "info");
    }
    await signOut(auth);
  };

  // Skor agregasi dihitung dari data simulasi real-time
  const aggregationScore = isAnySimulationActive
    ? Math.max(85, 100 - anomalyCount * 0.5 - (aggregatedStats.totalPower > 5000 ? 2 : 0)).toFixed(1)
    : "97.5";

  return (
    <aside className="w-64 border-r border-surface-hairline flex flex-col p-6 bg-surface-canvas font-sans sticky top-0 h-screen">
      <div className="mb-10">
        <div className="text-2xl font-serif font-bold italic tracking-tighter text-brand-primary">EcoMeter</div>
        <div className="text-[10px] uppercase tracking-widest text-text-muted mt-1">B2B Energy SaaS</div>
      </div>
      
      <nav className="space-y-2 flex-1">
        <div className="text-[11px] font-bold uppercase tracking-widest text-text-muted-soft mb-4">Dashboard</div>
        
        <Link href="/" className={getLinkClasses("/")}>
          <LayoutDashboard className="w-4 h-4 ml-0.5" />
          <span>Ringkasan</span>
        </Link>
        <Link href="/analytics" className={getLinkClasses("/analytics")}>
          <Activity className="w-4 h-4 ml-0.5" />
          <span>Analitik & AI</span>
        </Link>
        <Link href="/groups" className={getLinkClasses("/groups")}>
          <Box className="w-4 h-4 ml-0.5" />
          <span>Grup Virtual</span>
        </Link>
        <Link href="/reports" className={getLinkClasses("/reports")}>
          <FileText className="w-4 h-4 ml-0.5" />
          <span>Audit SRUK</span>
        </Link>
        <Link href="/leaderboard" className={getLinkClasses("/leaderboard")}>
          <Trophy className="w-4 h-4 ml-0.5" />
          <span>Papan Peringkat</span>
        </Link>
        <Link href="/integrations" className={getLinkClasses("/integrations")}>
          <Plug className="w-4 h-4 ml-0.5" />
          <span>Integrasi ERP</span>
        </Link>

        <div className="mt-8 mb-4">
          <div className="text-[11px] font-bold uppercase tracking-widest text-text-muted-soft mb-4">Sistem</div>
          <Link href="/devices" className={getLinkClasses("/devices")}>
            <Router className="w-4 h-4 ml-0.5" />
            <span className="flex items-center gap-2">
              Perangkat IoT
              {isAnySimulationActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-brand-accent-teal animate-pulse"></span>
              )}
            </span>
          </Link>
          <Link href="/settings/billing" className={getLinkClasses("/settings/billing")}>
            <Settings className="w-4 h-4 ml-0.5" />
            <span>Pengaturan</span>
          </Link>
        </div>
      </nav>

      <div className="mt-auto">
        <div className="p-4 bg-surface-dark rounded-2xl text-text-on-dark mb-4">
          <div className="text-[10px] text-text-on-dark-soft mb-1 uppercase tracking-widest font-bold">
            Skor Agregasi
            {isAnySimulationActive && (
              <span className="ml-1 text-brand-accent-teal">· Live</span>
            )}
          </div>
          <div className="text-2xl font-serif">{aggregationScore}%</div>
          <div className="w-full bg-surface-dark-elevated h-1 rounded-full mt-2">
            <div
              className="bg-brand-primary h-full rounded-full transition-all duration-1000"
              style={{ width: `${aggregationScore}%` }}
            ></div>
          </div>
          {isAnySimulationActive && (
            <div className="text-[9px] text-text-on-dark-soft mt-1.5">
              {activeSimulations.length} perangkat · {(aggregatedStats.totalPower / 1000).toFixed(2)} kW
            </div>
          )}
        </div>

        <button onClick={handleLogout} className="flex items-center gap-3 w-full p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors text-sm font-medium">
          <LogOut className="w-4 h-4 ml-0.5" />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
}
