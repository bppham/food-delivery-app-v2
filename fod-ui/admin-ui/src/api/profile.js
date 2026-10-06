import authApi from "./instances/authApi";

export const getProfile = async () => {
  try {
    const res = await authApi.get(`/auth/admin/profile`);
    return res.data;
  } catch (err) {
    throw err.response.data || err.response;
  }
};

export const updateProfileInfo = async (data) => {
  try {
    const res = await authApi.put(`/auth/admin/profile/info`, data);
    return res.data;
  } catch (err) {
    throw err.response.data || err.response;
  }
};

export const checkCurrentPassword = async (data) => {
  try {
    const res = await authApi.post(
      `/auth/admin/profile/check-current-password`,
      data
    );
    return res.data;
  } catch (err) {
    throw err.response.data || err.response;
  }
};
