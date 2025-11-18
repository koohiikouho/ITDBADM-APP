import { ReactNode } from "react";

// types.ts
export interface CardItem {
  genre: ReactNode;
  members: ReactNode;
  id: number;
  title: string;
  description: string;
  image: string;
  branch: number;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  image: string;
  price: string;
  category: string;
  isDigital: boolean;
  route: string;
}

export interface Category {
  id: number;
  name: string;
  count: number;
}
