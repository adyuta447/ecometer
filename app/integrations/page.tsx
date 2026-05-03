"use client";

import { useState } from "react";
import { Plug, Zap, Lock, RefreshCw, Layers, Key, Trash2, Plus } from "lucide-react";

export default function IntegrationsPage() {
  const [apiKeys, setApiKeys] = useState([
    { id: 1, name: "ERP Live Sync", token: "eco_live_123x...", createdAt: "2 days ago" }
  ]);

  const handleGenerateKey = () => {
    const newKey = {
      id: Date.now(),
      name: "New API Client",
      token: "eco_live_" + Math.random().toString(36).substr(2, 9),
      createdAt: "Just now"
    };
    setApiKeys([...apiKeys, newKey]);
  };

  const handleRevoke = (id: number) => {
    setApiKeys(apiKeys.filter(k => k.id !== id));
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-serif font-bold italic text-text-ink mb-1">Seamless ERP/Accounting Integration</h1>
        <p className="text-sm text-text-muted">Connect real-time utilities data directly into your bookkeeping software natively via Open API.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-card rounded-3xl p-6 border border-brand-primary/20 shadow-sm relative overflow-hidden flex flex-col">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-brand-primary/5 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-surface-hairline shadow-sm">
              <span className="font-serif font-bold text-xl text-brand-primary">Xero</span>
            </div>
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-brand-accent-teal/10 text-brand-accent-teal text-[10px] font-bold uppercase tracking-widest rounded-md">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-accent-teal animate-pulse"></div> Active
            </span>
          </div>
          <h3 className="font-bold text-text-ink mb-1">Xero Accounting</h3>
          <p className="text-sm text-text-muted mb-6 flex-1">Syncing monthly utility bills and CO2e offset credits automatically.</p>
          <div className="flex items-center justify-between text-xs text-text-muted-soft pt-4 border-t border-surface-hairline mt-auto">
            <span>Last sync: 2m ago</span>
            <button className="text-text-ink font-medium hover:text-brand-primary transition-colors">Configure</button>
          </div>
        </div>

        <div className="bg-surface-canvas rounded-3xl p-6 border border-surface-hairline flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-surface-hairline shadow-sm">
              <span className="font-sans font-bold text-lg text-blue-600">Jurnal</span>
            </div>
          </div>
          <h3 className="font-bold text-text-ink mb-1">Mekari Jurnal</h3>
          <p className="text-sm text-text-muted mb-6 flex-1">Connect to seamlessly push operational expense tracking.</p>
          <div className="flex items-center justify-between text-xs pt-4 border-t border-surface-hairline mt-auto">
            <button className="bg-surface-dark text-text-on-dark px-4 py-1.5 rounded-xl font-medium w-full text-center hover:bg-surface-dark-elevated transition-colors">Connect</button>
          </div>
        </div>

        <div className="bg-surface-canvas rounded-3xl p-6 border border-surface-hairline flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-surface-hairline shadow-sm">
              <span className="font-sans font-bold text-xl text-orange-500 text-center leading-none">S<br/>A P</span>
            </div>
          </div>
          <h3 className="font-bold text-text-ink mb-1">SAP Concur</h3>
          <p className="text-sm text-text-muted mb-6 flex-1">Enterprise level financial system data ingestion pipeline.</p>
          <div className="flex items-center justify-between text-xs pt-4 border-t border-surface-hairline mt-auto">
            <button className="bg-surface-dark text-text-on-dark px-4 py-1.5 rounded-xl font-medium w-full text-center hover:bg-surface-dark-elevated transition-colors">Connect</button>
          </div>
        </div>
      </div>

      <div className="bg-surface-dark rounded-[32px] p-8 text-text-on-dark shadow-xl mt-8 flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-5 h-5 text-brand-primary" />
            <h2 className="text-xl font-serif italic">REST API Developer Access</h2>
          </div>
          <p className="text-sm text-text-on-dark-soft mb-6 leading-relaxed">
            Need a custom integration? We provide an Open API for reading grouped sensor data and translated utility equivalents, protected by standard OAuth2/JWT. Build powerful custom dashboards inside your own infrastructure.
          </p>
          
          <div className="mb-6 space-y-3">
             <div className="text-[10px] font-bold uppercase tracking-widest text-text-on-dark-soft">Active API Tokens</div>
             {apiKeys.map(key => (
               <div key={key.id} className="flex justify-between items-center p-3 bg-surface-dark-elevated rounded-xl border border-surface-hairline/10">
                 <div className="flex items-center gap-3">
                   <Key className="w-4 h-4 text-brand-accent-teal" />
                   <div>
                     <div className="text-sm font-medium">{key.name}</div>
                     <div className="text-xs font-mono text-text-on-dark-soft">{key.token} • {key.createdAt}</div>
                   </div>
                 </div>
                 <button 
                   onClick={() => handleRevoke(key.id)}
                   className="p-2 text-text-on-dark-soft hover:text-brand-primary transition-colors rounded-lg hover:bg-surface-dark"
                 >
                   <Trash2 className="w-4 h-4" />
                 </button>
               </div>
             ))}
             {apiKeys.length === 0 && (
               <div className="text-xs text-text-on-dark-soft py-2">No active API keys found.</div>
             )}
          </div>

          <div className="flex items-center gap-4">
             <button 
               onClick={handleGenerateKey}
               className="bg-brand-primary hover:bg-brand-primary-active px-5 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
             >
               <Plus className="w-4 h-4" />
               Generate New Key
             </button>
          </div>
        </div>
        <div className="flex-1 w-full bg-surface-dark-elevated rounded-2xl p-4 border border-surface-hairline/10 font-mono text-xs text-text-on-dark-soft flex flex-col justify-center min-h-[200px]">
          <div className="text-[10px] uppercase font-sans font-bold text-brand-accent-amber mb-2">Example Call</div>
<pre className="overflow-x-auto">{`fetch('https://api.ecometer.id/v1/billing', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer eco_live_...',
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data));
`}</pre>
        </div>
      </div>
    </div>
  );
}
