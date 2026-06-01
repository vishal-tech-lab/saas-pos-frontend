import api from '../components/axios';

function unwrapResponse(res) {
  return res.data?.data ?? res.data;
}

async function getSummary() {
  const res = await api.get('/dashboard/summary');
  return unwrapResponse(res);
}

async function getSalesChart(days) {
  const res = await api.get(`/dashboard/sales-chart?days=${days}`);
  return unwrapResponse(res);
}

async function getTopProducts() {
  const res = await api.get('/dashboard/top-products');
  return unwrapResponse(res);
}

async function getStockStatus() {
  const res = await api.get('/dashboard/stock-status');
  return unwrapResponse(res);
}

async function getProfitLoss(days) {
  const res = await api.get(`/dashboard/profit-loss?days=${days}`);
  return unwrapResponse(res);
}

async function get7DayExpenses() {
  const res = await api.get('/dashboard/expenses/7days');
  return unwrapResponse(res);
}

async function get30DayExpenses() {
  const res = await api.get('/dashboard/expenses/30days');
  return unwrapResponse(res);
}

export default {
  getSummary,
  getSalesChart,
  getTopProducts,
  getStockStatus,
  getProfitLoss,
  get7DayExpenses,
  get30DayExpenses,
};