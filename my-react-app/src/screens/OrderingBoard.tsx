import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import CategorySidebar from "../components/CategorySidebar";
import FoodCard from "../components/FoodCard";
import CartPanel from "../components/CartPanel";
import TableSessionModal from "../components/TableSessionModal";

import { type Category, type CartItem, DUMMY_FOODS } from "../utils";
import KotModal from "../components/KotModal";

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

/* ---------------- COMPONENT ---------------- */

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

  const [kot, setKot] = useState<Bill[]>([
    {
      id: 1,
      pax: 2,
      waiter: "John Doe",
      items: [
        { id: 101, name: "Masala Tea", price: 15, qty: 2 },
        { id: 102, name: "Idli", price: 30, qty: 1 },
      ],
    },
    {
      id: 2,
      pax: 4,
      waiter: "Sarah Wilson",
      items: [
        { id: 103, name: "Dosa", price: 50, qty: 2 },
        { id: 104, name: "Coffee", price: 20, qty: 2 },
      ],
    },
    {
      id: 3,
      pax: 1,
      waiter: "Mike Johnson",
      items: [{ id: 105, name: "Vada", price: 25, qty: 1 }],
    },
  ]);
  const [activeBillId, setActiveBillId] = useState<number | null>(null);

  const [openSessionModal, setOpenSessionModal] = useState(false);
  const [openKOTModal, setopenKOTModal] = useState(false);

  /* ---------- OPEN CORRECT MODAL ---------- */

  useEffect(() => {
    if (tableData.status === "Available") {
      setOpenSessionModal(true);
    } else {
      setopenKOTModal(true);
    }
  }, []);

  /* ---------- ACTIVE BILL ---------- */

  const activeBill = kot.find((b) => b.id === activeBillId);
  const cart = activeBill?.items || [];

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

    setKot((prev) =>
      prev.map((bill) =>
        bill.id === activeBillId
          ? {
              ...bill,
              items: updateItems(bill.items, food),
            }
          : bill,
      ),
    );
  };

  const increaseQty = (id: number) => {
    setKot((prev) =>
      prev.map((bill) =>
        bill.id === activeBillId
          ? {
              ...bill,
              items: bill.items.map((i) =>
                i.id === id ? { ...i, qty: i.qty + 1 } : i,
              ),
            }
          : bill,
      ),
    );
  };

  const decreaseQty = (id: number) => {
    setKot((prev) =>
      prev.map((bill) =>
        bill.id === activeBillId
          ? {
              ...bill,
              items: bill.items
                .map((i) => (i.id === id ? { ...i, qty: i.qty - 1 } : i))
                .filter((i) => i.qty > 0),
            }
          : bill,
      ),
    );
  };

  /* ---------- UI ---------- */

  return (
    <div className="flex pr-80 h-[calc(100vh-64px)]">
      <CategorySidebar
        active={activeCategory}
        onSelect={setActiveCategory}
        categories={dummyCategories}
      />

      <main className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-4 gap-4">
          {foods.map((item) => (
            <FoodCard key={item.id} {...item} onAdd={handleAdd} />
          ))}
        </div>
      </main>

      <CartPanel
        items={cart}
        onIncrease={increaseQty}
        onDecrease={decreaseQty}
        onClear={() => {}}
      />

      {/* -------- SESSION MODAL -------- */}
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
          setOpenSessionModal(false);
        }}
      />

      {/* -------- BILLS MODAL -------- */}
      <KotModal
        isOpen={openKOTModal}
        bills={kot}
        onClose={() => navigate("/NewOrder")}
        onSelectBill={(id) => {
          setActiveBillId(id);
          setopenKOTModal(false); // ❌ no waiter popup
        }}
        onNewBill={() => {
          setopenKOTModal(false);
          setOpenSessionModal(true); // ✅ show pax + waiter
        }}
      />
    </div>
  );
}

export default OrderingBoard;

/* ---------------- HELPERS ---------------- */

function updateItems(items: CartItem[], food: any): CartItem[] {
  const existing = items.find((i) => i.id === food.id);
  if (existing) {
    return items.map((i) => (i.id === food.id ? { ...i, qty: i.qty + 1 } : i));
  }
  return [
    ...items,
    { id: food.id, name: food.name, price: food.price, qty: 1 },
  ];
}
