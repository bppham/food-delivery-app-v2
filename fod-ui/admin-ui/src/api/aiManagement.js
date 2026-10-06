import publicApi from "./instances/publicApi";

export const exportData = async () => {
  try {
    const res = await publicApi.post("/admin/ai/data/export");
    return res.data;
  } catch (err) {
    throw err.response.data || err.response;
  }
};

export const retrainModel = async () => {
  try {
    const res = await publicApi.post("/admin/ai/model/train");
    return res.data;
  } catch (err) {
    throw err.response.data || err.response;
  }
};

export const checkStatus = async (jobId) => {
  try {
    const res = await publicApi.post(`/admin/ai/jobs/status/${jobId}`);
    return res.data;
  } catch (err) {
    throw err.response.data || err.response;
  }
};
