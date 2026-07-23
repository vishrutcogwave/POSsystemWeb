import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

interface PaymentPieChartProps {
  data: {
    name: string;
    value: number;
    color: string;
  }[];
}

function PaymentPieChart({ data }: PaymentPieChartProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 h-[350px]">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Payment Methods
      </h3>

      <ResponsiveContainer width="100%" height="90%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="42%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={3}
            label={({ percent }) =>
              `${((percent ?? 0) * 100).toFixed(0)}%`
            }
          >
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={entry.color}
              />
            ))}
          </Pie>

          <Tooltip
            formatter={(value) => {
              const amount = Number(value ?? 0);
              return [`₹ ${amount.toLocaleString()}`, "Amount"];
            }}
          />

          <Legend
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            wrapperStyle={{
              fontSize: "13px",
              paddingTop: "15px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default PaymentPieChart;