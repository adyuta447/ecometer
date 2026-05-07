import { FileSpreadsheet } from "lucide-react";
import { StatusBadge } from "@/components/atoms/StatusBadge";

export function ReportEmissionsTable({
  emissionData,
  co2Factor,
  calculateEmissions,
  isAnySimulationActive,
}: {
  emissionData: any[];
  co2Factor: number;
  calculateEmissions: (kwh: number) => string;
  isAnySimulationActive: boolean;
}) {
  return (
    <div className="bg-surface-canvas border border-surface-hairline rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-surface-hairline bg-surface-soft flex justify-between items-center">
        <div className="flex items-center gap-3">
          <FileSpreadsheet className="w-5 h-5 text-text-muted-soft" />
          <h3 className="font-bold text-text-ink text-sm uppercase tracking-tighter">
            Log Ekuivalensi Emisi
          </h3>
        </div>
        {isAnySimulationActive && (
          <StatusBadge label="Real-Time" variant="teal" pulse />
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-surface-canvas text-[11px] uppercase tracking-widest text-text-muted-soft">
            <tr>
              <th className="px-6 py-4 font-bold border-b border-surface-hairline">
                Periode
              </th>
              <th className="px-6 py-4 font-bold border-b border-surface-hairline">
                Sektor Utilitas
              </th>
              <th className="px-6 py-4 font-bold border-b border-surface-hairline">
                Konsumsi (kWh)
              </th>
              <th className="px-6 py-4 font-bold border-b border-surface-hairline">
                Faktor Konversi
              </th>
              <th className="px-6 py-4 font-bold border-b border-surface-hairline text-right">
                CO₂e (Ton)
              </th>
            </tr>
          </thead>
          <tbody className="text-text-body font-medium">
            {emissionData.map((row, index) => {
              const isLive = row.period.includes("Live");
              return (
                <tr
                  key={row.period}
                  className={`hover:bg-surface-soft/50 transition-colors ${isLive ? "bg-brand-accent-teal/5 border-l-2 border-l-brand-accent-teal" : ""}`}
                >
                  <td className="px-6 py-4 border-b border-surface-hairline border-dashed">
                    <div className="flex items-center gap-2">
                      {row.period}
                      {isLive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-accent-teal animate-pulse"></span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 border-b border-surface-hairline border-dashed">
                    {row.sector}
                  </td>
                  <td className="px-6 py-4 border-b border-surface-hairline border-dashed">
                    {row.kwh.toLocaleString("id-ID")}
                    {row.trend && (
                      <span
                        className={`text-[10px] ml-2 ${row.trend.includes("turun") ? "text-brand-accent-teal" : "text-brand-primary"}`}
                      >
                        {row.trend}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 border-b border-surface-hairline border-dashed">
                    {co2Factor} kgCO2e/kWh
                  </td>
                  <td
                    className={`px-6 py-4 border-b border-surface-hairline border-dashed text-right font-serif text-base ${isLive ? "text-brand-accent-teal" : index === 0 ? "" : "text-brand-accent-teal"}`}
                  >
                    {calculateEmissions(row.kwh)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
