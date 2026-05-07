import { Layers, Key, Trash2, Plus } from "lucide-react";
import { ApiKey } from "@/hooks/useIntegrations";

interface DeveloperApiPanelProps {
  apiKeys: ApiKey[];
  onGenerateKey: () => void;
  onRevoke: (id: number) => void;
}

export function DeveloperApiPanel({
  apiKeys,
  onGenerateKey,
  onRevoke,
}: DeveloperApiPanelProps) {
  return (
    <div className="bg-surface-dark rounded-2xl p-8 text-text-on-dark mt-8 flex flex-col lg:flex-row gap-8">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-4">
          <Layers className="w-5 h-5 text-brand-primary" />
          <h2 className="text-xl font-serif italic">
            Akses Developer REST API
          </h2>
        </div>
        <p className="text-sm text-text-on-dark-soft mb-6 leading-relaxed">
          Butuh integrasi kustom? Kami sediakan Open API buat baca data sensor
          terkelompok dan ekuivalen utilitas, dilindungi standar OAuth2/JWT.
          Bangun dashboard kustom di infrastruktur kamu sendiri.
        </p>

        <div className="mb-6 space-y-3">
          <div className="text-[10px] font-bold uppercase tracking-widest text-text-on-dark-soft">
            Token API Aktif
          </div>
          {apiKeys.map((key) => (
            <div
              key={key.id}
              className="flex justify-between items-center p-3 bg-surface-dark-elevated rounded-xl border border-surface-hairline/10"
            >
              <div className="flex items-center gap-3">
                <Key className="w-4 h-4 text-brand-accent-teal" />
                <div>
                  <div className="text-sm font-medium">{key.name}</div>
                  <div className="text-xs font-mono text-text-on-dark-soft">
                    {key.token} · {key.createdAt}
                  </div>
                </div>
              </div>
              <button
                onClick={() => onRevoke(key.id)}
                className="p-2 text-text-on-dark-soft hover:text-brand-primary transition-colors rounded-lg hover:bg-surface-dark"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {apiKeys.length === 0 && (
            <div className="text-xs text-text-on-dark-soft py-2">
              Belum ada API key aktif.
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onGenerateKey}
            className="bg-brand-primary hover:bg-brand-primary-active px-5 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Buat Key Baru
          </button>
        </div>
      </div>
      <div className="flex-1 w-full bg-surface-dark-elevated rounded-2xl p-4 border border-surface-hairline/10 font-mono text-xs text-text-on-dark-soft flex flex-col justify-center min-h-[200px]">
        <div className="text-[10px] uppercase font-sans font-bold text-brand-accent-amber mb-2">
          Contoh Pemanggilan
        </div>
        <pre className="overflow-x-auto">{`fetch('https://api.ecometer.id/v1/billing', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer eco_live_...',
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data));
`}</pre>
      </div>
    </div>
  );
}
