"use client";

import { useState, useEffect } from "react";
import { DeviceGroups } from "@/components/DeviceGroups";
import { Server, Monitor, HardDrive, Filter, Plus, Shield, Loader2, X, Check, Trash2 } from "lucide-react";
import { collection, query, where, getDocs, addDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/AuthProvider";

export default function GroupsPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: "", capacityPercentage: "0%", usage: "0 kWh", co2: "0t CO2e" });
  const [saving, setSaving] = useState(false);
  const [activeSegment, setActiveSegment] = useState<any>(null);

  useEffect(() => {
    async function fetchGroups() {
      if (!user) return;
      try {
        const q = query(collection(db, "groups"), where("userId", "==", user.uid));
        const qs = await getDocs(q);
        const data = qs.docs.map(d => ({ id: d.id, ...d.data() }));
        setGroups(data);
        if(data.length > 0) setActiveSegment(data[0]);
      } catch (error) {
        console.error("Error fetching groups:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchGroups();
  }, [user]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newGroup.name && user) {
      setSaving(true);
      try {
        const docRef = await addDoc(collection(db, "groups"), {
           ...newGroup,
           userId: user.uid,
           createdAt: new Date().toISOString()
        });
        const created = { id: docRef.id, ...newGroup };
        setGroups([...groups, created]);
        setIsModalOpen(false);
        setNewGroup({ name: "", capacityPercentage: "0%", usage: "0 kWh", co2: "0t CO2e" });
        if(!activeSegment) setActiveSegment(created);
      } catch (error) {
        console.error("Failed to create group", error);
      } finally {
        setSaving(false);
      }
    }
  }

  const handleDelete = async (id: string) => {
     if (confirm("Delete this virtual group?")) {
        try {
           await deleteDoc(doc(db, "groups", id));
           setGroups(groups.filter(g => g.id !== id));
           if(activeSegment?.id === id) {
              setActiveSegment(groups.find(g => g.id !== id) || null);
           }
        } catch (error) {
           console.error("Failed to delete group", error);
        }
     }
  }

  if (loading) return <div className="p-8 max-w-6xl mx-auto flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-brand-primary" /></div>;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6 relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold italic text-text-ink mb-1">Virtual Device Grouping</h1>
          <p className="text-sm text-text-muted">Segment and isolate network data like VLANs.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-brand-primary text-text-on-dark px-4 py-2 rounded-xl text-sm font-medium hover:bg-brand-primary-active transition-colors"
        >
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
             {groups.map(g => (
                <div 
                  key={g.id} 
                  onClick={() => setActiveSegment(g)}
                  className={`p-2 rounded-lg text-sm font-medium flex items-center justify-between cursor-pointer ${activeSegment?.id === g.id ? 'bg-brand-primary/10 text-brand-primary' : 'text-text-body hover:bg-surface-soft'}`}
                >
                  <span className="truncate pr-2">{g.name}</span>
                  <div className="flex items-center gap-1">
                     <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${activeSegment?.id === g.id ? 'bg-brand-primary/20' : 'bg-surface-soft text-text-muted'}`}>{g.capacityPercentage || '0%'}</span>
                  </div>
                </div>
             ))}
             {groups.length === 0 && (
                <div className="text-xs text-text-muted p-2">No segments created yet.</div>
             )}
           </div>
        </div>

        {/* Right pane: Group Details */}
        <div className="col-span-3 space-y-6">
          {activeSegment ? (
             <>
                <div className="bg-surface-card rounded-3xl p-6 border border-surface-hairline flex items-center justify-between">
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-surface-soft rounded-2xl flex items-center justify-center border border-surface-hairline">
                       <Shield className="w-6 h-6 text-brand-accent-teal" />
                     </div>
                     <div>
                       <div className="flex items-center gap-2 mb-1">
                         <h2 className="text-xl font-bold text-text-ink">{activeSegment.name}</h2>
                         <span className="px-2 py-0.5 bg-brand-accent-teal/10 text-brand-accent-teal text-[10px] font-bold uppercase tracking-widest rounded-md">Isolated</span>
                       </div>
                       <p className="text-sm text-text-muted">Usage: {activeSegment.usage} | Emissions: {activeSegment.co2}</p>
                     </div>
                   </div>
                   <div className="text-right flex items-center gap-4">
                     <button onClick={() => handleDelete(activeSegment.id)} className="p-2 text-text-muted hover:text-red-500 transition-colors rounded-lg bg-surface-soft">
                        <Trash2 className="w-4 h-4" />
                     </button>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DeviceGroups />
                </div>
             </>
          ) : (
             <div className="bg-surface-card rounded-3xl p-12 border border-surface-hairline text-center flex flex-col items-center justify-center min-h-[300px]">
                <Shield className="w-12 h-12 text-surface-hairline mb-4" />
                <p className="text-text-muted">Select or create a virtual group to view its telemetry.</p>
             </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-surface-dark/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-dark-elevated border border-surface-hairline/20 rounded-[32px] p-8 w-full max-w-md text-text-on-dark shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-serif font-bold italic">Create Segment</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-text-on-dark-soft hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-text-on-dark-soft mb-2">Group Name</label>
                <input 
                  type="text" 
                  value={newGroup.name}
                  onChange={e => setNewGroup({...newGroup, name: e.target.value})}
                  autoFocus
                  placeholder="e.g. Server Room B"
                  className="w-full bg-surface-dark border border-surface-hairline/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-primary text-white transition-colors placeholder:text-text-on-dark-soft/50"
                  required
                />
              </div>
              <button 
                type="submit"
                disabled={saving}
                className="w-full bg-brand-primary text-text-on-dark px-4 py-3 rounded-xl text-sm font-bold tracking-wide hover:bg-brand-primary-active transition-colors mt-6 flex justify-center items-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} 
                {saving ? "Creating..." : "Create Virtual Group"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
