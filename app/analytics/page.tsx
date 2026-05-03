"use client";

import { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingDown, Wrench, Sparkles, Activity } from 'lucide-react';

const baseData = [
  { day: 'Mon', actual: 14200, predicted: 14200 },
  { day: 'Tue', actual: 14800, predicted: 14700 },
  { day: 'Wed', actual: 14500, predicted: 14600 },
  { day: 'Thu', actual: 15200, predicted: 15100 },
  { day: 'Fri', actual: 14900, predicted: 15000 },
  { day: 'Sat', actual: null, predicted: 14800 },
  { day: 'Sun', actual: null, predicted: 14600 },
];

export default function AnalyticsPage() {
  const [efficiencyCut, setEfficiencyCut] = useState(0);

  const chartData = useMemo(() => {
    return baseData.map(d => {
      // Apply cut only to future predictions (Sat, Sun, and somewhat to Fri as today)
      let adjustedPredicted = d.predicted;
      if (d.day === 'Fri' || d.day === 'Sat' || d.day === 'Sun') {
        const reductionFactor = efficiencyCut / 100;
        adjustedPredicted = d.predicted * (1 - reductionFactor * (d.day === 'Fri' ? 0.5 : 1)); 
      }
      return {
        ...d,
        predicted: adjustedPredicted
      };
    });
  }, [efficiencyCut]);

  const currentProjection = efficiencyCut > 0 ? 15000 * (1 - (efficiencyCut / 100) * 0.2) : 15000;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold italic text-text-ink mb-1">Predictive Analytics</h1>
        <p className="text-sm text-text-muted">AI/ML forecasting & automated anomaly detection</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-surface-card rounded-3xl p-6 border border-surface-hairline flex flex-col font-sans min-h-[400px]">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-text-ink mb-1">Billing Projection</h2>
              <p className="text-sm text-text-muted">Projected vs actual consumption based on current trends.</p>
            </div>
            <span className="px-3 py-1 bg-surface-soft border border-surface-hairline text-xs font-medium text-text-body rounded-full flex items-center gap-2">
              <Activity className="w-3 h-3 text-brand-accent-teal" />
              Live Simulation
            </span>
          </div>

          <div className="flex items-center gap-12 mb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-text-muted-soft mb-1">Projected Billing</p>
              <div className="flex items-baseline gap-2 transition-all duration-300">
                <span className="text-3xl font-serif font-bold text-text-ink">Rp {(currentProjection).toLocaleString('id-ID')}</span>
              </div>
            </div>
            {efficiencyCut > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-text-muted-soft mb-1">Baseline</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-serif text-brand-primary line-through opacity-70">Rp 15.000.000</span>
                </div>
              </div>
            )}
          </div>

          <div className="h-64 w-full mt-auto transition-all duration-500 ease-in-out">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-surface-hairline)" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted-soft)', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted-soft)', fontSize: 12 }} width={60} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-surface-dark)', borderRadius: '12px', border: 'none', color: 'var(--color-text-on-dark)' }}
                  itemStyle={{ color: 'var(--color-text-on-dark)' }}
                />
                <Line type="monotone" dataKey="actual" stroke="var(--color-text-ink)" strokeWidth={2} dot={{ r: 4, fill: 'var(--color-surface-canvas)', strokeWidth: 2 }} activeDot={{ r: 6 }} isAnimationActive={false} />
                <Line type="monotone" dataKey="predicted" stroke="var(--color-brand-primary)" strokeWidth={2} strokeDasharray="5 5" dot={false} isAnimationActive={true} animationDuration={500} />
                <ReferenceLine x="Fri" stroke="var(--color-brand-accent-amber)" strokeDasharray="3 3" label={{ position: 'top', value: 'Today', fill: 'var(--color-brand-accent-amber)', fontSize: 12 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-brand-primary text-text-on-dark rounded-3xl flex flex-col h-full shadow-md">
            <div className="w-10 h-10 rounded-full bg-brand-primary-active flex items-center justify-center mb-6 shadow-inner">
              <Sparkles className="w-5 h-5 text-brand-accent-amber" />
            </div>
            <h3 className="text-xl font-serif font-bold italic mb-2">What-If Simulation</h3>
            <p className="text-sm opacity-90 mb-6 leading-relaxed">
              Slide to simulate cutting HVAC active hours. Predict real-time impact on the projected billing via AI.
            </p>
            
            <div className="mt-auto mb-6">
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-text-on-dark-soft mb-2">
                <span>0%</span>
                <span>{efficiencyCut}% Reduction</span>
                <span>30%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="30" 
                value={efficiencyCut} 
                onChange={(e) => setEfficiencyCut(Number(e.target.value))}
                className="w-full h-2 bg-brand-primary-active rounded-lg appearance-none cursor-pointer accent-surface-canvas"
              />
            </div>
            
            <button 
              className="flex items-center justify-between w-full p-3 bg-surface-dark text-text-on-dark rounded-xl text-sm font-medium hover:bg-surface-dark-elevated transition-colors"
              onClick={() => alert(`Applied ${efficiencyCut}% reduction to HVAC Schedule.`)}
            >
              <span>Execute Override</span>
              <Wrench className="w-4 h-4 text-brand-accent-teal" />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-surface-card rounded-3xl p-6 border border-surface-hairline mt-6">
         <h3 className="text-sm font-bold uppercase tracking-widest text-text-ink mb-6">Model Accuracy & Training</h3>
         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           <div className="p-4 bg-surface-canvas rounded-2xl border border-surface-hairline">
             <div className="text-[10px] uppercase font-bold text-text-muted-soft mb-1">Algorithm</div>
             <div className="text-sm font-medium">Random Forest Regressor</div>
           </div>
           <div className="p-4 bg-surface-canvas rounded-2xl border border-surface-hairline">
             <div className="text-[10px] uppercase font-bold text-text-muted-soft mb-1">Dataset Size</div>
             <div className="text-sm font-medium">12.4M Datapoints</div>
           </div>
           <div className="p-4 bg-surface-canvas rounded-2xl border border-surface-hairline">
             <div className="text-[10px] uppercase font-bold text-text-muted-soft mb-1">MAPE Error Rate</div>
             <div className="text-sm font-medium text-brand-accent-teal">2.8% (Highly Accurate)</div>
           </div>
           <div className="p-4 bg-surface-canvas rounded-2xl border border-surface-hairline">
             <div className="text-[10px] uppercase font-bold text-text-muted-soft mb-1">Last Trained</div>
             <div className="text-sm font-medium">45 minutes ago</div>
           </div>
         </div>
      </div>
    </div>
  );
}
