"use client";

import { useEffect } from "react";
import { collection, getDocs, doc, setDoc, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./AuthProvider";

export function DataSeeder() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const seedData = async () => {
      const devicesSnap = await getDocs(query(collection(db, "devices"), where("userId", "==", user.uid)));
      if (!devicesSnap.empty) return;

      const d1 = doc(collection(db, "devices"));
      await setDoc(d1, { name: "HVAC Unit A", mac: "00:1B:44:11:3A:B7", status: "Active", mape: "2.4%", userId: user.uid, createdAt: new Date().toISOString() });
      
      const d2 = doc(collection(db, "devices"));
      await setDoc(d2, { name: "Smart Lighting B", mac: "00:1B:44:11:3A:C1", status: "Active", mape: "1.8%", userId: user.uid, createdAt: new Date().toISOString() });
      const g1 = doc(collection(db, "groups"));
      await setDoc(g1, { name: "Dev Floor (Group A)", usage: "840 kWh", capacityPercentage: "65%", co2: "3.2t CO2e", userId: user.uid, createdAt: new Date().toISOString() });
      const g2 = doc(collection(db, "groups"));
      await setDoc(g2, { name: "Marketing Hub", usage: "420 kWh", capacityPercentage: "38%", co2: "1.1t CO2e", userId: user.uid, createdAt: new Date().toISOString() });
      const forecastSnap = await getDocs(query(collection(db, "forecast"), where("userId", "==", user.uid)));
      if (forecastSnap.empty) {
        const forecastData = [
          { day: 'Mon', actual: 14200, predicted: 14200 },
          { day: 'Tue', actual: 14800, predicted: 14700 },
          { day: 'Wed', actual: 14500, predicted: 14600 },
          { day: 'Thu', actual: 15200, predicted: 15100 },
          { day: 'Fri', actual: 14900, predicted: 15000 },
          { day: 'Sat', actual: null, predicted: 14800 },
          { day: 'Sun', actual: null, predicted: 14600 },
        ];
        const f1 = doc(collection(db, "forecast"));
        await setDoc(f1, { data: forecastData, userId: user.uid, updatedAt: new Date().toISOString() });
      }

      const settingsSnap = await getDocs(query(collection(db, "settings"), where("userId", "==", user.uid)));
      if (settingsSnap.empty) {
        const s1 = doc(collection(db, "settings"));
        await setDoc(s1, { tariff: "1440", budget: "50000000", co2Factor: "0.8", userId: user.uid, updatedAt: new Date().toISOString() });
      }
    };

    seedData().catch(console.error);
  }, [user]);

  return null;
}
