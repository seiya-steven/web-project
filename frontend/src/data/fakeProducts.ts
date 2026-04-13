import type { Product } from "@/types";

export const fakeProducts: Product[] = [
  {
    id: 101,
    name: "Áo thun local brand",
    description: "Chất liệu cotton, form rộng",
    price: 129000,
    stock: 50,
    image_url: "https://picsum.photos/seed/fake1/400/400",
    category: "Quần áo",
  },
  {
    id: 102,
    name: "Giày sneaker",
    description: "Đế êm, đi bộ cả ngày",
    price: 599000,
    stock: 20,
    image_url: "https://picsum.photos/seed/fake2/400/400",
    category: "Quần áo",
  },
  {
    id: 103,
    name: "Túi tote canvas",
    description: "Đựng laptop 14 inch",
    price: 89000,
    stock: 100,
    image_url: "https://picsum.photos/seed/fake3/400/400",
    category: "Nhà cửa",
  },
  {
    id: 104,
    name: "Nước hoa mini",
    description: "Hương gỗ ấm, 15ml",
    price: 199000,
    stock: 35,
    image_url: "https://picsum.photos/seed/fake4/400/400",
    category: "Mẹ & Bé",
  },
];
