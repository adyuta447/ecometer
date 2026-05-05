"use client";

interface StatusBadgeProps {
  label: string;
  variant?: "teal" | "amber" | "primary" | "soft";
  pulse?: boolean;
}

const variantClasses: Record<string, string> = {
  teal: "bg-brand-accent-teal/10 text-brand-accent-teal",
  amber: "bg-brand-accent-amber/20 text-brand-accent-amber",
  primary: "bg-brand-primary/10 text-brand-primary",
  soft: "bg-surface-soft text-text-muted",
};

export function StatusBadge({ label, variant = "soft", pulse = false }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-md ${variantClasses[variant]}`}>
      {pulse && (
        <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
          variant === "teal" ? "bg-brand-accent-teal" :
          variant === "amber" ? "bg-brand-accent-amber" :
          variant === "primary" ? "bg-brand-primary" :
          "bg-text-muted"
        }`}></span>
      )}
      {label}
    </span>
  );
}
