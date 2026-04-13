import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { api, formatPrice } from "@/lib/api";
import type { Product } from "@/types";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  stock: "",
  category: "",
  image_url: "",
};

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<Product | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get<Product[]>("/admin/products");
      setProducts(res.data);
      setErr(null);
    } catch {
      setErr("Không tải được danh sách sản phẩm.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createProduct(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      await api.post("/admin/products", {
        name: form.name,
        description: form.description || null,
        price: parseFloat(form.price),
        stock: parseInt(form.stock, 10),
        category: form.category.trim() || null,
        image_url: form.image_url.trim() || null,
      });
      setForm(emptyForm);
      await load();
    } catch {
      setErr("Không tạo được sản phẩm (kiểm tra dữ liệu).");
    }
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setErr(null);
    try {
      await api.patch(`/admin/products/${editing.id}`, {
        name: form.name || undefined,
        description: form.description || null,
        price: form.price ? parseFloat(form.price) : undefined,
        stock: form.stock ? parseInt(form.stock, 10) : undefined,
        category: form.category.trim() || null,
        image_url: form.image_url.trim() || null,
      });
      setEditing(null);
      setForm(emptyForm);
      await load();
    } catch {
      setErr("Cập nhật thất bại.");
    }
  }

  async function removeProduct(p: Product) {
    if (!confirm(`Xóa "${p.name}"?`)) return;
    setErr(null);
    try {
      await api.delete(`/admin/products/${p.id}`);
      await load();
    } catch {
      setErr("Không xóa được.");
    }
  }

  function startEdit(p: Product) {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description ?? "",
      price: String(p.price),
      stock: String(p.stock),
      category: p.category ?? "",
      image_url: p.image_url ?? "",
    });
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-stone-800">Quản lý sản phẩm</h2>
      {err && (
        <p className="mt-3 text-sm text-red-600">{err}</p>
      )}

      <div className="mt-6 rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        <h3 className="flex items-center gap-2 font-semibold text-stone-700">
          <Plus className="h-5 w-5 text-shopee" />
          {editing ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}
        </h3>
        <form
          onSubmit={editing ? saveEdit : createProduct}
          className="mt-4 grid gap-3 sm:grid-cols-2"
        >
          <input
            required={!editing}
            placeholder="Tên"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded-lg border border-stone-300 px-3 py-2"
          />
          <input
            placeholder="Giá"
            type="number"
            step="0.01"
            min="0"
            required={!editing}
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="rounded-lg border border-stone-300 px-3 py-2"
          />
          <input
            placeholder="Tồn kho"
            type="number"
            min="0"
            required={!editing}
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
            className="rounded-lg border border-stone-300 px-3 py-2"
          />
          <input
            placeholder="Danh mục (vd: Điện thoại, Quần áo)"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="rounded-lg border border-stone-300 px-3 py-2 sm:col-span-2"
          />
          <label className="sm:col-span-2">
            <span className="mb-1 block text-xs font-medium text-stone-600">
              URL hình ảnh
            </span>
            <input
              type="url"
              placeholder="https://..."
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              className="w-full rounded-lg border border-stone-300 px-3 py-2"
            />
          </label>
          <textarea
            placeholder="Mô tả"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="min-h-[80px] rounded-lg border border-stone-300 px-3 py-2 sm:col-span-2"
          />
          <div className="flex gap-2 sm:col-span-2">
            <button
              type="submit"
              className="rounded-lg bg-shopee px-4 py-2 font-semibold text-white hover:bg-shopee-dark"
            >
              {editing ? "Lưu thay đổi" : "Thêm"}
            </button>
            {editing && (
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setForm(emptyForm);
                }}
                className="rounded-lg border border-stone-300 px-4 py-2 font-medium"
              >
                Hủy
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="mt-8 overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-stone-200 bg-stone-50">
            <tr>
              <th className="px-4 py-3 font-semibold">ID</th>
              <th className="px-4 py-3 font-semibold">Ảnh</th>
              <th className="px-4 py-3 font-semibold">Tên</th>
              <th className="px-4 py-3 font-semibold">Danh mục</th>
              <th className="px-4 py-3 font-semibold">Giá</th>
              <th className="px-4 py-3 font-semibold">Kho</th>
              <th className="px-4 py-3 font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-stone-500">
                  Đang tải...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-stone-500">
                  Chưa có sản phẩm.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="border-b border-stone-100 hover:bg-stone-50/80">
                  <td className="px-4 py-3">{p.id}</td>
                  <td className="px-4 py-3">
                    {p.image_url ? (
                      <img
                        src={p.image_url}
                        alt=""
                        className="h-12 w-12 rounded object-cover"
                      />
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-3 font-medium">
                    {p.name}
                  </td>
                  <td className="max-w-[120px] truncate px-4 py-3 text-stone-600">
                    {p.category ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-shopee">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3">{p.stock}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(p)}
                        className="rounded p-1.5 text-shopee hover:bg-shopee-light"
                        aria-label="Sửa"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeProduct(p)}
                        className="rounded p-1.5 text-red-600 hover:bg-red-50"
                        aria-label="Xóa"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
