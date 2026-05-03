"use client";

import { useState } from "react";
import { DollarSign, Save } from "lucide-react";

export default function BillingSettingsPage() {
  const [tariff, setTariff] = useState("1444.70");
  const [budget, setBudget] = useState("45000000");
  const [co2Factor, setCo2Factor] = useState("0.87");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert("Configuration specific tariff baseline saved successfully.");
    }, 1000);
  };

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-serif font-bold italic text-text-ink mb-1">Tariff & Baseline Config</h1>
        <p className="text-sm text-text-muted">Manage the underlying parameters for OPEX and emission calculations.</p>
      </div>

      <div className="bg-surface-card border border-surface-hairline rounded-[32px] p-8">
        <form onSubmit={handleSave} className="space-y-6">
          
          <div className="p-5 bg-surface-canvas rounded-2xl border border-surface-hairline space-y-4">
             <h3 className="font-bold text-text-ink text-sm uppercase tracking-tight flex items-center gap-2 border-b border-surface-hairline pb-4">
               <DollarSign className="w-4 h-4 text-brand-primary" /> Core Financials
             </h3>
             
             <div>
               <label className="block text-[11px] font-bold uppercase tracking-widest text-text-muted-soft mb-2">Utility Tariff (Rp / kWh)</label>
               <input 
                 type="number" 
                 value={tariff}
                 onChange={e => setTariff(e.target.value)}
                 className="w-full bg-surface-soft border border-surface-hairline rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-text-ink font-mono transition-colors"
                 step="0.01"
                 required
               />
               <p className="text-xs text-text-muted mt-2">Currently based on PLN B-2/TR rate.</p>
             </div>

             <div>
               <label className="block text-[11px] font-bold uppercase tracking-widest text-text-muted-soft mb-2 mt-4">Monthly Budget Alert Boundary (Rp)</label>
               <input 
                 type="number" 
                 value={budget}
                 onChange={e => setBudget(e.target.value)}
                 className="w-full bg-surface-soft border border-surface-hairline rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-text-ink font-mono transition-colors"
                 required
               />
             </div>
          </div>

          <div className="p-5 bg-surface-canvas rounded-2xl border border-surface-hairline space-y-4">
             <h3 className="font-bold text-text-ink text-sm uppercase tracking-tight flex items-center gap-2 border-b border-surface-hairline pb-4">
               Carbon Translation
             </h3>
             
             <div>
               <label className="block text-[11px] font-bold uppercase tracking-widest text-text-muted-soft mb-2">CO₂e Conversion Factor (kgCO₂e / kWh)</label>
               <input 
                 type="number" 
                 value={co2Factor}
                 onChange={e => setCo2Factor(e.target.value)}
                 className="w-full bg-surface-soft border border-surface-hairline rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-accent-teal focus:ring-1 focus:ring-brand-accent-teal text-text-ink font-mono transition-colors"
                 step="0.01"
                 required
               />
               <p className="text-xs text-text-muted mt-2">Required standard for SRUK compliance. Updates applying to forecasts.</p>
             </div>
          </div>

          <button 
            type="submit" 
            disabled={isSaving}
            className="bg-brand-primary text-text-on-dark px-6 py-3 rounded-xl font-bold tracking-wide hover:bg-brand-primary-active transition-colors text-sm w-full sm:w-auto flex items-center justify-center gap-2 ml-auto disabled:opacity-70"
          >
            {isSaving ? "SAVING..." : "SAVE PARAMETERS"}
          </button>
        </form>
      </div>
    </div>
  );
}
