"use client";

import { useState, useEffect, useMemo } from "react";
import { DollarSign, Save, Loader2, Info, Calculator } from "lucide-react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  addDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/AuthProvider";
import { useNotification } from "@/components/NotificationProvider";
import { logActivity } from "@/lib/activityLog";

export default function BillingSettingsPage() {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [tariff, setTariff] = useState("1444.70");
  const [budget, setBudget] = useState("45000000");
  const [co2Factor, setCo2Factor] = useState("0.87");
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [settingId, setSettingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      if (!user) return;
      try {
        const q = query(
          collection(db, "settings"),
          where("userId", "==", user.uid),
        );
        const qs = await getDocs(q);
        if (!qs.empty) {
          const docData = qs.docs[0];
          const data = docData.data();
          setSettingId(docData.id);
          if (data.tariff) setTariff(data.tariff);
          if (data.budget) setBudget(data.budget);
          if (data.co2Factor) setCo2Factor(data.co2Factor);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    try {
      if (settingId) {
        await setDoc(
          doc(db, "settings", settingId),
          {
            tariff,
            budget,
            co2Factor,
            userId: user.uid,
            updatedAt: new Date().toISOString(),
          },
          { merge: true },
        );
      } else {
        const docRef = await addDoc(collection(db, "settings"), {
          tariff,
          budget,
          co2Factor,
          userId: user.uid,
          updatedAt: new Date().toISOString(),
        });
        setSettingId(docRef.id);
      }
      await logActivity(user.uid, "settings_changed", `Pengaturan tarif diperbarui: Rp ${tariff}/kWh, Anggaran Rp ${Number(budget).toLocaleString("id-ID")}`, "info", {
        tariff,
        budget,
        co2Factor,
      });
      addNotification("Konfigurasi tarif baseline berhasil disimpan.", "success");
    } catch (error: any) {
      addNotification(error.message || "Gagal menyimpan pengaturan.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Perhitungan live berdasarkan input user
  const tariffNum = Number(tariff) || 0;
  const budgetNum = Number(budget) || 0;
  const co2Num = Number(co2Factor) || 0;

  // Estimasi kWh yang bisa dipakai dari budget
  const estimatedKwh = tariffNum > 0 ? budgetNum / tariffNum : 0;
  // Estimasi emisi dari kWh tersebut
  const estimatedEmissions = (estimatedKwh * co2Num) / 1000;
  // Estimasi biaya per hari (30 hari)
  const dailyCost = budgetNum / 30;

  if (loading)
    return (
      <div className="p-8 max-w-3xl mx-auto flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
      </div>
    );

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-serif font-bold italic text-text-ink mb-1">
          Konfigurasi Tarif & Baseline
        </h1>
        <p className="text-sm text-text-muted">
          Atur parameter utama buat hitung biaya operasional dan emisi karbon kamu.
        </p>
      </div>

      <div className="bg-surface-card border border-surface-hairline rounded-[32px] p-8">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="p-5 bg-surface-canvas rounded-2xl border border-surface-hairline space-y-4">
            <h3 className="font-bold text-text-ink text-sm uppercase tracking-tight flex items-center gap-2 border-b border-surface-hairline pb-4">
              <DollarSign className="w-4 h-4 text-brand-primary" /> Keuangan Utama
            </h3>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-text-muted-soft mb-2">
                Tarif Listrik (Rp / kWh)
              </label>
              <input
                type="number"
                value={tariff}
                onChange={(e) => setTariff(e.target.value)}
                className="w-full bg-surface-soft border border-surface-hairline rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-text-ink font-mono transition-colors"
                step="0.01"
                required
              />
              <p className="text-xs text-text-muted mt-2">
                Berdasarkan tarif PLN golongan B-2/TR saat ini.
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-text-muted-soft mb-2 mt-4">
                Batas Anggaran Bulanan (Rp)
              </label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full bg-surface-soft border border-surface-hairline rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-text-ink font-mono transition-colors"
                required
              />
            </div>
          </div>

          <div className="p-5 bg-surface-canvas rounded-2xl border border-surface-hairline space-y-4">
            <h3 className="font-bold text-text-ink text-sm uppercase tracking-tight flex items-center gap-2 border-b border-surface-hairline pb-4">
              Konversi Karbon
            </h3>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-text-muted-soft mb-2">
                Faktor Konversi CO₂e (kgCO₂e / kWh)
              </label>
              <input
                type="number"
                value={co2Factor}
                onChange={(e) => setCo2Factor(e.target.value)}
                className="w-full bg-surface-soft border border-surface-hairline rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-accent-teal focus:ring-1 focus:ring-brand-accent-teal text-text-ink font-mono transition-colors"
                step="0.01"
                required
              />
              <p className="text-xs text-text-muted mt-2">
                Standar wajib untuk kepatuhan SRUK. Perubahan langsung diterapkan ke prediksi.
              </p>
            </div>
          </div>

          {/* Informasi Perhitungan — tanpa emoji, tanpa gradient */}
          <div className="p-5 bg-surface-canvas rounded-2xl border border-surface-hairline space-y-4">
            <h3 className="font-bold text-text-ink text-sm uppercase tracking-tight flex items-center gap-2 border-b border-surface-hairline pb-4">
              <Calculator className="w-4 h-4 text-brand-accent-teal" /> Simulasi Perhitungan
            </h3>

            <p className="text-xs text-text-muted leading-relaxed">
              Berdasarkan parameter yang kamu isi di atas, berikut estimasi perhitungan yang dipakai dashboard untuk proyeksi dan laporan audit.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="p-4 bg-surface-soft rounded-xl border border-surface-hairline">
                <div className="text-[10px] uppercase font-bold text-text-muted-soft tracking-widest mb-1">
                  Estimasi Pemakaian Maksimal
                </div>
                <div className="text-lg font-serif font-bold text-text-ink">
                  {estimatedKwh.toLocaleString("id-ID", { maximumFractionDigits: 0 })} kWh
                </div>
                <p className="text-[10px] text-text-muted-soft mt-1">
                  Rumus: Anggaran / Tarif = Rp {budgetNum.toLocaleString("id-ID")} / Rp {tariffNum.toLocaleString("id-ID")}
                </p>
              </div>

              <div className="p-4 bg-surface-soft rounded-xl border border-surface-hairline">
                <div className="text-[10px] uppercase font-bold text-text-muted-soft tracking-widest mb-1">
                  Estimasi Emisi Bulanan
                </div>
                <div className="text-lg font-serif font-bold text-text-ink">
                  {estimatedEmissions.toFixed(1)} ton CO₂e
                </div>
                <p className="text-[10px] text-text-muted-soft mt-1">
                  Rumus: kWh x Faktor CO₂e = {estimatedKwh.toLocaleString("id-ID", { maximumFractionDigits: 0 })} x {co2Num}
                </p>
              </div>

              <div className="p-4 bg-surface-soft rounded-xl border border-surface-hairline">
                <div className="text-[10px] uppercase font-bold text-text-muted-soft tracking-widest mb-1">
                  Biaya Harian Rata-rata
                </div>
                <div className="text-lg font-serif font-bold text-text-ink">
                  Rp {dailyCost.toLocaleString("id-ID", { maximumFractionDigits: 0 })}
                </div>
                <p className="text-[10px] text-text-muted-soft mt-1">
                  Rumus: Anggaran / 30 hari
                </p>
              </div>

              <div className="p-4 bg-surface-soft rounded-xl border border-surface-hairline">
                <div className="text-[10px] uppercase font-bold text-text-muted-soft tracking-widest mb-1">
                  Biaya per Ton CO₂e
                </div>
                <div className="text-lg font-serif font-bold text-text-ink">
                  Rp {estimatedEmissions > 0 ? (budgetNum / estimatedEmissions).toLocaleString("id-ID", { maximumFractionDigits: 0 }) : "0"}
                </div>
                <p className="text-[10px] text-text-muted-soft mt-1">
                  Rumus: Anggaran / Estimasi Emisi
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 bg-surface-soft rounded-xl border border-surface-hairline mt-2">
              <Info className="w-4 h-4 text-brand-primary flex-shrink-0 mt-0.5" />
              <p className="text-xs text-text-muted leading-relaxed">
                Angka di atas bersifat estimasi berdasarkan konfigurasi. Perhitungan aktual akan mempertimbangkan pola penggunaan perangkat IoT, anomali terdeteksi, dan penyesuaian prediksi AI/ML secara real-time.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="bg-brand-primary text-text-on-dark px-6 py-3 rounded-xl font-bold tracking-wide hover:bg-brand-primary-active transition-colors text-sm w-full sm:w-auto flex items-center justify-center gap-2 ml-auto disabled:opacity-70"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSaving ? "MENYIMPAN..." : "SIMPAN PARAMETER"}
          </button>
        </form>
      </div>
    </div>
  );
}
