import api from "../components/axios";

// ── Expense Category ──────────────────────────────────────
export async function getExpenseCategories() {
  const response = await api.get("/expcatgory/all");
  return response.data;
}

export async function createExpenseCategory(payload) {
  const response = await api.post("/expcatgory/register", payload);
  return response.data;
}

export async function updateExpenseCategory(id, payload) {
  const response = await api.put(`/expcatgory/update/${id}`, payload);
  return response.data;
}

export async function deleteExpenseCategory(id) {
  const response = await api.delete(`/expcatgory/delete/${id}`);
  return response.data;
}

// ── Expense ───────────────────────────────────────────────
export async function getExpenses() {
  const response = await api.get("/expense/all");
  return response.data;
}

export async function getExpensesByDate(date) {
  const response = await api.get(`/expense/date/${date}`);
  return response.data;
}

export async function createExpense(payload) {
  const response = await api.post("/expense/register", payload);
  return response.data;
}

export async function updateExpense(id, payload) {
  const response = await api.put(`/expense/update/${id}`, payload);
  return response.data;
}

export async function deleteExpense(id) {
  const response = await api.delete(`/expense/delete/${id}`);
  return response.data;
}