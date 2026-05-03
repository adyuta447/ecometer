"use client";

import { usePathname } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import { AuthProvider } from "@/components/AuthProvider";
import { DataSeeder } from "@/components/DataSeeder";

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/landing' || pathname === '/login' || pathname === '/register';

  return (
    <AuthProvider>
      <DataSeeder />
      {isAuthPage ? (
        children
      ) : (
        <DashboardLayout>
          {children}
        </DashboardLayout>
      )}
    </AuthProvider>
  );
}
