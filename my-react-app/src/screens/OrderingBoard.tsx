import { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import CategorySidebar from "../components/CategorySidebar";
import FoodCard from "../components/FoodCard";
import CartPanel from "../components/CartPanel";
import TableSessionModal from "../components/TableSessionModal";

import { type Category, type CartItem, DUMMY_FOODS } from "../utils";

/* ------------------ CATEGORIES ------------------ */

const dummyCategories: Category[] = [
  { id: 1, name: "Breakfast", image: "" },
  { id: 2, name: "Beverages", image: "" },
  { id: 3, name: "Snacks", image: "" },
  { id: 4, name: "Starters", image: "" },
  { id: 5, name: "Soups", image: "" },
  { id: 6, name: "Salads", image: "" },
  { id: 7, name: "Main Course", image: "" },
  { id: 8, name: "Rice & Biryani", image: "" },
  { id: 9, name: "Breads", image: "" },
  { id: 10, name: "Dosa", image: "" },
  { id: 11, name: "Idli & Vada", image: "" },
  { id: 12, name: "Chinese", image: "" },
  { id: 13, name: "Tandoor", image: "" },
  { id: 14, name: "Fast Food", image: "" },
  { id: 15, name: "Burgers", image: "" },
  { id: 16, name: "Pizzas", image: "" },
  { id: 17, name: "Sandwiches", image: "" },
  { id: 18, name: "Desserts", image: "" },
  { id: 19, name: "Ice Creams", image: "" },
  { id: 20, name: "Combos", image: "" },
];

/* ------------------ COMPONENT ------------------ */

function OrderingBoard() {
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ SAFE: location.state can be null on refresh
  const tableData =
    (location.state as {
      tableNumber?: string;
      status?: "Available" | "Occupied";
    }) || {};

  const [activeCategory, setActiveCategory] = useState(1);
  const [cart, setCart] = useState<CartItem[]>([]);

  // ✅ Session handling (POS logic)
  const [sessionStarted, setSessionStarted] = useState(
    tableData.status !== "Available",
  );

  const [openModal, setOpenModal] = useState(tableData.status === "Available");

  /* ------------------ FOOD FILTER ------------------ */

  const foods = useMemo(
    () => DUMMY_FOODS.filter((f) => f.categoryId === activeCategory),
    [activeCategory],
  );

  /* ------------------ CART ACTIONS ------------------ */
const handelOnclose=()=>{
  setOpenModal(false)
  navigate("/NewOrder")
  
}
  const handleAdd = (id: number) => {
    if (!sessionStarted) return; // ⛔ Block until session starts

    const food = DUMMY_FOODS.find((f) => f.id === id);
    if (!food) return;

    setCart((prev) => {
      const existing = prev.find((i) => i.id === id);
      if (existing) {
        return prev.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { id, name: food.name, price: food.price, qty: 1 }];
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

  /* ------------------ UI ------------------ */

  return (
    <div className="flex pr-80 h-[calc(100vh-64px)]">
      {/* LEFT SIDEBAR */}
      <CategorySidebar
        active={activeCategory}
        onSelect={setActiveCategory}
        categories={dummyCategories}
      />

      {/* CENTER CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {foods.map((item) => (
              <FoodCard
                key={item.id}
                id={item.id}
                name={item.name}
                price={item.price}
                image={item.image}
                onAdd={handleAdd}
              />
            ))}
          </div>
        </div>
      </main>

      {/* RIGHT CART */}
      <CartPanel
        items={cart}
        onIncrease={increaseQty}
        onDecrease={decreaseQty}
        onClear={() => setCart([])}
      />

      {/* SESSION MODAL */}
      <TableSessionModal
        isOpen={openModal}
        onClose={handelOnclose}
        onStart={({ pax, waiter }) => {
          console.log("Session Started", {
            table: tableData.tableNumber,
            pax,
            waiter,
          });

          setSessionStarted(true);
          setOpenModal(false);
        }}
      />
    </div>
  );
}

export default OrderingBoard;
