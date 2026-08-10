import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import Topbar from "../components/Topbar.jsx";

const titles = {
  "/": ["Dashboard", "Store performance at a glance"],
  "/products": ["Products", "Catalog and inventory"],
  "/orders": ["Orders", "Track and fulfill customer orders"],
  "/users": ["Customers", "Registered accounts"],
  "/categories": ["Categories", "Organize your catalog"],
  "/reviews": ["Reviews", "Customer feedback on products"],
};

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const [title, subtitle] = titles[pathname] || titles["/"];

  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar
          title={title}
          subtitle={subtitle}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 p-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
