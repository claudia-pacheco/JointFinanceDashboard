import { useEffect, useState } from "react";
import { getAccounts, type Bill, type Subscription, type CreditAccount, type SavingsGoal } from "../services/api";

type Tab = "bills" | "subscriptions" | "credit" | "savings";

const tabs: { id: Tab; label: string; emoji: string }[] = [
  { id: "bills", label: "Bills", emoji: "🧾" },
  { id: "subscriptions", label: "Subscriptions", emoji: "🔄" },
  { id: "credit", label: "Credit", emoji: "💳" },
  { id: "savings", label: "Savings", emoji: "🏦" },
];

const fmt = (n: number, decimals = 0) =>
  "£" + n.toLocaleString("en-GB", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

export default function PotsPanel() {
  const [tab, setTab] = useState<Tab>("bills");
  const [bills, setBills] = useState<Bill[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [credit, setCredit] = useState<CreditAccount[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);

  const refreshAccounts = () => {
    getAccounts()
      .then((data) => {
        setBills(data.bills);
        setSubscriptions(data.subscriptions);
        setCredit(data.credit);
        setSavingsGoals(data.savingsGoals);
      })
      .catch((error) => {
        console.error("Unable to load account pots:", error);
      });
  };

  useEffect(() => {
    refreshAccounts();
    const handleBudgetChange = () => refreshAccounts();
    window.addEventListener("budgetDataChanged", handleBudgetChange);
    return () => window.removeEventListener("budgetDataChanged", handleBudgetChange);
  }, []);

  const billsTotal = bills.reduce((s, b) => s + b.amount, 0);
  const subsTotal = subscriptions.reduce((s, sItem) => s + sItem.amount, 0);
  const creditTotal = credit.reduce((s, c) => s + c.balance, 0);
  const savingsTotal = savingsGoals.reduce((s, g) => s + g.current, 0);

  return (
    <div className="bg-card border border-border rounded-xl flex flex-col overflow-hidden">
      <div className="flex border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-3 text-xs font-display transition-all cursor-pointer border-b-2 ${
              tab === t.id
                ? "border-navy text-navy font-semibold"
                : "border-transparent text-slate hover:text-navy"
            }`}
          >
            <span className="text-base leading-none">{t.emoji}</span>
            <span className="hidden sm:block">{t.label}</span>
          </button>
        ))}
      </div>

      <div className="p-4 md:p-5 flex-1">
        {tab === "bills" && <BillsTab bills={bills} billsTotal={billsTotal} />}
        {tab === "subscriptions" && <SubsTab subscriptions={subscriptions} subsTotal={subsTotal} />}
        {tab === "credit" && <CreditTab credit={credit} creditTotal={creditTotal} />}
        {tab === "savings" && <SavingsTab savingsGoals={savingsGoals} savingsTotal={savingsTotal} />}
      </div>
    </div>
  );
}

// ── Bills ──────────────────────────────────────────────────────────────────

type BillsTabProps = {
  bills: Bill[];
  billsTotal: number;
};

function BillsTab({ bills, billsTotal }: BillsTabProps) {
  const billsLeft = bills.filter((b) => !b.paid);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-display text-slate uppercase tracking-widest font-medium">Monthly Bills</p>
          <p className="font-mono-data text-2xl font-semibold text-navy mt-0.5">{fmt(billsTotal)}</p>
        </div>
        {billsLeft.length > 0 && (
          <div className="text-right">
            <p className="text-xs font-display text-slate">Still due</p>
            <p className="font-mono-data text-sm font-semibold text-amber-600">
              {fmt(billsLeft.reduce((s, b) => s + b.amount, 0))}
            </p>
          </div>
        )}
      </div>

      <div className="divide-y divide-border">
        {bills.map((b) => (
          <div key={b.id} className="flex items-center justify-between py-3 gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  b.paid ? "bg-emerald" : "bg-amber-400"
                }`}
              />
              <span className="text-sm font-display text-navy truncate">{b.name}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {!b.paid && (
                <span className="text-xs font-display text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                  Due {b.dueDay} Jul
                </span>
              )}
              <span className="font-mono-data text-sm font-semibold text-navy">{fmt(b.amount)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Subscriptions ──────────────────────────────────────────────────────────

type SubsTabProps = {
  subscriptions: Subscription[];
  subsTotal: number;
};

function SubsTab({ subscriptions, subsTotal }: SubsTabProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-xs font-display text-slate uppercase tracking-widest font-medium">Monthly Subscriptions</p>
        <p className="font-mono-data text-2xl font-semibold text-navy mt-0.5">{fmt(subsTotal, 2)}</p>
      </div>

      <div className="divide-y divide-border">
        {subscriptions.map((s) => (
          <div key={s.id} className="flex items-center justify-between py-3 gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-navy flex items-center justify-center shrink-0">
                <span className="text-white text-xs font-bold font-display">{s.name[0]}</span>
              </div>
              <span className="text-sm font-display text-navy">{s.name}</span>
            </div>
            <span className="font-mono-data text-sm font-semibold text-navy">
              {fmt(s.amount, 2)}<span className="text-slate font-normal text-xs">/mo</span>
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border">
        <span className="text-xs font-display text-slate">Annual cost</span>
        <span className="font-mono-data text-sm font-semibold text-navy">{fmt(subsTotal * 12, 2)}</span>
      </div>
    </div>
  );
}

// ── Credit ─────────────────────────────────────────────────────────────────

type CreditTabProps = {
  credit: CreditAccount[];
  creditTotal: number;
};

function CreditTab({ credit, creditTotal }: CreditTabProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-xs font-display text-slate uppercase tracking-widest font-medium">Outstanding Balance</p>
        <p className="font-mono-data text-2xl font-semibold text-crimson mt-0.5">{fmt(creditTotal, 2)}</p>
      </div>

      <div className="space-y-3">
        {credit.map((c) => {
          const usedPct = (c.balance / c.limit) * 100;
          return (
            <div key={c.id} className="border border-border rounded-lg p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-display font-medium text-navy">{c.name}</span>
                <span className="font-mono-data text-sm font-semibold text-navy">{fmt(c.balance, 2)}</span>
              </div>
              <div className="h-1.5 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${usedPct}%`,
                    background: usedPct > 60 ? "#DC2626" : usedPct > 30 ? "#D97706" : "#059669",
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-display text-slate">
                  {usedPct.toFixed(0)}% of {fmt(c.limit)} limit
                  {c.apr > 0 && ` · ${c.apr}% APR`}
                  {c.apr === 0 && " · 0% interest"}
                </span>
                <span className="font-mono-data text-slate">
                  Min {fmt(c.minPayment, 2)} · Due {c.dueDay} Jul
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Savings ────────────────────────────────────────────────────────────────

type SavingsTabProps = {
  savingsGoals: SavingsGoal[];
  savingsTotal: number;
};

function SavingsTab({ savingsGoals, savingsTotal }: SavingsTabProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-xs font-display text-slate uppercase tracking-widest font-medium">Total Saved</p>
        <p className="font-mono-data text-2xl font-semibold text-emerald mt-0.5">{fmt(savingsTotal)}</p>
      </div>

      <div className="space-y-4">
        {savingsGoals.map((g) => {
          const pct = Math.round((g.current / g.target) * 100);
          const remaining = g.target - g.current;
          return (
            <div key={g.id} className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-sm">{g.emoji}</span>
                  <span className="text-sm font-display font-medium text-navy truncate">{g.name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono-data text-xs text-slate">{fmt(g.current)}</span>
                  <span className="text-border text-xs">/</span>
                  <span className="font-mono-data text-xs text-slate">{fmt(g.target)}</span>
                  <span className="font-mono-data text-xs text-navy font-medium">{pct}%</span>
                </div>
              </div>
              <div className="h-2 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, background: g.color }}
                />
              </div>
              <p className="text-xs font-mono-data text-slate">{fmt(remaining)} to go</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
