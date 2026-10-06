"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faIdBadge,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import { getProfile } from "../../api/profile";

const Navbar = ({ toggleSidebar }) => {
  const [avatar, setAvatar] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const response = await getProfile();
        setAvatar(response.data.avatarImage.url);
      } catch (error) {
        console.error(error);
      }
    };
    fetchInfo();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/auth/login";
  };
  return (
    <div className="w-full h-[60px] bg-gradient-to-r from-blue-500 to-cyan-500 shadow-md sticky top-0 z-100 border-0 border-b border-solid border-gray-400">
      <div className="flex justify-between items-center px-4 py-2">
        <div className="md:hidden block">
          <button
            type="button"
            className="border-solid border-blue-600 border-2 rounded-md p-2 ml-4 hover:bg-blue-400 text-white hover:text-gray-600"
            onClick={toggleSidebar}
          >
            <FontAwesomeIcon icon={faBars} color="white"/>
          </button>
        </div>
        <a className="md:block hidden" href="/home">
          <div className="flex items-center gap-2">
            <Image
              src="/assets/logo.png"
              alt="Logo"
              width={50}
              height={50}
              className="rounded-[8px]"
            />
            <span className="font-semibold text-lg tracking-wider text-white">
              PTIT ENJOY MANAGEMENT
            </span>
          </div>
        </a>
        <div>
          <img
            src={
              avatar ||
              "https://res.cloudinary.com/datnguyen240/image/upload/v1722168751/avatars/avatar_pnncdk.png"
            }
            alt="Your avatar"
            className="w-8 h-8 rounded-full cursor-pointer"
            onClick={() => setShowDropdown(!showDropdown)}
          />

          {/* ✅ Dropdown menu */}
          {showDropdown && (
            <div className="absolute right-0 top-[50px] w-[200px] bg-white overflow-hidden rounded-lg shadow-xl/20 px-2 py-1 border border-solid border-gray-300">
              <Link href="/account">
                <div className="flex justify-start items-center gap-2 cursor-pointer p-4 hover:bg-gray-100 text-sm rounded-md">
                  <FontAwesomeIcon icon={faIdBadge} />
                  <p>Tài khoản cá nhân</p>
                </div>
              </Link>
              <div
                onClick={handleLogout}
                className="flex justify-start items-center gap-2 text-red-500 font-semibold p-4 cursor-pointer hover:bg-gray-100 text-sm rounded-md"
              >
                <FontAwesomeIcon icon={faRightFromBracket} />
                <p>Đăng xuất</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
