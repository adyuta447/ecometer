import { ForecastingChart } from "@/components/ForecastingChart";
import { DeviceGroups } from "@/components/DeviceGroups";
import { Leaderboard } from "@/components/Leaderboard";

export default function Home() {
  return (
    <div className="p-8 grid grid-cols-12 gap-6 max-w-6xl mx-auto">
      {/* Big Projection Card */}
            <ForecastingChart />

            {/* Analytics Insight */}
            <section className="col-span-12 md:col-span-4 bg-surface-card border border-surface-hairline rounded-[32px] p-6">
              <div className="text-[11px] font-bold uppercase tracking-widest text-brand-primary mb-4">System Alerts</div>
              <div className="space-y-4">
                <div className="p-4 bg-white/50 rounded-2xl border border-white/40">
                  <div className="flex justify-between items-start mb-2">
                    <span className="px-2 py-1 bg-brand-accent-amber/20 text-brand-accent-amber text-[10px] font-bold rounded-md">ANOMALY</span>
                    <span className="text-[10px] text-text-muted-soft">2h ago</span>
                  </div>
                  <p className="text-sm leading-tight text-text-body">Leakage detected in HVAC Group. Expected 12% loss if unaddressed.</p>
                </div>
                <div className="p-4 bg-white/50 rounded-2xl border border-white/40 opacity-60">
                  <div className="flex justify-between items-start mb-2">
                    <span className="px-2 py-1 bg-brand-accent-teal/20 text-brand-accent-teal text-[10px] font-bold rounded-md">OPTIMIZED</span>
                    <span className="text-[10px] text-text-muted-soft">5h ago</span>
                  </div>
                  <p className="text-sm leading-tight text-text-body">Server room load shifted to off-peak utility pricing.</p>
                </div>
              </div>
            </section>

            {/* Virtual Device Grouping and Leaderboard */}
            <section className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <DeviceGroups />
              <Leaderboard />
            </section>

            {/* Footer Stats Row */}
            <section className="col-span-12 border-t border-surface-hairline pt-6 flex flex-col sm:flex-row justify-between gap-4 mt-2">
              <div className="flex flex-wrap gap-12">
                <div>
                  <div className="text-[10px] uppercase font-bold text-text-muted-soft mb-1">Technical Validation</div>
                  <div className="text-sm font-medium text-text-ink">MAPE Accuracy: <span className="text-brand-primary">2.8%</span></div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-text-muted-soft mb-1">ERP Connector</div>
                  <div className="text-sm font-medium text-brand-accent-teal">Xero API Connected</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-text-muted-soft mb-1">Market Viability</div>
                  <div className="text-sm font-medium text-text-ink">CAPEX/OPEX Ratio: <span className="text-brand-primary">98%</span></div>
                </div>
              </div>
              <div className="sm:text-right">
                <p className="text-[10px] text-text-muted-soft max-w-[200px] ml-auto">
                  Compliant with National Climate Registry (SRUK) July 2026 Mandate
                </p>
              </div>
            </section>

          </div>
  );
}
