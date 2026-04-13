import { useEffect, useState } from "react";

import { api } from "@/lib/api";
import type { User } from "@/types";
import { useAuthStore } from "@/store/authStore";

export function Profile() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [fresh, setFresh] = useState<User | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    api
      .get<User>("/auth/me")
      .then((res) => {
        setFresh(res.data);
        setUser(res.data);
        setErr(null);
      })
      .catch(() => setErr("Không tải được hồ sơ từ máy chủ."));
  }, [token, setUser]);

  const display = fresh ?? user;

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="text-2xl font-bold text-stone-800">Hồ sơ</h1>
      {err && (
        <p className="mt-3 text-sm text-red-600">{err}</p>
      )}
      {display ? (
        <div className="mt-8 space-y-4 rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <div>
            <p className="text-xs font-medium uppercase text-stone-400">Họ tên</p>
            <p className="text-lg font-semibold text-stone-800">
              {display.full_name}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-stone-400">Email</p>
            <p className="text-stone-700">{display.email}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-stone-400">Vai trò</p>
            <p className="inline-block rounded-full bg-shopee-light px-3 py-1 text-sm font-medium text-shopee">
              {display.role === "admin" ? "Quản trị viên" : "Khách hàng"}
            </p>
          </div>
        </div>
      ) : (
        <p className="mt-8 text-stone-500">Chưa có dữ liệu người dùng.</p>
      )}
    </div>
  );
}
