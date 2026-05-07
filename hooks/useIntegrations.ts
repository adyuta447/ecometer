import { useState } from "react";

export interface ApiKey {
  id: number;
  name: string;
  token: string;
  createdAt: string;
}

export function useIntegrations() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: 1,
      name: "ERP Live Sync",
      token: "eco_live_123x...",
      createdAt: "2 hari lalu",
    },
  ]);

  const handleGenerateKey = () => {
    const newKey: ApiKey = {
      id: Date.now(),
      name: "Klien API Baru",
      token: "eco_live_" + Math.random().toString(36).substring(2, 11),
      createdAt: "Baru aja",
    };
    setApiKeys([...apiKeys, newKey]);
  };

  const handleRevoke = (id: number) => {
    setApiKeys(apiKeys.filter((k) => k.id !== id));
  };

  return {
    apiKeys,
    handleGenerateKey,
    handleRevoke,
  };
}
