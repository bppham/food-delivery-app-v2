"use client";
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import {
  getAllAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  toggleStatusAdmin,
} from "../../api/admin";
import { getRoleNames } from "../../../data/roleLabel";
import { FaLock, FaUnlock, FaEdit, FaTrash } from "react-icons/fa";
import AddAdmin from "../../components/Admin/AddAdmin";
import EditAdmin from "../../components/Admin/EditAdmin";
import { getErrorMessage } from "../../../data/errorMessages";

const Page = () => {
  const [admins, setAdmins] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);

  // ✅ pagination, search, filter
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterBlocked, setFilterBlocked] = useState("");

  // ✅ lấy danh sách nhân viên
  const fetchAdmins = async () => {
    try {
      const res = await getAllAdmins({
        page,
        limit: 5,
        search: searchTerm,
        role: filterRole,
        blocked: filterBlocked,
      });

      if (res.success) {
        setAdmins(res.data);
        setTotalPages(res.meta?.totalPages || 1);
      } else {
        console.error("Lỗi khi lấy nhân viên:", res.message);
      }
    } catch (error) {
      console.error("Lỗi khi gọi API nhân viên:", error);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, [page, searchTerm, filterRole, filterBlocked]);

  // ✅ Thêm nhân viên mới
  const handleAddAdmin = async (data) => {
    try {
      const res = await createAdmin(data);

      console.log(data);
      if (res.success) {
        toast.success("Thêm nhân viên thành công!");
        setShowForm(false);
        fetchAdmins();
      } else {
        toast.error(res.message || "Không thể thêm nhân viên");
      }
    } catch (err) {
      console.error(err);
      toast.error(getErrorMessage(err.errorCode) || "Lỗi khi tạo nhân viên");
    }
  };

  const handleUpdateAdmin = async (data) => {
    console.log("DATA:", data);
    try {
      const res = await updateAdmin(data._id, data);

      if (res.success) {
        toast.success("Cập nhật nhân viên thành công!");
        setShowForm(false);
        setEditingAdmin(null);
        fetchAdmins();
      } else {
        toast.error(res.message || "Không thể cập nhật nhân viên");
      }
    } catch (err) {
      console.error(err);
      toast.error(getErrorMessage(err.errorCode) || "Lỗi khi tạo nhân viên");
    }
  };
  // ✅ Xóa nhân viên
  const handleDeleteAdmin = async (adminId) => {
    const result = await Swal.fire({
      title: "Bạn có chắc chắn?",
      text: "Nhân viên này sẽ bị xóa vĩnh viễn.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        const res = await deleteAdmin(adminId);

        if (res.success) {
          Swal.fire("Đã xóa!", "Nhân viên đã được xóa.", "success");
          fetchAdmins();
        } else {
          Swal.fire("Lỗi!", res.message || "Xóa nhân viên thất bại", "error");
        }
      } catch (err) {
        Swal.fire(
          "Lỗi!",
          getErrorMessage(err.errorCode) || "Xóa nhân viên thất bại",
          "error"
        );
      }
    }
  };

  const handleChangeStatus = async (adminId) => {
    const result = await Swal.fire({
      title: "Bạn có chắc chắn?",
      text: "Tài khoản nhân viên này sẽ thay đổi.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xác nhận",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        const res = await toggleStatusAdmin(adminId);

        if (res.success) {
          Swal.fire(
            "Thành công!",
            "Trạng thái tài khoản đã thay đổi.",
            "success"
          );
          fetchAdmins();
        } else {
          Swal.fire(
            "Lỗi!",
            res.message || "Thay đổi trạng thái nhân viên thất bại",
            "error"
          );
        }
      } catch (err) {
        Swal.fire(
          "Lỗi!",
          getErrorMessage(err.errorCode) || "Thay đổi trạng thái thất bại",
          "error"
        );
      }
    }
  };

  return (
    <div className="p-4">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="flex flex-col gap-4 rounded-md p-4 bg-gray-100 shadow-md mb-6">
        <div className="flex justify-between items-center">
          <p className="text-lg font-semibold text-black">
            Danh sách các quản trị viên
          </p>
          <button
            className="bg-green-500 hover:bg-green-400 text-white font-semibold text-sm py-2 px-4 rounded-lg"
            onClick={() => setShowForm(true)}
          >
            + Thêm
          </button>
        </div>

        {/* Search + Sort */}
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <input
            className="flex-1 border border-gray-400 rounded-lg px-4 py-1 text-sm"
            type="text"
            placeholder="Nhập tên quản trị viên ..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
          <select
            className="flex-1 md:w-[220px] border border-gray-400 rounded-lg px-4 py-1 text-sm"
            value={filterRole}
            onChange={(e) => {
              setFilterRole(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Tất cả vai trò</option>
            <option value="SHIPPER_MANAGER">Quản lý shipper</option>
            <option value="STORE_MANAGER">Quản lý cửa hàng</option>
            <option value="CUSTOMER_MANAGER">Quản lý khách hàng</option>
            <option value="HR_MANAGER">Quản lý nhân sự</option>
            <option value="SYSTEM_MANAGER">Quản trị hệ thống</option>
          </select>
          <select
            value={filterBlocked}
            onChange={(e) => {
              setFilterBlocked(e.target.value);
              setPage(1);
            }}
            className="flex-1 md:w-[220px] border border-gray-400 rounded-lg px-4 py-1 text-sm"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="false">Đang hoạt động</option>
            <option value="true">Bị khóa</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border-solid border border-gray-300 rounded-lg p-2">
        <table className="table-auto min-w-[600px] border-collapse w-full">
          <thead className="text-sm bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left border-b border-gray-300">
                Họ và tên
              </th>
              <th className="px-4 py-2 text-left border-b border-gray-300">
                Email
              </th>
              <th className="px-4 py-2 text-left border-b border-gray-300">
                Điện thoại
              </th>
              <th className="px-4 py-2 text-left border-b border-gray-300">
                Giới tính
              </th>
              <th className="px-4 py-2 text-left border-b border-gray-300">
                Vai trò
              </th>
              <th className="px-4 py-2 text-left border-b border-gray-300">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white text-sm text-gray-800">
            {admins.length > 0 ? (
              admins.map((admin) => {
                const isBlocked = admin.accountId?.blocked;

                return (
                  <tr
                    key={admin._id}
                    className={`${
                      isBlocked ? "opacity-50 bg-gray-50" : ""
                    } hover:bg-gray-100 transition`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      {admin.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {admin.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {admin.phonenumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {admin.gender === "male"
                        ? "Nam"
                        : admin.gender === "female"
                        ? "Nữ"
                        : "Khác"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleNames(admin.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap flex gap-4 items-center">
                      {/* Chỉnh sửa admin */}
                      <button
                        onClick={() => {
                          setEditingAdmin(admin);
                          setShowForm(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <FaEdit />
                      </button>

                      {/* Khóa / Mở khóa */}
                      <button
                        onClick={() => handleChangeStatus(admin._id)}
                        className={`${
                          isBlocked
                            ? "text-yellow-600 hover:text-yellow-800"
                            : "text-green-600 hover:text-green-800"
                        }`}
                      >
                        {isBlocked ? <FaLock /> : <FaUnlock />}
                      </button>

                      {/* Xóa admin */}
                      <button
                        onClick={() => handleDeleteAdmin(admin._id)}
                        className="text-red-600 hover:text-yellow-800"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="text-center py-6 text-gray-500 italic"
                >
                  Không tìm thấy quản trị viên nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-5 mt-8">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Trước
        </button>

        <span className="text-sm font-medium">
          {page} / {totalPages}
        </span>

        <button
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Sau
        </button>
      </div>
      {showForm && (
        <AddAdmin
          onClose={() => setShowForm(false)}
          onSubmit={handleAddAdmin}
        />
      )}
      {showForm && editingAdmin && (
        <EditAdmin
          adminData={editingAdmin}
          onClose={() => {
            setShowForm(false);
            setEditingAdmin(null);
          }}
          onSubmit={handleUpdateAdmin}
        />
      )}
    </div>
  );
};

export default Page;
