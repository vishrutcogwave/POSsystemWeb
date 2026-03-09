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
import {
  createOrder,
  getOldCart,
  getSubTables,
} from "../api/services/products.service";
import { useItems } from "../context/ItemContext";
import InstructionModal from "../components/InstructionModal";
import { useActiveOLT } from "../context/ActiveOLTContext";
import toast from "react-hot-toast";

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
  console.log("items", items);

  const tableData =
    (location.state as {
      tableNumber?: string;
      status?: "Available" | "Occupied";
    }) || {};

  /* ---------------- CATEGORY STATE ---------------- */
  const [subTables, setSubTables] = useState<string[]>([]);
  const [pastItems, setPastItems] = useState<CartItem[]>([]);
  const [selectedSubTable, setSelectedSubTable] = useState<string>("");
  const [kot, setKot] = useState<Bill[]>([]);
  const [activeBillId, setActiveBillId] = useState<number | null>(null);
  const [openSessionModal, setOpenSessionModal] = useState(false);
  const [openKOTModal, setOpenKOTModal] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [kotLoading, setKotLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [instructionItemId, setInstructionItemId] = useState<number | null>(
    null,
  );
  const [openInstructionModal, setOpenInstructionModal] = useState(false);
  const [session, setSession] = useState<{
    pax: number;
    waiterCode: string;
    waiterName: string;
  } | null>(null);
  const { activeOltName } = useActiveOLT(); // ✅ use context

  const fetchSubTables = async () => {
    try {
      const outlet = localStorage.getItem("activeOltCode") || "";
      const table = tableData.tableNumber || "";

      const data = await getSubTables(outlet, table);

      const cleaned = (data || []).filter((s: string) => s && s.trim() !== "");

      if (cleaned.length === 0) {
        setSubTables(["A"]);
      } else {
        setSubTables(cleaned);
      }
    } catch (err) {
      console.error("Failed to load subtables", err);
    }
  };

  const fetchOldCart = async (sub: string) => {
    try {
      const outlet = localStorage.getItem("activeOltCode") || "";
      const table = tableData.tableNumber || "";

      const data = await getOldCart(table, outlet, sub);

      if (!data || data.length === 0) return;

      // session info from first order
      const first = data[0];

      setSession({
        pax: first.pax,
        waiterCode: String(first.waiter),
        waiterName: first.waiterName,
      });

      // ✅ combine all food items from all KOTs
      const allFoods = data.flatMap((order: any) => order.food);

      const oldItems = allFoods.map((f: any) => ({
        id: f.itemCode,
        name: f.food.trim(),
        price: f.price,
        qty: f.qty,
      }));

      setPastItems(oldItems);

      console.log("All old items:", oldItems);
    } catch (err) {
      console.error("Failed to fetch old cart", err);
    }
  };
  // const fetchOldCart = async (sub: string) => {
  //   try {
  //     const outlet = localStorage.getItem("activeOltCode") || "";
  //     const table = tableData.tableNumber || "";

  //     const data = await getOldCart(table, outlet, sub);

  //     if (!data || data.length === 0) return;

  //     const order = data[0];

  //     setSession({
  //       pax: order.pax,
  //       waiterCode: String(order.waiter),
  //       waiterName: order.waiterName,
  //     });

  //     // ✅ store old ordered items separately
  //     const oldItems = order.food.map((f: any) => ({
  //       id: f.itemCode,
  //       name: f.food.trim(),
  //       price: f.price,
  //       qty: f.qty,
  //     }));

  //     setPastItems(oldItems);

  //   } catch (err) {
  //     console.error("Failed to fetch old cart", err);
  //   }
  // };
  const ALPHABETS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  const getNextSubTable = (list: string[]) => {
    if (!list || list.length === 0) return "A";

    const last = list[list.length - 1];
    const index = ALPHABETS.indexOf(last);

    return ALPHABETS[index + 1];
  };
  useEffect(() => {
    if (!items.length) return;

    const mapped: Category[] = items.map((cat: any) => ({
      id: cat.catCode,
      name: cat.catName.trim(),
      image: cat.catthumb || "",
    }));

    setCategories(mapped);

    if (mapped.length > 0) {
      setActiveCategory(mapped[0].id);
    }

    setCategoryLoading(false);
  }, [items]);

  /* ---------------- BILL STATES ---------------- */

  /* ---------------- MODAL CONTROL ---------------- */
  useEffect(() => {
    if (tableData.status === "Available") {
      setOpenSessionModal(true);
    } else if (tableData.status === "Occupied") {
      fetchSubTables(); // ✅ load A,B,C
      setOpenKOTModal(true);
    }
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
  const foods = useMemo(() => {
    const category = items.find((cat: any) => cat.catCode === activeCategory);

    if (!category) return [];

    return category.items.filter((item: any) =>
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [items, activeCategory, searchTerm]);
  /* ---------------- CART ACTIONS ---------------- */
  const handleAdd = (itemCode: number) => {
    if (!session) {
      toast.error("Start table session first");
      return;
    }

    const food = items
      .flatMap((cat: any) => cat.items)
      .find((i: any) => i.itemCode === itemCode);
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

  const handleKOT = async () => {
    if (!session || cart.length === 0) return;

    setKotLoading(true);

    const branch = localStorage.getItem("branch") || "";
    const outlate = localStorage.getItem("activeOltCode") || "";

    const payload = {
      userCode: 3,
      table: tableData.tableNumber || "",
      subTable: selectedSubTable || "A", // ✅ important
      outlet: outlate,
      outletName: activeOltName,
      waiter: session.waiterCode,
      waiterName: session.waiterName,
      pax: session.pax,

      food: cart.map((i) => ({
        id: i.id,
        food: i.name,
        code: i.id.toString(),
        price: i.price,
        qty: i.qty,
        comment: i.note || "",
        category: activeCategory || 0,
        origQty: i.qty,
      })),

      total: cart.reduce((sum, i) => sum + i.price * i.qty, 0),
      totQty: cart.reduce((sum, i) => sum + i.qty, 0),

      branch: branch,
      type: "K",
      ncCode: 0,
      ncRemarks: "",
      discount: 0,
      discountType: "",
      discountRemarks: "",
      vRemarks: "1",
      mode: "ADD",
      subBillType: "DIRECT",
      plan: "",
      guestName: "adc",
      guestCode: "234",
      checkInNo: "",
      kotMobileNo: "3456789021",

      homeDelivary: {
        guestCode: 0,
        titleGn1: 0,
        guestName: "",
        dob: new Date().toISOString(),
        address: "",
        city: "",
        phone: "",
        email: "",
        remarks: "",
        lastModify: new Date().toISOString(),
        discount: 0,
        branch_code: branch,
        isUpdate: 0,
      },
    };

    try {
      const res = await createOrder(payload);
      console.log("KOT Created:", res);

      setCart([]);
      setSession(null);
      navigate("/NewOrder");

      toast.success("KOT created successfully! ✅");
    } catch (err) {
      console.error("Failed to create KOT:", err);
      toast.error("Failed to create KOT ❌");
    } finally {
      setKotLoading(false);
    }
  };
  /* ---------------- GLOBAL LOADER ---------------- */
  if (loading || categoryLoading) return <Loader />;

  const selectedItem = cart.find((i) => i.id === instructionItemId);
  /* ---------------- UI ---------------- */
  return (
    <div className="flex flex-col lg:flex-row h-[calc(100dvh-64px)] relative">
      {/* SIDEBAR */}
      <div className="w-full lg:w-auto flex-shrink-0">
        <CategorySidebar
          active={activeCategory}
          onSelect={setActiveCategory}
          categories={categories}
        />
      </div>

      <div className="flex flex-col flex-1 min-h-0">
        {/* SESSION INFO BAR - NOT SCROLLABLE */}
        {/* SESSION INFO BAR */}
        {session && (
          <div className="flex items-center justify-between border-b bg-[#E0F0FA] px-3 sm:px-4 py-2 shadow-sm">
            {/* LEFT SIDE INFO */}
            <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-medium text-gray-700 overflow-hidden">
              <span className="flex items-center gap-1 bg-blue-50 text-[#0576B2] px-2 sm:px-3 py-1 rounded-md whitespace-nowrap">
                🍽 Table {tableData.tableNumber}
              </span>

              <span className="flex items-center gap-1 bg-green-50 text-green-600 px-2 sm:px-3 py-1 rounded-md whitespace-nowrap">
                👥 {session.pax} Pax
              </span>

              <span className="flex items-center gap-1 bg-purple-50 text-purple-600 px-2 sm:px-3 py-1 rounded-md whitespace-nowrap">
                🧑‍🍳 {session.waiterName}
              </span>
              {selectedSubTable && (
                <span className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 sm:px-3 py-1 rounded-md whitespace-nowrap">
                  {selectedSubTable}
                </span>
              )}
            </div>

            {/* EDIT BUTTON */}
            {tableData.status === "Available" && (
              <button
                onClick={() => setOpenSessionModal(true)}
                className="flex items-center gap-1 rounded-md bg-[#0576B2] px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold text-white hover:bg-blue-700 transition whitespace-nowrap"
              >
                ✏ Edit
              </button>
            )}
            {tableData.status === "Occupied" && (
              <button
                onClick={() => setOpenKOTModal(true)}
                className="flex items-center gap-1 rounded-md bg-[#0576B2] px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold text-white hover:bg-blue-700 transition whitespace-nowrap"
              >
                ✏ Edit
              </button>
            )}
          </div>
        )}
        <div className="mb-1">
          <input
            type="text"
            placeholder="Search food..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>
        {/* SCROLLABLE FOOD GRID */}
        <main className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 md:p-3 pb-20">
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
          onKOT={handleKOT}
          kotLoading={kotLoading} // ✅ pass loader state
          pastItems={pastItems}
        />
      </div>

      {/* MOBILE CART */}
      <MobileCartButton
        pastItems={pastItems}
        cart={cart}
        increaseQty={increaseQty}
        decreaseQty={decreaseQty}
        setCart={setCart}
        onUpdateNote={(id) => {
          setInstructionItemId(id);
          setOpenInstructionModal(true);
        }}
        onKOT={handleKOT}
        kotLoading={kotLoading} // ✅ pass loader state
      />
      {/* SESSION MODAL */}
      <TableSessionModal
        isOpen={openSessionModal}
        initialPax={session?.pax}
        initialWaiter={session?.waiterCode}
        onClose={() => {
          setOpenSessionModal(false);
          navigate("/NewOrder");
        }}
        onStart={({ pax, waiterCode, waiterName }) => {
          const newBill: Bill = {
            id: Date.now(),
            pax,
            waiter: waiterName,
            items: [],
          };

          setSession({
            pax,
            waiterCode,
            waiterName,
          });
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
        bills={subTables}
        onClose={() => navigate("/NewOrder")}
        onSelectBill={async (sub) => {
          setSelectedSubTable(sub);

          await fetchOldCart(sub); // call GetOldCart API

          setOpenKOTModal(false);
        }}
        onNewBill={() => {
          const next = getNextSubTable(subTables); // generate next letter
          setSelectedSubTable(next);
          setPastItems([]);

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
