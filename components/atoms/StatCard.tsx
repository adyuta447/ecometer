"use client";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}

export function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="bg-surface-card rounded-2xl p-4 border border-surface-hairline">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-[10px] uppercase font-bold text-text-muted-soft tracking-widest">{label}</span>
      </div>
      <div className="text-xl font-serif font-bold text-text-ink">{value}</div>
    </div>
  );
}
