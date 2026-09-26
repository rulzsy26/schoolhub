"use client";

import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function DashboardShell({ children, role }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="school-bg min-h-screen">
      <Sidebar
        role={role}
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="main-shell ml-0 min-h-screen lg:ml-[270px]">
        <Header
          role={role}
          onMenuClick={() => setSidebarOpen((value) => !value)}
        />

        <main className="p-3 pb-8 sm:p-5 lg:p-7">{children}</main>
      </div>
    </div>
  );
}
