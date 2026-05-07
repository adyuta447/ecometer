import { Globe } from "lucide-react";

export function PublicDashboardPanel({ sharedLink }: { sharedLink: string }) {
  return (
    <div className="bg-surface-dark text-text-on-dark rounded-2xl p-6 border border-surface-dark-elevated">
      <div className="flex items-center gap-3 mb-6">
        <Globe className="w-5 h-5 text-brand-primary" />
        <h3 className="font-bold">Dashboard Publik</h3>
      </div>
      <p className="text-sm text-text-on-dark-soft mb-6 leading-relaxed">
        Dengan membuat efisiensi terlihat, kamu mendorong praktik berkelanjutan
        secara organik tanpa micromanagement.
      </p>
      <div className="p-3 bg-surface-dark-elevated rounded-xl flex items-center justify-between border border-surface-hairline/10">
        <span className="text-xs text-brand-primary truncate mr-2">
          {sharedLink}
        </span>
        <span className="text-[10px] uppercase font-bold text-brand-accent-teal bg-brand-accent-teal/10 px-2 py-1 rounded">
          Live
        </span>
      </div>
    </div>
  );
}
