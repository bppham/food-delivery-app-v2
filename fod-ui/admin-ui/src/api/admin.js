import publicApi from "./instances/publicApi";
import authApi from "./instances/authApi";

export const getAllAdmins = async (query = {}) => {
  try {
    const res = await authApi.get(`/admin`, {
      params: query,
    });
    return res.data;
  } catch (err) {
    throw err.response.data || err.response;
  }
};

export const createAdmin = async (data) => {
  try {
    const res = await authApi.post("/admin", data);
    return res.data;
  } catch (err) {
    throw err.response.data || err.response;
  }
};

export const updateAdmin = async (adminId, data) => {
  try {
    const res = await authApi.put(`/admin/${adminId}`, data);
    return res.data;
  } catch (err) {
    throw err.response.data || err.response;
  }
};

export const getAdminDetail = async (adminId) => {
  try {
    const res = await publicApi.get(`/admin/${adminId}`);
    return res.data;
  } catch (err) {
    throw err.response.data || err.response;
  }
};

export const deleteAdmin = async (adminId) => {
  try {
    const res = await authApi.delete(`/admin/${adminId}`);
    return res.data;
  } catch (err) {
    throw err.response.data || err.response;
  }
};

export const toggleStatusAdmin = async (adminId) => {
  try {
    const res = await authApi.put(`/admin/${adminId}/toggle-status`);
    return res.data;
  } catch (err) {
    throw err.response.data || err.response;
  }
};
