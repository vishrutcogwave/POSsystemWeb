
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
  activeGroup: number;
  setActiveGroup: (grp: number) => void;
}

/* ---------------- CONTEXT ---------------- */

const ItemContext = createContext<ItemContextType>({
  items: [],
  loading: true,
  activeGroup: 1,
  setActiveGroup: () => {},
});

/* ---------------- PROVIDER ---------------- */

export const ItemProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
const [activeGroup, setActiveGroup] = useState<number>(1); // default FOOD
  const { activeOltCode } = useActiveOLT();

  const branch = localStorage.getItem("branch") || "";
useEffect(() => {
  const fetchItems = async () => {
    if (!activeOltCode) return;

    try {
      setLoading(true);

      const data = await getCombinedOltItemList(
        activeOltCode,
        branch,
        activeGroup // ✅ NEW
      );

      setItems(data);
    } catch (err) {
      console.error("Error fetching items:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchItems();
}, [activeOltCode, branch, activeGroup]); // ✅ ADD activeGroup

  return (
    <ItemContext.Provider value={{ items, loading, activeGroup, setActiveGroup }}>
      {children}
    </ItemContext.Provider>
  );
};

/* ---------------- HOOK ---------------- */

export const useItems = () => useContext(ItemContext);
