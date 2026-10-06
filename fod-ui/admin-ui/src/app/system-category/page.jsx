"use client";
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import {
  getSystemCategories,
  deleteSystemCategory,
} from "../../api/systemCategory";
import { FaEdit, FaTrash } from "react-icons/fa";
import { getErrorMessage } from "../../../data/errorMessages";
import AddSystemCategoryPopup from "../../components/SystemCategory/AddSystemCategoryPopup";
import UpdateSystemCategoryPopup from "../../components/SystemCategory/UpdateSystemCategoryPopup";

const Page = () => {
  const [systemCategories, setSystemCategories] = useState([]);

  const [filteredSystemCategories, setFilteredSystemCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchSystemCategories();
  }, []);

  useEffect(() => {
    handleSearchAndSort();
  }, [searchTerm, sortOrder, systemCategories]);

  const fetchSystemCategories = async () => {
    try {
      const res = await getSystemCategories();
      setSystemCategories(res.data);
    } catch (error) {
      toast.error(
        getErrorMessage(error.errorCode) || "Lỗi khi lấy danh sách danh mục"
      );
    }
  };

  const handleSearchAndSort = () => {
    let updatedList = [...systemCategories];

    // Search
    if (searchTerm) {
      updatedList = updatedList.filter((systemCategory) =>
        systemCategory.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (sortOrder === "id-asc") {
      updatedList.sort((a, b) => a._id.localeCompare(b._id));
    } else if (sortOrder === "id-desc") {
      updatedList.sort((a, b) => b._id.localeCompare(a._id));
    } else if (sortOrder === "name-asc") {
      updatedList.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOrder === "name-desc") {
      updatedList.sort((a, b) => b.name.localeCompare(a.name));
    }
    setFilteredSystemCategories(updatedList);
    setCurrentPage(1);
  };

  // Add a system category
  const [showAddPopup, setShowAddPopup] = useState(false);

  // Update a system category
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);
  const [seletedSystemCategory, setSeletedSystemCategory] = useState(null);
  const openUpdatePopup = (systemCategory) => {
    setSeletedSystemCategory(systemCategory);
    setShowUpdatePopup(true);
  };

  const closeUpdatePopup = () => {
    setShowUpdatePopup(false);
    setSeletedSystemCategory(null);
  };

  // DELETE
  const handleDelete = async (id) => {
    if (!id) {
      return toast.error("Không tìm thấy mã danh mục!");
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
      await deleteSystemCategory(id);

      Swal.fire({
        icon: "success",
        title: "Danh mục xóa thành công",
      });

      setSystemCategories((prev) => prev.filter((item) => item._id !== id)); // Cập nhật UI ngay lập tức
    } catch (error) {
      toast.error(getErrorMessage(error.errorCode) || "Lỗi xóa danh mục");
    } finally {
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredSystemCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentSystemCategories = filteredSystemCategories.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="p-4">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header + Add button */}
      <div className="flex flex-col gap-4 rounded-md p-4 bg-gray-100 shadow-md mb-6">
        <div className="flex justify-between items-center">
          <p className="text-lg font-semibold text-black">Danh mục quán ăn</p>
          <button
            className="bg-green-500 hover:bg-green-400 text-white font-semibold text-sm py-2 px-4 rounded-lg"
            onClick={() => setShowAddPopup(true)}
          >
            + Thêm
          </button>
        </div>

        {/* Search + Sort */}
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <input
            className="flex-1 border border-gray-400 rounded-lg px-4 py-1 text-sm"
            type="text"
            placeholder="Nhập tên danh mục ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="flex-1 w-full border border-gray-400 rounded-lg px-4 py-1 text-sm"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="">Sắp xếp theo</option>
            <option value="id-asc">Theo Id: Tăng dần</option>
            <option value="id-desc">Theo Id: giảm dần</option>
            <option value="name-asc">Theo tên: A đến Z</option>
            <option value="name-desc">Theo tên: Z đến A</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {/* Table container */}
      <div className="overflow-x-auto border-solid border border-gray-300 rounded-lg p-2">
        <table className="table-auto min-w-[600px] border-collapse w-full">
          <thead className="text-sm">
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left border-b border-gray-300">
                Mã
              </th>
              <th className="px-4 py-2 text-left border-b border-gray-300">
                Tên danh mục
              </th>
              <th className="px-4 py-2 text-left border-b border-gray-300">
                Số cửa hàng
              </th>
              <th className="px-4 py-2 text-left border-b border-gray-300">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody>
            {currentSystemCategories?.map((systemCategory, index) => (
              <tr key={systemCategory._id} className="hover:bg-gray-100">
                <td className="px-4 py-2 border-b border-gray-300">
                  {index + 1}
                </td>
                <td className="px-4 py-2 border-b border-gray-300">
                  <div className="flex items-center gap-2">
                    <img
                      src={systemCategory.image.url}
                      alt=""
                      className="w-11 h-11 rounded-full object-cover"
                    />
                    {systemCategory.name}
                  </div>
                </td>
                <td className="px-4 py-2 border-b border-gray-300">
                  {systemCategory.storeCount}
                </td>
                <td className="px-4 py-2 border-b border-gray-300">
                  <div className="flex gap-3">
                    <button
                      className="text-green-500 font-bold cursor-pointer p-1 rounded-lg"
                      onClick={() => openUpdatePopup(systemCategory)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="text-red-500 font-bold cursor-pointer p-1 rounded-lg"
                      onClick={() => handleDelete(systemCategory._id)}
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

      {/* Pagination */}
      <div className="flex justify-center items-center gap-5 my-8">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="bg-white text-blue-500 border border-gray-300 rounded-lg w-20 py-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Trước
        </button>
        <span>
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className="bg-white text-blue-500 border border-gray-300 rounded-lg w-20 py-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Tiếp
        </button>
      </div>

      {/* Add Popup */}
      {showAddPopup && (
        <AddSystemCategoryPopup
          showAddPopup={showAddPopup}
          setShowAddPopup={setShowAddPopup}
          onSystemCategoryAdded={fetchSystemCategories}
        />
      )}

      {/* Update Popup */}
      {showUpdatePopup && (
        <UpdateSystemCategoryPopup
          selectedCategory={seletedSystemCategory}
          onClose={closeUpdatePopup}
          onSystemCategoryUpdated={fetchSystemCategories}
        />
      )}
    </div>
  );
};

export default Page;
