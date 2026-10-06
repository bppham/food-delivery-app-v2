"use client";

import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getStoreSummary } from "../../../api/statistics";
import { getErrorMessage } from "../../../../data/errorMessages";
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const page = () => {
  const [totals, setTotals] = useState({ stores: 0, dishes: 0, categories: 0 });
  const [topStores, setTopStores] = useState([]);
  const [topDishes, setTopDishes] = useState([]);

  const fetchStoreSummary = async () => {
    try {
      const response = await getStoreSummary();
      if (response.success) {
        const data = response.data;
        setTotals(data.totals);
        setTopStores(data.topStores);
        setTopDishes(data.topDishes);
      }
    } catch (error) {
      getErrorMessage(error.errorCode) || "Lỗi lấy thống kê cửa hàng";
    }
  };

  useEffect(() => {
    fetchStoreSummary();
  }, []);

  // Dữ liệu cho Pie Chart: topStores
  const pieData = topStores.map((store) => ({
    name: store.storeName,
    value: store.orderCount,
  }));

  return (
    <div className="p-4 space-y-8">
      <p className="text-xl font-bold mb-2 ml-2">Thống kê cửa hàng</p>
      {/* Tổng số liệu */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-yellow-500 text-white shadow rounded p-4 text-center">
          <h3 className="font-bold">Cửa hàng</h3>
          <p className="text-2xl">{totals.stores}</p>
        </div>
        <div className="bg-green-500 text-white shadow rounded p-4 text-center">
          <h3 className="font-bold">Món ăn</h3>
          <p className="text-2xl">{totals.dishes}</p>
        </div>
        <div className="bg-red-500 text-white shadow rounded p-4 text-center">
          <h3 className="font-bold">Danh mục</h3>
          <p className="text-2xl">{totals.categories}</p>
        </div>
      </div>

      {/* Pie Chart Top Stores */}
      <div className="bg-white shadow rounded p-4">
        <h2 className="font-bold text-lg mb-2">
          Top cửa hàng có đơn nhiều nhất
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* BXH Top Stores */}
      <div className="bg-white shadow rounded p-4">
        <h2 className="font-bold text-lg mb-2">Top cửa hàng có nhiều đơn</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="border-b p-2">#</th>
              <th className="border-b p-2">Tên cửa hàng</th>
              <th className="border-b p-2">Số đơn</th>
            </tr>
          </thead>
          <tbody>
            {topStores.map((store, index) => (
              <tr key={store.storeId} className="hover:bg-gray-100">
                <td className="p-2">{index + 1}</td>
                <td className="p-2">{store.storeName}</td>
                <td className="p-2">{store.orderCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* BXH Top Dishes */}
      <div className="bg-white shadow rounded p-4">
        <h2 className="font-bold text-lg mb-2">Các món ăn hot nhất</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="border-b p-2">#</th>
              <th className="border-b p-2">Tên món</th>
              <th className="border-b p-2">Tên quán</th>
              <th className="border-b p-2">Đã bán</th>
              <th className="border-b p-2">Giá</th>
            </tr>
          </thead>
          <tbody>
            {topDishes.map((dish, index) => (
              <tr key={dish.dishId} className="hover:bg-gray-100">
                <td className="p-2">{index + 1}</td>
                <td className="p-2">{dish.dishName}</td>
                <td className="p-2">{dish.storeName}</td>
                <td className="p-2">{dish.totalSold}</td>
                <td className="p-2">{dish.price.toLocaleString()}₫</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default page;
