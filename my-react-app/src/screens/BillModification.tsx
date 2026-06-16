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
} from "../api/services/products.service";

import { useAppContext } from "../context/AppContext";

export default function BillModify() {
  const { appData } = useAppContext();

  const [loading, setLoading] = useState(false);

  const [outlets, setOutlets] = useState<any[]>([]);
  const [bills, setBills] = useState<any[]>([]);

  const [selectedOutlet, setSelectedOutlet] = useState("");
  const [selectedBill, setSelectedBill] = useState("");
const [modifyData, setModifyData] = useState<any[]>([]);
const [groups, setGroups] = useState<any[]>([]);
const [items, setItems] = useState<any[]>([]);
const [selectedGroup, setSelectedGroup] = useState("");
const [selectedItem, setSelectedItem] = useState("");
  const getToday = () => {
    return new Date().toISOString().split("T")[0];
  };

  const [fromDate, setFromDate] = useState(getToday());
  const [toDate, setToDate] = useState(getToday());

  // ================= FETCH OUTLETS =================

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
        toDate.replaceAll("-", "/")
      );

      const filteredBills = (res || []).filter(
        (item: any) =>
    
          item.ksmBillCancled === false
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

  const bill = bills.find(
    (x: any) => x.ksmId === Number(billId)
  );

  if (!bill) return;

  const kotIdsString = bill.kotIds.join(",");

  try {
    setLoading(true);

    const [modifyRes, groupRes] = await Promise.all([
      getModifyBillData(
        kotIdsString,
        bill.oltCode
      ),
      getItemGroupList(
        appData?.user?.branch_code
      ),
    ]);

    setModifyData(modifyRes || []);
    setGroups(groupRes || []);

    console.log("Modify Response", modifyRes);
  } catch (err: any) {
    toast.error(
      err?.response?.data?.message ||
        "Failed to load bill details"
    );
  } finally {
    setLoading(false);
  }
};
const loadItems = async (grpCode: number) => {
  try {
    const res = await getCombinedOltItemList(
      selectedOutlet,
      appData?.user?.branch_code,
      grpCode
    );

    const flatItems = (res || []).flatMap(
      (cat: any) => cat.items || []
    );

    setItems(flatItems);
  } catch (err) {
    console.error(err);
  }
};

const updateQty = (
  kotId: number,
  itemIndex: number,
  qty: number
) => {
  if (qty < 1) return;

  setModifyData((prev) =>
    prev.map((kot) =>
      kot.kotId === kotId
        ? {
            ...kot,
            food: kot.food.map(
              (item: any, idx: number) =>
                idx === itemIndex
                  ? { ...item, qty }
                  : item
            ),
          }
        : kot
    )
  );
};

const deleteItem = (
  kotId: number,
  itemIndex: number
) => {
  setModifyData((prev) =>
    prev.map((kot) =>
      kot.kotId === kotId
        ? {
            ...kot,
            food: kot.food.filter(
              (_: any, idx: number) =>
                idx !== itemIndex
            ),
          }
        : kot
    )
  );
};
const addItem = () => {
  const item = items.find(
    (x: any) =>
      x.itemCode === Number(selectedItem)
  );

  if (!item || modifyData.length === 0)
    return;

  setModifyData((prev) => {
    const copy = [...prev];

    // add to first KOT
    copy[0].food.push({
      id: item.itemCode,
      food: item.itemName,
      code: String(copy[0].kotId),
      price: item.oidRate,
      qty: 1,
      origQty: 1,
      comment: "",
      category: 0,
      grpCode: Number(selectedGroup),
      itemDiscountAllowed:
        item.itemDiscountAllowed,
    });

    return [...copy];
  });

  setSelectedItem("");
};

const handleSave = () => {
  console.log(
    "Modified Payload",
    modifyData
  );

  toast.success(
    "Check console for payload"
  );
};

  // ================= INITIAL =================

  useEffect(() => {
    fetchOutlets();
  }, []);

  // ================= AUTO FETCH =================

  useEffect(() => {
    if (selectedOutlet && fromDate && toDate) {
      fetchBills();
    }
  }, [selectedOutlet, fromDate, toDate]);



  const billItems = modifyData.flatMap(
  (kot: any) =>
    kot.food.map((item: any) => ({
      ...item,
      kotId: kot.kotId,
    }))
);

const grandTotal = billItems.reduce(
  (sum: number, item: any) =>
    sum + item.price * item.qty,
  0
);
  return (
    <>
      <Header showNeworderButton={false} />

      <div className="h-[calc(100vh-100px)] overflow-y-auto p-4 md:p-6 bg-gray-50">
        {loading && <Loader />}

        <div className="bg-white rounded-xl shadow overflow-hidden">
          {/* HEADER */}
          <div className="p-5 border-b">
            <h2 className="text-lg font-semibold">
              Bill Modify
            </h2>
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
                onChange={(e) =>
                  setSelectedOutlet(e.target.value)
                }
                className="mt-1 w-full border rounded-lg px-3 py-2"
              >
                {outlets.map((o: any) => (
                  <option
                    key={o.oltCode}
                    value={o.oltCode}
                  >
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
                onChange={(e) =>
                  setFromDate(e.target.value)
                }
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
                onChange={(e) =>
                  setToDate(e.target.value)
                }
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
    <h2 className="font-bold text-xl">
      BILL MODIFY
    </h2>

    <div className="mt-3 text-left">
      <div>
        Bill No :
        {
          bills.find(
            (x: any) =>
              x.ksmId ===
              Number(selectedBill)
          )?.ksmBillNo
        }
      </div>

      <div>
        Table :
        {
          bills.find(
            (x: any) =>
              x.ksmId ===
              Number(selectedBill)
          )?.ksmTblNo
        }
      </div>
    </div>
  </div>

  {billItems.map(
    (item: any, idx: number) => (
      <div
        key={idx}
        className="border-b p-4"
      >
        <div className="font-medium">
          {item.food}
        </div>

        <div className="flex justify-between mt-2">

          <div>
            ₹ {item.price}
          </div>

          <div className="flex items-center gap-2">

            <button
            onClick={() => {
  const kot = modifyData.find(
    (k) => k.kotId === item.kotId
  );

  const itemIndex = kot?.food.findIndex(
    (f: any) =>
      f.food === item.food &&
      f.code === item.code
  );

  if (itemIndex >= 0) {
    updateQty(
      item.kotId,
      itemIndex,
      item.qty - 1
    );
  }
}}
              className="border px-2 rounded"
            >
              -
            </button>

            <span>
              {item.qty}
            </span>

          <button
  onClick={() => {
    const kot = modifyData.find(
      (k) => k.kotId === item.kotId
    );

    const itemIndex = kot?.food.findIndex(
      (f: any) =>
        f.food === item.food &&
        f.code === item.code
    );

    if (itemIndex >= 0) {
      updateQty(
        item.kotId,
        itemIndex,
        item.qty + 1
      );
    }
  }}
  className="border px-2 rounded"
>
  +
</button>

            <button
              onClick={() => {
  const kot = modifyData.find(
    (k) => k.kotId === item.kotId
  );

  const itemIndex = kot?.food.findIndex(
    (f: any) =>
      f.food === item.food &&
      f.code === item.code
  );

  if (itemIndex >= 0) {
    deleteItem(
      item.kotId,
      itemIndex
    );
  }
}}          
              className="text-red-600 ml-2"
            >
              Delete
            </button>

          </div>

        </div>

        <div className="text-right text-sm mt-2">
          ₹ {item.price * item.qty}
        </div>
      </div>
    )
  )}

  <div className="p-4 border-b bg-gray-50">

    <div className="flex justify-between font-bold text-lg">

      <span>Total</span>

      <span>
        ₹ {grandTotal}
      </span>

    </div>

  </div>

  <div className="p-4">

    <div className="font-semibold mb-3">
      ADD ITEM
    </div>

    <select
      value={selectedGroup}
      onChange={(e) => {
        setSelectedGroup(
          e.target.value
        );
        loadItems(
          Number(e.target.value)
        );
      }}
      className="w-full border rounded p-2 mb-2"
    >
      <option value="">
        Select Group
      </option>

      {groups.map((grp: any) => (
        <option
          key={grp.grpCode}
          value={grp.grpCode}
        >
          {grp.grpName}
        </option>
      ))}
    </select>

    <select
      value={selectedItem}
      onChange={(e) =>
        setSelectedItem(
          e.target.value
        )
      }
      className="w-full border rounded p-2 mb-3"
    >
      <option value="">
        Select Item
      </option>

      {items.map((item: any) => (
        <option
          key={item.itemCode}
          value={item.itemCode}
        >
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
      </div>
    </>
  );
}