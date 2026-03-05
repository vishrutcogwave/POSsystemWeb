// src/context/ItemContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { getCombinedOltItemList } from "../api/services/products.service";

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

 useEffect(() => {
  const fetchItems = async () => {
    try {
      setLoading(true);
      const branch = localStorage.getItem("branch") || "";
      const oltCode = localStorage.getItem("activeOltCode") || ""; // dynamic
      const data = await getCombinedOltItemList(oltCode, branch);
      setItems(data);
    } catch (err) {
      console.error("Error fetching items:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchItems();

  // Re-fetch items whenever activeOltCode changes
  const handleStorageChange = () => fetchItems();
  window.addEventListener("storage", handleStorageChange);

  return () => window.removeEventListener("storage", handleStorageChange);
}, []);

  return (
    <ItemContext.Provider value={{ items, loading }}>
      {children}
    </ItemContext.Provider>
  );
};

export const useItems = () => useContext(ItemContext);