import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  Package,
  Users,
  ShoppingCart,
  Tags,
  Star,
  BookText,
  X,
} from "lucide-react";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutGrid, end: true },
  { to: "/products", label: "Products", icon: Package },
  { to: "/orders", label: "Orders", icon: ShoppingCart },
  { to: "/users", label: "Customers", icon: Users },
  { to: "/categories", label: "Categories", icon: Tags },
  { to: "/reviews", label: "Reviews", icon: Star },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-ink/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed z-40 flex h-full w-60 flex-col bg-ink text-paper transition-transform lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2">
            <BookText size={20} className="text-amber" />
            <div>
              <p className="font-display text-sm font-semibold leading-none">
                Ledger
              </p>
              <p className="mt-0.5 text-[11px] text-paper/50">
                Commerce Ops
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-paper/60 hover:text-paper lg:hidden"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-paper/10 text-paper font-medium"
                    : "text-paper/60 hover:bg-paper/5 hover:text-paper"
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-paper/10 px-5 py-4 text-[11px] text-paper/40">
          E-Commerce Management System
          <br />
          v1.0 · Database Project
        </div>
      </aside>
    </>
  );
}
