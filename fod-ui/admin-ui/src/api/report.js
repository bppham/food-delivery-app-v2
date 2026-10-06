import authApi from "./instances/authApi";
import publicApi from "./instances/publicApi";

// REASON
export const createReason = async (data) => {
  try {
    const res = await authApi.post("/report/reason", data);
    return res.data;
  } catch (err) {
    throw err.response.data || err.response;
  }
};

export const getAllReason = async () => {
  try {
    const res = await publicApi.get("/report/reason");
    console.log(res.data);
    return res.data;
  } catch (error) {
    throw err.response.data || err.response;
  }
};

export const updateReason = async (reasonId, data) => {
  try {
    const res = await authApi.put(`/report/reason/${reasonId}`, data);
    return res.data;
  } catch (err) {
    throw err.response.data || err.response;
  }
};

export const deleteReason = async (reasonId) => {
  try {
    const res = await authApi.delete(`/report/reason/${reasonId}`);
    return res.data;
  } catch (err) {
    throw err.response.data || err.response;
  }
};

// REPORT
export const getAllReport = async (query = {}) => {
  try {
    const res = await authApi.get(`/report`, {
      params: query,
    });
    return res.data;
  } catch (err) {
    throw err.response.data || err.response;
  }
};

export const updateReportStatus = async (reportId, data) => {
  try {
    const res = await authApi.put(`/report/status/${reportId}`, data);
    return res.data;
  } catch (err) {
    throw err.response.data || err.response;
  }
};

export const getDetailReport = async (reportId) => {
  try {
    const res = await publicApi.get(`/report/${reportId}`);
    return res.data;
  } catch (err) {
    throw err.response.data || err.response;
  }
};

export const deleteReport = async (reportId) => {
  try {
    const res = await authApi.delete(`/report/${reportId}`);
    return res.data;
  } catch (err) {
    throw err.response.data || err.response;
  }
};
