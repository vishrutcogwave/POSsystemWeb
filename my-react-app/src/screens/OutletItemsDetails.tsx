import { useEffect, useState } from "react";
import Header from "../components/Header";
import { DataTable, type Column } from "../components/DataTableForMasters";
import {
  bulkIncrementItems,
  createOltItemMaster,
  getCombinedOutletAndTableMasterList,
  getItemGroupList,
  getOutletItemList,
  getTaxMasterList,
} from "../api/services/products.service";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import { Printer, Save } from "lucide-react";

type OutletItem = {
  id: number;

  itemCode: number;
  itemName: string;
  itemRate: number;
  oidRate: number;
  oidAvailable: boolean;
  taxCode: string;
  vatper: string;
  discount: number;
  freeItemCode: string;
  freeItemName: string;
  freeItemQty: string;
  isHappyHour: boolean;
  grpCode: number;
};

type Outlet = {
  oltCode: number;
  oltName: string;
};

type Group = {
  grpCode: number;
  grpName: string;
};

export default function OutletItemsDetails() {
  const { appData } = useAppContext();
  const [isAvailableOnly, setIsAvailableOnly] = useState(true);

  const [loading, setLoading] = useState(false);
const [originalData, setOriginalData] = useState<OutletItem[]>([]);
  const [data, setData] = useState<OutletItem[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  const [selectedOutlet, setSelectedOutlet] = useState<number>(1);

  const [selectedGroup, setSelectedGroup] = useState<number>(0);

  const [bulkAmount, setBulkAmount] = useState<string>("");

  const [bulkPercentage, setBulkPercentage] = useState<string>("");

  const [search, setSearch] = useState("");

  // POPUPS
  const [showBulkTaxPopup, setShowBulkTaxPopup] = useState(false);

  const [showBulkAmountPopup, setShowBulkAmountPopup] = useState(false);
  const [appliedTax, setAppliedTax] = useState<{
  taxCode: number;
  taxName: string;
  itemGroup: string;
} | null>(null);
// const handleApplyTax = () => {
//   if (!selectedGroup) {
//     toast.error("Select group ❌");
//     return;
//   }

//   if (!selectedTaxCode) {
//     toast.error("Select tax ❌");
//     return;
//   }

//   const selectedTax = taxes.find(
//     (t) => t.taxCode === selectedTaxCode
//   );

//   const selectedGroupData = groups.find(
//     (g) => g.grpCode === selectedGroup
//   );

//   if (!selectedTax || !selectedGroupData) {
//     toast.error("Invalid selection ❌");
//     return;
//   }

//   setAppliedTax({
//     taxCode: selectedTax.taxCode,
//     taxName: selectedTax.taxName,
//     itemGroup: selectedGroupData.grpName,
//   });

//   toast.success("Tax applied successfully ✅");

//   setShowBulkTaxPopup(false);
// };
const handleApplyTax = async () => {
  if (!selectedGroup) {
    toast.error("Select group ❌");
    return;
  }

  if (!selectedTaxCode) {
    toast.error("Select tax ❌");
    return;
  }

  const selectedTax = taxes.find(
    (t) => t.taxCode === selectedTaxCode
  );

  const selectedGroupData = groups.find(
    (g) => g.grpCode === selectedGroup
  );

  if (!selectedTax || !selectedGroupData) {
    toast.error("Invalid selection ❌");
    return;
  }

  const taxData = {
    taxCode: selectedTax.taxCode,
    taxName: selectedTax.taxName,
    itemGroup: selectedGroupData.grpName,
  };

  // ✅ set applied tax
  setAppliedTax(taxData);

  // ✅ close popup
  setShowBulkTaxPopup(false);

  // ✅ wait state update
  setTimeout(async () => {
    await handleSave(taxData);
  }, 0);
};
  type TaxItem = {
    taxCode: number;
    taxName: string;
    taxPercentage: number;
  };

  const [taxes, setTaxes] = useState<TaxItem[]>([]);
  const [selectedTaxCode, setSelectedTaxCode] = useState<number>(0);
  const fetchTaxes = async () => {
    try {
      const res = await getTaxMasterList(appData?.user?.branch_code);

      if (res?.success) {
        setTaxes(res.data || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching tax list ❌");
    }
  };
  const handleRateChange = (id: number, value: number) => {
    setData((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              oidRate: value,
            }
          : item,
      ),
    );
  };
  const columns: Column<OutletItem>[] = [
    { header: "Item Code", accessor: "itemCode" },

    { header: "Item Name", accessor: "itemName" },

    // { header: "Item Rate", accessor: "itemRate" },

    // { header: "OID Rate", accessor: "oidRate" },
    {
      header: "OID Rate",
      accessor: "oidRate",
      cell: (row) => (
        <input
          type="number"
          value={row.oidRate}
          onChange={(e) => handleRateChange(row.id, Number(e.target.value))}
          className="border rounded px-2 py-1 w-[100px] focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      ),
    },

    {
      header: "Available",
      accessor: "oidAvailable",
      cell: (row) => (
        <input
          type="checkbox"
          checked={row.oidAvailable}
          onChange={(e) =>
            handleCheckboxChange(row.id, "oidAvailable", e.target.checked)
          }
          className="h-4 w-4 cursor-pointer"
        />
      ),
    },
    {
      header: "Happy Hour",
      accessor: "isHappyHour",
      cell: (row) => (
        <input
          type="checkbox"
          checked={row.isHappyHour}
          onChange={(e) =>
            handleCheckboxChange(row.id, "isHappyHour", e.target.checked)
          }
          className="h-4 w-4 cursor-pointer"
        />
      ),
    },

    // { header: "Tax Code", accessor: "taxCode" },

    // { header: "VAT %", accessor: "vatper" },

    { header: "Discount", accessor: "discount" },

    { header: "Free Item Code", accessor: "freeItemCode" },

    { header: "Free Item Name", accessor: "freeItemName" },

    { header: "Free Qty", accessor: "freeItemQty" },

    // { header: "Group Code", accessor: "grpCode" },
  ];

  const filteredData = data.filter((row) =>
    columns.some((col) =>
      String(row[col.accessor] ?? "")
        .toLowerCase()
        .includes(search.toLowerCase()),
    ),
  );

  const handleBulkIncrement = async () => {
    try {
      if (!selectedGroup) {
        toast.error("Select group ❌");
        return;
      }

      if (!bulkAmount && !bulkPercentage) {
        toast.error("Enter amount or percentage ❌");
        return;
      }

      setLoading(true);

      const filteredItems = data.filter(
        (item) => item.grpCode === selectedGroup,
      );

      const payload = {
        amount: bulkAmount ? Number(bulkAmount) : null,

        percentage: bulkPercentage ? Number(bulkPercentage) : null,

        grpCode: selectedGroup,

        items: filteredItems,
      };

      const res = await bulkIncrementItems(payload);

      if (res) {
        toast.success("Bulk increment updated ✅");

        if (Array.isArray(res)) {
          setData((prev) =>
            prev.map((oldItem) => {
              const updatedItem = res.find(
                (newItem: any) => newItem.itemCode === oldItem.itemCode,
              );

              return updatedItem
                ? {
                    ...oldItem,
                    ...updatedItem,
                    id: updatedItem.itemCode || oldItem.id,
                  }
                : oldItem;
            }),
          );
        }

        setShowBulkAmountPopup(false);

        setBulkAmount("");
        setBulkPercentage("");
      } else {
        toast.error(res?.message || "Failed ❌");
      }
    } catch (err) {
      console.error(err);

      toast.error("Error updating bulk amount ❌");
    } finally {
      setLoading(false);
    }
  };
  const fetchOutlets = async () => {
    try {
      const res = await getCombinedOutletAndTableMasterList(
        appData?.user?.branch_code,
             appData?.user?.userCode,
      );

      if (Array.isArray(res)) {
        const formatted = res.map((item: any) => ({
          oltCode: item.oltCode,
          oltName: item.oltName,
        }));

        setOutlets(formatted);

        if (formatted.length > 0) {
          setSelectedOutlet(formatted[0].oltCode);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching outlets ❌");
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await getItemGroupList(appData?.user?.branch_code);

      if (Array.isArray(res)) {
        const formatted = res.map((item: any) => ({
          grpCode: item.grpCode,
          grpName: item.grpName,
        }));

        setGroups(formatted);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching groups ❌");
    }
  };

  const fetchOutletItems = async (outletCode: number) => {
    try {
      setLoading(true);

      const res = await getOutletItemList(
        appData?.user?.branch_code,
        outletCode,
        isAvailableOnly,
      );

      if (res?.success) {
        const formatted = res.data.map(
          (item: any, index: number): OutletItem => ({
            id: item.itemCode || index,

            itemCode: item.itemCode,
            itemName: item.itemName,
            itemRate: item.itemRate,
            oidRate: item.oidRate,
            oidAvailable: item.oidAvailable,
            taxCode: item.taxCode,
            vatper: item.vatper,
            discount: item.discount,
            freeItemCode: item.freeItemCode,
            freeItemName: item.freeItemName,
            freeItemQty: item.freeItemQty,
            isHappyHour: item.isHappyHour,
            grpCode: item.grpCode,
          }),
        );

        setData(formatted);
        setOriginalData(formatted);
      } else {
        toast.error(res?.message || "Failed ❌");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching outlet items ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutlets();
    fetchGroups();
    fetchTaxes();
  }, []);

  useEffect(() => {
    if (selectedOutlet) {
      fetchOutletItems(selectedOutlet);
    }
  }, [selectedOutlet, isAvailableOnly]);
  const handleCheckboxChange = (
    id: number,
    field: "oidAvailable" | "isHappyHour",
    checked: boolean,
  ) => {
    setData((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: checked,
            }
          : item,
      ),
    );
  };

  const handlePrint = () => {
  const printableData = data;

  const printWindow = window.open("", "_blank");

  if (!printWindow) return;

  const html = `
    <html>
      <head>
        <title>Outlet Items Print</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
          }

          h2 {
            text-align: center;
            margin-bottom: 20px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
          }

          th, td {
            border: 1px solid #ccc;
            padding: 8px;
            text-align: left;
            font-size: 12px;
          }

          th {
            background: #f3f3f3;
          }
        </style>
      </head>

      <body>
        <h2>Outlet Item Details</h2>

        <table>
          <thead>
            <tr>
              <th>Item Code</th>
              <th>Item Name</th>
              <th>OID Rate</th>
              <th>Available</th>
              <th>Happy Hour</th>
              <th>Discount</th>
              <th>Free Item</th>
              <th>Free Qty</th>
            </tr>
          </thead>

          <tbody>
            ${printableData
              .map(
                (item) => `
                  <tr>
                    <td>${item.itemCode}</td>
                    <td>${item.itemName}</td>
                    <td>${item.oidRate}</td>
                    <td>${item.oidAvailable ? "Yes" : "No"}</td>
                    <td>${item.isHappyHour ? "Yes" : "No"}</td>
                    <td>${item.discount}</td>
                    <td>${item.freeItemName || "-"}</td>
                    <td>${item.freeItemQty || "-"}</td>
                  </tr>
                `,
              )
              .join("")}
          </tbody>
        </table>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();

  printWindow.focus();
  printWindow.print();
};
  
//   const handleSave = async () => {
//     try {
//       setLoading(true);

//       const payload = {
//         oltCode: String(selectedOutlet),
//         branchCode: appData?.user?.branch_code || "",
//         userCode: String(appData?.user?.userCode || ""),
//       isTaxIncluded: !!appliedTax,
// taxCode: appliedTax?.taxCode?.toString() || "",
// taxName: appliedTax?.taxName || "",
// itemGroup: appliedTax?.itemGroup || "",
//         oltDetails: data.map((item) => ({
//           itemCode: item.itemCode,
//           itemName: item.itemName,
//           oidRate: Number(item.oidRate || 0),
//           oidAvailable: item.oidAvailable,
//           discount: Number(item.discount || 0),
//           freeItemCode: item.freeItemCode || "",
//           freeItemName: item.freeItemName || "",
//           freeItemQty: item.freeItemQty || "",
//           isHappyHour: item.isHappyHour,
//           grpCode: item.grpCode,
//         })),
//       };

//       const res = await createOltItemMaster(payload);

//       if (res?.success) {
//         toast.success(res.message || "Saved successfully ✅");

//         fetchOutletItems(selectedOutlet);
//       } else {
//         toast.error(res?.message || "Failed to save ❌");
//       }
//     } catch (err: any) {
//       console.error(err);

//       toast.error(
//         err?.response?.data?.message || "Error saving outlet items ❌",
//       );
//     } finally {
//       setLoading(false);
//     }
//   };
// const handleSave = async () => {
//   try {
//     setLoading(true);

//     // ✅ only modified rows
//     const modifiedItems = data.filter((item) => {
//       const original = originalData.find(
//         (o) => o.itemCode === item.itemCode
//       );

//       if (!original) return false;

//       return (
//         original.oidRate !== item.oidRate ||
//         original.oidAvailable !== item.oidAvailable ||
//         original.discount !== item.discount ||
//         original.freeItemCode !== item.freeItemCode ||
//         original.freeItemName !== item.freeItemName ||
//         original.freeItemQty !== item.freeItemQty ||
//         original.isHappyHour !== item.isHappyHour
//       );
//     });

//     // ✅ no changes
//     if (modifiedItems.length === 0) {
//       toast.error("No changes detected ❌");
//       return;
//     }

//     const payload = {
//       oltCode: String(selectedOutlet),
//       branchCode: appData?.user?.branch_code || "",
//       userCode: String(appData?.user?.userCode || ""),

//       isTaxIncluded: !!appliedTax,
//       taxCode: appliedTax?.taxCode?.toString() || "",
//       taxName: appliedTax?.taxName || "",
//       itemGroup: appliedTax?.itemGroup || "",

//       oltDetails: modifiedItems.map((item) => ({
//         itemCode: item.itemCode,
//         itemName: item.itemName,
//         oidRate: Number(item.oidRate || 0),
//         oidAvailable: item.oidAvailable,
//         discount: Number(item.discount || 0),
//         freeItemCode: item.freeItemCode || "",
//         freeItemName: item.freeItemName || "",
//         freeItemQty: item.freeItemQty || "",
//         isHappyHour: item.isHappyHour,
//         grpCode: item.grpCode,
//       })),
//     };

//     console.log("SAVE PAYLOAD 👉", payload);

//     const res = await createOltItemMaster(payload);

//     if (res?.success) {
//       toast.success(res.message || "Saved successfully ✅");

//       fetchOutletItems(selectedOutlet);
//     } else {
//       toast.error(res?.message || "Failed to save ❌");
//     }
//   } catch (err: any) {
//     console.error(err);

//     toast.error(
//       err?.response?.data?.message ||
//         "Error saving outlet items ❌"
//     );
//   } finally {
//     setLoading(false);
//   }
// };

const handleSave = async (
  taxOverride?: {
    taxCode: number;
    taxName: string;
    itemGroup: string;
  }
) => {
  try {
    setLoading(true);

    const currentTax = taxOverride || appliedTax;

    let modifiedItems: OutletItem[] = [];

    // ✅ If bulk tax applied -> send all items of selected group
    if (currentTax) {
      modifiedItems = data.filter(
        (item) => item.grpCode === selectedGroup
      );
    } else {
      // ✅ Otherwise send only modified rows
      modifiedItems = data.filter((item) => {
        const original = originalData.find(
          (o) => o.itemCode === item.itemCode
        );

        if (!original) return false;

        return (
          original.oidRate !== item.oidRate ||
          original.oidAvailable !== item.oidAvailable ||
          original.discount !== item.discount ||
          original.freeItemCode !== item.freeItemCode ||
          original.freeItemName !== item.freeItemName ||
          original.freeItemQty !== item.freeItemQty ||
          original.isHappyHour !== item.isHappyHour
        );
      });
    }

    if (modifiedItems.length === 0) {
      toast.error("No changes detected ❌");
      return;
    }

    const payload = {
      oltCode: String(selectedOutlet),
      branchCode: appData?.user?.branch_code || "",
      userCode: String(appData?.user?.userCode || ""),

      isTaxIncluded: !!currentTax,
      taxCode: currentTax?.taxCode?.toString() || "",
      taxName: currentTax?.taxName || "",
      itemGroup: currentTax?.itemGroup || "",

      oltDetails: modifiedItems.map((item) => ({
        itemCode: item.itemCode,
        itemName: item.itemName,
        oidRate: Number(item.oidRate || 0),
        oidAvailable: item.oidAvailable,
        discount: Number(item.discount || 0),
        freeItemCode: item.freeItemCode || "",
        freeItemName: item.freeItemName || "",
        freeItemQty: item.freeItemQty || "",
        isHappyHour: item.isHappyHour,
        grpCode: item.grpCode,
      })),
    };

    console.log("SAVE PAYLOAD 👉", payload);

    const res = await createOltItemMaster(payload);

    if (res?.success) {
      toast.success(res.message || "Saved successfully ✅");

      setAppliedTax(null);
      setSelectedTaxCode(0);
      setSelectedGroup(0);

      fetchOutletItems(selectedOutlet);
    } else {
      toast.error(res?.message || "Failed to save ❌");
    }
  } catch (err: any) {
    console.error(err);

    toast.error(
      err?.response?.data?.message ||
        "Error saving outlet items ❌"
    );
  } finally {
    setLoading(false);
  }
};
  return (
    <>
      <Header showNeworderButton={false} />

    <div className="h-[calc(100vh-100px)] overflow-y-auto p-4 md:p-6 bg-gray-50">
      {loading && <Loader />}


      <div className="mt-4 bg-white rounded-xl shadow p-4">
        {/* TOP CONTROLS */}
        <div className="flex flex-wrap items-end gap-6 mb-4">
          {/* OUTLET DROPDOWN */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Select Outlet</label>

            <select
              value={selectedOutlet}
              onChange={(e) => setSelectedOutlet(Number(e.target.value))}
              className="border rounded-lg px-3 py-2 min-w-[250px] focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {outlets.map((outlet) => (
                <option key={outlet.oltCode} value={outlet.oltCode}>
                  {outlet.oltName}
                </option>
              ))}
            </select>
          </div>

          {/* GLOBAL SEARCH */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Search</label>

            <input
              type="text"
              placeholder="Search anything..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded-lg px-3 py-2 min-w-[300px] focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* BULK AMOUNT */}
          <label className="flex items-center gap-2 cursor-pointer font-medium whitespace-nowrap pb-2">
            <input
              type="checkbox"
              checked={showBulkAmountPopup}
              onChange={(e) => setShowBulkAmountPopup(e.target.checked)}
            />
            Bulk Amount Increase
          </label>

          {/* BULK TAX */}
          <label className="flex items-center gap-2 cursor-pointer font-medium whitespace-nowrap pb-2">
            <input
              type="checkbox"
              checked={showBulkTaxPopup}
              onChange={(e) => setShowBulkTaxPopup(e.target.checked)}
            />
            Bulk Tax Increase
          </label>

          {/* ACTION BUTTONS */}
          <div className="flex items-center gap-3 pb-1">
            <button
             onClick={() => handleSave()}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg font-medium shadow-sm transition"
            >
              <Save size={18} />
              Save
            </button>

           <button
  onClick={handlePrint}
  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg font-medium shadow-sm transition"
>
  <Printer size={18} />
  Print
</button>
          </div>
        </div>

        <div className="flex items-center gap-2 pb-2">
          <input
            type="checkbox"
            checked={isAvailableOnly}
            onChange={(e) => setIsAvailableOnly(e.target.checked)}
            className="h-4 w-4  cursor-pointer"
          />

          <span className="text-sm font-medium">Is Available</span>
        </div>

        <h2 className="text-lg font-semibold mb-3">Outlet Item Details</h2>

        <DataTable search={false} columns={columns} data={filteredData} />
      </div>

      {/* BULK TAX POPUP */}
      {showBulkTaxPopup && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-[550px] border border-gray-200 overflow-hidden">
            {/* HEADER */}
            <div className="flex items-center justify-between px-5 py-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-800">
                Bulk Tax Increase
              </h2>

              <button
                onClick={() => setShowBulkTaxPopup(false)}
                className="text-gray-500 hover:text-red-500 text-xl font-bold"
              >
                ×
              </button>
            </div>

            {/* BODY */}
            <div className="p-6 flex items-end gap-4">
              <div className="flex flex-col flex-1">
                <label className="text-sm text-gray-600 mb-1">Group</label>

                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(Number(e.target.value))}
                  className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value={0}>Select Group</option>

                  {groups.map((group) => (
                    <option key={group.grpCode} value={group.grpCode}>
                      {group.grpName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col flex-1">
                <label className="text-sm text-gray-600 mb-1">Tax</label>

                <select
                  value={selectedTaxCode}
                  onChange={(e) => setSelectedTaxCode(Number(e.target.value))}
                  className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value={0}>Select Tax</option>

                  {taxes.map((tax) => (
                    <option key={tax.taxCode} value={tax.taxCode}>
                      {tax.taxName}
                    </option>
                  ))}
                </select>
              </div>
              <button
  onClick={handleApplyTax}
  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg h-[42px]"
>
  Apply
</button>
            </div>
          </div>
        </div>
      )}

      {/* BULK AMOUNT POPUP */}
      {showBulkAmountPopup && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-[700px] border border-gray-200 overflow-hidden">
            {/* HEADER */}
            <div className="flex items-center justify-between px-5 py-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-800">
                Bulk Amount Increase
              </h2>

              <button
                onClick={() => setShowBulkAmountPopup(false)}
                className="text-gray-500 hover:text-red-500 text-xl font-bold"
              >
                ×
              </button>
            </div>

            {/* BODY */}
            <div className="p-6 flex items-end gap-4 flex-wrap">
              <div className="flex flex-col min-w-[180px]">
                <label className="text-sm text-gray-600 mb-1">Group</label>

                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(Number(e.target.value))}
                  className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value={0}>Select Group</option>

                  {groups.map((group) => (
                    <option key={group.grpCode} value={group.grpCode}>
                      {group.grpName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col min-w-[140px]">
                <label className="text-sm text-gray-600 mb-1">Amount</label>

                <input
                  type="text"
                  value={bulkAmount}
                  disabled={!!bulkPercentage}
                  onChange={(e) => setBulkAmount(e.target.value)}
                  className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div className="flex flex-col min-w-[100px]">
                <label className="text-sm text-gray-600 mb-1">%</label>

                <input
                  type="text"
                  value={bulkPercentage}
                  disabled={!!bulkAmount}
                  onChange={(e) => setBulkPercentage(e.target.value)}
                  className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <button
                onClick={handleBulkIncrement}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg h-[42px]"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div></>
  );
}
