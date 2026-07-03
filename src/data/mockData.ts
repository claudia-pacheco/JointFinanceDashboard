// ── Pots ──────────────────────────────────────────────────────────────────

export const bills = [
  { id: "rent",    name: "Rent",          amount: 1350, paid: true,  dueDay: 1  },
  { id: "comfam",  name: "Comida Familia", amount: 280,  paid: true,  dueDay: 3  },
  { id: "comida",  name: "Comida",         amount: 220,  paid: false, dueDay: 8  },
  { id: "transp",  name: "Transporte",     amount: 180,  paid: true,  dueDay: 4  },
  { id: "ee",      name: "EE",             amount: 32,   paid: true,  dueDay: 5  },
  { id: "o2",      name: "O2",             amount: 26,   paid: true,  dueDay: 5  },
  { id: "wifi",    name: "Wi-Fi",          amount: 28,   paid: false, dueDay: 10 },
];

export const subscriptions = [
  { id: "gym",    name: "Gym Better",   amount: 29.99, billedOn: "Monthly"  },
  { id: "netflix",name: "Netflix",      amount: 17.99, billedOn: "Monthly"  },
  { id: "amusic", name: "Apple Music",  amount: 10.99, billedOn: "Monthly"  },
  { id: "spot",   name: "Spotify",      amount: 10.99, billedOn: "Monthly"  },
  { id: "icloud", name: "iCloud",       amount: 2.99,  billedOn: "Monthly"  },
];

export const credit = [
  { id: "paypal",  name: "PayPal Credit", balance: 340.00, limit: 1000, minPayment: 25,  dueDay: 14, apr: 21.9 },
  { id: "klarna",  name: "Klarna",        balance: 186.50, limit: 600,  minPayment: 62.17, dueDay: 20, apr: 0    },
  { id: "gold",    name: "Gold",          balance: 1600.00, limit: 2000, minPayment: 48, dueDay: 18, apr: 23.5 },
  { id: "cc",      name: "Credit Card",   balance: 724.30, limit: 3000, minPayment: 36,  dueDay: 22, apr: 23.9 },
];

export const savingsGoals = [
  { id: "casa",      name: "Casa",       emoji: "🏠", target: 25000, current: 8450,  color: "#0F172A" },
  { id: "coche",     name: "Coche",      emoji: "🚗", target: 8000,  current: 2100,  color: "#059669" },
  { id: "emerg",     name: "Emergencia", emoji: "🛡️", target: 5000,  current: 3200,  color: "#D97706" },
  { id: "claudia",   name: "Claudia",    emoji: "⭐", target: 5000,  current: 1840,  color: "#7C3AED" },
  { id: "samu",      name: "Samu",       emoji: "⭐", target: 5000,  current: 1420,  color: "#0EA5E9" },
  { id: "savings",   name: "Savings",    emoji: "💰", target: 10000, current: 4320,  color: "#059669" },
];

// ── Derived totals ─────────────────────────────────────────────────────────

export const billsTotal   = bills.reduce((s, b) => s + b.amount, 0);
export const subsTotal    = subscriptions.reduce((s, b) => s + b.amount, 0);
export const creditTotal  = credit.reduce((s, c) => s + c.balance, 0);
export const savingsTotal = savingsGoals.reduce((s, g) => s + g.current, 0);

export const monthlyIncome = 4800;
export const monthlyOut    = billsTotal + subsTotal;
export const savingsRate   = Math.round(((monthlyIncome - monthlyOut) / monthlyIncome) * 100);

export const netWorth =
  savingsTotal - creditTotal + 12840; // joint current account balance

// ── Cash flow chart ────────────────────────────────────────────────────────

export const monthlyOverview = [
  { month: "Jan", income: 4800, expenses: 2310 },
  { month: "Feb", income: 4800, expenses: 2180 },
  { month: "Mar", income: 4800, expenses: 2490 },
  { month: "Apr", income: 4800, expenses: 2250 },
  { month: "May", income: 4800, expenses: 2340 },
  { month: "Jun", income: 4800, expenses: monthlyOut },
];
