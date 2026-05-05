"use client";

import {
  KeyRound,
  LogOut,
  Zap,
  Unplug,
  Router,
  Trash2,
  FolderPlus,
  FolderMinus,
  AlertTriangle,
  FileDown,
  Settings,
  Wrench,
  ClipboardList,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  KeyRound,
  LogOut,
  Zap,
  Unplug,
  Router,
  Trash2,
  FolderPlus,
  FolderMinus,
  AlertTriangle,
  FileDown,
  Settings,
  Wrench,
  ClipboardList,
};

interface ActivityIconProps {
  name: string;
  className?: string;
}

export function ActivityIcon({ name, className = "w-4 h-4" }: ActivityIconProps) {
  const Icon = iconMap[name] || ClipboardList;
  return <Icon className={className} />;
}
