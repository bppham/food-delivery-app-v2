import authApi from "./instances/authApi";

export const createSystemCategory = async (name, image) => {
  try {
    const res = await authApi.post("/system-categories", {
      name,
      image,
    });

    return res.data;
  } catch (error) {
    throw err.response.data || err.response;
  }
};

export const getSystemCategories = async () => {
  try {
    const res = await authApi.get("/system-categories/count");
    return res.data;
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
