import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import {
  getPurchaseOrderReturnNumber,
  getItemPurchaseOrderList,
  savePurchaseReturnOrder,
} from "../api/services/products.service";

type PurchaseNumber = {
  pNo: string;
  purchaseType: string;
};

type PurchaseReturnTax = {
  pno: number;
  itemCode: number;
  taxCode: number;
  taxPer: number;
  taxAmount: number;
  branch_Code: string;
  itemName: string;
  taxDescription: string;
  taxPercentage: string;
};

type PurchaseReturnMiscellaneous = {
  chargeId: number;
  chargeAmt: number;
  pno: number;
  branch_Code: string;
  taxCode: number;
  taxDescription: string;
  taxPercentage: string;
  chargeName: string;
};

type PurchaseReturnItem = {
  id: number;
  code: string;
  name: string;
  unit: string;
  unitCode: number;
  mainUnit: string;
  mainUnitConverstion: string;
  rate: number;
  qty: number;
  returnQty: number;
  amount: number;
};

const PurchaseReturn: React.FC = () => {
  const [formData, setFormData] = useState({
    transactionNo: "6",
    date: new Date().toISOString().split("T")[0],
    purchaseNo: "",
    supplier: "",
    store: "",
  });

  const [purchaseNumbers, setPurchaseNumbers] =
    useState<PurchaseNumber[]>([]);

  const [items, setItems] =
    useState<PurchaseReturnItem[]>([]);

  const [activeTab, setActiveTab] =
    useState<"return" | "tax">("return");

  const [loadingPurchase, setLoadingPurchase] =
    useState(false);

  const [saving, setSaving] = useState(false);

  const [selectedPurchaseData, setSelectedPurchaseData] =
    useState<any>(null);

  const branchCode = "deroy";

  /* =========================================================
     GET PURCHASE RETURN NUMBERS
  ========================================================= */

  useEffect(() => {
    const fetchPurchaseNumbers = async () => {
      try {
        const response =
          await getPurchaseOrderReturnNumber(
            branchCode,
          );

        if (
          response?.success &&
          Array.isArray(response?.data)
        ) {
          setPurchaseNumbers(response.data);
        } else {
          setPurchaseNumbers([]);
        }
      } catch (error) {
        console.error(
          "Error fetching purchase return numbers:",
          error,
        );

        setPurchaseNumbers([]);
      }
    };

    fetchPurchaseNumbers();
  }, []);

  /* =========================================================
     PURCHASE NO CHANGE
  ========================================================= */

  const handlePurchaseNoChange = async (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const pNo = e.target.value;

    setFormData((prev) => ({
      ...prev,
      purchaseNo: pNo,
      supplier: "",
      store: "",
    }));

    setItems([]);
    setSelectedPurchaseData(null);

    if (!pNo) {
      return;
    }

    setLoadingPurchase(true);

    try {
      const response =
        await getItemPurchaseOrderList(
          branchCode,
          Number(pNo),
        );

      console.log(
        "Item Purchase Order Response:",
        response,
      );

      if (
        !response?.success ||
        !Array.isArray(response?.data)
      ) {
        setItems([]);
        return;
      }

      setSelectedPurchaseData(response);

      const firstData = response.data?.[0];

      const master =
        firstData?.master ||
        response.data?.master ||
        response?.master ||
        {};

      /* =====================================================
         STORE
      ===================================================== */

      const storeName = String(
        master?.storeName ??
          master?.StoreName ??
          "",
      );

      /* =====================================================
         SUPPLIER
      ===================================================== */

      const supplierCode =
        master?.supCode ??
        master?.supCodeId ??
        master?.supplierCode ??
        "";

      const supplierName =
        master?.vendorName ??
        master?.supplierName ??
        master?.supplier ??
        "";

      const supplierValue =
        supplierCode || supplierName
          ? `${supplierCode}${
              supplierCode && supplierName
                ? "-"
                : ""
            }${supplierName}`
          : "";

      setFormData((prev) => ({
        ...prev,
        supplier: supplierValue,
        store: storeName,
      }));

      /* =====================================================
         ITEM DETAILS
      ===================================================== */

      let detailData: any[] = [];

      if (
        Array.isArray(firstData?.detail)
      ) {
        detailData = firstData.detail;
      } else if (
        Array.isArray(firstData?.details)
      ) {
        detailData = firstData.details;
      } else if (
        Array.isArray(firstData?.items)
      ) {
        detailData = firstData.items;
      }

      const mappedItems: PurchaseReturnItem[] =
        detailData.map(
          (item: any, index: number) => {
            const itemCode =
              item?.itemCode ??
              item?.ItemCode ??
              item?.code ??
              "";

            const itemName =
              item?.itemName ??
              item?.ItemName ??
              item?.name ??
              "";

            const unit =
              item?.unit ??
              item?.unitName ??
              item?.Unit ??
              "";

            const rate = Number(
              item?.pItemRate ??
                item?.poItemRate ??
                item?.itemRate ??
                item?.rate ??
                0,
            );

            const qty = Number(
              item?.pItemQty ??
                item?.poItemQty ??
                item?.qty ??
                item?.quantity ??
                0,
            );

            return {
              id: index + 1,

              code: String(itemCode),

              name: String(itemName),

              unit: String(unit),

              unitCode: Number(
                item?.unitCode ?? 0,
              ),

              mainUnit: String(
                item?.mainUnit ?? "",
              ),

              mainUnitConverstion: String(
                item?.mainUnitConverstion ??
                  "",
              ),

              rate,

              qty,

              returnQty: 0,

              amount: 0,
            };
          },
        );

      setItems(mappedItems);
    } catch (error) {
      console.error(
        "Error fetching selected purchase order:",
        error,
      );

      setItems([]);
      setSelectedPurchaseData(null);

      setFormData((prev) => ({
        ...prev,
        supplier: "",
        store: "",
      }));
    } finally {
      setLoadingPurchase(false);
    }
  };

  /* =========================================================
     RETURN QTY
  ========================================================= */

  const updateReturnQty = (
    id: number,
    value: string,
  ) => {
    const returnQty = Math.max(
      0,
      Number(value || 0),
    );

    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              returnQty,
              amount:
                returnQty *
                Number(item.rate || 0),
            }
          : item,
      ),
    );
  };

  /* =========================================================
     REMOVE ITEM
  ========================================================= */

  const removeItem = (id: number) => {
    setItems((prev) =>
      prev.filter(
        (item) => item.id !== id,
      ),
    );
  };

  /* =========================================================
     SAVE PURCHASE RETURN
  ========================================================= */

  const handleSave = async () => {
    if (!formData.purchaseNo) {
      alert("Please select Purchase No.");
      return;
    }

    const returnItems =
      items.filter(
        (item: PurchaseReturnItem) =>
          Number(item.returnQty || 0) > 0,
      );

    if (returnItems.length === 0) {
      alert("Please enter Return Qty.");
      return;
    }

    const purchaseData =
      selectedPurchaseData?.data?.[0];

    const master = purchaseData?.master;

    if (!master) {
      alert("Purchase details not found.");
      return;
    }

    try {
      setSaving(true);

      /* =====================================================
         DETAILS
      ===================================================== */

      const details = returnItems.map(
        (item: PurchaseReturnItem) => ({
          itemCode: Number(
            item.code || 0,
          ),

          prItemRate: Number(
            item.rate || 0,
          ),

          prItemQty: Number(
            item.qty || 0,
          ),

          prniQty: Number(
            item.returnQty || 0,
          ),

          pReturnQty: Number(
            item.returnQty || 0,
          ),

          praQty: Number(
            item.returnQty || 0,
          ),

          unit: item.unit || "",

          unitCode: Number(
            item.unitCode || 0,
          ),

          mainUnit:
            item.mainUnit || "",

          mainUnitConverstion:
            item.mainUnitConverstion ||
            "",
        }),
      );

      /* =====================================================
         TAXES
      ===================================================== */

      const taxDetails: any[] =
        Array.isArray(
          purchaseData?.taxDetails,
        )
          ? purchaseData.taxDetails
          : [];

      const taxes: PurchaseReturnTax[] =
        taxDetails.map(
          (tax: any) => ({
            pno: Number(
              tax?.pno ??
                formData.purchaseNo ??
                0,
            ),

            itemCode: Number(
              tax?.itemCode ?? 0,
            ),

            taxCode: Number(
              tax?.taxCode ?? 0,
            ),

            taxPer: Number(
              tax?.taxPer ?? 0,
            ),

            taxAmount: Number(
              tax?.taxAmount ?? 0,
            ),

            branch_Code:
              tax?.branch_Code ||
              branchCode,

            itemName:
              tax?.itemName || "",

            taxDescription:
              tax?.taxDescription ||
              "",

            taxPercentage: String(
              tax?.taxPercentage ?? "",
            ),
          }),
        );

      /* =====================================================
         MISCELLANEOUS
      ===================================================== */

      const miscDetails: any[] =
        Array.isArray(
          purchaseData?.miscDetails,
        )
          ? purchaseData.miscDetails
          : [];

      const miscellaneous:
        PurchaseReturnMiscellaneous[] =
        miscDetails.map(
          (misc: any) => ({
            chargeId: Number(
              misc?.chargeId ?? 0,
            ),

            chargeAmt: Number(
              misc?.chargeAmt ?? 0,
            ),

            pno: Number(
              misc?.pno ??
                formData.purchaseNo ??
                0,
            ),

            branch_Code:
              misc?.branch_Code ||
              branchCode,

            taxCode: Number(
              misc?.taxCode ?? 0,
            ),

            taxDescription:
              misc?.taxDescription ||
              "",

            taxPercentage: String(
              misc?.taxPercentage ?? "",
            ),

            chargeName:
              misc?.chargeName || "",
          }),
        );

      /* =====================================================
         TOTALS
      ===================================================== */

      const totalAmount =
        returnItems.reduce(
          (
            total: number,
            item: PurchaseReturnItem,
          ) =>
            total +
            Number(
              item.returnQty || 0,
            ) *
              Number(
                item.rate || 0,
              ),
          0,
        );

      const taxAmount =
        taxes.reduce(
          (
            total: number,
            tax: PurchaseReturnTax,
          ) =>
            total +
            Number(
              tax.taxAmount || 0,
            ),
          0,
        );

      const missChargeAmount =
        miscellaneous.reduce(
          (
            total: number,
            misc: PurchaseReturnMiscellaneous,
          ) =>
            total +
            Number(
              misc.chargeAmt || 0,
            ),
          0,
        );

      const cgstAmount =
        taxes
          .filter(
            (tax: PurchaseReturnTax) =>
              String(
                tax.taxDescription ||
                  "",
              )
                .toUpperCase()
                .includes("CGST"),
          )
          .reduce(
            (
              total: number,
              tax: PurchaseReturnTax,
            ) =>
              total +
              Number(
                tax.taxAmount || 0,
              ),
            0,
          );

      const sgstAmount =
        taxes
          .filter(
            (tax: PurchaseReturnTax) =>
              String(
                tax.taxDescription ||
                  "",
              )
                .toUpperCase()
                .includes("SGST"),
          )
          .reduce(
            (
              total: number,
              tax: PurchaseReturnTax,
            ) =>
              total +
              Number(
                tax.taxAmount || 0,
              ),
            0,
          );

      const grossAmount =
        totalAmount +
        taxAmount +
        missChargeAmount;

      /* =====================================================
         FINAL PAYLOAD
      ===================================================== */

      const payload = {
        transactionNo: Number(
          formData.transactionNo || 0,
        ),

        prNo: 0,

        prDate: new Date(
          `${formData.date}T00:00:00`,
        ).toISOString(),

        supCode: Number(
          master?.supCode ?? 0,
        ),

        pNo: Number(
          formData.purchaseNo || 0,
        ),

        branchCode,

        totalAmount: Number(
          totalAmount.toFixed(2),
        ),

        taxAmount: Number(
          taxAmount.toFixed(2),
        ),

        grossAmount: Number(
          grossAmount.toFixed(2),
        ),

        missChargeAmount: Number(
          missChargeAmount.toFixed(2),
        ),

        cgstAmount: Number(
          cgstAmount.toFixed(2),
        ),

        sgstAmount: Number(
          sgstAmount.toFixed(2),
        ),

        details,

        taxes,

        miscellaneous,
      };

      console.log(
        "SavePurchaseReturnOrder Payload:",
        JSON.stringify(
          payload,
          null,
          2,
        ),
      );

      /* =====================================================
         API CALL
      ===================================================== */

      const response =
        await savePurchaseReturnOrder(
          payload,
        );

      console.log(
        "SavePurchaseReturnOrder Response:",
        response,
      );

      if (response?.success) {
        alert(
          response?.message ||
            "Purchase Return saved successfully",
        );

        setFormData({
          transactionNo: "6",
          date: new Date()
            .toISOString()
            .split("T")[0],
          purchaseNo: "",
          supplier: "",
          store: "",
        });

        setItems([]);

        setSelectedPurchaseData(null);
      } else {
        alert(
          response?.message ||
            "Failed to save Purchase Return",
        );
      }
    } catch (error: any) {
      console.error(
        "Error saving Purchase Return:",
        error,
      );

      alert(
        error?.response?.data?.message ||
          "Failed to save Purchase Return",
      );
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "h-10 w-full min-w-0 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  const labelClass =
    "mb-1.5 block text-xs font-semibold text-gray-600";

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-4 sm:px-4 md:px-6">
      <Header />

      <div className="mx-auto w-full max-w-[1600px]">

        <div className="mb-5 mt-2">
          <h1 className="text-2xl font-bold leading-tight text-gray-800">
            Purchase Return
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Enter required detail for purchase return
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5 md:p-6">

          <section className="overflow-hidden rounded-xl border border-gray-200">

            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3">
              <h2 className="text-sm font-bold text-gray-800">
                Purchase Return
              </h2>
            </div>

            <div className="p-4 md:p-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
   <div className="min-w-0">
                  <label className={labelClass}>
                    Purchase No.
                  </label>

                  <select
                    value={
                      formData.purchaseNo
                    }
                    onChange={
                      handlePurchaseNoChange
                    }
                    className={inputClass}
                  >
                    <option value="">
                      Select Purchase No.
                    </option>

                    {purchaseNumbers.map(
                      (
                        purchase: PurchaseNumber,
                      ) => (
                        <option
                          key={
                            purchase.pNo
                          }
                          value={
                            purchase.pNo
                          }
                        >
                          {purchase.pNo}
                        </option>
                      ),
                    )}
                  </select>
                </div>
                <div className="min-w-0">
                  <label className={labelClass}>
                    Store
                  </label>

                  <input
                    type="text"
                    value={formData.store}
                    readOnly
                    placeholder="Store"
                    className={inputClass}
                  />
                </div>

                <div className="min-w-0">
                  <label className={labelClass}>
                    Trans No.
                  </label>

                  <input
                    type="text"
                    value={
                      formData.transactionNo
                    }
                    onChange={(e) =>
                      setFormData(
                        (prev) => ({
                          ...prev,
                          transactionNo:
                            e.target.value,
                        }),
                      )
                    }
                    className={inputClass}
                  />
                </div>

                <div className="min-w-0">
                  <label className={labelClass}>
                    Date
                  </label>

                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData(
                        (prev) => ({
                          ...prev,
                          date: e.target.value,
                        }),
                      )
                    }
                    className={inputClass}
                  />
                </div>

             

                <div className="min-w-0">
                  <label className={labelClass}>
                    Supplier
                  </label>

                  <input
                    type="text"
                    value={
                      formData.supplier
                    }
                    readOnly
                    placeholder="Supplier"
                    className={inputClass}
                  />
                </div>

              </div>
            </div>
          </section>

          <section className="mt-6 overflow-hidden rounded-xl border border-gray-200">

            <div className="flex border-b border-gray-200 bg-gray-50">

              <button
                type="button"
                onClick={() =>
                  setActiveTab("return")
                }
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
                onClick={() =>
                  setActiveTab("tax")
                }
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

                {loadingPurchase ? (
                  <div className="py-10 text-center text-sm text-gray-500">
                    Loading purchase details...
                  </div>
                ) : (
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
                              className="px-4 py-10 text-center text-sm text-gray-500"
                            >
                              Select Purchase No. to load items.
                            </td>
                          </tr>
                        ) : (
                          items.map(
                            (
                              item: PurchaseReturnItem,
                              index: number,
                            ) => (
                              <tr
                                key={item.id}
                                className="border-b border-gray-100 hover:bg-gray-50"
                              >

                                <td className="px-4 py-3 text-gray-700">
                                  {index + 1}
                                </td>

                                <td className="px-4 py-3 font-medium text-gray-700">
                                  {item.code ||
                                    "-"}
                                </td>

                                <td className="px-4 py-3 font-medium text-gray-800">
                                  {item.name ||
                                    "-"}
                                </td>

                                <td className="px-4 py-3 text-gray-700">
                                  {item.unit ||
                                    "-"}
                                </td>

                                <td className="px-4 py-3 text-right text-gray-700">
                                  {Number(
                                    item.rate ||
                                      0,
                                  ).toFixed(2)}
                                </td>

                                <td className="px-4 py-3 text-right font-medium text-gray-800">
                                  {Number(
                                    item.qty ||
                                      0,
                                  ).toFixed(2)}
                                </td>

                                <td className="px-4 py-2 text-right">
                                  <input
                                    type="number"
                                    min="0"
                                    max={
                                      item.qty
                                    }
                                    step="0.01"
                                    value={
                                      item.returnQty
                                    }
                                    onChange={(
                                      e,
                                    ) =>
                                      updateReturnQty(
                                        item.id,
                                        e.target
                                          .value,
                                      )
                                    }
                                    className="h-9 w-28 rounded-md border border-gray-300 px-2 text-right text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                  />
                                </td>

                                <td className="px-4 py-3 text-right font-semibold text-gray-800">
                                  ₹{" "}
                                  {Number(
                                    item.amount ||
                                      0,
                                  ).toFixed(2)}
                                </td>

                                <td className="px-4 py-3 text-center">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeItem(
                                        item.id,
                                      )
                                    }
                                    className="rounded-md border border-red-200 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                                  >
                                    Remove
                                  </button>
                                </td>

                              </tr>
                            ),
                          )
                        )}

                      </tbody>

                    </table>

                  </div>
                )}

              </div>
            ) : (
              <div className="p-5">
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
                  Tax details will be displayed here.
                </div>
              </div>
            )}

          </section>

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={() =>
                window.history.back()
              }
              className="h-10 rounded-lg border border-gray-300 bg-white px-6 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Back
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="h-10 rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save"}
            </button>

          </div>

        </div>
      </div>
    </div>
  );
};

export default PurchaseReturn;