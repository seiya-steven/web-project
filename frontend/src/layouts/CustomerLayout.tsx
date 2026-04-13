import {
  LogIn,
  LogOut,
  Search,
  ShoppingCart,
  User,
  UserCog,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";

import { api } from "@/lib/api";
import type { CartItem } from "@/types";
import { useAuthStore } from "@/store/authStore";

export function CustomerLayout() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [cartCount, setCartCount] = useState(0);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!token) {
      setCartCount(0);
      return;
    }
    let cancelled = false;
    const load = () => {
      api
        .get<CartItem[]>("/cart/items")
        .then((res) => {
          if (!cancelled) {
            const total = res.data.reduce((s, i) => s + i.quantity, 0);
            setCartCount(total);
          }
        })
        .catch(() => {
          if (!cancelled) setCartCount(0);
        });
    };
    load();
    const onUpdate = () => load();
    window.addEventListener("shopee-cart-updated", onUpdate);
    return () => {
      cancelled = true;
      window.removeEventListener("shopee-cart-updated", onUpdate);
    };
  }, [token, user?.id]);

  return (
    <div className="flex min-h-screen flex-col bg-stone-50">
      <header className="sticky top-0 z-40 border-b border-orange-100 bg-shopee shadow-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="flex items-center gap-2 text-xl font-bold tracking-tight text-white"
            >
              <img src="/shopee-logo.webp" alt="Shopee Logo" className="h-8 w-auto" />
              Shopee Clone
            </Link>
            {user?.role === "admin" && (
              <Link
                to="/admin/dashboard"
                className="hidden items-center gap-1 rounded-md bg-white/15 px-2 py-1 text-sm text-white hover:bg-white/25 sm:flex"
              >
                <UserCog className="h-4 w-4" />
                Admin
              </Link>
            )}
          </div>

          <div className="flex flex-1 items-center gap-2 sm:max-w-xl">
            <div className="relative flex flex-1">
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm sản phẩm, danh mục..."
                className="w-full rounded-sm border-0 py-2 pl-3 pr-10 text-sm text-stone-800 shadow-inner outline-none ring-2 ring-white/30 focus:ring-white"
              />
              <button
                type="button"
                className="absolute right-1 top-1/2 flex h-8 w-9 -translate-y-1/2 items-center justify-center rounded-sm bg-shopee text-white hover:bg-shopee-dark"
                aria-label="Tìm kiếm"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </div>

          <nav className="flex items-center justify-end gap-1 sm:gap-2">
            <Link
              to="/cart"
              className="relative flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-white/10"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="hidden sm:inline">Giỏ hàng</span>
              {cartCount > 0 && (
                <span className="absolute -right-0 -top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-xs font-bold text-shopee">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            {token && user ? (
              <>
                <Link
                  to="/profile"
                  className="flex max-w-[140px] items-center gap-1 truncate rounded-md px-2 py-2 text-sm text-white hover:bg-white/10"
                >
                  <User className="h-5 w-5 shrink-0" />
                  <span className="hidden truncate sm:inline">{user.full_name}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                  className="flex items-center gap-1 rounded-md px-2 py-2 text-sm text-white hover:bg-white/10"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="hidden sm:inline">Thoát</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1 rounded-md bg-white px-3 py-2 text-sm font-semibold text-shopee hover:bg-orange-50"
              >
                <LogIn className="h-5 w-5" />
                Đăng nhập
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet context={{ searchQuery: q }} />
      </main>

      <footer className="border-t border-stone-200 bg-white py-8 text-center text-sm text-stone-500">
        <p>© {new Date().getFullYear()} Shopee Clone — Dự án học tập Fullstack.</p>
      </footer>
    </div>
  );
}
