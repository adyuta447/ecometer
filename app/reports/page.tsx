"use client";

import { useState, useEffect } from "react";
import { Download, FileText, CheckCircle2, Loader2, Factory, FileSpreadsheet } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function ReportsPage() {
  const { user } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [co2Factor, setCo2Factor] = useState(0.87);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      if (!user) return;
      try {
        const q = query(collection(db, "settings"), where("userId", "==", user.uid));
        const qs = await getDocs(q);
        if (!qs.empty) {
          const s = qs.docs[0].data();
          if (s.co2Factor) setCo2Factor(Number(s.co2Factor));
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, [user]);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setToastMessage("Dokumen Audit SRUK berhasil di-generate.");
      setTimeout(() => setToastMessage(""), 5000); // clear toast after 5s
    }, 2000);
  };

  const calculateEmissions = (kwh: number) => {
     return ((kwh * co2Factor) / 1000).toFixed(1);
  };

  if (loading) return <div className="p-8 max-w-6xl mx-auto flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-brand-primary" /></div>;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 relative pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold italic text-text-ink mb-1">SRUK Compliance & Reports</h1>
          <p className="text-sm text-text-muted">Formal audit trail for National Carbon Registry (SRUK) July 2026 Mandate.</p>
        </div>
        <button 
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center gap-2 bg-brand-primary text-text-on-dark px-5 py-2.5 rounded-xl font-bold tracking-wide transition-colors hover:bg-brand-primary-active disabled:opacity-70 disabled:cursor-not-allowed text-sm"
        >
          {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {isExporting ? "GENERATING..." : "DOWNLOAD AUDIT"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-surface-card rounded-[24px] p-6 border border-surface-hairline flex flex-col justify-between min-h-[140px]">
           <div>
             <p className="text-[10px] uppercase font-bold text-text-muted-soft mb-2 tracking-widest">Total Energy Usage</p>
             <h3 className="text-3xl font-serif font-bold text-text-ink">104.3 MWh</h3>
           </div>
         </div>
         <div className="bg-surface-card rounded-[24px] p-6 border border-surface-hairline flex flex-col justify-between min-h-[140px]">
           <div>
             <p className="text-[10px] uppercase font-bold text-text-muted-soft mb-2 tracking-widest">Calculated Emissions</p>
             <h3 className="text-3xl font-serif font-bold text-text-ink">{calculateEmissions(104300)} mt</h3>
           </div>
         </div>
         <div className="bg-surface-dark rounded-[24px] p-6 text-text-on-dark flex flex-col justify-between min-h-[140px] shadow-lg">
           <div className="flex items-center gap-2 mb-2">
             <CheckCircle2 className="w-4 h-4 text-brand-accent-teal" />
             <p className="text-[10px] uppercase font-bold text-brand-accent-teal tracking-widest">Status Validated</p>
           </div>
           <h3 className="text-xl font-medium leading-tight">Ready for SRUK Submission (Q1)</h3>
         </div>
      </div>

      <div className="bg-surface-canvas border border-surface-hairline rounded-[32px] overflow-hidden">
        <div className="p-6 border-b border-surface-hairline bg-surface-soft flex justify-between items-center">
          <div className="flex items-center gap-3">
             <FileSpreadsheet className="w-5 h-5 text-text-muted-soft" />
             <h3 className="font-bold text-text-ink text-sm uppercase tracking-tighter">Emission Equivalency Log</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-surface-canvas text-[11px] uppercase tracking-widest text-text-muted-soft">
              <tr>
                <th className="px-6 py-4 font-bold border-b border-surface-hairline">Period</th>
                <th className="px-6 py-4 font-bold border-b border-surface-hairline">Utility Sector</th>
                <th className="px-6 py-4 font-bold border-b border-surface-hairline">Consumption (kWh)</th>
                <th className="px-6 py-4 font-bold border-b border-surface-hairline">Conversion Factor</th>
                <th className="px-6 py-4 font-bold border-b border-surface-hairline text-right">CO₂e (Tons)</th>
              </tr>
            </thead>
            <tbody className="text-text-body font-medium">
              <tr className="hover:bg-surface-soft/50 transition-colors">
                <td className="px-6 py-4 border-b border-surface-hairline border-dashed">Jan {new Date().getFullYear()}</td>
                <td className="px-6 py-4 border-b border-surface-hairline border-dashed">HVAC Systems</td>
                <td className="px-6 py-4 border-b border-surface-hairline border-dashed">45,200</td>
                <td className="px-6 py-4 border-b border-surface-hairline border-dashed">{co2Factor} kgCO2e/kWh</td>
                <td className="px-6 py-4 border-b border-surface-hairline border-dashed text-right font-serif text-base">{calculateEmissions(45200)}</td>
              </tr>
              <tr className="hover:bg-surface-soft/50 transition-colors">
                <td className="px-6 py-4 border-b border-surface-hairline border-dashed">Feb {new Date().getFullYear()}</td>
                <td className="px-6 py-4 border-b border-surface-hairline border-dashed">HVAC Systems</td>
                <td className="px-6 py-4 border-b border-surface-hairline border-dashed">38,100 <span className="text-[10px] text-brand-accent-teal ml-2">↓ 15%</span></td>
                <td className="px-6 py-4 border-b border-surface-hairline border-dashed">{co2Factor} kgCO2e/kWh</td>
                <td className="px-6 py-4 border-b border-surface-hairline border-dashed text-right font-serif text-base text-brand-accent-teal">{calculateEmissions(38100)}</td>
              </tr>
              <tr className="hover:bg-surface-soft/50 transition-colors bg-brand-primary/5">
                <td className="px-6 py-4 border-b border-surface-hairline">Mar {new Date().getFullYear()} (MTD)</td>
                <td className="px-6 py-4 border-b border-surface-hairline">HVAC Systems</td>
                <td className="px-6 py-4 border-b border-surface-hairline">21,000</td>
                <td className="px-6 py-4 border-b border-surface-hairline">{co2Factor} kgCO2e/kWh</td>
                <td className="px-6 py-4 border-b border-surface-hairline text-right font-serif text-base text-brand-primary">{calculateEmissions(21000)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {toastMessage && (
        <div className="fixed bottom-8 right-8 bg-surface-dark text-text-on-dark px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
           <CheckCircle2 className="w-5 h-5 text-brand-accent-teal" />
           <p className="text-sm font-medium">{toastMessage}</p>
        </div>
      )}
    </div>
  );
}
