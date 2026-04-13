import type { LucideIcon } from "lucide-react";
import {
  Baby,
  House,
  LayoutGrid,
  Plug,
  Shirt,
  ShoppingCart,
  Smartphone,
  Watch,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";

import { fakeProducts } from "@/data/fakeProducts";
import { api, formatPrice } from "@/lib/api";
import type { Product } from "@/types";
import { useAuthStore } from "@/store/authStore";

interface OutletCtx {
  searchQuery: string;
}

const CATEGORY_ITEMS: { key: string; label: string; Icon: LucideIcon }[] = [
  { key: "", label: "Tất cả", Icon: LayoutGrid },
  { key: "Điện thoại", label: "Điện thoại", Icon: Smartphone },
  { key: "Quần áo", label: "Quần áo", Icon: Shirt },
  { key: "Đồng hồ", label: "Đồng hồ", Icon: Watch },
  { key: "Điện tử", label: "Điện tử", Icon: Plug },
  { key: "Nhà cửa", label: "Nhà cửa", Icon: House },
  { key: "Mẹ & Bé", label: "Mẹ & Bé", Icon: Baby },
];

function filterFakeByCategory(list: Product[], category: string): Product[] {
  if (!category) return list;
  return list.filter((p) => p.category === category);
}

export function Home() {
  const { searchQuery } = useOutletContext<OutletCtx>();
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params =
      activeCategory.trim() !== ""
        ? { category: activeCategory.trim() }
        : undefined;
    api
      .get<Product[]>("/products", { params })
      .then((res) => {
        if (!cancelled) {
          setProducts(res.data);
          setError(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setProducts(filterFakeByCategory(fakeProducts, activeCategory));
          setError(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeCategory]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, searchQuery]);

  async function addToCart(product: Product) {
    if (!token) {
      navigate("/login", { state: { from: "/" } });
      return;
    }
    setAddingId(product.id);
    setMsg(null);
    try {
      await api.post("/cart/items", { product_id: product.id, quantity: 1 });
      setMsg(`Đã thêm "${product.name}" vào giỏ hàng.`);
      window.dispatchEvent(new Event("shopee-cart-updated"));
    } catch {
      setMsg("Không thể thêm vào giỏ. Kiểm tra tồn kho hoặc đăng nhập lại.");
    } finally {
      setAddingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {error && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Không kết nối được API — đang hiển thị sản phẩm mẫu. Hãy chạy backend
          tại cổng 8000.
        </div>
      )}
      {msg && (
        <div className="mb-4 rounded-lg border border-shopee/30 bg-shopee-light px-4 py-3 text-sm text-shopee-dark">
          {msg}
        </div>
      )}

      <section className="mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-shopee to-orange-400 shadow-lg">
        <div className="grid gap-6 px-8 py-10 md:grid-cols-2 md:items-center">
          <div className="text-white">
            <p className="text-sm font-medium uppercase tracking-widest opacity-90">
              Siêu sale cuối tuần
            </p>
            <h2 className="mt-2 text-3xl font-extrabold leading-tight md:text-4xl">
              Mua sắm thả ga — Freeship 0Đ*
            </h2>
            <p className="mt-3 max-w-md text-sm opacity-95">
              Giao diện phong cách Shopee: cam chủ đạo, danh mục đa dạng, thêm
              nhanh vào giỏ chỉ với một chạm.
            </p>
            <Link
              to="/cart"
              className="mt-6 inline-flex items-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-bold text-shopee shadow hover:bg-orange-50"
            >
              <ShoppingCart className="h-5 w-5" />
              Xem giỏ hàng
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="aspect-video rounded-lg bg-white/20 backdrop-blur-sm" />
          </div>
        </div>
      </section>

      <section className="mb-8 rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-stone-500">Danh mục</h3>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORY_ITEMS.map(({ key, label, Icon }) => {
            const selected = activeCategory === key;
            return (
              <button
                key={key || "all"}
                type="button"
                onClick={() => setActiveCategory(key)}
                className={`flex shrink-0 flex-col items-center gap-1 rounded-lg px-4 py-2 text-xs font-medium transition sm:min-w-[76px] ${
                  selected
                    ? "bg-shopee text-white shadow"
                    : "bg-stone-50 text-stone-700 hover:bg-shopee-light hover:text-shopee"
                }`}
              >
                <Icon className="h-6 w-6" strokeWidth={1.75} />
                <span className="whitespace-nowrap">{label}</span>
              </button>
            );
          })}
        </div>
      </section>

      <h3 className="mb-4 text-lg font-bold text-stone-800">Gợi ý hôm nay</h3>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-lg bg-stone-200"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {filtered.map((p) => (
            <article
              key={p.id}
              className="group flex flex-col overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="relative aspect-square overflow-hidden bg-stone-100">
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    alt=""
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-stone-400">
                    No image
                  </div>
                )}
                {p.stock <= 5 && p.stock > 0 && (
                  <span className="absolute left-2 top-2 rounded bg-amber-500 px-2 py-0.5 text-xs font-semibold text-white">
                    Sắp hết
                  </span>
                )}
                {p.stock === 0 && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-bold text-white">
                    Hết hàng
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-3">
                <h4 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium text-stone-800">
                  {p.name}
                </h4>
                {p.category ? (
                  <p className="mt-0.5 text-[11px] text-stone-400">{p.category}</p>
                ) : null}
                <p className="mt-1 text-lg font-bold text-shopee">
                  {formatPrice(p.price)}
                </p>
                <button
                  type="button"
                  disabled={p.stock === 0 || addingId === p.id}
                  onClick={() => addToCart(p)}
                  className="mt-auto flex items-center justify-center gap-1 rounded border border-shopee/40 bg-shopee-light py-2 text-xs font-semibold text-shopee hover:bg-shopee hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ShoppingCart className="h-4 w-4" />
                  {addingId === p.id ? "Đang thêm..." : "Thêm giỏ"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <p className="py-12 text-center text-stone-500">
          {searchQuery.trim()
            ? `Không có sản phẩm khớp “${searchQuery}”.`
            : activeCategory
              ? `Chưa có sản phẩm trong danh mục “${activeCategory}”.`
              : "Không có sản phẩm."}
        </p>
      )}
    </div>
  );
}
