import React, { useEffect, useState } from "react";
import Tabs from "../components/Tabs";
import TableCard from "../components/TableCard";
import { useNavigate } from "react-router-dom";
import { getCombinedOutletAndTableMasterList } from "../api/services/products.service";

type Table = {
  tableNumber: string;
  status: "Occupied" | "Available";
  peopleCount?: number;
};

type Outlet = {
  oltCode: number;
  oltName: string;
  tables: {
    tblNo: string;
  }[];
};

const NewOrder: React.FC = () => {
  const [tabs, setTabs] = useState<{ id: string; label: string }[]>([]);
  const [tablesData, setTablesData] = useState<Record<string, Table[]>>({});
  const [activeTab, setActiveTab] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data: Outlet[] = await getCombinedOutletAndTableMasterList(
        localStorage.getItem("branch") || "",
      );

      // Convert API response to tabs
      const formattedTabs = data.map((outlet) => ({
        id: outlet.oltCode.toString(),
        label: outlet.oltName.trim(),
      }));
      setTabs(formattedTabs);

      // Convert API tables to table data
      const tables: Record<string, Table[]> = {};
      data.forEach((outlet) => {
        tables[outlet.oltCode.toString()] = outlet.tables.map((tbl) => ({
          tableNumber: tbl.tblNo,
          status: "Available", // or add real status if backend has it
        }));
      });
      setTablesData(tables);

      // Set first tab as active by default and store in localStorage
      if (formattedTabs.length > 0) {
        const firstTabId = formattedTabs[0].id;
        setActiveTab(firstTabId);
        localStorage.setItem("activeOltCode", firstTabId); // 🔹 store selected OLT
        window.dispatchEvent(new Event("storage")); // 🔹 trigger ItemContext re-fetch
      }
    } catch (error) {
      console.error("Error fetching outlets and tables:", error);
    }
  };

  const handleTableClick = (table: Table) => {
    navigate("/OrderingBoard", {
      state: {
        tableNumber: table.tableNumber,
        status: table.status,
      },
    });
  };

  // When tab changes
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId); // Update active tab visually
    localStorage.setItem("activeOltCode", tabId); // Store selected OLT for ItemContext
    window.dispatchEvent(new Event("storage")); // trigger ItemContext re-fetch
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
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