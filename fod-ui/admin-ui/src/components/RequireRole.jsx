"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import sidebarData from "../../data/sidebar";
import { jwtDecode } from "jwt-decode";

export default function RequireRole({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true); // ✅ trạng thái kiểm tra quyền

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Right herre ");
      router.replace("/auth/login");
      return;
    }

    let decoded;
    try {
      decoded = jwtDecode(token);
    } catch (error) {
      console.error("Invalid token");
      router.replace("/auth/login");
      return;
    }

    const userRoles = decoded.role || [];
    const allowedRoles = findAllowedRoles(pathname);

    // Nếu route không có trong sidebar thì cho qua
    if (!allowedRoles) {
      setChecking(false);
      return;
    }

    const hasAccess = userRoles.some((role) => allowedRoles.includes(role));
    if (!hasAccess) {
      router.replace("/unauthorized");
      return;
    }

    // ✅ Nếu có quyền
    setChecking(false);
  }, [pathname, router]);

  if (checking)
    return (
      <div className="p-5 text-gray-500">Đang kiểm tra quyền truy cập...</div>
    );

  return <>{children}</>;
}

// Helper
function findAllowedRoles(pathname) {
  for (const section of sidebarData) {
    for (const item of section.items) {
      if (pathname.startsWith(item.href)) {
        return item.roles;
      }
    }
  }
  return null;
}
