import { useState, useEffect } from "react";
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

export function useBillingSettings() {
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
      await logActivity(
        user.uid,
        "settings_changed",
        `Pengaturan tarif diperbarui: Rp ${tariff}/kWh, Anggaran Rp ${Number(
          budget,
        ).toLocaleString("id-ID")}`,
        "info",
        {
          tariff,
          budget,
          co2Factor,
        },
      );
      addNotification(
        "Konfigurasi tarif baseline berhasil disimpan.",
        "success",
      );
    } catch (error: any) {
      addNotification(error.message || "Gagal menyimpan pengaturan.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const tariffNum = Number(tariff) || 0;
  const budgetNum = Number(budget) || 0;
  const co2Num = Number(co2Factor) || 0;

  const estimatedKwh = tariffNum > 0 ? budgetNum / tariffNum : 0;
  const estimatedEmissions = (estimatedKwh * co2Num) / 1000;
  const dailyCost = budgetNum / 30;

  return {
    tariff,
    setTariff,
    budget,
    setBudget,
    co2Factor,
    setCo2Factor,
    loading,
    isSaving,
    handleSave,
    tariffNum,
    budgetNum,
    co2Num,
    estimatedKwh,
    estimatedEmissions,
    dailyCost,
  };
}
