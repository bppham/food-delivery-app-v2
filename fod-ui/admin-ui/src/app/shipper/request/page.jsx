"use client";
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import { FaCheck } from "react-icons/fa";
import { getRequests, approveShipper } from "../../../api/shipper";
import { useRouter } from "next/navigation";
import { getErrorMessage } from "../../../../data/errorMessages";
const Page = () => {
  const router = useRouter();
  const [shippers, setShippers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalShippers, setTotalShippers] = useState(0);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchShippers(currentPage);
  }, [currentPage]);

  const handleApprove = async (shipperId) => {
    // Hiển thị popup xác nhận
    const result = await Swal.fire({
      title: "Xác nhận phê duyệt?",
      text: "Bạn có chắc muốn phê duyệt shipper này không?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Có, phê duyệt!",
      cancelButtonText: "Hủy",
    });

    // Nếu người dùng nhấn "Có, phê duyệt!"
    if (result.isConfirmed) {
      try {
        const res = await approveShipper(shipperId);
        if (res.success) {
          toast.success("Phê duyệt shipper thành công!");
          Swal.fire({
            title: "Thành công!",
            text: "Shipper đã được phê duyệt.",
            icon: "success",
            confirmButtonText: "OK",
          });
          fetchShippers();
        }

        // Hiển thị thông báo SweetAlert thành công
      } catch (error) {
        toast.error(
          getErrorMessage(error.errorCode) || "Phê duyệt shipper thất bại!"
        );
      }
    }
  };
  const fetchShippers = async (page = 1) => {
    try {
      const response = await getRequests(page, itemsPerPage);
      if (response.success) {
        setShippers(response.data);
        setTotalPages(response.meta.totalPages);
        setTotalShippers(response.meta.totalShippers);
      }
    } catch (error) {
      toast.error(
        getErrorMessage(error.errorCode) || "Không thể tải danh sách shipper!"
      );
    }
  };

  return (
    <div className="p-5">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="flex justify-between">
        <p className="text-lg font-bold mb-5">Danh sách shipper vừa đăng ký</p>
        <div className="flex gap-2 text-sm text-blue-600">
          <label>Tổng shipper mới đăng ký:</label>
          <p className="font-semibold">{totalShippers}</p>
        </div>
      </div>

      <div className="space-y-5">
        {shippers.map((shipper) => (
          <div
            key={shipper._id}
            className="border-solid border-2 border-gray-300 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <p className="text-lg text-blue-500 font-semibold">
              {shipper.name}
            </p>
            <p className="text-sm italic text-gray-400">{shipper.email}</p>
            <div className="flex md:flex-row flex-col mt-4 text-sm">
              <div className="flex-1 flex mb-4">
                <label className="w-[100px] font-semibold">SĐT:</label>
                <p>{shipper.phonenumber}</p>
              </div>
              <div className="flex-1 flex">
                <label className="w-[100px] font-semibold">Giới tính:</label>
                <p>
                  {shipper.gender === "male"
                    ? "Nam"
                    : shipper.gender === "female"
                    ? "Nữ"
                    : "Khác"}
                </p>
              </div>
            </div>

            <div className="flex md:flex-row flex-col md:mt-2 mt-4 text-sm">
              <div className="flex-1 flex mb-4">
                <label className="w-[100px] font-semibold">Loại xe:</label>
                <p>{shipper?.vehicleId?.vehicleType}</p>
              </div>
              <div className="flex-1 flex">
                <label className="w-[100px] font-semibold">Số xe:</label>
                <p>{shipper?.vehicleId?.vehicleNumber}</p>
              </div>
            </div>

            <div className="flex justify-end mt-4 mr-4">
              <button
                onClick={() => handleApprove(shipper._id)}
                className="flex gap-2 items-center justify-center bg-green-600 hover:bg-green-500 text-white text-xs font-semibold w-[100px] py-2 rounded-lg transition-colors"
              >
                <FaCheck />
                Duyệt
              </button>
            </div>
          </div>
        ))}

        {/* PAGINATION */}
        <div className="flex justify-center items-center gap-5 mt-12">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className={`w-[80px] py-2 border border-gray-300 rounded-lg text-blue-500 bg-white hover:bg-gray-100 transition ${
              currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Trước
          </button>

          <span className="text-lg font-medium">
            {currentPage} / {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className={`w-[80px] py-2 border border-gray-300 rounded-lg text-blue-500 bg-white hover:bg-gray-100 transition ${
              currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Tiếp
          </button>
        </div>
      </div>
    </div>
  );
};

export default Page;
