import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import CategorySidebar from "../components/CategorySidebar";
import FoodCard from "../components/FoodCard";
import CartPanel from "../components/CartPanel";
import TableSessionModal from "../components/TableSessionModal";
import KotModal from "../components/KotModal";
import { MobileCartButton } from "../components/MobileCartButton";
import Loader from "../components/Loader";

import { type Category, type CartItem } from "../utils";
import { getItemCategoryList } from "../api/services/products.service";
import { useItems } from "../context/ItemContext";

/* ---------------- TYPES ---------------- */
type Bill = {
  id: number;
  pax: number;
  waiter: string;
  items: CartItem[];
};

function OrderingBoard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { items, loading } = useItems(); // Items from context

  const tableData =
    (location.state as { tableNumber?: string; status?: "Available" | "Occupied" }) || {};

  /* ---------------- CATEGORY STATE ---------------- */
  const [activeCategory, setActiveCategory] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoryLoading(true);
        const branch = localStorage.getItem("branch") || "";
        const data = await getItemCategoryList(branch);

        const mapped: Category[] = data.map((item: any) => ({
          id: item.catCode,
          name: item.catName.trim(),
          image: item.thumbnail || "",
        }));

        setCategories(mapped);

        if (mapped.length > 0) setActiveCategory(mapped[0].id);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setCategoryLoading(false);
      }
    };

    fetchCategories();
  }, []);

  /* ---------------- BILL STATES ---------------- */
  const [kot, setKot] = useState<Bill[]>([]);
  const [activeBillId, setActiveBillId] = useState<number | null>(null);
  const [openSessionModal, setOpenSessionModal] = useState(false);
  const [openKOTModal, setOpenKOTModal] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);

  /* ---------------- MODAL CONTROL ---------------- */
  useEffect(() => {
    if (tableData.status === "Available") setOpenSessionModal(true);
    else if (tableData.status === "Occupied") setOpenKOTModal(true);
  }, [tableData.status]);

  /* ---------------- SYNC CART ---------------- */
  useEffect(() => {
    if (!activeBillId) return;

    setKot((prev) =>
      prev.map((bill) => (bill.id === activeBillId ? { ...bill, items: cart } : bill))
    );
  }, [cart, activeBillId]);

  /* ---------------- FILTER ITEMS ---------------- */
  const foods = useMemo(
    () => items.filter((item) => item.catCode === activeCategory),
    [items, activeCategory]
  );

  /* ---------------- CART ACTIONS ---------------- */
  const handleAdd = (itemCode: number) => {
    if (!activeBillId) return;

    const food = items.find((i) => i.itemCode === itemCode);
    if (!food) return;

    setCart((prev) => {
      const existing = prev.find((i) => i.id === itemCode);
      if (existing) return prev.map((i) => (i.id === itemCode ? { ...i, qty: i.qty + 1 } : i));

      return [
        ...prev,
        {
          id: food.itemCode,
          name: food.itemName.trim(),
          price: food.oidRate,
          qty: 1,
        },
      ];
    });
  };

  const increaseQty = (id: number) => {
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i)));
  };

  const decreaseQty = (id: number) => {
    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty: i.qty - 1 } : i)).filter((i) => i.qty > 0)
    );
  };

  /* ---------------- GLOBAL LOADER ---------------- */
  if (loading || categoryLoading) return <Loader />;

  /* ---------------- UI ---------------- */
  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] relative">
      {/* SIDEBAR */}
      <div className="w-full lg:w-auto">
        <CategorySidebar
          active={activeCategory}
          onSelect={setActiveCategory}
          categories={categories}
        />
      </div>

      {/* FOOD GRID */}
      <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {foods.map((item) => (
            <FoodCard
              key={item.itemCode}
              id={item.itemCode}
              name={item.itemName.trim()}
              price={item.oidRate}
              image={item.thumb || ""}
              onAdd={handleAdd}
            />
          ))}
        </div>
      </main>

      {/* CART PANEL */}
      <div className="hidden lg:block">
        <CartPanel
          items={cart}
          onIncrease={increaseQty}
          onDecrease={decreaseQty}
          onClear={() => setCart([])}
        />
      </div>

      {/* MOBILE CART */}
      <MobileCartButton
        cart={cart}
        increaseQty={increaseQty}
        decreaseQty={decreaseQty}
        setCart={setCart}
      />

      {/* SESSION MODAL */}
      <TableSessionModal
        isOpen={openSessionModal}
        onClose={() => {
          setOpenSessionModal(false);
          navigate("/NewOrder");
        }}
        onStart={({ pax, waiter }) => {
          const newBill: Bill = { id: Date.now(), pax, waiter, items: [] };
          setKot((prev) => [...prev, newBill]);
          setActiveBillId(newBill.id);
          setCart([]);
          setOpenSessionModal(false);
        }}
        branchcode={localStorage.getItem("branch") || ""}
      />

      {/* KOT MODAL */}
      <KotModal
        isOpen={openKOTModal}
        bills={kot}
        onClose={() => navigate("/NewOrder")}
        onSelectBill={(id) => {
          const selectedBill = kot.find((b) => b.id === id);
          if (!selectedBill) return;
          setCart(selectedBill.items.map((item) => ({ ...item })));
          setActiveBillId(id);
          setOpenKOTModal(false);
        }}
        onNewBill={() => {
          setOpenKOTModal(false);
          setOpenSessionModal(true);
        }}
      />
    </div>
  );
}

export default OrderingBoard;