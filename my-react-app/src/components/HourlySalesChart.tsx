import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const data = [
  { time: "11:00", sales: 0 },
  { time: "12:00", sales: 12000 },
  { time: "13:00", sales: 13800 },
  { time: "14:00", sales: 6800 },
  { time: "15:00", sales: 2500 },
];

function HourlySalesChart() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 h-[320px]">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">
        Hourly Sales Trend
      </h3>

      <ResponsiveContainer width="100%" height="90%">
        <BarChart
          data={data}
          margin={{
            top: 10,
            right: 20,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
          />

          <XAxis
            dataKey="time"
            tick={{ fontSize: 12 }}
          />

          <YAxis
            tickFormatter={(value) => `₹${value / 1000}k`}
            tick={{ fontSize: 12 }}
          />

    <Tooltip
  formatter={(value) => {
    const amount = Number(value ?? 0);
    return [`₹ ${amount.toLocaleString()}`, "Sales"];
  }}
/>
          <Bar
            dataKey="sales"
            fill="#2563EB"
            radius={[6, 6, 0, 0]}
            barSize={55}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default HourlySalesChart;