import { useState } from "react";
import { transactions } from "../data/mockData";

type Filter = "all" | "bills" | "subscriptions" | "credit" | "income" | "comida";

const categoryColors: Record<string, string> = {
  "Bills":         "#0F172A",
  "Income":        "#059669",
  "Comida":        "#059669",
  "Subscriptions": "#7C3AED",
  "Credit":        "#DC2626",
};

const filters: { id: Filter; label: string }[] = [
  { id: "all",           label: "All"           },
  { id: "income",        label: "Income"        },
  { id: "bills",         label: "Bills"         },
  { id: "subscriptions", label: "Subscriptions" },
  { id: "credit",        label: "Credit"        },
  { id: "comida",        label: "Comida"        },
];

export default function TransactionsPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  const filtered = transactions
    .filter((t) => filter === "all" || t.category.toLowerCase() === filter)
    .filter((t) => !search || t.payee.toLowerCase().includes(search.toLowerCase()));

  const totalIn  = filtered.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const totalOut = filtered.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-display font-semibold text-navy text-lg">Transactions</h2>
        <p className="text-slate text-sm font-display mt-0.5">June – July 2026</p>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-slate font-display uppercase tracking-widest">In</p>
          <p className="font-mono-data text-xl font-semibold text-emerald mt-1">
            +£{totalIn.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-slate font-display uppercase tracking-widest">Out</p>
          <p className="font-mono-data text-xl font-semibold text-navy mt-1">
            £{Math.abs(totalOut).toLocaleString("en-GB", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-slate font-display uppercase tracking-widest">Net</p>
          <p className={`font-mono-data text-xl font-semibold mt-1 ${totalIn + totalOut >= 0 ? "text-emerald" : "text-red-600"}`}>
            {totalIn + totalOut >= 0 ? "+" : ""}£{(totalIn + totalOut).toLocaleString("en-GB", { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          placeholder="Search payee…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-card border border-border rounded-lg px-3 py-2 text-sm font-display text-navy placeholder:text-slate focus:outline-none focus:border-navy/40"
        />
        <div className="flex gap-1 bg-card border border-border rounded-lg p-1 flex-wrap">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`text-xs font-display px-2.5 py-1.5 rounded-md transition-all cursor-pointer whitespace-nowrap ${
                filter === f.id ? "bg-navy text-white font-medium" : "text-slate hover:text-navy"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-slate font-display text-sm">No transactions match</div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between px-4 md:px-5 py-3.5 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-white text-xs font-bold font-display"
                    style={{ background: categoryColors[tx.category] ?? "#94A3B8", opacity: 0.85 }}
                  >
                    {tx.payee[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-navy font-display truncate">{tx.payee}</p>
                    <p className="text-xs text-slate font-display">{tx.category} · {tx.date}</p>
                  </div>
                </div>
                <p className={`font-mono-data text-sm font-semibold shrink-0 ${tx.amount > 0 ? "text-emerald" : "text-navy"}`}>
                  {tx.amount > 0 ? "+" : ""}
                  £{Math.abs(tx.amount).toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
