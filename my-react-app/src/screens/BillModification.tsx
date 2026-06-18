import { useEffect, useState } from "react";

import Header from "../components/Header";
import toast from "react-hot-toast";
import Loader from "../components/Loader";

import {
  getBillDetails,
  getOutletList,
  getModifyBillData,
  getCombinedOltItemList,
  getItemGroupList,
  getDiscountModeMaster,
} from "../api/services/products.service";

import { useAppContext } from "../context/AppContext";
import { Trash2 } from "lucide-react";

export default function BillModify() {
  const { appData } = useAppContext();

  const [loading, setLoading] = useState(false);
  const [discountModes, setDiscountModes] = useState<any[]>([]);
  const [outlets, setOutlets] = useState<any[]>([]);
  const [bills, setBills] = useState<any[]>([]);

  const [selectedOutlet, setSelectedOutlet] = useState("");
  const [selectedBill, setSelectedBill] = useState("");
  const [modifyData, setModifyData] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [discountType, setDiscountType] = useState("");
  const [discountValue, setDiscountValue] = useState("");
  const [discountMode, setDiscountMode] = useState<"amt" | "per">("amt");
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [deleteItemData, setDeleteItemData] = useState<{
    kotId: number;
    itemId: number;
    itemName: string;
  } | null>(null);
  const getToday = () => {
    return new Date().toISOString().split("T")[0];
  };

  const [fromDate, setFromDate] = useState(getToday());
  const [toDate, setToDate] = useState(getToday());

  // ================= FETCH OUTLETS =================
  const fetchDiscountTypes = async () => {
    try {
      const branch = localStorage.getItem("branch") || "";

      const data = await getDiscountModeMaster(branch);

      setDiscountModes(data || []);
    } catch (err) {
      console.error("Discount fetch failed", err);
    }
  };
  const fetchOutlets = async () => {
    try {
      const res = await getOutletList(appData?.user?.branch_code);

      if (res?.success) {
        const outletData = res?.data || [];

        setOutlets(outletData);

        if (outletData.length > 0) {
          setSelectedOutlet(outletData[0]?.oltCode?.toString());
        }
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load outlets");
    }
  };

  // ================= FETCH BILLS =================

  const fetchBills = async () => {
    if (!selectedOutlet) return;

    try {
      setLoading(true);

      const res = await getBillDetails(
        Number(selectedOutlet),
        appData?.user?.branch_code,
        fromDate.replaceAll("-", "/"),
        toDate.replaceAll("-", "/"),
      );

      const filteredBills = (res || []).filter(
        (item: any) => item.ksmBillCancled === false,
      );

      setBills(filteredBills);
      setSelectedBill("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to fetch bills");
    } finally {
      setLoading(false);
    }
  };

  // ================= BILL SELECT =================

  const handleBillSelect = async (billId: string) => {
    setSelectedBill(billId);

    const bill = bills.find((x: any) => x.ksmId === Number(billId));

    if (!bill) return;

    const kotIdsString = bill.kotIds.join(",");
    const branchcode = localStorage.getItem("branchCode");

    try {
      setLoading(true);

      const [modifyRes, groupRes] = await Promise.all([
        getModifyBillData(
          kotIdsString,
          bill.oltCode,
          bill?.ksmBillNo,
          branchcode,
        ),
        getItemGroupList(appData?.user?.branch_code),
      ]);

      console.log("Modify Response", modifyRes);

      // KOT DATA
      setModifyData(modifyRes?.kotDetails ? [modifyRes.kotDetails] : []);

      // DISCOUNT DATA
      const discount = modifyRes?.discountDetails;

      if (discount) {
        setDiscountType(discount.discountType || "");

        setDiscountMode(discount.discountIn === "per" ? "per" : "amt");

        setDiscountValue(
          String(
            discount.discountIn === "per"
              ? discount.amountperc || 0
              : discount.discamount || 0,
          ),
        );

        setSelectedGroups(
          discount.grpcode
            ? discount.grpcode.split(",").map((x: string) => x.trim())
            : [],
        );
      } else {
        setDiscountType("");
        setDiscountMode("amt");
        setDiscountValue("");
        setSelectedGroups([]);
      }

      setGroups(groupRes || []);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to load bill details",
      );
    } finally {
      setLoading(false);
    }
  };
  // const handleBillSelect = async (billId: string) => {
  //   setSelectedBill(billId);

  //   const bill = bills.find((x: any) => x.ksmId === Number(billId));

  //   if (!bill) return;

  //   try {
  //     setLoading(true);

  //     const groupRes = await getItemGroupList(appData?.user?.branch_code);

  //     // use existing bill data directly
  //     setModifyData([
  //       {
  //         kotTblNo: "1",
  //         oltCode: 1,
  //         branchcode: "DEROY",
  //         kotSeatsServed: 2,
  //         food: [
  //           {
  //             kotId: 1,
  //             id: 3,
  //             food: "POORI BHAJI",
  //             code: "1",
  //             price: 200,
  //             qty: 1,
  //             comment: "",
  //             category: 1,
  //             grpCode: 1,
  //             origQty: 1,
  //             itemDiscountAllowed: true,
  //           },
  //           {
  //             kotId: 1,
  //             id: 4,
  //             food: "IDLY VADA",
  //             code: "1",
  //             price: 200,
  //             qty: 1,
  //             comment: "",
  //             category: 1,
  //             grpCode: 1,
  //             origQty: 1,
  //             itemDiscountAllowed: true,
  //           },
  //           {
  //             kotId: 2,
  //             id: 4,
  //             food: "IDLY VADA",
  //             code: "2",
  //             price: 200,
  //             qty: 8,
  //             comment: "",
  //             category: 1,
  //             grpCode: 1,
  //             origQty: 1,
  //             itemDiscountAllowed: true,
  //           },
  //           {
  //             kotId: 2,
  //             id: 360,
  //             food: "POHA",
  //             code: "2",
  //             price: 200,
  //             qty: 1,
  //             comment: "",
  //             category: 1,
  //             grpCode: 1,
  //             origQty: 1,
  //             itemDiscountAllowed: true,
  //           },
  //         ],
  //       },
  //     ]);

  //     setGroups(groupRes || []);

  //     console.log("Modify Response", [
  //       {
  //         kotTblNo: "1",
  //         oltCode: 1,
  //         branchcode: "DEROY",
  //         kotSeatsServed: 2,
  //         food: [
  //           {
  //             kotId: 1,
  //             id: 3,
  //             food: "POORI BHAJI",
  //             code: "1",
  //             price: 200,
  //             qty: 1,
  //             comment: "",
  //             category: 1,
  //             grpCode: 1,
  //             origQty: 1,
  //             itemDiscountAllowed: true,
  //           },
  //           {
  //             kotId: 1,
  //             id: 4,
  //             food: "IDLY VADA",
  //             code: "1",
  //             price: 200,
  //             qty: 1,
  //             comment: "",
  //             category: 1,
  //             grpCode: 1,
  //             origQty: 1,
  //             itemDiscountAllowed: true,
  //           },
  //           {
  //             kotId: 2,
  //             id: 4,
  //             food: "IDLY VADA",
  //             code: "2",
  //             price: 200,
  //             qty: 1,
  //             comment: "",
  //             category: 1,
  //             grpCode: 1,
  //             origQty: 1,
  //             itemDiscountAllowed: true,
  //           },
  //           {
  //             kotId: 2,
  //             id: 360,
  //             food: "POHA",
  //             code: "2",
  //             price: 200,
  //             qty: 1,
  //             comment: "",
  //             category: 1,
  //             grpCode: 1,
  //             origQty: 1,
  //             itemDiscountAllowed: true,
  //           },
  //         ],
  //       },
  //     ]);
  //   } catch (err: any) {
  //     toast.error(
  //       err?.response?.data?.message || "Failed to load bill details",
  //     );
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const loadItems = async (grpCode: number) => {
    setLoading(true);
    try {
      const res = await getCombinedOltItemList(
        selectedOutlet,
        appData?.user?.branch_code,
        grpCode,
      );

      const flatItems = (res || []).flatMap((cat: any) => cat.items || []);

      setItems(flatItems);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateQty = (kotId: number, itemId: number, qty: number) => {
    if (qty < 1) return;

    setModifyData((prev) =>
      prev.map((bill) => ({
        ...bill,
        food: bill.food.map((food: any) =>
          food.kotId === kotId && food.id === itemId ? { ...food, qty } : food,
        ),
      })),
    );
  };

  const addItem = () => {
    const item = items.find((x: any) => x.itemCode === Number(selectedItem));

    if (!item || modifyData.length === 0) return;

    setModifyData((prev) =>
      prev.map((bill) => ({
        ...bill,
        food: [
          ...bill.food,
          {
            kotId: billItems[0]?.kotId || 0,
            id: item.itemCode,
            food: item.itemName,
            code: String(billItems[0]?.kotId || 0),
            price: item.oidRate,
            qty: 1,
            origQty: 1,
            comment: "",
            category: 0,
            grpCode: Number(selectedGroup),
            itemDiscountAllowed: item.itemDiscountAllowed,
          },
        ],
      })),
    );

    setSelectedItem("");
  };

  const handleSave = () => {
    console.log("Modified Payload", modifyData);

    toast.success("Check console for payload");
  };

  // ================= INITIAL =================

  useEffect(() => {
    fetchOutlets();
    fetchDiscountTypes();
  }, []);
  // ================= AUTO FETCH =================

  useEffect(() => {
    if (selectedOutlet && fromDate && toDate) {
      fetchBills();
    }
  }, [selectedOutlet, fromDate, toDate]);

  const billItems = modifyData.flatMap((bill: any) =>
    bill.food.map((item: any) => ({
      ...item,
      kotId: item.kotId,
    })),
  );

  const deleteItem = (kotId: number, itemId: number, itemName: string) => {
    setModifyData((prev) =>
      prev.map((bill) => ({
        ...bill,
        food: bill.food.filter(
          (food: any) => !(food.kotId === kotId && food.id === itemId),
        ),
      })),
    );

    toast.success(`${itemName} deleted`);
  };
  return (
    <>
      <Header showNeworderButton={false} />

      <div className="h-[calc(100vh-100px)] overflow-y-auto p-4 md:p-6 bg-gray-50">
        {loading && <Loader />}

        <div className="bg-white rounded-xl shadow overflow-hidden">
          {/* HEADER */}
          <div className="p-5 border-b">
            <h2 className="text-lg font-semibold">Bill Modify</h2>
          </div>

          {/* FILTERS */}

          <div className="p-5 grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* OUTLET */}

            <div>
              <label className="text-xs text-gray-500 font-medium">
                OUTLET
              </label>

              <select
                value={selectedOutlet}
                onChange={(e) => setSelectedOutlet(e.target.value)}
                className="mt-1 w-full border rounded-lg px-3 py-2"
              >
                {outlets.map((o: any) => (
                  <option key={o.oltCode} value={o.oltCode}>
                    {o.oltName}
                  </option>
                ))}
              </select>
            </div>

            {/* FROM DATE */}

            <div>
              <label className="text-xs text-gray-500 font-medium">
                FROM DATE
              </label>

              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="mt-1 w-full border rounded-lg px-3 py-2"
              />
            </div>

            {/* TO DATE */}

            <div>
              <label className="text-xs text-gray-500 font-medium">
                TO DATE
              </label>

              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="mt-1 w-full border rounded-lg px-3 py-2"
              />
            </div>

            {/* BILL NO */}

            <div className="relative z-50">
              <label className="text-xs text-gray-500 font-medium">
                BILL NO
              </label>

              <select
                value={selectedBill}
                onChange={(e) => handleBillSelect(e.target.value)}
                className="mt-1 w-full border rounded-lg px-3 py-2"
              >
                <option value="">Select Bill</option>

                {bills.map((bill: any) => (
                  <option key={bill.ksmId} value={bill.ksmId}>
                    {bill.ksmBillNo}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {modifyData.length > 0 && (
            <div className="p-5">
              <div className="max-w-md mx-auto bg-white border shadow-sm rounded-lg overflow-hidden">
                <div className="text-center p-4 border-b">
                  <h2 className="font-bold text-xl">BILL MODIFY</h2>

                  <div className="mt-3 text-left">
                    <div>
                      Bill No :
                      {
                        bills.find((x: any) => x.ksmId === Number(selectedBill))
                          ?.ksmBillNo
                      }
                    </div>

                    <div>
                      Table :
                      {
                        bills.find((x: any) => x.ksmId === Number(selectedBill))
                          ?.ksmTblNo
                      }
                    </div>
                  </div>
                </div>

                {billItems.map((item: any, idx: number) => (
                  <div key={idx} className="border-b p-4">
                    <div className="font-medium">{item.food} </div>

                    <div className="flex justify-between mt-2">
                      <div>₹ {item.price}</div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateQty(item.kotId, item.id, item.qty - 1)
                          }
                          className="border px-2 rounded"
                        >
                          -
                        </button>

                        <span>{item.qty}</span>

                        <button
                          onClick={() =>
                            updateQty(item.kotId, item.id, item.qty + 1)
                          }
                          className="border px-2 rounded"
                        >
                          +
                        </button>
                        <button
                          onClick={() =>
                            setDeleteItemData({
                              kotId: item.kotId,

                              itemId: item.id,

                              itemName: item.food,
                            })
                          }
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-600 hover:bg-red-100"
                          title="Delete Item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="p-4 border-t bg-gray-50">
                  <div className="font-semibold mb-3">Discount</div>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {/* Discount Type */}
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value)}
                      className="border rounded p-2"
                    >
                      <option value="">Select Type</option>

                      {discountModes.map((item: any) => (
                        <option key={item.discId} value={item.discountType}>
                          {item.discountType}
                        </option>
                      ))}
                    </select>

                    {/* Amount / Percentage */}
                    <select
                      value={discountMode}
                      onChange={(e) =>
                        setDiscountMode(e.target.value as "amt" | "per")
                      }
                      className="border rounded p-2"
                    >
                      <option value="amt">₹ Amount</option>

                      <option value="per">Percentage %</option>
                    </select>
                  </div>

                  {discountType === "Groupwise" && (
                    <div className="mb-3 max-h-32 overflow-y-auto border rounded p-2">
                      {groups.map((grp: any) => (
                        <label
                          key={grp.grpCode}
                          className="flex items-center gap-2 text-sm mb-1"
                        >
                          <input
                            type="checkbox"
                            checked={selectedGroups.includes(
                              String(grp.grpCode),
                            )}
                            onChange={() => {
                              const code = String(grp.grpCode);

                              setSelectedGroups(
                                selectedGroups.includes(code)
                                  ? selectedGroups.filter((x) => x !== code)
                                  : [...selectedGroups, code],
                              );
                            }}
                          />

                          {grp.grpName}
                        </label>
                      ))}
                    </div>
                  )}

                  <input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder={
                      discountMode === "per" ? "Enter %" : "Enter Amount"
                    }
                    className="w-full border rounded p-2"
                  />

                  <div className="mt-2 text-xs text-gray-500">
                    Type: {discountType || "-"} | Mode: {discountMode} | Value:{" "}
                    {discountValue || 0}
                  </div>
                </div>

                <div className="p-4">
                  <div className="font-semibold mb-3">ADD ITEM</div>

                  <select
                    value={selectedGroup}
                    onChange={(e) => {
                      setSelectedGroup(e.target.value);
                      loadItems(Number(e.target.value));
                    }}
                    className="w-full border rounded p-2 mb-2"
                  >
                    <option value="">Select Group</option>

                    {groups.map((grp: any) => (
                      <option key={grp.grpCode} value={grp.grpCode}>
                        {grp.grpName}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedItem}
                    onChange={(e) => setSelectedItem(e.target.value)}
                    className="w-full border rounded p-2 mb-3"
                  >
                    <option value="">Select Item</option>

                    {items.map((item: any) => (
                      <option key={item.itemCode} value={item.itemCode}>
                        {item.itemName}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={addItem}
                    className="w-full bg-blue-600 text-white py-2 rounded"
                  >
                    ADD ITEM
                  </button>
                </div>

                <div className="p-4 border-t">
                  <button
                    onClick={handleSave}
                    className="w-full bg-green-600 text-white py-3 rounded font-medium"
                  >
                    SAVE MODIFICATION
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        {deleteItemData && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
            <div className="bg-white rounded-xl p-5 w-[90%] max-w-sm shadow-xl">
              <h3 className="text-lg font-semibold mb-2">Delete Item</h3>

              <p className="text-gray-600 mb-4">
                Are you sure you want to delete{" "}
                <span className="font-semibold">{deleteItemData.itemName}</span>
                ?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteItemData(null)}
                  className="flex-1 border rounded-lg py-2"
                >
                  Cancel
                </button>

                <button
                  onClick={async () => {
                    deleteItem(
                      deleteItemData.kotId,
                      deleteItemData.itemId,
                      deleteItemData.itemName,
                    );

                    setDeleteItemData(null);
                  }}
                  className="flex-1 bg-red-600 text-white rounded-lg py-2"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
