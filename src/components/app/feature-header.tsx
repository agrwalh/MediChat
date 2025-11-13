import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

type FeatureHeaderProps = {
  title: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
  accent?: "emerald" | "sky" | "violet" | "rose" | "amber";
  stats?: Array<{ label: string; value: string }>;
  className?: string;
};

const accentMap: Record<
  NonNullable<FeatureHeaderProps["accent"]>,
  { ring: string; gradient: string; iconBg: string; tag: string }
> = {
  emerald: {
    ring: "after:from-emerald-400 after:via-emerald-500 after:to-emerald-400",
    gradient:
      "before:from-emerald-100/80 before:via-white/90 before:to-sky-100/70 dark:before:from-emerald-500/20 dark:before:via-emerald-600/10 dark:before:to-sky-500/10",
    iconBg: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300",
    tag: "bg-emerald-500/20 text-emerald-600",
  },
  sky: {
    ring: "after:from-sky-400 after:via-sky-500 after:to-sky-400",
    gradient:
      "before:from-sky-100/80 before:via-white/90 before:to-emerald-100/70 dark:before:from-sky-500/20 dark:before:via-sky-600/10 dark:before:to-emerald-500/10",
    iconBg: "bg-sky-500/20 text-sky-600 dark:text-sky-300",
    tag: "bg-sky-500/20 text-sky-600",
  },
  violet: {
    ring: "after:from-violet-400 after:via-violet-500 after:to-violet-400",
    gradient:
      "before:from-violet-100/80 before:via-white/90 before:to-indigo-100/70 dark:before:from-violet-500/20 dark:before:via-violet-600/10 dark:before:to-indigo-500/10",
    iconBg: "bg-violet-500/20 text-violet-600 dark:text-violet-300",
    tag: "bg-violet-500/20 text-violet-600",
  },
  rose: {
    ring: "after:from-rose-400 after:via-rose-500 after:to-rose-400",
    gradient:
      "before:from-rose-100/80 before:via-white/90 before:to-amber-100/70 dark:before:from-rose-500/20 dark:before:via-rose-600/10 dark:before:to-amber-500/10",
    iconBg: "bg-rose-500/20 text-rose-600 dark:text-rose-300",
    tag: "bg-rose-500/20 text-rose-600",
  },
  amber: {
    ring: "after:from-amber-400 after:via-amber-500 after:to-amber-400",
    gradient:
      "before:from-amber-100/80 before:via-white/90 before:to-emerald-100/70 dark:before:from-amber-500/20 dark:before:via-amber-600/10 dark:before:to-emerald-500/10",
    iconBg: "bg-amber-500/20 text-amber-700 dark:text-amber-300",
    tag: "bg-amber-500/20 text-amber-700",
  },
};

export function FeatureHeader({
  title,
  subtitle,
  description,
  icon: Icon,
  accent = "emerald",
  stats,
  className,
}: FeatureHeaderProps) {
  const palette = accentMap[accent];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-white/50 bg-white/60 px-8 py-10 shadow-xl shadow-emerald-200/40 backdrop-blur-lg dark:border-slate-800/40 dark:bg-slate-900/60 dark:shadow-slate-900/40",
        "before:absolute before:inset-0 before:-z-10 before:bg-gradient-to-br",
        palette.gradient,
        "after:absolute after:-right-24 after:top-1/2 after:h-64 after:w-64 after:-translate-y-1/2 after:rounded-full after:bg-gradient-to-br",
        palette.ring,
        "after:opacity-30",
        className
      )}
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/50 bg-white/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300">
            <span className={cn("flex h-7 w-7 items-center justify-center rounded-full", palette.iconBg)}>
              <Icon className="h-4 w-4" />
            </span>
            {subtitle}
          </div>
          <h2 className="text-3xl font-semibold text-slate-900 md:text-4xl dark:text-white">{title}</h2>
          <p className="text-base text-slate-600 md:text-lg dark:text-slate-300">{description}</p>
        </div>
        {stats && stats.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/60 bg-white/70 px-5 py-4 text-sm font-medium text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-200"
              >
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{stat.label}</p>
                <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">{stat.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

