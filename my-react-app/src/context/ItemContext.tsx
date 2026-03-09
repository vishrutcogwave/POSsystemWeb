
// src/context/ItemContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { getCombinedOltItemList } from "../api/services/products.service";
import { useActiveOLT } from "./ActiveOLTContext";

/* ---------------- TYPES ---------------- */

export interface FoodItem {
  itemCode: number;
  itemName: string;
  oidRate: number;
  oidAvailable: boolean;
  itemDiscountAllowed: boolean;
  thumb: string | null;
  isVeg: boolean | null;
}

export interface CategoryItem {
  oltCode: number;
  branchcode: string;
  catCode: number;
  catName: string;
  catthumb: string;
  grpCode: string;
  grpName: string;
  items: FoodItem[];
}

interface ItemContextType {
  items: CategoryItem[];
  loading: boolean;
}

/* ---------------- CONTEXT ---------------- */

const ItemContext = createContext<ItemContextType>({
  items: [],
  loading: true,
});

/* ---------------- PROVIDER ---------------- */

export const ItemProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const { activeOltCode } = useActiveOLT();

  const branch = localStorage.getItem("branch") || "";
  const activeOltCode2 = localStorage.getItem("activeOltCode") || "";

  useEffect(() => {
    const fetchItems = async () => {
      if (!activeOltCode) return;

      try {
        setLoading(true);

        console.log("Fetching items for OLT:", activeOltCode);

        const data = await getCombinedOltItemList(activeOltCode2, branch);

        setItems(data); // API already returns category → items structure
      } catch (err) {
        console.error("Error fetching items:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [activeOltCode, branch]);

  return (
    <ItemContext.Provider value={{ items, loading }}>
      {children}
    </ItemContext.Provider>
  );
};

/* ---------------- HOOK ---------------- */

export const useItems = () => useContext(ItemContext);
