type StatCardProps = {
  label: string;
  value: string;
  subtext?: string;
  trend?: { value: string; positive: boolean };
  accent?: boolean;
  split?: { alexValue: string; samValue: string };
};

export default function StatCard({ label, value, subtext, trend, accent, split }: StatCardProps) {
  return (
    <div
      className={`rounded-xl p-5 flex flex-col gap-3 border ${
        accent ? "bg-navy border-transparent" : "bg-card border-border"
      }`}
    >
      <p
        className={`text-xs font-medium tracking-widest uppercase font-display ${
          accent ? "text-white/40" : "text-slate"
        }`}
      >
        {label}
      </p>
      <p
        className={`font-mono-data text-2xl font-semibold tracking-tight leading-none ${
          accent ? "text-white" : "text-navy"
        }`}
      >
        {value}
      </p>

      {split && (
        <div className="flex items-center gap-3 text-xs font-mono-data">
          <span className={accent ? "text-white/50" : "text-slate"}>
            AL <span className={accent ? "text-white/80" : "text-navy"}>{split.alexValue}</span>
          </span>
          <span className={`${accent ? "text-white/20" : "text-border"}`}>·</span>
          <span className={accent ? "text-white/50" : "text-slate"}>
            SM <span className="text-emerald">{split.samValue}</span>
          </span>
        </div>
      )}

      <div className="flex items-center gap-2">
        {trend && (
          <span
            className={`text-xs font-medium font-mono-data px-1.5 py-0.5 rounded ${
              trend.positive
                ? accent
                  ? "bg-emerald/20 text-emerald"
                  : "bg-emerald-light text-emerald"
                : "bg-red-50 text-red-600"
            }`}
          >
            {trend.positive ? "▲" : "▼"} {trend.value}
          </span>
        )}
        {subtext && (
          <p className={`text-xs leading-snug ${accent ? "text-white/40" : "text-slate"}`}>{subtext}</p>
        )}
      </div>
    </div>
  );
}
