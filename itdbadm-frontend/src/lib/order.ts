// src/types/order.ts
export interface Product {
  product_id: number;
  quantity: number;
  band_id: number;
  name: string;
  price: string | number;
  description: string;
  category: string;
  image: {
    url: string;
  };
  is_deleted: number;
  band: string;
}

export interface Order {
  id: number;
  user_id: number;
  order_date: string;
  status: string; // This will be mapped to OrderStatus
  date_fulfilled: string | null;
  price: string | number;
  offer_id: number | null;
  description: string;
  products: Product[];
}

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";
