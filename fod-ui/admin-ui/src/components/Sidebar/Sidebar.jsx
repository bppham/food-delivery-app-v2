"use client";
import Link from "next/link";
import Image from "next/image";
import sidebarData from "../../../data/sidebar";
import { getCurrentUser } from "../../utils/auth";

const Sidebar = ({ isOpen }) => {
  const user = getCurrentUser();
  const roles = user?.role || [];
  return (
    <div
      className={`
    fixed md:sticky
    top-[60px] md:top-[60px]
    h-[calc(100vh-60px)] bg-white shadow-md border-r border-gray-200
    transform transition-transform duration-300 z-40
    ${isOpen ? "translate-x-0" : "-translate-x-full"}
    md:translate-x-0 md:shadow-none md:w-[250px]
  `}
    >
      {/* Logo chỉ hiện mobile */}
      <div className="md:hidden block p-4">
        <div className="flex items-center gap-2">
          <Image
            src="/assets/logo.png"
            alt="Logo"
            width={40}
            height={40}
            className="rounded-[8px]"
          />
          <span className="font-semibold text-lg tracking-wider text-blue-700">
            MANAGEMENT
          </span>
        </div>
      </div>

      <div className="text-gray-700 p-5 overflow-y-auto h-full md:w-[250px] border-0 border-r border-gray-300 border-solid">
        {sidebarData.map((menu, index) => {
          // lọc item có quyền
          const filteredItems = menu.items.filter((item) =>
            item.roles ? item.roles.some((r) => roles.includes(r)) : trueb
          );

          // nếu không có item nào hợp lệ thì ẩn luôn cả group
          if (filteredItems.length === 0) return null;

          return (
            <div key={index} className="mb-6">
              <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                {menu.title}
              </div>
              <ul className="list-none p-0">
                {filteredItems.map((item, idx) => (
                  <Link href={item.href} key={idx} className="block">
                    <li className="p-2 cursor-pointer flex items-center rounded-md gap-3 hover:bg-gray-100">
                      <div className="relative w-[24px] h-[24px]">
                        <Image
                          src={item.icon}
                          alt={item.label}
                          fill
                          className="rounded-md object-cover"
                        />
                      </div>
                      <span className="text-sm">{item.label}</span>
                    </li>
                  </Link>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
