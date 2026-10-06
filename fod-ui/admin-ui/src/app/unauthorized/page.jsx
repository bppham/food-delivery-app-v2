import React from "react";

const page = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-3xl font-bold mb-4 text-red-600">
        403 - Unauthorized
      </h1>
      <p className="text-gray-600 mb-6">
        Bạn không có quyền truy cập trang này.
      </p>
      <a href="/home" className="text-blue-600 underline">
        Quay lại trang chủ
      </a>
    </div>
  );
};

export default page;
