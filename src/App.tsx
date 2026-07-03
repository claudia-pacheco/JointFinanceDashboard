import { useState } from "react";
import Sidebar, { type Page } from "./components/Sidebar";
import OverviewPage from "./pages/OverviewPage";
import AccountsPage from "./pages/AccountsPage";
import TransactionsPage from "./pages/TransactionsPage";
import BudgetsPage from "./pages/BudgetsPage";
import InvestmentsPage from "./pages/InvestmentsPage";
import GoalsPage from "./pages/GoalsPage";
import SettingsPage from "./pages/SettingsPage";

type Income = { cp: number; sb: number; cpName: string; sbName: string; payday: number };

const defaultIncome: Income = { cp: 2400, sb: 2400, cpName: "CP", sbName: "SB", payday: 1 };

function loadIncome(): Income {
  try {
    const raw = localStorage.getItem("folio-income");
    return raw ? { ...defaultIncome, ...JSON.parse(raw) } : defaultIncome;
  } catch {
    return defaultIncome;
  }
}

const pageTitles: Record<Page, string> = {
  overview:     "Joint Account",
  accounts:     "Accounts & Pots",
  transactions: "Transactions",
  budgets:      "Budgets",
  investments:  "Investments",
  goals:        "Goals",
  settings:     "Settings",
};

export default function App() {
  const [page, setPage]       = useState<Page>("overview");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [income, setIncome]   = useState<Income>(loadIncome);

  const handleSaveIncome = (next: Income) => {
    setIncome(next);
    localStorage.setItem("folio-income", JSON.stringify(next));
  };

  const totalIncome = (income.cp || 0) + (income.sb || 0);
  const names = { cp: income.cpName || "CP", sb: income.sbName || "SB" };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-col md:w-56 md:min-h-screen shrink-0">
        <Sidebar active={page} onNavigate={setPage} names={names} />
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className="relative z-10 flex h-full">
            <Sidebar active={page} onNavigate={setPage} onClose={() => setDrawerOpen(false)} names={names} />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="px-4 md:px-8 py-4 md:py-5 border-b border-border bg-background flex items-center justify-between shrink-0 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setDrawerOpen(true)}
              className="md:hidden flex flex-col gap-1 p-1 shrink-0"
              aria-label="Open menu"
            >
              <span className="w-5 h-0.5 bg-navy rounded-full block" />
              <span className="w-5 h-0.5 bg-navy rounded-full block" />
              <span className="w-3.5 h-0.5 bg-navy rounded-full block" />
            </button>
            <div className="min-w-0">
              <h1 className="font-display font-semibold text-navy text-base md:text-lg leading-tight">
                {pageTitles[page]}
              </h1>
              <p className="text-slate text-xs md:text-sm font-display mt-0.5 truncate">
                July 2026 · All pots up to date
              </p>
            </div>
          </div>
          <div className="flex -space-x-2 shrink-0">
            <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center ring-2 ring-background">
              <span className="text-white text-xs font-bold font-display">{names.cp.slice(0, 2).toUpperCase()}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-emerald flex items-center justify-center ring-2 ring-background">
              <span className="text-white text-xs font-bold font-display">{names.sb.slice(0, 2).toUpperCase()}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-5 md:py-7">
          <div className="max-w-6xl mx-auto">
            {page === "overview"     && <OverviewPage totalIncome={totalIncome} />}
            {page === "accounts"     && <AccountsPage />}
            {page === "transactions" && <TransactionsPage />}
            {page === "budgets"      && <BudgetsPage />}
            {page === "investments"  && <InvestmentsPage />}
            {page === "goals"        && <GoalsPage />}
            {page === "settings"     && <SettingsPage income={income} onSave={handleSaveIncome} />}
          </div>
          <div className="h-4 md:h-0" />
        </main>
      </div>
    </div>
  );
}
