"use client";
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import { blockStore, getAllStoreRequest } from "../../../../api/store";
import { useRouter } from "next/navigation";
import { FaLock, FaInfoCircle } from "react-icons/fa";
import { getErrorMessage } from "../../../../../data/errorMessages";
const Page = () => {
  const router = useRouter();
  const [stores, setStores] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStores, setTotalStores] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("name_asc");
  const itemsPerPage = 5;

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchStores(currentPage, searchTerm, sortOrder);
    }, 400); // debounce search 400ms
    return () => clearTimeout(delayDebounce);
  }, [currentPage, searchTerm, sortOrder]);

  const fetchStores = async (page = 1, search = "", sort = "name_asc") => {
    try {
      const response = await getAllStoreRequest(
        "approved",
        page,
        itemsPerPage,
        search,
        sort
      );
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

  const handleBlock = async (storeId) => {
    const result = await Swal.fire({
      title: "Xác nhận khóa cửa hàng?",
      text: "Bạn có chắc muốn khóa cửa hàng này không?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Xác nhận!",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        const res = await blockStore(storeId);
        if (res.success) {
          toast.success("Đã khóa cửa hàng!");
          Swal.fire({
            title: "Thành công!",
            text: "Cửa hàng không còn có thể hoạt động nữa.",
            icon: "success",
          });
          fetchStores(currentPage, searchTerm, sortOrder);
        }
      } catch (error) {
        toast.error(
          getErrorMessage(error.errorCode) || "Khóa cửa hàng thất bại!"
        );
      }
    }
  };

  const handleDetail = (storeId) => {
    router.push(`/store/management/active/${storeId}`);
  };

  return (
    <div className="p-4">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="flex flex-col gap-4 rounded-md p-4 bg-gray-100 shadow-md mb-6">
        <div className="flex justify-between items-center">
          <p className="text-lg font-semibold text-black">
            Cửa hàng <span className="text-green-500">Đang hoạt động</span>
          </p>
          <div className="flex gap-2 text-sm text-blue-600">
            <label>Tổng số cửa hàng:</label>
            <p className="font-semibold">{totalStores}</p>
          </div>
        </div>

        {/* Search + Sort */}
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <input
            className="flex-1 border border-gray-400 rounded-lg px-4 py-1 text-sm"
            type="text"
            placeholder="Nhập tên cửa hàng ..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
          <select
            className="flex-1 md:w-[220px] border border-gray-400 rounded-lg px-4 py-1 text-sm"
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="name_asc">Theo tên: A → Z</option>
            <option value="name_desc">Theo tên: Z → A</option>
            <option value="id_asc">Theo ID: tăng dần</option>
            <option value="id_desc">Theo ID: giảm dần</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border-solid border border-gray-300 rounded-lg p-2">
        <table className="table-auto min-w-[600px] border-collapse w-full">
          <thead className="text-sm bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left border-b border-gray-300">
                #
              </th>
              <th className="px-4 py-2 text-left border-b border-gray-300">
                Tên cửa hàng
              </th>
              <th className="px-4 py-2 text-left border-b border-gray-300">
                Địa chỉ
              </th>
              <th className="px-4 py-2 text-left border-b border-gray-300">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {stores.length > 0 ? (
              stores.map((store, index) => (
                <tr key={store._id} className="hover:bg-gray-100">
                  <td className="px-4 py-2 border-b border-gray-300">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="px-4 py-2 border-b border-gray-300">
                    <div className="flex items-center gap-2">
                      <img
                        src={store.avatarImage?.url || "/default.jpg"}
                        alt="Avatar"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      {store.name}
                    </div>
                  </td>
                  <td className="px-4 py-2 border-b border-gray-300">
                    {store.address_full}
                  </td>
                  <td className="px-4 py-2 border-b border-gray-300">
                    <div className="flex gap-3">
                      <button
                        className="text-blue-500 font-bold cursor-pointer p-1 rounded-lg"
                        onClick={() => handleDetail(store._id)}
                      >
                        <FaInfoCircle />
                      </button>
                      <button
                        className="text-red-500 font-bold cursor-pointer p-1 rounded-lg"
                        onClick={() => handleBlock(store._id)}
                      >
                        <FaLock />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="text-center py-6 text-gray-500 italic"
                >
                  Không tìm thấy cửa hàng nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-5 mt-8">
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
  );
};

export default Page;
