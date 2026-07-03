import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const investments = [
  {
    id: "isa-cp",
    name: "Stocks & Shares ISA",
    owner: "CP",
    provider: "Vanguard",
    value: 8_420,
    gain: 640,
    gainPct: 8.2,
    holdings: [
      { name: "VWRP (All-World)", pct: 70, color: "#0F172A" },
      { name: "VAGP (Bonds)", pct: 20, color: "#059669" },
      { name: "Cash", pct: 10, color: "#94A3B8" },
    ],
  },
  {
    id: "isa-sb",
    name: "Stocks & Shares ISA",
    owner: "SB",
    provider: "Moneybox",
    value: 5_230,
    gain: 310,
    gainPct: 6.3,
    holdings: [
      { name: "S&P 500", pct: 60, color: "#0F172A" },
      { name: "Global ESG", pct: 30, color: "#059669" },
      { name: "Cash", pct: 10, color: "#94A3B8" },
    ],
  },
  {
    id: "pension-cp",
    name: "Workplace Pension",
    owner: "CP",
    provider: "Nest",
    value: 12_040,
    gain: 1_820,
    gainPct: 17.8,
    holdings: [
      { name: "Retirement Fund", pct: 85, color: "#0F172A" },
      { name: "Cash", pct: 15, color: "#94A3B8" },
    ],
  },
  {
    id: "pension-sb",
    name: "Workplace Pension",
    owner: "SB",
    provider: "Aviva",
    value: 9_400,
    gain: 920,
    gainPct: 10.8,
    holdings: [
      { name: "Default Lifestyle", pct: 90, color: "#0F172A" },
      { name: "Cash", pct: 10, color: "#94A3B8" },
    ],
  },
];

const totalValue = investments.reduce((s, i) => s + i.value, 0);
const totalGain  = investments.reduce((s, i) => s + i.gain, 0);

const fmt = (n: number) =>
  "£" + n.toLocaleString("en-GB", { maximumFractionDigits: 0 });

export default function InvestmentsPage() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-display font-semibold text-navy text-lg">Investments</h2>
        <p className="text-slate text-sm font-display mt-0.5">ISAs & Pensions</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="col-span-2 md:col-span-1 bg-navy rounded-xl p-5">
          <p className="text-white/40 text-xs font-display uppercase tracking-widest">Total Portfolio</p>
          <p className="font-mono-data text-2xl font-semibold text-white mt-1">{fmt(totalValue)}</p>
          <p className="text-emerald text-xs font-mono-data mt-1">+{fmt(totalGain)} all time</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-slate text-xs font-display uppercase tracking-widest">ISAs</p>
          <p className="font-mono-data text-xl font-semibold text-navy mt-1">
            {fmt(investments.filter((i) => i.id.startsWith("isa")).reduce((s, i) => s + i.value, 0))}
          </p>
          <p className="text-xs text-slate font-display mt-1">2 accounts</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-slate text-xs font-display uppercase tracking-widest">Pensions</p>
          <p className="font-mono-data text-xl font-semibold text-navy mt-1">
            {fmt(investments.filter((i) => i.id.startsWith("pension")).reduce((s, i) => s + i.value, 0))}
          </p>
          <p className="text-xs text-slate font-display mt-1">2 accounts</p>
        </div>
      </div>

      {/* Investment cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {investments.map((inv) => (
          <div key={inv.id} className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className="text-xs font-display px-1.5 py-0.5 rounded font-medium"
                    style={{
                      background: inv.owner === "CP" ? "#F1F5F9" : "#ECFDF5",
                      color: inv.owner === "CP" ? "#0F172A" : "#059669",
                    }}
                  >
                    {inv.owner}
                  </span>
                  <span className="text-xs text-slate font-display">{inv.provider}</span>
                </div>
                <p className="font-display font-semibold text-navy">{inv.name}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-mono-data text-xl font-semibold text-navy">{fmt(inv.value)}</p>
                <p className="text-xs font-mono-data text-emerald">+{fmt(inv.gain)} ({inv.gainPct}%)</p>
              </div>
            </div>

            {/* Allocation donut */}
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={inv.holdings} cx="50%" cy="50%" innerRadius={28} outerRadius={44} paddingAngle={2} dataKey="pct">
                      {inv.holdings.map((h, i) => (
                        <Cell key={i} fill={h.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "#0F172A", border: "none", borderRadius: 8, fontSize: 11, fontFamily: "JetBrains Mono", color: "#fff" }}
                      formatter={(v: number) => [`${v}%`, ""]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5 flex-1">
                {inv.holdings.map((h, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: h.color }} />
                      <span className="text-xs font-display text-slate">{h.name}</span>
                    </div>
                    <span className="font-mono-data text-xs text-navy">{h.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
