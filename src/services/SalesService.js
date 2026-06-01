import api from "../components/axios";

// Get all sales items
export async function getSalesItems(branchid = null) {
  const response = await api.get("/salesitem/all", {
    params: { branchid }
  });
  return response.data;
}

// Register new sale
export async function createSale(payload) {
  const response = await api.post("/salesitem/register", payload);
  return response.data;
}

// Close register
export async function closeRegister(branchId) {
  const response = await api.post(`/salesitem/closeregister/${branchId}`);
  return response.data;
}

// Get sales by bill number
export async function getSalesByBillNo(billno, branchid = null) {
  const response = await api.get(`/salesitem/bill/${billno}`, {
    params: { branchid }
  });
  return response.data;
}

// Get sale by id
export async function getSaleById(id) {
  const response = await api.get(`/salesitem/${id}`);
  return response.data;
}

// Update sale
export async function updateSale(id, payload) {
  const response = await api.put(`/salesitem/${id}`, payload);
  return response.data;
}

// Delete sale
export async function deleteSale(id) {
  const response = await api.delete(`/salesitem/${id}`);
  return response.data;
}

// Sales report
export async function getSalesReport(branchid = null) {
  const response = await api.get("/salesitem/report", {
    params: { branchid }
  });
  return response.data;
}