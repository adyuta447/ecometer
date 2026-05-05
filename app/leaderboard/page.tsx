import { Leaderboard } from "@/components/Leaderboard";
import { Trophy, Share2, Globe, Sparkles } from "lucide-react";

export default function LeaderboardPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
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
          <div className="relative overflow-hidden bg-brand-primary rounded-2xl p-8 text-text-on-dark min-h-[200px] flex items-center">
            <Trophy className="absolute right-8 bottom-8 w-32 h-32 text-brand-primary-active opacity-50 -rotate-12" />

            <div className="relative z-10 w-full max-w-lg">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                <Sparkles className="w-3 h-3 text-brand-accent-amber" />
                Juara Bulan Ini
              </div>
              <h2 className="text-4xl font-serif font-bold italic mb-2">
                Tim Frontend
              </h2>
              <p className="text-brand-accent-amber font-medium">
                Tim Front-End bulan ini berhasil menghemat energi 10% lebih banyak dari Tim Desain!
              </p>
            </div>
          </div>

          <div className="bg-surface-card rounded-2xl p-6 border border-surface-hairline">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-brand-primary mb-6">
              Peringkat Detail
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-surface-canvas border border-brand-accent-teal/30 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-brand-accent-teal/10 text-brand-accent-teal font-bold flex items-center justify-center font-serif text-sm">1</div>
                  <div>
                    <div className="font-bold text-text-ink">Tim Frontend</div>
                    <div className="text-xs text-brand-accent-teal">+18% Target Efisiensi</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-text-ink">-450 kWh</div>
                  <div className="text-[10px] uppercase text-text-muted-soft">Dihemat</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-surface-canvas border border-surface-hairline rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-surface-soft text-text-muted font-bold flex items-center justify-center font-serif text-sm">2</div>
                  <div>
                    <div className="font-bold text-text-ink">Creative Ops</div>
                    <div className="text-xs text-brand-primary">+12% Target Efisiensi</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-text-ink">-320 kWh</div>
                  <div className="text-[10px] uppercase text-text-muted-soft">Dihemat</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-surface-canvas border border-surface-hairline rounded-2xl opacity-80">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-surface-soft text-text-muted font-bold flex items-center justify-center font-serif text-sm">3</div>
                  <div>
                    <div className="font-bold text-text-ink">DevOps Infrastruktur</div>
                    <div className="text-xs text-brand-accent-amber">-4% Target Efisiensi</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-text-ink">+80 kWh</div>
                  <div className="text-[10px] uppercase text-text-muted-soft">Melebihi Batas</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-4 flex flex-col gap-6">
          <div className="bg-surface-dark text-text-on-dark rounded-2xl p-6 border border-surface-dark-elevated">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="w-5 h-5 text-brand-primary" />
              <h3 className="font-bold">Dashboard Publik</h3>
            </div>
            <p className="text-sm text-text-on-dark-soft mb-6 leading-relaxed">
              Dengan membuat efisiensi terlihat, kamu mendorong praktik berkelanjutan secara organik tanpa micromanagement.
            </p>
            <div className="p-3 bg-surface-dark-elevated rounded-xl flex items-center justify-between border border-surface-hairline/10">
              <span className="text-xs text-brand-primary truncate mr-2">
                ecometer.id/p/leaderboard/49a...
              </span>
              <span className="text-[10px] uppercase font-bold text-brand-accent-teal bg-brand-accent-teal/10 px-2 py-1 rounded">
                Live
              </span>
            </div>
          </div>

          <div className="flex-1 min-h-[300px]">
            <div className="bg-surface-card rounded-2xl p-6 border border-surface-hairline h-full flex flex-col justify-center items-center text-center">
              <Sparkles className="w-8 h-8 text-brand-accent-amber mb-4" />
              <h3 className="text-3xl font-serif font-bold text-text-ink mb-2">
                1.240
              </h3>
              <p className="text-sm text-text-muted">
                Total kWh yang dihemat seluruh perusahaan lewat gamifikasi bulan ini.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
