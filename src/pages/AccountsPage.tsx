import { useEffect, useState } from "react";
import { getAccounts, type Bill, type Subscription, type CreditAccount, type SavingsGoal } from "../services/api";

const fmt = (n: number, dec = 0) =>
  "£" + Math.abs(n).toLocaleString("en-GB", { minimumFractionDigits: dec, maximumFractionDigits: dec });

type Props = { currentMonthLabel: string };

export default function AccountsPage({ currentMonthLabel }: Props) {
  const [bills, setBills] = useState<Bill[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [credit, setCredit] = useState<CreditAccount[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshAccounts = () => {
    setLoading(true);

    getAccounts()
      .then((data) => {
        setBills(data.bills);
        setSubscriptions(data.subscriptions);
        setCredit(data.credit);
        setSavingsGoals(data.savingsGoals);
      })
      .catch((error) => {
        console.error("Unable to load accounts:", error);
      })
      .finally(() => {
        setLoading(false);
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

  const pots = [
    {
      id: "bills",
      label: "Bills",
      emoji: "🧾",
      balance: billsTotal,
      color: "#0F172A",
      bg: "#F1F5F9",
      desc: `${bills.length} items`,
    },
    {
      id: "subs",
      label: "Subscriptions",
      emoji: "🔄",
      balance: subsTotal,
      color: "#7C3AED",
      bg: "#F5F3FF",
      desc: `${subscriptions.length} active`,
    },
    {
      id: "credit",
      label: "Credit",
      emoji: "💳",
      balance: -creditTotal,
      color: "#DC2626",
      bg: "#FEF2F2",
      desc: `${credit.length} accounts`,
    },
    {
      id: "savings",
      label: "Savings",
      emoji: "🏦",
      balance: savingsTotal,
      color: "#059669",
      bg: "#ECFDF5",
      desc: `${savingsGoals.length} goals`,
    },
  ];

  if (loading) {
    return (
      <div className="text-slate text-sm font-display">Loading account data…</div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display font-semibold text-navy text-lg">Your joint account breakdown</h2>
        <p className="text-sm text-slate mt-1">{currentMonthLabel}</p>
      </div>

      {/* Current account */}
      <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-display text-slate uppercase tracking-widest font-medium">Joint Current Account</p>
            <p className="font-mono-data text-3xl font-semibold text-navy mt-1">£12,840.00</p>
            <p className="text-sm text-slate font-display mt-1">Available balance</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-border">
          {pots.map((pot) => (
            <div key={pot.id} className="rounded-lg p-3" style={{ background: pot.bg }}>
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-base">{pot.emoji}</span>
                <span className="text-xs font-display font-medium" style={{ color: pot.color }}>{pot.label}</span>
              </div>
              <p className="font-mono-data text-base font-semibold" style={{ color: pot.color === "#DC2626" ? "#DC2626" : "#0F172A" }}>
                {pot.balance < 0 ? "-" : ""}{fmt(Math.abs(pot.balance))}
              </p>
              <p className="text-xs text-slate font-display mt-0.5">{pot.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bills pot detail */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-display text-slate uppercase tracking-widest font-medium">Bills Pot</p>
            <p className="font-display font-semibold text-navy mt-0.5">Monthly commitments — {fmt(billsTotal)}</p>
          </div>
        </div>
        <div className="divide-y divide-border">
          {bills.map((b) => (
            <div key={b.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-2.5">
                <span className={`w-2 h-2 rounded-full ${b.paid ? "bg-emerald" : "bg-amber-400"}`} />
                <span className="text-sm font-display text-navy">{b.name}</span>
              </div>
              <div className="flex items-center gap-3">
                {!b.paid && (
                  <span className="text-xs font-display text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                    Due {b.dueDay} Jul
                  </span>
                )}
                <span className="font-mono-data text-sm font-semibold text-navy">{fmt(b.amount)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subscriptions detail */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="mb-4">
          <p className="text-xs font-display text-slate uppercase tracking-widest font-medium">Subscriptions Pot</p>
          <p className="font-display font-semibold text-navy mt-0.5">Monthly cost — {fmt(subsTotal, 2)}</p>
        </div>
        <div className="divide-y divide-border">
          {subscriptions.map((s) => (
            <div key={s.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-navy" />
                <span className="text-sm font-display text-navy">{s.name}</span>
              </div>
              <span className="font-mono-data text-sm font-semibold text-navy">{fmt(s.amount, 2)}/mo</span>
            </div>
          ))}
        </div>
      </div>

      {/* Credit detail */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="mb-4">
          <p className="text-xs font-display text-slate uppercase tracking-widest font-medium">Credit Pot</p>
          <p className="font-display font-semibold text-navy mt-0.5">
            Outstanding — <span className="text-red-600">{fmt(creditTotal, 2)}</span>
          </p>
        </div>
        <div className="space-y-3">
          {credit.map((c) => {
            const usedPct = (c.balance / c.limit) * 100;
            return (
              <div key={c.id} className="border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-display font-medium text-navy">{c.name}</span>
                  <span className="font-mono-data font-semibold text-red-600">{fmt(c.balance, 2)}</span>
                </div>
                <div className="h-2 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${usedPct}%`,
                      background: usedPct > 60 ? "#DC2626" : usedPct > 30 ? "#D97706" : "#059669",
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs font-display text-slate">
                  <span>{usedPct.toFixed(0)}% of {fmt(c.limit)} limit · {c.apr > 0 ? `${c.apr}% APR` : "0% interest"}</span>
                  <span className="font-mono-data">Min {fmt(c.minPayment, 2)} · Due {c.dueDay} Jul</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Savings detail */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="mb-4">
          <p className="text-xs font-display text-slate uppercase tracking-widest font-medium">Savings Pot</p>
          <p className="font-display font-semibold text-navy mt-0.5">Saved — {fmt(savingsTotal)}</p>
        </div>
        <div className="divide-y divide-border">
          {savingsGoals.map((goal) => {
            const pct = Math.round((goal.current / goal.target) * 100);
            return (
              <div key={goal.id} className="py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{goal.emoji}</span>
                    <span className="text-sm font-display text-navy">{goal.name}</span>
                  </div>
                  <span className="text-xs font-mono-data text-slate">{pct}%</span>
                </div>
                <div className="h-2 bg-border rounded-full overflow-hidden mt-2">
                  <div className="h-full rounded-full bg-emerald" style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      
    </div>
  );
}
