// src/context/ItemContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { getCombinedOltItemList, getItemGroupList } from "../api/services/products.service";
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
  masterItems: CategoryItem[]; // ✅ NEW
  loading: boolean;
  activeGroup: number;
  setActiveGroup: (grp: number) => void;
}

/* ---------------- CONTEXT ---------------- */

const ItemContext = createContext<ItemContextType>({
  items: [],
  masterItems: [],
  loading: true,
  activeGroup: 1,
  setActiveGroup: () => {},
});

/* ---------------- PROVIDER ---------------- */

export const ItemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CategoryItem[]>([]);
  const [masterItems, setMasterItems] = useState<CategoryItem[]>([]); // ✅ NEW
  const [loading, setLoading] = useState(true);
  const [activeGroup, setActiveGroup] = useState<number>(1);

  const { activeOltCode } = useActiveOLT();
  const branch = localStorage.getItem("branch") || "";

//   /* ---------------- FETCH UI ITEMS (UNCHANGED) ---------------- */
//   useEffect(() => {
//     const fetchItems = async () => {
//       if (!activeOltCode) return;

//       try {
//         setLoading(true);

//         const data = await getCombinedOltItemList(
//           activeOltCode,
//           branch,
//           activeGroup
//         );
// console.log("new items",data);

//         setItems(data);
//       } catch (err) {
//         console.error("Error fetching items:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchItems();
//   }, [activeOltCode, branch, activeGroup]);

//   /* ---------------- FETCH MASTER ITEMS (NEW 🔥) ---------------- */
//   useEffect(() => {
//     const fetchAllItems = async () => {
//       if (!activeOltCode) return;

//       try {
//         const groups = await getItemGroupList(branch);

//         const results = await Promise.all(
//           groups.map((g: any) =>
//             getCombinedOltItemList(activeOltCode, branch, Number(g.grpCode))
//           )
//         );

//         setMasterItems(results.flat());
//       } catch (err) {
//         console.error("Error fetching master items:", err);
//       }
//     };

//     fetchAllItems();
//   }, [activeOltCode, branch]);

/* ---------------- FETCH UI ITEMS (UNCHANGED) ---------------- */
useEffect(() => {
  const fetchItems = async () => {
    if (!activeOltCode) return;

    try {
      setLoading(true);

      const data = await getCombinedOltItemList(
        activeOltCode,
        branch,
        activeGroup
      );

      // ✅ only available items
      const filteredData = data.map((category: CategoryItem) => ({
        ...category,
        items: category.items.filter((item) => item.oidAvailable),
      }));

      console.log("new items", filteredData);

      setItems(filteredData);
    } catch (err) {
      console.error("Error fetching items:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchItems();
}, [activeOltCode, branch, activeGroup]);

/* ---------------- FETCH MASTER ITEMS (NEW 🔥) ---------------- */
useEffect(() => {
  const fetchAllItems = async () => {
    if (!activeOltCode) return;

    try {
      const groups = await getItemGroupList(branch);
      console.log("getItemGroupList",groups);
      

      const results = await Promise.all(
        groups.map((g: any) =>
          getCombinedOltItemList(activeOltCode, branch, Number(g.grpCode))
        )
      );

      // ✅ FLATTEN FIRST (correct structure)
      const flatCategories = results.flat();

      // ✅ THEN filter items
      const filtered = flatCategories.map((cat: CategoryItem) => ({
        ...cat,
        items: cat.items.filter((item) => item.oidAvailable),
      }));

      setMasterItems(filtered);
    } catch (err) {
      console.error("Error fetching master items:", err);
    }
  };

  fetchAllItems();
}, [activeOltCode, branch]);

  return (
    <ItemContext.Provider
      value={{ items, masterItems, loading, activeGroup, setActiveGroup }}
    >
      {children}
    </ItemContext.Provider>
  );
};

/* ---------------- HOOK ---------------- */

export const useItems = () => useContext(ItemContext);