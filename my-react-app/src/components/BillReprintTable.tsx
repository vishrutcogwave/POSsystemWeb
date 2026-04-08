import { useState, useMemo } from "react";

type Props = {
  title: string;
  data: any[];
  onReprint: (row: any) => void;
};

export default function BillReprintTable({ title, data, onReprint }: Props) {
  const [search, setSearch] = useState("");

  const filteredData = useMemo(() => {
    return data.filter((row) =>
      Object.values(row)
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [data, search]);

  return (
    <div className="p-4">

      {/* TITLE */}
      <h2 className="text-lg font-semibold text-center mb-4">
        {title}
      </h2>

      {/* SEARCH */}
      <div className="flex justify-between mb-3">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded w-48 text-sm"
        />
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto border rounded">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-left">Bill No</th>
              <th className="px-3 py-2 text-left">Date</th>
              <th className="px-3 py-2 text-left">Amount</th>
              <th className="px-3 py-2 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.map((row, index) => (
              <tr key={index} className="border-t hover:bg-gray-50">

                <td className="px-3 py-2">{row.billNo}</td>
                <td className="px-3 py-2">{row.date}</td>
                <td className="px-3 py-2">₹{row.amount}</td>

                <td className="px-3 py-2">
                  <button
                    onClick={() => onReprint(row)}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-xs"
                  >
                    🖨 Reprint
                  </button>
                </td>

              </tr>
            ))}

            {filteredData.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-4 text-gray-500">
                  No data found
                </td>
              </tr>
            )}

          </tbody>
        </table>
      </div>
    </div>
  );
}