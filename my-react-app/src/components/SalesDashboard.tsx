import { useEffect, useState } from "react";
import {
  IndianRupeeIcon,
  ReceiptText,
  Users,
  Wallet,
} from "lucide-react";

import DashboardCard from "./DashboardCard";
import PaymentCard from "./PaymentCard";
import HourlySalesChart from "./HourlySalesChart";
import PaymentPieChart from "./PaymentPieChart";
import OutletPerformance from "./OutletPerformance";
import { getChanceSheetReport, getNCKOTReport } from "../api/services/products.service";
import { useAppContext } from "../context/AppContext";
import Loader from "./Loader";
import NCKOTDepartmentChart from "./NCKOTDepartmentChart";

const cards = [
  {
    title: "Today Sales",
    amount: "₹ 0",
  },
  {
    title: "This Month Sales",
    amount: "₹ 0",
  },
  {
    title: "This Year Sales",
    amount: "₹ 0",
  },
];

function SalesDashboard() {
const [dashboardData, setDashboardData] = useState<any[]>([]);
const [remarksSummary, setRemarksSummary] = useState<any[]>([]);
const [loading, setLoading] = useState(false);
const today = new Date().toISOString().split("T")[0];
const [ncKotData, setNcKotData] = useState<any[]>([]);
const [fromDate, setFromDate] = useState(today);
const [toDate, setToDate] = useState(today);
const {appData} = useAppContext();
  useEffect(() => {
    loadDashboard();
  }, [fromDate, toDate]);

const loadDashboard = async () => {
  try {
    setLoading(true);

  const [dashboardResponse, ncKotResponse] = await Promise.all([
  getChanceSheetReport(
    fromDate,
    toDate,
    "All",
    appData?.user?.branch_code
  ),
  getNCKOTReport(
    fromDate,
    toDate,
    "All"
  ),
]);

    setDashboardData(dashboardResponse.data || []);
    setRemarksSummary(dashboardResponse.remarksSummary || []);
    setNcKotData(ncKotResponse || []);
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};
  // ================= KPI =================

  const totalRevenue = dashboardData.reduce(
    (sum, item) => sum + Number(item.grand || 0),
    0
  );

  const totalBills = dashboardData.filter(
    (item) => Number(item.grand) > 0
  ).length;

  const taxCollected = dashboardData.reduce(
    (sum, item) => sum + Number(item.tax || 0),
    0
  );

  const totalCustomers = totalBills;

  

const pieColors = [
  "#16A34A",
  "#2563EB",
  "#9333EA",
  "#F97316",
  "#DC2626",
  "#14B8A6",
  "#EAB308",
  "#EC4899",
  "#6366F1",
  "#0EA5E9",
];

const paymentPieData = remarksSummary.map(
  (item: any, index: number) => ({
    name: item.particulars,
    value: Number(item.amount),
    color: pieColors[index % pieColors.length],
  })
);
  // ================= Outlet Performance =================

  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-orange-500",
    "bg-purple-500",
    "bg-pink-500",
  ];

  const outletMap = dashboardData.reduce(
    (acc: Record<string, number>, item) => {
      acc[item.oltName] = (acc[item.oltName] || 0) + Number(item.grand || 0);
      return acc;
    },
    {}
  );

  const maxSale = Math.max(...Object.values(outletMap), 1);

  const outletData = Object.entries(outletMap).map(
    ([name, sales], index) => ({
      name,
      sales: sales as number,
      progress: Math.round(((sales as number) / maxSale) * 100),
      color: colors[index % colors.length],
    })
  );
return (
  <div className="space-y-6 p-2 md:p-5">
      {loading && <Loader />}

    {/* Header */}
    <div className="border-b pb-3">
      <h1 className="text-xl md:text-2xl font-bold text-gray-800">
        Sales Dashboard
      </h1>
    </div>

    {/* Date Filters */}
    <div className="bg-white border rounded-xl shadow-sm p-4">
      <div className="flex flex-col sm:flex-row gap-4">

       <div>
  <label className="block text-sm font-medium text-gray-600 mb-1">
    From Date
  </label>
  <input
    type="date"
    value={fromDate}
    max={toDate}
    onChange={(e) => setFromDate(e.target.value)}
    className="border rounded-lg px-3 py-2 w-full md:w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
</div>

<div>
  <label className="block text-sm font-medium text-gray-600 mb-1">
    To Date
  </label>
  <input
    type="date"
    value={toDate}
    min={fromDate}
    max={today}
    onChange={(e) => setToDate(e.target.value)}
    className="border rounded-lg px-3 py-2 w-full md:w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
</div>

      </div>
    </div>

    {/* Dummy Cards */}
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

    {/* KPI */}
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <DashboardCard
        title="Total Revenue"
        value={`₹ ${totalRevenue.toLocaleString()}`}
    icon={<IndianRupeeIcon className="text-blue-600" size={22} />}
        iconBg="bg-blue-100"
        borderColor="border-blue-200"
      />

      <DashboardCard
        title="Total Bills"
        value={totalBills.toString()}
         icon={<ReceiptText className="text-gray-700" size={22} />}
        iconBg="bg-gray-100"
      />

      <DashboardCard
        title="Total Customers"
        value={totalCustomers.toString()}
         icon={<Users className="text-green-600" size={22} />}
        iconBg="bg-green-100"
        borderColor="border-green-200"
      />

      <DashboardCard
        title="Tax Collected"
        value={`₹ ${taxCollected.toLocaleString()}`}
        icon={<Wallet className="text-orange-500" size={22} />}
        iconBg="bg-orange-100"
        borderColor="border-orange-200"
      />
    </div>

    {/* Payments */}
    <h2 className="text-lg font-semibold text-gray-800 mb-3">
  Collection Summary
</h2>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {remarksSummary.map((item: any, index: number) => {
        const valueColors = [
          "text-green-600",
          "text-blue-600",
          "text-purple-600",
          "text-orange-600",
          "text-red-600",
          "text-cyan-600",
          "text-pink-600",
          "text-indigo-600",
          "text-amber-600",
          "text-teal-600",
        ];

        return (
          <PaymentCard
            key={item.particulars}
            title={item.particulars}
            value={`₹ ${Number(item.amount).toLocaleString()}`}
            valueColor={valueColors[index % valueColors.length]}
          />
        );
      })}
    </div>

    {/* Charts */}
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
      <HourlySalesChart data={dashboardData} />
      <PaymentPieChart data={paymentPieData} />
    </div>
    <div className="mt-6">
      <NCKOTDepartmentChart data={ncKotData} />
    </div>
    {/* Outlet Performance */}
    <OutletPerformance data={outletData} />

   

  </div>
);
}

export default SalesDashboard;