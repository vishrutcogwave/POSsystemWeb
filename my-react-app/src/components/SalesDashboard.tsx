import {
  DollarSign,
  Receipt,
  TrendingUp,
  Wallet,
} from "lucide-react";

import DashboardCard from "./DashboardCard";
import PaymentCard from "./PaymentCard";
import HourlySalesChart from "./HourlySalesChart";
import PaymentPieChart from "./PaymentPieChart";
import OutletPerformance from "./OutletPerformance";

const cards = [
  {
    title: "Today Sales",
    amount: "₹ 32,772.00",
  },
  {
    title: "This Month Sales",
    amount: "₹ 1,84,220.00",
  },
  {
    title: "This Year Sales",
    amount: "₹ 22,78,650.00",
  },
];

function SalesDashboard() {
  return (
    <div className="space-y-6 p-2 md:p-5">

      {/* Header */}
      <div className="border-b pb-3">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">
          Sales Dashboard
        </h1>
      </div>

      {/* Today / Month / Year Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-blue-400 text-white shadow-md px-5 py-4 h-[95px]"
          >
            <div className="absolute -right-5 -bottom-5 w-20 h-20 rounded-full bg-white/10"></div>
            <div className="absolute right-8 bottom-0 w-10 h-10 rounded-full bg-white/10"></div>

            <p className="text-xs font-medium text-white/90">
              {card.title}
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              {card.amount}
            </h2>
          </div>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <DashboardCard
          title="Total Revenue"
          value="₹ 32,772.00"
          icon={<DollarSign className="text-blue-600" size={22} />}
          iconBg="bg-blue-100"
          borderColor="border-blue-200"
        />

        <DashboardCard
          title="Total Bills"
          value="144"
          icon={<Receipt className="text-gray-700" size={22} />}
          iconBg="bg-gray-100"
        />

        <DashboardCard
          title="Total Customers"
          value="170"
          icon={<TrendingUp className="text-green-600" size={22} />}
          iconBg="bg-green-100"
          borderColor="border-green-200"
        />

        <DashboardCard
          title="Tax Collected"
          value="₹ 1,564.58"
          icon={<Wallet className="text-orange-500" size={22} />}
          iconBg="bg-orange-100"
          borderColor="border-orange-200"
        />
      </div>

      {/* Payment Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <PaymentCard title="Cash" value="₹ 5,339" valueColor="text-green-600" />
        <PaymentCard title="UPI" value="₹ 26,483" valueColor="text-blue-600" />
        <PaymentCard title="Card" value="₹ 920" valueColor="text-purple-600" />
        <PaymentCard title="Cancelled" value="1" valueColor="text-red-600" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <HourlySalesChart />
        <PaymentPieChart />
      </div>

      {/* Outlet Performance */}
      <OutletPerformance />

    </div>
  );
}

export default SalesDashboard;