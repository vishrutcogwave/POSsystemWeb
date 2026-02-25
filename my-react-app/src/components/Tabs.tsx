import React from "react";

type Tab = {
  id: string;
  label: string;
};

type TabsProps = {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
};

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="w-full bg-white border-b shadow-sm">
      <div className="flex overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`
                flex-1 min-w-[120px] px-4 py-3 text-sm font-medium tracking-wide
                transition-all duration-200
                ${
                  isActive
                    ? "text-[#026388] border-b-2 border-[#026388] bg-[#026388]/10"
                    : "text-gray-500 hover:text-[#026388] hover:bg-[#026388]/10"
                }
              `}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Tabs;