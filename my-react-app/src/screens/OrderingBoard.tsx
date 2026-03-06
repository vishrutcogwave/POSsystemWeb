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
import InstructionModal from "../components/InstructionModal";

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
    (location.state as {
      tableNumber?: string;
      status?: "Available" | "Occupied";
    }) || {};

  /* ---------------- CATEGORY STATE ---------------- */
  const [kot, setKot] = useState<Bill[]>([]);
  const [activeBillId, setActiveBillId] = useState<number | null>(null);
  const [openSessionModal, setOpenSessionModal] = useState(false);
  const [openKOTModal, setOpenKOTModal] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);

  const [activeCategory, setActiveCategory] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [instructionItemId, setInstructionItemId] = useState<number | null>(
    null,
  );
  const [openInstructionModal, setOpenInstructionModal] = useState(false);
  const [session, setSession] = useState<{
    pax: number;
    waiter: string;
  } | null>(null);
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

  /* ---------------- MODAL CONTROL ---------------- */
  useEffect(() => {
    if (tableData.status === "Available") setOpenSessionModal(true);
    else if (tableData.status === "Occupied") setOpenKOTModal(true);
  }, [tableData.status]);

  /* ---------------- SYNC CART ---------------- */
  useEffect(() => {
    if (!activeBillId) return;

    setKot((prev) =>
      prev.map((kots) =>
        kots.id === activeBillId ? { ...kots, items: cart } : kots,
      ),
    );
  }, [cart, activeBillId]);
  useEffect(() => {
    console.log("kot", kot);
  }, [kot]);

  /* ---------------- FILTER ITEMS ---------------- */
  const foods = useMemo(
    () => items.filter((item) => item.catCode === activeCategory),
    [items, activeCategory],
  );

  /* ---------------- CART ACTIONS ---------------- */
  const handleAdd = (itemCode: number) => {
    if (!activeBillId) return;

    const food = items.find((i) => i.itemCode === itemCode);
    if (!food) return;

    setCart((prev) => {
      const existing = prev.find((i) => i.id === itemCode);
      if (existing)
        return prev.map((i) =>
          i.id === itemCode ? { ...i, qty: i.qty + 1 } : i,
        );

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

  const updateCartNote = (id: number, note: string) => {
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, note } : i)));
  };
  /* ---------------- GLOBAL LOADER ---------------- */
  if (loading || categoryLoading) return <Loader />;

  const selectedItem = cart.find((i) => i.id === instructionItemId);
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

      <div className="flex flex-col flex-1">
        {/* SESSION INFO BAR - NOT SCROLLABLE */}
        {/* SESSION INFO BAR */}
        {session && (
          <div className="flex items-center justify-between border-b bg-white px-3 sm:px-4 py-2 shadow-sm">
            {/* LEFT SIDE INFO */}
            <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-medium text-gray-700 overflow-hidden">
              <span className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2 sm:px-3 py-1 rounded-md whitespace-nowrap">
                🍽 Table {tableData.tableNumber}
              </span>

              <span className="flex items-center gap-1 bg-green-50 text-green-600 px-2 sm:px-3 py-1 rounded-md whitespace-nowrap">
                👥 {session.pax} Pax
              </span>

              <span className="flex items-center gap-1 bg-purple-50 text-purple-600 px-2 sm:px-3 py-1 rounded-md whitespace-nowrap">
                🧑‍🍳 {session.waiter}
              </span>
            </div>

            {/* EDIT BUTTON */}
            <button
              onClick={() => setOpenSessionModal(true)}
              className="flex items-center gap-1 rounded-md bg-blue-600 px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold text-white hover:bg-blue-700 transition whitespace-nowrap"
            >
              ✏ Edit
            </button>
          </div>
        )}

        {/* SCROLLABLE FOOD GRID */}
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
      </div>

      {/* CART PANEL */}
      <div className="hidden lg:block">
        <CartPanel
          items={cart}
          onIncrease={increaseQty}
          onDecrease={decreaseQty}
          onClear={() => setCart([])}
          onUpdateNote={(id) => {
            setInstructionItemId(id);
            setOpenInstructionModal(true);
          }}
        />
      </div>

      {/* MOBILE CART */}
      <MobileCartButton
        cart={cart}
        increaseQty={increaseQty}
        decreaseQty={decreaseQty}
        setCart={setCart}
        onUpdateNote={(id) => {
          setInstructionItemId(id);
          setOpenInstructionModal(true);
        }}
      />
      {/* SESSION MODAL */}
      <TableSessionModal
        isOpen={openSessionModal}
        initialPax={session?.pax}
        initialWaiter={session?.waiter}
        onClose={() => {
          setOpenSessionModal(false);
          navigate("/NewOrder");
        }}
        onStart={({ pax, waiter }) => {
          const newBill: Bill = { id: Date.now(), pax, waiter, items: [] };

          setSession({ pax, waiter });
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

      <InstructionModal
        isOpen={openInstructionModal}
        onClose={() => setOpenInstructionModal(false)}
        existingNote={selectedItem?.note}
        onSave={(note) => {
          if (instructionItemId !== null) {
            updateCartNote(instructionItemId, note);
          }
          setInstructionItemId(null);
          setOpenInstructionModal(false);
        }}
      />
    </div>
  );
}

export default OrderingBoard;
