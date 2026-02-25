

import React, { useState } from "react";
import Tabs from "../components/Tabs";
import TableCard from "../components/TableCard";
import { useNavigate } from "react-router-dom";

type Table = {
  tableNumber: string;
  status: "Occupied" | "Available";
  peopleCount?: number;
};

// Generate 50 dummy tables per area
const generateTables = (prefix: string): Table[] => {
  return Array.from({ length: 50 }, (_, index) => {
    const isOccupied = Math.random() > 0.5;
    return {
      tableNumber: `${prefix}${index + 1}`,
      status: isOccupied ? "Occupied" : "Available",
      peopleCount: isOccupied ? Math.floor(Math.random() * 6) + 1 : undefined,
    };
  });
};

const NewOrder: React.FC = () => {
  const [activeTab, setActiveTab] = useState("ac");
const navigate = useNavigate()
 const handleTableClick = (table: Table) => {
  navigate("/OrderingBoard", {
    state: {
      tableNumber: table.tableNumber,
      status: table.status,
    },
  });
};
  const tabs = [
    { id: "ac", label: "AC ROOM" },
    { id: "restaurant", label: "RESTAURANT" },
    { id: "bar", label: "BAR" },
    { id: "garden", label: "GARDEN" },
  ];

  const tablesData: Record<string, Table[]> = {
    ac: generateTables("A"),
    restaurant: generateTables("R"),
    bar: generateTables("B"),
    garden: generateTables("G"),
  };

return (
  <div className="h-[calc(100vh-64px)] flex flex-col">
    
    {/* Tabs - fixed at top */}
    <Tabs
      tabs={tabs}
      activeTab={activeTab}
      onChange={setActiveTab}
    />

    {/* Scrollable Table Cards */}
    <div className="flex-1 overflow-y-auto p-2 sm:p-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4">
        {tablesData[activeTab].map((table) => (
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