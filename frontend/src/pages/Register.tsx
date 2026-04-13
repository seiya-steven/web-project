import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { api } from "@/lib/api";
import type { AuthResponse } from "@/types";
import { useAuthStore } from "@/store/authStore";

export function Register() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await api.post<AuthResponse>(
        "/auth/register",
        {
          full_name: fullName.trim(),
          email: email.trim(),
          password,
        },
        { headers: { "Content-Type": "application/json" } },
      );
      setAuth(res.data.access_token, res.data.user);
      navigate("/", { replace: true });
    } catch {
      setErr("Đăng ký thất bại. Email có thể đã tồn tại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-lg">
        <h1 className="text-center text-2xl font-bold text-shopee">Tạo tài khoản</h1>
        <p className="mt-1 text-center text-sm text-stone-500">
          Tham gia mua sắm cùng Shopee Clone
        </p>
        {err && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {err}
          </p>
        )}
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-stone-700">
              Họ và tên
            </label>
            <input
              id="name"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2.5 outline-none ring-shopee focus:ring-2"
            />
          </div>
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
              Mật khẩu (tối thiểu 6 ký tự)
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
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
            {loading ? "Đang tạo..." : "Đăng ký"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-stone-600">
          Đã có tài khoản?{" "}
          <Link to="/login" className="font-semibold text-shopee hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
