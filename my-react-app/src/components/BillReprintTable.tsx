import { useMemo, useState } from "react";

type Props = {
  title: string;
  data: any[];
  outlets: { id: string; label: string }[]; // ✅ ADD THIS

  fromDate: string;
  toDate: string;
  outlet: string;

  setFromDate: (v: string) => void;
  setToDate: (v: string) => void;
  setOutlet: (v: string) => void;

  onReprint: (row: any) => void;
};

export default function BillReprintAdvancedTable({
  title,
  data,
  fromDate,
  toDate,
  outlet,
  setFromDate,
  setToDate,
  setOutlet,
  outlets,
  onReprint,
}: Props) {
  const [search, setSearch] = useState("");

const filteredData = useMemo(() => {
  return data.filter((row) => {
    const rowDate = row.kbsValidDate?.split("T")[0];

    const textMatch = Object.values(row)
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase());

    const outletMatch = row.oltCode === outlet;

    const dateMatch =
      (!fromDate || rowDate >= fromDate) &&
      (!toDate || rowDate <= toDate);

    return textMatch && outletMatch && dateMatch;
  });
}, [data, search, outlet, fromDate, toDate]);

  return (
    <div className="p-4">
      {/* TITLE */}
      <h2 className="text-lg font-semibold text-center mb-4">{title}</h2>

      {/* FILTER BAR */}
      <div className="flex flex-wrap gap-3 mb-4 items-end">
        <div>
          <label className="text-sm">From Date</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border px-2 py-1 rounded"
          />
        </div>

        <div>
          <label className="text-sm">To Date</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border px-2 py-1 rounded"
          />
        </div>
      <select
  value={outlet}
  onChange={(e) => setOutlet(e.target.value)}
  className="border px-2 py-1 rounded"
>
  {outlets.map((o) => (
    <option key={o.id} value={o.id}>
      {o.label}
    </option>
  ))}
</select>

        {/* SEARCH */}
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded text-sm"
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
              <th className="px-3 py-2 text-left">Payment</th>
              <th className="px-3 py-2 text-left">Discount</th>
              <th className="px-3 py-2 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.map((row, i) => (
              <tr key={i} className="border-t hover:bg-gray-50">
                <td className="px-3 py-2">{row.ksmBillNo}</td>

                <td className="px-3 py-2">{row.kbsValidDate?.split("T")[0]}</td>

                <td className="px-3 py-2">₹{row.ksmBillAmount}</td>

                <td className="px-3 py-2">{row.kbsPaymentMode}</td>

                <td className="px-3 py-2">{row.kbsDiscount}</td>

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
                <td colSpan={6} className="text-center py-4 text-gray-500">
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
