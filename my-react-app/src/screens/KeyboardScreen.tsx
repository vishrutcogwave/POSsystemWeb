import React, { useEffect, useMemo, useRef, useState } from "react";


import toast from "react-hot-toast";

import { useItems } from "../context/ItemContext";

import { useActiveOLT } from "../context/ActiveOLTContext";

import { useAppContext } from "../context/AppContext";

import {
  getCombinedOutletAndTableMasterList,
  getStewardList,
  getSubTables,
  getOldCart,
  getBill,
  createOrder,
  postBill,
  getBillGenerationSettings,
  getTaxSettings,
  getOpenDayDetails,
  validateDay,
} from "../api/services/products.service";

import { printKOT, printBill } from "../api/services/printer";

type Table = {
  tableNumber: string;

  status: string;

  kotStatus?: string;

  peopleCount?: number;

  BillNo: number;
};

type Outlet = {
  oltCode: number;

  oltName: string;

  oltIsRoomService: boolean;

  isDirectKOTandBill: boolean;

  isDirectPaxandStw: boolean;

  isDirectBill: boolean;

  tables: {
    tblNo: string;

    tableStatus: string;

    kotStatus: string;

    billNo: number;

    billAmount?: number;
  }[];
};

type Steward = {
  stwCode: number;

  stwName: string;
};

type CartItem = {
  id: number;

  name: string;

  price: number;

  qty: number;
  unit?: string;

  category: number;

  grpCode: number;

  spcodes: string;

  note: string;

  itemDiscountAllowed?: boolean;
};

type FocusField =
  | "outlet"
  | "table"
  | "pax"
  | "steward"
  | "code"
  | "foodDropdown"
  | "quantity"
  | "cart"
  | "action";

const paxOptions = Array.from({ length: 10 }, (_, i) => i + 1);

export default function KeyboardScreen() {
  // ============================================================
  // KEYBOARD SCREEN CONTROLLER FLOW
  // ============================================================
  // 01. Initial Data       -> loadData / loadStewards / loadSettings
  // 02. Outlet & Table     -> selectOutlet / loadExistingTable
  // 03. Steward & Settings -> loadStewards / loadSettings
  // 04. Cart               -> addFood / increase / decrease / update
  // 05. Existing Order     -> loadExistingTable / old cart
  // 06. Session            -> startSession / resetNewOrder
  // 07. KOT                -> validate -> payload -> create -> print
  // 08. Bill               -> validate -> payload -> bill -> print
  // 09. Keyboard           -> shortcuts -> focus -> dropdown -> select
  // 10. UI                 -> render only; business flow stays above
  // ============================================================


  const { items, masterItems, loading } = useItems();

  const { activeOltName, setActiveOLT } = useActiveOLT();

  const { appData } = useAppContext();

  const [outlets, setOutlets] = useState<Outlet[]>([]);

  const [activeOutlet, setActiveOutlet] = useState<Outlet | null>(null);

  const [tables, setTables] = useState<Table[]>([]);

  const [tableIndex, setTableIndex] = useState(0);

  const [stewards, setStewards] = useState<Steward[]>([]);

  const [stewardIndex, setStewardIndex] = useState(0);

  const [pax, setPax] = useState(1);

  const [_paxIndex, setPaxIndex] = useState(0);

  const [tableNumber, setTableNumber] = useState("");

  const [selectedSubTable, setSelectedSubTable] = useState("A");

  const [session, setSession] = useState<{
    pax: number;

    waiterCode: string;

    waiterName: string;
  } | null>(null);

  const [cart, setCart] = useState<CartItem[]>([]);

  const [oldCartData, setOldCartData] = useState<any[]>([]);

  const [subTables, setSubTables] = useState<any[]>([]);

  const [code, setCode] = useState("");

  const [search, setSearch] = useState("");

  const [focusField, setFocusField] = useState<FocusField>("outlet");

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [selectedFoodIndex, setSelectedFoodIndex] = useState(0);
  const [selectedFood, setSelectedFood] = useState<any | null>(null);
  const [selectedUnit, setSelectedUnit] = useState("");
  const [quantity, setQuantity] = useState("1");

  const [loadingData, setLoadingData] = useState(false);

  const [processing, setProcessing] = useState(false);

  const [totalAmount, setTotalAmount] = useState(0);

  const [billData, setBillData] = useState<any>(null);

  const [isNC, setIsNC] = useState(false);

  const [billGenerationSettings, setBillGenerationSettings] = useState({
    billingType: "",

    subBillingType: "",
  });

  const [taxSettings, setTaxSettings] = useState<any>(null);

  const [openDayDetails, setOpenDayDetails] = useState<any>(null);

  const outletRef = useRef<HTMLSelectElement>(null);
  const tableRef = useRef<HTMLSelectElement>(null);
  const paxRef = useRef<HTMLSelectElement>(null);
  const stewardRef = useRef<HTMLSelectElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);
  const quantityRef = useRef<HTMLInputElement>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const branch = localStorage.getItem("branch") || "";

  // ============================================================
  // CONTROLLER 01: INITIAL DATA FLOW
  // Outlet -> tables -> initial selection
  // ============================================================

  const loadData = async () => {
    try {
      setLoadingData(true);

      const data: Outlet[] = await getCombinedOutletAndTableMasterList(
        appData?.user?.branch_code || "",

        appData?.user?.userCode,
      );

      setOutlets(data || []);

      if (!data?.length) return;

      const savedOutlet = localStorage.getItem("activeOltCode");

      const outlet =
        data.find((o) => String(o.oltCode) === savedOutlet) || data[0];

     selectOutlet(outlet);
    } catch (error) {
      console.error(error);

      toast.error("Failed to load outlets");
    } finally {
      setLoadingData(false);
    }
  };

  // ============================================================
  // CONTROLLER 02: OUTLET / TABLE FLOW
  // Outlet -> active OLT -> tables -> table focus
  // ============================================================

  const selectOutlet = (outlet: Outlet) => {
    setActiveOutlet(outlet);

    setActiveOLT(String(outlet.oltCode), outlet.oltName.trim());

    localStorage.setItem("activeOltCode", String(outlet.oltCode));

    const formatted: Table[] = (outlet.tables || []).map((t) => ({
      tableNumber: t.tblNo,

      status: t.tableStatus,

      kotStatus: t.kotStatus,

      peopleCount: 0,

      BillNo: t.billNo,
    }));

    setTables(formatted);

    setTableIndex(0);

    if (formatted.length) {
      setTableNumber(formatted[0].tableNumber);
    } else {
      setTableNumber("");
    }
  };

  // ============================================================
  // CONTROLLER 03: STEWARD / SETTINGS FLOW
  // ============================================================

  const loadStewards = async () => {
    try {
      const data = await getStewardList(branch);

      setStewards(data || []);

      setStewardIndex(0);
    } catch (error) {
      console.error(error);

      toast.error("Failed to load steward list");
    }
  };

  const loadSettings = async () => {
    try {
      const [billSettings, tax] = await Promise.all([
        getBillGenerationSettings(branch),

        getTaxSettings(branch),
      ]);

      if (billSettings?.success && billSettings?.data?.length) {
        setBillGenerationSettings({
          billingType: billSettings.data[0].billingType,

          subBillingType: billSettings.data[0].subBillingType,
        });
      }

      setTaxSettings(tax);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    void loadData();

    void loadStewards();

    void loadSettings();

    // Same open-day validation used by OrderingBoard.

    void getOpenDayDetails(
      appData?.user?.userCode || 0,

      appData?.user?.branch_code || "",
    )
      .then(setOpenDayDetails)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!outlets.length) return;
    focusOutlet();
  }, [outlets.length]);

  /**\*** ---------------- FOOD LOOKUP ---------------- **\\\***/

  const allFoods = useMemo(() => {
    const map = new Map<number, any>();

    items.forEach((category: any) => {
      category.items.forEach((food: any) => {
        if (!map.has(food.itemCode)) {
          map.set(food.itemCode, {
            ...food,

            category: category.catCode,

            grpCode: Number(category.grpCode || 0),
          });
        }
      });
    });

    return Array.from(map.values());
  }, [items]);

  const filteredFoods = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return allFoods.slice(0, 30);

    return allFoods

      .filter(
        (f: any) =>
          String(f.itemCode).includes(q) ||
          String(f.itemName || "")
            .toLowerCase()
            .includes(q) ||
          String(f.barcode || "").includes(q),
      )

      .slice(0, 30);
  }, [allFoods, search]);

  // Keep the keyboard-selected item visible while using ArrowUp / ArrowDown.
  useEffect(() => {
    if (focusField !== "foodDropdown" || !dropdownOpen) return;

    const row = dropdownRef.current?.querySelector<HTMLElement>(
      `[data-food-index="${selectedFoodIndex}"]`,
    );

    row?.scrollIntoView({ block: "nearest" });
  }, [selectedFoodIndex, focusField, dropdownOpen]);

  /**\\\*** ---------------- CART ---------------- **\\\***/

  // ============================================================
  // CONTROLLER 04: CART FLOW
  // Search result -> add -> quantity -> total
  // ============================================================

  const addFood = (food: any, unit: string, qtyValue: number) => {
    if (!session) {
      toast.error("Select Pax and Steward, then press Enter to start");
      return;
    }

    const safeQty = Math.max(1, Number(qtyValue) || 1);

    setCart((prev) => {
      const existing = prev.find(
        (i) => i.id === food.itemCode && (i.unit || "") === unit,
      );

      if (existing) {
        return prev.map((i) =>
          i.id === food.itemCode && (i.unit || "") === unit
            ? { ...i, qty: i.qty + safeQty }
            : i,
        );
      }

      return [
        ...prev,
        {
          id: food.itemCode,
          name: String(food.itemName || "").trim(),
          price: Number(food.oidRate || 0),
          qty: safeQty,
          unit,
          category: Number(food.category || 0),
          grpCode: Number(food.grpCode || 0),
          spcodes: "",
          note: "",
          itemDiscountAllowed: food.itemDiscountAllowed ?? true,
        },
      ];
    });

    setCode("");
    setSearch("");
    setSelectedFood(null);
    setSelectedUnit("");
    setQuantity("1");
    setDropdownOpen(false);
    setFocusField("code");
    setTimeout(() => codeRef.current?.focus(), 0);
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

  const updateQty = (id: number, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((i) => i.id !== id));

      return;
    }

    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, qty } : i)));
  };

  // ============================================================
  // CONTROLLER 05: EXISTING ORDER / TABLE FLOW
  // Table -> sub-table -> old cart -> session
  // ============================================================

  const loadExistingTable = async (table: string) => {
    if (!table || !activeOutlet) return;

    try {
      setProcessing(true);

      const data = await getSubTables(
        String(activeOutlet.oltCode),

        table,

        appData?.user?.branch_code,
      );

      setSubTables(data || []);

      const occupied = (data || []).find(
        (x: any) => x.tableStatus !== "Available",
      );

      const sub = occupied?.subTable || "A";

      setSelectedSubTable(sub);

      const old = await getOldCart(
        table,

        String(activeOutlet.oltCode),

        sub,

        appData?.user?.branch_code,
      );

      setOldCartData(old || []);

      if (old?.length) {
        const first = old[0];

        setSession({
          pax: Number(first.pax || 1),

          waiterCode: String(first.waiter || ""),

          waiterName: first.waiterName || "",
        });

        // Existing items stay in oldCartData.

        // New items added from the keyboard go into cart.

        setCart([]);

        toast.success(`Loaded table ${table}`);
      } else {
        setSession(null);

        setCart([]);
      }
    } catch (error) {
      console.error(error);

      toast.error("Failed to load table");
    } finally {
      setProcessing(false);

      setFocusField("code");

      setTimeout(() => codeRef.current?.focus(), 0);
    }
  };

  // ============================================================
  // CONTROLLER 06: NEW SESSION FLOW
  // Table + steward + pax -> session -> ready for items
  // ============================================================

  const startSession = () => {
    if (!tableNumber) {
      toast.error("Select table");

      return;
    }

    if (!stewards.length) {
      toast.error("No steward available");

      return;
    }

    const steward = stewards[stewardIndex];

    setSession({
      pax,

      waiterCode: String(steward.stwCode),

      waiterName: steward.stwName,
    });

    setCart([]);

    setOldCartData([]);

    setSelectedSubTable(
      subTables.length ? subTables[subTables.length - 1]?.subTable || "A" : "A",
    );

    toast.success(`New session started for table ${tableNumber}`);

    setFocusField("code");

    setTimeout(() => codeRef.current?.focus(), 0);
  };

  /**\\\*** ---------------- BILL PAYLOAD ---------------- **\\\***/

  const categoryMap = useMemo(() => {
    const map = new Map<number, { catCode: number; grpCode: number }>();

    masterItems.forEach((cat: any) => {
      cat.items.forEach((item: any) => {
        map.set(item.itemCode, {
          catCode: Number(cat.catCode || 0),

          grpCode: Number(cat.grpCode || 0),
        });
      });
    });

    return map;
  }, [masterItems]);

  // ------------------------------------------------------------
  // SHARED BILL PAYLOAD BUILDER
  // Used by both KOT and BILL controllers
  // ------------------------------------------------------------

  const buildBillPayload = () => {
    if (!session) return null;

    const oldFoods = oldCartData.flatMap((order: any) =>
      (order.food || []).map((f: any) => {
        const meta = categoryMap.get(Number(f.itemCode));

        return {
          id: Number(f.itemCode || f.id),

          food: f.food,

          code: String(f.itemCode || f.id),

          price: Number(f.price || 0),

          qty: Number(f.qty || 0),

          comment: f.comment || "",

          category: meta?.catCode || 0,

          grpCode: meta?.grpCode || 0,

          origQty: Number(f.origQty ?? f.qty ?? 0),

          itemDiscountAllowed: f.itemDiscountAllowed ?? true,
        };
      }),
    );

    const newFoods = cart.map((i) => ({
      id: i.id,

      food: i.name,

      code: String(i.id),

      price: i.price,

      qty: i.qty,

      comment: i.spcodes || "",

      category: i.category || categoryMap.get(i.id)?.catCode || 0,

      grpCode: i.grpCode || categoryMap.get(i.id)?.grpCode || 0,

      origQty: i.qty,

      itemDiscountAllowed: i.itemDiscountAllowed ?? true,
    }));

    const food = [...oldFoods, ...newFoods];

    return {
      userCode: appData?.user?.userCode || 0,

      table: tableNumber,

      subTable: selectedSubTable || "A",

      outlet: String(activeOutlet?.oltCode || ""),

      outletName: activeOltName,

      waiter: session.waiterCode,

      waiterName: session.waiterName,

      pax: session.pax,

      food,

      total: food.reduce((s, i) => s + i.price * i.qty, 0),

      totQty: food.reduce((s, i) => s + i.qty, 0),

      branch,

      type: isNC ? "N" : "K",

      ncCode: 0,

      ncRemarks: "",

      discount: 0,

      discountType: "",

      discountIn: "amt",

      discountRemarks: "",

      vRemarks: "1",

      mode: "ADD",

      subBillType: billGenerationSettings.subBillingType,

      discountGroups: [""],

      plan: "",

      guestName: "",

      guestCode: "",

      checkInNo: "",

      kotMobileNo: "",

      kotMinTimer: 0,

      taxType: taxSettings?.taxType || "normaltax",

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

  /**\\\*** ---------------- KOT ---------------- **\\\***/

  // ============================================================
  // CONTROLLER 07: KOT FLOW
  // Validate -> payload -> create order -> printer -> reset
  // ============================================================

  const handleKOT = async () => {
    if (!session || !cart.length) {
      toast.error("Select session and add items");

      return;
    }

    try {
      setProcessing(true);

      const validateRes = await validateDay({
        posEntryDate: openDayDetails?.shiftDate || "",

        branchcode: appData?.user?.branch_code || "",
      });

      if (!validateRes?.success) {
        toast.error(validateRes?.message || "Please open the day first");

        return;
      }

      const payload = buildBillPayload();

      if (!payload) return;

      const res = await createOrder(payload);

      const printers = res?.printers || [];

      const foodItems = res?.food || [];

      const generateContent = (printItems: any[]) => ({
        title: isNC ? "NC KOT" : "KOT",

        kotId: res?.kotId || res?.kotID || res?.kotNo || "",

        table: tableNumber,

        subTable: selectedSubTable || "A",

        waiter: session.waiterName,

        pax: session.pax,

        items: printItems.map((item: any) => ({
          qty: item.origQty,

          name: item.food,

          instructions: item.comment ? item.comment.split(",") : [],
        })),
      });

      if (printers.length) {
        for (const printer of printers) {
          const categoryIds = printer.categoryIds ?? [];

          const matched = foodItems.filter((item: any) =>
            categoryIds.includes(Number(item.category)),
          );

          const printItems = matched.length ? matched : foodItems;

          const result = await printKOT(
            printer.printerName || null,

            generateContent(printItems),

            printer.ipAddress || "",

            true,
          );

          if (!result?.success) {
            toast.error(
              `${printer.printerName || "Printer"}: ${
                result?.message || "Print failed"
              }`,
            );
          }
        }
      }

      toast.success("KOT created & printed successfully");

      setCart([]);

      setOldCartData([]);

      setIsNC(false);
    } catch (error) {
      console.error(error);

      toast.error("Failed to create KOT");
    } finally {
      setProcessing(false);

      setFocusField("code");

      setTimeout(() => codeRef.current?.focus(), 0);
    }
  };

  /**\\\*** ---------------- BILL ---------------- **\\\***/

  // ============================================================
  // CONTROLLER 08: BILL FLOW
  // Validate -> payload -> bill -> post -> print -> reset
  // ============================================================

  const handleBill = async () => {
    if (!session || (!cart.length && !oldCartData.length)) {
      toast.error("No items to bill");

      return;
    }

    try {
      setProcessing(true);

      const payload = buildBillPayload();

      if (!payload) return;

      const tax = await getBill(payload);

      const finalBill = {
        cart: { ...payload },

        tax: {
          ...tax,

          taxList: tax?.taxList || [],

          taxType: taxSettings?.taxType,
        },

        billingType: billGenerationSettings.billingType,

        subBillingType: billGenerationSettings.subBillingType,
      };

      setBillData(finalBill);

      setTotalAmount(Number(tax?.grandTotal || 0));

      const res = await postBill(finalBill);

      const printRes = await printBill(
        finalBill,

        res,

        null,

        res?.ipAddress || "",
      );

      if (!printRes?.success) {
        throw new Error(printRes?.message || "Bill print failed");
      }

      toast.success("Bill printed successfully");

      setCart([]);

      setOldCartData([]);
    } catch (error: any) {
      console.error(error);

      toast.error(error?.message || "Bill failed");
    } finally {
      setProcessing(false);

      setFocusField("code");

      setTimeout(() => codeRef.current?.focus(), 0);
    }
  };

  /**\\\*** ---------------- KEYBOARD ---------------- **\\\***/

  const focusKeyboardField = (field: FocusField) => {
    setFocusField(field);
    setDropdownOpen(field !== "code");

    requestAnimationFrame(() => {
      if (field === "outlet") outletRef.current?.focus();
      if (field === "table") tableRef.current?.focus();
      if (field === "pax") paxRef.current?.focus();
      if (field === "steward") stewardRef.current?.focus();
      if (field === "code") {
        codeRef.current?.focus();
        codeRef.current?.select();
      }
    });
  };

  const focusOutlet = () => focusKeyboardField("outlet");
  const focusTable = () => focusKeyboardField("table");
  const focusPax = () => focusKeyboardField("pax");
  const focusSteward = () => focusKeyboardField("steward");
  const focusCode = () => focusKeyboardField("code");

  const resetNewOrder = () => {
    setCart([]);

    setOldCartData([]);

    setSubTables([]);

    setSession(null);

    setSelectedSubTable("A");

    setCode("");

    setSearch("");

    setIsNC(false);

    focusOutlet();
  };

  // ============================================================
  // CONTROLLER 09: KEYBOARD FLOW
  // Shortcuts -> field focus -> dropdown navigation -> selection
  // ============================================================

  const handleGlobalKeyDown = (e: KeyboardEvent) => {
    if (processing) return;

    // F11 = New Order

    if (e.key === "F11") {
      e.preventDefault();

      resetNewOrder();

      return;
    }

    // F12 = Normal Void screen

    if (e.key === "F12") {
      e.preventDefault();

      toast(
        "Normal VOID selected. Use the old ordered-item list to select an item.",
      );

      return;
    }

    // F9 = NC Void

    if (e.key === "F9") {
      e.preventDefault();

      setIsNC(true);

      toast("NC mode enabled");

      return;
    }

    // Ctrl + R = refresh

    if (e.ctrlKey && e.key.toLowerCase() === "r") {
      e.preventDefault();

      void loadData();

      void loadStewards();

      return;
    }

    // Ctrl + N = new order

    if (e.ctrlKey && e.key.toLowerCase() === "n") {
      e.preventDefault();

      resetNewOrder();

      return;
    }

    // Ctrl + K = KOT

    if (e.ctrlKey && e.key.toLowerCase() === "k") {
      e.preventDefault();

      void handleKOT();

      return;
    }

    // Ctrl + B = Bill

    if (e.ctrlKey && e.key.toLowerCase() === "b") {
      e.preventDefault();

      void handleBill();

      return;
    }

    // Alt + first character opens a field/list.

    if (e.altKey) {
      const key = e.key.toLowerCase();

      if (key === "o") {
        e.preventDefault();

        setFocusField("outlet");

        setDropdownOpen(true);

        return;
      }

      if (key === "t") {
        e.preventDefault();

        setFocusField("table");

        setDropdownOpen(true);

        return;
      }

      if (key === "p") {
        e.preventDefault();

        setFocusField("pax");

        setDropdownOpen(true);

        return;
      }

      if (key === "s") {
        e.preventDefault();

        setFocusField("steward");

        setDropdownOpen(true);

        return;
      }

      if (key === "c") {
        e.preventDefault();

        focusCode();

        return;
      }

      return;
    }

    if (e.key === "Escape") {
      setDropdownOpen(false);

      focusCode();

      return;
    }

    if (focusField === "outlet" && dropdownOpen) {
      if (e.key === "ArrowDown") {
        e.preventDefault();

        const index = Math.max(
          0,

          outlets.findIndex((o) => o.oltCode === activeOutlet?.oltCode) + 1,
        );

        const next = outlets[index] || outlets[0];

        if (next) selectOutlet(next);
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();

        const current = outlets.findIndex(
          (o) => o.oltCode === activeOutlet?.oltCode,
        );

        const next = outlets[Math.max(0, current - 1)];

        if (next) selectOutlet(next);
      }

      if (e.key === "Enter") {
        e.preventDefault();
        focusTable();
      }

      return;
    }

    if (focusField === "table" && dropdownOpen) {
      if (e.key === "ArrowDown") {
        e.preventDefault();

        setTableIndex((i) => {
          const next = Math.min(i + 1, tables.length - 1);

          setTableNumber(tables[next]?.tableNumber || "");

          return next;
        });
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();

        setTableIndex((i) => {
          const next = Math.max(i - 1, 0);

          setTableNumber(tables[next]?.tableNumber || "");

          return next;
        });
      }

      if (e.key === "Enter") {
        e.preventDefault();

        setDropdownOpen(false);

        const selected = tables[tableIndex];

        if (
          selected?.status === "Occupied" ||
          selected?.status === "Unsettled"
        ) {
          void loadExistingTable(selected.tableNumber);
        } else {
          focusPax();
        }
      }

      return;
    }

    if (focusField === "pax" && dropdownOpen) {
      if (e.key === "ArrowDown") {
        e.preventDefault();

        setPaxIndex((i) => {
          const next = Math.min(i + 1, paxOptions.length - 1);

          setPax(paxOptions[next]);

          return next;
        });
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();

        setPaxIndex((i) => {
          const next = Math.max(i - 1, 0);

          setPax(paxOptions[next]);

          return next;
        });
      }

      if (e.key === "Enter") {
        e.preventDefault();
        focusSteward();
      }

      return;
    }

    if (focusField === "steward" && dropdownOpen) {
      if (e.key === "ArrowDown") {
        e.preventDefault();

        setStewardIndex((i) => Math.min(i + 1, stewards.length - 1));
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();

        setStewardIndex((i) => Math.max(i - 1, 0));
      }

      if (e.key === "Enter") {
        e.preventDefault();

        setDropdownOpen(false);

        startSession();
      }

      return;
    }

    // Food dropdown keyboard control.

    if (focusField === "foodDropdown" && dropdownOpen) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedFoodIndex((index) =>
          Math.min(index + 1, filteredFoods.length - 1),
        );
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedFoodIndex((index) => Math.max(index - 1, 0));
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        const food = filteredFoods[selectedFoodIndex];
        if (!food) return;

        // Item selected. Keep the item dropdown open so ArrowUp/ArrowDown
        // can still be used to choose another item. Move keyboard focus to Qty.
        const defaultUnit = String(food.unitName || food.mainUnit || "").trim();

        setSelectedFood(food);
        setSelectedUnit(defaultUnit);
        setQuantity("1");
        setFocusField("quantity");
        setDropdownOpen(true);
        setTimeout(() => {
          quantityRef.current?.focus();
          quantityRef.current?.select();
        }, 0);
        return;
      }
      return;
    }

    // Quantity keyboard control.
    if (focusField === "quantity" && dropdownOpen && selectedFood) {
      if (e.key === "Enter") {
        e.preventDefault();
        const qtyValue = Number(quantity);
        if (!Number.isFinite(qtyValue) || qtyValue <= 0) {
          toast.error("Enter a valid quantity");
          quantityRef.current?.focus();
          return;
        }
        addFood(selectedFood, selectedUnit, qtyValue);
        return;
      }
      return;
    }

    // Cart keyboard control.

    if (focusField === "cart" && cart.length) {
      if (e.key === "ArrowDown") {
        e.preventDefault();

        setSelectedCartIndex((i) => Math.min(i + 1, cart.length - 1));

        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();

        setSelectedCartIndex((i) => Math.max(i - 1, 0));

        return;
      }

      if (e.key === "+") {
        e.preventDefault();

        const item = cart[selectedCartIndex];

        if (item) increaseQty(item.id);

        return;
      }

      if (e.key === "-") {
        e.preventDefault();

        const item = cart[selectedCartIndex];

        if (item) decreaseQty(item.id);

        return;
      }

      if (e.key === "Delete") {
        e.preventDefault();

        const item = cart[selectedCartIndex];

        if (item) updateQty(item.id, 0);

        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();

        focusCode();
      }
    }
  };

  const [selectedCartIndex, setSelectedCartIndex] = useState(0);

  useEffect(() => {
    window.addEventListener("keydown", handleGlobalKeyDown);

    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  });

  /* Barcode scanner / item code input */

  const handleCodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;

    e.preventDefault();

    const value = code.trim();

    if (!value) return;

    const results = allFoods

      .filter((f: any) => {
        const searchValue = value.toLowerCase();

        const itemCode = String(f.itemCode || "").toLowerCase();

        const itemName = String(f.itemName || "").toLowerCase();

        const barcode = String(f.barcode || "").toLowerCase();

        return (
          itemCode.includes(searchValue) ||
          itemName.includes(searchValue) ||
          barcode.includes(searchValue)
        );
      })

      .slice(0, 30);

    if (!results.length) {
      toast.error(`Item not found: ${value}`);

      return;
    }

    // Show dropdown only after ENTER.

    setSearch(value);

    setSelectedFoodIndex(0);

    setDropdownOpen(true);

    setFocusField("foodDropdown");

    setTimeout(() => {
      dropdownRef.current?.focus();
    }, 0);
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  /**\\\*** ---------------- UI ---------------- **\\\***/

  return (
    <div className="h-screen bg-[#E9E9E9] text-sm font-sans overflow-hidden">
      <div className="h-10 bg-[#0B4F4A] text-white flex items-center px-4 font-bold">
        KITCHEN ORDER TRACKING
        <span className="ml-auto text-yellow-300 text-xs">
          F11 NEW ORDER &nbsp; | &nbsp; F12 NORMAL VOID &nbsp; | &nbsp; F9 NC
          VOID
        </span>
      </div>

      <div className="h-[calc(100vh-40px)] grid grid-cols-[260px_1fr_260px] gap-1 p-1">
        <section className="bg-[#DDEFEF] border border-gray-500 p-2 flex flex-col gap-2">
          <div className="text-center font-bold text-[#0B4F4A] text-lg">
            KEYBOARD BILLING
          </div>

          <label className="font-bold">
            Outlet
            <select
              ref={outletRef}
              value={activeOutlet?.oltCode || ""}
              onFocus={() => setFocusField("outlet")}
              onChange={(e) => {
                const outlet = outlets.find(
                  (o) => String(o.oltCode) === e.target.value,
                );

                if (outlet) selectOutlet(outlet);
              }}
              className="w-full border h-8 px-1"
            >
              {outlets.map((o) => (
                <option key={o.oltCode} value={o.oltCode}>
                  {o.oltName.trim()}
                </option>
              ))}
            </select>
          </label>

          <label className="font-bold">
            Table
            <select
              ref={tableRef}
              value={tableNumber}
              onFocus={() => setFocusField("table")}
              onChange={(e) => {
                const index = tables.findIndex(
                  (t) => t.tableNumber === e.target.value,
                );

                setTableIndex(Math.max(index, 0));

                setTableNumber(e.target.value);
              }}
              className="w-full border h-8 px-1"
            >
              {tables.map((t) => (
                <option key={t.tableNumber} value={t.tableNumber}>
                  {t.tableNumber} - {t.status}
                </option>
              ))}
            </select>
          </label>

          <label className="font-bold">
            Pax
            <select
              ref={paxRef}
              value={pax}
              onFocus={() => setFocusField("pax")}
              onChange={(e) => setPax(Number(e.target.value))}
              className="w-full border h-8 px-1"
            >
              {paxOptions.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>

          <label className="font-bold">
            Steward
            <select
              ref={stewardRef}
              value={stewards[stewardIndex]?.stwCode || ""}
              onFocus={() => setFocusField("steward")}
              onChange={(e) =>
                setStewardIndex(
                  Math.max(
                    0,

                    stewards.findIndex(
                      (s) => String(s.stwCode) === e.target.value,
                    ),
                  ),
                )
              }
              className="w-full border h-8 px-1"
            >
              {stewards.map((s) => (
                <option key={s.stwCode} value={s.stwCode}>
                  {s.stwName}
                </option>
              ))}
            </select>
          </label>

          <button
            onClick={startSession}
            className="bg-[#0B4F4A] text-white font-bold py-2 border border-black"
          >
            ENTER - START SESSION
          </button>

          <div className="grid grid-cols-2 gap-1 mt-1">
            <button
              onClick={resetNewOrder}
              className="bg-yellow-300 border border-black py-2 font-bold"
            >
              F11 NEW
            </button>

            <button
              onClick={() => void handleKOT()}
              className="bg-green-500 text-white border border-black py-2 font-bold"
            >
              CTRL+K KOT
            </button>

            <button
              onClick={() => void handleBill()}
              className="bg-blue-600 text-white border border-black py-2 font-bold"
            >
              CTRL+B BILL
            </button>

            <button
              onClick={() => setIsNC((v) => !v)}
              className={`border border-black py-2 font-bold ${
                isNC ? "bg-orange-500 text-white" : "bg-white"
              }`}
            >
              F9 NC
            </button>
          </div>

          <div className="mt-auto border border-black bg-yellow-100">
            <div className="flex justify-between px-2 py-1">
              <b>Total Qty</b>

              <b>{cart.reduce((s, i) => s + i.qty, 0)}</b>
            </div>

            <div className="flex justify-between px-2 py-2 text-lg">
              <b>Grand Total</b>

              <b>₹{(totalAmount || total).toFixed(2)}</b>
            </div>
          </div>
        </section>

        <section className="bg-white border border-gray-500 min-w-0 flex flex-col">
          <table className="w-full border-collapse table-fixed">
            <colgroup>
              <col className="w-[70px]" />
              <col />
              <col className="w-[70px]" />
              <col className="w-[100px]" />
              <col className="w-[110px]" />
            </colgroup>
            <thead>
              <tr className="bg-[#E4AE12] border-b border-gray-700 font-bold text-center">
                <th className="border px-2 py-1 text-left">Code</th>
                <th className="border px-2 py-1 text-left">Name</th>
                <th className="border px-2 py-1">Qty</th>
                <th className="border px-2 py-1 text-right">Rate</th>
                <th className="border px-2 py-1 text-right">Amount</th>
              </tr>
            </thead>
          </table>

          <div className="border-b p-1">
            <input
              ref={codeRef}
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
              }}
              onFocus={() => setFocusField("code")}
              onKeyDown={handleCodeKeyDown}
              placeholder="Type Item Code / Name and press ENTER"
              className="w-full h-9 border border-[#0B4F4A] px-2 outline-none"
            />
          </div>

          <div className="flex-1 min-h-0 overflow-auto">
            <table className="w-full border-collapse table-fixed">
              <colgroup>
                <col className="w-[70px]" />
                <col />
                <col className="w-[70px]" />
                <col className="w-[100px]" />
                <col className="w-[110px]" />
              </colgroup>

              <tbody>
                {cart.map((item, index) => (
                  <tr
                    key={`${item.id}-${index}`}
                    onClick={() => setSelectedCartIndex(index)}
                    className={
                      index === selectedCartIndex
                        ? "bg-gray-500 text-white"
                        : "bg-white"
                    }
                  >
                    <td className="border px-2 py-1 w-[70px]">{item.id}</td>

                    <td className="border px-2 py-1">{item.name}</td>

                    <td className="border px-2 py-1 text-center w-[70px]">
                      {item.qty}
                    </td>

                    <td className="border px-2 py-1 text-right w-[100px]">
                      {item.price}
                    </td>

                    <td className="border px-2 py-1 text-right w-[110px]">
                      {(item.price * item.qty).toFixed(2)}
                    </td>
                  </tr>
                ))}

                {!cart.length && (
                  <tr>
                    <td colSpan={6} className="h-40 text-center text-gray-400">
                      Scan/type item code and press ENTER
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {dropdownOpen && filteredFoods.length > 0 && (
            <div
              ref={dropdownRef}
              tabIndex={-1}
              className="border-t bg-white h-40 outline-none flex flex-col"
            >
              {/* Header - fixed */}
              <div className="shrink-0 bg-[#E4AE12]">
                <table className="w-full table-fixed border-collapse text-sm">
                  <colgroup>
                    <col className="w-[80px]" />
                    <col />
                    <col className="w-[120px]" />
                  </colgroup>

                  <thead>
                    <tr>
                      <th className="border border-gray-400 px-2 py-1 text-left font-bold">
                        Code
                      </th>
                      <th className="border border-gray-400 px-2 py-1 text-left font-bold">
                        Name
                      </th>
                      <th className="border border-gray-400 px-2 py-1 text-left font-bold">
                        Rate
                      </th>
                    </tr>
                  </thead>
                </table>
              </div>

              {/* Only rows scroll */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden">
                <table className="w-full table-fixed border-collapse text-sm">
                  <colgroup>
                    <col className="w-[80px]" />
                    <col />
                    <col className="w-[120px]" />
                  </colgroup>

                  <tbody>
                    {filteredFoods.map((food: any, index: number) => (
                      <tr
                        key={food.itemCode}
                        data-food-index={index}
                        className={
                          index === selectedFoodIndex
                            ? "bg-gray-500 text-white font-bold"
                            : "bg-[#FFFF66] text-black"
                        }
                      >
                        <td className="border border-gray-400 px-2 py-1 text-left">
                          {food.itemCode}
                        </td>

                        <td className="border border-gray-400 px-2 py-1 text-left truncate">
                          {String(food.itemName || "").trim()}
                        </td>

                        <td className="border border-gray-400 px-2 py-1 text-left">
                          {food.oidRate}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {dropdownOpen && selectedFood && (
            <div className="border-t bg-[#D7F0F0] p-2 flex items-center justify-end gap-2">
              <label className="font-bold whitespace-nowrap">Qty</label>
              <input
                ref={quantityRef}
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                onFocus={() => setFocusField("quantity")}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                    e.preventDefault();
                    dropdownRef.current?.focus();
                    setFocusField("foodDropdown");
                  }
                }}
                className="w-20 h-8 border border-[#0B4F4A] px-2 outline-none"
              />
            </div>
          )}

          <div className="border-t bg-[#0B4F4A] text-white px-3 py-1 text-xs">
            ALT+O Outlet | ALT+T Table | ALT+P Pax | ALT+S Steward | ALT+C Code
            &nbsp; | &nbsp; ↑↓ Navigate &nbsp; | &nbsp; ENTER Open/Select &nbsp;
            | &nbsp; +/- Qty &nbsp; | &nbsp; DELETE Remove
          </div>
        </section>

        <section className="bg-white border border-gray-500 flex flex-col">
          <div className="bg-white border-b px-2 py-2 font-bold">
            Running Order Detail [Ctrl+R]
          </div>

          <div className="p-2 border-b">
            <div className="text-red-600 font-bold mb-1">
              TABLE: {tableNumber || "-"}
            </div>

            <div className="grid grid-cols-2 gap-1 text-xs">
              <div className="border p-1">
                <b>Outlet</b>

                <br />

                {activeOutlet?.oltName || "-"}
              </div>

              <div className="border p-1">
                <b>Status</b>

                <br />

                {tables[tableIndex]?.status || "-"}
              </div>

              <div className="border p-1">
                <b>Pax</b>

                <br />

                {session?.pax || pax}
              </div>

              <div className="border p-1">
                <b>Steward</b>

                <br />

                {session?.waiterName || stewards[stewardIndex]?.stwName || "-"}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            {subTables.map((sub: any, index: number) => (
              <div
                key={`${sub.subTable}-${index}`}
                className={`grid grid-cols-3 border-b px-2 py-2 ${
                  sub.subTable === selectedSubTable
                    ? "bg-gray-300 font-bold"
                    : ""
                }`}
              >
                <span>{sub.subTable}</span>

                <span>{sub.tableStatus}</span>

                <span>{sub.billNo || "-"}</span>
              </div>
            ))}

            {!subTables.length && (
              <div className="p-3 text-gray-400">No running orders loaded.</div>
            )}
          </div>

          <div className="border-t p-2 text-xs">
            <div className="font-bold text-red-600">Transfer Table</div>

            <div className="text-xs text-gray-500 mt-1">
              Keyboard mode: use Alt shortcuts, arrows and Enter. Mouse/touch is
              optional.
            </div>

            <div className="mt-2 grid grid-cols-2 gap-1">
              <div className="border p-2">Outlet</div>

              <div className="border p-2">Table</div>
            </div>
          </div>

          {billData && (
            <div className="border-t bg-yellow-100 p-2 text-xs">
              Bill Total: ₹{Number(billData?.tax?.grandTotal || 0).toFixed(2)}
            </div>
          )}
        </section>
      </div>

      {(loading || loadingData || processing) && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <div className="bg-white px-6 py-4 rounded shadow font-bold">
            Processing...
          </div>
        </div>
      )}
    </div>
  );
}
