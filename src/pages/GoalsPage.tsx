import { useState, useEffect, type FormEvent } from "react";
import { getGoals, updateGoal, type SavingsGoal } from "../services/api";

const fmt = (n: number) =>
  "£" + n.toLocaleString("en-GB", { maximumFractionDigits: 0 });

type Goal = SavingsGoal;

type EditableGoalCardProps = {
  goal: Goal;
  onSave: (goal: Goal) => void;
};

function EditableGoalCard({ goal, onSave }: EditableGoalCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState(goal.name);
  const [current, setCurrent] = useState(goal.current.toString());
  const [target, setTarget] = useState(goal.target.toString());

  useEffect(() => {
    if (!isModalOpen) {
      setName(goal.name);
      setCurrent(goal.current.toString());
      setTarget(goal.target.toString());
    }
  }, [goal, isModalOpen]);

  const displayCurrent = Number(current) || 0;
  const displayTarget = Number(target) || 1;
  const pct = Math.round((displayCurrent / displayTarget) * 100);
  const remaining = Math.max(displayTarget - displayCurrent, 0);
  const monthsToGo = Math.ceil(remaining / 200);

  const openModal = () => {
    setName(goal.name);
    setCurrent(goal.current.toString());
    setTarget(goal.target.toString());
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setName(goal.name);
    setCurrent(goal.current.toString());
    setTarget(goal.target.toString());
    setIsModalOpen(false);
  };

  const save = () => {
    onSave({
      ...goal,
      name: name.trim() || goal.name,
      current: Number(current) || 0,
      target: Number(target) || 0,
    });
    setIsModalOpen(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    save();
  };

  return (
    <>
      <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-2xl">{goal.emoji}</span>
            <div className="min-w-0">
              <p className="font-display font-semibold text-navy text-sm truncate">{goal.name}</p>
              <p className="text-xs text-slate font-display mt-0.5">
                {remaining > 0 ? `${fmt(remaining)} to go` : "Goal reached! 🎉"}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <button
              type="button"
              onClick={openModal}
              className="rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-slate hover:bg-slate-50"
            >
              Edit
            </button>
            <span className="font-mono-data text-lg font-semibold text-navy shrink-0">{pct}%</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="h-3 bg-border rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${Math.min(pct, 100)}%`, background: goal.color }}
            />
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono-data text-slate">
            <div>
              <p className="text-slate">Saved</p>
              <p className="mt-1 font-semibold text-navy">{fmt(goal.current)}</p>
            </div>
            <div>
              <p className="text-slate">Target</p>
              <p className="mt-1 font-semibold text-navy">{fmt(goal.target)}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border text-xs text-slate">
          <div>
            <p className="font-display">Remaining</p>
            <p className="font-mono-data text-sm font-semibold text-navy mt-0.5">{fmt(remaining)}</p>
          </div>
          <div>
            <p className="font-display">Est. months</p>
            <p className="font-mono-data text-sm font-semibold text-navy mt-0.5">
              {remaining > 0 ? `~${monthsToGo} mo` : "Done"}
            </p>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/70 p-4">
          <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-display uppercase tracking-[0.3em] text-slate">Edit goal</p>
                <h3 className="mt-1 font-display font-semibold text-navy text-lg">{goal.name}</h3>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full border border-border bg-white px-2.5 py-1 text-sm text-slate"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate">Goal name</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold text-navy focus:outline-none focus:ring-2 focus:ring-navy/30"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-slate">Saved</span>
                  <input
                    value={current}
                    onChange={(event) => setCurrent(event.target.value)}
                    type="number"
                    className="w-full rounded-lg border border-border bg-background px-2 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-navy/30"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-slate">Target</span>
                  <input
                    value={target}
                    onChange={(event) => setTarget(event.target.value)}
                    type="number"
                    className="w-full rounded-lg border border-border bg-background px-2 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-navy/30"
                  />
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-slate"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={save}
                className="rounded-lg bg-navy px-3 py-2 text-sm font-semibold text-white"
              >
                Save changes
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGoals()
      .then((data) => setGoals(data))
      .catch((error) => console.error("Unable to load goals:", error))
      .finally(() => setLoading(false));
  }, []);

  const totalTarget = goals.reduce((s, g) => s + g.target, 0);
  const savingsTotal = goals.reduce((s, g) => s + g.current, 0);
  const overallPct = totalTarget ? Math.round((savingsTotal / totalTarget) * 100) : 0;

  if (loading) {
    return <div className="text-slate text-sm font-display">Loading goals…</div>;
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-display font-semibold text-navy text-lg">Savings progress towards your targets</h2>
      </div>

      {/* Overall */}
      <div className="bg-navy rounded-xl p-5 flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/40 text-xs font-display uppercase tracking-widest">Total Saved</p>
            <p className="font-mono-data text-3xl font-semibold text-white mt-1">{fmt(savingsTotal)}</p>
          </div>
          <div className="text-right">
            <p className="text-white/40 text-xs font-display uppercase tracking-widest">Target</p>
            <p className="font-mono-data text-xl font-semibold text-white/60 mt-1">{fmt(totalTarget)}</p>
          </div>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-emerald rounded-full" style={{ width: `${overallPct}%` }} />
        </div>
        <p className="text-white/40 text-xs font-mono-data">{overallPct}% of combined targets · {fmt(totalTarget - savingsTotal)} to go</p>
      </div>

      {/* Individual goals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((g) => (
          <EditableGoalCard
            key={g.id}
            goal={g}
            onSave={(next) => {
              setGoals((prev) => prev.map((goal) => (goal.id === next.id ? next : goal)));
              updateGoal(next.id, next).catch((error) => console.error("Unable to save goal:", error));
            }}
          />
        ))}
      </div>
    </div>
  );
}
