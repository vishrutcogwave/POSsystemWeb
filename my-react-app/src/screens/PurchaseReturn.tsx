import React, { useMemo, useState } from "react";
import Header from "../components/Header";

type Store = {
  storeId: number;
  storeName: string;
};

type PurchaseReturnItem = {
  id: number;
  code: string;
  name: string;
  unit: string;
  rate: number;
  qty: number;
  returnQty: number;
  amount: number;
};

const PurchaseReturn: React.FC = () => {
  /* =========================================================
     UI ONLY
     Replace the mock data / handlers with your APIs later.
  ========================================================= */

  const [formData, setFormData] = useState({
    transactionNo: "6",
    date: new Date().toISOString().split("T")[0],
    purchaseNo: "4",
    supplier: "1",
    store: "",
  });

  const [stores] = useState<Store[]>([
    { storeId: 1, storeName: "Main Store" },
    { storeId: 2, storeName: "Medical Store" },
  ]);

  const [items, setItems] = useState<PurchaseReturnItem[]>([
    {
      id: 1,
      code: "2006",
      name: "HONEY BEE",
      unit: "1",
      rate: 1500,
      qty: 1,
      returnQty: 0,
      amount: 0,
    },
  ]);

  const [activeTab, setActiveTab] = useState<"return" | "tax">("return");

  const totalReturnQty = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.returnQty || 0), 0),
    [items]
  );

  const totalAmount = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [items]
  );

  const updateReturnQty = (id: number, value: string) => {
    const returnQty = Math.max(0, Number(value || 0));

    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              returnQty,
              amount: returnQty * Number(item.rate || 0),
            }
          : item
      )
    );
  };



  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const inputClass =
    "h-10 w-full min-w-0 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  const labelClass = "mb-1.5 block text-xs font-semibold text-gray-600";

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-4 sm:px-4 md:px-6">
      <Header />

      <div className="mx-auto w-full max-w-[1600px]">
        {/* PAGE TITLE */}
        <div className="mb-5 mt-2">
          <h1 className="text-2xl font-bold leading-tight text-gray-800">
            Purchase Return
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Enter required detail for purchase return
          </p>
        </div>

        {/* MAIN CARD */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5 md:p-6">
          {/* PURCHASE RETURN HEADER */}
          <section className="overflow-hidden rounded-xl border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3">
              <div>
                <h2 className="text-base font-semibold text-gray-800">
                  Purchase Return
                </h2>

                <p className="mt-0.5 text-xs text-gray-500">
                  Enter purchase return transaction details
                </p>
              </div>
            </div>

            <div className="p-4 md:p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {/* STORE */}
                <div className="min-w-0">
                  <label className={labelClass}>Store Name</label>

                  <select
                    value={formData.store}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        store: e.target.value,
                      }))
                    }
                    className={inputClass}
                  >
                    <option value="">Select Store</option>

                    {stores.map((store) => (
                      <option key={store.storeId} value={store.storeId}>
                        {store.storeName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* TRANSACTION NO */}
                <div className="min-w-0">
                  <label className={labelClass}>Trans No.</label>

                  <input
                    type="text"
                    value={formData.transactionNo}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        transactionNo: e.target.value,
                      }))
                    }
                    className={inputClass}
                  />
                </div>

                {/* DATE */}
                <div className="min-w-0">
                  <label className={labelClass}>Date</label>

                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        date: e.target.value,
                      }))
                    }
                    className={inputClass}
                  />
                </div>

                {/* PURCHASE NO */}
                <div className="min-w-0">
                  <label className={labelClass}>Purchase No.</label>

                  <select
                    value={formData.purchaseNo}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        purchaseNo: e.target.value,
                      }))
                    }
                    className={inputClass}
                  >
                    <option value="">Select Purchase No.</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                  </select>
                </div>

                {/* SUPPLIER */}
                <div className="min-w-0">
                  <label className={labelClass}>Supplier</label>

                  <input
                    type="text"
                    value={formData.supplier}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        supplier: e.target.value,
                      }))
                    }
                    placeholder="Supplier"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ITEM / TAX TABS */}
          <section className="mt-6 overflow-hidden rounded-xl border border-gray-200">
            <div className="flex border-b border-gray-200 bg-gray-50">
              <button
                type="button"
                onClick={() => setActiveTab("return")}
                className={`border-r border-gray-200 px-5 py-3 text-sm font-semibold transition ${
                  activeTab === "return"
                    ? "bg-white text-blue-600"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Purchase Return Detail
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("tax")}
                className={`px-5 py-3 text-sm font-semibold transition ${
                  activeTab === "tax"
                    ? "bg-white text-blue-600"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Tax Detail
              </button>
            </div>

            {activeTab === "return" ? (
              <div className="p-4 md:p-5">
                {/* TABLE */}
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full min-w-[900px] text-sm">
                    <thead className="bg-gray-100">
                      <tr className="border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                          S.No.
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                          Code
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                          Item Name
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                          Unit
                        </th>

                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                          Rate
                        </th>

                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                          Qty
                        </th>

                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                          Return Qty
                        </th>

                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                          Amount
                        </th>

                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {items.length === 0 ? (
                        <tr>
                          <td
                            colSpan={9}
                            className="px-4 py-10 text-center text-sm text-gray-400"
                          >
                            No purchase items available
                          </td>
                        </tr>
                      ) : (
                        items.map((item, index) => (
                          <tr
                            key={item.id}
                            className="border-b border-gray-100 hover:bg-gray-50"
                          >
                            <td className="px-4 py-3 text-gray-700">
                              {index + 1}
                            </td>

                            <td className="px-4 py-3 font-medium text-gray-700">
                              {item.code || "-"}
                            </td>

                            <td className="px-4 py-3 font-medium text-gray-800">
                              {item.name || "-"}
                            </td>

                            <td className="px-4 py-3 text-gray-700">
                              {item.unit || "-"}
                            </td>

                            <td className="px-4 py-3 text-right text-gray-700">
                              {Number(item.rate || 0).toFixed(2)}
                            </td>

                            <td className="px-4 py-3 text-right font-medium text-gray-800">
                              {Number(item.qty || 0).toFixed(2)}
                            </td>

                            <td className="px-4 py-2 text-right">
                              <input
                                type="number"
                                min="0"
                                max={item.qty}
                                step="0.01"
                                value={item.returnQty}
                                onChange={(e) =>
                                  updateReturnQty(item.id, e.target.value)
                                }
                                className="h-9 w-28 rounded-md border border-gray-300 px-2 text-right text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                              />
                            </td>

                            <td className="px-4 py-3 text-right font-semibold text-gray-800">
                              ₹ {Number(item.amount || 0).toFixed(2)}
                            </td>

                            <td className="px-4 py-3 text-center">
                              <button
                                type="button"
                                onClick={() => removeItem(item.id)}
                                className="rounded-md border border-red-200 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
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
            ) : (
              <div className="p-5">
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
                  Tax details will be displayed here.
                  <div className="mt-1 text-xs text-gray-400">
                    API integration can be added later.
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* SUMMARY */}
          <div className="mt-6 flex justify-end">
            <div className="w-full max-w-[430px] rounded-xl border border-gray-200 bg-gray-50 p-5">
              <h3 className="mb-4 border-b border-gray-200 pb-3 text-base font-semibold text-gray-800">
                Return Summary
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-gray-600">Total Quantity</span>

                  <span className="min-w-[120px] text-right font-medium text-gray-800">
                    {totalReturnQty.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-gray-600">Return Amount</span>

                  <span className="min-w-[120px] text-right font-medium text-gray-800">
                    ₹ {totalAmount.toFixed(2)}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-3">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-base font-bold text-gray-800">
                      Grand Total
                    </span>

                    <span className="min-w-[120px] text-right text-lg font-bold text-blue-600">
                      ₹ {totalAmount.toFixed(2)}
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
              onClick={() => window.history.back()}
              className="h-10 rounded-lg border border-gray-300 bg-white px-6 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Back
            </button>

            <button
              type="button"
              onClick={() => alert("UI only - connect Purchase Return API here")}
              className="h-10 rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseReturn;