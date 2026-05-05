"use client";

interface SectionLabelProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionLabel({ children, className = "" }: SectionLabelProps) {
  return (
    <div className={`text-[11px] font-bold uppercase tracking-widest text-text-muted-soft ${className}`}>
      {children}
    </div>
  );
}
