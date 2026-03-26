// src/pages/NewOrder.tsx
import React, { useEffect, useState } from "react";
import Tabs from "../components/Tabs";
import TableCard from "../components/TableCard";
import {  useNavigate } from "react-router-dom";
import {
  getCombinedOutletAndTableMasterList,
  getFastfoodDetails,
  getPaymentModeMaster,
  getUnbillDetails,
} from "../api/services/products.service";
import Loader from "../components/Loader";
import { useActiveOLT } from "../context/ActiveOLTContext";
import PaymentModal from "../components/PaymentModal";

/* ---------------- TYPES ---------------- */
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
  tables: {
    tblNo: string;
    tableStatus: string;
    kotStatus: string;
    billNo: number;
    billAmount?: number;
  }[];
};

const NewOrder: React.FC = () => {
  const [tabs, setTabs] = useState<{ id: string; label: string }[]>([]);
  const [tablesData, setTablesData] = useState<Record<string, Table[]>>({});
  const [activeTab, setActiveTab] = useState("");
  const [loading, setLoading] = useState(false);
  const [openPayment, setOpenPayment] = useState(false);

  const navigate = useNavigate();
  const { activeOltCode, setActiveOLT } = useActiveOLT();

  const [unbillData, setUnbillData] = useState<any>(null);
  const [paymentModes, setPaymentModes] = useState<any[]>([]);

  /* ---------------- FETCH PAYMENT MODES ---------------- */
  const fetchPaymentModes = async () => {
    try {
      const branch = localStorage.getItem("branch") || "";
      const data = await getPaymentModeMaster(branch);
      setPaymentModes(data || []);
    } catch (err) {
      console.error("Failed to fetch payment modes", err);
    }
  };

  /* ---------------- FETCH DATA ---------------- */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data: Outlet[] =
          await getCombinedOutletAndTableMasterList(
            localStorage.getItem("branch") || ""
          );

        const formattedTabs = data.map((outlet) => ({
          id: outlet.oltCode.toString(),
          label: outlet.oltName.trim(),
        }));
        

        setTabs(formattedTabs);

        const tables: Record<string, Table[]> = {};
        data.forEach((outlet) => {
          tables[outlet.oltCode.toString()] = outlet.tables.map((tbl) => ({
            tableNumber: tbl.tblNo,
            status: tbl.tableStatus,
            kotStatus: tbl.kotStatus,
            BillNo: tbl.billNo,
          }));
        });

        setTablesData(tables);

        /* 🔥 INITIAL SELECTION LOGIC */
        if (formattedTabs.length > 0) {
          const fastFoodTab = formattedTabs.find((t) =>
            t.label.toUpperCase().includes("FAST")
          );

          const nonFastFoodTabs = formattedTabs.filter(
            (t) => !t.label.toUpperCase().includes("FAST")
          );

          // ✅ Only FAST FOOD → redirect
          if (formattedTabs.length === 1 && fastFoodTab) {
            const branch = localStorage.getItem("branch") || "";
            const res = await getFastfoodDetails(fastFoodTab.id, branch);

            navigate("/OrderingBoard", {
              state: {
                tableNumber: res.tblNo || "FF",
                status: "Available",
                kotStatus: "N",
                fastFood: true,
                waiter: String(res.stwCode),
                waiterName: res.stwName || "Counter",
                pax: res.tblSeatCount || 1,
              },
            });
            return;
          }

          let selectedTab;

          if (fastFoodTab && !activeOltCode) {
            // pick random non-fastfood
            if (nonFastFoodTabs.length > 0) {
              const randomIndex = Math.floor(
                Math.random() * nonFastFoodTabs.length
              );
              selectedTab = nonFastFoodTabs[randomIndex];
            } else {
              selectedTab = fastFoodTab;
            }
          } else {
            selectedTab =
              formattedTabs.find((t) => t.id === activeOltCode) ||
              formattedTabs[0];
          }

          if (
            selectedTab &&
            !selectedTab.label.toUpperCase().includes("FAST")
          ) {
            setActiveTab(selectedTab.id);
            setActiveOLT(selectedTab.id, selectedTab.label);
          }
        }
      } catch (error) {
        console.error("Error fetching outlets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    void fetchPaymentModes();
  }, []);

  /* ---------------- TAB CHANGE ---------------- */
  const handleTabChange = async (tabId: string) => {
    const selectedTab = tabs.find((t) => t.id === tabId);
    if (!selectedTab) return;

    const isFastFood =
      selectedTab.id === "7" ||
      selectedTab.label.toUpperCase().includes("FAST");

    // 🔥 FASTFOOD → DIRECT REDIRECT (no active tab)
    if (isFastFood) {
      try {
        const branch = localStorage.getItem("branch") || "";
        const res = await getFastfoodDetails(selectedTab.id, branch);

        navigate("/OrderingBoard", {
          state: {
            tableNumber: res.tblNo || "FF",
            status: "Available",
            kotStatus: "N",
            fastFood: true,
            waiter: String(res.stwCode),
            waiterName: res.stwName || "Counter",
            pax: res.tblSeatCount || 1,
          },
        });
      } catch (err) {
        console.error("Fast food fetch failed", err);
      }
      return;
    }

    // ✅ Normal outlet
    setActiveTab(selectedTab.id);
    setActiveOLT(selectedTab.id, selectedTab.label);
  };

  /* ---------------- TABLE CLICK ---------------- */
  const handleTableClick = async (table: Table) => {
    if (table.status === "Unsettled") {
      try {
        const branch = localStorage.getItem("branch") || "";
        const res = await getUnbillDetails(
          table.BillNo,
          table.tableNumber,
          activeTab,
          branch
        );

        setUnbillData(res);
        setOpenPayment(true);
      } catch (err) {
        console.error("Failed to fetch unbill details", err);
      }
      return;
    }

    navigate("/OrderingBoard", {
      state: {
        tableNumber: table.tableNumber,
        status: table.status,
        kotStatus: table.kotStatus,
      },
    });
  };

  /* ---------------- SPLIT FASTFOOD ---------------- */
  const fastFoodTab = tabs.find((t) =>
    t.label.toUpperCase().includes("FAST")
  );

  const normalTabs = tabs.filter(
    (t) => !t.label.toUpperCase().includes("FAST")
  );

  /* ---------------- UI ---------------- */
  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {loading && <Loader />}

      {/* Tabs + FASTFOOD Button */}
      <div className="flex items-center border-b">
        <Tabs
          tabs={normalTabs}
          activeTab={activeTab}
          onChange={handleTabChange}
        />

{fastFoodTab && (
  <button
    onClick={() => handleTabChange(fastFoodTab.id)}
    className="
      flex-1 min-w-[120px] px-4 py-3 text-sm font-medium tracking-wide
      text-gray-500
      transition-all duration-200
      hover:text-[#0576B2]
      hover:bg-[#026388]/10
    "
  >
    {fastFoodTab.label}
  </button>
)}
      </div>

      {/* Table Grid */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4">
          {activeTab &&
            tablesData[activeTab]?.map((table) => (
              <TableCard
                key={table.tableNumber}
                billNo={table.BillNo}
                tableNumber={table.tableNumber}
                status={table.status}
                kotStatus={table.kotStatus}
                peopleCount={table.peopleCount}
                handleCardClick={() => handleTableClick(table)}
              />
            ))}
        </div>
      </div>

      <PaymentModal
        paymentModes={paymentModes}
        isOpen={openPayment}
        unbillData={unbillData}
        onClose={() => setOpenPayment(false)}
        onPay={() => alert("setteled")}
      />
    </div>
  );
};

export default NewOrder;