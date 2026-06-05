import api from "../components/axios";

export const updateCustomerDisplay = async (payload) => {
  const response = await api.post(
    "/customer-display/update",
    payload
  );

  return response.data;
};

export const clearCustomerDisplay = async (
  branchId
) => {
  const response = await api.delete(
    `/customer-display/clear/${branchId}`
  );

  return response.data;
};