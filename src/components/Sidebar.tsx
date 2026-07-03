type Page = "overview" | "accounts" | "transactions" | "budgets" | "investments" | "goals" | "settings";

type NavItem = { label: string; icon: string; id: Page };

const navItems: NavItem[] = [
  { label: "Overview",     icon: "◈", id: "overview"     },
  { label: "Accounts",     icon: "◻", id: "accounts"     },
  { label: "Transactions", icon: "≡", id: "transactions" },
  { label: "Budgets",      icon: "◫", id: "budgets"      },
  { label: "Investments",  icon: "△", id: "investments"  },
  { label: "Goals",        icon: "◎", id: "goals"        },
];

type SidebarProps = {
  active: Page;
  onNavigate: (page: Page) => void;
  onClose?: () => void;
  names: { cp: string; sb: string };
};

export type { Page };

export default function Sidebar({ active, onNavigate, onClose, names }: SidebarProps) {
  const go = (page: Page) => {
    onNavigate(page);
    onClose?.();
  };

  return (
    <aside className="w-56 h-full bg-navy flex flex-col">
      <div className="px-6 py-7 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-emerald rounded-sm flex items-center justify-center">
            <span className="text-white text-xs font-bold font-display">F</span>
          </div>
          <span className="font-display font-semibold text-white text-base tracking-tight">Folio</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors md:hidden">
            ✕
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-5 space-y-0.5">
        {navItems.map((item) => {
          const isActive = item.id === active;
          return (
            <button
              key={item.id}
              onClick={() => go(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all cursor-pointer ${
                isActive
                  ? "bg-white/10 text-white font-medium"
                  : "text-white/50 hover:text-white/80 hover:bg-white/5"
              }`}
            >
              <span className="text-base w-4 text-center">{item.icon}</span>
              <span className="font-display">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-white/10 space-y-2">
        <button
          onClick={() => go("settings")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all cursor-pointer ${
            active === "settings"
              ? "bg-white/10 text-white font-medium"
              : "text-white/50 hover:text-white/80 hover:bg-white/5"
          }`}
        >
          <span className="text-base w-4 text-center">⚙</span>
          <span className="font-display">Settings</span>
        </button>

        <div className="flex items-center gap-2.5 px-1 pt-1">
          <div className="flex -space-x-1.5">
            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center ring-1 ring-navy">
              <span className="text-white text-xs font-semibold font-display">{names.cp.slice(0,2).toUpperCase()}</span>
            </div>
            <div className="w-7 h-7 rounded-full bg-emerald/30 flex items-center justify-center ring-1 ring-navy">
              <span className="text-emerald text-xs font-semibold font-display">{names.sb.slice(0,2).toUpperCase()}</span>
            </div>
          </div>
          <div>
            <p className="text-white text-xs font-medium font-display">Joint Account</p>
            <p className="text-white/30 text-xs font-display">{names.cp} & {names.sb}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
