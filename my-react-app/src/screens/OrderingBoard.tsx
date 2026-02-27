import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import CategorySidebar from "../components/CategorySidebar";
import FoodCard from "../components/FoodCard";
import CartPanel from "../components/CartPanel";
import TableSessionModal from "../components/TableSessionModal";
import KotModal from "../components/KotModal";
import { MobileCartButton } from "../components/MobileCartButton";

import { type Category, type CartItem, DUMMY_FOODS } from "../utils";

/* ---------------- TYPES ---------------- */

type Bill = {
  id: number;
  pax: number;
  waiter: string;
  items: CartItem[];
};

/* ---------------- CATEGORIES ---------------- */

const dummyCategories: Category[] = [
  { id: 1, name: "Breakfast", image: "" },
  { id: 2, name: "Beverages", image: "" },
  { id: 3, name: "Snacks", image: "" },
  { id: 4, name: "Starters", image: "" },
  { id: 5, name: "Main Course", image: "" },
];

function OrderingBoard() {
  const location = useLocation();
  const navigate = useNavigate();

  const tableData =
    (location.state as {
      tableNumber?: string;
      status?: "Available" | "Occupied";
    }) || {};

  const [activeCategory, setActiveCategory] = useState(1);

  /* ---------- BILL STATES ---------- */

  const [kot, setKot] = useState<Bill[]>([]);
  const [activeBillId, setActiveBillId] = useState<number | null>(null);

  const [openSessionModal, setOpenSessionModal] = useState(false);
  const [openKOTModal, setOpenKOTModal] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);

  /* ---------- OPEN CORRECT MODAL ---------- */

  useEffect(() => {
    if (tableData.status === "Available") {
      setOpenSessionModal(true);
    } else if (tableData.status === "Occupied") {
      setOpenKOTModal(true);
    }
  }, [tableData.status]);

  /* ---------- SYNC CART TO ACTIVE BILL ---------- */

  useEffect(() => {
    if (!activeBillId) return;

    setKot((prev) =>
      prev.map((bill) =>
        bill.id === activeBillId ? { ...bill, items: cart } : bill,
      ),
    );
  }, [cart, activeBillId]);

  /* ---------- FOOD FILTER ---------- */

  const foods = useMemo(
    () => DUMMY_FOODS.filter((f) => f.categoryId === activeCategory),
    [activeCategory],
  );

  /* ---------- CART ACTIONS ---------- */

  const handleAdd = (id: number) => {
    if (!activeBillId) return;

    const food = DUMMY_FOODS.find((f) => f.id === id);
    if (!food) return;

    setCart((prev) => {
      const existing = prev.find((i) => i.id === id);
      if (existing) {
        return prev.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i));
      }

      return [
        ...prev,
        { id: food.id, name: food.name, price: food.price, qty: 1 },
      ];
    });
  };

  const increaseQty = (id: number) => {
    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i)),
    );
  };

  const decreaseQty = (id: number) => {
    setCart((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty: i.qty - 1 } : i))
        .filter((i) => i.qty > 0),
    );
  };

  /* ---------- UI ---------- */

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] relative">
      {/* ---------- SIDEBAR ---------- */}
      {/* Category Section */}
      <div className="w-full lg:w-auto">
        <CategorySidebar
          active={activeCategory}
          onSelect={setActiveCategory}
          categories={dummyCategories}
        />
      </div>

      {/* ---------- FOOD GRID ---------- */}
      <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {foods.map((item) => (
            <FoodCard key={item.id} {...item} onAdd={handleAdd} />
          ))}
        </div>
      </main>

      {/* ---------- CART PANEL ---------- */}
      <div className="hidden lg:block">
        <CartPanel
          items={cart}
          onIncrease={increaseQty}
          onDecrease={decreaseQty}
          onClear={() => setCart([])}
        />
      </div>

      {/* ---------- MOBILE CART ---------- */}
      <MobileCartButton
        cart={cart}
        increaseQty={increaseQty}
        decreaseQty={decreaseQty}
        setCart={setCart}
      />

      {/* ---------- SESSION MODAL ---------- */}
      <TableSessionModal
        isOpen={openSessionModal}
        onClose={() => {
          setOpenSessionModal(false);
          navigate("/NewOrder");
        }}
        onStart={({ pax, waiter }) => {
          const newBill: Bill = {
            id: Date.now(),
            pax,
            waiter,
            items: [],
          };

          setKot((prev) => [...prev, newBill]);
          setActiveBillId(newBill.id);
          setCart([]);
          setOpenSessionModal(false);
        }}
      />

      {/* ---------- KOT MODAL ---------- */}
      <KotModal
        isOpen={openKOTModal}
        bills={kot}
        onClose={() => navigate("/NewOrder")}
        onSelectBill={(id) => {
          const selectedBill = kot.find((b) => b.id === id);
          if (!selectedBill) return;

          // Clone items to avoid reference issues
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
