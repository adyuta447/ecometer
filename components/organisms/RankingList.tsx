import { RankTeam } from "@/hooks/useLeaderboard";

export function RankingList({ rankings }: { rankings: RankTeam[] }) {
  return (
    <div className="bg-surface-card rounded-2xl p-6 border border-surface-hairline">
      <h3 className="text-[11px] font-bold uppercase tracking-widest text-brand-primary mb-6">
        Peringkat Detail
      </h3>

      <div className="space-y-4">
        {rankings.map((team) => (
          <div
            key={team.id}
            className={`flex items-center justify-between p-4 rounded-2xl ${
              team.rank === 1
                ? "bg-surface-canvas border border-brand-accent-teal/30"
                : team.rank > 2
                  ? "bg-surface-canvas border border-surface-hairline opacity-80"
                  : "bg-surface-canvas border border-surface-hairline"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-8 h-8 rounded-full font-bold flex items-center justify-center font-serif text-sm ${
                  team.rank === 1
                    ? "bg-brand-accent-teal/10 text-brand-accent-teal"
                    : "bg-surface-soft text-text-muted"
                }`}
              >
                {team.rank}
              </div>
              <div>
                <div className="font-bold text-text-ink">{team.name}</div>
                <div
                  className={`text-xs ${
                    team.efficiencyValue > 0
                      ? team.rank === 1
                        ? "text-brand-accent-teal"
                        : "text-brand-primary"
                      : "text-brand-accent-amber"
                  }`}
                >
                  {team.efficiencyText}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-text-ink">
                {team.kwhDiff > 0 ? `+${team.kwhDiff}` : team.kwhDiff} kWh
              </div>
              <div className="text-[10px] uppercase text-text-muted-soft">
                {team.kwhText}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
