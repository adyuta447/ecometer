"use client";

import { useIntegrations } from "@/hooks/useIntegrations";
import { IntegrationCard } from "@/components/organisms/IntegrationCard";
import { DeveloperApiPanel } from "@/components/organisms/DeveloperApiPanel";

export default function IntegrationsPage() {
  const { apiKeys, handleGenerateKey, handleRevoke } = useIntegrations();

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-serif font-bold italic text-text-ink mb-1">
          Integrasi ERP & Akuntansi
        </h1>
        <p className="text-sm text-text-muted">
          Hubungkan data utilitas real-time langsung ke software pembukuan kamu
          via Open API.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <IntegrationCard
          name="Xero Accounting"
          provider="Xero"
          description="Sinkronisasi tagihan utilitas bulanan dan kredit offset CO2e secara otomatis."
          isActive={true}
          lastSync="2 menit lalu"
          logo={
            <span className="font-serif font-bold text-xl text-brand-primary">
              Xero
            </span>
          }
        />
        <IntegrationCard
          name="Mekari Jurnal"
          provider="Jurnal"
          description="Hubungkan buat push tracking biaya operasional secara otomatis."
          logo={
            <span className="font-sans font-bold text-lg text-blue-600">
              Jurnal
            </span>
          }
        />
        <IntegrationCard
          name="SAP Concur"
          provider="SAP"
          description="Pipeline ingestion data dari sistem keuangan tingkat enterprise."
          logo={
            <span className="font-sans font-bold text-xl text-orange-500 text-center leading-none">
              S<br />A P
            </span>
          }
        />
      </div>

      <DeveloperApiPanel
        apiKeys={apiKeys}
        onGenerateKey={handleGenerateKey}
        onRevoke={handleRevoke}
      />
    </div>
  );
}
