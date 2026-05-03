export function Leaderboard() {
  return (
    <div className="bg-surface-dark rounded-[24px] p-5 text-text-on-dark h-full font-sans">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold uppercase tracking-tighter text-brand-primary">Eco-Leaderboard</h3>
        <span className="text-[10px] text-text-on-dark-soft">Top Performer</span>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-on-dark-soft">01</span>
            <span className="text-xs">Frontend Team</span>
          </div>
          <span className="text-[10px] font-bold text-brand-accent-teal">+18% Efficiency</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-on-dark-soft">02</span>
            <span className="text-xs">Creative Ops</span>
          </div>
          <span className="text-[10px] font-bold text-brand-primary">+12% Efficiency</span>
        </div>
      </div>
    </div>
  );
}
