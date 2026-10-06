"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

export default function RequireAuth({ children, allowedRoles }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/auth/login");
      return;
    }

    try {
      const user = jwtDecode(token);
      const roles = user.role || [];

      // Kiểm tra quyền
      if (allowedRoles && !allowedRoles.some((r) => roles.includes(r))) {
        router.replace("/unauthorized");
      }
    } catch (err) {
      console.error("Token error:", err);
      router.replace("/auth/login");
    } finally {
      setLoading(false);
    }
  }, [router, allowedRoles]);

  if (loading)
    return <div className="p-5 text-gray-500">Đang kiểm tra quyền...</div>;

  return <>{children}</>;
}
