// src/context/ItemContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { getCombinedOltItemList } from "../api/services/products.service";
import { useActiveOLT } from "./ActiveOLTContext";

export interface Item {
  oltCode: number;
  itemCode: number;
  itemName: string;
  oidRate: number;
  oidAvailable: boolean;
  branchcode: string;
  itemDiscountAllowed: boolean;
  thumb: string | null;
  isVeg: boolean | null;
  catCode: number;
  grpCode: string;
}

interface ItemContextType {
  items: Item[];
  loading: boolean;
}

const ItemContext = createContext<ItemContextType>({
  items: [],
  loading: true,
});

export const ItemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const { activeOltCode } = useActiveOLT();
  const branch = localStorage.getItem("branch") || "";

  useEffect(() => {
    
    const fetchItems = async () => {
      if (!activeOltCode) return;
      try {
        debugger
        setLoading(true);
        console.log("Fetching items for OLT:", activeOltCode);
        const data = await getCombinedOltItemList(activeOltCode, branch);
        setItems(data);
      } catch (err) {
        console.error("Error fetching items:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [activeOltCode, branch]); // ✅ refetch when activeOltCode changes

  return <ItemContext.Provider value={{ items, loading }}>{children}</ItemContext.Provider>;
};

export const useItems = () => useContext(ItemContext);