import authApi from "./instances/authApi";

export const getAllStoreRequest = async (
  status,
  page = 1,
  limit = 5,
  search = "",
  sort = "name_asc"
) => {
  try {
    const res = await authApi.get(`/store/status/${status}`, {
      params: { page, limit, search, sort },
    });
    return res.data;
  } catch (error) {
    throw err.response.data || err.response;
  }
};

export const getInformation = async (storeId) => {
  try {
    const res = await authApi.get(`/store/${storeId}/detail`);
    return res.data;
  } catch (error) {
    throw err.response.data || err.response;
  }
};
export const approveStore = async (id) => {
  try {
    const response = await authApi.put(`/store/${id}/approve`);
    return response.data;
  } catch (error) {
    throw err.response.data || err.response;
  }
};

export const blockStore = async (id) => {
  try {
    const response = await authApi.put(`/store/${id}/block`);
    return response.data;
  } catch (error) {
    throw err.response.data || err.response;
  }
};

export const unblockStore = async (id) => {
  try {
    const response = await authApi.put(`/store/${id}/unblock`);
    return response.data;
  } catch (error) {
    throw err.response.data || err.response;
  }
};

export const updateSystemCategory = async (id, name, image) => {
  try {
    const response = await authApi.put(`/system-categories/${id}`, {
      name,
      image,
    });

    return response.data;
  } catch (error) {
    throw err.response.data || err.response;
  }
};

export const deleteSystemCategory = async (id) => {
  if (!id) {
    throw new Error("ID is missing");
  }

  try {
    const response = await authApi.delete(`/system-categories/${id}`);

    return response.data;
  } catch (error) {
    throw err.response.data || err.response;
  }
};
