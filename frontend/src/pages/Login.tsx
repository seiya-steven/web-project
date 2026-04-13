import axios from "axios";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { api } from "@/lib/api";
import type { AuthResponse } from "@/types";
import { useAuthStore } from "@/store/authStore";

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: string } | null)?.from ?? "/";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const payload = {
      email: email.trim(),
      password,
    };
    try {
      const res = await api.post<AuthResponse>(
        "/auth/login",
        payload,
        {
          headers: { "Content-Type": "application/json" },
        },
      );
      setAuth(res.data.access_token, res.data.user);
      if (res.data.user.role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate(from === "/login" ? "/" : from, { replace: true });
      }
    } catch (caught) {
      if (axios.isAxiosError(caught) && caught.response?.status === 422) {
        const data = caught.response.data as {
          detail?: Array<{ msg?: string }> | string;
        };
        if (Array.isArray(data.detail)) {
          setErr(data.detail.map((x) => x.msg ?? "").filter(Boolean).join(" "));
        } else if (typeof data.detail === "string") {
          setErr(data.detail);
        } else {
          setErr("Dữ liệu không hợp lệ (422). Kiểm tra email và mật khẩu.");
        }
      } else {
        setErr("Đăng nhập thất bại. Kiểm tra email và mật khẩu.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-lg">
        <h1 className="text-center text-2xl font-bold text-shopee">Đăng nhập</h1>
        <p className="mt-1 text-center text-sm text-stone-500">
          Chào mừng bạn quay lại Shopee Clone
        </p>
        {err && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {err}
          </p>
        )}
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-stone-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2.5 outline-none ring-shopee focus:ring-2"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-stone-700"
            >
              Mật khẩu
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2.5 outline-none ring-shopee focus:ring-2"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-shopee py-3 font-bold text-white hover:bg-shopee-dark disabled:opacity-60"
          >
            {loading ? "Đang xử lý..." : "Đăng nhập"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-stone-600">
          Chưa có tài khoản?{" "}
          <Link to="/register" className="font-semibold text-shopee hover:underline">
            Đăng ký
          </Link>
        </p>
        <p className="mt-4 text-center text-xs text-stone-400">
          Admin mặc định: admin@shopeeclone.dev / admin123
        </p>
      </div>
    </div>
  );
}
