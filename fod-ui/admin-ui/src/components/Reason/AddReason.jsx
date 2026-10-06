import React, { useState } from "react";

const AddReason = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    other: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Vui lòng nhập tên lý do!");
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-lg">
        <h3 className="text-xl font-semibold mb-5 text-center">Thêm lý do</h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* TÊN LÝ DO */}
          <div>
            <label className="block text-sm font-medium mb-1">Tên lý do</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg w-full p-2 focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="Nhập tên lý do"
              required
            />
          </div>

          {/* CHECKBOX OTHER */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="other"
              name="other"
              checked={formData.other}
              onChange={handleChange}
              className="w-4 h-4"
            />
            <label htmlFor="other" className="text-sm">
              Cho phép nhập thêm thông tin
            </label>
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

export default AddReason;
