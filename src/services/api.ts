const apiFetch = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "API request failed");
  }

  return response.json();
};

export type Income = { cp: number; sb: number; cpName: string; sbName: string; payday: number };
export type Bill = { id: string; name: string; amount: number; paid: boolean; dueDay: number };
export type Subscription = { id: string; name: string; amount: number; billedOn: string };
export type CreditAccount = { id: string; name: string; balance: number; limit: number; minPayment: number; dueDay: number; apr: number };
export type SavingsGoal = { id: string; name: string; emoji: string; target: number; current: number; color: string };
export type Holding = { name: string; pct: number; color: string };
export type MonthlyOverviewItem = { month: string; income: number; expenses: number };

export const getOverview = () => apiFetch<{ income: Income; monthlyOverview: MonthlyOverviewItem[] }>("/api/overview");
export const getAccounts = () => apiFetch<{ bills: Bill[]; subscriptions: Subscription[]; credit: CreditAccount[]; savingsGoals: SavingsGoal[] }>("/api/accounts");
export const getBudgets = () => apiFetch<{ bills: Bill[]; subscriptions: Subscription[]; credit: CreditAccount[]; savings: SavingsGoal[] }>("/api/budgets");
export const postBudgetItem = (type: string, payload: Record<string, unknown>) => apiFetch<unknown>(`/api/budgets/${type}`, { method: "POST", body: JSON.stringify(payload) });
export const putBudgetItem = (type: string, id: string, payload: Record<string, unknown>) => apiFetch<unknown>(`/api/budgets/${type}/${id}`, { method: "PUT", body: JSON.stringify(payload) });
export const getGoals = () => apiFetch<SavingsGoal[]>("/api/goals");
export const updateGoal = (id: string, payload: Partial<SavingsGoal>) => apiFetch<SavingsGoal>(`/api/goals/${id}`, { method: "PUT", body: JSON.stringify(payload) });
