import api from "../components/axios";

export async function getProducts() {
  const response = await api.get("/product/all");
  return response.data;
}

export async function createProduct(payload) {
  const response = await api.post("/product/register", payload);
  return response.data;
}

export async function updateProduct(id, payload) {
  const response = await api.put(`/product/${id}`, payload);
  return response.data;
}

export async function deleteProduct(id) {
  const response = await api.delete(`/product/${id}`);
  return response.data;
}

export async function getCategories() {
  const response = await api.get("/itemcategory/all");
  return response.data;
}

export async function createCategory(payload) {
  const response = await api.post("/itemcategory/register", payload);
  return response.data;
}