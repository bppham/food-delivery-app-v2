import { useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { FaCamera } from "react-icons/fa";

import { uploadImage } from "../../api/upload";
import { createSystemCategory } from "../../api/systemCategory";
import { getErrorMessage } from "../../../data/errorMessages";

const AddSystemCategoryPopup = ({
  showAddPopup,
  setShowAddPopup,
  onSystemCategoryAdded,
}) => {
  const [systemCategory, setSystemCategory] = useState({
    name: "",
    image: null,
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setSystemCategory((prev) => ({ ...prev, name: e.target.value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSystemCategory((prev) => ({ ...prev, image: file }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!systemCategory.name.trim())
      return toast.error("Vui lòng nhập tên danh mục");
    if (!systemCategory.image) return toast.error("Vui lòng chọn ảnh");

    setLoading(true);
    try {
      let image;
      if (systemCategory.image) {
        image = await uploadImage(systemCategory.image);
      }

      await createSystemCategory(systemCategory.name, image.id);

      if (onSystemCategoryAdded) onSystemCategoryAdded();

      Swal.fire({
        icon: "success",
        title: "Thêm danh mục thành công!",
      });

      setShowAddPopup(false);
      setSystemCategory({ name: "", image: null });
      setPreviewImage(null);
    } catch (error) {
      toast.error(getErrorMessage(error.errorCode) || "Lỗi thêm danh mục");
    } finally {
      setLoading(false);
    }
  };

  return (
    showAddPopup && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center animate-fadeIn z-[100]">
        <div className="bg-white w-96 p-5 rounded-xl shadow-lg animate-scaleIn">
          <h3 className="text-center text-xl font-bold mb-4 text-gray-800">
            Thêm danh mục
          </h3>

          <div className="flex flex-col mb-4">
            <label className="font-semibold text-gray-600 mb-1">
              Tên danh mục:
            </label>
            <input
              type="text"
              placeholder="Enter name"
              value={systemCategory.name}
              onChange={handleInputChange}
              className="w-full p-2 text-sm border border-gray-300 rounded"
            />
          </div>

          <div className="flex flex-col mb-4">
            <div className="flex gap-4 items-center justify-between">
              <label className="font-semibold text-gray-600 mb-1">Ảnh:</label>

              <label
                htmlFor="file-upload"
                className="cursor-pointer text-sm py-1 px-2 bg-blue-400 text-white rounded text-center transition"
              >
                <FaCamera />
              </label>
            </div>

            <input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />

            {systemCategory.image && (
              <p className="text-sm text-gray-600 mt-2">
                {systemCategory.image.name}
              </p>
            )}
          </div>

          {previewImage && (
            <div className="flex flex-col items-center mt-2">
              <p className="mb-2 text-gray-700">Xem trước:</p>
              <img
                src={previewImage}
                alt="Preview"
                className="w-28 h-28 object-cover rounded-lg border-2 border-gray-200"
              />
            </div>
          )}

          <div className="flex justify-between mt-6 gap-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className={` flex-1 py-2 text-sm rounded bg-green-600 text-white hover:bg-green-700 transition  ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Đang lưu..." : "Xác nhận"}
            </button>
            <button
              onClick={() => setShowAddPopup(false)}
              className="flex-1 py-2 text-sm rounded bg-red-600 text-white hover:bg-red-700 transition"
            >
              Hủy
            </button>
          </div>
        </div>

        <style jsx>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          @keyframes scaleIn {
            from {
              transform: scale(0.8);
              opacity: 0;
            }
            to {
              transform: scale(1);
              opacity: 1;
            }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-in-out;
          }
          .animate-scaleIn {
            animation: scaleIn 0.3s ease-in-out;
          }
        `}</style>
      </div>
    )
  );
};

export default AddSystemCategoryPopup;
