"use client";

import { ActivityIcon } from "@/components/atoms/ActivityIcon";
import {
  getActivityIconName,
  getSeverityBg,
  getSeverityColor,
  getSeverityIconColor,
  formatTimeAgo,
  getActivityLabel,
  type ActivityEntry,
} from "@/lib/activityLog";

interface ActivityItemProps {
  activity: ActivityEntry;
  compact?: boolean;
}

export function ActivityItem({ activity, compact = false }: ActivityItemProps) {
  const iconName = getActivityIconName(activity.type);

  if (compact) {
    return (
      <div className="p-3 bg-white/50 rounded-2xl border border-white/40 hover:bg-white/70 transition-colors">
        <div className="flex items-start gap-2.5">
          <div className={`w-7 h-7 rounded-lg ${getSeverityBg(activity.severity)} flex items-center justify-center flex-shrink-0`}>
            <ActivityIcon name={iconName} className={`w-3.5 h-3.5 ${getSeverityIconColor(activity.severity)}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-0.5">
              <span className={`text-[10px] font-bold uppercase tracking-widest ${getSeverityColor(activity.severity)}`}>
                {getActivityLabel(activity.type)}
              </span>
              <span className="text-[10px] text-text-muted-soft">
                {formatTimeAgo(activity.timestamp)}
              </span>
            </div>
            <p className="text-xs leading-tight text-text-body truncate">
              {activity.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 hover:bg-surface-soft/50 transition-colors">
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-xl ${getSeverityBg(activity.severity)} flex items-center justify-center flex-shrink-0 mt-0.5`}>
          <ActivityIcon name={iconName} className={`w-4 h-4 ${getSeverityIconColor(activity.severity)}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <span className={`text-[10px] font-bold uppercase tracking-widest ${getSeverityColor(activity.severity)}`}>
              {getActivityLabel(activity.type)}
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
  );
}
