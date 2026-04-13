export interface User {
  id: number;
  email: string;
  role: string;
  full_name: string;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: string | number;
  stock: number;
  image_url: string | null;
  category?: string | null;
}

export interface CartItem {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  product: Product;
}

export interface Stats {
  total_users: number;
  total_products: number;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}
