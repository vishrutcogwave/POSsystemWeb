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
  note?: string; // new field for special instructions
};