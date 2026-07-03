import { useState } from "react";
import { transactions } from "../data/mockData";

type Filter = "all" | "bills" | "subscriptions" | "credit" | "income";

const categoryColors: Record<string, string> = {
  "Bills":         "#0F172A",
  "Income":        "#059669",
  "Comida":        "#059669",
  "Subscriptions": "#7C3AED",
  "Credit":        "#DC2626",
};

const filters: { id: Filter; label: string }[] = [
  { id: "all",           label: "All"   },
  { id: "bills",         label: "Bills" },
  { id: "subscriptions", label: "Subs"  },
  { id: "credit",        label: "Credit"},
  { id: "income",        label: "In"    },
];

export default function TransactionList() {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = filter === "all"
    ? transactions
    : transactions.filter((t) => t.category.toLowerCase() === filter);

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-5 flex flex-col gap-4 flex-1">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-xs font-medium tracking-widest uppercase text-slate font-display">
            Activity
          </p>
          <p className="text-navy font-display font-semibold mt-0.5">Recent Transactions</p>
        </div>
        <div className="flex gap-1 bg-background rounded-lg p-1 flex-wrap">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`text-xs font-display px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                filter === f.id
                  ? "bg-navy text-white font-medium"
                  : "text-slate hover:text-navy"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-border">
        {filtered.map((tx) => (
          <div key={tx.id} className="flex items-center justify-between py-3 gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white text-xs font-bold font-display"
                style={{
                  background: categoryColors[tx.category] ?? "#94A3B8",
                  opacity: 0.85,
                }}
              >
                {tx.payee[0]}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-navy font-display truncate">{tx.payee}</p>
                <p className="text-xs text-slate font-display">{tx.category}</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p
                className={`font-mono-data text-sm font-semibold ${
                  tx.amount > 0 ? "text-emerald" : "text-navy"
                }`}
              >
                {tx.amount > 0 ? "+" : ""}
                {Math.abs(tx.amount).toLocaleString("en-GB", {
                  style: "currency",
                  currency: "GBP",
                })}
              </p>
              <p className="text-xs text-slate font-display">{tx.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
