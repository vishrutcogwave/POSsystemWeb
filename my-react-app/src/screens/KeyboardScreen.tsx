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
  getNCKOT,
  validateDay,
  getUnbillDetails,
  getPaymentModeMaster,
  settleBill,
} from "../api/services/products.service";

import { printKOT, printBill } from "../api/services/printer";
import PaymentModal from "../components/PaymentModal";

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

// Ordered item (grouped by item code) while voiding.
type VoidItem = {
  id: number;
  name: string;
  price: number;
  qty: number; // remaining qty after void
  origQty: number; // qty originally ordered
  category: number;
  grpCode: number;
  itemDiscountAllowed: boolean;
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

// Mobile / tablet (< lg) shows one panel at a time, switched by tabs.
type MobileTab = "setup" | "order" | "running";

// Outlet tables -> screen tables (skips rows without a table number, e.g. room service).
const formatTables = (outlet: Outlet): Table[] =>
  (outlet.tables || [])
    .filter((t) => t.tblNo)
    .map((t) => ({
      tableNumber: t.tblNo,
      status: t.tableStatus || "",
      kotStatus: t.kotStatus,
      peopleCount: 0,
      BillNo: t.billNo,
    }));

const paxOptions = Array.from({ length: 10 }, (_, i) => i + 1);

// Shared responsive column widths so header table and body table line up.
// Code column is hidden below `sm`; qty column is wider on touch to fit +/- buttons.
const CartCols = () => (
  <colgroup>
    <col className="hidden sm:table-column sm:w-[70px]" />
    <col />
    <col className="w-[112px] lg:w-[70px]" />
    <col className="w-[60px] sm:w-[100px]" />
    <col className="w-[76px] sm:w-[110px]" />
  </colgroup>
);

export default function KeyboardScreen() {


  const { items, masterItems, loading } = useItems();
  const { activeOltName, setActiveOLT } = useActiveOLT();
  const { appData, userRights } = useAppContext();

  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [activeOutlet, setActiveOutlet] = useState<Outlet | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [tableIndex, setTableIndex] = useState(-1);
  const [stewards, setStewards] = useState<Steward[]>([]);
  const [stewardIndex, setStewardIndex] = useState(-1);
  const [pax, setPax] = useState<number | "">("");
  const [_paxIndex, setPaxIndex] = useState(-1);
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
  const [tableChoiceOpen, setTableChoiceOpen] = useState(false);
  const tableChoiceDialogRef = useRef<HTMLDivElement>(null);
  const [pendingTable, setPendingTable] = useState("");
  const [pendingOutlet, setPendingOutlet] = useState<Outlet | null>(null);
  const [openSettlementPayment, setOpenSettlementPayment] = useState(false);
  const [unbillData, setUnbillData] = useState<any>(null);
  const [paymentModes, setPaymentModes] = useState<any[]>([]);
  const [settlementLoading, setSettlementLoading] = useState(false);
  const [settlementListOpen, setSettlementListOpen] = useState(false);
  const [unsettledTables, setUnsettledTables] = useState<any[]>([]);
  const [settlementOpenedFromList, setSettlementOpenedFromList] = useState(false);
  const settlementListRef = useRef<HTMLDivElement>(null);

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

  // NC flow: NC -> pick NC department + reason -> NC KOT API call.
  const [ncReasons, setNcReasons] = useState<any[]>([]);
  const [ncModalOpen, setNcModalOpen] = useState(false);
  const [ncCode, setNcCode] = useState<number | "">("");
  const [ncRemarks, setNcRemarks] = useState("");
  const ncRemarksRef = useRef<HTMLInputElement>(null);

  // Void flow: F12 -> reason -> pick items (- / Delete) -> Enter to confirm.
  const [voidMode, setVoidMode] = useState(false);
  const [voidReasonOpen, setVoidReasonOpen] = useState(false);
  const [voidReason, setVoidReason] = useState("");
  const [voidItems, setVoidItems] = useState<VoidItem[]>([]);
  const [voidIndex, setVoidIndex] = useState(0);

  const [billGenerationSettings, setBillGenerationSettings] = useState({
    billingType: "",
    subBillingType: "",
  });

  const [taxSettings, setTaxSettings] = useState<any>(null);
  const [openDayDetails, setOpenDayDetails] = useState<any>(null);

  // Responsive: active panel on small screens.
  const [mobileTab, setMobileTab] = useState<MobileTab>("order");

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

      // Nothing is pre-selected: the user picks Outlet -> Table -> Pax -> Steward.
    } catch (error) {
      console.error(error);
      toast.error("Failed to load outlets");
    } finally {
      setLoadingData(false);
    }
  };

  // Re-fetch outlets + table statuses (after KOT / NC / Void / Bill, or Ctrl+R).
  // Keeps the current outlet and table selection; only the data is refreshed.
  const refreshOutlets = async () => {
    try {
      const data: Outlet[] = await getCombinedOutletAndTableMasterList(
        appData?.user?.branch_code || "",
        appData?.user?.userCode,
      );

      setOutlets(data || []);

      const current = (data || []).find(
        (o) => String(o.oltCode) === String(activeOutlet?.oltCode),
      );

      if (current) {
        const fresh = formatTables(current);
        setActiveOutlet(current);
        setTables(fresh);
        setTableIndex(fresh.findIndex((t) => t.tableNumber === tableNumber));
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to refresh tables");
    }
  };

  // ============================================================
  // CONTROLLER 02: OUTLET / TABLE FLOW
  // ============================================================

  const selectOutlet = (outlet: Outlet) => {
    setActiveOutlet(outlet);

    setActiveOLT(String(outlet.oltCode), outlet.oltName.trim());

    localStorage.setItem("activeOltCode", String(outlet.oltCode));

    const formatted = formatTables(outlet);

    setTables(formatted);
    setTableIndex(-1);
    setTableNumber("");
    setSubTables([]);
    setOldCartData([]);
    setSession(null);
  };

  // ============================================================
  // CONTROLLER 03: STEWARD / SETTINGS FLOW
  // ============================================================

  const loadStewards = async () => {
    try {
      const data = await getStewardList(branch);
      setStewards(data || []);
      setStewardIndex(-1);
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

    // NC departments (same list as OrderingBoard).
    void getNCKOT(appData?.user?.branch_code)
      .then((d: any) => setNcReasons(d || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!outlets.length) return;
    focusOutlet();
  }, [outlets.length]);

  /* ---------------- FOOD LOOKUP ---------------- */

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

  /* ---------------- CART ---------------- */

  // ============================================================
  // CONTROLLER 04: CART FLOW
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
  // ============================================================

  const loadExistingTable = async (
    table: string,
    subOverride?: string,
    outletOverride?: Outlet,
  ) => {
    const outlet = outletOverride || activeOutlet;

    if (!table || !outlet) return;

    try {
      setProcessing(true);

      const data = await getSubTables(
        String(outlet.oltCode),
        table,
        appData?.user?.branch_code,
      );

      setSubTables(data || []);

      const occupied = (data || []).find(
        (x: any) => x.tableStatus !== "Available",
      );

      const sub = subOverride || occupied?.subTable || "A";

      setSelectedSubTable(sub);

      const old = await getOldCart(
        table,
        String(outlet.oltCode),
        sub,
        appData?.user?.branch_code,
      );

      setOldCartData(old || []);
      setIsNC(
        (outlet.tables || []).find((t) => t.tblNo === table)?.kotStatus ===
          "NCKOT",
      );

      if (old?.length) {
        const first = old[0];

        setSession({
          pax: Number(first.pax || 1),
          waiterCode: String(first.waiter || ""),
          waiterName: first.waiterName || "",
        });

        // Bind Pax + Steward selects to the running order.
        const paxVal = Number(first.pax || 1);
        setPax(paxVal);
        setPaxIndex(paxOptions.indexOf(paxVal));
        setStewardIndex(
          stewards.findIndex((s) => String(s.stwCode) === String(first.waiter)),
        );

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

    if (!pax) {
      toast.error("Select pax");
      return;
    }

    const steward = stewards[stewardIndex];

    if (!steward) {
      toast.error("Select steward");
      return;
    }

    setSession({
      pax: Number(pax),
      waiterCode: String(steward.stwCode),
      waiterName: steward.stwName,
    });

    setCart([]);
    setOldCartData([]);

    // Preserve the subtable selected for this new order (A, B, C, etc.).

    toast.success(`New session started for table ${tableNumber}`);

    setFocusField("code");
    setTimeout(() => codeRef.current?.focus(), 0);
  };

  // Touch-friendly wrapper: start the session, then jump to the Order tab.
  const startSessionAndShowOrder = () => {
    startSession();
    if (tableNumber && stewards.length) setMobileTab("order");
  };

  /* ---------------- BILL PAYLOAD ---------------- */

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

  // Shared by both KOT and BILL controllers.
  const buildBillPayload = (nc?: { code: number; remarks: string }) => {
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
      type: nc || isNC ? "N" : "K",
      ncCode: nc?.code || 0,
      ncRemarks: nc?.remarks || "",
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

  /* ---------------- KOT ---------------- */

  // ============================================================
  // CONTROLLER 07: KOT FLOW
  // ============================================================

  const handleKOT = async (nc?: { code: number; remarks: string }) => {
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

      const payload = buildBillPayload(nc);

      if (!payload) return;

      const res = await createOrder(payload);

      const printers = res?.printers || [];
      const foodItems = res?.food || [];

      const generateContent = (printItems: any[]) => ({
        title: nc ? "NC KOT" : "KOT",

        ncDepName:
          ncReasons.find((x: any) => x.ncDepCode === nc?.code)?.ncDepName ||
          res?.ncDepName ||
          "",
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

      toast.success(
        nc
          ? "NC KOT created & printed successfully"
          : "KOT created & printed successfully",
      );

      setCart([]);
      setOldCartData([]);
      setNcCode("");
      setNcRemarks("");

      await refreshOutlets();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create KOT");
    } finally {
      setProcessing(false);
      setFocusField("code");
      setTimeout(() => codeRef.current?.focus(), 0);
    }
  };

  /* ---------------- BILL ---------------- */

  // ============================================================
  // CONTROLLER 08: BILL FLOW
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

      await refreshOutlets();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Bill failed");
    } finally {
      setProcessing(false);
      setFocusField("code");
      setTimeout(() => codeRef.current?.focus(), 0);
    }
  };

  /* ---------------- KEYBOARD ---------------- */

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

  // Switching to a free table: drop any running-order data of the previous one.
  const clearTableOrder = () => {
    setIsNC(false);
    setCart([]);
    setOldCartData([]);
    setSubTables([]);
    setSession(null);
    setSelectedSubTable("A");
    setPax("");
    setPaxIndex(-1);
    setStewardIndex(-1);
  };

  const resetNewOrder = () => {
    setCart([]);
    setOldCartData([]);
    setSubTables([]);
    setSession(null);
    setSelectedSubTable("A");
    setCode("");
    setSearch("");
    setIsNC(false);
    setActiveOutlet(null);
    setTables([]);
    setTableIndex(-1);
    setTableNumber("");
    setPax("");
    setPaxIndex(-1);
    setStewardIndex(-1);
    setSelectedFood(null);
    resetVoid();
    setNcModalOpen(false);
    setNcCode("");
    setNcRemarks("");
    setMobileTab("setup");
    focusOutlet();
  };

  /* ---------------- NC ---------------- */

  // Step 1: NC pressed -> ask NC department + reason (no API call yet).
  const openNcModal = () => {
    if (!session || !cart.length) {
      toast.error("Select session and add items");
      return;
    }

    if (!ncReasons.length) {
      toast.error("No NC departments available");
      return;
    }

    setNcCode("");
    setNcRemarks("");
    setNcModalOpen(true);
  };

  // Step 2: both entered -> create the NC KOT (same flow as KOT).
  const confirmNc = () => {
    if (!ncCode) {
      toast.error("Please select NC department");
      return;
    }

    if (!ncRemarks.trim()) {
      toast.error("Please enter reason / remarks");
      return;
    }

    setNcModalOpen(false);
    void handleKOT({ code: Number(ncCode), remarks: ncRemarks.trim() });
  };

  const cancelNc = () => {
    setNcModalOpen(false);
    setNcCode("");
    setNcRemarks("");
    focusCode();
  };

  /* ---------------- VOID ---------------- */

  const resetVoid = () => {
    setVoidMode(false);
    setVoidReasonOpen(false);
    setVoidReason("");
    setVoidItems([]);
    setVoidIndex(0);
  };

  const cancelVoid = () => {
    resetVoid();
    focusCode();
  };

  // Step 1: ask for the reason.
  const startVoid = () => {
    if (!session || !oldCartData.length) {
      toast.error("No ordered items to void");
      return;
    }
    setVoidReason("");
    setVoidReasonOpen(true);
  };

  // Step 2: reason entered -> list ordered items (grouped by item code).
  const confirmVoidReason = () => {
    if (!voidReason.trim()) {
      toast.error("Enter void reason");
      return;
    }

    const grouped = new Map<number, VoidItem>();

    oldCartData.forEach((order: any) =>
      (order.food || []).forEach((f: any) => {
        const id = Number(f.itemCode || f.id);
        const qty = Number(f.qty || 0);
        const existing = grouped.get(id);

        if (existing) {
          existing.qty += qty;
          existing.origQty += qty;
        } else {
          const meta = categoryMap.get(id);
          grouped.set(id, {
            id,
            name: String(f.food || "").trim(),
            price: Number(f.price || 0),
            qty,
            origQty: qty,
            category: meta?.catCode || 0,
            grpCode: meta?.grpCode || 0,
            itemDiscountAllowed: f.itemDiscountAllowed ?? true,
          });
        }
      }),
    );

    setVoidItems(Array.from(grouped.values()));
    setVoidIndex(0);
    setVoidReasonOpen(false);
    setVoidMode(true);
    setMobileTab("order");
    setDropdownOpen(false);
    setFocusField("cart");
    codeRef.current?.blur();
  };

  const voidOne = (index: number) =>
    setVoidItems((prev) =>
      prev.map((it, i) =>
        i === index ? { ...it, qty: Math.max(0, it.qty - 1) } : it,
      ),
    );

  const voidAll = (index: number) =>
    setVoidItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, qty: 0 } : it)),
    );

  const undoVoidOne = (index: number) =>
    setVoidItems((prev) =>
      prev.map((it, i) =>
        i === index ? { ...it, qty: Math.min(it.origQty, it.qty + 1) } : it,
      ),
    );

  // Step 3: same API + print flow as OrderingBoard.handleVoid.
  const submitVoid = async () => {
    if (!session) return;

    const changed = voidItems.filter((i) => i.qty < i.origQty);

    if (!changed.length) {
      toast.error("Select item(s) to void: use - or Delete");
      return;
    }

    try {
      setProcessing(true);

      const payload = {
        userCode: appData?.user?.userCode || 0,
        table: tableNumber,
        subTable: selectedSubTable || "A",
        outlet: String(activeOutlet?.oltCode || ""),
        outletName: activeOltName,
        waiter: session.waiterCode,
        waiterName: session.waiterName,
        pax: session.pax,

        // Same as OrderingBoard: every ordered item that still has qty left
        // (untouched ones included). Fully voided items are left out.
        food: voidItems
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

        total: voidItems.reduce(
          (sum, i) => sum + i.price * (i.origQty - i.qty),
          0,
        ),
        totQty: voidItems.reduce((sum, i) => sum + (i.origQty - i.qty), 0),

        branch,
        type: isNC ? "N" : "K",
        ncCode: 0,
        ncRemarks: "",

        discount: 0,
        discountType: "",
        discountRemarks: "",
        vRemarks: "1",
        voidReason: voidReason.trim(), // extra field: reason typed by the user
        discountGroups: [""],
        mode: "VOID",
        subBillType: billGenerationSettings.subBillingType,
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

      const res = await createOrder(payload);

      /* ---------------- PRINT (same as OrderingBoard) ---------------- */

      const printers = res?.printers || [];
      const foodItems = res?.food || [];

      const printerItemMap: Record<string, any[]> = {};

      printers.forEach((printer: any) => {
        const categoryIds = printer.categoryIds ?? [];

        const matchedItems = foodItems.filter((item: any) =>
          categoryIds.includes(Number(item.category)),
        );

        if (matchedItems.length > 0) {
          printerItemMap[printer.printerName || "default"] = matchedItems;
        }
      });

      const generateContent = (printItems: any[]) => ({
        title: isNC ? "CANCEL NC KOT" : "CANCEL KOT",
        kotId: res?.kotId || res?.kotID || res?.kotNo || "",
        table: tableNumber,
        subTable: selectedSubTable || "A",
        waiter: session.waiterName,
        pax: session.pax,
        items: printItems.map((item: any) => ({
          qty: item.origQty || item.qty || 0,
          name: item.food,
          instructions: item.comment ? item.comment.split(",") : [],
        })),
      });

      const thermalKeywords = [
        "pos",
        "thermal",
        "epson tm",
        "tm-",
        "xp-",
        "tsp",
        "58mm",
        "80mm",
        "receipt",
        "usb printer",
        "rp",
        "gp",
      ];

      // No category mapping -> print everything to first configured printer
      if (Object.keys(printerItemMap).length === 0) {
        const defaultPrinter = printers[0];

        const result = await printKOT(
          defaultPrinter?.printerName || null,
          generateContent(foodItems),
          defaultPrinter?.ipAddress || "",
          true,
        );

        if (!result?.success) {
          toast.error(
            `${defaultPrinter?.printerName ?? "Default Printer"}: ${
              result?.message || "Print failed"
            }`,
          );
        }
      } else {
        for (const printer of printers) {
          const key = printer.printerName?.trim() || "default";

          const printerItems = printerItemMap[key];

          if (!printerItems) continue;

          const printerName = printer.printerName?.trim() || null;

          const isThermal = thermalKeywords.some((keyword) =>
            (printerName || "").toLowerCase().includes(keyword),
          );

          const result = await printKOT(
            printerName,
            generateContent(printerItems),
            printer.ipAddress || "",
            isThermal,
          );

          if (!result?.success) {
            toast.error(
              `${printerName ?? "Default Printer"}: ${
                result?.message || "Print failed"
              }`,
            );
          }
        }
      }

      toast.success("Items voided & printed successfully");

      resetVoid();

      // Refresh table statuses, then the running order so voided items disappear.
      await refreshOutlets();
      await loadExistingTable(tableNumber, selectedSubTable || undefined);
    } catch (error) {
      console.error("Void failed:", error);
      toast.error("Void failed");
    } finally {
      setProcessing(false);
    }
  };

  // Item chosen (Enter key or tap): move to quantity entry.
  const chooseFood = (food: any) => {
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
  };

  const confirmQuantity = () => {
    if (!selectedFood) return;

    const qtyValue = Number(quantity);
    if (!Number.isFinite(qtyValue) || qtyValue <= 0) {
      toast.error("Enter a valid quantity");
      quantityRef.current?.focus();
      return;
    }
    addFood(selectedFood, selectedUnit, qtyValue);
  };

  const closeDropdown = () => {
    setDropdownOpen(false);
    setSelectedFood(null);
    focusCode();
  };

  // Keep keyboard focus inside the Table Bills & Settlement dialog while it is open.
  useEffect(() => {
    if (!tableChoiceOpen) return;

    const focusFirstAction = () => {
      const dialog = tableChoiceDialogRef.current;
      if (!dialog) return;
      const firstAction = dialog.querySelector<HTMLButtonElement>(
        'button:not(:disabled):not([aria-label="Close table bills"])',
      );
      (firstAction || dialog).focus();
    };

    // Wait until the dialog has been painted before focusing its first action.
    requestAnimationFrame(focusFirstAction);
  }, [tableChoiceOpen, subTables.length]);

  const isSettlementAccessDisabled =
    userRights
      ?.flatMap((menu: any) => menu.subMenus || [])
      ?.find((subMenu: any) => subMenu.subMenuName === "IsSettlementAccess")
      ?.isPermission === false;

  // Occupied / unsettled tables open one Table Bills window, like OrderingBoard.
  const handleTableSelection = async (
    table: Table,
    outlet: Outlet | null = activeOutlet,
  ) => {
    if (!outlet) {
      toast.error("Select outlet first");
      return;
    }

    setTableNumber(table.tableNumber);
    setTableIndex(
      formatTables(outlet).findIndex((t) => t.tableNumber === table.tableNumber),
    );

    if (table.status === "Occupied" || table.status === "Unsettled") {
      setPendingTable(table.tableNumber);
      setPendingOutlet(outlet);
      try {
        setProcessing(true);
        const data = await getSubTables(
          String(outlet.oltCode),
          table.tableNumber,
          appData?.user?.branch_code,
        );
        setSubTables(data || []);
      } catch (error) {
        console.error("Failed to load table bills:", error);
        toast.error("Failed to load table bills");
        return;
      } finally {
        setProcessing(false);
      }
      setTableChoiceOpen(true);
      return;
    }

    setPendingTable("");
    setPendingOutlet(null);
    clearTableOrder();
    setSelectedSubTable("A");
    focusPax();
  };



  const getNextSubTable = (list: any[]) => {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const used = (list || [])
      .filter((item: any) => String(item.tableStatus || "").toLowerCase() !== "available")
      .map((item: any) => String(item.subTable || "").trim().toUpperCase())
      .filter((value: string) => /^[A-Z]$/.test(value))
      .sort((a: string, b: string) => a.localeCompare(b));

    if (!used.length) return "A";
    const last = used[used.length - 1];
    const index = alphabet.indexOf(last);
    return index < 0 || index === alphabet.length - 1 ? last : alphabet[index + 1];
  };

  const startNewSubTableOrder = async () => {
    if (!pendingTable || !pendingOutlet) return;

    try {
      setProcessing(true);
      const loadedSubTables = subTables.length
        ? subTables
        : (await getSubTables(
            String(pendingOutlet.oltCode),
            pendingTable,
            appData?.user?.branch_code,
          )) || [];
      setSubTables(loadedSubTables);

      // Match OrderingBoard's New Bill behavior: ignore Available rows and use
      // the next subtable letter after the occupied / unsettled subtables.
      const nextSubTable = getNextSubTable(loadedSubTables);

      setActiveOutlet(pendingOutlet);
      setActiveOLT(String(pendingOutlet.oltCode), pendingOutlet.oltName.trim());
      localStorage.setItem("activeOltCode", String(pendingOutlet.oltCode));
      setTables(formatTables(pendingOutlet));
      setTableNumber(pendingTable);
      setTableIndex(
        formatTables(pendingOutlet).findIndex((t) => t.tableNumber === pendingTable),
      );
      setSelectedSubTable(nextSubTable);
      setOldCartData([]);
      setCart([]);
      setSession(null);
      setIsNC(false);
      setPax("");
      setPaxIndex(-1);
      setStewardIndex(-1);
      setPendingTable("");
      setPendingOutlet(null);
      setTableChoiceOpen(false);
      setMobileTab("setup");
      setFocusField("pax");
      setDropdownOpen(true);
      setTimeout(() => paxRef.current?.focus(), 0);
      toast.success(`New order selected: Table ${pendingTable}-${nextSubTable}`);
    } catch (error) {
      console.error("Failed to load subtables:", error);
      toast.error("Failed to load subtables");
    } finally {
      setProcessing(false);
    }
  };

  const handleUnsettledSubTable = async (item: any) => {
    if (isSettlementAccessDisabled) {
      toast.error("You do not have permission to settle bills");
      return;
    }
    if (!pendingTable || !pendingOutlet) return;

    try {
      setProcessing(true);
      const branch = localStorage.getItem("branch") || appData?.user?.branch_code || "";
      const outletCode = String(pendingOutlet.oltCode);
      localStorage.setItem("activeOltCode", outletCode);
      const data = await getUnbillDetails(
        item.billNo,
        pendingTable,
        outletCode,
        branch,
      );
      setUnbillData(data);
      setSettlementOpenedFromList(false);

      const modes = await getPaymentModeMaster(branch);
      setPaymentModes(modes || []);
      setTableChoiceOpen(false);
      setOpenSettlementPayment(true);
    } catch (error) {
      console.error("Failed to load unsettled bill:", error);
      toast.error("Failed to load settlement details");
    } finally {
      setProcessing(false);
    }
  };

  // Ctrl+D / Settlement button: call GetSubTables for every table in every outlet,
  // then list each subtable whose API status is Unsettled.
  const openSettlementList = async () => {
    if (isSettlementAccessDisabled) {
      toast.error("You do not have permission to settle bills");
      return;
    }

    try {
      setProcessing(true);
      const branchCode = appData?.user?.branch_code || localStorage.getItem("branch") || "";
      const tableRequests = outlets.flatMap((outlet) =>
        (outlet.tables || [])
          .filter((table) => Boolean(table.tblNo))
          .map(async (table) => {
            const subTables = await getSubTables(
              String(outlet.oltCode),
              table.tblNo,
              branchCode,
            );
            return (Array.isArray(subTables) ? subTables : [])
              .filter((sub: any) => String(sub.tableStatus || "").toLowerCase() === "unsettled")
              .map((sub: any) => ({
                outlet,
                tableNumber: String(sub.kotTblNo || table.tblNo),
                subTable: String(sub.subTable || ""),
                status: String(sub.tableStatus || ""),
                BillNo: Number(sub.billNo || 0),
                billAmount: Number(sub.billAmount || 0),
                kotTime: sub.kotTime || "",
              }));
          }),
      );
      const results = await Promise.all(tableRequests);
      const rows = results.flat();
      setUnsettledTables(rows);
      setSettlementListOpen(true);
      requestAnimationFrame(() => {
        settlementListRef.current
          ?.querySelector<HTMLButtonElement>("button:not(:disabled)")
          ?.focus();
      });
    } catch (error) {
      console.error("Failed to load unsettled subtables:", error);
      toast.error("Failed to load unsettled tables. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const openUnsettledTableFromList = async (row: any) => {
    const outlet: Outlet = row.outlet;
    const table: Table = row;
    if (!outlet || !table.BillNo) {
      toast.error("Bill number not found for this table");
      return;
    }

    try {
      setProcessing(true);
      setPendingTable(table.tableNumber);
      setPendingOutlet(outlet);
      setTableNumber(table.tableNumber);
      setActiveOutlet(outlet);
      setActiveOLT(String(outlet.oltCode), outlet.oltName.trim());
      localStorage.setItem("activeOltCode", String(outlet.oltCode));

      const branchCode = localStorage.getItem("branch") || appData?.user?.branch_code || "";
      const details = await getUnbillDetails(
        table.BillNo,
        table.tableNumber,
        String(outlet.oltCode),
        branchCode,
      );
      if (!details || !Array.isArray(details) || !details.length) {
        toast.error("No unsettled bill details found");
        return;
      }
      setUnbillData(details);
      setSettlementOpenedFromList(true);
      const modes = await getPaymentModeMaster(branchCode);
      setPaymentModes(modes || []);
      setSettlementListOpen(false);
      setTableChoiceOpen(false);
      setOpenSettlementPayment(true);
    } catch (error) {
      console.error("Failed to open settlement:", error);
      toast.error("Failed to load settlement details");
    } finally {
      setProcessing(false);
    }
  };

  const handleBillSettlement = async (data: any) => {
    const { paymentDetails, difference, payableAmount, isTransferToRoom, selectedTransferRoom } = data;
    if (difference !== 0) {
      toast.error(`Amount must match ₹${payableAmount}`);
      return;
    }
    for (const payment of paymentDetails || []) {
      const mode = paymentModes.find((m: any) => m.modeType === payment.mode);
      if (mode && mode.subModes?.length > 0 && !payment.subMode) {
        toast.error(`Select sub mode for ${payment.mode}`);
        return;
      }
      if (!payment.amount || payment.amount <= 0) {
        toast.error(`Enter valid amount for ${payment.mode}`);
        return;
      }
    }

    const bill = unbillData?.[0] || {};
    const payload = {
      oltCode: Number(bill?.oltCode || pendingOutlet?.oltCode || 0),
      userCode: Number(bill?.userCode || appData?.user?.userCode || 0),
      billId: Number(bill?.ksmId || 0),
      billNo: Number(bill?.ksmBillNo || 0),
      tableNo: isTransferToRoom ? selectedTransferRoom?.roomNo : bill?.ksmTblNo || pendingTable || "",
      subTableNo: bill?.ksmsubtblno || "",
      subBillType: "",
      plan: "",
      guestCode: selectedTransferRoom?.guestCode || "",
      guestName: selectedTransferRoom?.guestName || "",
      checkInNo: selectedTransferRoom?.checkinNo || "",
      discount: Number(bill?.ksmBillDiscount || 0),
      taxAmount: Number(bill?.ksmBillTaxAmt || 0),
      tips: Number(bill?.tips || 0),
      changeAmount: 0,
      grandAmount: payableAmount,
      billDate: new Date().toISOString(),
      branchCode: bill?.branch_Code || localStorage.getItem("branch") || appData?.user?.branch_code || "",
      paymentDetails: (paymentDetails || []).map((payment: any) => ({
        mode: payment.mode,
        subMode:
          payment.mode?.toLowerCase() === "cash" ? "Cash" :
          payment.mode?.toLowerCase() === "pluxee" ? "Pluxee" :
          payment.mode?.toLowerCase() === "neft" ? "neft" : (payment.subMode || "").trim(),
        amount: Number(payment.amount),
        remarks: (payment.remarks || "").trim(),
      })),
    };

    try {
      setSettlementLoading(true);
      await settleBill(payload);
      toast.success("Bill settled successfully");
      setOpenSettlementPayment(false);
      setUnbillData(null);
      await refreshOutlets();
      if (settlementOpenedFromList) {
        setSettlementListOpen(true);
        setSettlementOpenedFromList(false);
        return;
      }
      const refreshed = await getSubTables(
        String(pendingOutlet?.oltCode || activeOutlet?.oltCode || ""),
        pendingTable || tableNumber,
        appData?.user?.branch_code,
      );
      setSubTables(refreshed || []);
      setTableChoiceOpen(true);
    } catch (error) {
      console.error("Settlement failed:", error);
      toast.error("Settlement failed");
    } finally {
      setSettlementLoading(false);
    }
  };

  // ============================================================
  // CONTROLLER 09: KEYBOARD FLOW
  // ============================================================

  const handleGlobalKeyDown = (e: KeyboardEvent) => {
    if (processing || openSettlementPayment) return;

    if (settlementListOpen) {
      if (e.key === "Escape") {
        e.preventDefault();
        setSettlementListOpen(false);
      }
      return;
    }

    // Table choice dialog: Escape closes without changing the current order.
    if (tableChoiceOpen) {
      if (e.key === "Escape") {
        e.preventDefault();
        setTableChoiceOpen(false);
        setPendingTable("");
        setPendingOutlet(null);
      }
      return;
    }

    // NC dialog open: Esc cancels; Enter/arrows are handled by the fields.
    if (ncModalOpen) {
      if (e.key === "Escape") {
        e.preventDefault();
        cancelNc();
      }
      return;
    }

    // Void reason dialog open: only Escape is handled here (Enter is on the input).
    if (voidReasonOpen) {
      if (e.key === "Escape") {
        e.preventDefault();
        setVoidReasonOpen(false);
        focusCode();
      }
      return;
    }

    // Void mode: pick ordered items. F11 (new order) still works.
    if (voidMode && e.key !== "F11") {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setVoidIndex((i) => Math.min(i + 1, voidItems.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setVoidIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "-") {
        e.preventDefault();
        voidOne(voidIndex);
      } else if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        undoVoidOne(voidIndex);
      } else if (e.key === "Delete") {
        e.preventDefault();
        voidAll(voidIndex);
      } else if (e.key === "Enter") {
        e.preventDefault();
        void submitVoid();
      } else if (e.key === "Escape") {
        e.preventDefault();
        cancelVoid();
      }
      return;
    }

    // F11 = New Order
    if (e.key === "F11") {
      e.preventDefault();
      resetNewOrder();
      return;
    }

    // F12 = Normal Void screen
    if (e.key === "F12") {
      e.preventDefault();
      if (!voidMode) startVoid();
      return;
    }

    // F9 = NC Void
    if (e.key === "F9") {
      e.preventDefault();
      openNcModal();
      return;
    }

    // Ctrl + R = refresh
    if (e.ctrlKey && e.key.toLowerCase() === "r") {
      e.preventDefault();
      void refreshOutlets();
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

    // Ctrl + D = open all unsettled tables for settlement.
    if (e.ctrlKey && e.key.toLowerCase() === "d") {
      e.preventDefault();
      openSettlementList();
      return;
    }

    // Alt + first character opens a field/list.
    if (e.altKey) {
      const key = e.key.toLowerCase();

      if (key === "o") {
        e.preventDefault();
        setMobileTab("setup");
        focusOutlet();
        return;
      }

      if (key === "t") {
        e.preventDefault();
        setMobileTab("setup");
        focusTable();
        return;
      }

      if (key === "p") {
        e.preventDefault();
        setMobileTab("setup");
        focusPax();
        return;
      }

      if (key === "s") {
        e.preventDefault();
        setMobileTab("setup");
        focusSteward();
        return;
      }

      if (key === "c") {
        e.preventDefault();
        setMobileTab("order");
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
        if (!activeOutlet) {
          toast.error("Select outlet");
          return;
        }
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

        const selected = tables[tableIndex];

        if (!selected) {
          toast.error("Select table");
          return;
        }

        setDropdownOpen(false);
        handleTableSelection(selected);
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
        if (!pax) {
          toast.error("Select pax");
          return;
        }
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
        if (stewardIndex < 0) {
          toast.error("Select steward");
          return;
        }
        setDropdownOpen(false);
        startSessionAndShowOrder();
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

        // Keep the item dropdown open so ArrowUp/ArrowDown can still be used
        // to choose another item. Move keyboard focus to Qty.
        chooseFood(food);
        return;
      }
      return;
    }

    // Quantity keyboard control.
    if (focusField === "quantity" && dropdownOpen && selectedFood) {
      if (e.key === "Enter") {
        e.preventDefault();
        confirmQuantity();
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

  /* Barcode scanner / item code input (Enter key or Search button) */

  const runCodeSearch = () => {
    const value = code.trim();

    if (!value) return;

    const searchValue = value.toLowerCase();

    const results = allFoods
      .filter((f: any) => {
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

    // Show dropdown only after ENTER / Search tap.
    setSearch(value);
    setSelectedFoodIndex(0);
    setSelectedFood(null);
    setDropdownOpen(true);
    setFocusField("foodDropdown");

    setTimeout(() => {
      dropdownRef.current?.focus();
    }, 0);
  };

  const handleCodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    runCodeSearch();
  };

  // Occupied / Unsettled tables of ALL outlets.
  const occupiedTables = outlets.flatMap((o) =>
    formatTables(o)
      .filter((t) => t.status === "Occupied" || t.status === "Unsettled")
      .map((t) => ({ ...t, outlet: o })),
  );


  const showFoodList =
    dropdownOpen && (focusField === "foodDropdown" || focusField === "quantity");

  // Items already ordered on this table (from GetOldCart), flattened across KOTs.
  const oldRows = oldCartData.flatMap((order: any) =>
    (order.food || []).map((f: any) => ({ ...f, kotId: order.kotId })),
  );

  const total =
    cart.reduce((sum, item) => sum + item.price * item.qty, 0) +
    oldRows.reduce(
      (sum: number, f: any) => sum + Number(f.price || 0) * Number(f.qty || 0),
      0,
    );
  const totalQty =
    cart.reduce((s, i) => s + i.qty, 0) +
    oldRows.reduce((s: number, f: any) => s + Number(f.qty || 0), 0);

  const paxList =
    pax && !paxOptions.includes(Number(pax))
      ? [...paxOptions, Number(pax)]
      : paxOptions;

  const tabClass = (tab: MobileTab) =>
    `py-3 text-xs font-bold uppercase tracking-wide border-b-4 ${
      mobileTab === tab
        ? "bg-[#DDEFEF] text-[#0B4F4A] border-yellow-400"
        : "bg-[#0B4F4A] text-white border-transparent"
    }`;

  const panel = (tab: MobileTab) => (mobileTab === tab ? "flex" : "hidden");

  // Shared control sizing: big touch targets on small screens, compact on desktop.
  const fieldClass = "w-full border h-11 lg:h-8 px-2 lg:px-1 text-base lg:text-sm bg-white";

  /* ---------------- UI ---------------- */

  return (
    <div className="h-[100dvh] flex flex-col bg-[#E9E9E9] text-sm font-sans overflow-hidden">

      {/* Title bar */}
      <div className="min-h-10 shrink-0 bg-[#0B4F4A] text-white flex items-center gap-2 px-3 lg:px-4 font-bold">
        <span className="truncate">KITCHEN ORDER TRACKING</span>

        {/* Desktop shortcut hints */}
        <span className="ml-auto text-yellow-300 text-xs hidden xl:inline whitespace-nowrap">
          F11 NEW ORDER &nbsp; | &nbsp; F12 NORMAL VOID &nbsp; | &nbsp; F9 NC
          VOID
        </span>

        {/* Mobile summary */}
        <span className="ml-auto lg:hidden text-yellow-300 text-xs whitespace-nowrap">
          T: {tableNumber || "-"}
          {isNC && <span className="ml-2 bg-orange-500 text-white px-1">NC</span>}
        </span>
      </div>

      {/* Mobile / tablet tabs */}
      <nav className="lg:hidden shrink-0 grid grid-cols-3">
        <button className={tabClass("setup")} onClick={() => setMobileTab("setup")}>
          Setup
        </button>
        <button className={tabClass("order")} onClick={() => setMobileTab("order")}>
          Order{cart.length || oldRows.length ? ` (${totalQty})` : ""}
        </button>
        <button
          className={tabClass("running")}
          onClick={() => setMobileTab("running")}
        >
          Details
        </button>
      </nav>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[260px_1fr_260px] gap-1 p-1">
        {/* ============ SETUP PANEL ============ */}
        <section
          className={`${panel(
            "setup",
          )} lg:flex bg-[#DDEFEF] border border-gray-500 p-2 flex-col gap-2 min-h-0 overflow-y-auto`}
        >
          <div className="text-center font-bold text-[#0B4F4A] text-lg">
            KEYBOARD BILLING
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
            <label className="font-bold col-span-2 lg:col-span-1">
              Outlet
              <select
                ref={outletRef}
                value={activeOutlet?.oltCode || ""}
                onFocus={() => {
                  setFocusField("outlet");
                  setDropdownOpen(true);
                }}
                onChange={(e) => {
                  const outlet = outlets.find(
                    (o) => String(o.oltCode) === e.target.value,
                  );

                  if (outlet) selectOutlet(outlet);
                }}
                className={fieldClass}
              >
                <option value="" disabled>
                  Select outlet
                </option>
                {outlets.map((o) => (
                  <option key={o.oltCode} value={o.oltCode}>
                    {o.oltName.trim()}
                  </option>
                ))}
              </select>
            </label>

            <label className="font-bold col-span-2 lg:col-span-1">
              Table
              <select
                ref={tableRef}
                value={tableNumber}
                onFocus={() => {
                  setFocusField("table");
                  setDropdownOpen(true);
                }}
                onChange={(e) => {
                  const picked = tables.find(
                    (t) => t.tableNumber === e.target.value,
                  );
                  if (picked) handleTableSelection(picked);
                }}
                className={fieldClass}
              >
                <option value="" disabled>
                  {activeOutlet ? "Select table" : "Select outlet first"}
                </option>
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
                onFocus={() => {
                  setFocusField("pax");
                  setDropdownOpen(true);
                }}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setPax(v);
                  setPaxIndex(paxOptions.indexOf(v));
                }}
                className={fieldClass}
              >
                <option value="" disabled>
                  Select pax
                </option>
                {paxList.map((p) => (
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
                value={
                  stewardIndex >= 0
                    ? stewards[stewardIndex]?.stwCode ?? ""
                    : session?.waiterCode ?? ""
                }
                onFocus={() => {
                  setFocusField("steward");
                  setDropdownOpen(true);
                }}
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
                className={fieldClass}
              >
                <option value="" disabled>
                  Select steward
                </option>
                {session?.waiterCode && stewardIndex < 0 && (
                  <option value={session.waiterCode}>{session.waiterName}</option>
                )}
                {stewards.map((s) => (
                  <option key={s.stwCode} value={s.stwCode}>
                    {s.stwName}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button
            onClick={startSessionAndShowOrder}
            className="bg-[#0B4F4A] text-white font-bold py-3 lg:py-2 border border-black"
          >
            <span className="hidden lg:inline">ENTER - </span>START SESSION
          </button>

          {/* Desktop action buttons (mobile uses the bottom bar) */}
          <div className="hidden lg:grid grid-cols-2 gap-1 mt-1">
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
              onClick={openNcModal}
              className={`border border-black py-2 font-bold ${
                isNC ? "bg-orange-500 text-white" : "bg-white"
              }`}
            >
              F9 NC
            </button>

            <button
              onClick={startVoid}
              className="col-span-2 bg-red-600 text-white border border-black py-2 font-bold"
            >
              F12 VOID
            </button>
                 

                 <button
  onClick={openSettlementList}
  className="col-span-2 bg-blue-600 text-white border border-black py-2 font-bold"
>
  SETTLEMENT (Ctrl+D)
</button>
     
            
          </div>

          <div className="lg:mt-auto border border-black bg-yellow-100">
            <div className="flex justify-between px-2 py-1">
              <b>Total Qty</b>
              <b>{totalQty}</b>
            </div>

            <div className="flex justify-between px-2 py-2 text-lg">
              <b>Grand Total</b>
              <b>₹{(totalAmount || total).toFixed(2)}</b>
            </div>
          </div>
        </section>

        {/* ============ ORDER PANEL ============ */}
        <section
          className={`${panel(
            "order",
          )} lg:flex bg-white border border-gray-500 min-w-0 min-h-0 flex-col`}
        >
          <table className="w-full border-collapse table-fixed shrink-0">
            <CartCols />
            <thead>
              <tr className="bg-[#E4AE12] border-b border-gray-700 font-bold text-center">
                <th className="border px-2 py-1 text-left hidden sm:table-cell">
                  Code
                </th>
                <th className="border px-2 py-1 text-left">Name</th>
                <th className="border px-1 sm:px-2 py-1">Qty</th>
                <th className="border px-1 sm:px-2 py-1 text-right">Rate</th>
                <th className="border px-1 sm:px-2 py-1 text-right">Amount</th>
              </tr>
            </thead>
          </table>

          {voidMode && (
            <div className="shrink-0 bg-red-100 border-b border-red-500 px-2 py-1 text-xs">
              <div className="font-bold text-red-700">
                VOID MODE — Reason: {voidReason}
              </div>
              <div className="hidden lg:block text-red-700">
                ↑↓ Select &nbsp;|&nbsp; − Void 1 &nbsp;|&nbsp; + Undo &nbsp;|&nbsp;
                DELETE Void full item &nbsp;|&nbsp; ENTER Confirm &nbsp;|&nbsp; ESC
                Cancel
              </div>
              <div className="lg:hidden flex gap-1 mt-1">
                <button
                  onClick={() => void submitVoid()}
                  className="flex-1 bg-red-600 text-white font-bold py-2 border border-black"
                >
                  CONFIRM VOID
                </button>
                <button
                  onClick={cancelVoid}
                  className="flex-1 bg-white font-bold py-2 border border-black"
                >
                  CANCEL
                </button>
              </div>
            </div>
          )}

          <div className="border-b p-1 flex gap-1 shrink-0">
            <input
              ref={codeRef}
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
              }}
              onFocus={() => {
                setFocusField("code");
                setDropdownOpen(false);
              }}
              onKeyDown={handleCodeKeyDown}
              enterKeyHint="search"
              autoComplete="off"
              disabled={voidMode}
              placeholder="Item Code / Name, then ENTER"
              className="flex-1 min-w-0 h-11 lg:h-9 border border-[#0B4F4A] px-2 outline-none text-base lg:text-sm"
            />

            <button
              onClick={runCodeSearch}
              className="lg:hidden px-4 bg-[#0B4F4A] text-white font-bold border border-black"
            >
              Find
            </button>

            {showFoodList && (
              <button
                onClick={closeDropdown}
                aria-label="Close item list"
                className="lg:hidden px-3 bg-white border border-black font-bold"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex-1 min-h-[120px] overflow-auto">
            <table className="w-full border-collapse table-fixed">
              <CartCols />

              <tbody>
                {voidMode &&
                  voidItems.map((it, index) => {
                    const voided = it.origQty - it.qty;
                    return (
                      <tr
                        key={`void-${it.id}`}
                        onClick={() => setVoidIndex(index)}
                        className={`cursor-pointer ${
                          index === voidIndex
                            ? "bg-gray-500 text-white"
                            : it.qty === 0
                              ? "bg-red-50 text-red-600 line-through"
                              : voided > 0
                                ? "bg-white text-red-600"
                                : "bg-white"
                        }`}
                      >
                        <td className="border px-2 py-1 hidden sm:table-cell">
                          {it.id}
                        </td>
                        <td className="border px-2 py-1 break-words">
                          {it.name}
                          {voided > 0 && (
                            <span className="ml-1 text-[10px] font-bold">
                              VOID {voided}
                            </span>
                          )}
                        </td>
                        <td className="border px-1 py-1 text-center">
                          <div className="flex items-center justify-center gap-1 lg:hidden">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                voidOne(index);
                              }}
                              aria-label="Void one"
                              className="w-8 h-8 border border-black bg-white text-black font-bold"
                            >
                              −
                            </button>
                            <span className="min-w-[1.25rem] font-bold">
                              {it.qty}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                voidAll(index);
                              }}
                              aria-label="Void full item"
                              className="w-8 h-8 border border-black bg-red-600 text-white font-bold"
                            >
                              ✕
                            </button>
                          </div>
                          <span className="hidden lg:inline">{it.qty}</span>
                        </td>
                        <td className="border px-1 sm:px-2 py-1 text-right">
                          {it.price}
                        </td>
                        <td className="border px-1 sm:px-2 py-1 text-right">
                          {(it.price * it.qty).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}

                {!voidMode && oldRows.map((f: any, i: number) => (
                  <tr
                    key={`old-${f.kotId}-${f.itemCode}-${i}`}
                    className="bg-[#EAF3F3] text-gray-700"
                  >
                    <td className="border px-2 py-1 hidden sm:table-cell">
                      {f.itemCode}
                    </td>
                    <td className="border px-2 py-1 break-words">
                      {String(f.food || "").trim()}
                      <span className="ml-1 text-[10px] text-gray-500">
                        KOT {f.kotId}
                      </span>
                    </td>
                    <td className="border px-1 py-1 text-center">{f.qty}</td>
                    <td className="border px-1 sm:px-2 py-1 text-right">
                      {f.price}
                    </td>
                    <td className="border px-1 sm:px-2 py-1 text-right">
                      {(Number(f.price || 0) * Number(f.qty || 0)).toFixed(2)}
                    </td>
                  </tr>
                ))}

                {!voidMode && cart.map((item, index) => (
                  <tr
                    key={`${item.id}-${index}`}
                    onClick={() => setSelectedCartIndex(index)}
                    className={
                      index === selectedCartIndex
                        ? "bg-gray-500 text-white"
                        : "bg-white"
                    }
                  >
                    <td className="border px-2 py-1 hidden sm:table-cell">
                      {item.id}
                    </td>

                    <td className="border px-2 py-1 break-words">
                      {item.name}
                    </td>

                    <td className="border px-1 py-1 text-center">
                      {/* Touch controls on small screens */}
                      <div className="flex items-center justify-center gap-1 lg:hidden">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            decreaseQty(item.id);
                          }}
                          aria-label="Decrease quantity"
                          className="w-8 h-8 border border-black bg-white text-black font-bold"
                        >
                          −
                        </button>
                        <span className="min-w-[1.25rem] font-bold">
                          {item.qty}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            increaseQty(item.id);
                          }}
                          aria-label="Increase quantity"
                          className="w-8 h-8 border border-black bg-white text-black font-bold"
                        >
                          +
                        </button>
                      </div>
                      <span className="hidden lg:inline">{item.qty}</span>
                    </td>

                    <td className="border px-1 sm:px-2 py-1 text-right">
                      {item.price}
                    </td>

                    <td className="border px-1 sm:px-2 py-1 text-right">
                      {(item.price * item.qty).toFixed(2)}
                    </td>
                  </tr>
                ))}

                {!cart.length && !oldRows.length && !voidMode && (
                  <tr>
                    <td colSpan={5} className="h-40 text-center text-gray-400">
                      Scan/type item code and press ENTER
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {showFoodList && filteredFoods.length > 0 && (
            <div
              ref={dropdownRef}
              tabIndex={-1}
              className="border-t bg-white h-44 sm:h-52 lg:h-40 outline-none flex flex-col shrink-0"
            >
              {/* Header - fixed */}
              <div className="shrink-0 bg-[#E4AE12]">
                <table className="w-full table-fixed border-collapse text-sm">
                  <colgroup>
                    <col className="w-[64px] sm:w-[80px]" />
                    <col />
                    <col className="w-[80px] sm:w-[120px]" />
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
                    <col className="w-[64px] sm:w-[80px]" />
                    <col />
                    <col className="w-[80px] sm:w-[120px]" />
                  </colgroup>

                  <tbody>
                    {filteredFoods.map((food: any, index: number) => (
                      <tr
                        key={food.itemCode}
                        data-food-index={index}
                        onClick={() => {
                          setSelectedFoodIndex(index);
                          chooseFood(food);
                        }}
                        className={`cursor-pointer ${
                          index === selectedFoodIndex
                            ? "bg-gray-500 text-white font-bold"
                            : "bg-[#FFFF66] text-black"
                        }`}
                      >
                        <td className="border border-gray-400 px-2 py-2 lg:py-1 text-left">
                          {food.itemCode}
                        </td>

                        <td className="border border-gray-400 px-2 py-2 lg:py-1 text-left truncate">
                          {String(food.itemName || "").trim()}
                        </td>

                        <td className="border border-gray-400 px-2 py-2 lg:py-1 text-left">
                          {food.oidRate}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {showFoodList && selectedFood && (
            <div className="border-t bg-[#D7F0F0] p-2 flex flex-wrap items-center justify-end gap-2 shrink-0">
              <span className="mr-auto font-bold truncate max-w-[50%] lg:hidden">
                {String(selectedFood.itemName || "").trim()}
              </span>

              <label className="font-bold whitespace-nowrap">Qty</label>
              <input
                ref={quantityRef}
                type="number"
                inputMode="numeric"
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
                className="w-20 h-11 lg:h-8 border border-[#0B4F4A] px-2 outline-none text-base lg:text-sm"
              />

              <button
                onClick={confirmQuantity}
                className="lg:hidden h-11 px-5 bg-[#0B4F4A] text-white font-bold border border-black"
              >
                ADD
              </button>
            </div>
          )}

          <div className="hidden lg:block border-t bg-[#0B4F4A] text-white px-3 py-1 text-xs shrink-0">
            ALT+O Outlet | ALT+T Table | ALT+P Pax | ALT+S Steward | ALT+C Code
            &nbsp; | &nbsp; ↑↓ Navigate &nbsp; | &nbsp; ENTER Open/Select &nbsp;
            | &nbsp; +/- Qty &nbsp; | &nbsp; DELETE Remove
          </div>
        </section>

        {/* ============ RUNNING ORDER PANEL ============ */}
        <section
          className={`${panel(
            "running",
          )} lg:flex bg-white border border-gray-500 flex-col min-h-0 overflow-y-auto lg:overflow-visible`}
        >
          <div className="bg-white border-b px-2 py-2 font-bold shrink-0">
            Running Order Detail{" "}
            <button
              onClick={() => void refreshOutlets()}
              className="lg:hidden ml-2 px-2 py-1 border border-black text-xs bg-yellow-100"
            >
              Refresh
            </button>
            <span className="hidden lg:inline">[Ctrl+R]</span>
          </div>

          <div className="p-2 border-b shrink-0">
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
                {session?.pax || pax || "-"}
              </div>

              <div className="border p-1">
                <b>Steward</b>
                <br />
                {session?.waiterName || stewards[stewardIndex]?.stwName || "-"}
              </div>
            </div>
          </div>

          <div className="flex-1 lg:overflow-auto min-h-[80px]">
            {/* Occupied tables of all outlets */}
            <div className="bg-gray-100 border-b px-2 py-1 text-xs font-bold flex justify-between">
              <span>Occupied Tables</span>
              <span>{occupiedTables.length}</span>
            </div>

            {occupiedTables.map((t) => {
              const isCurrent =
                String(t.outlet.oltCode) === String(activeOutlet?.oltCode) &&
                t.tableNumber === tableNumber;

              return (
                <div
                  key={`${t.outlet.oltCode}-${t.tableNumber}`}
                  onClick={() => {
                    // Switch outlet first when the table belongs to another one.
                    if (String(t.outlet.oltCode) !== String(activeOutlet?.oltCode)) {
                      selectOutlet(t.outlet);
                    }
                    setTableIndex(
                      formatTables(t.outlet).findIndex(
                        (x) => x.tableNumber === t.tableNumber,
                      ),
                    );
                    setTableNumber(t.tableNumber);
                    handleTableSelection(t, t.outlet);
                    setMobileTab("setup");
                  }}
                  className={`flex justify-between items-center border-b px-2 py-2 cursor-pointer ${
                    isCurrent ? "bg-gray-300 font-bold" : ""
                  }`}
                >
                  <div className="min-w-0">
                    <div>{t.tableNumber}</div>
                    <div className="text-[11px] text-gray-500 truncate">
                      {t.outlet.oltName.trim()}
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    <div>{t.status}</div>
                    <div
                      className={
                        t.kotStatus === "NCKOT"
                          ? "text-orange-600 font-bold"
                          : ""
                      }
                    >
                      {t.kotStatus === "NCKOT" ? "NC" : "KOT"}
                    </div>
                  </div>
                </div>
              );
            })}

            {subTables.length > 0 && (
              <div className="bg-gray-100 border-b px-2 py-1 text-xs font-bold">
                Sub tables
              </div>
            )}

            {subTables.map((sub: any, index: number) => (
              <div
                key={`${sub.subTable}-${index}`}
                onClick={() => {
                  if (sub.tableStatus !== "Available") {
                    void loadExistingTable(tableNumber, sub.subTable);
                  }
                }}
                className={`grid grid-cols-3 border-b px-2 py-2 cursor-pointer ${
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

            {!subTables.length && !occupiedTables.length && (
              <div className="p-3 text-gray-400">No occupied tables.</div>
            )}
          </div>

          <div className="border-t p-2 text-xs shrink-0">
            <div className="font-bold text-red-600">Transfer Table</div>

            <div className="hidden lg:block text-xs text-gray-500 mt-1">
              Keyboard mode: use Alt shortcuts, arrows and Enter. Mouse/touch is
              optional.
            </div>

            <div className="mt-2 grid grid-cols-2 gap-1">
              <div className="border p-2">Outlet</div>
              <div className="border p-2">Table</div>
            </div>
          </div>

          {billData && (
            <div className="border-t bg-yellow-100 p-2 text-xs shrink-0">
              Bill Total: ₹{Number(billData?.tax?.grandTotal || 0).toFixed(2)}
            </div>
          )}
        </section>
      </div>

      {/* Mobile / tablet sticky action bar */}
      <div className="lg:hidden shrink-0 bg-[#0B4F4A] text-white border-t border-black pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-between px-3 pt-1 text-xs">
          <span>
            Qty: <b>{totalQty}</b>
          </span>
          <span className="text-sm">
            Total: <b>₹{(totalAmount || total).toFixed(2)}</b>
          </span>
        </div>

        <div className="grid grid-cols-5 gap-1 p-1">
          <button
            onClick={resetNewOrder}
            className="bg-yellow-300 text-black border border-black py-3 font-bold text-xs"
          >
            NEW
          </button>

          <button
            onClick={openNcModal}
            className={`border border-black py-3 font-bold text-xs ${
              isNC ? "bg-orange-500 text-white" : "bg-white text-black"
            }`}
          >
            NC
          </button>

          <button
            onClick={() => void handleKOT()}
            className="bg-green-500 text-white border border-black py-3 font-bold text-xs"
          >
            KOT
          </button>

          <button
            onClick={() => void handleBill()}
            className="bg-blue-600 text-white border border-black py-3 font-bold text-xs"
          >
            BILL
          </button>

          <button
            onClick={startVoid}
            className="bg-red-600 text-white border border-black py-3 font-bold text-xs"
          >
            VOID
          </button>
        </div>
      </div>

      {ncModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-3">
          <div className="bg-white w-full max-w-sm border border-black p-3 flex flex-col gap-2">
            <div className="font-bold text-orange-600">
              NC (Non Chargeable)
            </div>

            <label className="font-bold text-xs">
              NC Department
              <select
                autoFocus
                value={ncCode}
                onChange={(e) =>
                  setNcCode(e.target.value ? Number(e.target.value) : "")
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (!ncCode) {
                      toast.error("Please select NC department");
                      return;
                    }
                    ncRemarksRef.current?.focus();
                  }
                }}
                className="w-full border border-orange-500 h-11 lg:h-9 px-2 text-base lg:text-sm bg-white"
              >
                <option value="" disabled>
                  Select NC department
                </option>
                {ncReasons.map((r: any) => (
                  <option key={r.ncDepCode} value={r.ncDepCode}>
                    {r.ncDepName}
                  </option>
                ))}
              </select>
            </label>

            <label className="font-bold text-xs">
              Reason / Remarks
              <input
                ref={ncRemarksRef}
                value={ncRemarks}
                onChange={(e) => setNcRemarks(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    confirmNc();
                  }
                }}
                placeholder="Enter reason / remarks"
                className="w-full border border-orange-500 h-11 lg:h-9 px-2 outline-none text-base lg:text-sm"
              />
            </label>

            <div className="hidden lg:block text-xs text-gray-500">
              ENTER next / confirm &nbsp;|&nbsp; ESC cancel
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={cancelNc}
                className="px-4 py-2 border border-black bg-white font-bold"
              >
                Cancel
              </button>
              <button
                onClick={confirmNc}
                className="px-4 py-2 border border-black bg-orange-500 text-white font-bold"
              >
                Confirm NC KOT
              </button>
            </div>
          </div>
        </div>
      )}

      {voidReasonOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-3">
          <div className="bg-white w-full max-w-sm border border-black p-3 flex flex-col gap-2">
            <div className="font-bold text-red-600">VOID — enter reason</div>

            <input
              autoFocus
              value={voidReason}
              onChange={(e) => setVoidReason(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  confirmVoidReason();
                }
              }}
              placeholder="Reason for void"
              className="w-full h-11 lg:h-9 border border-red-600 px-2 outline-none text-base lg:text-sm"
            />

            <div className="hidden lg:block text-xs text-gray-500">
              ENTER continue &nbsp;|&nbsp; ESC cancel
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setVoidReasonOpen(false);
                  focusCode();
                }}
                className="px-4 py-2 border border-black bg-white font-bold"
              >
                Cancel
              </button>
              <button
                onClick={confirmVoidReason}
                className="px-4 py-2 border border-black bg-red-600 text-white font-bold"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {settlementListOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-3">
          <div
            ref={settlementListRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="settlement-list-title"
            tabIndex={-1}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                setSettlementListOpen(false);
                return;
              }
              const dialog = settlementListRef.current;
              if (!dialog) return;
              const buttons = Array.from(
                dialog.querySelectorAll<HTMLButtonElement>("button:not(:disabled)"),
              );
              const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
              if (e.key === "ArrowDown" || e.key === "ArrowRight") {
                e.preventDefault();
                buttons[(index + 1 + buttons.length) % buttons.length]?.focus();
              } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
                e.preventDefault();
                buttons[(index - 1 + buttons.length) % buttons.length]?.focus();
              }
            }}
            className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl outline-none"
          >
            <div className="flex items-center justify-between bg-[#0576B2] px-5 py-4 text-white">
              <div>
                <h2 id="settlement-list-title" className="text-lg font-bold">Settlement — Unsettled Tables</h2>
                <p className="text-xs text-blue-100">Select any unsettled table to open its payment window.</p>
              </div>
              <button type="button" onClick={() => setSettlementListOpen(false)} aria-label="Close settlement list" className="text-2xl font-bold">×</button>
            </div>
            <div className="overflow-y-auto p-4">
              <div className="mb-2 grid grid-cols-[1fr_1fr_1fr_auto] gap-3 border-b pb-2 text-xs font-bold uppercase text-gray-500">
                <span>Outlet</span><span>Table</span><span>Bill No.</span><span>Action</span>
              </div>
              {unsettledTables.length ? (
                <div className="space-y-2">
                  {unsettledTables.map((row: any, index: number) => (
                    <div key={`${row.outlet.oltCode}-${row.tableNumber}-${row.BillNo}-${index}`} className="grid grid-cols-[1fr_1fr_1fr_auto] items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                      <span className="font-medium">{row.outlet.oltName}</span>
                      <span className="font-bold">{row.tableNumber}-{row.subTable || "A"}</span>
                      <span>#{row.BillNo || "—"}<span className="ml-2 text-xs text-gray-600">₹{Number(row.billAmount || 0).toFixed(2)}</span></span>
                      <button
                        type="button"
                        disabled={!row.BillNo || processing}
                        onClick={() => void openUnsettledTableFromList(row)}
                        className="rounded bg-amber-600 px-3 py-2 font-bold text-white hover:bg-amber-700 disabled:opacity-40"
                      >Select & Pay</button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-10 text-center text-gray-500">No unsettled tables found.</p>
              )}
            </div>
            <div className="flex justify-end border-t bg-gray-50 p-3">
              <button type="button" onClick={() => setSettlementListOpen(false)} className="rounded border px-4 py-2 font-semibold">Close (Esc)</button>
            </div>
          </div>
        </div>
      )}

      {tableChoiceOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-3">
          <div
            ref={tableChoiceDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="table-choice-title"
            tabIndex={-1}
            onKeyDown={(e) => {
              const dialog = tableChoiceDialogRef.current;
              if (!dialog) return;
              const actions: HTMLButtonElement[] = Array.from(
                dialog.querySelectorAll<HTMLButtonElement>(
                  'button:not(:disabled):not([tabindex="-1"])',
                ),
              );
              if (!actions.length) return;
              const currentIndex = actions.indexOf(document.activeElement as HTMLButtonElement);

              // Arrow keys move through the available next-step actions.
              if (e.key === "ArrowDown" || e.key === "ArrowRight") {
                e.preventDefault();
                actions[(currentIndex + 1 + actions.length) % actions.length].focus();
              } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
                e.preventDefault();
                actions[(currentIndex - 1 + actions.length) % actions.length].focus();
              } else if (e.key === "Tab") {
                if (e.shiftKey && currentIndex <= 0) {
                  e.preventDefault();
                  actions[actions.length - 1].focus();
                } else if (!e.shiftKey && currentIndex === actions.length - 1) {
                  e.preventDefault();
                  actions[0].focus();
                }
              }
            }}
            className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-xl border border-gray-300 bg-white shadow-xl outline-none"
          >
            <div className="flex items-center justify-between bg-[#0576B2] px-5 py-3 text-white">
              <div>
                <h2 id="table-choice-title" className="text-lg font-bold">
                  Table {pendingTable} — Bills & Settlement
                </h2>
                <p className="text-xs text-blue-100">
                  {pendingOutlet?.oltName?.trim()} · Select an occupied bill, settle an unsettled bill, or start a new table order.
                </p>
              </div>
              <button
                type="button"
                aria-label="Close table bills"
                onClick={() => {
                  setTableChoiceOpen(false);
                  setPendingTable("");
                  setPendingOutlet(null);
                }}
                className="text-2xl font-bold"
              >×</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="mb-3 grid grid-cols-[1fr_1fr_auto] gap-2 border-b pb-2 text-xs font-bold uppercase text-gray-500">
                <span>Subtable / Bill</span><span>Status</span><span>Action</span>
              </div>
              <div className="space-y-2">
                {subTables.filter((sub: any) => String(sub.tableStatus || "").toLowerCase() !== "available").map((sub: any, index: number) => {
                  const unsettled = String(sub.tableStatus || "").toLowerCase() === "unsettled";
                  const disabled = unsettled && isSettlementAccessDisabled;
                  return (
                    <div key={`${sub.subTable}-${sub.billNo || index}`} className={`grid grid-cols-[1fr_1fr_auto] items-center gap-2 rounded-lg border p-3 ${unsettled ? "border-amber-300 bg-amber-50" : "border-red-200 bg-red-50"}`}>
                      <div>
                        <div className="font-bold text-gray-900">{pendingTable}-{sub.subTable}</div>
                        <div className="text-xs text-gray-500">Bill #{sub.billNo || "—"}</div>
                      </div>
                      <span className={`text-sm font-semibold ${unsettled ? "text-amber-700" : "text-red-700"}`}>{sub.tableStatus}</span>
                      {unsettled ? (
                        <button
                          type="button"
                          disabled={disabled || settlementLoading}
                          onClick={() => void handleUnsettledSubTable(sub)}
                          className="rounded bg-amber-600 px-3 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
                        >{disabled ? "No Access" : "Settle"}</button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setTableChoiceOpen(false);
                            setSelectedSubTable(String(sub.subTable || "A"));
                            void loadExistingTable(pendingTable, String(sub.subTable || "A"), pendingOutlet || undefined);
                            setMobileTab("order");
                          }}
                          className="rounded bg-green-600 px-3 py-2 text-sm font-bold text-white"
                        >Continue</button>
                      )}
                    </div>
                  );
                })}
                {!subTables.some((sub: any) => String(sub.tableStatus || "").toLowerCase() !== "available") && (
                  <p className="py-6 text-center text-sm text-gray-500">No occupied or unsettled bills for this table.</p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t bg-gray-50 p-4 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={() => void startNewSubTableOrder()}
                className="rounded-lg border-2 border-dashed border-[#0576B2] bg-white px-4 py-3 font-bold text-[#0576B2]"
              >＋ New Table / New Bill</button>
              <button
                type="button"
                onClick={() => {
                  setTableChoiceOpen(false);
                  setPendingTable("");
                  setPendingOutlet(null);
                }}
                className="rounded-lg border border-gray-300 px-4 py-3 font-semibold text-gray-700"
              >Close</button>
            </div>
            <p className="px-4 pb-3 text-xs text-gray-500">Press Esc to close this window.</p>
          </div>
        </div>
      )}

      <PaymentModal
        isOpen={openSettlementPayment}
        paymentModes={paymentModes}
        unbillData={unbillData}
        billNo={unbillData?.[0]?.ksmBillNo || 0}
        roomServiceList={{ data: [] }}
        onClose={() => {
          setOpenSettlementPayment(false);
          setUnbillData(null);
          if (settlementOpenedFromList) {
            setSettlementListOpen(true);
            setSettlementOpenedFromList(false);
          } else {
            setTableChoiceOpen(true);
          }
        }}
        onPay={handleBillSettlement}
      />

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
