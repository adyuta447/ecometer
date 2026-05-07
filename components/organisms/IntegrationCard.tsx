interface IntegrationCardProps {
  name: string;
  provider: string;
  description: string;
  isActive?: boolean;
  lastSync?: string;
  logo: React.ReactNode;
}

export function IntegrationCard({
  name,
  provider,
  description,
  isActive = false,
  lastSync,
  logo,
}: IntegrationCardProps) {
  return (
    <div
      className={`rounded-2xl p-6 flex flex-col ${
        isActive
          ? "bg-surface-card border border-brand-primary/20 relative overflow-hidden"
          : "bg-surface-canvas border border-surface-hairline"
      }`}
    >
      <div className="flex justify-between items-start mb-6">
        <div className="w-12 h-12 flex items-center justify-center">{logo}</div>
        {isActive && (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-brand-accent-teal/10 text-brand-accent-teal text-[10px] font-bold uppercase tracking-widest rounded-md">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-accent-teal animate-pulse"></div>{" "}
            Aktif
          </span>
        )}
      </div>
      <h3 className="font-bold text-text-ink mb-1">{name}</h3>
      <p className="text-sm text-text-muted mb-6 flex-1">{description}</p>
      <div className="flex items-center justify-between text-xs pt-4 border-t border-surface-hairline mt-auto">
        {isActive ? (
          <>
            <span className="text-text-muted-soft">
              Sync terakhir: {lastSync}
            </span>
            <button className="text-text-ink font-medium hover:text-brand-primary transition-colors">
              Konfigurasi
            </button>
          </>
        ) : (
          <button className="bg-surface-dark text-text-on-dark px-4 py-1.5 rounded-xl font-medium w-full text-center hover:bg-surface-dark-elevated transition-colors">
            Hubungkan
          </button>
        )}
      </div>
    </div>
  );
}
