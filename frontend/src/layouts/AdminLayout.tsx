import {
  BarChart3,
  LayoutDashboard,
  LogOut,
  Package,
  Users,
} from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { useAuthStore } from "@/store/authStore";

const navCls = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
    isActive
      ? "bg-shopee-light text-shopee shadow-sm"
      : "text-stone-600 hover:bg-stone-100 hover:text-shopee"
  }`;

export function AdminLayout() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <div className="flex min-h-screen bg-stone-100">
      <aside className="flex w-60 shrink-0 flex-col border-r border-stone-200 bg-white shadow-sm">
        <div className="border-b border-stone-100 p-4">
          <div className="flex items-center gap-2 text-shopee">
            <LayoutDashboard className="h-8 w-8" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-stone-400">
                Quản trị
              </p>
              <p className="font-bold text-stone-800">Shopee Clone</p>
            </div>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 p-3">
          <NavLink to="/admin/dashboard" className={navCls}>
            <BarChart3 className="h-5 w-5 shrink-0" />
            Thống kê
          </NavLink>
          <NavLink to="/admin/products" className={navCls}>
            <Package className="h-5 w-5 shrink-0" />
            Quản lý sản phẩm
          </NavLink>
          <NavLink to="/admin/customers" className={navCls}>
            <Users className="h-5 w-5 shrink-0" />
            Quản lý user
          </NavLink>
        </nav>
        <div className="border-t border-stone-100 p-3">
          <button
            type="button"
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-stone-600 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-5 w-5" />
            Đăng xuất
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-stone-200 bg-white px-6 shadow-sm">
          <h1 className="text-lg font-semibold text-stone-800">
            Xin chào, {user?.full_name ?? "Admin"}
          </h1>
          <NavLink
            to="/"
            className="text-sm font-medium text-shopee hover:text-shopee-dark"
          >
            Về cửa hàng
          </NavLink>
        </header>
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
