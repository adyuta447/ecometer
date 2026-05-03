export function DeviceGroups() {
  return (
    <>
      <div className="bg-surface-soft rounded-[24px] p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold uppercase tracking-tighter text-text-ink">Dev Floor (Grup A)</h3>
          <span className="text-xs text-brand-accent-teal font-medium tracking-tight">840 kWh</span>
        </div>
        <div className="h-2 bg-surface-hairline rounded-full overflow-hidden mb-2">
          <div className="bg-brand-primary h-full" style={{ width: '65%' }}></div>
        </div>
        <div className="flex justify-between text-[10px] text-text-muted-soft">
          <span>65% Capacity</span>
          <span>3.2t CO2e</span>
        </div>
      </div>
      
      <div className="bg-surface-soft rounded-[24px] p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold uppercase tracking-tighter text-text-ink">Marketing Hub</h3>
          <span className="text-xs text-brand-accent-teal font-medium tracking-tight">420 kWh</span>
        </div>
        <div className="h-2 bg-surface-hairline rounded-full overflow-hidden mb-2">
          <div className="bg-brand-primary h-full" style={{ width: '38%' }}></div>
        </div>
        <div className="flex justify-between text-[10px] text-text-muted-soft">
          <span>38% Capacity</span>
          <span>1.1t CO2e</span>
        </div>
      </div>
    </>
  );
}
