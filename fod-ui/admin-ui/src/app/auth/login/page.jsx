"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Lottie from "lottie-react";
import animLogin from "../../../../public/assets/anim/business-analysis.json";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import ClipLoader from "react-spinners/ClipLoader";
import { getErrorMessage } from "../../../../data/errorMessages";
import Swal from "sweetalert2";

import { login } from "../../../api/auth";
const Page = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await login(email, password);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("adminId", JSON.stringify(res.data._id));

      toast.success("Đăng nhập thành công!", {
        position: "top-right",
        closeButton: false,
      });

      setTimeout(() => router.push("/home"), 1000);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Đăng nhập thất bại!",
        text: getErrorMessage(err.errorCode),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <ClipLoader size={50} color="blue" />
        </div>
      )}
      <ToastContainer />
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-blue-100 to-blue-500 px-4">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 w-full max-w-6xl py-10">
          {/* Animation (chỉ hiển thị từ md trở lên) */}
          <div className="hidden md:flex flex-1 flex-col items-center justify-center">
            <h1 className="text-3xl font-bold mb-3 text-blue-700 text-center">
              Phần mềm quản lý Hệ thống Đặt đồ ăn
            </h1>
            <p className="italic text-gray-600 font-medium text-center">
              Đăng nhập để sử dụng các tính năng
            </p>
            <div className="w-[400px]">
              <Lottie animationData={animLogin} loop={true} autoplay={true} />
            </div>
          </div>

          {/* Form */}
          <form
            className="flex flex-1 w-full items-center justify-center pt-[60px]"
            onSubmit={handleLogin}
          >
            <div className=" max-w-md bg-white p-8 rounded-2xl shadow-lg  w-full">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Đăng nhập
              </h2>
              <p className="text-sm text-gray-500 mb-5">
                Nhập thông tin để truy cập
              </p>

              <div className="mb-5">
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-gray-900"
                >
                  Email:
                </label>
                <input
                  type="email"
                  id="email"
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="name@gmail.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="mb-5 relative">
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-gray-900"
                >
                  Mật khẩu:
                </label>
                <input
                  type={passwordVisible ? "text" : "password"}
                  id="password"
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  className="absolute right-3 top-[38px] text-gray-500"
                >
                  <FontAwesomeIcon
                    icon={passwordVisible ? faEyeSlash : faEye}
                  />
                </button>
              </div>
              <div className="flex justify-end mb-4">
                <a
                  href="/auth/forgot-password"
                  className="text-blue-600 italic hover:text-blue-500"
                >
                  Quên mật khẩu?
                </a>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-lg hover:bg-blue-700 transition"
              >
                Đăng nhập
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Page;
