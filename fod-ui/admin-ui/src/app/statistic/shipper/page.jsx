"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getShipperSummary } from "../../../api/statistics";
import { getErrorMessage } from "../../../../data/errorMessages";

const DashboardShippers = () => {
  const [totalShippers, setTotalShippers] = useState(0);
  const [onlineShippers, setOnlineShippers] = useState(0);
  const [shippersByMonth, setShippersByMonth] = useState([]);

  const fetchShipperSummary = async () => {
    try {
      const response = await getShipperSummary();
      if (response.success) {
        const data = response.data;
        setTotalShippers(data.totalShippers);
        setOnlineShippers(data.onlineShippers);
        setShippersByMonth(data.shippersByMonth);
      }
    } catch (error) {
      toast.error(
        getErrorMessage(error.errorCode) || "Lỗi lấy thống kê shipper"
      );
    }
  };

  useEffect(() => {
    fetchShipperSummary();
  }, []);

  return (
    <div className="p-4 space-y-8">
      <p className="text-xl font-bold mb-2 ml-2">Thống kê shipper</p>
      {/* Tổng số liệu */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-500 text-white shadow rounded p-4 text-center">
          <h3 className="font-bold">Tổng shipper</h3>
          <p className="text-2xl">{totalShippers}</p>
        </div>
        <div className="bg-green-500 text-white shadow rounded p-4 text-center">
          <h3 className="font-bold">Online</h3>
          <p className="text-2xl">{onlineShippers}</p>
        </div>
      </div>

      {/* Bar Chart Shippers By Month */}
      <div className="bg-white shadow rounded p-4">
        <h2 className="font-bold text-lg mb-2">Shipper đăng ký theo tháng</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={shippersByMonth}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend formatter={() => "Số lượng"} />
            <Bar dataKey="count" name="Shippers" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardShippers;
