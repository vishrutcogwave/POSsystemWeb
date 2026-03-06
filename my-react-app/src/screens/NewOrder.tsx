// src/pages/NewOrder.tsx
import React, { useEffect, useState } from "react";
import Tabs from "../components/Tabs";
import TableCard from "../components/TableCard";
import { useNavigate } from "react-router-dom";
import { getCombinedOutletAndTableMasterList } from "../api/services/products.service";
import Loader from "../components/Loader";
import { useActiveOLT } from "../context/ActiveOLTContext"; // ✅ import ActiveOLT context

type Table = {
  tableNumber: string;
  status: string;
  peopleCount?: number;
};

type Outlet = {
  oltCode: number;
  oltName: string;
  tables: {
    tblNo: string;
    tableStatus:string
  }[];
};

const NewOrder: React.FC = () => {
  const [tabs, setTabs] = useState<{ id: string; label: string }[]>([]);
  const [tablesData, setTablesData] = useState<Record<string, Table[]>>({});
  const [activeTab, setActiveTab] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { activeOltCode, setActiveOLT } = useActiveOLT(); // ✅ use context

  /* ---------------- FETCH OUTLETS & TABLES ---------------- */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data: Outlet[] = await getCombinedOutletAndTableMasterList(
          localStorage.getItem("branch") || ""
        );

        // Map API response to tabs
        const formattedTabs = data.map((outlet) => ({
          id: outlet.oltCode.toString(),
          label: outlet.oltName.trim(),
        }));
        setTabs(formattedTabs);

        // Map API tables
        const tables: Record<string, any[]> = {};
        data.forEach((outlet) => {
          tables[outlet.oltCode.toString()] = outlet.tables.map((tbl) => ({
            tableNumber: tbl.tblNo,
            status: tbl.tableStatus,
          }));
        });
        setTablesData(tables);

        // Set first tab as active if exists
        if (formattedTabs.length > 0 && !activeOltCode) {
          const firstTab = formattedTabs[0];
          setActiveTab(firstTab.id);
          setActiveOLT(firstTab.id, firstTab.label); // ✅ set context
        } else if (activeOltCode) {
          setActiveTab(activeOltCode); // restore last active tab from context
        }
      } catch (error) {
        console.error("Error fetching outlets and tables:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeOltCode, setActiveOLT]);

  /* ---------------- NAVIGATE TO ORDERING BOARD ---------------- */
  const handleTableClick = (table: Table) => {
    navigate("/OrderingBoard", {
      state: {
        tableNumber: table.tableNumber,
        status: table.status,
      },
    });
  };

  /* ---------------- TAB CHANGE ---------------- */
  const handleTabChange = (tabId: string) => {
    const selectedTab = tabs.find((t) => t.id === tabId);
    if (selectedTab) {
      setActiveTab(selectedTab.id);
      setActiveOLT(selectedTab.id, selectedTab.label); // ✅ update context
    }
  };

  /* ---------------- RENDER ---------------- */
  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {loading && <Loader />}

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={handleTabChange} />

      {/* Table Cards */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4">
          {activeTab &&
            tablesData[activeTab]?.map((table) => (
              <TableCard
                key={table.tableNumber}
                tableNumber={table.tableNumber}
                status={table.status}
                peopleCount={table.peopleCount}
                handleCardClick={() => handleTableClick(table)}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default NewOrder;