import fallbackImage from "./assets/fallbackimage.jpg"

export const FALLBACK_IMAGE = fallbackImage

// src/types.ts
export interface Category {
  id: number;
  name: string;
  image: string;
}
export type FoodItem = {
  id: number;
  name: string;
  price: number;
  image?: string;
  categoryId: number;
};



export type CartItem = {
  id: number;
  name: string;
  price: number;
  qty: number;

  category: number; // ✅ ADD THIS

  origQty?: number; // ✅ add this

  note?: string;
  spcodes?: string;
};