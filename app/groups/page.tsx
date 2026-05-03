import { DeviceGroups } from "@/components/DeviceGroups";
import { Server, Monitor, HardDrive, Filter, Plus, Shield } from "lucide-react";

export default function GroupsPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold italic text-text-ink mb-1">Virtual Device Grouping</h1>
          <p className="text-sm text-text-muted">Segment and isolate network data like VLANs.</p>
        </div>
        <button className="flex items-center gap-2 bg-brand-primary text-text-on-dark px-4 py-2 rounded-xl text-sm font-medium hover:bg-brand-primary-active transition-colors">
          <Plus className="w-4 h-4" />
          Create Segment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left pane: Topology/Tree */}
        <div className="col-span-1 bg-surface-card rounded-3xl p-5 border border-surface-hairline">
           <div className="flex items-center justify-between mb-4">
             <h3 className="text-[11px] font-bold uppercase tracking-widest text-text-muted-soft">Segments</h3>
             <Filter className="w-3 h-3 text-text-muted-soft" />
           </div>
           <div className="space-y-1">
             <div className="p-2 bg-brand-primary/10 text-brand-primary rounded-lg text-sm font-medium flex items-center justify-between cursor-pointer">
                <span>Central Office</span>
                <span className="text-[10px] bg-brand-primary/20 px-1.5 py-0.5 rounded-md">8</span>
             </div>
             <div className="p-2 text-text-body hover:bg-surface-soft rounded-lg text-sm font-medium flex items-center justify-between cursor-pointer ml-4">
                <span>Dev Floor (Grup A)</span>
                <span className="text-[10px] bg-surface-soft px-1.5 py-0.5 rounded-md text-text-muted">4</span>
             </div>
             <div className="p-2 text-text-body hover:bg-surface-soft rounded-lg text-sm font-medium flex items-center justify-between cursor-pointer ml-4">
                <span>Marketing Hub</span>
                <span className="text-[10px] bg-surface-soft px-1.5 py-0.5 rounded-md text-text-muted">3</span>
             </div>
             <div className="p-2 text-text-body hover:bg-surface-soft rounded-lg text-sm font-medium flex items-center justify-between cursor-pointer ml-4">
                <span>Server Room</span>
                <span className="text-[10px] bg-surface-soft px-1.5 py-0.5 rounded-md text-text-muted">1</span>
             </div>
           </div>
        </div>

        {/* Right pane: Group Details */}
        <div className="col-span-3 space-y-6">
          <div className="bg-surface-card rounded-3xl p-6 border border-surface-hairline flex items-center justify-between">
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-surface-soft rounded-2xl flex items-center justify-center border border-surface-hairline">
                 <Shield className="w-6 h-6 text-brand-accent-teal" />
               </div>
               <div>
                 <div className="flex items-center gap-2 mb-1">
                   <h2 className="text-xl font-bold text-text-ink">Dev Floor (Grup A)</h2>
                   <span className="px-2 py-0.5 bg-brand-accent-teal/10 text-brand-accent-teal text-[10px] font-bold uppercase tracking-widest rounded-md">Isolated</span>
                 </div>
                 <p className="text-sm text-text-muted">Head: Jane Doe — 4 active nodes</p>
               </div>
             </div>
             <div className="text-right">
               <p className="text-[10px] uppercase font-bold text-text-muted-soft mb-1">Isolated Cost</p>
               <p className="text-xl font-serif text-brand-primary">Rp 4.2M</p>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DeviceGroups />
            
            <div className="bg-surface-card rounded-[24px] p-5 border border-surface-hairline opacity-60">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold uppercase tracking-tighter text-text-ink">HVAC Unit 4</h3>
                <span className="text-xs text-brand-accent-amber font-medium tracking-tight">Anomalous</span>
              </div>
              <div className="h-2 bg-surface-hairline rounded-full overflow-hidden mb-2">
                <div className="bg-brand-accent-amber h-full" style={{ width: '90%' }}></div>
              </div>
              <div className="flex justify-between text-[10px] text-text-muted-soft">
                <span>90% Load Limit</span>
                <span>Flagged for review</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
