"use client";
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import { FaEdit, FaTrash } from "react-icons/fa";
import { getErrorMessage } from "../../../../data/errorMessages";
import {
  createReason,
  deleteReason,
  getAllReason,
  updateReason,
} from "../../../api/report";
import AddReason from "../../../components/Reason/AddReason";
import UpdateReason from "../../../components/Reason/UpdateReason";

const Page = () => {
  const [reasons, setReasons] = useState([]);
  useEffect(() => {
    fetchReasons();
  }, []);

  const fetchReasons = async () => {
    try {
      const res = await getAllReason();
      setReasons(res.data);
    } catch (error) {
      toast.error(
        getErrorMessage(error.errorCode) || "Lỗi khi lấy danh sách lý do"
      );
    }
  };

  // Add a system category
  const [showAddPopup, setShowAddPopup] = useState(false);
  const handleAddReason = async (data) => {
    try {
      const res = await createReason(data);

      console.log(data);
      if (res.success) {
        toast.success("Tạo lý do mới thành công!");
        setShowAddPopup(false);
        fetchReasons();
      } else {
        toast.error(res.message || "Không thể thêm lý do mới!");
      }
    } catch (err) {
      toast.error(getErrorMessage(err.errorCode) || "Lỗi khi tạo lý do mới");
    }
  };

  // Update a system category
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);
  const [selectedReason, setSelectedReason] = useState(null);
  const handleUpdateReason = async (data) => {
    try {
      const res = await updateReason(data._id, data);

      if (res.success) {
        toast.success("Cập nhật lý do thành công!");
        setShowUpdatePopup(false);
        setSelectedReason(null);
        fetchReasons();
      } else {
        toast.error(res.message || "Không thể cập nhật lý do");
      }
    } catch (err) {
      console.error(err);
      toast.error(getErrorMessage(err.errorCode) || "Lỗi khi cập nhật lý do");
    }
  };

  // DELETE
  const handleDelete = async (id) => {
    if (!id) {
      return toast.error("Không tìm thấy lý do!");
    }

    const confirmDelete = await Swal.fire({
      title: "Bạn chắc chưa?",
      text: "Bạn sẽ không thay đổi được thao tác này!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Đồng ý!",
    });

    if (!confirmDelete.isConfirmed) return;

    try {
      await deleteReason(id);

      Swal.fire({
        icon: "success",
        title: "Lý do xóa thành công",
      });

      setReasons((prev) => prev.filter((item) => item._id !== id));
    } catch (error) {
      console.error("Lỗi khi xóa lý do:", error);
      toast.error(getErrorMessage(error.errorCode) || "Lỗi xóa lý do");
    } finally {
    }
  };

  return (
    <div className="p-4">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header + Add button */}
      <div className="flex flex-col gap-4 rounded-md p-4 bg-gray-100 shadow-md mb-6">
        <div className="flex justify-between items-center">
          <p className="text-lg font-semibold text-black">Lý do báo cáo</p>
          <button
            className="bg-green-500 hover:bg-green-400 text-white font-semibold text-sm py-2 px-4 rounded-lg"
            onClick={() => setShowAddPopup(true)}
          >
            + Thêm
          </button>
        </div>
      </div>

      {/* Table */}
      {/* Table container */}
      <div className="overflow-x-auto border-solid border border-gray-300 rounded-lg p-2">
        <table className="table-auto min-w-[600px] border-collapse w-full">
          <thead className="text-sm">
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left border-b border-gray-300">
                Thứ tự
              </th>
              <th className="px-4 py-2 text-left border-b border-gray-300">
                Lý do
              </th>
              <th className="px-4 py-2 text-left border-b border-gray-300">
                Cho phép nhập thông tin
              </th>
              <th className="px-4 py-2 text-left border-b border-gray-300">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody>
            {reasons?.map((reason, index) => (
              <tr key={reason._id} className="hover:bg-gray-100">
                <td className="px-4 py-2 border-b border-gray-300">
                  {index + 1}
                </td>
                <td className="px-4 py-2 border-b border-gray-300">
                  {reason.name}
                </td>
                <td className="px-4 py-2 border-b border-gray-300">
                  {reason.other ? "Có" : "Không"}
                </td>
                <td className="px-4 py-2 border-b border-gray-300">
                  <div className="flex gap-3">
                    <button
                      className="text-green-500 font-bold cursor-pointer p-1 rounded-lg"
                      onClick={() => {
                        setSelectedReason(reason);
                        setShowUpdatePopup(true);
                      }}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="text-red-500 font-bold cursor-pointer p-1 rounded-lg"
                      onClick={() => handleDelete(reason._id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddPopup && (
        <AddReason
          onClose={() => setShowAddPopup(false)}
          onSubmit={handleAddReason}
        />
      )}

      {showUpdatePopup && selectedReason && (
        <UpdateReason
          reasonData={selectedReason}
          onClose={() => {
            setShowUpdatePopup(false);
            setSelectedReason(null);
          }}
          onSubmit={handleUpdateReason}
        />
      )}
    </div>
  );
};

export default Page;
