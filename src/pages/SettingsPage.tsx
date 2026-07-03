import { useState } from "react";

type Income = { cp: number; sb: number; cpName: string; sbName: string; payday: number };

type Props = {
  income: Income;
  onSave: (income: Income) => void;
};

export default function SettingsPage({ income, onSave }: Props) {
  const [form, setForm] = useState<Income>(income);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const total = (form.cp || 0) + (form.sb || 0);

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      <div>
        <h2 className="font-display font-semibold text-navy text-lg">Settings</h2>
        <p className="text-slate text-sm font-display mt-0.5">Manage your account details</p>
      </div>

      {/* Income section */}
      <section className="bg-card border border-border rounded-xl p-5 flex flex-col gap-5">
        <div className="border-b border-border pb-4">
          <p className="font-display font-semibold text-navy">Monthly Income</p>
          <p className="text-sm text-slate font-display mt-0.5">Update how much each person earns per month after tax</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Person 1 */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-navy flex items-center justify-center">
                <span className="text-white text-xs font-bold font-display">
                  {form.cpName ? form.cpName.slice(0, 2).toUpperCase() : "P1"}
                </span>
              </div>
              <label className="text-sm font-display font-medium text-navy">Person 1</label>
            </div>
            <div>
              <label className="text-xs text-slate font-display block mb-1">Name</label>
              <input
                type="text"
                value={form.cpName}
                onChange={(e) => setForm({ ...form, cpName: e.target.value })}
                placeholder="e.g. Carmen"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-display text-navy placeholder:text-slate focus:outline-none focus:border-navy/40"
              />
            </div>
            <div>
              <label className="text-xs text-slate font-display block mb-1">Monthly take-home pay</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate font-mono-data text-sm">£</span>
                <input
                  type="number"
                  value={form.cp || ""}
                  onChange={(e) => setForm({ ...form, cp: Number(e.target.value) })}
                  placeholder="0"
                  className="w-full bg-background border border-border rounded-lg pl-7 pr-3 py-2 text-sm font-mono-data text-navy placeholder:text-slate focus:outline-none focus:border-navy/40"
                />
              </div>
            </div>
          </div>

          {/* Person 2 */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-emerald flex items-center justify-center">
                <span className="text-white text-xs font-bold font-display">
                  {form.sbName ? form.sbName.slice(0, 2).toUpperCase() : "P2"}
                </span>
              </div>
              <label className="text-sm font-display font-medium text-navy">Person 2</label>
            </div>
            <div>
              <label className="text-xs text-slate font-display block mb-1">Name</label>
              <input
                type="text"
                value={form.sbName}
                onChange={(e) => setForm({ ...form, sbName: e.target.value })}
                placeholder="e.g. Sergio"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-display text-navy placeholder:text-slate focus:outline-none focus:border-navy/40"
              />
            </div>
            <div>
              <label className="text-xs text-slate font-display block mb-1">Monthly take-home pay</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate font-mono-data text-sm">£</span>
                <input
                  type="number"
                  value={form.sb || ""}
                  onChange={(e) => setForm({ ...form, sb: Number(e.target.value) })}
                  placeholder="0"
                  className="w-full bg-background border border-border rounded-lg pl-7 pr-3 py-2 text-sm font-mono-data text-navy placeholder:text-slate focus:outline-none focus:border-navy/40"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Total preview */}
        <div className="flex items-center justify-between bg-background rounded-lg px-4 py-3">
          <span className="text-sm font-display text-slate">Combined monthly income</span>
          <span className="font-mono-data text-lg font-semibold text-navy">
            £{total.toLocaleString("en-GB")}
          </span>
        </div>
      </section>

      {/* Payday section */}
      <section className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4">
        <div className="border-b border-border pb-4">
          <p className="font-display font-semibold text-navy">Payday</p>
          <p className="text-sm text-slate font-display mt-0.5">Which day of the month does pay land?</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {[1, 5, 10, 15, 20, 25, 28, 30].map((day) => (
            <button
              key={day}
              onClick={() => setForm({ ...form, payday: day })}
              className={`w-12 h-12 rounded-lg text-sm font-mono-data font-semibold transition-all cursor-pointer ${
                form.payday === day
                  ? "bg-navy text-white"
                  : "bg-background border border-border text-navy hover:border-navy/30"
              }`}
            >
              {day}
            </button>
          ))}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate font-display">or enter:</span>
            <input
              type="number"
              min={1}
              max={31}
              value={form.payday || ""}
              onChange={(e) => setForm({ ...form, payday: Number(e.target.value) })}
              className="w-16 h-12 text-center bg-background border border-border rounded-lg text-sm font-mono-data text-navy focus:outline-none focus:border-navy/40"
            />
          </div>
        </div>
        {form.payday > 0 && (
          <p className="text-xs text-slate font-display">
            Pay arrives on the <strong className="text-navy">{form.payday}{ordinal(form.payday)}</strong> of each month
          </p>
        )}
      </section>

      {/* Save */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          className="bg-navy text-white font-display font-medium text-sm px-5 py-2.5 rounded-lg hover:bg-navy/90 transition-colors cursor-pointer"
        >
          {saved ? "✓ Saved!" : "Save changes"}
        </button>
        {saved && <span className="text-sm text-emerald font-display">Changes applied across the dashboard</span>}
      </div>
    </div>
  );
}

function ordinal(n: number) {
  if (n >= 11 && n <= 13) return "th";
  switch (n % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
}
