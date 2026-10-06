import authApi from "./instances/authApi";

export const createShippingFee = async (data) => {
  try {
    const res = await authApi.post("/shipping-fee", data);
    return res.data;
  } catch (err) {
    throw err.response.data || err.response;
  }
};

export const getShippingFee = async () => {
  try {
    const res = await authApi.get("/shipping-fee");
    console.log(res.data);
    return res.data;
  } catch (error) {
    throw err.response.data || err.response;
  }
};

export const updateShippingFee = async (feeId, data) => {
  try {
    const res = await authApi.put(`/shipping-fee/${feeId}`, data);
    return res.data;
  } catch (err) {
    throw err.response.data || err.response;
  }
};

export const deleteShippingFee = async (feeId) => {
  try {
    const res = await authApi.delete(`/shipping-fee/${feeId}`);
    return res.data;
  } catch (err) {
    throw err.response.data || err.response;
  }
};
