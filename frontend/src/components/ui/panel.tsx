import { SURFACE_PANEL } from "@/lib/shell-layout";
import { cn } from "@/lib/utils";

export function Panel({
  title,
  subtitle,
  className,
  children,
}: {
  title: string;
  subtitle?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn(SURFACE_PANEL, "p-6", className)}>
      <header className="mb-4">
        <h3 className="text-base font-semibold text-slate-50">{title}</h3>
        {subtitle ? <p className="mt-1 text-sm text-slate-400">{subtitle}</p> : null}
      </header>
      {children}
    </section>
  );
}
