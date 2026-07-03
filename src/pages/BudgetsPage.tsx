import { useEffect, useMemo, useState } from "react";
import {
  deleteBudgetItem,
  getBudgets,
  postBudgetItem,
  putBudgetItem,
  type Bill,
  type Subscription,
  type CreditAccount,
  type SavingsGoal,
} from "../services/api";

const fmt = (n: number, dec = 0) =>
  "£" + n.toLocaleString("en-GB", { minimumFractionDigits: dec, maximumFractionDigits: dec });

type Tab = "bills" | "subscriptions" | "credit" | "savings";
type SelectedMonth = { month: number; year: number };
type BudgetItem = { id: string; name: string; amount: number; [key: string]: any };

type EditableBudgetRowProps<T extends BudgetItem> = {
  item: T;
  onSave: (item: T) => void;
  onDelete: (item: T) => void;
  note?: string;
  tab: Tab;
};

function EditableBudgetRow<T extends BudgetItem>({ item, onSave, onDelete, note, tab }: EditableBudgetRowProps<T>) {
  const [modalType, setModalType] = useState<"edit" | "delete" | null>(null);
  const [draftName, setDraftName] = useState(item.name);
  const [draftAmount, setDraftAmount] = useState(item.amount.toFixed(2));
  const [draftPaid, setDraftPaid] = useState(Boolean((item as any).paid));
  const [draftDueDay, setDraftDueDay] = useState(Number((item as any).dueDay ?? 1));
  const [draftBilledOn, setDraftBilledOn] = useState((item as any).billedOn ?? "Monthly");
  const [draftCreditLimit, setDraftCreditLimit] = useState(((item as any).limit ?? 0).toFixed(2));
  const [draftCreditMinPayment, setDraftCreditMinPayment] = useState(((item as any).minPayment ?? 0).toFixed(2));
  const [draftCreditApr, setDraftCreditApr] = useState(String((item as any).apr ?? 0));
  const [draftRecurring, setDraftRecurring] = useState(Boolean((item as any).recurring));
  const [draftSavingsTarget, setDraftSavingsTarget] = useState(((item as any).target ?? item.amount).toFixed(2));
  const [draftSavingsCurrent, setDraftSavingsCurrent] = useState(((item as any).current ?? 0).toFixed(2));
  const [draftEmoji, setDraftEmoji] = useState((item as any).emoji ?? "💰");
  const [draftColor, setDraftColor] = useState((item as any).color ?? "#059669");

  const openEditor = () => {
    setDraftName(item.name);
    setDraftAmount(item.amount.toFixed(2));
    setDraftPaid(Boolean((item as any).paid));
    setDraftDueDay(Number((item as any).dueDay ?? 1));
    setDraftBilledOn((item as any).billedOn ?? "Monthly");
    setDraftCreditLimit(((item as any).limit ?? 0).toFixed(2));
    setDraftCreditMinPayment(((item as any).minPayment ?? 0).toFixed(2));
    setDraftCreditApr(String((item as any).apr ?? 0));
    setDraftRecurring(Boolean((item as any).recurring));
    setDraftSavingsTarget(((item as any).target ?? item.amount).toFixed(2));
    setDraftSavingsCurrent(((item as any).current ?? 0).toFixed(2));
    setDraftEmoji((item as any).emoji ?? "💰");
    setDraftColor((item as any).color ?? "#059669");
    setModalType("edit");
  };

  const closeModal = () => setModalType(null);

  const save = () => {
    const nextAmount = Number(draftAmount.replace(/[^0-9.-]+/g, "")) || 0;
    const nextName = draftName.trim() || item.name;

    if (tab === "bills") {
      onSave({ ...item, name: nextName, amount: nextAmount, paid: draftPaid, dueDay: draftDueDay, recurring: draftRecurring });
    } else if (tab === "subscriptions") {
      onSave({ ...item, name: nextName, amount: nextAmount, billedOn: draftBilledOn });
    } else if (tab === "credit") {
      const limit = Number(draftCreditLimit.replace(/[^0-9.-]+/g, "")) || 0;
      const minPayment = Number(draftCreditMinPayment.replace(/[^0-9.-]+/g, "")) || 0;
      const apr = Number(draftCreditApr.replace(/[^0-9.-]+/g, "")) || 0;
      onSave({ ...item, name: nextName, amount: nextAmount, balance: nextAmount, limit, minPayment, dueDay: draftDueDay, apr });
    } else {
      const target = Number(draftSavingsTarget.replace(/[^0-9.-]+/g, "")) || 0;
      const current = Number(draftSavingsCurrent.replace(/[^0-9.-]+/g, "")) || 0;
      onSave({ ...item, name: nextName, amount: target, target, current, emoji: draftEmoji, color: draftColor });
    }

    closeModal();
  };

  return (
    <div className="px-4 md:px-5 py-3 flex flex-col gap-2 border-b last:border-b-0 border-border">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="font-display font-medium text-navy text-sm truncate">{item.name}</span>
          {note ? <p className="text-xs text-slate mt-1">{note}</p> : null}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="font-mono-data text-sm font-semibold text-navy">{fmt(item.amount, 2)}</span>
          <button
            type="button"
            onClick={openEditor}
            className="rounded-full border border-border bg-background p-1.5 text-slate transition hover:text-navy"
            aria-label={`Edit ${item.name}`}
          >
            ✎
          </button>
          <button
            type="button"
            onClick={() => setModalType("delete")}
            className="rounded-full border border-border bg-background p-1.5 text-slate transition hover:text-crimson"
            aria-label={`Delete ${item.name}`}
          >
            🗑
          </button>
        </div>
      </div>

      {modalType === "edit" ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl bg-white p-5 shadow-2xl ring-1 ring-slate-200">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-navy">Edit {tab === "bills" ? "bill" : tab === "subscriptions" ? "subscription" : tab === "credit" ? "credit account" : "savings goal"}</p>
                <p className="text-sm text-slate">Update the details below and save your changes.</p>
              </div>
              <button type="button" onClick={closeModal} className="rounded-full border border-border bg-background px-3 py-2 text-sm font-medium text-slate">Close</button>
            </div>
            <div className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate">
                  Name
                  <input
                    value={draftName}
                    onChange={(event) => setDraftName(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-navy outline-none focus:border-navy focus:ring-2 focus:ring-navy/20"
                  />
                </label>
                <label className="block text-sm font-medium text-slate">
                  Amount
                  <input
                    value={draftAmount}
                    onChange={(event) => setDraftAmount(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-navy outline-none focus:border-navy focus:ring-2 focus:ring-navy/20"
                  />
                </label>
              </div>

              {tab === "bills" ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-slate">
                    Due day
                    <input
                      type="number"
                      min={1}
                      max={31}
                      value={draftDueDay}
                      onChange={(event) => setDraftDueDay(Number(event.target.value))}
                      className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-navy outline-none focus:border-navy focus:ring-2 focus:ring-navy/20"
                    />
                  </label>
                  <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-3 text-sm font-medium text-slate">
                      <input
                        type="checkbox"
                        checked={draftPaid}
                        onChange={(event) => setDraftPaid(event.target.checked)}
                        className="h-4 w-4 rounded border-border text-navy focus:ring-navy"
                      />
                      Mark as paid
                    </label>
                    <label className="flex items-center gap-3 text-sm font-medium text-slate">
                      <input
                        type="checkbox"
                        checked={draftRecurring}
                        onChange={(event) => setDraftRecurring(event.target.checked)}
                        className="h-4 w-4 rounded border-border text-navy focus:ring-navy"
                      />
                      Recurring payment
                    </label>
                  </div>
                </div>
              ) : tab === "subscriptions" ? (
                <label className="block text-sm font-medium text-slate">
                  Billing frequency
                  <select
                    value={draftBilledOn}
                    onChange={(event) => setDraftBilledOn(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-navy outline-none focus:border-navy focus:ring-2 focus:ring-navy/20"
                  >
                    <option>Monthly</option>
                    <option>Weekly</option>
                    <option>Quarterly</option>
                    <option>Annually</option>
                  </select>
                </label>
              ) : tab === "credit" ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-slate">
                    Credit limit
                    <input
                      value={draftCreditLimit}
                      onChange={(event) => setDraftCreditLimit(event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-navy outline-none focus:border-navy focus:ring-2 focus:ring-navy/20"
                    />
                  </label>
                  <label className="block text-sm font-medium text-slate">
                    Minimum payment
                    <input
                      value={draftCreditMinPayment}
                      onChange={(event) => setDraftCreditMinPayment(event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-navy outline-none focus:border-navy focus:ring-2 focus:ring-navy/20"
                    />
                  </label>
                  <label className="block text-sm font-medium text-slate">
                    Due day
                    <input
                      type="number"
                      min={1}
                      max={31}
                      value={draftDueDay}
                      onChange={(event) => setDraftDueDay(Number(event.target.value))}
                      className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-navy outline-none focus:border-navy focus:ring-2 focus:ring-navy/20"
                    />
                  </label>
                  <label className="block text-sm font-medium text-slate">
                    APR
                    <input
                      value={draftCreditApr}
                      onChange={(event) => setDraftCreditApr(event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-navy outline-none focus:border-navy focus:ring-2 focus:ring-navy/20"
                    />
                  </label>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-slate">
                    Target
                    <input
                      value={draftSavingsTarget}
                      onChange={(event) => setDraftSavingsTarget(event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-navy outline-none focus:border-navy focus:ring-2 focus:ring-navy/20"
                    />
                  </label>
                  <label className="block text-sm font-medium text-slate">
                    Current saved
                    <input
                      value={draftSavingsCurrent}
                      onChange={(event) => setDraftSavingsCurrent(event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-navy outline-none focus:border-navy focus:ring-2 focus:ring-navy/20"
                    />
                  </label>
                  <label className="block text-sm font-medium text-slate">
                    Emoji
                    <input
                      value={draftEmoji}
                      onChange={(event) => setDraftEmoji(event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-navy outline-none focus:border-navy focus:ring-2 focus:ring-navy/20"
                    />
                  </label>
                  <label className="block text-sm font-medium text-slate">
                    Color
                    <input
                      type="color"
                      value={draftColor}
                      onChange={(event) => setDraftColor(event.target.value)}
                      className="mt-2 h-12 w-full rounded-2xl border border-border bg-background p-2 outline-none"
                    />
                  </label>
                </div>
              )}
            </div>
            <div className="mt-6 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:justify-end">
              <button type="button" onClick={closeModal} className="rounded-2xl border border-border bg-background px-4 py-3 text-sm font-medium text-slate">Cancel</button>
              <button type="button" onClick={save} className="rounded-2xl bg-navy px-5 py-3 text-sm font-semibold text-white">Save changes</button>
            </div>
          </div>
        </div>
      ) : null}

      {modalType === "delete" ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl ring-1 ring-slate-200">
            <p className="text-lg font-semibold text-navy">Delete {tab === "bills" ? "bill" : tab === "subscriptions" ? "subscription" : tab === "credit" ? "credit account" : "savings goal"}</p>
            <p className="mt-2 text-sm text-slate">Are you sure you want to remove {item.name}? This action cannot be undone.</p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={closeModal} className="rounded-2xl border border-border bg-background px-4 py-3 text-sm font-medium text-slate">Cancel</button>
              <button type="button" onClick={() => { onDelete(item); closeModal(); }} className="rounded-2xl bg-crimson px-4 py-3 text-sm font-semibold text-white">Delete</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

type Props = {
  currentMonthLabel: string;
  selectedMonth: SelectedMonth;
  onMonthSelect: (next: SelectedMonth) => void;
};

export default function BudgetsPage({ currentMonthLabel, selectedMonth, onMonthSelect }: Props) {
  const [tab, setTab] = useState<Tab>("bills");
  const [billsData, setBillsData] = useState<Bill[]>([]);
  const [subsData, setSubsData] = useState<Subscription[]>([]);
  const [creditData, setCreditData] = useState<CreditAccount[]>([]);
  const [savingsData, setSavingsData] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newAmount, setNewAmount] = useState("0.00");
  const [newPaid, setNewPaid] = useState(false);
  const [newDueDay, setNewDueDay] = useState(1);
  const [newRecurring, setNewRecurring] = useState(false);
  const [newBilledOn, setNewBilledOn] = useState("Monthly");
  const [newCreditLimit, setNewCreditLimit] = useState("0.00");
  const [newCreditMinPayment, setNewCreditMinPayment] = useState("0.00");
  const [newCreditApr, setNewCreditApr] = useState("0");
  const [newSavingsTarget, setNewSavingsTarget] = useState("0.00");
  const [newSavingsCurrent, setNewSavingsCurrent] = useState("0.00");
  const [newEmoji, setNewEmoji] = useState("💰");
  const [newColor, setNewColor] = useState("#059669");

  useEffect(() => {
    getBudgets()
      .then((data) => {
        setBillsData(data.bills);
        setSubsData(data.subscriptions);
        setCreditData(data.credit);
        setSavingsData(data.savings);
      })
      .catch((error) => console.error("Unable to load budgets:", error))
      .finally(() => setLoading(false));
  }, []);

  const billsTotal = billsData.reduce((s, b) => s + b.amount, 0);
  const billsPending = billsData.filter((b) => !b.paid).reduce((s, b) => s + b.amount, 0);
  const subsTotal = subsData.reduce((s, sItem) => s + sItem.amount, 0);
  const creditTotal = creditData.reduce((s, c) => s + c.balance, 0);
  const savingsTotal = savingsData.reduce((s, g) => s + g.current, 0);
  const savingsTarget = savingsData.reduce((s, g) => s + g.target, 0);
  const selectedMonthLabel = new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
  }).format(new Date(selectedMonth.year, selectedMonth.month, 1));
  const isViewingCurrentMonth =
    selectedMonth.year === new Date().getFullYear() && selectedMonth.month === new Date().getMonth();
  const monthOptions = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => ({
        value: index,
        label: new Intl.DateTimeFormat("en-GB", { month: "short" }).format(new Date(2026, index, 1)),
      })),
    []
  );

  if (loading) {
    return <div className="text-slate text-sm font-display">Loading budgets…</div>;
  }

  const openAddModal = () => {
    setNewItemName("");
    setNewAmount("0.00");
    setNewPaid(false);
    setNewDueDay(1);
    setNewRecurring(false);
    setNewBilledOn("Monthly");
    setNewCreditLimit("0.00");
    setNewCreditMinPayment("0.00");
    setNewCreditApr("0");
    setNewSavingsTarget("0.00");
    setNewSavingsCurrent("0.00");
    setNewEmoji("💰");
    setNewColor("#059669");
    setShowAddModal(true);
  };

  const closeAddModal = () => setShowAddModal(false);

  const saveNewItem = async () => {
    const normalizedName = newItemName.trim() || (tab === "bills" ? "New bill" : tab === "subscriptions" ? "New subscription" : tab === "credit" ? "New credit account" : "New savings goal");
    const amount = Number(newAmount.replace(/[^0-9.-]+/g, "")) || 0;

    try {
      if (tab === "bills") {
        const payload = {
          name: normalizedName,
          amount,
          paid: newPaid,
          dueDay: newDueDay,
          recurring: newRecurring,
        };
        const created = (await postBudgetItem("bills", payload)) as Bill;
        setBillsData((prev) => [...prev, created]);
      }

      if (tab === "subscriptions") {
        const payload = {
          name: normalizedName,
          amount,
          billedOn: newBilledOn,
        };
        const created = (await postBudgetItem("subscriptions", payload)) as Subscription;
        setSubsData((prev) => [...prev, created]);
      }

      if (tab === "credit") {
        const payload = {
          name: normalizedName,
          balance: amount,
          limit: Number(newCreditLimit.replace(/[^0-9.-]+/g, "")) || 0,
          minPayment: Number(newCreditMinPayment.replace(/[^0-9.-]+/g, "")) || 0,
          dueDay: newDueDay,
          apr: Number(newCreditApr.replace(/[^0-9.-]+/g, "")) || 0,
        };
        const created = (await postBudgetItem("credit", payload)) as CreditAccount;
        setCreditData((prev) => [...prev, created]);
      }

      if (tab === "savings") {
        const payload = {
          name: normalizedName,
          target: Number(newSavingsTarget.replace(/[^0-9.-]+/g, "")) || 0,
          current: Number(newSavingsCurrent.replace(/[^0-9.-]+/g, "")) || 0,
          emoji: newEmoji,
          color: newColor,
        };
        const created = (await postBudgetItem("savings", payload)) as SavingsGoal;
        setSavingsData((prev) => [...prev, created]);
      }

      window.dispatchEvent(new CustomEvent("budgetDataChanged", { detail: { type: tab } }));
    } catch (error) {
      console.error("Unable to create budget item:", error);
    } finally {
      setShowAddModal(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 md:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display font-semibold text-navy text-lg">Monthly budget — {selectedMonthLabel}</h2>
            <p className="text-sm text-slate">Select any month in 2026 to review spending for this budget view.</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-12">
          {monthOptions.map((month) => {
            const isActive = selectedMonth.month === month.value;
            return (
              <button
                key={month.value}
                type="button"
                onClick={() => onMonthSelect({ month: month.value, year: 2026 })}
                className={`rounded-xl border px-2 py-2 text-sm font-medium transition ${
                  isActive
                    ? "border-navy bg-navy text-white"
                    : "border-border bg-background text-slate hover:border-navy hover:text-navy"
                }`}
              >
                {month.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-navy rounded-xl p-4">
          <p className="text-white/40 text-xs font-display uppercase tracking-widest">Bills Total</p>
          <p className="font-mono-data text-xl font-semibold text-white mt-1">{fmt(billsTotal)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-slate text-xs font-display uppercase tracking-widest">Still Due</p>
          <p className="font-mono-data text-xl font-semibold text-amber-600 mt-1">{fmt(billsPending)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-slate text-xs font-display uppercase tracking-widest">Subscriptions</p>
          <p className="font-mono-data text-xl font-semibold text-navy mt-1">{fmt(subsTotal, 2)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-slate text-xs font-display uppercase tracking-widest">Credit Balance</p>
          <p className="font-mono-data text-xl font-semibold text-crimson mt-1">{fmt(creditTotal, 2)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-slate text-xs font-display uppercase tracking-widest">Savings Saved</p>
          <p className="font-mono-data text-xl font-semibold text-emerald mt-1">{fmt(savingsTotal)}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2 border-b border-border sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {(["bills", "subscriptions", "credit", "savings"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-3 px-2 text-sm font-display font-medium capitalize border-b-2 transition-all ${
                tab === t ? "border-navy text-navy" : "border-transparent text-slate hover:text-navy"
              }`}
            >
              {t === "bills"
                ? "Bills"
                : t === "subscriptions"
                ? "Subscriptions"
                : t === "credit"
                ? "Credit"
                : "Savings"}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate">Click any budget to edit name or amount.</p>
      </div>

      {tab === "bills" && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 flex items-center justify-between border-b border-border">
            <button
              type="button"
              onClick={openAddModal}
              className="rounded-xl bg-navy px-3 py-2 text-xs font-semibold text-white hover:bg-slate-900"
            >
              + Add bill
            </button>
          </div>
          <div className="divide-y divide-border">
            {!isViewingCurrentMonth ? (
              <div className="px-5 py-6 text-sm text-slate">No budget entries for {selectedMonthLabel} yet.</div>
            ) : (
              billsData.map((b) => (
              <EditableBudgetRow
                key={b.id}
                item={b}
                tab="bills"
                onSave={(next) => {
                  setBillsData((prev) => prev.map((item) => (item.id === next.id ? { ...item, ...next } : item)));
                  putBudgetItem("bills", next.id, { ...next }).catch((error) => console.error("Unable to save bill:", error));
                  window.dispatchEvent(new CustomEvent("budgetDataChanged", { detail: { type: "bills" } }));
                }}
                onDelete={(item) => {
                  setBillsData((prev) => prev.filter((entry) => entry.id !== item.id));
                  deleteBudgetItem("bills", item.id)
                    .catch((error) => console.error("Unable to delete bill:", error));
                  window.dispatchEvent(new CustomEvent("budgetDataChanged", { detail: { type: "bills" } }));
                }}
                note={b.paid ? "Paid" : `Due ${b.dueDay} Jul`}
              />
              ))
            )}
          </div>
          <div className="px-5 py-4 bg-background flex items-center justify-between border-t border-border">
            <span className="font-display text-sm text-slate">Total monthly bills</span>
            <span className="font-mono-data text-base font-semibold text-navy">{fmt(billsTotal)}</span>
          </div>
        </div>
      )}

      {tab === "subscriptions" && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 flex items-center justify-between border-b border-border">
            <button
              type="button"
              onClick={openAddModal}
              className="rounded-xl bg-navy px-3 py-2 text-xs font-semibold text-white hover:bg-slate-900"
            >
              + Add subscription
            </button>
          </div>
          <div className="divide-y divide-border">
            {!isViewingCurrentMonth ? (
              <div className="px-5 py-6 text-sm text-slate">No budget entries for {selectedMonthLabel} yet.</div>
            ) : (
              subsData.map((s) => (
              <EditableBudgetRow
                key={s.id}
                item={s}
                tab="subscriptions"
                onSave={(next) => {
                  setSubsData((prev) => prev.map((item) => (item.id === next.id ? { ...item, ...next } : item)));
                  putBudgetItem("subscriptions", next.id, { ...next }).catch((error) => console.error("Unable to save subscription:", error));
                  window.dispatchEvent(new CustomEvent("budgetDataChanged", { detail: { type: "subscriptions" } }));
                }}
                onDelete={(item) => {
                  setSubsData((prev) => prev.filter((entry) => entry.id !== item.id));
                  deleteBudgetItem("subscriptions", item.id)
                    .catch((error) => console.error("Unable to delete subscription:", error));
                  window.dispatchEvent(new CustomEvent("budgetDataChanged", { detail: { type: "subscriptions" } }));
                }}
                note={s.billedOn}
              />
              ))
            )}
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

      {tab === "credit" && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 flex items-center justify-between border-b border-border">
            <button
              type="button"
              onClick={openAddModal}
              className="rounded-xl bg-navy px-3 py-2 text-xs font-semibold text-white hover:bg-slate-900"
            >
              + Add credit
            </button>
          </div>
          <div className="divide-y divide-border">
            {!isViewingCurrentMonth ? (
              <div className="px-5 py-6 text-sm text-slate">No budget entries for {selectedMonthLabel} yet.</div>
            ) : (
              creditData.map((c) => (
              <EditableBudgetRow
                key={c.id}
                item={{ ...c, amount: c.balance }}
                tab="credit"
                onSave={(next) => {
                  setCreditData((prev) =>
                    prev.map((item) =>
                      item.id === next.id ? { ...item, name: next.name, balance: next.amount } : item
                    )
                  );
                  putBudgetItem("credit", next.id, { name: next.name, balance: next.amount })
                    .catch((error) => console.error("Unable to save credit account:", error));
                  window.dispatchEvent(new CustomEvent("budgetDataChanged", { detail: { type: "credit" } }));
                }}
                onDelete={(item) => {
                  setCreditData((prev) => prev.filter((entry) => entry.id !== item.id));
                  deleteBudgetItem("credit", item.id)
                    .catch((error) => console.error("Unable to delete credit account:", error));
                  window.dispatchEvent(new CustomEvent("budgetDataChanged", { detail: { type: "credit" } }));
                }}
                note={`Due ${c.dueDay} Jul · Limit ${fmt(c.limit, 2)}`}
              />
              ))
            )}
          </div>
          <div className="px-5 py-4 bg-background flex items-center justify-between border-t border-border">
            <span className="font-display text-sm text-slate">Total credit outstanding</span>
            <span className="font-mono-data text-base font-semibold text-crimson">{fmt(creditTotal, 2)}</span>
          </div>
        </div>
      )}

      {tab === "savings" && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 flex items-center justify-between border-b border-border">
            <button
              type="button"
              onClick={openAddModal}
              className="rounded-xl bg-navy px-3 py-2 text-xs font-semibold text-white hover:bg-slate-900"
            >
              + Add savings
            </button>
          </div>
          <div className="divide-y divide-border">
            {!isViewingCurrentMonth ? (
              <div className="px-5 py-6 text-sm text-slate">No budget entries for {selectedMonthLabel} yet.</div>
            ) : (
              savingsData.map((s) => (
              <EditableBudgetRow
                key={s.id}
                item={{ ...s, amount: s.target }}
                tab="savings"
                onSave={(next) => {
                  setSavingsData((prev) =>
                    prev.map((item) =>
                      item.id === next.id ? { ...item, name: next.name, target: next.amount } : item
                    )
                  );
                  putBudgetItem("savings", next.id, { name: next.name, target: next.amount })
                    .catch((error) => console.error("Unable to save savings goal:", error));
                  window.dispatchEvent(new CustomEvent("budgetDataChanged", { detail: { type: "savings" } }));
                }}
                onDelete={(item) => {
                  setSavingsData((prev) => prev.filter((entry) => entry.id !== item.id));
                  deleteBudgetItem("savings", item.id)
                    .catch((error) => console.error("Unable to delete savings goal:", error));
                  window.dispatchEvent(new CustomEvent("budgetDataChanged", { detail: { type: "savings" } }));
                }}
                note={`Saved ${fmt(s.current)} · Target ${fmt(s.target)}`}
              />
              ))
            )}
          </div>
          <div className="px-5 py-4 bg-background flex items-center justify-between border-t border-border">
            <span className="font-display text-sm text-slate">Total savings target</span>
            <span className="font-mono-data text-base font-semibold text-emerald">{fmt(savingsTarget)}</span>
          </div>
        </div>
      )}

      {showAddModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200">
            <div className="flex items-start justify-between border-b border-border px-6 py-5">
              <div>
                <p className="text-lg font-semibold text-navy">Add {tab === "bills" ? "Bill" : tab === "subscriptions" ? "Subscription" : tab === "credit" ? "Credit" : "Savings"}</p>
                <p className="text-sm text-slate">Fill in the details and click Save to create the item.</p>
              </div>
              <button
                type="button"
                onClick={closeAddModal}
                className="rounded-full border border-border bg-background px-3 py-2 text-sm font-medium text-slate transition hover:bg-slate-100"
              >
                Close
              </button>
            </div>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void saveNewItem();
              }}
              className="space-y-5 px-6 py-6"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate">
                  Name
                  <input
                    type="text"
                    value={newItemName}
                    onChange={(event) => setNewItemName(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-navy outline-none focus:border-navy focus:ring-2 focus:ring-navy/20"
                    placeholder="e.g. Internet, Netflix, Credit Card"
                  />
                </label>

                <label className="block text-sm font-medium text-slate">
                  Amount
                  <input
                    type="text"
                    value={newAmount}
                    onChange={(event) => setNewAmount(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-navy outline-none focus:border-navy focus:ring-2 focus:ring-navy/20"
                    placeholder="0.00"
                  />
                </label>
              </div>

              {tab === "bills" ? (
                <div className="grid gap-4 sm:grid-cols-3">
                  <label className="block text-sm font-medium text-slate">
                    Due day
                    <input
                      type="number"
                      min={1}
                      max={31}
                      value={newDueDay}
                      onChange={(event) => setNewDueDay(Number(event.target.value))}
                      className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-navy outline-none focus:border-navy focus:ring-2 focus:ring-navy/20"
                    />
                  </label>
                  <label className="flex items-center gap-3 text-sm font-medium text-slate">
                    <input
                      type="checkbox"
                      checked={newPaid}
                      onChange={(event) => setNewPaid(event.target.checked)}
                      className="h-4 w-4 rounded border-border text-navy focus:ring-navy"
                    />
                    Mark as paid
                  </label>
                  <label className="flex items-center gap-3 text-sm font-medium text-slate">
                    <input
                      type="checkbox"
                      checked={newRecurring}
                      onChange={(event) => setNewRecurring(event.target.checked)}
                      className="h-4 w-4 rounded border-border text-navy focus:ring-navy"
                    />
                    Recurring payment
                  </label>
                </div>
              ) : tab === "subscriptions" ? (
                <label className="block text-sm font-medium text-slate">
                  Billing frequency
                  <select
                    value={newBilledOn}
                    onChange={(event) => setNewBilledOn(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-navy outline-none focus:border-navy focus:ring-2 focus:ring-navy/20"
                  >
                    <option>Monthly</option>
                    <option>Weekly</option>
                    <option>Quarterly</option>
                    <option>Annually</option>
                  </select>
                </label>
              ) : tab === "credit" ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-slate">
                    Credit limit
                    <input
                      type="text"
                      value={newCreditLimit}
                      onChange={(event) => setNewCreditLimit(event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-navy outline-none focus:border-navy focus:ring-2 focus:ring-navy/20"
                      placeholder="0.00"
                    />
                  </label>
                  <label className="block text-sm font-medium text-slate">
                    Minimum payment
                    <input
                      type="text"
                      value={newCreditMinPayment}
                      onChange={(event) => setNewCreditMinPayment(event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-navy outline-none focus:border-navy focus:ring-2 focus:ring-navy/20"
                      placeholder="0.00"
                    />
                  </label>
                  <label className="block text-sm font-medium text-slate">
                    Due day
                    <input
                      type="number"
                      min={1}
                      max={31}
                      value={newDueDay}
                      onChange={(event) => setNewDueDay(Number(event.target.value))}
                      className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-navy outline-none focus:border-navy focus:ring-2 focus:ring-navy/20"
                    />
                  </label>
                  <label className="block text-sm font-medium text-slate">
                    APR
                    <input
                      type="text"
                      value={newCreditApr}
                      onChange={(event) => setNewCreditApr(event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-navy outline-none focus:border-navy focus:ring-2 focus:ring-navy/20"
                      placeholder="0"
                    />
                  </label>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-slate">
                    Target
                    <input
                      type="text"
                      value={newSavingsTarget}
                      onChange={(event) => setNewSavingsTarget(event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-navy outline-none focus:border-navy focus:ring-2 focus:ring-navy/20"
                      placeholder="0.00"
                    />
                  </label>
                  <label className="block text-sm font-medium text-slate">
                    Current saved
                    <input
                      type="text"
                      value={newSavingsCurrent}
                      onChange={(event) => setNewSavingsCurrent(event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-navy outline-none focus:border-navy focus:ring-2 focus:ring-navy/20"
                      placeholder="0.00"
                    />
                  </label>
                  <label className="block text-sm font-medium text-slate">
                    Emoji
                    <input
                      type="text"
                      value={newEmoji}
                      onChange={(event) => setNewEmoji(event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-navy outline-none focus:border-navy focus:ring-2 focus:ring-navy/20"
                      placeholder="💰"
                    />
                  </label>
                  <label className="block text-sm font-medium text-slate">
                    Color
                    <input
                      type="color"
                      value={newColor}
                      onChange={(event) => setNewColor(event.target.value)}
                      className="mt-2 h-12 w-full rounded-2xl border border-border bg-background p-2 outline-none"
                    />
                  </label>
                </div>
              )}

              <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeAddModal}
                  className="rounded-2xl border border-border bg-background px-4 py-3 text-sm font-medium text-slate transition hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-navy px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-900"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
