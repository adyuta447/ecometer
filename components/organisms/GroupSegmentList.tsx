import { Filter } from "lucide-react";

export function GroupSegmentList({ groups, activeSegment, setActiveSegment, activeSimulations }: { 
  groups: any[]; 
  activeSegment: any; 
  setActiveSegment: (g: any) => void;
  activeSimulations: string[];
}) {
  return (
    <div className="col-span-1 bg-surface-card rounded-2xl p-5 border border-surface-hairline">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-text-muted-soft">
          Segmen
        </h3>
        <Filter className="w-3 h-3 text-text-muted-soft" />
      </div>
      <div className="space-y-1">
        {groups.map((g) => {
          const hasActiveDevices = g.deviceIds?.some((id: string) => activeSimulations.includes(id));
          return (
            <div
              key={g.id}
              onClick={() => setActiveSegment(g)}
              className={`p-2.5 rounded-lg text-sm font-medium flex items-center justify-between cursor-pointer transition-colors ${
                activeSegment?.id === g.id
                  ? "bg-brand-primary/10 text-brand-primary"
                  : "text-text-body hover:bg-surface-soft"
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                {hasActiveDevices && (
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-accent-teal animate-pulse flex-shrink-0"></span>
                )}
                <span className="truncate">{g.name}</span>
              </div>
              <div className="flex items-center gap-1">
                {g.deviceIds?.length > 0 && (
                  <span className="text-[9px] px-1.5 py-0.5 bg-surface-soft text-text-muted rounded-md">
                    {g.deviceIds.length} alat
                  </span>
                )}
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                    activeSegment?.id === g.id
                      ? "bg-brand-primary/20"
                      : "bg-surface-soft text-text-muted"
                  }`}
                >
                  {g.capacityPercentage || "0%"}
                </span>
              </div>
            </div>
          );
        })}
        {groups.length === 0 && (
          <div className="text-xs text-text-muted p-2">
            Belum ada segmen. Yuk bikin!
          </div>
        )}
      </div>
    </div>
  );
}