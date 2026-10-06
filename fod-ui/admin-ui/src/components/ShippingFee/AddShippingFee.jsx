import React, { useState } from "react";

const AddShippingFee = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    fromDistance: "",
    feePerKm: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Chặn nhập ký tự không phải số và âm
    if (value < 0) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const fromDistance = parseFloat(formData.fromDistance);
    const feePerKm = parseFloat(formData.feePerKm);

    // ✅ Validate logic
    if (isNaN(fromDistance) || isNaN(feePerKm)) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    if (fromDistance <= 0) {
      alert("Mức vận chuyển phải lớn hơn 0!");
      return;
    }

    if (feePerKm < 0) {
      alert("Phí vận chuyển không được là số âm!");
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-2xl">
        <h3 className="text-xl font-semibold mb-5 text-center">
          Thêm mức phí vận chuyển
        </h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* INPUTS */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">
                Mức vận chuyển (km)
              </label>
              <input
                type="number"
                name="fromDistance"
                value={formData.fromDistance}
                onChange={handleChange}
                className="border-solid border border-gray-300 rounded-lg w-full p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                placeholder="Nhập mức vận chuyển"
                required
                min={1}
              />
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">
                Phí (VNĐ/km)
              </label>
              <input
                type="number"
                name="feePerKm"
                value={formData.feePerKm}
                onChange={handleChange}
                className="border-solid border border-gray-300 rounded-lg w-full p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                placeholder="Nhập phí mỗi km"
                required
                min={0}
              />
            </div>
          </div>

          {/* BUTTONS */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Thêm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddShippingFee;
