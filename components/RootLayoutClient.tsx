"use client";

import { usePathname } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import { AuthProvider } from "@/components/AuthProvider";
import { DataSeeder } from "@/components/DataSeeder";
import { SimulatorProvider } from "@/components/SimulatorProvider";
import { NotificationProvider } from "@/components/NotificationProvider";

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage =
    pathname === "/landing" ||
    pathname === "/login" ||
    pathname === "/register";

  return (
    <NotificationProvider>
      <AuthProvider>
        <SimulatorProvider>
          <DataSeeder />
          {isAuthPage ? (
            children
          ) : (
            <DashboardLayout>{children}</DashboardLayout>
          )}
        </SimulatorProvider>
      </AuthProvider>
    </NotificationProvider>
  );
}
