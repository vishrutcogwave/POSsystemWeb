import fallbackImage from "./assets/fallbackimage.png"

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
grpCode: number;
  origQty?: number; // ✅ add this
 itemDiscountAllowed: boolean;
  note?: string;
  spcodes?: string;
  isAddon?: boolean;
};
export type SubTable = {
  subTable: string;
  tableStatus: "Available" | "Occupied" | "Unsettled" | string;
  billNo?: number | null;
  billAmount?: number | null;
  kotStatus?: "KOT" | "NCKOT" | string;
  kotTime?:string
};

export const formatHeader = (key: string,headers:Record<string, string> ) => {


  return (
    headers[key] ??
    key
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase())
      .trim()
  );
};