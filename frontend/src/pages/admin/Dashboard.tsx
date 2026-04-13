import { Package, Users } from "lucide-react";
import { useEffect, useState } from "react";

import { api } from "@/lib/api";
import type { Stats } from "@/types";

export function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Stats>("/admin/stats")
      .then((res) => {
        setStats(res.data);
        setErr(null);
      })
      .catch(() => setErr("Không tải được thống kê."));
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold text-stone-800">Tổng quan</h2>
      {err && (
        <p className="mt-3 text-sm text-red-600">{err}</p>
      )}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-shopee-light p-3 text-shopee">
              <Users className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm text-stone-500">Tổng người dùng</p>
              <p className="text-3xl font-bold text-stone-800">
                {stats?.total_users ?? "—"}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-100 p-3 text-orange-600">
              <Package className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm text-stone-500">Tổng sản phẩm</p>
              <p className="text-3xl font-bold text-stone-800">
                {stats?.total_products ?? "—"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
