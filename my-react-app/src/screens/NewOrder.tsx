// src/pages/NewOrder.tsx
import React, { useEffect, useState } from "react";
import Tabs from "../components/Tabs";
import TableCard from "../components/TableCard";
import { useNavigate } from "react-router-dom";
import {
  getCombinedOutletAndTableMasterList,
  getFastfoodDetails,
  getKotTransferType,
  getOldCart,
  getSubTables,
  getTableListForRoomService,
  postKotTransferTable,
} from "../api/services/products.service";
import Loader from "../components/Loader";
import { useActiveOLT } from "../context/ActiveOLTContext";

import TableTransferPopup from "../components/TableTransferPopup";
import { useAppContext } from "../context/AppContext";
import RoomServiceCard from "../components/RoomServiceCard";

/* ---------------- TYPES ---------------- */
export type Table = {
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

const NewOrder: React.FC = () => {
  const [tabs, setTabs] = useState<{ id: string; label: string }[]>([]);
  const [tablesData, setTablesData] = useState<Record<string, Table[]>>({});
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [activeTab, setActiveTab] = useState("");
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [openTableTransfer, setOpenTableTransfer] = useState(false);
  const navigate = useNavigate();
  const [selectedKotIds, setSelectedKotIds] = useState<number[]>([]);
  const { activeOltCode, setActiveOLT } = useActiveOLT();
  const [subTables, setSubTables] = useState<any[]>([]);
  const outletCode = localStorage.getItem("activeOltCode") || "";
  const [transferTypes, setTransferTypes] = useState<any[]>([]);
  const [oldCartData, setOldcartData] = useState<any[]>([]);
  const { appData } = useAppContext();
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [roomServiceTables, setRoomServiceTables] = useState<any[]>([]);
  const [selectedSubTableTable, setselectedSubTableTable] = useState<
    string | null
  >(null); // sub table
  const [TransformSelectedTable, setTransformSelectedTable] = useState<
    string | null
  >(null);
  const [selectedTransferType, setSelectedTransferType] = useState<string>("");
  const handleOpenTableTransfer = async (table: Table) => {
    setSelectedTable(table);
    try {
      const outlet = localStorage.getItem("activeOltCode") || "";

      const data = await getSubTables(
        outlet,
        table.tableNumber,
        appData?.user?.branch_code,
      );

      setSubTables(data);
      setOpenTableTransfer(true);
    } catch (error) {
      console.error("Failed to open table transfer:", error);
    }
  };

  const getOldcartData = async () => {
    try {
      const res = await getOldCart(
        selectedTable?.tableNumber || null,
        outletCode,
        selectedSubTableTable || "",
        appData?.user?.branch_code,
      );
      console.log(res, "oldcartdetils");
      setOldcartData(res);
    } catch (e) {
      console.log(e);
    }
  };
  useEffect(() => {
    void getOldcartData();
  }, [selectedSubTableTable]);
  /* ---------------- FETCH PAYMENT MODES ---------------- */

  const fetchRoomServiceTables = async (outletCode: number | string) => {
  try {
    localStorage.setItem(
      "roomserviceoldcode",
      JSON.stringify(outletCode)
    );

    const res = await getTableListForRoomService(
      outletCode,
      appData?.user?.branch_code || ""
    );

    setRoomServiceTables(res.data || []);
    console.log("Room Service Tables:", res);
  } catch (err) {
    console.error("Failed to fetch room service tables", err);
  }
};
  /* ---------------- FETCH DATA ---------------- */
  const fetchData = async () => {
    
    setLoading(true);
    try {
      const data: Outlet[] = await getCombinedOutletAndTableMasterList(
        appData?.user?.branch_code || "",
        appData?.user?.userCode,
      );

      // ✅ Store the outlet data
      setOutlets(data);
      // Check if any outlet is Room Service
const roomServiceOutlet = data.find((outlet) => outlet.oltIsRoomService);

if (roomServiceOutlet) {
  await fetchRoomServiceTables(roomServiceOutlet.oltCode);
}      const formattedTabs = data.map((outlet) => ({
        id: outlet.oltCode.toString(),
        label: outlet.oltName.trim(),
        isRoomservice: outlet.oltIsRoomService || false,
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
        // ✅ Only FAST FOOD → redirect

        /* 🔥 INITIAL SELECTION LOGIC */
        if (formattedTabs.length > 0) {
          const fastFoodTab = formattedTabs.find((t) =>
            t.label.toUpperCase().includes("FAST"),
          );

          const nonFastFoodTabs = formattedTabs.filter(
            (t) => !t.label.toUpperCase().includes("FAST"),
          );

          // ✅ CASE 1: ONLY FASTFOOD
          if (formattedTabs.length === 1 && fastFoodTab) {
            const branch = localStorage.getItem("branch") || "";
            const res = await getFastfoodDetails(fastFoodTab.id, branch);

            setActiveOLT(fastFoodTab.id, fastFoodTab.label);

            navigate("/OrderingBoard", {
              state: { fastFood: true, tableNumber: res.tblNo || "FF" },
            });
            return;
          }

          // ✅ CASE 2: IF PREVIOUS SELECTION EXISTS → USE IT
          const existing = formattedTabs.find(
            (t) =>
              t.id === activeOltCode && !t.label.toUpperCase().includes("FAST"),
          );

          if (existing) {
            setActiveTab(existing.id);
            setActiveOLT(existing.id, existing.label);
            return;
          }

          // ✅ CASE 3: DEFAULT
          if (fastFoodTab && nonFastFoodTabs.length > 0) {
            const firstNormal = nonFastFoodTabs[0];
            setActiveTab(firstNormal.id);
            setActiveOLT(firstNormal.id, firstNormal.label);
          } else {
            const first = formattedTabs[0];
            setActiveTab(first.id);
            setActiveOLT(first.id, first.label);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching outlets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  if (!activeTab) return;

  const selectedOutlet = outlets.find(
    (o) => o.oltCode.toString() === activeTab
  );

  if (selectedOutlet?.oltIsRoomService) {
    fetchRoomServiceTables(selectedOutlet.oltCode);
  }
}, [activeTab, outlets]);
  const fetchTransferTypes = async () => {
    try {
      const branch = localStorage.getItem("branch") || "";
      const data = await getKotTransferType(branch);
      console.log("typedata", data);

      setTransferTypes(data || []);
    } catch (err) {
      console.error("Failed to fetch transfer types", err);
    }
  };
  useEffect(() => {
    void fetchData();
    void fetchTransferTypes();
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

        // ✅ ADD THIS LINE (FIX)
        setActiveOLT(selectedTab.id, selectedTab.label);

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
    setSelectedTable(table);

    const selectedOutlet = outlets.find(
      (o) => o.oltCode.toString() === activeTab,
    );
    console.log("table", selectedOutlet);

    navigate("/OrderingBoard", {
      state: {
        tableNumber: table.tableNumber,
        status: table.status,
        kotStatus: table.kotStatus,
        isDirectKOTandBill: selectedOutlet?.isDirectKOTandBill ?? false,
        isDirectPaxandStw: selectedOutlet?.isDirectPaxandStw ?? false,
        isDirectBill: selectedOutlet?.isDirectBill ?? false,
      },
    });
  };
  /* ---------------- SPLIT FASTFOOD ---------------- */
  const fastFoodTab = tabs.find((t) => t.label.toUpperCase().includes("FAST"));

  const normalTabs = tabs.filter(
    (t) => !t.label.toUpperCase().includes("FAST"),
  );

  /* ---------------- UI ---------------- */

  const handleTransfer = async () => {
    try {
      const payload = {
        oldOutlet: outletCode,
        oldTableNo: selectedTable?.tableNumber || "", // ✅ FIXED
        oldSubTable: selectedSubTableTable || "",

        newOutlet: outletCode,
        newTable: TransformSelectedTable || "",
        newSubTable: selectedSubTableTable,

        userCode: appData?.userRights?.[0]?.userId || "",
        branch: localStorage.getItem("branch") || "",

        transferType: selectedTransferType,

        kotNo: selectedKotIds.map(String),
        itemCode: selectedItems,
      };
      const res = await postKotTransferTable(payload);
      console.log("TRANSFER SUCCESS:", res);
      setOpenTableTransfer(false);
      setselectedSubTableTable("");
      setSelectedKotIds([]);
      setSelectedTransferType("");
      setTransformSelectedTable("");
      setOldcartData([]);
      fetchData();
    } catch (err) {
      console.error("TRANSFER FAILED:", err);
    }
  };
  const selectedOutlet = outlets.find(
    (o) => o.oltCode.toString() === activeTab,
  );

  const isRoomService = selectedOutlet?.oltIsRoomService;
  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {loading && <Loader />}

      {/* Tabs + FASTFOOD Button */}
      <div className="flex border-b overflow-x-auto">
        <div className="flex min-w-max w-full">
          <Tabs
            tabs={normalTabs}
            activeTab={activeTab}
            onChange={handleTabChange}
          />

          {fastFoodTab && (
            <button
              onClick={() => handleTabChange(fastFoodTab.id)}
              className="
          px-4 py-3 text-sm font-medium whitespace-nowrap
          text-gray-500
          hover:text-[#0576B2]
          hover:bg-[#026388]/10
        "
            >
              {fastFoodTab.label}
            </button>
          )}
        </div>
      </div>
      {/* Table Grid */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4">
          {activeTab &&
            (isRoomService
              ? roomServiceTables.map((room) => (
                  <RoomServiceCard
                    key={room.roomNo}
                    room={room}
                    onClick={() => {
                      navigate("/OrderingBoard", {
                        state: {
                          tableNumber: room.roomNo,
                          kotStatus: room.tableStatus,
                          status: room.tableStatus,
                          roomNo: room.roomNo,
                          guestName: room.guestName,
                          guestCode: room.guestCode,
                          checkinNo: room.checkinNo,
                          pax: room.pax,
                          planId: room.planId,
                          roomService: true,
                          isDirectKOTandBill:
                            selectedOutlet?.isDirectKOTandBill ?? false,
                          isDirectPaxandStw:
                            selectedOutlet?.isDirectPaxandStw ?? false,
                          isDirectBill: selectedOutlet?.isDirectBill ?? false,
                        },
                      });
                    }}
                  />
                ))
              : tablesData[activeTab]?.map((table) => (
                  <TableCard
                    key={table.tableNumber}
                    billNo={table.BillNo}
                    tableNumber={table.tableNumber}
                    status={table.status}
                    kotStatus={table.kotStatus}
                    peopleCount={table.peopleCount}
                    handleCardClick={() => handleTableClick(table)}
                    handleOpenTableTransfer={() =>
                      handleOpenTableTransfer(table)
                    }
                  />
                )))}
        </div>
      </div>

      <TableTransferPopup
        selectedKotId={selectedKotIds}
        setSelectedKotId={setSelectedKotIds}
        tableData={tablesData[outletCode]}
        subTables={subTables}
        isOpen={openTableTransfer}
        onClose={() => {
          setOpenTableTransfer(false);
          setselectedSubTableTable("");
          setSelectedKotIds([]);
          setSelectedTransferType("");
          setTransformSelectedTable("");
          setOldcartData([]);
        }}
        transferTypes={transferTypes}
        selectedSubTableTable={selectedSubTableTable}
        setselectedSubTableTable={setselectedSubTableTable}
        TransformSelectedTable={TransformSelectedTable}
        setTransformSelectedTable={setTransformSelectedTable}
        selectedTransferType={selectedTransferType}
        setSelectedTransferType={setSelectedTransferType}
        handleSubmit={handleTransfer}
        oldcartdata={oldCartData}
        selectedTable={selectedTable}
        selectedItems={selectedItems}
        setSelectedItems={setSelectedItems}
      />
    </div>
  );
};

export default NewOrder;
