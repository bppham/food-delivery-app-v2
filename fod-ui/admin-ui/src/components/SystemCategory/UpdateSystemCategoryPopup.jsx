import { useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { uploadImage } from "../../api/upload";
import { updateSystemCategory } from "../../api/systemCategory";
import { getErrorMessage } from "../../../data/errorMessages";
const UpdateSystemCategoryPopup = ({
  selectedCategory,
  onClose,
  onSystemCategoryUpdated,
}) => {
  const [systemCategory, setSystemCategory] = useState({
    _id: selectedCategory._id,
    name: selectedCategory.name,
    image: null,
    preview: selectedCategory.image.url,
  });

  const [loading, setLoading] = useState(false);

  const handleNameChange = (event) => {
    setSystemCategory((prev) => ({ ...prev, name: event.target.value }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imagePreviewUrl = URL.createObjectURL(file);
      setSystemCategory((prev) => ({
        ...prev,
        image: file,
        preview: imagePreviewUrl,
      }));
    }
  };

  const handleUpdate = async () => {
    if (!systemCategory.name.trim()) {
      return toast.error("Vui lòng nhập tên danh mục");
    }

    if (!systemCategory._id) {
      return toast.error("Không tìm thấy id danh mục!");
    }
    try {
      setLoading(true);
      let imageId = null;

      // Nếu có ảnh
      if (systemCategory.image) {
        // Kiểm tra nếu là file mới (chưa upload)
        if (systemCategory.image instanceof File) {
          const uploaded = await uploadImage(systemCategory.image);
          imageId = uploaded._id;
        } else if (systemCategory.image._id) {
          // Nếu là ảnh đã có trong DB
          imageId = systemCategory.image._id;
        }
      }

      const res = await updateSystemCategory(
        systemCategory._id,
        systemCategory.name,
        imageId
      );

      toast.success("Cập nhật danh mục thành công!");
      onSystemCategoryUpdated(res);
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error.errorCode) || "Cập nhật thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center animate-fadeIn z-[100]">
      <div className="bg-white w-[400px] rounded-lg shadow-lg p-6 animate-scaleIn">
        <h3 className="text-2xl font-bold mb-4 text-center text-gray-800">
          Cập nhật Danh mục
        </h3>

        {/* Input name */}
        <div className="flex flex-col items-start mb-4">
          <label className="font-semibold mb-1 text-gray-700">
            Tên danh mục:
          </label>
          <input
            type="text"
            placeholder="Enter name"
            value={systemCategory.name}
            onChange={handleNameChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        {/* Input image */}
        <div className="flex flex-col items-start mb-4">
          <label className="font-semibold mb-1 text-gray-700">Ảnh:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full text-sm border border-gray-300 rounded-md p-1 cursor-pointer file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-green-500 file:text-white hover:file:bg-green-600"
          />
        </div>

        {/* Preview */}
        <div className="flex flex-col items-center mt-3">
          <p className="text-gray-700 mb-2">Xem trước:</p>
          <img
            src={systemCategory.preview}
            alt="Preview"
            className="w-28 h-28 object-cover rounded-lg border-2 border-gray-300"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-between mt-5">
          <button
            onClick={handleUpdate}
            disabled={loading}
            className={`flex-1 py-2 rounded-md text-white font-medium transition ${
              loading
                ? "bg-green-300 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            } mr-3`}
          >
            {loading ? "Đang xử lý ..." : "Xác nhận"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white font-medium transition"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateSystemCategoryPopup;
