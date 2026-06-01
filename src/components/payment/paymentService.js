import api from "../axios";

// CREATE ORDER
export const createOrder = async (amount, paymentMethod = null) => {
  const response = await api.post(
    "/payment/create-order",
    {
      amount,
      paymentMethod
    }
  );

  return response.data;
};

// VERIFY PAYMENT
export const verifyPayment = async (paymentData) => {
  const response = await api.post(
    "/payment/verify",
    paymentData
  );

  return response.data;
};

// CREATE UPI PAYMENT
export const createUpiPayment = async (amount, upiId) => {
  const response = await api.post(
    "/payment/upi/create",
    {
      amount,
      upiId
    }
  );

  return response.data;
};

// CREATE QR CODE PAYMENT
export const createQrCodePayment = async (amount) => {
  const response = await api.post(
    "/payment/qr-code/create",
    {
      amount
    }
  );

  return response.data;
};

// GET PAYMENT METHODS
export const getPaymentMethods = async () => {
  const response = await api.get(
    "/payment/methods"
  );

  return response.data;
};