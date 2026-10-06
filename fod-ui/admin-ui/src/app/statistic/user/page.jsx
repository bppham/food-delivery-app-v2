"use client";
import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getUserSummary } from "../../../api/statistics";
import { getErrorMessage } from "../../../../data/errorMessages";
const page = () => {
  const [recent2Weeks, setRecent2Weeks] = useState([]);
  const [ordersByMonth, setOrdersByMonth] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const fetchUserSummary = async () => {
    try {
      const response = await getUserSummary();
      if (response.success) {
        setRecent2Weeks(response.data.recent2Weeks);
        setOrdersByMonth(response.data.ordersByMonth);
        setTopCustomers(response.data.topCustomers);
      }
    } catch (error) {
      getErrorMessage(error.errorCode) || "Lỗi lấy thống kê khách hàng";
    }
  };
  useEffect(() => {
    fetchUserSummary();
  }, []);

  return (
    <div className="p-4 space-y-8">
      <p className="text-xl font-bold mb-2 ml-2">Thống kê khách hàng</p>
      <div className="bg-white shadow rounded p-4">
        <h2 className="font-bold text-lg mb-2">
          Số lượng đơn trong 2 tuần gần nhất
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={recent2Weeks}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend formatter={() => "Số đơn"} />
            <Line
              type="monotone"
              dataKey="count"
              name="Orders"
              stroke="#8884d8"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white shadow rounded p-4">
        <h2 className="font-bold text-lg mb-2">
          Số đơn theo tháng trong năm nay
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={ordersByMonth}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend formatter={() => "Số đơn"} />
            <Bar dataKey="count" name="Orders" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* BXH: Top Customers */}
      <div className="bg-white shadow rounded p-4">
        <h2 className="font-bold text-lg mb-2">
          Khách hàng đặt nhiều đơn nhất
        </h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="border-b p-2">#</th>
              <th className="border-b p-2">Họ tên</th>
              <th className="border-b p-2">Email</th>
              <th className="border-b p-2">Số đơn</th>
            </tr>
          </thead>
          <tbody>
            {topCustomers.map((c, index) => (
              <tr key={c.userId} className="hover:bg-gray-100">
                <td className="p-2">{index + 1}</td>
                <td className="p-2">{c.userName}</td>
                <td className="p-2">{c.email}</td>
                <td className="p-2">{c.orderCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default page;
