import { cn } from "@/lib/utils";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-10 w-full rounded-xl border border-white/15 bg-white/[0.06] px-3 text-sm text-slate-100 outline-none backdrop-blur-sm placeholder:text-slate-500 focus:border-teal-400/45 focus:ring-2 focus:ring-teal-400/20",
        props.className,
      )}
    />
  );
}
