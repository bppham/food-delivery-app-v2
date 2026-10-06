import authApi from "./instances/authApi";

export const getDashboardSummary = async () => {
  try {
    const res = await authApi.get("/statistics/admin/dashboard");
    return res.data;
  } catch (err) {
    throw err.response.data || err.response;
  }
};

export const getUserSummary = async () => {
  try {
    const res = await authApi.get("/statistics/admin/user");
    return res.data;
  } catch (err) {
    throw err.response.data || err.response;
  }
};

export const getStoreSummary = async () => {
  try {
    const res = await authApi.get("/statistics/admin/store");
    return res.data;
  } catch (err) {
    throw err.response.data || err.response;
  }
};

export const getShipperSummary = async () => {
  try {
    const res = await authApi.get("/statistics/admin/shipper");
    return res.data;
  } catch (err) {
    throw err.response.data || err.response;
  }
};
