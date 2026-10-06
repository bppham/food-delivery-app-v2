import publicApi from "./instances/publicApi";
import authApi from "./instances/authApi";

export const login = async (email, password) => {
  try {
    const res = await publicApi.post("/auth/login/admin", {
      email,
      password,
    });

    return res.data;
  } catch (err) {
    throw err.response.data || err.response;
  }
};

export const changePassword = async (data) => {
  try {
    const res = await authApi.put(`/auth/admin/profile/password`, data);
    return res.data;
  } catch (err) {
    throw err.response.data || err.response;
  }
};

export const forgotPassword = async (data) => {
  try {
    const res = await publicApi.post(`/auth/admin/forgot-password`, data);
    return res.data;
  } catch (err) {
    throw err.response.data || err.response;
  }
};

export const checkOTP = async (data) => {
  try {
    const res = await publicApi.post(`/auth/admin/verify-otp`, data);
    return res.data;
  } catch (err) {
    throw err.response.data || err.response;
  }
};

export const resetPasswordWithEmail = async (data) => {
  try {
    const res = await publicApi.put(`/auth/admin/reset-password`, data);
    return res.data;
  } catch (err) {
    throw err.response.data || err.response;
  }
};
