"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import { FaCheck } from "react-icons/fa";
import { approveStore, getAllStoreRequest } from "../../../api/store";
import { useRouter } from "next/navigation";
import { getErrorMessage } from "../../../../data/errorMessages";
const Page = () => {
  const router = useRouter();
  const [stores, setStores] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStores, setTotalStores] = useState(0);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchStores(currentPage);
  }, [currentPage]);

  const handleApprove = async (storeId) => {
    // Hiển thị popup xác nhận
    const result = await Swal.fire({
      title: "Xác nhận phê duyệt?",
      text: "Bạn có chắc muốn phê duyệt cửa hàng này không?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Có, phê duyệt!",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        const res = await approveStore(storeId);
        if (res.success) {
          toast.success("Phê duyệt cửa hàng thành công!");
          Swal.fire({
            title: "Thành công!",
            text: "Cửa hàng đã được phê duyệt.",
            icon: "success",
            confirmButtonText: "OK",
          });
          fetchStores();
        }
      } catch (error) {
        toast.error(
          getErrorMessage(error.errorCode) || "Phê duyệt cửa hàng thất bại!"
        );
      }
    }
  };
  const fetchStores = async (page = 1) => {
    try {
      const response = await getAllStoreRequest("register", page, itemsPerPage);
      if (response.success) {
        setStores(response.data);
        setTotalPages(response.meta.totalPages);
        setTotalStores(response.meta.totalStores);
      }
    } catch (error) {
      toast.error(
        getErrorMessage(error.errorCode) || "Không thể tải danh sách cửa hàng!"
      );
    }
  };
  const [showDetailPopup, setDetailPopup] = useState(false);
  const [selectedStore, setSeletedStore] = useState(null);

  const openDetailPopup = (store) => {
    setSeletedStore(store);
    setDetailPopup(true);
  };

  const handleDetail = (storeId) => {
    router.push(`/store/request/${storeId}`);
  };

  return (
    <div className="p-5">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="flex justify-between">
        <p className="text-lg font-bold mb-5">
          Danh sách cửa hàng vừa được tạo
        </p>
        <div className="flex gap-2 text-sm text-blue-600">
          <label>Tổng số cửa hàng:</label>
          <p className="font-semibold">{totalStores}</p>
        </div>
      </div>

      <div className="space-y-5">
        {stores.map((store) => (
          <div
            key={store._id}
            className="border-solid border-2 border-gray-300 rounded-2xl flex p-4 shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            {/* LEFT SIDE */}
            <div className="flex-1 flex flex-col gap-3">
              <img
                src={store.avatarImage?.url || "/default-avatar.png"}
                alt="Store Avatar"
                className="w-[100px] object-cover rounded-full"
              />

              <div className="flex items-center gap-2 text-sm">
                <div className="relative w-[15px] h-[15px]">
                  <Image
                    src="/assets/admin-icons/store-owner.png"
                    alt="Store owner"
                    layout="fill"
                    objectFit="cover"
                    className="rounded-md"
                  />
                </div>
                <span className="text-gray-800 font-medium">
                  {store.owner.name}
                </span>
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex-[3] flex flex-col gap-3 ml-4">
              <div className="text-md font-semibold text-blue-600 mb-2">
                {store.name}
              </div>

              <div className="flex items-center gap-2 text-md mb-2 text-gray-700 text-sm">
                <div className="relative w-[20px] h-[20px]">
                  <Image
                    src="/assets/admin-icons/location.png"
                    alt="location"
                    layout="fill"
                    objectFit="cover"
                    className="rounded-md"
                  />
                </div>
                {store.address_full}
              </div>

              <div className="flex gap-6 mt-2">
                <button
                  onClick={() => handleApprove(store._id)}
                  className="flex gap-2 items-center justify-center bg-green-600 hover:bg-green-500 text-white text-xs font-semibold w-[100px] py-2 rounded-lg transition-colors"
                >
                  <FaCheck />
                  Duyệt
                </button>

                <button
                  onClick={() => handleDetail(store._id)}
                  className="bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold w-[100px] py-2 rounded-lg transition-colors"
                >
                  Chi tiết
                </button>
              </div>
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
