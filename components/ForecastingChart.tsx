export function ForecastingChart() {
  return (
    <section className="col-span-12 md:col-span-8 bg-brand-primary rounded-[32px] p-8 text-text-on-dark flex flex-col justify-between">
      <div>
        <div className="text-sm font-medium opacity-80 mb-1">AI/ML Financial Forecast</div>
        <h2 className="text-5xl font-serif italic mb-6 text-text-on-dark leading-tight">Saving Rp 15,200,000 next month</h2>
      </div>
      <div className="flex items-end justify-between">
        <div className="flex gap-8">
          <div>
            <div className="text-[11px] uppercase tracking-widest opacity-60">Utility Baseline</div>
            <div className="text-lg font-serif">Rp 48.4M</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-widest opacity-60">Projected OpEx</div>
            <div className="text-lg font-serif">Rp 33.2M</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[11px] uppercase tracking-widest opacity-60">CO2e Target</div>
          <div className="text-2xl font-serif tracking-tight">-4.2 tons eCO₂</div>
        </div>
      </div>
    </section>
  );
}
