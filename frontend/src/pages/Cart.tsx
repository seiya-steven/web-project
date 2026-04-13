import { Minus, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { api, formatPrice } from "@/lib/api";
import type { CartItem } from "@/types";
import { useAuthStore } from "@/store/authStore";

export function Cart() {
  const token = useAuthStore((s) => s.token);
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  function notifyCart() {
    window.dispatchEvent(new Event("shopee-cart-updated"));
  }

  async function load() {
    if (!token) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get<CartItem[]>("/cart/items");
      setItems(res.data);
      setErr(null);
    } catch {
      setErr("Không tải được giỏ hàng.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [token]);

  const total = items.reduce(
    (s, i) => s + Number(i.product.price) * i.quantity,
    0,
  );

  async function setQty(item: CartItem, next: number) {
    if (next < 1) return;
    setErr(null);
    try {
      await api.patch(`/cart/items/${item.id}`, { quantity: next });
      await load();
      notifyCart();
    } catch {
      setErr("Không đủ hàng hoặc lỗi cập nhật.");
    }
  }

  async function remove(item: CartItem) {
    setErr(null);
    try {
      await api.delete(`/cart/items/${item.id}`);
      await load();
      notifyCart();
    } catch {
      setErr("Không xóa được mục này.");
    }
  }

  if (!token) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-stone-600">Đăng nhập để xem giỏ hàng.</p>
        <Link
          to="/login"
          className="mt-4 inline-block rounded-md bg-shopee px-6 py-2.5 font-semibold text-white hover:bg-shopee-dark"
        >
          Đăng nhập
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-stone-800">Giỏ hàng</h1>
      {err && (
        <p className="mt-3 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
          {err}
        </p>
      )}

      {loading ? (
        <div className="mt-8 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-stone-200" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="mt-8 text-stone-500">Giỏ hàng trống.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex gap-4 rounded-xl border border-stone-200 bg-white p-4 shadow-sm"
            >
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                {item.product.image_url ? (
                  <img
                    src={item.product.image_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-stone-800">{item.product.name}</p>
                <p className="text-shopee">{formatPrice(item.product.price)}</p>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Giảm"
                    className="rounded border border-stone-300 p-1 hover:bg-stone-50"
                    onClick={() => setQty(item, item.quantity - 1)}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center text-sm font-semibold">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    aria-label="Tăng"
                    className="rounded border border-stone-300 p-1 hover:bg-stone-50"
                    onClick={() => setQty(item, item.quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="ml-auto text-red-600 hover:text-red-800"
                    onClick={() => remove(item)}
                    aria-label="Xóa"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {items.length > 0 && (
        <div className="mt-8 flex flex-col items-end gap-3 border-t border-stone-200 pt-6">
          <p className="text-lg">
            Tổng cộng:{" "}
            <span className="font-bold text-shopee">{formatPrice(total)}</span>
          </p>
          <button
            type="button"
            className="rounded-md bg-shopee px-8 py-3 font-bold text-white hover:bg-shopee-dark"
          >
            Thanh toán (demo)
          </button>
        </div>
      )}
    </div>
  );
}
