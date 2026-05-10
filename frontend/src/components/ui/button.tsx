import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/45 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-r from-violet-600 via-violet-500 to-teal-500 text-white shadow-lg shadow-violet-900/35 hover:-translate-y-0.5 hover:from-violet-500 hover:via-violet-400 hover:to-teal-400",
        ghost: "bg-transparent text-slate-200 hover:-translate-y-0.5 hover:bg-white/10",
        danger:
          "bg-gradient-to-r from-rose-600 to-orange-500 text-white shadow-lg shadow-rose-900/30 hover:-translate-y-0.5 hover:from-rose-500 hover:to-orange-400",
        secondary:
          "border border-white/15 bg-white/[0.08] text-slate-100 backdrop-blur-sm hover:-translate-y-0.5 hover:bg-white/12",
        outline:
          "border border-white/15 bg-white/[0.04] text-slate-100 backdrop-blur-sm hover:-translate-y-0.5 hover:border-teal-400/25 hover:bg-teal-500/10",
        default:
          "bg-gradient-to-r from-violet-600 via-violet-500 to-teal-500 text-white shadow-lg shadow-violet-900/35 hover:-translate-y-0.5 hover:from-violet-500 hover:via-violet-400 hover:to-teal-400",
      },
    },
    defaultVariants: { variant: "primary" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant }), className)} {...props} />;
}
