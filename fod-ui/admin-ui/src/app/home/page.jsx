"use client";
import React, { useEffect, useState } from "react";
import Chart from "../../components/Chart/Chart";
import { FiUsers, FiHome, FiUser } from "react-icons/fi";
import { getDashboardSummary } from "../../api/statistics";
import { getErrorMessage } from "../../../data/errorMessages";
const page = () => {
  const [orderData, setOrderData] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalStores, setTotalStores] = useState(0);
  const [totalShippers, setTotalShippers] = useState(0);
  const fetchDashboardSummary = async () => {
    try {
      const response = await getDashboardSummary();
      if (response.success) {
        setOrderData(response.data.ordersByMonth);
        setTotalUsers(response.data.totalUsers);
        setTotalStores(response.data.totalStores);
        setTotalShippers(response.data.totalShippers);
      }
    } catch (error) {
      getErrorMessage(error.errorCode);
    }
  };
  useEffect(() => {
    fetchDashboardSummary();
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Featured Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white shadow-md rounded-lg p-6 flex items-center gap-4">
          {/* Icon */}
          <div className="text-yellow-500 text-3xl">
            <FiUsers />
          </div>
          {/* Text */}
          <div className="flex flex-col">
            <span className="text-gray-500 text-sm">Tổng khách hàng</span>
            <span className="text-2xl font-bold">{totalUsers}</span>
          </div>
        </div>
        <div className="bg-white shadow-md rounded-lg p-6 flex items-center gap-4">
          {/* Icon */}
          <div className="text-red-500 text-3xl">
            <FiHome />
          </div>
          {/* Text */}
          <div className="flex flex-col">
            <span className="text-gray-500 text-sm">Tổng cửa hàng</span>
            <span className="text-2xl font-bold">{totalStores}</span>
          </div>
        </div>
        <div className="bg-white shadow-md rounded-lg p-6 flex items-center gap-4">
          {/* Icon */}
          <div className="text-green-500 text-3xl">
            <FiUser />
          </div>
          {/* Text */}
          <div className="flex flex-col">
            <span className="text-gray-500 text-sm">Tổng shipper</span>
            <span className="text-2xl font-bold">{totalShippers}</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[calc(100vh-250px)] bg-white p-4 rounded-lg shadow-md mt-6">
        <Chart
          data={orderData}
          title="Các đơn trong năm nay (theo tháng)"
          grid
          dataKey="count"
        />
      </div>
    </div>
  );
};

export default page;
