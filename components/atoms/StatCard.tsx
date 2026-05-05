"use client";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  iconBg?: string;
}

export function StatCard({ label, value, icon, iconBg = "bg-surface-soft" }: StatCardProps) {
  return (
    <div className="bg-surface-card rounded-2xl p-4 border border-surface-hairline">
      <div className="flex items-center gap-2 mb-2">
        {icon && (
          <div className={`w-8 h-8 rounded-xl ${iconBg} flex items-center justify-center`}>
            {icon}
          </div>
        )}
        <span className="text-[10px] uppercase font-bold text-text-muted-soft tracking-widest">{label}</span>
      </div>
      <div className="text-xl font-serif font-bold text-text-ink">{value}</div>
    </div>
  );
}
