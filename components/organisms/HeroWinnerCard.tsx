import { Trophy, Sparkles } from "lucide-react";

interface HeroWinnerCardProps {
  team: string;
  message: string;
}

export function HeroWinnerCard({ team, message }: HeroWinnerCardProps) {
  return (
    <div className="relative overflow-hidden bg-brand-primary rounded-2xl p-8 text-text-on-dark min-h-[200px] flex items-center">
      <Trophy className="absolute right-8 bottom-8 w-32 h-32 text-brand-primary-active opacity-50 -rotate-12" />

      <div className="relative z-10 w-full max-w-lg">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold uppercase tracking-widest mb-4">
          <Sparkles className="w-3 h-3 text-brand-accent-amber" />
          Juara Bulan Ini
        </div>
        <h2 className="text-4xl font-serif font-bold italic mb-2">{team}</h2>
        <p className="text-brand-accent-amber font-medium">{message}</p>
      </div>
    </div>
  );
}
