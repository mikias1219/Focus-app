import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-xl px-2.5 py-1 text-xs font-medium", {
  variants: {
    variant: {
      default: "border border-white/10 bg-white/5 text-slate-200",
      success: "border border-emerald-400/20 bg-emerald-500/15 text-emerald-300",
      warning: "border border-amber-400/20 bg-amber-500/15 text-amber-300",
      danger: "border border-rose-400/20 bg-rose-500/15 text-rose-300",
      info: "border border-blue-400/20 bg-blue-500/15 text-blue-300",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
