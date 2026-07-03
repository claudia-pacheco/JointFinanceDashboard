import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { monthlyOverview } from "../data/mockData";

const fmt = (v: number) =>
  v >= 1000 ? `£${(v / 1000).toFixed(1)}k` : `£${v}`;

export default function OverviewChart({ totalIncome }: { totalIncome?: number }) {
  const data = totalIncome
    ? monthlyOverview.map((m) => ({ ...m, income: totalIncome }))
    : monthlyOverview;
  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium tracking-widest uppercase text-slate font-display">
            Cash Flow
          </p>
          <p className="text-navy font-display font-semibold mt-0.5">6-Month Overview</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate font-display">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald inline-block" />
            In
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-navy inline-block" />
            Out
          </span>
        </div>
      </div>

      <div className="h-44 md:h-52">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#059669" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#059669" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0F172A" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#0F172A" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2DED5" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: "#64748B", fontFamily: "Inter" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={fmt}
              tick={{ fontSize: 11, fill: "#64748B", fontFamily: "JetBrains Mono" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "#0F172A",
                border: "none",
                borderRadius: 8,
                fontSize: 12,
                fontFamily: "JetBrains Mono",
                color: "#fff",
              }}
              formatter={(val: number) => [`£${val.toLocaleString("en-GB")}`, ""]}
            />
            <Area
              type="monotone"
              dataKey="income"
              stroke="#059669"
              strokeWidth={2}
              fill="url(#incomeGrad)"
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="expenses"
              stroke="#0F172A"
              strokeWidth={2}
              fill="url(#expGrad)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
