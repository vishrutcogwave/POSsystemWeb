const outlets = [
  {
    name: "CAFE VISITOR",
    sales: 18450,
    progress: 82,
    color: "bg-blue-500",
  },
  {
    name: "CAFE STAFF",
    sales: 12680,
    progress: 62,
    color: "bg-green-500",
  },
  {
    name: "ROOM SERVICE",
    sales: 8450,
    progress: 42,
    color: "bg-orange-500",
  },
  {
    name: "DELI VISITOR",
    sales: 4620,
    progress: 24,
    color: "bg-purple-500",
  },
  {
    name: "DELI STAFF",
    sales: 2750,
    progress: 14,
    color: "bg-pink-500",
  },
];

function OutletPerformance() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-gray-800">
          Outlet Performance
        </h3>

        <span className="text-xs text-gray-500">
          Today's Sales
        </span>
      </div>

      <div className="space-y-5">
        {outlets.map((outlet) => (
          <div key={outlet.name}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                {outlet.name}
              </span>

              <span className="font-semibold text-gray-800">
                ₹ {outlet.sales.toLocaleString()}
              </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`${outlet.color} h-3 rounded-full transition-all duration-500`}
                style={{ width: `${outlet.progress}%` }}
              />
            </div>

            <div className="text-right mt-1 text-xs text-gray-500">
              {outlet.progress}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OutletPerformance;