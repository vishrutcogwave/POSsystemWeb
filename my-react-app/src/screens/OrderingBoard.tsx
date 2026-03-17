import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import qz from "qz-tray";
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
  getNCKOT,
  getOldCart,
  getSpecialInfo,
  getSubTables,
} from "../api/services/products.service";
import { useItems } from "../context/ItemContext";
import InstructionModal from "../components/InstructionModal";
import { useActiveOLT } from "../context/ActiveOLTContext";
import toast from "react-hot-toast";
import { printKOT } from "../api/services/printer";

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
      kotStatus: string;
    }) || {};
  console.log(tableData, "tableData");

  /* ---------------- CATEGORY STATE ---------------- */
  const [selectedNcCode, setSelectedNcCode] = useState<number | null>(null);
  const [instructions, setInstructions] = useState<any[]>([]);
  const [ncRemarks, setNcRemarks] = useState("");
  const [ncReasons, setNcReasons] = useState<any[]>([]);
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
  const [selectedVoidItems, setSelectedVoidItems] = useState<CartItem[]>([]);
  const [openInstructionModal, setOpenInstructionModal] = useState(false);
  const [session, setSession] = useState<{
    pax: number;
    waiterCode: string;
    waiterName: string;
  } | null>(null);
  const { activeOltName } = useActiveOLT(); // ✅ use context

  const fetchInstructions = async () => {
    try {
      const data = await getSpecialInfo();
      console.log("spdata", data);

      setInstructions(data || []);
    } catch (err) {
      console.error("Failed to fetch special instructions", err);
    }
  };
  const fetchNcReasons = async () => {
    try {
      const data = await getNCKOT();
      setNcReasons(data || []);
    } catch (err) {
      console.error("Failed to fetch NC reasons", err);
    }
  };

  useEffect(() => {
    void fetchNcReasons();
    void fetchInstructions();
  }, []);

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

    const unique = new Map();

    category.items.forEach((item: any) => {
      if (!unique.has(item.itemCode)) {
        unique.set(item.itemCode, item);
      }
    });

    return Array.from(unique.values()).filter((item: any) =>
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
          category: food.catCode, // ✅ ADD THIS
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

  const updateCartNote = (id: number, spcodes: string, note: string) => {
    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, spcodes, note } : i)),
    );
  };

  const getInstructionLines = (codes?: string) => {
    if (!codes) return [];

    const ids = codes.split(",");

    return ids
      .map((id) => instructions.find((i) => String(i.spid) === id)?.spinfo)
      .filter(Boolean);
  };

  const handleKOT = async () => {
    if (!session || cart.length === 0) return;

    setKotLoading(true);

    const branch = localStorage.getItem("branch") || "";
    const outlet = localStorage.getItem("activeOltCode") || "";

    const isNC = selectedNcCode !== null && selectedNcCode !== 0;

    const payload = {
      userCode: 3,
      table: tableData.tableNumber || "",
      subTable: selectedSubTable || "A",
      outlet,
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
        comment: i.spcodes || "",
        category: i.category, // ✅ CORRECT
        origQty: i.qty,
      })),

      total: cart.reduce((sum, i) => sum + i.price * i.qty, 0),
      totQty: cart.reduce((sum, i) => sum + i.qty, 0),

      branch,
      type: isNC ? "N" : "K",
      ncCode: isNC ? selectedNcCode : 0,
      ncRemarks: isNC ? ncRemarks : "",

      discount: 0,
      discountType: "",
      discountRemarks: "",
      vRemarks: "1",

      mode: "ADD",
      subBillType: "S",
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

      /* ---------------- MULTI PRINTER PRINT ---------------- */

      const printers = res.printers || [];
      const foodItems = res.food || [];

      /* -------- GROUP ITEMS PER PRINTER -------- */
      const printerItemMap: Record<string, any[]> = {};

      printers.forEach((printer: any) => {
        const matchedItems = foodItems.filter((item: any) =>
          printer.categoryIds.includes(Number(item.category)),
        );

        if (matchedItems.length > 0) {
          printerItemMap[printer.printerName] = matchedItems;
        }
      });

      /* -------- COMMON CONTENT -------- */
      const generateContent = (items: any[]) => ({
        title: "KITCHEN ORDER TICKET",
        table: tableData?.tableNumber,
        subTable: selectedSubTable || "A",
        waiter: session.waiterName,
        pax: session.pax,
        items: items.map((item) => ({
          qty: item.origQty,
          name: item.food,
          instructions: getInstructionLines(item.comment),
        })),
      });

      /* -------- THERMAL FORMAT -------- */
      const formatThermal = (c: any) => {
        let d = "";

        d += "\x1B\x40";

        d += "\x1B\x61\x01";
        d += "\x1B\x45\x01";
        d += c.title + "\n";
        d += "\x1B\x45\x00";

        d += "--------------------------------\n";

        d += "\x1B\x61\x00";

        d += `Table : ${c.table}\n`;
        d += `SubTbl: ${c.subTable}\n`;
        d += `Waiter: ${c.waiter}\n`;
        d += `Pax   : ${c.pax}\n`;

        d += "--------------------------------\n";

        c.items.forEach((item: any) => {
          const qty = String(item.qty).padEnd(3, " ");
          const name = item.name.substring(0, 24);

          d += qty + " " + name.padEnd(24, " ") + "\n";

          item.instructions.forEach((i: string) => {
            d += "    * " + i + "\n";
          });
        });

        d += "--------------------------------\n";

        const total = c.items.reduce((s: number, i: any) => s + i.qty, 0);
        d += `Total Items : ${total}\n`;

        d += "\n\n\n";
        d += "\x1B\x64\x05";
        d += "\x1D\x56\x41\x10";

        return d;
      };

      /* -------- HTML FORMAT (MATCH SAME STYLE) -------- */
      const formatHTML = (c: any) => `
  <div style="font-family: monospace; font-size: 12px; width: 260px;">
    
    <div style="text-align:center; font-weight:bold;">
      ${c.title}
    </div>

    <hr/>

    <div>Table : ${c.table}</div>
    <div>SubTbl: ${c.subTable}</div>
    <div>Waiter: ${c.waiter}</div>
    <div>Pax   : ${c.pax}</div>

    <hr/>

    ${c.items
      .map(
        (item: any) => `
      <div style="display:flex; justify-content:space-between;">
        <span>${item.qty}</span>
        <span>${item.name}</span>
      </div>

      ${item.instructions
        .map((i: string) => `<div style="margin-left:10px;">* ${i}</div>`)
        .join("")}
    `,
      )
      .join("")}

    <hr/>

    <div>Total Items : ${c.items.reduce(
      (s: number, i: any) => s + i.qty,
      0,
    )}</div>

  </div>
`;

      /* -------- PRINT LOOP -------- */
      let hasError = false;

for (const rawPrinterName in printerItemMap) {
  const items = printerItemMap[rawPrinterName];

  const content = generateContent(items);

  // ✅ STEP 1: resolve default printer if empty
  let printerName = rawPrinterName;

  if (!printerName || printerName.trim() === "") {
    printerName = await qz.printers.getDefault();
  }

  console.log("Using Printer:", printerName);

  // ✅ STEP 2: detect type using REAL printer name
  const isThermal =
    printerName.toLowerCase().includes("pos") ||
    printerName.toLowerCase().includes("thermal");

  // ✅ STEP 3: generate correct format
  const finalData = isThermal
    ? formatThermal(content)
    : formatHTML(content);

  // ✅ STEP 4: print
  const result = await printKOT(
    printerName,
    finalData,
    isThermal
  );

  if (!result.success) {
    hasError = true;

    const msg = `❌ ${printerName}: ${result.message}`;
    toast.error(msg);
  }
}
      setCart([]);
      setSession(null);
      setSelectedNcCode(null);
      setNcRemarks("");

      navigate("/NewOrder");

      if (hasError) {
        toast.error("Some printers failed ❌");
      } else {
        toast.success("KOT created & printed successfully! ✅");
      }
    } catch (err) {
      console.error("Failed to create KOT:", err);
      toast.error("Failed to create KOT ❌");
    } finally {
      setKotLoading(false);
    }
  };
  const handleVoid = async () => {
    if (!session || selectedVoidItems.length === 0) return;

    setKotLoading(true);

    const branch = localStorage.getItem("branch") || "";
    const outlet = localStorage.getItem("activeOltCode") || "";
    const isNC = selectedNcCode !== null && selectedNcCode !== 0;
    const payload = {
      userCode: 3,
      table: tableData.tableNumber || "",
      subTable: selectedSubTable || "A",
      outlet,
      outletName: activeOltName,
      waiter: session.waiterCode,
      waiterName: session.waiterName,
      pax: session.pax,

      food: selectedVoidItems
        .filter((i) => i.origQty! - i.qty > 0)
        .map((i) => ({
          id: i.id,
          food: i.name,
          code: i.id.toString(),
          price: i.price,

          qty: i.origQty! - i.qty, // void quantity

          comment: "",
          category: activeCategory || 0,

          origQty: i.origQty, // original ordered qty
        })),

      total: selectedVoidItems.reduce(
        (sum, i) => sum + i.price * (i.origQty! - i.qty),
        0,
      ),

      totQty: selectedVoidItems.reduce(
        (sum, i) => sum + (i.origQty! - i.qty),
        0,
      ),

      branch,
      type: isNC ? "N" : "K", // <-- NC type
      ncCode: 0,
      ncRemarks: "",
      discount: 0,
      discountType: "",
      discountRemarks: "",
      vRemarks: "1",

      mode: "VOID", // 🔥 ONLY CHANGE

      subBillType: "S",
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
      await createOrder(payload);

      toast.success("Items voided successfully");

      setSelectedVoidItems([]);
      navigate("/NewOrder");
    } catch (err) {
      toast.error("Void failed");
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
                key={`${item.itemCode}-${item.itemName}`}
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
          instructions={instructions}
          status={tableData?.status}
          kotStatus={tableData?.kotStatus}
          items={cart}
          pastItems={pastItems}
          ncReasons={ncReasons}
          selectedVoidItems={selectedVoidItems}
          setSelectedVoidItems={setSelectedVoidItems}
          selectedNcCode={selectedNcCode}
          setSelectedNcCode={setSelectedNcCode}
          ncRemarks={ncRemarks}
          setNcRemarks={setNcRemarks}
          onIncrease={increaseQty}
          onDecrease={decreaseQty}
          onClear={() => setCart([])}
          onUpdateNote={(id) => {
            setInstructionItemId(id);
            setOpenInstructionModal(true);
          }}
          onKOT={handleKOT}
          onVoid={handleVoid}
          kotLoading={kotLoading}
        />
      </div>

      {/* MOBILE CART */}
      <MobileCartButton
        onVoid={handleVoid}
        selectedVoidItems={selectedVoidItems}
        setSelectedVoidItems={setSelectedVoidItems}
        instructions={instructions}
        status={tableData?.status}
        kotStatus={tableData?.kotStatus}
        ncReasons={ncReasons}
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
        kotLoading={kotLoading}
        selectedNcCode={selectedNcCode}
        setSelectedNcCode={setSelectedNcCode}
        ncRemarks={ncRemarks}
        setNcRemarks={setNcRemarks}
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
        existingSpcodes={selectedItem?.spcodes}
        instructions={instructions}
        onSave={(spcodes, note) => {
          if (instructionItemId !== null) {
            updateCartNote(instructionItemId, spcodes, note);
          }
          setInstructionItemId(null);
          setOpenInstructionModal(false);
        }}
      />
    </div>
  );
}

export default OrderingBoard;
