import api from "../components/axios";

export async function getUsers() {
  const response = await api.get("/users");
  return response.data;
}

export async function createUser(payload) {
  const response = await api.post("/users/register", payload);
  return response.data;
}

export async function updateUser(id, payload) {
  const response = await api.put(`/users/${id}`, payload);
  return response.data;
}

export async function deleteUser(id) {
  const response = await api.delete(`/users/${id}`);
  return response.data;
}

export async function getBranches() {
  const response = await api.get("/branches/all");
  return response.data;
}
