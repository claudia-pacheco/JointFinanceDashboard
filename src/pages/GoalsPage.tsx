import { savingsGoals, savingsTotal } from "../data/mockData";

const fmt = (n: number) =>
  "£" + n.toLocaleString("en-GB", { maximumFractionDigits: 0 });

export default function GoalsPage() {
  const totalTarget = savingsGoals.reduce((s, g) => s + g.target, 0);
  const overallPct = Math.round((savingsTotal / totalTarget) * 100);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-display font-semibold text-navy text-lg">Goals</h2>
        <p className="text-slate text-sm font-display mt-0.5">Savings progress towards your targets</p>
      </div>

      {/* Overall */}
      <div className="bg-navy rounded-xl p-5 flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/40 text-xs font-display uppercase tracking-widest">Total Saved</p>
            <p className="font-mono-data text-3xl font-semibold text-white mt-1">{fmt(savingsTotal)}</p>
          </div>
          <div className="text-right">
            <p className="text-white/40 text-xs font-display uppercase tracking-widest">Target</p>
            <p className="font-mono-data text-xl font-semibold text-white/60 mt-1">{fmt(totalTarget)}</p>
          </div>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-emerald rounded-full" style={{ width: `${overallPct}%` }} />
        </div>
        <p className="text-white/40 text-xs font-mono-data">{overallPct}% of combined targets · {fmt(totalTarget - savingsTotal)} to go</p>
      </div>

      {/* Individual goals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {savingsGoals.map((g) => {
          const pct = Math.round((g.current / g.target) * 100);
          const remaining = g.target - g.current;
          const monthsToGo = Math.ceil(remaining / 200); // assume £200/mo contribution

          return (
            <div key={g.id} className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{g.emoji}</span>
                  <div>
                    <p className="font-display font-semibold text-navy">{g.name}</p>
                    <p className="text-xs text-slate font-display mt-0.5">
                      {remaining > 0 ? `${fmt(remaining)} to go` : "Goal reached! 🎉"}
                    </p>
                  </div>
                </div>
                <span className="font-mono-data text-lg font-semibold text-navy shrink-0">{pct}%</span>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="h-3 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${Math.min(pct, 100)}%`, background: g.color }}
                  />
                </div>
                <div className="flex justify-between text-xs font-mono-data text-slate">
                  <span>{fmt(g.current)} saved</span>
                  <span>target {fmt(g.target)}</span>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border">
                <div>
                  <p className="text-xs text-slate font-display">Remaining</p>
                  <p className="font-mono-data text-sm font-semibold text-navy mt-0.5">{fmt(remaining)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate font-display">Est. months</p>
                  <p className="font-mono-data text-sm font-semibold text-navy mt-0.5">
                    {remaining > 0 ? `~${monthsToGo} mo` : "Done"}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
