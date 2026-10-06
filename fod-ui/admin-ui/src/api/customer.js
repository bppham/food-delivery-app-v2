import authApi from "./instances/authApi";

export const getAllCustomer = async (query = {}) => {
  try {
    const res = await authApi.get(`/user/all`, {
      params: query,
    });
    return res.data;
  } catch (err) {
    throw err.response.data || err.response;
  }
};

export const toggleStatusCustomer = async (userId) => {
  try {
    const res = await authApi.put(`/user/${userId}/toggle-status`);
    return res.data;
  } catch (err) {
    throw err.response.data || err.response;
  }
};
