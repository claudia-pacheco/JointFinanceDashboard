import { useEffect, useState } from "react";
import StatCard from "../components/StatCard";
import OverviewChart from "../components/OverviewChart";
import PotsPanel from "../components/PotsPanel";
import { getAccounts, getOverview, type Bill, type Subscription, type CreditAccount, type SavingsGoal } from "../services/api";

type Props = { totalIncome: number };

type OverviewData = {
  bills: Bill[];
  subscriptions: Subscription[];
  credit: CreditAccount[];
  savingsGoals: SavingsGoal[];
};

const fmt = (n: number) =>
  "£" + Math.abs(n).toLocaleString("en-GB", { maximumFractionDigits: 0 });

export default function OverviewPage({ totalIncome }: Props) {
  const [accounts, setAccounts] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshAccounts = () => {
    getAccounts()
      .then((accountsData) => {
        setAccounts(accountsData);
      })
      .catch((error) => console.error("Unable to load overview data:", error));
  };

  useEffect(() => {
    Promise.all([getAccounts(), getOverview()])
      .then(([accountsData]) => {
        setAccounts(accountsData);
      })
      .catch((error) => console.error("Unable to load overview data:", error))
      .finally(() => setLoading(false));

    const handleBudgetChange = () => refreshAccounts();
    window.addEventListener("budgetDataChanged", handleBudgetChange);
    return () => window.removeEventListener("budgetDataChanged", handleBudgetChange);
  }, []);

  const billsTotal = accounts ? accounts.bills.reduce((s, b) => s + b.amount, 0) : 0;
  const subsTotal = accounts ? accounts.subscriptions.reduce((s, sItem) => s + sItem.amount, 0) : 0;
  const creditTotal = accounts ? accounts.credit.reduce((s, c) => s + c.balance, 0) : 0;
  const savingsTotal = accounts ? accounts.savingsGoals.reduce((s, g) => s + g.current, 0) : 0;
  const monthlyOut = billsTotal + subsTotal;
  const netWorth = savingsTotal - creditTotal + 12840;

  if (loading) {
    return <div className="text-slate text-sm font-display">Loading dashboard overview…</div>;
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="col-span-2 md:col-span-1">
          <StatCard
            label="Net Worth"
            value={fmt(netWorth)}
            trend={{ value: "+£240 this month", positive: true }}
            accent
          />
        </div>
        <StatCard
          label="Monthly In"
          value={fmt(totalIncome)}
          subtext="Payroll · Jul 1"
        />
        <StatCard
          label="Bills & Subs"
          value={fmt(monthlyOut)}
          subtext={`£${billsTotal} bills · £${subsTotal.toFixed(2)} subs`}
        />
        <StatCard
          label="Total Saved"
          value={fmt(savingsTotal)}
          trend={{ value: `${fmt(creditTotal)} owed`, positive: false }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_360px] gap-4">
        <OverviewChart totalIncome={totalIncome} />
        <PotsPanel />
      </div>
    </div>
  );
}
