import publicApi from "./instances/publicApi";

export const uploadImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append("files", file);

    const res = await publicApi.post(`/upload/images`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data.data[0];
  } catch (error) {
    throw {
      status: err.response?.status,
      message: err.response?.data?.message || "Lỗi upload ảnh",
    };
  }
};
