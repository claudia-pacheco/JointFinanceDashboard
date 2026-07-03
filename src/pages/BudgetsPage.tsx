import { useEffect, useState } from "react";
import {
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

type BudgetItem = { id: string; name: string; amount: number; [key: string]: any };

type BudgetData = {
  bills: Bill[];
  subscriptions: Subscription[];
  credit: CreditAccount[];
  savings: SavingsGoal[];
};

type EditableBudgetRowProps<T extends BudgetItem> = {
  item: T;
  onSave: (item: T) => void;
  note?: string;
};

function EditableBudgetRow<T extends BudgetItem>({ item, onSave, note }: EditableBudgetRowProps<T>) {
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(item.name);
  const [draftAmount, setDraftAmount] = useState(item.amount.toFixed(2));

  const cancel = () => {
    setDraftName(item.name);
    setDraftAmount(item.amount.toFixed(2));
    setEditing(false);
  };

  const save = () => {
    const nextAmount = Number(draftAmount.replace(/[^0-9.-]+/g, "")) || 0;
    onSave({ ...item, name: draftName.trim() || item.name, amount: nextAmount });
    setEditing(false);
  };

  return (
    <div className="px-4 md:px-5 py-3 flex flex-col gap-2 border-b last:border-b-0 border-border">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-left min-w-0"
          >
            {editing ? (
              <input
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-navy/30"
              />
            ) : (
              <span className="font-display font-medium text-navy text-sm truncate">{item.name}</span>
            )}
          </button>
          {note ? <p className="text-xs text-slate mt-1">{note}</p> : null}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {editing ? (
            <div className="flex items-center gap-2">
              <input
                value={draftAmount}
                onChange={(event) => setDraftAmount(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && save()}
                className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-right text-sm text-navy focus:outline-none focus:ring-2 focus:ring-navy/30"
              />
              <button
                type="button"
                onClick={save}
                className="rounded-lg bg-navy px-3 py-1 text-xs font-semibold text-white"
              >
                Save
              </button>
              <button
                type="button"
                onClick={cancel}
                className="rounded-lg border border-border bg-white px-3 py-1 text-xs font-medium text-slate"
              >
                Cancel
              </button>
            </div>
          ) : (
            <span className="font-mono-data text-sm font-semibold text-navy">{fmt(item.amount, 2)}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BudgetsPage() {
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

  if (loading) {
    return <div className="text-slate text-sm font-display">Loading budgets…</div>;
  }

  const openAddModal = () => {
    setNewItemName("");
    setNewAmount("0.00");
    setNewPaid(false);
    setNewDueDay(1);
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
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display font-semibold text-navy text-lg">Budgets</h2>
          <p className="text-slate text-sm font-display mt-0.5">Monthly budgets — July 2026</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center rounded-xl bg-navy px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-900"
        >
          + Add new expense
        </button>
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
        <p className="text-xs text-slate">Click any budget to edit its name or amount.</p>
      </div>

      {tab === "bills" && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 flex items-center justify-between border-b border-border">
            <div>
              <p className="text-sm font-display font-semibold text-navy">Bills</p>
              <p className="text-xs text-slate font-display">Add a new bill to the database</p>
            </div>
            <button
              type="button"
              onClick={openAddModal}
              className="rounded-xl bg-navy px-3 py-2 text-xs font-semibold text-white hover:bg-slate-900"
            >
              + Add bill
            </button>
          </div>
          <div className="divide-y divide-border">
            {billsData.map((b) => (
              <EditableBudgetRow
                key={b.id}
                item={b}
                onSave={(next) => {
                  setBillsData((prev) => prev.map((item) => (item.id === next.id ? next : item)));
                  putBudgetItem("bills", next.id, next).catch((error) => console.error("Unable to save bill:", error));
                }}
                note={b.paid ? "Paid" : `Due ${b.dueDay} Jul`}
              />
            ))}
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
            <div>
              <p className="text-sm font-display font-semibold text-navy">Subscriptions</p>
              <p className="text-xs text-slate font-display">Add a new subscription expense</p>
            </div>
            <button
              type="button"
              onClick={openAddModal}
              className="rounded-xl bg-navy px-3 py-2 text-xs font-semibold text-white hover:bg-slate-900"
            >
              + Add subscription
            </button>
          </div>
          <div className="divide-y divide-border">
            {subsData.map((s) => (
              <EditableBudgetRow
                key={s.id}
                item={s}
                onSave={(next) => {
                  setSubsData((prev) => prev.map((item) => (item.id === next.id ? next : item)));
                  putBudgetItem("subscriptions", next.id, next).catch((error) => console.error("Unable to save subscription:", error));
                }}
                note={s.billedOn}
              />
            ))}
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
            <div>
              <p className="text-sm font-display font-semibold text-navy">Credit</p>
              <p className="text-xs text-slate font-display">Add a new credit account or expense</p>
            </div>
            <button
              type="button"
              onClick={openAddModal}
              className="rounded-xl bg-navy px-3 py-2 text-xs font-semibold text-white hover:bg-slate-900"
            >
              + Add credit
            </button>
          </div>
          <div className="divide-y divide-border">
            {creditData.map((c) => (
              <EditableBudgetRow
                key={c.id}
                item={{ ...c, amount: c.balance }}
                onSave={(next) =>
                  setCreditData((prev) =>
                    prev.map((item) =>
                      item.id === next.id ? { ...item, name: next.name, balance: next.amount } : item
                    )
                  )
                }
                note={`Due ${c.dueDay} Jul · Limit ${fmt(c.limit, 2)}`}
              />
            ))}
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
            <div>
              <p className="text-sm font-display font-semibold text-navy">Savings</p>
              <p className="text-xs text-slate font-display">Add a new savings goal expense</p>
            </div>
            <button
              type="button"
              onClick={openAddModal}
              className="rounded-xl bg-navy px-3 py-2 text-xs font-semibold text-white hover:bg-slate-900"
            >
              + Add savings
            </button>
          </div>
          <div className="divide-y divide-border">
            {savingsData.map((s) => (
              <EditableBudgetRow
                key={s.id}
                item={{ ...s, amount: s.target }}
                onSave={(next) =>
                  setSavingsData((prev) =>
                    prev.map((item) =>
                      item.id === next.id ? { ...item, name: next.name, target: next.amount } : item
                    )
                  )
                }
                note={`Saved ${fmt(s.current)} · Target ${fmt(s.target)}`}
              />
            ))}
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
                saveNewItem();
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
