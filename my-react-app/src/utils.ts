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

// CATEGORY 1 – BEVERAGES (20 ITEMS)
export const DUMMY_FOODS: FoodItem[] = [
  {
    id: 101,
    name: "Masala Tea",
    price: 15,
    image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=400&q=80",
    categoryId: 1,
  },
  {
    id: 102,
    name: "Filter Coffee",
    price: 20,
    image: "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=400&q=80",
    categoryId: 1,
  },
  {
    id: 103,
    name: "Black Tea",
    price: 12,
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=400&q=80",
    categoryId: 1,
  },
  {
    id: 104,
    name: "Green Tea",
    price: 18,
    image: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=400&q=80",
    categoryId: 1,
  },
  {
    id: 105,
    name: "Lemon Tea",
    price: 20,
    image: "https://images.unsplash.com/photo-1622484212475-0f98e3c9c7c4?auto=format&fit=crop&w=400&q=80",
    categoryId: 1,
  },
  {
    id: 106,
    name: "Hot Milk",
    price: 10,
    image: "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=400&q=80",
    categoryId: 1,
  },
  {
    id: 107,
    name: "Badam Milk",
    price: 25,
    image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=400&q=80",
    categoryId: 1,
  },
  {
    id: 108,
    name: "Cold Coffee",
    price: 35,
    image: "https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=400&q=80",
    categoryId: 1,
  },
  {
    id: 109,
    name: "Cold Tea",
    price: 30,
    image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=400&q=80",
    categoryId: 1,
  },
  {
    id: 110,
    name: "Lassi",
    price: 40,
    image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=400&q=80",
    categoryId: 1,
  },
  {
    id: 111,
    name: "Sweet Lassi",
    price: 45,
    image: "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?auto=format&fit=crop&w=400&q=80",
    categoryId: 1,
  },
  {
    id: 112,
    name: "Butter Milk",
    price: 20,
    image: "https://images.unsplash.com/photo-1585238342028-4bbc5f5b7a9a?auto=format&fit=crop&w=400&q=80",
    categoryId: 1,
  },
  {
    id: 113,
    name: "Fresh Lime Soda",
    price: 35,
    image: "https://images.unsplash.com/photo-1622484212475-0f98e3c9c7c4?auto=format&fit=crop&w=400&q=80",
    categoryId: 1,
  },
  {
    id: 114,
    name: "Orange Juice",
    price: 50,
    image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=400&q=80",
    categoryId: 1,
  },
  {
    id: 115,
    name: "Water Bottle",
    price: 20,
    image: "https://images.unsplash.com/photo-1523362628745-0c100150b7a3?auto=format&fit=crop&w=400&q=80",
    categoryId: 1,
  },
  {
    id: 116,
    name: "Soft Drink",
    price: 40,
    image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=400&q=80",
    categoryId: 1,
  },
  {
    id: 117,
    name: "Rose Milk",
    price: 35,
    image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=400&q=80",
    categoryId: 1,
  },
  {
    id: 118,
    name: "Chocolate Milk",
    price: 45,
    image: "https://images.unsplash.com/photo-1577805947697-89e18249d767?auto=format&fit=crop&w=400&q=80",
    categoryId: 1,
  },
  {
    id: 119,
    name: "Mango Shake",
    price: 55,
    image: "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?auto=format&fit=crop&w=400&q=80",
    categoryId: 1,
  },
  {
    id: 120,
    name: "Strawberry Shake",
    price: 55,
    image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=400&q=80",
    categoryId: 1,
  },
];


export type CartItem = {
  id: number;
  name: string;
  price: number;
  qty: number;
};