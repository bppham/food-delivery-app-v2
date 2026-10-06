"use client";

import Sidebar from "../components/Sidebar/Sidebar";
import Navbar from "../components/Navbar/Navbar";
import RequireAuth from "../components/RequireAuth";
import RequireRole from "../components/RequireRole";
import { usePathname } from "next/navigation";
import { useState } from "react";
import "./globals.css";

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/auth");
  const [isOpenSidebar, setIsOpenSidebar] = useState(false);

  const toggleSidebar = () => setIsOpenSidebar((prev) => !prev);

  const content = (
    <>
      {!isAuthPage && <Navbar toggleSidebar={toggleSidebar} />}
      <div
        className={`flex ${isAuthPage ? "h-screen" : "h-[calc(100vh-60px)]"}`}
      >
        {!isAuthPage && <Sidebar isOpen={isOpenSidebar} />}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
      {isOpenSidebar && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpenSidebar(false)}
        ></div>
      )}
    </>
  );

  return (
    <html>
      <body className="h-screen overflow-hidden">
        {isAuthPage ? (
          content
        ) : (
          <RequireAuth>
            <RequireRole>{content}</RequireRole>
          </RequireAuth>
        )}
      </body>
    </html>
  );
}
