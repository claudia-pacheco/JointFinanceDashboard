import { useState } from "react";
import { bills, subscriptions, billsTotal, subsTotal } from "../data/mockData";

const fmt = (n: number, dec = 0) =>
  "£" + n.toLocaleString("en-GB", { minimumFractionDigits: dec, maximumFractionDigits: dec });

type Tab = "bills" | "subscriptions";

export default function BudgetsPage() {
  const [tab, setTab] = useState<Tab>("bills");

  const billsPaid    = bills.filter((b) => b.paid).reduce((s, b) => s + b.amount, 0);
  const billsPending = bills.filter((b) => !b.paid).reduce((s, b) => s + b.amount, 0);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-display font-semibold text-navy text-lg">Budgets</h2>
        <p className="text-slate text-sm font-display mt-0.5">Monthly pots — July 2026</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-navy rounded-xl p-4">
          <p className="text-white/40 text-xs font-display uppercase tracking-widest">Bills Total</p>
          <p className="font-mono-data text-xl font-semibold text-white mt-1">{fmt(billsTotal)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-slate text-xs font-display uppercase tracking-widest">Paid</p>
          <p className="font-mono-data text-xl font-semibold text-emerald mt-1">{fmt(billsPaid)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-slate text-xs font-display uppercase tracking-widest">Still Due</p>
          <p className="font-mono-data text-xl font-semibold text-amber-600 mt-1">{fmt(billsPending)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-slate text-xs font-display uppercase tracking-widest">Subscriptions</p>
          <p className="font-mono-data text-xl font-semibold text-navy mt-1">{fmt(subsTotal, 2)}</p>
        </div>
      </div>

      {/* Tab toggle */}
      <div className="flex gap-2 border-b border-border">
        {(["bills", "subscriptions"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-3 px-1 text-sm font-display font-medium capitalize border-b-2 transition-all cursor-pointer ${
              tab === t ? "border-navy text-navy" : "border-transparent text-slate hover:text-navy"
            }`}
          >
            {t === "bills" ? "Bills" : "Subscriptions"}
          </button>
        ))}
      </div>

      {tab === "bills" && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="divide-y divide-border">
            {bills.map((b) => {
              const pct = (b.amount / billsTotal) * 100;
              return (
                <div key={b.id} className="px-4 md:px-5 py-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${b.paid ? "bg-emerald" : "bg-amber-400"}`} />
                      <span className="font-display font-medium text-navy text-sm">{b.name}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {!b.paid && (
                        <span className="text-xs font-display text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                          Due {b.dueDay} Jul
                        </span>
                      )}
                      {b.paid && (
                        <span className="text-xs font-display text-emerald bg-emerald-light px-2 py-0.5 rounded">Paid</span>
                      )}
                      <span className="font-mono-data text-sm font-semibold text-navy">{fmt(b.amount)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: b.paid ? "#059669" : "#D97706" }}
                      />
                    </div>
                    <span className="text-xs font-mono-data text-slate">{pct.toFixed(0)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="px-5 py-4 bg-background flex items-center justify-between border-t border-border">
            <span className="font-display text-sm text-slate">Total monthly bills</span>
            <span className="font-mono-data text-base font-semibold text-navy">{fmt(billsTotal)}</span>
          </div>
        </div>
      )}

      {tab === "subscriptions" && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="divide-y divide-border">
            {subscriptions.map((s) => {
              const pct = (s.amount / subsTotal) * 100;
              return (
                <div key={s.id} className="px-4 md:px-5 py-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-navy flex items-center justify-center">
                        <span className="text-white text-xs font-bold font-display">{s.name[0]}</span>
                      </div>
                      <div>
                        <p className="font-display font-medium text-navy text-sm">{s.name}</p>
                        <p className="text-xs text-slate font-display">{s.billedOn}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono-data text-sm font-semibold text-navy">{fmt(s.amount, 2)}/mo</p>
                      <p className="text-xs text-slate font-mono-data">{fmt(s.amount * 12, 2)}/yr</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-violet-500" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-mono-data text-slate">{pct.toFixed(0)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="px-5 py-4 bg-background flex flex-col gap-1 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="font-display text-sm text-slate">Monthly total</span>
              <span className="font-mono-data text-base font-semibold text-navy">{fmt(subsTotal, 2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-display text-sm text-slate">Annual total</span>
              <span className="font-mono-data text-sm text-slate">{fmt(subsTotal * 12, 2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
