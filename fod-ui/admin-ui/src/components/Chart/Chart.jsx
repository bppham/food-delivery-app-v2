"use client";
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const Chart = ({
  title = "Chart Title",
  data = [],
  dataKey = "count",
  grid = true,
}) => {
  // Chuyển month số thành chuỗi Tháng 1, Tháng 2...
  const formattedData = data.map((item) => ({
    ...item,
    monthLabel: `Tháng ${item.month}`,
  }));

  return (
    <div className="chart w-full h-full">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={formattedData}
          margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
        >
          <XAxis dataKey="monthLabel" stroke="#3366ff" />
          <YAxis stroke="#3366ff" />
          <Tooltip formatter={(value) => [`${value}`, "Số đơn"]} />
          {grid && <CartesianGrid stroke="#e0dfdf" strokeDasharray="5 5" />}
          <Legend formatter={() => "Số đơn"} />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke="#3366ff"
            name="Số đơn"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;
