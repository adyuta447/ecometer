"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Plug, Trophy, Settings, Box, LayoutDashboard, Activity, FileText, Router } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const getLinkClasses = (path: string) => {
    const isActive = pathname === path;
    return `flex items-center gap-3 p-2 rounded-xl transition-colors font-medium text-sm ${
      isActive 
        ? "bg-surface-card text-brand-primary" 
        : "text-text-muted hover:bg-surface-soft"
    }`;
  };

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
          <span>Overview</span>
        </Link>
        <Link href="/analytics" className={getLinkClasses("/analytics")}>
          <Activity className="w-4 h-4 ml-0.5" />
          <span>Analytics & AI</span>
        </Link>
        <Link href="/groups" className={getLinkClasses("/groups")}>
          <Box className="w-4 h-4 ml-0.5" />
          <span>Virtual Groups</span>
        </Link>
        <Link href="/reports" className={getLinkClasses("/reports")}>
          <FileText className="w-4 h-4 ml-0.5" />
          <span>SRUK Audit</span>
        </Link>
        <Link href="/leaderboard" className={getLinkClasses("/leaderboard")}>
          <Trophy className="w-4 h-4 ml-0.5" />
          <span>Leaderboard</span>
        </Link>
        <Link href="/integrations" className={getLinkClasses("/integrations")}>
          <Plug className="w-4 h-4 ml-0.5" />
          <span>ERP Integration</span>
        </Link>

        <div className="mt-8 mb-4">
          <div className="text-[11px] font-bold uppercase tracking-widest text-text-muted-soft mb-4">System</div>
          <Link href="/devices" className={getLinkClasses("/devices")}>
            <Router className="w-4 h-4 ml-0.5" />
            <span>IoT Devices</span>
          </Link>
          <Link href="/settings/billing" className={getLinkClasses("/settings/billing")}>
            <Settings className="w-4 h-4 ml-0.5" />
            <span>Settings</span>
          </Link>
        </div>
      </nav>

      <div className="mt-auto">
        <div className="p-4 bg-surface-dark rounded-2xl text-text-on-dark shadow-sm">
          <div className="text-[10px] text-text-on-dark-soft mb-1 uppercase tracking-widest font-bold">Aggregation Score</div>
          <div className="text-2xl font-serif">97.5%</div>
          <div className="w-full bg-surface-dark-elevated h-1 rounded-full mt-2">
            <div className="bg-brand-primary h-full rounded-full" style={{ width: '97.5%' }}></div>
          </div>
        </div>
      </div>
    </aside>
  );
}
