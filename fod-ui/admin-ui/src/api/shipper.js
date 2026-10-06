import authApi from "./instances/authApi";

export const getRequests = async (
  page = 1,
  limit = 5,
  search = "",
  sort = "createdAt_desc"
) => {
  try {
    const res = await authApi.get(`/shipper/request/`, {
      params: { page, limit, search, sort },
    });
    return res.data;
  } catch (error) {
    throw err.response.data || err.response;
  }
};

export const approveShipper = async (id) => {
  try {
    const response = await authApi.put(`/shipper/${id}/approve`);
    return response.data;
  } catch (error) {
    throw err.response.data || err.response;
  }
};

export const getAllShippers = async (query = {}) => {
  try {
    const res = await authApi.get(`/shipper/all`, {
      params: query,
    });
    return res.data;
  } catch (err) {
    throw err.response.data || err.response;
  }
};

export const toggleStatusShipper = async (shipperId) => {
  try {
    const res = await authApi.put(`/shipper/${shipperId}/toggle-status`);
    return res.data;
  } catch (err) {
    throw err.response.data || err.response;
  }
};
