// src/pages/NewOrder.tsx
import React, { useEffect, useState } from "react";
import Tabs from "../components/Tabs";
import TableCard from "../components/TableCard";
import { useLocation, useNavigate } from "react-router-dom";
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
  BillNo:number
};

type Outlet = {
  oltCode: number;
  oltName: string;
  tables: {
    tblNo: string;
    tableStatus: string;
    kotStatus: string;
    billNo: number; // 👈 ADD THIS
    billAmount?: number; // optional (you also have this in API)
  }[];
};
const NewOrder: React.FC = () => {
  const [tabs, setTabs] = useState<{ id: string; label: string }[]>([]);
  const [tablesData, setTablesData] = useState<Record<string, Table[]>>({});
  const [activeTab, setActiveTab] = useState("");
  const [loading, setLoading] = useState(false);
    const [openPayment, setOpenPayment] = useState(false)

  const navigate = useNavigate();
  const { activeOltCode, setActiveOLT } = useActiveOLT();
const location = useLocation();
const shouldReset = location.state?.reset;
const [unbillData, setUnbillData] = useState<any>(null);
  const [paymentModes, setPaymentModes] = useState<any[]>([]);
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
             BillNo: tbl.billNo, // 👈 ADD THIS
          }));
        });

        setTablesData(tables);

       if (formattedTabs.length > 0) {
  const firstTab = formattedTabs[0];

  if (shouldReset) {
    // 🔥 FORCE RESET
    setActiveTab(firstTab.id);
    setActiveOLT(firstTab.id, firstTab.label);
              window.history.replaceState({}, document.title);

  } else if (!activeOltCode) {
    setActiveTab(firstTab.id);
    setActiveOLT(firstTab.id, firstTab.label);
  } else {
    setActiveTab(activeOltCode);
  }
}
      } catch (error) {
        console.error("Error fetching outlets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeOltCode, setActiveOLT]);
  useEffect(() => {
    void fetchPaymentModes()
  }, [])
  

  /* ---------------- TAB CHANGE ---------------- */
  const handleTabChange = async (tabId: string) => {
    const selectedTab = tabs.find((t) => t.id === tabId);
    if (!selectedTab) return;

    setActiveTab(selectedTab.id);
    setActiveOLT(selectedTab.id, selectedTab.label);

    const isFastFood =
      selectedTab.id === "7" ||
      selectedTab.label.toUpperCase().includes("FAST");

    if (isFastFood) {
      try {
        const branch = localStorage.getItem("branch") || "";

        const res = await getFastfoodDetails(selectedTab.id, branch);

        console.log("FastFood API:", res);

        // 🔥 DIRECT REDIRECT
        navigate("/OrderingBoard", {
          state: {
            tableNumber: res.tblNo || "FF",
            status: "Available",
            kotStatus: "N",
            fastFood: true,

            // ✅ FIXED WAITER
            waiter: String(res.stwCode),
            waiterName: res.stwName || "Counter",

            pax: res.tblSeatCount || 1,
          },
        });
      } catch (err) {
        console.error("Fast food fetch failed", err);
      }
    }
  };

  /* ---------------- NORMAL TABLE CLICK ---------------- */
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

      console.log("Unbill Details:", res);

      setUnbillData(res); // ✅ STORE HERE
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

  /* ---------------- UI ---------------- */
  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {loading && <Loader />}

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={handleTabChange} />

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
  unbillData={unbillData} // 👈 PASS HERE
  onClose={() => setOpenPayment(false)}
  onPay={() => alert("setteled")}
/>
    </div>
  );
};

export default NewOrder;