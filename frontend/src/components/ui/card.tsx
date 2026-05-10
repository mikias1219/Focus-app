import { SURFACE_PANEL } from "@/lib/shell-layout";
import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn(SURFACE_PANEL, "p-6 shadow-xl shadow-violet-950/30", className)}>{children}</div>
  );
}
