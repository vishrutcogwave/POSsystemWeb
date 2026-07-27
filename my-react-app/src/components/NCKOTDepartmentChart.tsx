import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface Props {
  data: any[];
}

function NCKOTDepartmentChart({ data }: Props) {
    console.log("NCdataaaaaa",data);
    
  // Department Wise Total
const departmentMap = data.reduce(
  (acc: Record<string, number>, item) => {
    const dept = (item.ncDepName ?? "Unknown").trim();
    const amount = parseFloat(item.kotTotal) || 0;

    acc[dept] = (acc[dept] || 0) + amount;

    return acc;
  },
  {}
);

const chartData = Object.keys(departmentMap).map((dept) => ({
  department: dept,
  amount: Number(departmentMap[dept].toFixed(2)),
}));

console.log(chartData);
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 h-[350px]">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">
        NC Department Wise Collection
      </h3>

      <ResponsiveContainer width="100%" height="90%">
        <BarChart
          data={chartData}
          margin={{
            top: 10,
            right: 20,
            left: 20,
            bottom: 60,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />

          <XAxis
            dataKey="department"
            angle={-25}
            textAnchor="end"
            interval={0}
            height={70}
            tick={{ fontSize: 11 }}
          />

          <YAxis
            tickFormatter={(value) => `₹${Number(value).toLocaleString()}`}
          />

          <Tooltip
            formatter={(value) => [
              `₹ ${Number(value).toLocaleString()}`,
              "Amount",
            ]}
          />

          <Bar
            dataKey="amount"
            fill="#16A34A"
            radius={[6, 6, 0, 0]}
            barSize={45}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default NCKOTDepartmentChart;