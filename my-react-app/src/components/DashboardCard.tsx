import React from "react";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg?: string;
  borderColor?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon,
  iconBg = "bg-blue-100",
  borderColor = "border-gray-200",
}) => {
  return (
    <div
      className={`bg-white border ${borderColor} rounded-xl shadow-sm p-4 flex items-center justify-between hover:shadow-md transition-all duration-300`}
    >
      {/* Left */}
      <div>
        <p className="text-xs text-gray-500 font-medium">{title}</p>

        <h2 className="mt-2 text-3xl font-bold text-gray-800">
          {value}
        </h2>
      </div>

      {/* Right Icon */}
      <div
        className={`w-12 h-12 rounded-lg ${iconBg} flex items-center justify-center`}
      >
        {icon}
      </div>
    </div>
  );
};

export default DashboardCard;