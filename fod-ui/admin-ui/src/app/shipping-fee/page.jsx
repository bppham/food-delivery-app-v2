"use client";
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import { FaEdit, FaTrash } from "react-icons/fa";
import { getErrorMessage } from "../../../data/errorMessages";
import AddShippingFee from "../../components/ShippingFee/AddShippingFee";
import EditShippingFee from "../../components/ShippingFee/EditShippingFee";
import {
  createShippingFee,
  deleteShippingFee,
  getShippingFee,
  updateShippingFee,
} from "../../api/shipping-fee";

const Page = () => {
  const [shippingFees, setShippingFees] = useState([]);
  useEffect(() => {
    fetchShippingFees();
  }, []);

  const fetchShippingFees = async () => {
    try {
      const res = await getShippingFee();
      setShippingFees(res.data);
    } catch (error) {
      toast.error(
        getErrorMessage(error.errorCode) ||
          "Lỗi khi lấy danh sách phí vận chuyển"
      );
    }
  };

  // Add a system category
  const [showAddPopup, setShowAddPopup] = useState(false);
  const handleAddShippingFee = async (data) => {
    try {
      const res = await createShippingFee(data);

      console.log(data);
      if (res.success) {
        toast.success("Thêm phí vận chuyển thành công!");
        setShowAddPopup(false);
        fetchShippingFees();
      } else {
        toast.error(res.message || "Không thể thêm phí vận chuyển");
      }
    } catch (err) {
      toast.error(
        getErrorMessage(err.errorCode) || "Lỗi khi tạo phí vận chuyển"
      );
    }
  };

  // Update a system category
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);
  const [selectedShippingFee, setSelectedShippingFee] = useState(null);
  const handleUpdateShippingFee = async (data) => {
    try {
      const res = await updateShippingFee(data._id, data);

      if (res.success) {
        toast.success("Cập nhật phí vận chuyển thành công!");
        setShowUpdatePopup(false);
        setSelectedShippingFee(null);
        fetchShippingFees();
      } else {
        toast.error(res.message || "Không thể cập nhật phí vận chuyển");
      }
    } catch (err) {
      console.error(err);
      toast.error(
        getErrorMessage(err.errorCode) || "Lỗi khi cập nhật phí vận chuyển"
      );
    }
  };

  // DELETE
  const handleDelete = async (id) => {
    if (!id) {
      return toast.error("Không tìm thấy phí vận chuyển!");
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
      await deleteShippingFee(id);

      Swal.fire({
        icon: "success",
        title: "Phí vận chuyển xóa thành công",
      });

      setShippingFees((prev) => prev.filter((item) => item._id !== id));
    } catch (error) {
      console.error("Lỗi khi xóa phí vận chuyển:", error);
      toast.error(getErrorMessage(error.errorCode) || "Lỗi xóa phí vận chuyển");
    } finally {
    }
  };

  return (
    <div className="p-4">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header + Add button */}
      <div className="flex flex-col gap-4 rounded-md p-4 bg-gray-100 shadow-md mb-6">
        <div className="flex justify-between items-center">
          <p className="text-lg font-semibold text-black">Phí vận chuyển</p>
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
                Mức vận chuyển (km)
              </th>
              <th className="px-4 py-2 text-left border-b border-gray-300">
                Phí (VND)
              </th>
              <th className="px-4 py-2 text-left border-b border-gray-300">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody>
            {shippingFees?.map((shippingFee, index) => (
              <tr key={shippingFee._id} className="hover:bg-gray-100">
                <td className="px-4 py-2 border-b border-gray-300">
                  {index + 1}
                </td>
                <td className="px-4 py-2 border-b border-gray-300">
                  {shippingFee.fromDistance}
                </td>
                <td className="px-4 py-2 border-b border-gray-300">
                  {Number(shippingFee.feePerKm).toLocaleString("vi-VN")}
                </td>
                <td className="px-4 py-2 border-b border-gray-300">
                  <div className="flex gap-3">
                    <button
                      className="text-green-500 font-bold cursor-pointer p-1 rounded-lg"
                      onClick={() => {
                        setSelectedShippingFee(shippingFee);
                        setShowUpdatePopup(true);
                      }}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="text-red-500 font-bold cursor-pointer p-1 rounded-lg"
                      onClick={() => handleDelete(shippingFee._id)}
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
        <AddShippingFee
          onClose={() => setShowAddPopup(false)}
          onSubmit={handleAddShippingFee}
        />
      )}

      {showUpdatePopup && selectedShippingFee && (
        <EditShippingFee
          shippingFeeData={selectedShippingFee}
          onClose={() => {
            setShowUpdatePopup(false);
            setSelectedShippingFee(null);
          }}
          onSubmit={handleUpdateShippingFee}
        />
      )}
    </div>
  );
};

export default Page;
