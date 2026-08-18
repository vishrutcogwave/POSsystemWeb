
import React, { useState } from "react";
import Header from "../components/Header";

type PurchaseItem = {
  id: number;
  code: string;
  name: string;
  unit: string;
  qty: number;
  rate: number;
  total: number;
};

type MiscRow = {
  id: number;
  name: string;
  amount: number;
};

const PurchaseOrder: React.FC = () => {
  /* ---------------- FORM STATE ---------------- */

  const [orderNo, setOrderNo] = useState(13);

  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [supplier, setSupplier] = useState("");
  const [orderedBy, setOrderedBy] = useState("");
  const [instruction, setInstruction] = useState("");

  const [effectiveFrom, setEffectiveFrom] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [effectiveTo, setEffectiveTo] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [remarks, setRemarks] = useState("");

  /* ---------------- DETAIL INPUT ---------------- */

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const [qty, setQty] = useState("");
  const [rate, setRate] = useState("");

  /* ---------------- TABLE DATA ---------------- */

  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [miscRows, setMiscRows] = useState<MiscRow[]>([]);

  const [activeTab] = useState<"misc">("misc");

  /* ---------------- NEW ENTRY ---------------- */

  const handleNewEntry = () => {
    setOrderNo((prev) => prev + 1);

    const today = new Date().toISOString().split("T")[0];

    setDate(today);
    setSupplier("");
    setOrderedBy("");
    setInstruction("");
    setEffectiveFrom(today);
    setEffectiveTo(today);
    setRemarks("");

    setCode("");
    setName("");
    setUnit("");
    setQty("");
    setRate("");

    setItems([]);
    setMiscRows([]);
  };

  /* ---------------- ADD ITEM ---------------- */

  const handleAddItem = () => {
    if (!code.trim()) return;
    if (!name.trim()) return;
    if (!unit.trim()) return;
    if (!qty || Number(qty) <= 0) return;
    if (!rate || Number(rate) <= 0) return;

    const quantity = Number(qty);
    const itemRate = Number(rate);

    const newItem: PurchaseItem = {
      id: Date.now(),
      code,
      name,
      unit,
      qty: quantity,
      rate: itemRate,
      total: quantity * itemRate,
    };

    setItems((prev) => [...prev, newItem]);

    setCode("");
    setName("");
    setUnit("");
    setQty("");
    setRate("");
  };

  /* ---------------- REMOVE ITEM ---------------- */

  const handleRemoveItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  /* ---------------- TOTALS ---------------- */

  const subTotal = items.reduce(
    (sum, item) => sum + item.total,
    0
  );

  const miscTotal = miscRows.reduce(
    (sum, misc) => sum + Number(misc.amount || 0),
    0
  );

  const grandTotal = subTotal + miscTotal;

  /* ---------------- ADD MISC ---------------- */

  const addMiscRow = () => {
    setMiscRows((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: "",
        amount: 0,
      },
    ]);
  };

  /* ---------------- UPDATE MISC ---------------- */

  const updateMiscRow = (
    id: number,
    field: keyof MiscRow,
    value: string
  ) => {
    setMiscRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              [field]:
                field === "amount"
                  ? Number(value)
                  : value,
            }
          : row
      )
    );
  };

  /* ---------------- REMOVE MISC ---------------- */

  const removeMiscRow = (id: number) => {
    setMiscRows((prev) =>
      prev.filter((row) => row.id !== id)
    );
  };

  /* ---------------- SAVE ---------------- */

  const handleSave = () => {
    const purchaseOrder = {
      orderNo,
      date,
      supplier,
      orderedBy,
      instruction,
      effectiveFrom,
      effectiveTo,
      remarks,
      items,
      miscellaneous: miscRows,
      subTotal,
      miscTotal,
      grandTotal,
    };

    console.log("Purchase Order:", purchaseOrder);

    alert("Purchase Order saved successfully");
  };

  /* ---------------- FORMAT DATE ---------------- */

  const formatDate = (value: string) => {
    if (!value) return "";

    const [year, month, day] = value.split("-");

    return `${day}/${month}/${year}`;
  };

  const inputClass =
    "h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  const labelClass =
    "mb-1.5 block text-xs font-semibold text-gray-600";

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-4 sm:px-4 md:px-6">

      {/* HEADER */}

      <Header />

      <div className="mx-auto w-full max-w-[1600px]">

        {/* PAGE TITLE */}

        <div className="mb-5 mt-2">

          <h1 className="text-2xl font-bold leading-tight text-gray-800">
            Item Purchase Order
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Create and manage purchase orders
          </p>

        </div>

        {/* MAIN CARD */}

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5 md:p-6">

          {/* PURCHASE ORDER INFORMATION */}

          <section className="mb-6 overflow-hidden rounded-xl border border-gray-200">

            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3">

              <div>
                <h2 className="text-base font-semibold text-gray-800">
                  Purchase Order
                </h2>

                <p className="mt-0.5 text-xs text-gray-500">
                  Order information
                </p>
              </div>

              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                New Entry
              </span>

            </div>

            <div className="p-4 md:p-5">

              <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">

                {/* ORDER NO */}

                <div>
                  <label className={labelClass}>
                    Order No.
                  </label>

                  <input
                    type="number"
                    value={orderNo}
                    disabled
                    className={`${inputClass} cursor-not-allowed bg-gray-100`}
                  />
                </div>

                {/* DATE */}

                <div>
                  <label className={labelClass}>
                    Date
                  </label>

                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={inputClass}
                  />

                  <p className="mt-1 text-[11px] text-gray-400">
                    {formatDate(date)}
                  </p>
                </div>

                {/* SUPPLIER */}

                <div>
                  <label className={labelClass}>
                    Supplier
                  </label>

                  <input
                    type="text"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    placeholder="Enter supplier"
                    className={inputClass}
                  />
                </div>

                {/* ORDERED BY */}

                <div>
                  <label className={labelClass}>
                    Ordered By
                  </label>

                  <input
                    type="text"
                    value={orderedBy}
                    onChange={(e) => setOrderedBy(e.target.value)}
                    placeholder="Enter ordered by"
                    className={inputClass}
                  />
                </div>

                {/* EFFECTIVE FROM */}

                <div>
                  <label className={labelClass}>
                    Effective From
                  </label>

                  <input
                    type="date"
                    value={effectiveFrom}
                    onChange={(e) =>
                      setEffectiveFrom(e.target.value)
                    }
                    className={inputClass}
                  />
                </div>

                {/* EFFECTIVE TO */}

                <div>
                  <label className={labelClass}>
                    Effective To
                  </label>

                  <input
                    type="date"
                    value={effectiveTo}
                    onChange={(e) =>
                      setEffectiveTo(e.target.value)
                    }
                    className={inputClass}
                  />
                </div>

                {/* INSTRUCTION */}

                <div className="sm:col-span-2">

                  <label className={labelClass}>
                    Instruction
                  </label>

                  <textarea
                    value={instruction}
                    onChange={(e) =>
                      setInstruction(e.target.value)
                    }
                    rows={2}
                    placeholder="Enter instruction"
                    className="min-h-[80px] w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>

                {/* REMARKS */}

                <div className="sm:col-span-2">

                  <label className={labelClass}>
                    Remarks
                  </label>

                  <textarea
                    value={remarks}
                    onChange={(e) =>
                      setRemarks(e.target.value)
                    }
                    rows={2}
                    placeholder="Enter remarks"
                    className="min-h-[80px] w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>

              </div>

            </div>

          </section>

          {/* ITEM DETAILS */}

          <section className="mb-6 overflow-hidden rounded-xl border border-gray-200">

            <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">

              <h3 className="text-base font-semibold text-gray-800">
                Purchase Order Details
              </h3>

            </div>

            {/* ITEM INPUT */}

            <div className="p-4 md:p-5">

              <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">

                {/* CODE */}

                <div>
                  <label className={labelClass}>
                    Code
                  </label>

                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Item Code"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddItem();
                      }
                    }}
                    className={inputClass}
                  />
                </div>

                {/* NAME */}

                <div>
                  <label className={labelClass}>
                    Name
                  </label>

                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Item Name"
                    className={inputClass}
                  />
                </div>

                {/* UNIT */}

                <div>
                  <label className={labelClass}>
                    Unit
                  </label>

                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">
                      Select Unit
                    </option>
                    <option value="Nos">Nos</option>
                    <option value="Kg">Kg</option>
                    <option value="Ltr">Ltr</option>
                    <option value="Box">Box</option>
                    <option value="Pack">Pack</option>
                  </select>
                </div>

                {/* QTY */}

                <div>
                  <label className={labelClass}>
                    Qty
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    placeholder="Qty"
                    className={`${inputClass} text-right`}
                  />
                </div>

                {/* RATE */}

                <div>
                  <label className={labelClass}>
                    Rate
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    placeholder="Rate"
                    className={`${inputClass} text-right`}
                  />
                </div>

                {/* ADD */}

                <div className="flex items-end">

                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="h-10 w-full rounded-lg bg-green-600 px-4 text-sm font-semibold text-white transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-200"
                  >
                    + Add Item
                  </button>

                </div>

              </div>

            </div>

            {/* ITEM TABLE */}

            <div className="overflow-x-auto border-t border-gray-200">

              <table className="w-full min-w-[850px] text-sm">

                <thead>
                  <tr className="bg-gray-100 text-xs font-semibold uppercase tracking-wide text-gray-600">

                    <th className="px-4 py-3 text-left">
                      Code
                    </th>

                    <th className="px-4 py-3 text-left">
                      Name
                    </th>

                    <th className="px-4 py-3 text-left">
                      Unit
                    </th>

                    <th className="px-4 py-3 text-right">
                      Qty
                    </th>

                    <th className="px-4 py-3 text-right">
                      Rate
                    </th>

                    <th className="px-4 py-3 text-right">
                      Total
                    </th>

                    <th className="px-4 py-3 text-center">
                      Action
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {items.length === 0 ? (

                    <tr>

                      <td
                        colSpan={7}
                        className="px-4 py-10 text-center text-sm text-gray-400"
                      >
                        No items added to this purchase order
                      </td>

                    </tr>

                  ) : (

                    items.map((item) => (

                      <tr
                        key={item.id}
                        className="border-t border-gray-200 hover:bg-gray-50"
                      >

                        <td className="px-4 py-3 text-left">
                          {item.code}
                        </td>

                        <td className="px-4 py-3 text-left font-medium text-gray-800">
                          {item.name}
                        </td>

                        <td className="px-4 py-3 text-left">
                          {item.unit}
                        </td>

                        <td className="px-4 py-3 text-right">
                          {item.qty}
                        </td>

                        <td className="px-4 py-3 text-right">
                          ₹ {item.rate.toFixed(2)}
                        </td>

                        <td className="px-4 py-3 text-right font-semibold">
                          ₹ {item.total.toFixed(2)}
                        </td>

                        <td className="px-4 py-3 text-center">

                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveItem(item.id)
                            }
                            className="rounded-md px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                          >
                            Remove
                          </button>

                        </td>

                      </tr>

                    ))

                  )}

                </tbody>

              </table>

            </div>

          </section>

          {/* MISC */}

          <section className="overflow-hidden rounded-xl border border-gray-200">

            {/* TAB HEADER */}

            <div className="border-b border-gray-200 bg-gray-50">

              <div
                className={`inline-flex border-b-2 border-blue-600 bg-white px-5 py-3 text-sm font-semibold text-blue-600 ${
                  activeTab === "misc" ? "" : "hidden"
                }`}
              >
                Misc
              </div>

            </div>

            <div className="p-4 md:p-5">

              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <h3 className="text-base font-semibold text-gray-800">
                    Miscellaneous Charges
                  </h3>

                  <p className="mt-0.5 text-xs text-gray-500">
                    Add additional purchase charges
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addMiscRow}
                  className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  + Add Misc
                </button>

              </div>

              <div className="overflow-x-auto">

                <table className="w-full min-w-[600px] text-sm">

                  <thead>

                    <tr className="bg-gray-100 text-xs font-semibold uppercase tracking-wide text-gray-600">

                      <th className="px-4 py-3 text-left">
                        Particular
                      </th>

                      <th className="w-[180px] px-4 py-3 text-right">
                        Amount
                      </th>

                      <th className="w-[120px] px-4 py-3 text-center">
                        Action
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {miscRows.length === 0 ? (

                      <tr>

                        <td
                          colSpan={3}
                          className="px-4 py-10 text-center text-sm text-gray-400"
                        >
                          No miscellaneous charges added
                        </td>

                      </tr>

                    ) : (

                      miscRows.map((misc) => (

                        <tr
                          key={misc.id}
                          className="border-t border-gray-200"
                        >

                          <td className="px-4 py-3">

                            <input
                              value={misc.name}
                              onChange={(e) =>
                                updateMiscRow(
                                  misc.id,
                                  "name",
                                  e.target.value
                                )
                              }
                              placeholder="Particular"
                              className={inputClass}
                            />

                          </td>

                          <td className="px-4 py-3">

                            <input
                              type="number"
                              value={misc.amount}
                              onChange={(e) =>
                                updateMiscRow(
                                  misc.id,
                                  "amount",
                                  e.target.value
                                )
                              }
                              className={`${inputClass} text-right`}
                            />

                          </td>

                          <td className="px-4 py-3 text-center">

                            <button
                              type="button"
                              onClick={() =>
                                removeMiscRow(misc.id)
                              }
                              className="rounded-md px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                            >
                              Remove
                            </button>

                          </td>

                        </tr>

                      ))

                    )}

                  </tbody>

                </table>

              </div>

            </div>

          </section>

          {/* SUMMARY */}

          <div className="mt-6 flex justify-end">

            <div className="w-full max-w-[400px] rounded-xl border border-gray-200 bg-gray-50 p-5">

              <h3 className="mb-4 border-b border-gray-200 pb-3 text-base font-semibold text-gray-800">
                Order Summary
              </h3>

              <div className="space-y-3 text-sm">

                <div className="flex items-center justify-between gap-4">
                  <span className="text-gray-600">
                    Sub Total
                  </span>

                  <span className="min-w-[110px] text-right font-medium text-gray-800">
                    ₹ {subTotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-gray-600">
                    Miscellaneous
                  </span>

                  <span className="min-w-[110px] text-right font-medium text-gray-800">
                    ₹ {miscTotal.toFixed(2)}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-3">

                  <div className="flex items-center justify-between gap-4">

                    <span className="text-base font-bold text-gray-800">
                      Grand Total
                    </span>

                    <span className="min-w-[110px] text-right text-lg font-bold text-blue-600">
                      ₹ {grandTotal.toFixed(2)}
                    </span>

                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* ACTION BUTTONS */}

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={handleNewEntry}
              className="h-10 rounded-lg border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="h-10 rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              Save Purchase Order
            </button>

          </div>

        </div>

      </div>

    </div>
  );
};

export default PurchaseOrder;
