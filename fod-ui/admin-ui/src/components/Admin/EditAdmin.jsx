import React, { useState, useEffect } from "react";
import { RoleOptions } from "../../../data/roleLabel";

const EditAdmin = ({ adminData, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phonenumber: "",
    gender: "",
    role: [],
  });

  // ✅ Khi popup mở, đổ dữ liệu admin vào form
  useEffect(() => {
    if (adminData) {
      setFormData({
        _id: adminData._id,
        name: adminData.name || "",
        email: adminData.email || "",
        phonenumber: adminData.phonenumber || "",
        gender: adminData.gender || "",
        role: Array.isArray(adminData.role)
          ? adminData.role
          : adminData.role
          ? [adminData.role]
          : [],
      });
    }
  }, [adminData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      let updatedRoles = [...prev.role];
      if (checked) {
        updatedRoles.push(value);
      } else {
        updatedRoles = updatedRoles.filter((r) => r !== value);
      }
      return { ...prev, role: updatedRoles };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-2xl">
        <h3 className="text-xl font-semibold mb-5 text-center">
          Chỉnh sửa quản trị viên
        </h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Họ và tên */}
          <div>
            <label className="block text-sm font-medium mb-1">Họ và tên</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="border rounded-lg w-full p-2 focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="Nhập tên nhân viên"
              required
            />
          </div>

          {/* Email + Số điện thoại */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="border rounded-lg w-full p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                placeholder="Nhập email"
                required
              />
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">
                Số điện thoại
              </label>
              <input
                type="text"
                name="phonenumber"
                value={formData.phonenumber}
                onChange={handleChange}
                className="border rounded-lg w-full p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                placeholder="Nhập số điện thoại"
                required
              />
            </div>
          </div>

          {/* Giới tính */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">
                Giới tính
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="border rounded-lg w-full p-2 focus:ring-2 focus:ring-blue-400 outline-none"
              >
                <option value="">-- Chọn giới tính --</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>
          </div>

          {/* ✅ Checkbox chọn vai trò */}
          <div>
            <label className="block text-sm font-medium mb-2">Chức vụ</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {RoleOptions.map((role) => (
                <label key={role.value} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    value={role.value}
                    checked={formData.role.includes(role.value)}
                    onChange={handleRoleChange}
                    className="accent-blue-600"
                  />
                  <span>{role.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Nút hành động */}
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
              Cập nhật
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAdmin;
