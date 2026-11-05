
import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  kotData: any[];
  onConfirm: (payload: any) => void;
  tableNumber?: string;
  subTable?: string;
};

type SplitItem = {
  key: string;
  itemCode: number;
  itemName: string;
  rate: number;
  availableQty: number;
  discount: number;
  sourceDetails: any[];
};

const SplitBillModal: React.FC<Props> = ({
  isOpen,
  onClose,
  kotData = [],
  onConfirm,
  tableNumber,
  subTable,
}) => {
  const [billCountInput, setBillCountInput] = useState("2");
  const [allocations, setAllocations] = useState<
    Record<string, number[]>
  >({});

  // Group identical items from all KOTs.
  const splitItems = useMemo<SplitItem[]>(() => {
    const grouped = new Map<string, SplitItem>();

    kotData.forEach((kot: any) => {
      (kot.kotDetails || []).forEach((detail: any) => {
        const itemCode = Number(detail.itemCode);
        const rate = Number(detail.kotdRate || 0);
        const discount = Number(detail.itemDiscount || 0);

        const key = `${itemCode}_${rate}_${discount}`;
        const qty = Number(detail.kotdQty || 0);

        if (grouped.has(key)) {
          const existing = grouped.get(key)!;
          existing.availableQty += qty;
          existing.sourceDetails.push({
            ...detail,
            kotId: kot.kotId,
            kotNo: kot.kotNo,
          });
        } else {
          grouped.set(key, {
            key,
            itemCode,
            itemName: detail.itemName || "Unknown Item",
            rate,
            availableQty: qty,
            discount,
            sourceDetails: [
              {
                ...detail,
                kotId: kot.kotId,
                kotNo: kot.kotNo,
              },
            ],
          });
        }
      });
    });

    return Array.from(grouped.values());
  }, [kotData]);

  const totalAvailableQty = splitItems.reduce(
    (total, item) => total + item.availableQty,
    0
  );

  const billCount = Number(billCountInput);

  // Reset allocations when popup opens.
  useEffect(() => {
    if (!isOpen) return;

    setBillCountInput("2");

    setAllocations(
      Object.fromEntries(
        splitItems.map((item) => [item.key, [0, 0]])
      )
    );
  }, [isOpen, splitItems]);

  // Resize allocations when bill count changes.
  useEffect(() => {
    if (
      !isOpen ||
      !Number.isInteger(billCount) ||
      billCount < 2 ||
      billCount > totalAvailableQty
    ) {
      return;
    }

    setAllocations((prev) => {
      const updated = { ...prev };

      splitItems.forEach((item) => {
        const current = updated[item.key] || [];

        updated[item.key] = Array.from(
          { length: billCount },
          (_, index) => current[index] || 0
        );
      });

      return updated;
    });
  }, [billCount, isOpen, splitItems, totalAvailableQty]);

  // Change number of bills.
  const updateBillCount = (value: string) => {
    if (!/^\d*$/.test(value)) return;

    if (value === "") {
      setBillCountInput("");
      return;
    }

    const count = Number(value);

    if (count < 2) {
      setBillCountInput(value);
      return;
    }

    if (count > totalAvailableQty) {
      toast.error(
        `Maximum ${totalAvailableQty} bills allowed based on available quantity`
      );
      return;
    }

    setBillCountInput(value);
  };

  // Update quantity for a particular item and bill.
  const updateQuantity = (
    item: SplitItem,
    billIndex: number,
    value: string
  ) => {
    if (!/^\d*$/.test(value)) return;

    const newQty = Number(value || 0);
    const current = allocations[item.key] || [];

    const allocatedInOtherBills = current.reduce(
      (total, qty, index) =>
        index === billIndex ? total : total + qty,
      0
    );

    const remainingQty =
      item.availableQty - allocatedInOtherBills;

    if (newQty > remainingQty) {
      toast.error(
        `Only ${remainingQty} quantity available for ${item.itemName}`
      );
      return;
    }

    setAllocations((prev) => {
      const updated = [...(prev[item.key] || [])];
      updated[billIndex] = newQty;

      return {
        ...prev,
        [item.key]: updated,
      };
    });
  };

  // Total allocated quantity for an item.
  const getAllocatedQty = (item: SplitItem) => {
    return (allocations[item.key] || []).reduce(
      (total, qty) => total + qty,
      0
    );
  };

  const getRemainingQty = (item: SplitItem) => {
    return item.availableQty - getAllocatedQty(item);
  };

  // Total quantity assigned to a particular bill.
  const getBillQty = (billIndex: number) => {
    return splitItems.reduce(
      (total, item) =>
        total + (allocations[item.key]?.[billIndex] || 0),
      0
    );
  };

  // Calculate bill amount.
  const getBillTotal = (billIndex: number) => {
    return splitItems.reduce((total, item) => {
      const qty = allocations[item.key]?.[billIndex] || 0;
      return total + qty * item.rate;
    }, 0);
  };

  // Every item's full quantity must be allocated.
  const allItemsFullyAllocated = splitItems.every(
    (item) => getAllocatedQty(item) === item.availableQty
  );

  // Every bill must contain at least one quantity.
  const allBillsHaveItems =
    Number.isInteger(billCount) &&
    billCount >= 2 &&
    Array.from(
      { length: billCount },
      (_, index) => getBillQty(index)
    ).every((qty) => qty >= 1);

  const validBillCount =
    billCountInput !== "" &&
    Number.isInteger(billCount) &&
    billCount >= 2 &&
    billCount <= totalAvailableQty;

  const canConfirm =
    splitItems.length > 0 &&
    validBillCount &&
    allItemsFullyAllocated &&
    allBillsHaveItems;

  const handleConfirm = () => {
    if (!validBillCount) {
      toast.error("Minimum 2 bills are required");
      return;
    }

    const emptyBills = Array.from(
      { length: billCount },
      (_, index) => index + 1
    ).filter((billNo) => getBillQty(billNo - 1) < 1);

    if (emptyBills.length > 0) {
      toast.error(
        `Bill ${emptyBills.join(", Bill ")} must contain at least 1 quantity`
      );
      return;
    }

    if (!allItemsFullyAllocated) {
      toast.error(
        "Please allocate the complete quantity of every item"
      );
      return;
    }

    const payload = {
      tableNumber,
      subTable,
      billCount,
      bills: Array.from(
        { length: billCount },
        (_, billIndex) => ({
          billNo: billIndex + 1,
          total: getBillTotal(billIndex),
          totalQty: getBillQty(billIndex),
          items: splitItems
            .map((item) => {
              const qty =
                allocations[item.key]?.[billIndex] || 0;

              if (qty <= 0) return null;

              return {
                itemCode: item.itemCode,
                itemName: item.itemName,
                rate: item.rate,
                quantity: qty,
                discount: item.discount,
                sourceDetails: item.sourceDetails,
              };
            })
            .filter(Boolean),
        })
      ),
    };

    console.log("Split Bill Allocation:", payload);
    onConfirm(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-5xl max-h-[95vh] bg-white rounded-xl shadow-xl flex flex-col overflow-hidden">

        {/* HEADER */}
        <div className="bg-[#0576B2] text-white px-4 py-3 flex justify-between items-center">
          <div>
            <h2 className="font-semibold text-lg">
              Split Bill
            </h2>
            <p className="text-xs text-blue-100">
              Table: {tableNumber || "-"} | Sub Table: {subTable || "-"}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-2xl hover:text-gray-200"
          >
            ×
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-5">

          {/* BILL COUNT */}
          <div className="border rounded-lg p-3 bg-gray-50">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Number of Bills
            </label>

            <input
              type="number"
              min={2}
              max={totalAvailableQty}
              step={1}
              value={billCountInput}
              onChange={(e) => updateBillCount(e.target.value)}
              placeholder="Enter number of bills"
              className="w-full sm:w-64 border rounded-lg px-3 py-3 text-center text-lg font-semibold outline-none focus:ring-2 focus:ring-[#0576B2]"
            />

            <div className="flex flex-wrap justify-between gap-2 mt-2 text-xs text-gray-500">
              <span>
                Total available quantity: {totalAvailableQty}
              </span>
              <span>
                Minimum bills: 2
              </span>
            </div>

            {billCountInput !== "" && billCount < 2 && (
              <p className="text-xs text-red-600 mt-2">
                Minimum 2 bills are required.
              </p>
            )}

            {billCount > totalAvailableQty && (
              <p className="text-xs text-red-600 mt-2">
                Number of bills cannot exceed available total quantity.
              </p>
            )}
          </div>

          {/* EMPTY STATE */}
          {splitItems.length === 0 ? (
            <div className="text-center text-gray-500 py-10">
              No KOT items available for splitting.
            </div>
          ) : validBillCount ? (
            <>
              {/* ITEM ALLOCATION */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-700">
                  Allocate Item Quantities
                </h3>

                <div className="overflow-x-auto border rounded-lg">
                  <table className="w-full min-w-[600px] text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="text-left p-3 min-w-[180px]">
                          Item
                        </th>

                        <th className="text-center p-3">
                          Available
                        </th>

                        {Array.from(
                          { length: billCount },
                          (_, index) => (
                            <th
                              key={index}
                              className="text-center p-3 min-w-[105px]"
                            >
                              Bill {index + 1}
                            </th>
                          )
                        )}

                        <th className="text-center p-3">
                          Remaining
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {splitItems.map((item) => (
                        <tr
                          key={item.key}
                          className="border-t hover:bg-gray-50"
                        >
                          <td className="p-3">
                            <div className="font-semibold text-gray-800">
                              {item.itemName}
                            </div>
                            <div className="text-xs text-gray-500">
                              Code: {item.itemCode}
                            </div>
                            <div className="text-xs text-gray-500">
                              ₹{item.rate.toFixed(2)}
                            </div>
                          </td>

                          <td className="text-center p-3 font-semibold">
                            {item.availableQty}
                          </td>

                          {Array.from(
                            { length: billCount },
                            (_, index) => (
                              <td
                                key={index}
                                className="p-2 text-center"
                              >
                                <input
                                  type="number"
                                  min={0}
                                  step={1}
                                  value={
                                    allocations[item.key]?.[index] ?? 0
                                  }
                                  onChange={(e) =>
                                    updateQuantity(
                                      item,
                                      index,
                                      e.target.value
                                    )
                                  }
                                  className="w-16 border rounded-md px-2 py-2 text-center outline-none focus:border-[#0576B2]"
                                />
                              </td>
                            )
                          )}

                          <td className="text-center p-3">
                            <span
                              className={`font-semibold ${
                                getRemainingQty(item) === 0
                                  ? "text-green-600"
                                  : "text-orange-600"
                              }`}
                            >
                              {getRemainingQty(item)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* BILL SUMMARY */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-700">
                  Bill Summary
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Array.from(
                    { length: billCount },
                    (_, index) => {
                      const billQty = getBillQty(index);
                      const isEmpty = billQty < 1;

                      return (
                        <div
                          key={index}
                          className={`border rounded-lg p-3 ${
                            isEmpty
                              ? "border-red-300 bg-red-50"
                              : "border-gray-200 bg-white"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div className="text-sm font-semibold text-gray-700">
                              Bill {index + 1}
                            </div>

                            {isEmpty ? (
                              <span className="text-xs text-red-600 font-semibold">
                                Empty
                              </span>
                            ) : (
                              <span className="text-xs text-green-600 font-semibold">
                                Assigned
                              </span>
                            )}
                          </div>

                          <div className="text-xl font-bold text-[#0576B2] mt-1">
                            ₹{getBillTotal(index).toFixed(2)}
                          </div>

                          <div className="text-xs text-gray-500 mt-1">
                            {billQty} total quantity
                          </div>

                          {isEmpty && (
                            <p className="text-xs text-red-600 mt-2">
                              Assign at least 1 quantity to this bill.
                            </p>
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              {/* ALLOCATION STATUS */}
              <div
                className={`rounded-lg border p-3 ${
                  canConfirm
                    ? "bg-green-50 border-green-200"
                    : "bg-orange-50 border-orange-200"
                }`}
              >
                <div className="flex justify-between items-center gap-2">
                  <span className="font-semibold text-sm">
                    Quantity Allocation
                  </span>

                  <span
                    className={`text-sm font-bold ${
                      canConfirm
                        ? "text-green-700"
                        : "text-orange-700"
                    }`}
                  >
                    {canConfirm ? "Completed" : "Pending"}
                  </span>
                </div>

                <p className="text-xs mt-1 text-gray-600">
                  {splitItems.reduce(
                    (total, item) => total + getAllocatedQty(item),
                    0
                  )}{" "}
                  / {totalAvailableQty} quantities allocated.
                </p>

                {!allBillsHaveItems && (
                  <p className="text-xs text-red-600 mt-2">
                    Every bill must contain at least 1 quantity.
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500 py-8">
              Enter at least 2 valid bills to allocate items.
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="border-t p-3 flex flex-col sm:flex-row gap-2 sm:justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto border px-5 py-2 rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="w-full sm:w-auto bg-[#0576B2] hover:bg-blue-700 text-white px-5 py-2 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Confirm Split
          </button>
        </div>
      </div>
    </div>
  );
};

export default SplitBillModal;
