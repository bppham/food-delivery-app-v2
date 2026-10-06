"use client";
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import {
  FaCheckCircle,
  FaHourglassHalf,
  FaTrash,
  FaEye,
  FaTimes,
} from "react-icons/fa";
import { getErrorMessage } from "../../../../data/errorMessages";
import {
  deleteReport,
  getAllReason,
  getAllReport,
  updateReportStatus,
} from "../../../api/report";

const ReportPage = () => {
  const [reports, setReports] = useState([]);
  const [reasons, setReasons] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null); // State cho Popup chi tiết

  const [searchTerm, setSearchTerm] = useState("");
  const [filterReason, setFilterReason] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchReasons = async () => {
    try {
      const res = await getAllReason();
      if (res.success) setReasons(res.data);
    } catch (error) {
      console.error("Lỗi lấy danh sách lý do:", error);
    }
  };

  const fetchReports = async () => {
    try {
      const query = {
        page,
        limit: 5,
        search: searchTerm,
        reasonIds: filterReason,
        status: filterStatus,
      };
      const res = await getAllReport(query);
      if (res.success) {
        setReports(res.data);
        setTotalPages(res.data.meta?.totalPages || 1);
      }
    } catch (error) {
      console.error("Lỗi khi gọi API Reports:", error);
    }
  };

  useEffect(() => {
    fetchReasons();
  }, []);
  useEffect(() => {
    fetchReports();
  }, [page, searchTerm, filterReason, filterStatus]);

  const handleDeleteReport = async (reportId) => {
    const result = await Swal.fire({
      title: "Xác nhận xóa?",
      text: "Báo cáo này sẽ bị xóa khỏi hệ thống.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Xóa ngay",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        const res = await deleteReport(reportId);
        if (res.success) {
          Swal.fire("Đã xóa!", "Báo cáo đã được loại bỏ.", "success");
          fetchReports();
        }
      } catch (err) {
        toast.error("Lỗi khi xóa báo cáo");
      }
    }
  };

  const handleChangeStatus = async (reportId) => {
    try {
      const res = await updateReportStatus(reportId, { status: true });
      if (res.success) {
        toast.success("Cập nhật trạng thái thành công!");
        fetchReports();
        if (selectedReport) setSelectedReport(null); // Đóng modal nếu đang mở
      }
    } catch (err) {
      toast.error("Lỗi cập nhật trạng thái");
    }
  };

  return (
    <div className="p-4 relative">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header & Filter giữ nguyên */}
      <div className="flex flex-col gap-4 rounded-md p-4 bg-gray-100 shadow-md mb-6">
        <div className="flex justify-between items-center">
          <p className="text-lg font-semibold text-black">
            Danh sách báo cáo vi phạm
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <input
            className="flex-1 border border-gray-400 rounded-lg px-4 py-1 text-sm"
            type="text"
            placeholder="Tìm kiếm báo cáo..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
          <select
            className="flex-1 md:w-[200px] border border-gray-400 rounded-lg px-4 py-1 text-sm"
            value={filterReason}
            onChange={(e) => {
              setFilterReason(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Tất cả lý do</option>
            {reasons.map((r) => (
              <option key={r._id} value={r._id}>
                {r.name}
              </option>
            ))}
          </select>
          <select
            className="flex-1 md:w-[200px] border border-gray-400 rounded-lg px-4 py-1 text-sm"
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="false">Chờ xử lý</option>
            <option value="true">Đã xử lý</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-300 rounded-lg p-2">
        <table className="table-auto min-w-[800px] border-collapse w-full">
          <thead className="text-sm bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left border-b">Người báo cáo</th>
              <th className="px-4 py-2 text-left border-b">
                Đối tượng bị báo cáo
              </th>
              <th className="px-4 py-2 text-left border-b">Lý do</th>
              <th className="px-4 py-2 text-left border-b">Ngày gửi</th>
              <th className="px-4 py-2 text-left border-b">Trạng thái</th>
              <th className="px-4 py-2 text-left border-b">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white text-sm text-gray-800">
            {reports.length > 0 ? (
              reports.map((report) => (
                <tr key={report._id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-4">{report.userId?.name || "N/A"}</td>
                  <td className="px-4 py-4">
                    <span className="font-medium text-blue-700">
                      {report.dishId?.name || "Món ăn ẩn"}
                    </span>
                    <br />
                    <span className="text-xs text-gray-500 italic">
                      ({report.storeId?.name || "Cửa hàng ẩn"})
                    </span>
                  </td>
                  <td className="px-4 py-4 font-semibold text-red-500">
                    {report.reasonId?.name}
                  </td>
                  <td className="px-4 py-4">
                    {new Date(report.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-4 py-4">
                    {report.status ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <FaCheckCircle /> Đã xử lý
                      </span>
                    ) : (
                      <span className="text-yellow-600 flex items-center gap-1">
                        <FaHourglassHalf /> Đang chờ
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 flex gap-3 mt-3">
                    <button
                      onClick={() => setSelectedReport(report)}
                      title="Xem chi tiết"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FaEye size={18} />
                    </button>
                    <button
                      onClick={() => handleChangeStatus(report._id)}
                      disabled={report.status}
                      className={`${
                        report.status
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-green-500 hover:text-green-700"
                      }`}
                    >
                      <FaCheckCircle size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteReport(report._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTrash size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="text-center py-6 text-gray-500 italic"
                >
                  Không tìm thấy báo cáo nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- POPUP CHI TIẾT --- */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="flex justify-between items-center p-4 border-b bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">
                Chi tiết báo cáo
              </h3>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-gray-500 hover:text-red-500 transition"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Lý do vi phạm
                </label>
                <p className="text-red-600 font-semibold text-lg">
                  {selectedReport.reasonId?.name}
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Ghi chú từ người dùng (Note)
                </label>
                <div className="mt-1 p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 italic">
                  {selectedReport.note || "Không có nội dung ghi chú."}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Người báo cáo
                  </label>
                  <p className="font-medium text-gray-800">
                    {selectedReport.userId?.name}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Thời gian
                  </label>
                  <p className="font-medium text-gray-800">
                    {new Date(selectedReport.createdAt).toLocaleString("vi-VN")}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-100 transition"
              >
                Đóng
              </button>
              {!selectedReport.status && (
                <button
                  onClick={() => handleChangeStatus(selectedReport._id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition"
                >
                  Xác nhận xử lý
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pagination giữ nguyên */}
      <div className="flex justify-center items-center gap-5 mt-8">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className="px-3 py-1 border rounded disabled:opacity-30"
        >
          Trước
        </button>
        <span className="text-sm font-medium">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages}
          className="px-3 py-1 border rounded disabled:opacity-30"
        >
          Sau
        </button>
      </div>
    </div>
  );
};

export default ReportPage;
