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
  getBill,
  getCompanyInfo,
  getDiscountModeMaster,
  getItemGroupList,
  getNCKOT,
  getOldCart,
  getPaymentModeMaster,
  getSpecialInfo,
  getSubTables,
  getTaxSettings,
  postBill,
  settleBill,
} from "../api/services/products.service";
import { useItems } from "../context/ItemContext";
import InstructionModal from "../components/InstructionModal";
import { useActiveOLT } from "../context/ActiveOLTContext";
import toast from "react-hot-toast";
import { printBill, printKOT } from "../api/services/printer";
import InvoicePopup from "../components/InvoicePopup";
import PaymentModalForFastFood from "../components/PaymentModalForFastFood";

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
  const [groups, setGroups] = useState<any[]>([]);
  const [discountModes, setdiscountModes] = useState<any[]>([]);
  const { items, masterItems, loading, setActiveGroup, activeGroup } =
    useItems(); // Items from context
  console.log("items", items);
  const [oldCartData, setOldCartData] = useState<any[]>([]);
  const [openPayment, setOpenPayment] = useState(false);

  const tableData =
    (location.state as {
      tableNumber?: string;
      status?: "Available" | "Occupied";
      kotStatus: string;
      fastFood?: boolean;
      waiter?: string;
      waiterName?: string; // ✅ ADD THIS
      pax?: number;
    }) || {};
  console.log(tableData.fastFood, "tableData");
  useEffect(() => {
    if (tableData.fastFood) {
      const newSession = {
        pax: tableData.pax || 1,
        waiterCode: String(tableData.waiter || 1),
        waiterName: tableData.waiterName || "Counter",
      };

      setSession(newSession);
      setSelectedSubTable("A");

      // ✅ SAVE SESSION
      localStorage.setItem("fastfood_session", JSON.stringify(newSession));
    }
  }, [tableData]);

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
  const [taxSettings, setTaxSettings] = useState<any>(null);
  const [selectedVoidItems, setSelectedVoidItems] = useState<CartItem[]>([]);
  const [openInstructionModal, setOpenInstructionModal] = useState(false);
  const [session, setSession] = useState<{
    pax: number;
    waiterCode: string;
    waiterName: string;
  } | null>(null);
  const [billData, setBillData] = useState<any>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const { activeOltName } = useActiveOLT(); // ✅ use context
  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const [paymentModes, setPaymentModes] = useState<any[]>([]);
  const [showDiscount, setShowDiscount] = useState(false);
  const [discountType, setDiscountType] = useState("");
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [discountValue, setDiscountValue] = useState("");
  const [discountMode, setDiscountMode] = useState<"amt" | "per">("amt");
  const fetchPaymentModes = async () => {
    try {
      const branch = localStorage.getItem("branch") || "";
      const data = await getPaymentModeMaster(branch);

      console.log("Payment Modes:", data);

      setPaymentModes(data || []);
    } catch (err) {
      console.error("Failed to fetch payment modes", err);
    }
  };
  const fetchGroups = async () => {
    try {
      const branch = localStorage.getItem("branch") || "";
      const data = await getItemGroupList(branch);

      setGroups(data);
    } catch (err) {
      console.error("Group fetch failed", err);
    }
  };
  const fetchDiscountTypes = async () => {
    try {
      const branch = localStorage.getItem("branch") || "";
      const data = await getDiscountModeMaster(branch);

      setdiscountModes(data);
    } catch (err) {
      console.error("Group fetch failed", err);
    }
  };

  const fetchCompany = async () => {
    try {
      const branch = localStorage.getItem("branch") || "";
      const data = await getCompanyInfo(branch);

      console.log("Company Info:", data);
      setCompanyInfo(data);
    } catch (err) {
      console.error("Company fetch failed", err);
    }
  };
  const fetchTaxSettings = async () => {
    try {
      const branch = localStorage.getItem("branch") || "";
      const data = await getTaxSettings(branch);

      console.log("Tax Settings:", data);
      setTaxSettings(data);
    } catch (err) {
      console.error("Tax fetch failed", err);
    }
  };

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
    void fetchTaxSettings();
    void fetchGroups();
    void fetchNcReasons();
    void fetchInstructions();
    void fetchCompany();
    void fetchPaymentModes();
    void fetchDiscountTypes();
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
      console.log("oldcart", data);

      setOldCartData(data);

      if (!data || data.length === 0) return;

      // session info from first order
      const first = data[0];

      setSession({
        pax: first.pax,
        waiterCode: String(first.waiter),
        waiterName: first.waiterName,
      });

      // ✅ combine all food items from all KOTs
      if (!items.length) return;

      const allFoods = data.flatMap((order: any) => order.food);

      const mappedFoods = allFoods.map((f: any) => {
        let foundCategory: any = null;

        for (const cat of items) {
          const foundItem = cat.items.find(
            (i: any) => i.itemCode === f.itemCode,
          );

          if (foundItem) {
            foundCategory = cat;
            break;
          }
        }

        return {
          ...f,
          category: foundCategory?.catCode || 0,
          grpCode: Number(foundCategory?.grpCode || 0),
          itemDiscountAllowed: f.itemDiscountAllowed ?? true,
        };
      });

      const grouped = new Map();

      mappedFoods.forEach((f: any) => {
        if (grouped.has(f.itemCode)) {
          grouped.get(f.itemCode).qty += f.qty;
        } else {
          grouped.set(f.itemCode, {
            id: f.itemCode,
            name: f.food.trim(),
            price: f.price,
            qty: f.qty,
            category: f.category, // ✅ FIXED
            grpCode: f.grpCode, // ✅ FIXED
            itemDiscountAllowed: f.itemDiscountAllowed,
          });
        }
      });
      const oldItems = Array.from(grouped.values());

      setPastItems(oldItems);

      console.log("All old items:", oldItems);
    } catch (err) {
      console.error("Failed to fetch old cart", err);
    }
  };

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
    if (tableData.fastFood) return; // 🔥 SKIP EVERYTHING

    if (tableData.status === "Available") {
      setOpenSessionModal(true);
    } else if (tableData.status === "Occupied") {
      fetchSubTables();
      setOpenKOTModal(true);
    }
  }, [tableData.status, tableData.fastFood]);

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

    // 🔥 FIND CATEGORY + ITEM TOGETHER
    let selectedCategory: any = null;
    let food: any = null;

    for (const cat of items) {
      const found = cat.items.find((i: any) => i.itemCode === itemCode);
      if (found) {
        selectedCategory = cat;
        food = found;
        break;
      }
    }

    if (!food || !selectedCategory) return;

    setCart((prev) => {
      const existing = prev.find(
        (i) =>
          i.id === itemCode &&
          (!i.spcodes || i.spcodes === "") &&
          (!i.note || i.note === ""),
      );

      if (existing) {
        return prev.map((i) =>
          i.id === itemCode &&
          (!i.spcodes || i.spcodes === "") &&
          (!i.note || i.note === "")
            ? { ...i, qty: i.qty + 1 }
            : i,
        );
      }

      return [
        ...prev,
        {
          id: food.itemCode,
          name: food.itemName.trim(),
          price: food.oidRate,
          qty: 1,
          category: selectedCategory.catCode, // ✅ FIXED
          grpCode: Number(selectedCategory.grpCode), // ✅ ADD THIS
          spcodes: "",
          note: "",
          itemDiscountAllowed: food.itemDiscountAllowed,
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
    setCart((prev) => {
      const item = prev.find((i) => i.id === id);

      if (!item) return prev;

      // reduce qty of original
      const updated = prev
        .map((i) => (i.id === id ? { ...i, qty: i.qty - 1 } : i))
        .filter((i) => i.qty > 0);

      // add new item with instruction
      return [
        ...updated,
        {
          ...item,
          qty: 1,
          spcodes,
          note,
        },
      ];
    });
  };

  const getInstructionLines = (codes?: string) => {
    if (!codes) return [];

    const ids = codes.split(",");

    return ids
      .map((id) => instructions.find((i) => String(i.spid) === id)?.spinfo)
      .filter(Boolean);
  };
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
<html>
<head>
  <style>
    @page {
      size: A4;
      margin: 0;
    }

    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
    }

    @media print {
      body {
        display: flex;
        justify-content: center;
        align-items: flex-start;
      }
    }

    .bill {
      font-family: monospace;
      font-size: 12px;
      width: 240px; /* 🔥 reduced from 260 */
      padding: 0 12px; /* 🔥 SAFE AREA both sides */
      box-sizing: border-box;
    }

    .center {
      text-align: center;
      font-weight: bold;
    }

    .row {
      display: flex;
      justify-content: space-between;
    }

    .indent {
      margin-left: 10px;
    }
  </style>
</head>

<body>
  <div class="bill">

    <div class="center">${c.title}</div>

    <hr/>

    <div>Table : ${c.table}</div>
    <div>SubTbl: ${c.subTable}</div>
    <div>Waiter: ${c.waiter}</div>
    <div>Pax   : ${c.pax}</div>

    <hr/>

    ${c.items
      .map(
        (item: any) => `
      <div class="row">
        <span>${item.qty}</span>
        <span>${item.name}</span>
      </div>

      ${item.instructions
        .map((i: string) => `<div class="indent">* ${i}</div>`)
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
</body>
</html>
`;
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
        category: i.category,
        grpCode: i.grpCode, // ✅ ADD THIS
        origQty: i.qty,
        itemDiscountAllowed: i.itemDiscountAllowed ?? true,
      })),

      total: cart.reduce((sum, i) => sum + i.price * i.qty, 0),
      totQty: cart.reduce((sum, i) => sum + i.qty, 0),

      branch,
      type: isNC ? "N" : "K",
      ncCode: isNC ? selectedNcCode : 0,
      ncRemarks: isNC ? ncRemarks : "",
      discountGroups: [""],
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
        title: isNC ? "NC KOT" : "KOT",
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

      /* -------- PRINT LOOP -------- */
      let hasError = false;

      for (const rawPrinterName in printerItemMap) {
        const items = printerItemMap[rawPrinterName];
        console.log("items", items);

        const content = generateContent(items);

        // ✅ STEP 1: resolve default printer if empty
        let printerName = rawPrinterName;
        console.log("printerName", printerName);

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
        const result = await printKOT(printerName, finalData, isThermal);
        if (tableData.fastFood === true) {
          const printRes = await printBill(
            billData,
            res.fnBillResponse,
            companyInfo,
          );
          console.log("printRes", printRes);
        }

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
      if (tableData.fastFood === undefined) {
        navigate("/NewOrder");
      }
      if (tableData.fastFood !== undefined) {
        setOpenPayment(false);
      }
      const savedSession = localStorage.getItem("fastfood_session");

      if (savedSession) {
        const parsed = JSON.parse(savedSession);

        setSession(parsed);
        setSelectedSubTable("A");
      }
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

  const handleFastFoodKOT = async (data: any) => {
    const { paymentDetails } = data;
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
        category: i.category,
        grpCode: i.grpCode, // ✅ ADD THIS
        origQty: i.qty,
        itemDiscountAllowed: i.itemDiscountAllowed ?? true,
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
      discountGroups: [""],
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
      console.log("FastFood KOT:", res);

      const payload2 = {
        oltCode: Number(localStorage.getItem("activeOltCode") || 0),
        userCode: 3,

        billId: res?.fnBillResponse?.billNo || 0,
        billNo: res?.fnBillResponse?.billNo || 0,

        tableNo: tableData.tableNumber || "",
        subTableNo: selectedSubTable || "A",

        discount: billData?.tax?.discount || 0,
        taxAmount: billData?.tax?.taxAmount || 0,
        tips: 0,

        changeAmount: 0,
        grandAmount: billData?.tax?.grandTotal || 0,

        billDate: new Date().toISOString(),
        branchCode: localStorage.getItem("branch") || "",

        paymentDetails: paymentDetails.map((p: any) => ({
          mode: p.mode || "",
          subMode: p.subMode || "",
          amount: Number(p.amount || 0),
          remarks: p.remarks || "",
        })),
      };
      const selttelbill = await settleBill(payload2);
      console.log("selttelbill", selttelbill);

      /* 🔥 PRINT KOT */
      const printers = res.printers || [];
      const foodItems = res.food || [];

      const printerItemMap: Record<string, any[]> = {};

      printers.forEach((printer: any) => {
        const matchedItems = foodItems.filter((item: any) =>
          printer.categoryIds.includes(Number(item.category)),
        );

        if (matchedItems.length > 0) {
          printerItemMap[printer.printerName] = matchedItems;
        }
      });

      const generateContent = (items: any[]) => ({
        title: isNC ? "NC KOT" : "KOT",
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

      for (const printerName in printerItemMap) {
        const content = generateContent(printerItemMap[printerName]);

        const isThermal =
          printerName.toLowerCase().includes("pos") ||
          printerName.toLowerCase().includes("thermal");
        console.log("isThermal", isThermal);

        const finalData = isThermal
          ? formatThermal(content)
          : formatHTML(content);

        await printKOT(printerName, finalData, isThermal);
      }

      /* 🔥 PRINT BILL */
      if (billData) {
        const printRes = await printBill(
          billData,
          res.fnBillResponse,
          companyInfo,
        );

        if (!printRes.success) {
          throw new Error(printRes.message);
        }
      }

      setCart([]);
      setOpenPayment(false);

      toast.success("FastFood Bill Printed ✅");
    } catch (err) {
      console.error(err);
      toast.error("FastFood KOT Failed ❌");
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
        .filter((i) => i.qty > 0)
        .map((i) => ({
          id: i.id,
          food: i.name,
          code: i.id.toString(),
          price: i.price,
          qty: i.qty,
          comment: "",
          category: i.category || 0,
          origQty: i.origQty,
          itemDiscountAllowed: i.itemDiscountAllowed ?? true,
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
      type: isNC ? "N" : "K",
      ncCode: 0,
      ncRemarks: "",

      discount: 0,
      discountType: "",
      discountRemarks: "",
      vRemarks: "1",

      mode: "VOID",

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

      /* ---------------- PRINT SAME AS KOT ---------------- */

      const printers = res.printers || [];
      const foodItems = res.food || [];

      const printerItemMap: Record<string, any[]> = {};

      printers.forEach((printer: any) => {
        const matchedItems = foodItems.filter((item: any) =>
          printer.categoryIds.includes(Number(item.category)),
        );

        if (matchedItems.length > 0) {
          printerItemMap[printer.printerName] = matchedItems;
        }
      });

      const generateContent = (items: any[]) => ({
        title: isNC ? "CANCEL NCKOT" : "CANCEL KOT",
        table: tableData?.tableNumber,
        subTable: selectedSubTable || "A",
        waiter: session.waiterName,
        pax: session.pax,
        items: items.map((item) => ({
          qty: item.origQty || item.qty || 0, // ✅ IMPORTANT
          name: item.food,
          instructions: [],
        })),
      });
      let hasError = false;

      for (const rawPrinterName in printerItemMap) {
        const items = printerItemMap[rawPrinterName];

        const content = generateContent(items);

        let printerName = rawPrinterName;

        if (!printerName || printerName.trim() === "") {
          printerName = await qz.printers.getDefault();
        }

        const isThermal =
          printerName.toLowerCase().includes("pos") ||
          printerName.toLowerCase().includes("thermal");

        const finalData = isThermal
          ? formatThermal(content)
          : formatHTML(content);

        const result = await printKOT(printerName, finalData, isThermal);

        if (!result.success) {
          hasError = true;
          toast.error(`❌ ${printerName}: ${result.message}`);
        }
      }

      setSelectedVoidItems([]);
      if (tableData.fastFood === undefined) {
        navigate("/NewOrder");
      }

      if (hasError) {
        toast.error("Some printers failed ❌");
      } else {
        toast.success("Items voided & printed successfully ✅");
      }
    } catch (err) {
      console.error("Void failed:", err);
      toast.error("Void failed ❌");
    } finally {
      setKotLoading(false);
    }
  };

  const categoryMap = useMemo(() => {
    const map = new Map<
      number,
      { catCode: number; grpCode: number; grpName: string }
    >();
    console.log("masterItems", masterItems);

    masterItems.forEach((cat) => {
      cat.items.forEach((item) => {
        map.set(item.itemCode, {
          catCode: cat.catCode,
          grpCode: Number(cat.grpCode),
          grpName: cat.grpName,
        });
      });
    });

    return map;
  }, [masterItems]);
  const buildBillPayload = () => {
    if (!session) return null;

    const branch = localStorage.getItem("branch") || "";
    const outlet = localStorage.getItem("activeOltCode") || "";
    const isNC = selectedNcCode !== null && selectedNcCode !== 0;

    const taxType = taxSettings?.taxType || "normaltax"; // ✅ IMPORTANT
    console.log("oldCartData", oldCartData);
    console.log("categoryMap", categoryMap);

    const oldFoods = oldCartData.flatMap((order: any) =>
      order.food.map((f: any) => {
        const meta = categoryMap.get(f.itemCode);
        console.log("f.catCode", f.catCode);

        return {
          id: f.itemCode,
          food: f.food,
          code: String(f.itemCode),
          price: f.price,
          qty: f.qty,
          comment: f.comment || "",
          category: meta?.catCode || 0,
          grpCode: meta?.grpCode || 0,
          origQty: f.origQty ?? f.qty,
          itemDiscountAllowed: f.itemDiscountAllowed ?? true,
        };
      }),
    );

    const newFoods = cart.map((i) => {
      const meta = categoryMap.get(i.id);
      // ✅ Collect unique discount groups

      return {
        id: i.id,
        food: i.name,
        code: String(i.id),
        price: i.price,
        qty: i.qty,
        comment: i.spcodes || "",
        category: i.category || meta?.catCode || 0,
        grpCode: i.grpCode || meta?.grpCode || 0,
        origQty: i.qty,
        itemDiscountAllowed: i.itemDiscountAllowed ?? true,
      };
    });
    const food = [...oldFoods, ...newFoods];

    return {
      userCode: 3,
      table: tableData.tableNumber || "",
      subTable: selectedSubTable || "A",
      outlet,
      outletName: activeOltName,

      waiter: session.waiterCode,
      waiterName: session.waiterName,
      pax: session.pax,

      food,

      total: food.reduce((s, i) => s + i.price * i.qty, 0),
      totQty: food.reduce((s, i) => s + i.qty, 0),

      branch,
      type: isNC ? "N" : "K",
      ncCode: isNC ? selectedNcCode : 0,
      ncRemarks: isNC ? ncRemarks : "",

      discount: Number(discountValue || 0),
      discountType: discountType,
      discountIn: discountMode,
      discountRemarks: "",
      vRemarks: "1",

      mode: "ADD",
      subBillType: "S",
      discountGroups: selectedGroups,
      plan: "",
      guestName: "",
      guestCode: "",
      checkInNo: "",
      kotMobileNo: "",
      kotMinTimer: 0,
      taxType: taxType,
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
  };
  const handlePrintBill = async (billData: any) => {
    try {
      if (!billData) {
        throw new Error("No bill data");
      }

      // ✅ 1. POST BILL (FULL OBJECT)
      const res = await postBill(billData);
      console.log("Bill Posted:", res);

      // ✅ 2. PRINT BILL
      const printRes = await printBill(billData, res, companyInfo);

      if (!printRes.success) {
        throw new Error(printRes.message);
      }

      toast.success("Bill Printed Successfully ✅");
      if (tableData.fastFood === undefined) {
        navigate("/NewOrder");
      }
      return true;
    } catch (err: any) {
      console.error("Print Bill Error:", err);
      toast.error(err.message || "Print failed ❌");
      return false;
    }
  };
  const handleGetBill = async () => {
    const payload = buildBillPayload();
    console.log("payload", payload);

    try {
      const res = await getBill(payload);
      console.log("res", res);

      const finalResponse = {
        cart: {
          ...payload, // your cart data goes here
        },
        tax: {
          ...res, // full tax response
          taxList: res.taxList || [], // ensure taxList is included
          taxType: taxSettings?.taxType, // ✅ ADD THIS
        },
        billingType: "C",
        subBillingType: "C",
      };

      console.log("finalResponse", finalResponse);
      // ✅ set state
      setBillData(finalResponse);
      setShowInvoice(true);
    } catch (err) {
      console.error("GetBill failed", err);
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
        <div className="flex gap-2 overflow-x-auto p-2 border-b bg-white">
          {groups.map((g) => (
            <button
              key={g.grpCode}
              onClick={() => setActiveGroup(g.grpCode)} // 🔥 CORE
              className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap
        ${
          activeGroup === g.grpCode
            ? "bg-[#0576B2] text-white"
            : "bg-gray-100 text-gray-700"
        }`}
            >
              {g.grpName}
            </button>
          ))}
        </div>
        {session && tableData.fastFood === undefined && (
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
            {tableData.status === "Available" &&
              tableData.fastFood === undefined && (
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
          handleGetBill={handleGetBill}
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
          onKOT={
            tableData.fastFood === undefined
              ? handleKOT
              : () => {
                  setOpenPayment(true);
                }
          }
          onVoid={handleVoid}
          kotLoading={kotLoading}
        />
      </div>

      {/* MOBILE CART */}
      <MobileCartButton
        handleGetBill={handleGetBill}
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
        onKOT={
          tableData.fastFood === undefined
            ? handleKOT
            : () => {
                setOpenPayment(true);
              }
        }
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
      {showInvoice && billData && tableData.fastFood === undefined && (
        <InvoicePopup
          discountOptions={discountModes}
          groupOptions={groups}
          cart={billData.cart}
          tax={billData.tax}
          onClose={() => {setShowInvoice(false)
            setDiscountType("")
            setDiscountValue("")
          }}
          onPrint={() => handlePrintBill(billData)}
          showDiscount={showDiscount}
          setShowDiscount={setShowDiscount}
          discountType={discountType}
          setDiscountType={setDiscountType}
          selectedGroups={selectedGroups}
          setSelectedGroups={setSelectedGroups}
          discountValue={discountValue}
          setDiscountValue={setDiscountValue}
          reGetBill={handleGetBill}
          discountMode={discountMode}
          setDiscountMode={setDiscountMode}
        />
      )}

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
      <PaymentModalForFastFood
        paymentModes={paymentModes}
        isOpen={openPayment}
        onClose={() => setOpenPayment(false)}
        onPay={handleFastFoodKOT}
        runApi={handleGetBill}
        unbillData={billData}
      />
    </div>
  );
}

export default OrderingBoard;
