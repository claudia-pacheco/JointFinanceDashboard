import express from "express";
import cors from "cors";
import fs from "node:fs/promises";
import path from "node:path";

const app = express();
const port = process.env.PORT || 4000;
const storeFile = path.resolve(path.dirname(new URL(import.meta.url).pathname), "store.json");

let store = await loadStore();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({ ok: true, message: "Backend API is running" });
});

app.get("/api/status", (req, res) => {
    res.json({ ok: true });
});

app.get("/api/overview", (req, res) => {
    res.json({ income: store.income, monthlyOverview: store.monthlyOverview });
});

app.get("/api/accounts", (req, res) => {
    res.json({
        bills: store.bills,
        subscriptions: store.subscriptions,
        credit: store.credit,
        savingsGoals: store.savingsGoals,
    });
});

app.get("/api/budgets", (req, res) => {
    res.json({
        bills: store.bills,
        subscriptions: store.subscriptions,
        credit: store.credit,
        savings: store.savingsGoals,
    });
});

app.get("/api/budgets/:type", (req, res) => {
    const { type } = req.params;

    if (!isBudgetType(type)) {
        return res.status(400).json({ error: "Invalid budget type" });
    }

    const storeKey = getStoreKey(type);
    res.json(store[storeKey]);
});

app.post("/api/budgets/:type", async (req, res) => {
    const { type } = req.params;
    const payload = req.body;

    if (!isBudgetType(type)) {
        return res.status(400).json({ error: "Invalid budget type" });
    }

    const storeKey = getStoreKey(type);
    const item = createBudgetItem(type, payload);
    store[storeKey] = [...store[storeKey], item];
    await persistStore();
    res.status(201).json(item);
});

app.delete("/api/budgets/:type/:id", async (req, res) => {
    const { type, id } = req.params;

    if (!isBudgetType(type)) {
        return res.status(400).json({ error: "Invalid budget type" });
    }

    const storeKey = getStoreKey(type);
    const list = store[storeKey];
    const index = list.findIndex((item) => item.id === id);

    if (index === -1) {
        return res.status(404).json({ error: "Item not found" });
    }

    const deletedItem = list[index];
    store[storeKey] = list.filter((item) => item.id !== id);
    await persistStore();
    res.json(deletedItem);
});

app.put("/api/budgets/:type/:id", async (req, res) => {
    const { type, id } = req.params;
    const payload = req.body;

    if (!isBudgetType(type)) {
        return res.status(400).json({ error: "Invalid budget type" });
    }

    const storeKey = getStoreKey(type);
    const list = store[storeKey];
    const index = list.findIndex((item) => item.id === id);
    if (index === -1) {
        return res.status(404).json({ error: "Item not found" });
    }

    store[storeKey][index] = { ...list[index], ...payload };
    await persistStore();
    res.json(store[storeKey][index]);
});

app.get("/api/goals", (req, res) => {
    res.json(store.savingsGoals);
});

app.put("/api/goals/:id", async (req, res) => {
    const { id } = req.params;
    const payload = req.body;

    const index = store.savingsGoals.findIndex((goal) => goal.id === id);
    if (index === -1) {
        return res.status(404).json({ error: "Goal not found" });
    }

    store.savingsGoals[index] = { ...store.savingsGoals[index], ...payload };
    await persistStore();
    res.json(store.savingsGoals[index]);
});

app.listen(port, () => {
    console.log(`Backend API running on http://localhost:${port}`);
});

async function loadStore() {
    const raw = await fs.readFile(storeFile, "utf8");
    return JSON.parse(raw);
}

async function persistStore() {
    await fs.writeFile(storeFile, JSON.stringify(store, null, 2));
}

function isBudgetType(type) {
    return ["bills", "subscriptions", "credit", "savings"].includes(type);
}

function getStoreKey(type) {
    return type === "savings" ? "savingsGoals" : type;
}

function createBudgetItem(type, payload) {
    const idBase = `${type}-${Date.now()}`;
    if (type === "bills") {
        return {
            id: idBase,
            name: payload.name ?? "New bill",
            amount: payload.amount ?? 0,
            paid: payload.paid ?? false,
            dueDay: payload.dueDay ?? 1,
        };
    }

    if (type === "subscriptions") {
        return {
            id: idBase,
            name: payload.name ?? "New subscription",
            amount: payload.amount ?? 0,
            billedOn: payload.billedOn ?? "Monthly",
        };
    }

    if (type === "credit") {
        return {
            id: idBase,
            name: payload.name ?? "New credit account",
            balance: payload.balance ?? 0,
            limit: payload.limit ?? 0,
            minPayment: payload.minPayment ?? 0,
            dueDay: payload.dueDay ?? 1,
            apr: payload.apr ?? 0,
        };
    }

    return {
        id: idBase,
        name: payload.name ?? "New savings goal",
        emoji: payload.emoji ?? "💰",
        target: payload.target ?? 0,
        current: payload.current ?? 0,
        color: payload.color ?? "#059669",
    };
}
