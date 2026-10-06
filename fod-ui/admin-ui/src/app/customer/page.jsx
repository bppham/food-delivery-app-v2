"use client";
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import { FaLock, FaUnlock, FaEdit, FaTrash } from "react-icons/fa";
import { getAllCustomer, toggleStatusCustomer } from "../../api/customer";
import { getErrorMessage } from "../../../data/errorMessages";
const Page = () => {
  const [users, setUsers] = useState([]);

  // ✅ pagination, search, filter
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterBlocked, setFilterBlocked] = useState("");

  // ✅ lấy danh sách nhân viên
  const fetchUsers = async () => {
    try {
      const res = await getAllCustomer({
        page,
        limit: 5,
        search: searchTerm,
        blocked: filterBlocked,
      });

      if (res.success) {
        setUsers(res.data);
        setTotalPages(res.meta?.totalPages || 1);
      } else {
        toast.error("Lỗi khi lấy khách hàng:", res.message);
      }
    } catch (error) {
      toast.error(
        getErrorMessage(error.errorCode) || "Lỗi khi gọi API khách hàng"
      );
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, searchTerm, filterBlocked]);

  const handleChangeStatus = async (userId) => {
    const result = await Swal.fire({
      title: "Bạn có chắc chắn?",
      text: "Tài khoản khách hàng này sẽ thay đổi.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xác nhận",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        const res = await toggleStatusCustomer(userId);

        if (res.success) {
          Swal.fire(
            "Thành công!",
            "Trạng thái tài khoản đã thay đổi.",
            "success"
          );
          fetchUsers();
        } else {
          Swal.fire(
            "Lỗi!",
            res.message || "Thay đổi trạng thái khách hàng thất bại",
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
            Danh sách khách hàng
          </p>
        </div>

        {/* Search + Sort */}
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <input
            className="flex-1 border border-gray-400 rounded-lg px-4 py-1 text-sm"
            type="text"
            placeholder="Nhập từ khóa ..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
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
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white text-sm text-gray-800">
            {users.length > 0 ? (
              users.map((user) => {
                const isBlocked = user.accountId?.blocked;

                return (
                  <tr
                    key={user._id}
                    className={`${
                      isBlocked ? "opacity-50 bg-gray-50" : ""
                    } hover:bg-gray-100 transition`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.phonenumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.gender === "male"
                        ? "Nam"
                        : user.gender === "female"
                        ? "Nữ"
                        : "Khác"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap flex gap-4 items-center">
                      {/* Khóa / Mở khóa */}
                      <button
                        onClick={() => handleChangeStatus(user._id)}
                        className={`${
                          isBlocked
                            ? "text-yellow-600 hover:text-yellow-800"
                            : "text-green-600 hover:text-green-800"
                        }`}
                      >
                        {isBlocked ? <FaLock /> : <FaUnlock />}
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
                  Không tìm thấy khách hàng nào
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
    </div>
  );
};

export default Page;
