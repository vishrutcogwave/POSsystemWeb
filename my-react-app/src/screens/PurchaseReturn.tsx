import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import {
  getPurchaseOrderReturnNumber,
  getItemPurchaseOrderList,
  savePurchaseReturnOrder,
  getNextIdCode,
  purchaseOrderCalculation,
  getPurchaseReturnOrderPrintList,
} from "../api/services/products.service";
import { useAppContext } from "../context/AppContext";

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
  const { appData } = useAppContext();
  const [formData, setFormData] = useState({
    transactionNo: "6",
    date: new Date().toISOString().split("T")[0],
    purchaseNo: "",
    supplier: "",
    store: "",
  });

  const [purchaseNumbers, setPurchaseNumbers] = useState<PurchaseNumber[]>([]);

  const [items, setItems] = useState<PurchaseReturnItem[]>([]);

  const [activeTab, setActiveTab] = useState<"return" | "tax">("return");

  const [loadingPurchase, setLoadingPurchase] = useState(false);

  const [saving, setSaving] = useState(false);

  const [selectedPurchaseData, setSelectedPurchaseData] = useState<any>(null);

  const branchCode = appData?.user?.branch_code;
  const [purchaseReturnCalculation, setPurchaseReturnCalculation] =
    useState<any>(null);
  /* =========================================================
     GET PURCHASE RETURN NUMBERS
  ========================================================= */

  const [printData, setPrintData] = useState<any>(null);
const [showPrintPreview, setShowPrintPreview] = useState(false);
  const fetchPurchaseNumbers = async () => {
    try {
      const response = await getPurchaseOrderReturnNumber(branchCode);

      if (response?.success && Array.isArray(response?.data)) {
        setPurchaseNumbers(response.data);
      } else {
        setPurchaseNumbers([]);
      }
    } catch (error) {
      console.error("Error fetching purchase return numbers:", error);

      setPurchaseNumbers([]);
    }
  };

  const fetchTransactionNo = async () => {
    try {
      const response = await getNextIdCode({
        tableName: "PurchaseReturnMaster",
        columnName: "PRNo",
        conditionName: "Branch_Code",
        branch: branchCode,
      });

      console.log("Next Transaction No Response:", response);

      const nextNo =
        response?.data ?? response?.nextNumber ?? response?.nextId ?? response;

      setFormData((prev) => ({
        ...prev,
        transactionNo: String(nextNo ?? ""),
      }));
    } catch (error) {
      console.error("Error fetching next transaction number:", error);
    }
  };

  useEffect(() => {
    fetchTransactionNo();
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
    setPurchaseReturnCalculation(null);
    if (!pNo) {
      setPurchaseReturnCalculation(null);
      return;
    }

    setLoadingPurchase(true);

    try {
      const response = await getItemPurchaseOrderList(branchCode, Number(pNo));

      console.log("Item Purchase Order Response:", response);

      if (!response?.success || !Array.isArray(response?.data)) {
        setItems([]);
        return;
      }

      setSelectedPurchaseData(response);

      const firstData = response.data?.[0];

      const master =
        firstData?.master || response.data?.master || response?.master || {};

      /* =====================================================
         STORE
      ===================================================== */

      const storeName = String(master?.storeName ?? master?.StoreName ?? "");

      /* =====================================================
         SUPPLIER
      ===================================================== */

      const supplierCode = master?.supCode;
      ("");
      debugger;
      const supplierName = master?.vendorName ?? "";

      const supplierValue =
        (supplierCode !== 0
          ? `${supplierCode} - ${supplierName}`
          : supplierName) ?? "";
      console.log("supplierValue", supplierValue);

      setFormData((prev) => ({
        ...prev,
        supplier: supplierValue,
        store: storeName,
      }));

      /* =====================================================
         ITEM DETAILS
      ===================================================== */

      let detailData: any[] = [];

      if (Array.isArray(firstData?.detail)) {
        detailData = firstData.detail;
      } else if (Array.isArray(firstData?.details)) {
        detailData = firstData.details;
      } else if (Array.isArray(firstData?.items)) {
        detailData = firstData.items;
      }

      const mappedItems: PurchaseReturnItem[] = detailData.map(
        (item: any, index: number) => {
          const itemCode = item?.itemCode ?? item?.ItemCode ?? item?.code ?? "";

          const itemName = item?.itemName ?? item?.ItemName ?? item?.name ?? "";

          const unit = item?.unit ?? item?.unitName ?? item?.Unit ?? "";

          const rate = Number(item?.pItemRate ?? 0);

          const qty = Number(item?.reamingQty ?? 0);

          return {
            id: index + 1,

            code: String(itemCode),

            name: String(itemName),

            unit: String(unit),

            unitCode: Number(item?.unitCode ?? 0),

            mainUnit: String(item?.mainUnit ?? ""),

            mainUnitConverstion: String(item?.mainUnitConverstion ?? ""),

            rate,

            qty,

            returnQty: 0,

            amount: 0,
          };
        },
      );

      setItems(mappedItems);
    } catch (error) {
      console.error("Error fetching selected purchase order:", error);

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
  /* =========================================================
   PURCHASE RETURN CALCULATION
========================================================= */

  const calculatePurchaseReturn = async (nextItems: PurchaseReturnItem[]) => {
    if (!formData.purchaseNo) {
      return;
    }

    const purchaseData = selectedPurchaseData?.data?.[0];

    const master = purchaseData?.master;

    if (!master) {
      console.error("Purchase master details not found");
      return;
    }

    const storeId = Number(master?.storeID ?? master?.storeId ?? 0);

    if (!storeId) {
      console.error("Store ID not found");
      return;
    }

    /*
     * Only send items which have Return Qty.
     */
    const returnItems = nextItems.filter(
      (item) => Number(item.returnQty || 0) > 0,
    );

    /*
     * No return quantity entered.
     */
    if (returnItems.length === 0) {
      setPurchaseReturnCalculation(null);
      return;
    }

    /*
     * SAME PAYLOAD STRUCTURE AS ITEM PURCHASE
     */
    const payload = {
      poNo: Number(formData.purchaseNo || 0),

      storeId,

      branch: branchCode || "",

      discount: 0,

      discountIn: "",

      poDetail: returnItems.map((item) => ({
        itemCode: Number(item.code || 0),

        /*
         * IMPORTANT:
         * Use RETURN QTY here.
         */
        poItemQty: Number(item.returnQty || 0),

        poItemRate: Number(item.rate || 0),

        unit: item.unit || "",

        unitCode: Number(item.unitCode || 0),

        poItemSuplyQty: Number(item.returnQty || 0),

        cpoItemQty: Number(item.returnQty || 0),
      })),

      poMiscDetail: [],
    };

    console.log(
      "Purchase Return Calculation Payload:",
      JSON.stringify(payload, null, 2),
    );

    try {
      const response = await purchaseOrderCalculation(payload);

      console.log("Purchase Return Calculation Response:", response);

      setPurchaseReturnCalculation(response);

      return response;
    } catch (error) {
      console.error("Purchase Return Calculation Error:", error);

      setPurchaseReturnCalculation(null);
    }
  };
  /* =========================================================
   RETURN QTY
========================================================= */

  const updateReturnQty = async (id: number, value: string) => {
    let returnQty = Math.max(0, Number(value || 0));

    const currentItem = items.find((item) => item.id === id);

    if (!currentItem) {
      return;
    }

    /*
     * Return Qty cannot be greater than
     * original purchase Qty.
     */
    if (returnQty > Number(currentItem.qty || 0)) {
      returnQty = Number(currentItem.qty || 0);
    }

    /*
     * Create the latest items array.
     * We pass this same array to the
     * calculation API.
     */
    const nextItems = items.map((item) =>
      item.id === id
        ? {
            ...item,

            returnQty,

            amount: returnQty * Number(item.rate || 0),
          }
        : item,
    );

    /*
     * Update UI
     */
    setItems(nextItems);

    /*
     * Call calculation API immediately
     * whenever Return Qty changes.
     */
    await calculatePurchaseReturn(nextItems);
  };

  /* =========================================================
     REMOVE ITEM
  ========================================================= */

  /* =========================================================
     SAVE PURCHASE RETURN
  ========================================================= */
const formatPrintDate = (dateString: string) => {
  if (!dateString) return "";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const handleSave = async () => {
  if (!formData.purchaseNo) {
    alert("Please select Purchase No.");
    return;
  }

  if (items.length === 0) {
    alert("Please add at least one item.");
    return;
  }

  const invalidItem = items.some(
    (item) =>
      Number(item.returnQty || 0) <= 0
  );

  if (invalidItem) {
    alert("Please enter Return Qty for the items.");
    return;
  }

  if (!purchaseReturnCalculation) {
    alert("Please calculate the purchase return before saving.");
    return;
  }

  setSaving(true);

  try {
    /* =====================================================
       PURCHASE DATA
    ===================================================== */

    const purchaseData =
      selectedPurchaseData?.data?.[0];

    const master = purchaseData?.master;

    if (!master) {
      alert("Purchase master details not found.");
      return;
    }

    /* =====================================================
       DETAILS
    ===================================================== */

    const details = items
      .filter(
        (item) =>
          Number(item.returnQty || 0) > 0
      )
      .map((item) => ({
        rno: 0,

        prNo: Number(
          formData.transactionNo || 0
        ),

        pNo: Number(
          formData.purchaseNo || 0
        ),

        itemCode: Number(
          item.code || 0
        ),

        prItemQty: Number(
          item.returnQty || 0
        ),

        prItemRate: Number(
          item.rate || 0
        ),

        prniQty: Number(
          item.returnQty || 0
        ),

        branch_Code: branchCode,

        pReturnQty: Number(
          item.returnQty || 0
        ),

        praQty: 0,

        mainUnit: item.mainUnit || "",

        mainUnitConverstion:
          item.mainUnitConverstion || "",

        itemName: item.name || "",

        total:
          Number(item.returnQty || 0) *
          Number(item.rate || 0),

        remainingQty: Math.max(
          0,
          Number(item.qty || 0) -
            Number(item.returnQty || 0)
        ),

        taxCode: Number(
          (item as any).taxCode || 0
        ),

        taxName:
          (item as any).taxName || "",

        unitCode: Number(
          item.unitCode || 0
        ),

        unit: item.unit || "",
      }));

    /* =====================================================
       TAX DETAILS
    ===================================================== */

    const taxes: PurchaseReturnTax[] =
      Array.isArray(
        purchaseData?.taxDetails
      )
        ? purchaseData.taxDetails
        : [];

    /* =====================================================
       MISCELLANEOUS
    ===================================================== */

    const miscellaneous:
      PurchaseReturnMiscellaneous[] =
        Array.isArray(
          purchaseData?.miscellaneous
        )
          ? purchaseData.miscellaneous
          : Array.isArray(
              purchaseData?.miscDetails
            )
            ? purchaseData.miscDetails
            : [];

    /* =====================================================
       CALCULATION RESPONSE
    ===================================================== */

    const calculation =
      purchaseReturnCalculation || {};

    console.log(
      "Purchase Return Calculation Response:",
      calculation
    );

    const totalAmount = Number(
      calculation?.totalAmount ??
        calculation?.subTotal ??
        calculation?.subtotal ??
        0
    );

    const taxAmount = Number(
      calculation?.taxAmount ??
        calculation?.totalTax ??
        0
    );

    const missChargeAmount = Number(
      calculation?.miscCharge ??
        calculation?.missChargeAmount ??
        calculation?.miscTotalAmount ??
        0
    );

    const cgstAmount = Number(
      calculation?.cgstAmt ??
        calculation?.cgstAmount ??
        0
    );

    const sgstAmount = Number(
      calculation?.sgstAmt ??
        calculation?.sgstAmount ??
        0
    );

    const grossAmount = Number(
      calculation?.grandTotal ??
        calculation?.grossAmount ??
        totalAmount +
          taxAmount +
          missChargeAmount
    );

    /* =====================================================
       FINAL PAYLOAD
    ===================================================== */

    const payload = {
      transactionNo: Number(
        formData.purchaseNo || 0
      ),

      prNo: Number(
        formData.transactionNo || 0
      ),

      prDate: new Date(
        `${formData.date}T00:00:00`
      ).toISOString(),

      supCode: Number(
        master?.supCode ?? 0
      ),

      supplierName:
        formData.supplier || "",

      pNo: Number(
        formData.purchaseNo || 0
      ),

      branchCode,

      totalAmount: Number(
        totalAmount.toFixed(2)
      ),

      taxAmount: Number(
        taxAmount.toFixed(2)
      ),

      grossAmount: Number(
        grossAmount.toFixed(2)
      ),

      missChargeAmount: Number(
        missChargeAmount.toFixed(2)
      ),

      cgstAmount: Number(
        cgstAmount.toFixed(2)
      ),

      sgstAmount: Number(
        sgstAmount.toFixed(2)
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
        2
      )
    );

    /* =====================================================
       SAVE API
    ===================================================== */

    const response =
      await savePurchaseReturnOrder(
        payload
      );

    console.log(
      "SavePurchaseReturnOrder Response:",
      response
    );

    if (!response?.success) {
      alert(
        response?.message ||
          "Failed to save Purchase Return"
      );
      return;
    }
    const responseofgt= await getPurchaseOrderReturnNumber(branchCode);
     if (responseofgt?.success && Array.isArray(responseofgt?.data)) {
        setPurchaseNumbers(responseofgt.data);
      } else {
        setPurchaseNumbers([]);
      }
    /* =====================================================
       GET PRINT DATA
       SAME FLOW AS PURCHASE ORDER
    ===================================================== */

    const createdPRNo = Number(
      formData.transactionNo || 0
    );

    console.log(
      "Created Purchase Return No:",
      createdPRNo
    );

    if (createdPRNo) {
      try {
        const printResponse =
          await getPurchaseReturnOrderPrintList(
            branchCode,
            createdPRNo
          );

        console.log(
          "Purchase Return Print Response:",
          printResponse
        );

        if (
          printResponse?.success &&
          Array.isArray(
            printResponse?.data
          )
        ) {
          /*
           * API response:
           *
           * data: [
           *   {
           *     master: {},
           *     details: [],
           *     taxDetails: [],
           *     miscDetails: []
           *   }
           * ]
           */

          setPrintData(
            printResponse.data[0]
          );

          setShowPrintPreview(true);
        } else {
          alert(
            printResponse?.message ||
              "Unable to get purchase return print data"
          );
        }
      } catch (printError: any) {
        console.error(
          "Error getting Purchase Return print data:",
          printError
        );

        alert(
          "Purchase Return saved, but print preview could not be loaded"
        );
      }
    }

    /* =====================================================
       SUCCESS
    ===================================================== */

    alert(
      response?.message ||
        "Purchase Return saved successfully"
    );

    /* =====================================================
       RESET FORM
       DO THIS AFTER PRINT API
    ===================================================== */

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

    setPurchaseReturnCalculation(null);

    /* Get new transaction number */
    await fetchTransactionNo();

  } catch (error: any) {
    console.error(
      "Error saving Purchase Return:",
      error
    );

    alert(
      error?.response?.data?.message ||
        "Failed to save Purchase Return"
    );
  } finally {
    setSaving(false);
  }
};

  const inputClass =
    "h-10 w-full min-w-0 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  const labelClass = "mb-1.5 block text-xs font-semibold text-gray-600";
  /* =========================
    ORDER SUMMARY VALUES
========================= */

  const totalQuantity = items.reduce(
    (sum, item) => sum + Number(item.returnQty || 0),
    0,
  );

  const totalAmount = Number(
    purchaseReturnCalculation?.totalAmount ??
      items.reduce(
        (sum, item) =>
          sum + Number(item.returnQty || 0) * Number(item.rate || 0),
        0,
      ),
  );

  const cgstAmount = Number(
    purchaseReturnCalculation?.cgstAmt ??
      purchaseReturnCalculation?.cgstAmount ??
      0,
  );

  const sgstAmount = Number(
    purchaseReturnCalculation?.sgstAmt ??
      purchaseReturnCalculation?.sgstAmount ??
      0,
  );

  const miscellaneousAmount = Number(
    purchaseReturnCalculation?.miscTotalAmount ??
      purchaseReturnCalculation?.miscCharge ??
      purchaseReturnCalculation?.missChargeAmount ??
      0,
  );

  const grandTotal = Number(
    purchaseReturnCalculation?.grandTotal ??
      purchaseReturnCalculation?.grossAmount ??
      totalAmount + cgstAmount + sgstAmount + miscellaneousAmount,
  );
  return (<>{showPrintPreview && printData && (
  <div className="fixed inset-0 z-[99999] overflow-y-auto bg-black/60 p-4">
    <div className="mx-auto my-6 w-full max-w-[900px]">

      {/* PREVIEW HEADER */}
      <div className="mb-3 flex items-center justify-between rounded-xl bg-white px-5 py-3 shadow-lg">

        <div>
          <h2 className="text-lg font-bold text-gray-800">
            Purchase Return Preview
          </h2>

          <p className="text-xs text-gray-500">
            PR No: {printData.master?.prNo}
          </p>
        </div>

        <div className="flex gap-2">

          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            🖨 Print
          </button>

          <button
            type="button"
            onClick={() => {
              setShowPrintPreview(false);
              setPrintData(null);
            }}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>

        </div>
      </div>

      {/* PRINT AREA */}
      <div
        id="purchase-return-print"
        className="bg-white px-10 py-8 text-[13px] text-gray-800 shadow-xl"
      >

        {/* COMPANY HEADER */}
        <div className="mb-5 text-center">
          <h1 className="text-xl font-bold tracking-wide">
            COGWAVE POS
          </h1>

          <div className="mt-1 text-xs leading-5 text-gray-600">
            Basavanagudi<br />
            Bangalore - 560004<br />
            PH : 7338818178<br />
            Email : 0<br />
            GST : -
          </div>
        </div>

        {/* TITLE */}
        <div className="mb-4 text-center">
          <h2 className="text-lg font-semibold text-red-600">
            Purchase Return
          </h2>
        </div>

        {/* MASTER DETAILS */}
        <div className="grid grid-cols-2 border border-gray-800">

          {/* LEFT */}
          <div className="border-r border-gray-800 p-3">

            <div className="mb-2">
              <span className="font-semibold">
                Vendor:
              </span>{" "}
              {printData.master?.vendorName || "-"}
            </div>

            <div className="mb-2">
              <span className="font-semibold">
                Address:
              </span>{" "}
              {printData.master?.vendorAddress || "-"}
            </div>

            <div className="mb-2">
              <span className="font-semibold">
                Phone No:
              </span>{" "}
              {printData.master?.phoneNo || "-"}
            </div>

            <div className="mb-2">
              <span className="font-semibold">
                Mobile No:
              </span>{" "}
              {printData.master?.mobileNo || "-"}
            </div>

            <div className="mb-2">
              <span className="font-semibold">
                GST No:
              </span>{" "}
              {printData.master?.gstNo || "-"}
            </div>

            <div>
              <span className="font-semibold">
                State Code:
              </span>{" "}
              {printData.master?.stateCode || "-"}
            </div>

          </div>

          {/* RIGHT */}
          <div className="p-3">

            <div className="mb-2">
              <span className="font-semibold">
                PR No:
              </span>{" "}
              {printData.master?.prNo || "-"}
            </div>

            <div className="mb-2">
              <span className="font-semibold">
                PR Date:
              </span>{" "}
              {formatPrintDate(
                printData.master?.prDate
              )}
            </div>

            <div className="mb-2">
              <span className="font-semibold">
                Transaction No:
              </span>{" "}
              {printData.master?.transactionNo || "-"}
            </div>

            <div>
              <span className="font-semibold">
                Purchase No:
              </span>{" "}
              {printData.master?.pNo || "-"}
            </div>

          </div>

        </div>

        {/* ITEMS */}
        <div className="mt-3 overflow-hidden border border-gray-800">

          <table className="w-full border-collapse">

            <thead>
              <tr className="bg-gray-200 text-xs font-bold">

                <th className="border border-gray-800 px-2 py-2 text-left">
                  Code
                </th>

                <th className="border border-gray-800 px-2 py-2 text-left">
                  Description
                </th>

                <th className="border border-gray-800 px-2 py-2 text-center">
                  Unit
                </th>

                <th className="border border-gray-800 px-2 py-2 text-right">
                  Rate
                </th>

                <th className="border border-gray-800 px-2 py-2 text-right">
                  Qty
                </th>

                <th className="border border-gray-800 px-2 py-2 text-right">
                  Total
                </th>

              </tr>
            </thead>

            <tbody>

              {printData.details?.map(
                (item: any, index: number) => (
                  <tr key={index}>

                    <td className="border border-gray-800 px-2 py-2">
                      {item.itemCode}
                    </td>

                    <td className="border border-gray-800 px-2 py-2">
                      {item.itemName || "-"}
                    </td>

                    <td className="border border-gray-800 px-2 py-2 text-center">
                      {item.unit || "-"}
                    </td>

                    <td className="border border-gray-800 px-2 py-2 text-right">
                      ₹{" "}
                      {Number(
                        item.prItemRate || 0
                      ).toFixed(2)}
                    </td>

                    <td className="border border-gray-800 px-2 py-2 text-right">
                      {item.pReturnQty ??
                        item.prItemQty ??
                        0}
                    </td>

                    <td className="border border-gray-800 px-2 py-2 text-right font-medium">
                      ₹{" "}
                      {Number(
                        item.total || 0
                      ).toFixed(2)}
                    </td>

                  </tr>
                )
              )}

            </tbody>

          </table>

        </div>

        {/* SUMMARY */}
        <div className="mt-6 flex justify-end">

          <div className="w-[330px]">

            <div className="flex justify-between border-b border-gray-300 py-2">
              <span>Amount Before Tax</span>

              <span>
                ₹{" "}
                {Number(
                  printData.master?.totalAmount || 0
                ).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between border-b border-gray-300 py-2">
              <span>Tax Amount</span>

              <span>
                ₹{" "}
                {Number(
                  printData.master?.taxAmount || 0
                ).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between border-b border-gray-300 py-2">
              <span>Misc Charges</span>

              <span>
                ₹{" "}
                {Number(
                  printData.master?.missChargeAmount || 0
                ).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between border-b-2 border-gray-800 py-3 text-base font-bold">
              <span>Final Amount</span>

              <span>
                ₹{" "}
                {Number(
                  printData.master?.grossAmount || 0
                ).toFixed(2)}
              </span>
            </div>

          </div>

        </div>

     

      </div>
    </div>
  </div>
)}

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
                  <label className={labelClass}>Purchase No.</label>

                  <select
                    value={formData.purchaseNo}
                    onChange={handlePurchaseNoChange}
                    className={inputClass}
                  >
                    <option value="">Select Purchase No.</option>

                    {purchaseNumbers.map((purchase: PurchaseNumber) => (
                      <option key={purchase.pNo} value={purchase.pNo}>
                        {purchase.pNo}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="min-w-0">
                  <label className={labelClass}>Store</label>

                  <input
                    type="text"
                    value={formData.store}
                    readOnly
                    placeholder="Store"
                    className={inputClass}
                  />
                </div>

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

                <div className="min-w-0">
                  <label className={labelClass}>Supplier</label>

                  <input
                    type="text"
                    value={formData.supplier}
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
                onClick={() => setActiveTab("return")}
                className={`border-r border-gray-200 px-5 py-3 text-sm font-semibold transition ${
                  activeTab === "return"
                    ? "bg-white text-blue-600"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Purchase Return Detail
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
                            (item: PurchaseReturnItem, index: number) => (
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
            {/* =========================
    ORDER SUMMARY
========================= */}

            <div className="mt-5 flex justify-end">
              <div className="w-full rounded-xl border border-gray-200 bg-gray-50 p-5 sm:w-[420px]">
                <h3 className="mb-4 text-base font-bold text-gray-800">
                  Order Summary
                </h3>

                <div className="space-y-3">
                  {/* TOTAL QUANTITY */}

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-gray-600">Total Quantity</span>

                    <span className="min-w-[120px] text-right font-medium text-gray-800">
                      {totalQuantity.toFixed(2)}
                    </span>
                  </div>

                  {/* TOTAL AMOUNT */}

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-gray-600">Total Amount</span>

                    <span className="min-w-[120px] text-right font-medium text-gray-800">
                      ₹ {totalAmount.toFixed(2)}
                    </span>
                  </div>

                  {/* CGST */}

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-gray-600">CGST</span>

                    <span className="min-w-[120px] text-right font-medium text-gray-800">
                      ₹ {cgstAmount.toFixed(2)}
                    </span>
                  </div>

                  {/* SGST */}

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-gray-600">SGST</span>

                    <span className="min-w-[120px] text-right font-medium text-gray-800">
                      ₹ {sgstAmount.toFixed(2)}
                    </span>
                  </div>

                  {/* MISCELLANEOUS */}

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-gray-600">Miscellaneous</span>

                    <span className="min-w-[120px] text-right font-medium text-gray-800">
                      ₹ {miscellaneousAmount.toFixed(2)}
                    </span>
                  </div>

                  {/* GRAND TOTAL */}

                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-base font-bold text-gray-800">
                        Grand Total
                      </span>

                      <span className="min-w-[120px] text-right text-lg font-bold text-blue-600">
                        ₹ {grandTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

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
              onClick={handleSave}
              disabled={saving}
              className="h-10 rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div></>
  );
};

export default PurchaseReturn;
