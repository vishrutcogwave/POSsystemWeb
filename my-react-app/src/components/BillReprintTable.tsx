import { useMemo, useState } from "react";

type Props = {
  title: string;
  data: any[];
  outlets: { id: string; label: string }[];

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

  // ==========================================
  // SEARCH ONLY
  // Date + outlet are already handled by API
  // ==========================================
  const filteredData = useMemo(() => {
    if (!Array.isArray(data)) {
      return [];
    }

    if (!search.trim()) {
      return data;
    }

    const searchValue = search.toLowerCase().trim();

    return data.filter((row) =>
      Object.values(row)
        .join(" ")
        .toLowerCase()
        .includes(searchValue)
    );
  }, [data, search]);

  return (
    <div className="p-4">

      {/* TITLE */}
      <h2 className="text-lg font-semibold text-center mb-4">
        {title}
      </h2>

      {/* FILTER BAR */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">

        {/* LEFT SIDE */}
        <div className="flex flex-wrap items-center gap-3">

          {/* FROM DATE */}
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="h-9 border rounded px-3 text-sm w-[140px]"
          />

          {/* TO DATE */}
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="h-9 border rounded px-3 text-sm w-[140px]"
          />

          {/* OUTLET */}
          <select
            value={outlet}
            onChange={(e) => setOutlet(e.target.value)}
            className="h-9 border rounded px-3 text-sm min-w-[200px]"
          >
            {outlets.map((o) => (
              <option
                key={o.id}
                value={o.id}
              >
                {o.label}
              </option>
            ))}
          </select>

        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-2">

          {/* SEARCH */}
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 border rounded px-3 text-sm w-[220px]"
          />

        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto border rounded">
        <table className="w-full text-sm">

          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-left">
                Bill No
              </th>

              <th className="px-3 py-2 text-left">
                Date
              </th>

              <th className="px-3 py-2 text-left">
                Amount
              </th>

              <th className="px-3 py-2 text-left">
                Payment
              </th>

              <th className="px-3 py-2 text-left">
                Discount
              </th>

              <th className="px-3 py-2 text-left">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredData.map((row, i) => (
              <tr
                key={row.kbsId || i}
                className="border-t hover:bg-gray-50"
              >

                {/* BILL NO */}
                <td className="px-3 py-2">
                  {row.ksmBillNo}
                </td>

                {/* DATE */}
                <td className="px-3 py-2">
                  {row.kbsSetteleDate?.split("T")[0]}
                </td>

                {/* AMOUNT */}
                <td className="px-3 py-2">
                  ₹{row.ksmBillAmount}
                </td>

                {/* PAYMENT */}
                <td className="px-3 py-2">
                  {row.kbsPaymentMode}
                </td>

                {/* DISCOUNT */}
                <td className="px-3 py-2">
                  {row.kbsDiscount}
                </td>

                {/* ACTION */}
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

            {/* NO DATA */}
            {filteredData.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-4 text-gray-500"
                >
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