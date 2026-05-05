import { collection, addDoc, query, where, orderBy, limit, getDocs, Timestamp } from "firebase/firestore";
import { db } from "./firebase";

export type ActivityType =
  | "login"
  | "logout"
  | "simulation_start"
  | "simulation_stop"
  | "device_registered"
  | "device_deleted"
  | "group_created"
  | "group_deleted"
  | "anomaly_detected"
  | "export_report"
  | "settings_changed"
  | "efficiency_override";

export interface ActivityEntry {
  id?: string;
  userId: string;
  type: ActivityType;
  message: string;
  severity: "info" | "success" | "warning" | "critical";
  timestamp: string;
  meta?: Record<string, any>;
}

export async function logActivity(
  userId: string,
  type: ActivityType,
  message: string,
  severity: ActivityEntry["severity"] = "info",
  meta?: Record<string, any>
) {
  try {
    await addDoc(collection(db, "activity_log"), {
      userId,
      type,
      message,
      severity,
      timestamp: new Date().toISOString(),
      meta: meta || {},
    });
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
}

export async function fetchActivities(
  userId: string,
  limitCount: number = 50,
  startDate?: Date,
  endDate?: Date
): Promise<ActivityEntry[]> {
  try {
    let q = query(
      collection(db, "activity_log"),
      where("userId", "==", userId),
      orderBy("timestamp", "desc"),
      limit(limitCount)
    );

    const qs = await getDocs(q);
    let activities = qs.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as ActivityEntry[];

    // Client-side date filtering (Firestore compound queries would need composite indexes)
    if (startDate) {
      activities = activities.filter(
        (a) => new Date(a.timestamp) >= startDate
      );
    }
    if (endDate) {
      activities = activities.filter(
        (a) => new Date(a.timestamp) <= endDate
      );
    }

    return activities;
  } catch (err) {
    console.error("Failed to fetch activities:", err);
    return [];
  }
}

export function getActivityIconName(type: ActivityType): string {
  const map: Record<ActivityType, string> = {
    login: "KeyRound",
    logout: "LogOut",
    simulation_start: "Zap",
    simulation_stop: "Unplug",
    device_registered: "Router",
    device_deleted: "Trash2",
    group_created: "FolderPlus",
    group_deleted: "FolderMinus",
    anomaly_detected: "AlertTriangle",
    export_report: "FileDown",
    settings_changed: "Settings",
    efficiency_override: "Wrench",
  };
  return map[type] || "ClipboardList";
}

export function getSeverityColor(severity: ActivityEntry["severity"]): string {
  const map: Record<string, string> = {
    info: "text-blue-400",
    success: "text-brand-accent-teal",
    warning: "text-brand-accent-amber",
    critical: "text-brand-primary",
  };
  return map[severity] || "text-text-muted";
}

export function getSeverityBg(severity: ActivityEntry["severity"]): string {
  const map: Record<string, string> = {
    info: "bg-blue-500/10",
    success: "bg-brand-accent-teal/10",
    warning: "bg-brand-accent-amber/10",
    critical: "bg-brand-primary/10",
  };
  return map[severity] || "bg-surface-soft";
}

export function getSeverityIconColor(severity: ActivityEntry["severity"]): string {
  const map: Record<string, string> = {
    info: "text-blue-400",
    success: "text-brand-accent-teal",
    warning: "text-brand-accent-amber",
    critical: "text-brand-primary",
  };
  return map[severity] || "text-text-muted";
}

export function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 10) return "Baru aja";
  if (diffSec < 60) return `${diffSec} detik lalu`;
  if (diffMin < 60) return `${diffMin} menit lalu`;
  if (diffHour < 24) return `${diffHour} jam lalu`;
  if (diffDay < 7) return `${diffDay} hari lalu`;
  return then.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

export function getActivityLabel(type: ActivityType): string {
  const map: Record<ActivityType, string> = {
    login: "Masuk",
    logout: "Keluar",
    simulation_start: "Simulasi Aktif",
    simulation_stop: "Simulasi Berhenti",
    device_registered: "Perangkat Baru",
    device_deleted: "Perangkat Dihapus",
    group_created: "Grup Dibuat",
    group_deleted: "Grup Dihapus",
    anomaly_detected: "Anomali Terdeteksi",
    export_report: "Laporan Diekspor",
    settings_changed: "Pengaturan Diubah",
    efficiency_override: "Override Efisiensi",
  };
  return map[type] || type.replace(/_/g, " ");
}
