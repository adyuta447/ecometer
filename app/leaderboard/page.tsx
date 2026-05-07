import { Share2 } from "lucide-react";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { HeroWinnerCard } from "@/components/organisms/HeroWinnerCard";
import { RankingList } from "@/components/organisms/RankingList";
import { PublicDashboardPanel } from "@/components/organisms/PublicDashboardPanel";
import { TotalSavedCard } from "@/components/organisms/TotalSavedCard";

export default function LeaderboardPage() {
  const { winner, rankings, sharedLink, totalSavedKwh } = useLeaderboard();

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold italic text-text-ink mb-1">
            Papan Peringkat Eco
          </h1>
          <p className="text-sm text-text-muted">
            Jadikan keberlanjutan sebagai kompetisi seru antar tim.
          </p>
        </div>
        <button className="flex items-center gap-2 bg-surface-card border border-surface-hairline text-text-ink px-4 py-2 rounded-xl text-sm font-medium hover:bg-surface-soft transition-colors">
          <Share2 className="w-4 h-4 text-brand-primary" />
          Bagikan Link Publik
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-8">
        <div className="md:col-span-8 flex flex-col gap-6">
          <HeroWinnerCard team={winner.team} message={winner.message} />
          <RankingList rankings={rankings} />
        </div>

        <div className="md:col-span-4 flex flex-col gap-6">
          <PublicDashboardPanel sharedLink={sharedLink} />
          <TotalSavedCard totalSavedKwh={totalSavedKwh} />
        </div>
      </div>
    </div>
  );
}
