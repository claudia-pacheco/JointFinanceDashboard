import StatCard from "../components/StatCard";
import PotsPanel from "../components/PotsPanel";
import {
  netWorth, monthlyOut, savingsTotal, creditTotal, billsTotal, subsTotal,
} from "../data/mockData";

type Props = { totalIncome: number; currentMonthLabel: string };

const fmt = (n: number) =>
  "£" + Math.abs(n).toLocaleString("en-GB", { maximumFractionDigits: 0 });

export default function OverviewPage({ totalIncome, currentMonthLabel }: Props) {
  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="rounded-2xl border border-border bg-card p-4 md:p-5">
        <p className="text-xs font-display uppercase tracking-widest text-slate">Overview for</p>
        <p className="mt-1 text-lg font-semibold text-navy">{currentMonthLabel}</p>
      </div>

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
          label="Bills & Subscriptions"
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
        <PotsPanel />
      </div>

    </div>
  );
}
