import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface HourlySalesChartProps {
  data: any[];
}

function HourlySalesChart({ data }: HourlySalesChartProps) {
  // Group sales by Date
  const dateWiseData = data.reduce(
    (acc: Record<string, number>, item) => {
      if (!item.date) return acc;

      acc[item.date] = (acc[item.date] || 0) + Number(item.grand || 0);

      return acc;
    },
    {}
  );

  const chartData = Object.entries(dateWiseData)
    .sort(([a], [b]) => {
      const [da, ma, ya] = a.split("/");
      const [db, mb, yb] = b.split("/");

      return (
        new Date(`${ya}-${ma}-${da}`).getTime() -
        new Date(`${yb}-${mb}-${db}`).getTime()
      );
    })
    .map(([date, sales]) => ({
      date,
      sales,
    }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 h-[320px]">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">
        Date Wise Sales Report
      </h3>

      <ResponsiveContainer width="100%" height="90%">
        <BarChart
          data={chartData}
          margin={{
            top: 10,
            right: 20,
            left: 0,
            bottom: 10,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />

          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
          />

          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `₹${Number(value).toLocaleString()}`}
          />

          <Tooltip
            formatter={(value) => [
              `₹ ${Number(value).toLocaleString()}`,
              "Sales",
            ]}
          />

          <Bar
            dataKey="sales"
            fill="#2563EB"
            radius={[6, 6, 0, 0]}
            barSize={50}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default HourlySalesChart;