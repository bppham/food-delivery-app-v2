"use client";
import { blockStore, getInformation } from "../../../../../api/store";
import { useParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ModalImage from "react-modal-image";
import { FaLock } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { getErrorMessage } from "../../../../../../data/errorMessages";
const Page = () => {
  const router = useRouter();
  const { id } = useParams();
  const [store, setStore] = useState(null);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const res = await getInformation(id);
        if (res.success) {
          console.log("Store data:", res.data);
          setStore(res.data);
        } else {
          toast.error("Lỗi khi lấy thông tin cửa hàng: " + res.message);
        }
      } catch (error) {
        toast.error(
          getErrorMessage(error.errorCode) || "Không thể tải thông tin cửa hàng"
        );
      }
    };

    if (id) {
      fetchStore();
    }
  }, [id]);

  if (!store) {
    return <div className="p-6">Đang tải dữ liệu...</div>;
  }

  // ✅ Lấy danh sách tên category, ví dụ: "Đường phố, Hải sản"
  const categoryNames = store.systemCategoryId
    ?.map((cat) => cat.name)
    .join(", ");

  const handleReturn = () => {
    router.push(`/store/management/active`);
  };

  const handleBlock = async (storeId) => {
    const result = await Swal.fire({
      title: "Xác nhận Khóa cửa hàng?",
      text: "Bạn có chắc muốn Khóa cửa hàng này không?",
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
          toast.success("Khóa cửa hàng thành công!");
          Swal.fire({
            title: "Thành công!",
            text: "Cửa hàng đã không còn hoạt động được.",
            icon: "success",
            confirmButtonText: "OK",
          });
          router.push(`/store/management/active`);
        }
      } catch (error) {
        getErrorMessage(error.errorCode) ||
          toast.error("Khóa cửa hàng thất bại!");
      }
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <p className="text-lg font-bold mb-5">Chi tiết cửa hàng</p>

      <div className="border-solid border border-gray-300 p-4 sm:p-6 rounded-lg shadow-md sm:shadow-xl bg-white">
        <p className="text-lg sm:text-xl font-semibold text-blue-600 mb-4 text-center sm:text-left">
          Thông tin chung
        </p>
        <div className="flex flex-col gap-3 text-sm sm:text-base">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <label className="font-semibold min-w-[140px]">Tên cửa hàng:</label>
            <p className="break-words">{store.name}</p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <label className="font-semibold min-w-[140px]">Mô tả:</label>
            <p className="break-words">{store.description}</p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <label className="font-semibold min-w-[140px]">Địa chỉ:</label>
            <p className="break-words">{store.address_full}</p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <label className="font-semibold min-w-[140px]">Danh mục:</label>
            <p className="break-words">
              {categoryNames || "Không có danh mục"}
            </p>
          </div>
        </div>
      </div>

      <div className="border-solid border border-gray-300 p-4 sm:p-6 rounded-lg shadow-md bg-white mt-4">
        <p className="text-lg sm:text-xl font-semibold text-blue-600 mb-4 text-center sm:text-left">
          Giờ hoạt động & Ảnh
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Cột 1: Giờ hoạt động */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label className="font-semibold min-w-[120px]">Giờ mở cửa:</label>
              <p className="break-words">{store.openHour}</p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label className="font-semibold min-w-[120px]">
                Giờ đóng cửa:
              </label>
              <p className="break-words">{store.closeHour}</p>
            </div>
          </div>

          {/* Cột 2: Ảnh */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <label className="font-semibold min-w-[120px]">Ảnh:</label>
              <ModalImage
                small={store.avatarImage.url}
                large={store.avatarImage.url}
                alt="Ảnh đại diện"
                className="rounded-full w-[50px] h-[50px] object-cover cursor-zoom-in"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <label className="font-semibold min-w-[120px]">Ảnh bìa:</label>
              <ModalImage
                small={store.coverImage.url}
                large={store.coverImage.url}
                alt="Ảnh bìa"
                className="object-cover w-full sm:w-[200px] h-[80px] rounded-md shadow-sm cursor-zoom-in"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="border-solid border border-gray-300 p-4 sm:p-6 rounded-lg shadow-md bg-white mt-4">
        <p className="text-lg sm:text-xl font-semibold text-blue-600 mb-4 text-center sm:text-left">
          Giấy tờ
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Cột 1: Giờ hoạt động */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label className="font-semibold min-w-[180px]">
                Mặt trước Căn cước:
              </label>
              <ModalImage
                small={store.ICFrontImage.url}
                large={store.ICFrontImage.url}
                alt="Mặt trước căn cước"
                className="object-cover w-[200px] h-[80px] rounded-md shadow-sm cursor-zoom-in"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label className="font-semibold min-w-[180px]">
                Mặt sau Căn cước:
              </label>
              <ModalImage
                small={store.ICBackImage.url}
                large={store.ICBackImage.url}
                alt="Mặt sau căn cước"
                className="object-cover w-[200px] h-[80px] rounded-md shadow-sm cursor-zoom-in"
              />
            </div>
          </div>

          {/* Cột 2: Ảnh */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-3">
            <label className="font-semibold min-w-[120px]">Giấy phép:</label>
            <ModalImage
              small={store.BusinessLicenseImage.url}
              large={store.BusinessLicenseImage.url}
              alt="Ảnh giấy phép"
              className="object-contain w-full sm:w-[200px] h-auto max-h-[400px] rounded-md shadow-md cursor-zoom-in border"
            />
          </div>
        </div>
      </div>

      <div className="border-solid border border-gray-300 p-4 sm:p-6 rounded-lg shadow-md sm:shadow-xl bg-white mt-4">
        <p className="text-lg sm:text-xl font-semibold text-blue-600 mb-4 text-center sm:text-left">
          Chủ cửa hàng
        </p>
        <div className="flex gap-3"></div>
        <div className="flex flex-col gap-3 text-sm sm:text-base">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <label className="font-semibold min-w-[140px]">Họ và tên:</label>
            <p className="break-words">{store.owner.name}</p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <label className="font-semibold min-w-[140px]">Email:</label>
            <p className="break-words">{store.owner.email}</p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <label className="font-semibold min-w-[140px]">
              Số điện thoại:
            </label>
            <p className="break-words">{store.owner.phonenumber}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center p-4 mt-4">
        <button
          onClick={() => handleReturn()}
          className="bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold w-[100px] py-2 rounded-lg transition-colors"
        >
          Trở lại
        </button>
        <button
          onClick={() => handleBlock(store._id)}
          className="flex gap-2 items-center justify-center bg-red-600 hover:bg-red-500 text-white text-xs font-semibold w-[150px] py-2 rounded-lg transition-colors"
        >
          <FaLock />
          Khóa cửa hàng
        </button>
      </div>
    </div>
  );
};

export default Page;
