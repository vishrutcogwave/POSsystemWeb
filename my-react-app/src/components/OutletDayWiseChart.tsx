import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface Props {
  data: any[];
}

function OutletDayWiseChart({ data }: Props) {
  // Group by Date and Outlet
  const grouped = data.reduce((acc: any, item: any) => {
    const date = item.date;
    const outlet = item.oltName;
    const amount = Number(item.grand) || 0;

    if (!acc[date]) {
      acc[date] = {
        date,
      };
    }

    acc[date][outlet] = (acc[date][outlet] || 0) + amount;

    return acc;
  }, {});

  const chartData = Object.values(grouped);

  // Dynamic outlet names
  const outletNames = [
    ...new Set(data.map((item) => item.oltName)),
  ];

  const colors = [
    "#3B82F6",
    "#22C55E",
    "#F97316",
    "#A855F7",
    "#EF4444",
    "#14B8A6",
  ];

  return (
    <div className="bg-white rounded-xl border shadow-sm p-5 h-[420px]">
      <h3 className="text-sm font-semibold mb-4">
        Outlet Wise Day Collection
      </h3>

      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
          />

          <YAxis
            tickFormatter={(v) => `₹${v}`}
          />

          <Tooltip
            formatter={(value: any) => [
              `₹${Number(value).toLocaleString()}`,
              "Collection",
            ]}
          />

          <Legend />

          {outletNames.map((outlet, index) => (
            <Bar
              key={outlet}
              dataKey={outlet}
              fill={colors[index % colors.length]}
              radius={[5, 5, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default OutletDayWiseChart;