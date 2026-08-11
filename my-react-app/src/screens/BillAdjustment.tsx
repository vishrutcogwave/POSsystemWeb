  import { useEffect, useState } from "react";
  import { useAppContext } from "../context/AppContext";
  import {
    getAdjustmentLoadData,
    getCalculateRankAmount,
    getOutletList,
    newBiddingCheck,
    saveBidChanges,
  } from "../api/services/products.service";
  import toast from "react-hot-toast";
  import Loader from "../components/Loader";

  export default function BillAdjustment() {
    const { appData } = useAppContext();

    const [bills, setBills] = useState<any[]>([]);
    const [items, setItems] = useState<any[]>([]);
    const [groupDetails, setGroupDetails] = useState<any[]>([]);
    const [outlets, setOutlets] = useState<any[]>([]);
    const [outlet, setOutlet] = useState("");

    // Date Range
    const today = new Date().toISOString().split("T")[0];

    const [fromDate, setFromDate] = useState(today);
    const [toDate, setToDate] = useState(today);
    // Amount
    const [amount, setAmount] = useState(0);
    const [loading, setLoading] = useState(false);
    // Adjustment Fields
    const [bidAmount, setBidAmount] = useState(0);
    const [biddingAmount, setBiddingAmount] = useState("");
    const [rankId, setRankId] = useState(0);
    const [estAmount, setEstAmount] = useState(0);
    const [rankByType, setRankByType] = useState("kotno");

    useEffect(() => {
      const loadOutlets = async () => {
        try {
          const res = await getOutletList(appData.user.branch_code);

          if (res.success) {
            setOutlets(res.data);

            if (res.data.length > 0) {
              setOutlet(String(res.data[0].oltCode));
            }
          }
        } catch (err) {
          console.error(err);
        }
      };

      if (appData?.user?.branch_code) {
        loadOutlets();
      }
    }, [appData.user.branch_code]);

    const handleShowBills = async () => {
      setLoading(true);

      try {
        const res = await getAdjustmentLoadData({
          branchCode: appData.user.branch_code,
          oltCode: outlet,
          fromDate: new Date(fromDate).toISOString(),
          toDate: new Date(toDate).toISOString(),
          paymentMode: "cash",
          excludedBills: [""],
          rankByType,
        });

        if (res.success) {
          setBills(res.data.billDetails);
          setItems(res.data.itemDetails);
          setGroupDetails(res.data.groupDetails || []);
          setAmount(res.data.totalAmount);
          setBiddingAmount(res.data.totalAmount);
        }

        setBidAmount(0);
        setRankId(0);
        setEstAmount(0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    const handleAdjust = async () => {
      setLoading(true);

      try {
        const res = await newBiddingCheck(
          rankId,
          Number(bidAmount),
          appData.user.branch_code,
        );

        if (!res.success) {
          toast.error(res.message);
          return;
        }

        setItems(res.data.itemDetails || []);
        toast.success(res.message);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Adjustment failed.");
      } finally {
        setLoading(false);
      }
    };

  const handleSave = async () => {

  if (Number(bidAmount) <= 0) {
    toast.error("Bid Amount must be greater than 0");
    return;
  }

  setLoading(true);

  try {
    const branchCode = appData?.user?.branch_code || "";

    const res = await saveBidChanges({
      branchCode,
      oltCode: outlet,
      fromDate: new Date(fromDate).toISOString(),
      toDate: new Date(toDate).toISOString(),
      finalSaleAmount: Number(bidAmount),
      rankByType,
    });

    // Handle API validation failure
    if (!res.success) {
      toast.error(res.message);
      return;
    }

    // Success
    toast.success(res.message || "Saved successfully");

    // Optional: Refresh data after save
    // handleShowBills();

  } catch (err: any) {
    // Handle HTTP errors (400/500)
    toast.error(
      err?.response?.data?.message ||
      err?.message ||
      "Failed to save bid changes."
    );
  } finally {
    setLoading(false);
  }
};
    return (
      <>
        {loading && <Loader />} 
        <div className="min-h-[calc(100vh-100px)] bg-gray-50 p-4 md:p-6 space-y-6">
          <div className="bg-white rounded-xl shadow p-4 md:p-6">
            {/* Header */}

            {/* Top Controls */}
            <div className="space-y-4">
              {/* First Row */}
              <div className="flex flex-wrap items-end gap-3">
                {/* Outlet */}
                <div className="flex-1 min-w-[180px]">
                  <label className="mb-1 block text-sm font-medium">Outlet</label>
                  <select
                    value={outlet}
                    onChange={(e) => setOutlet(e.target.value)}
                    className="h-10 w-full rounded-md border px-3 text-sm"
                  >
                    {outlets.map((o: any) => (
                      <option key={o.oltCode} value={o.oltCode}>
                        {o.oltName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* From Date */}
                {/* From Date */}
                <div className="flex-1 min-w-[180px]">
                  <label className="mb-1 block text-sm font-medium">
                    From Date
                  </label>

                  <input
                    type="date"
                    value={fromDate}
                    max={toDate || new Date().toISOString().split("T")[0]}
                    onChange={(e) => {
                      setFromDate(e.target.value);

                      if (toDate && e.target.value > toDate) {
                        setToDate(e.target.value);
                      }
                    }}
                    className="h-10 w-full rounded-md border px-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                {/* To Date */}
                <div className="flex-1 min-w-[180px]">
                  <label className="mb-1 block text-sm font-medium">
                    To Date
                  </label>

                  <input
                    type="date"
                    value={toDate}
                    min={fromDate}
                    max={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setToDate(e.target.value)}
                    className="h-10 w-full rounded-md border px-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                {/* Amount */}
                <div className="flex-1 min-w-[180px]">
                  <label className="mb-1 block text-sm font-medium">Amount</label>
                  <input
                    readOnly
                    value={amount}
                    className="h-10 w-full rounded-md border bg-gray-100 px-3 text-sm"
                  />
                </div>

                {/* Show Bills */}

                <button
                  onClick={handleShowBills}
                  className="h-10 px-5 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                >
                  Show Bills
                </button>
              </div>

              {/* Second Row */}
              <div className="flex flex-wrap items-end gap-3">
                {/* Bid Amount */}
                <div className="flex-1 min-w-[180px]">
                  <label className="mb-1 block text-sm font-medium">
                    Bid Amount
                  </label>
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(Number(e.target.value))}
                    className="h-10 w-full rounded-md border px-3 text-sm"
                  />
                </div>

                {/* Bidding Amount */}
                <div className="flex-1 min-w-[180px]">
                  <label className="mb-1 block text-sm font-medium">
                    Bidding Amount
                  </label>
                  <input
                    type="number"
                    value={biddingAmount}
                    onChange={(e) => setBiddingAmount(e.target.value)}
                    className="h-10 w-full rounded-md border px-3 text-sm"
                  />
                </div>

                {/* Rank Id */}
                <div className="flex-1 min-w-[180px]">
                  <label className="mb-1 block text-sm font-medium">
                    Rank Id
                  </label>
                  <input
                    type="number"
                    value={rankId}
                    onChange={async (e) => {
                      const value = Number(e.target.value);

                      setRankId(value);
                      setLoading(true);
                      try {
                        const res = await getCalculateRankAmount(
                          value,
                          amount,
                          appData.user.branch_code,
                        );

                        if (!res.success) {
                          toast.error(res.message);
                          setEstAmount(0);
                          setBidAmount(0);
                          return;
                        }

                        setEstAmount(res.data.estimatedAmount);
                        setBidAmount(res.data.bidAmount);

                        // Optional success message
                        // toast.success(res.message);
                      } catch (err: any) {
                        console.error(err);

                        toast.error(
                          err?.response?.data?.message ||
                            "Failed to calculate rank amount.",
                        );
                      } finally {
                        setLoading(false);
                      }
                    }}
                    className="h-10 w-full rounded-md border px-3 text-sm"
                  />
                </div>

                {/* Est Amount */}
                <div className="flex-1 min-w-[180px]">
                  <label className="mb-1 block text-sm font-medium">
                    Est Amount
                  </label>
                  <input
                    readOnly
                    value={estAmount}
                    className="h-10 w-full rounded-md border bg-gray-100 px-3 text-sm"
                  />
                </div>

                {/* Save */}
                <button onClick={handleSave} className="h-10 px-5 rounded-md bg-green-600 text-white hover:bg-green-700 whitespace-nowrap">
                  Save
                </button>

                {/* Refresh */}
                <button
                  onClick={handleAdjust}
                  className="h-10 px-5 rounded-md bg-orange-500 text-white hover:bg-orange-600 whitespace-nowrap"
                >
                  Refresh
                </button>
              </div>
            </div>
            {/* Tables */}

            <div className="grid grid-cols-1 gap-4 p-4 xl:grid-cols-12">
              {/* Items Table */}

              <div className="xl:col-span-9">
                <div className="overflow-hidden rounded-lg border shadow-sm">
                  <div className="max-h-[520px] overflow-auto">
                    <table className="min-w-full text-sm">
                      <thead className="sticky top-0 bg-blue-500 text-white">
                        <tr>
                          <th className="border px-3 py-2">Bill</th>
                          <th className="border px-3 py-2">KOT</th>
                          <th className="border px-3 py-2 text-left">
                            Item Name
                          </th>
                          <th className="border px-3 py-2">Qty</th>
                          <th className="border px-3 py-2">Rate</th>
                          <th className="border px-3 py-2">Amount</th>
                          <th className="border px-3 py-2">Check</th>
                          <th className="border px-3 py-2">Rank</th>
                        </tr>
                      </thead>

                      <tbody>
                        {items.map((item: any, index: number) => (
                          <tr
                            key={index}
                            className="hover:bg-blue-50 even:bg-gray-50"
                          >
                            <td className="border px-3 py-2 text-center">
                              {item.billNo}
                            </td>

                            <td className="border px-3 py-2 text-center">
                              {item.kotNo}
                            </td>

                            <td className="border px-3 py-2">{item.itemName}</td>

                            <td className="border px-3 py-2 text-center">
                              {item.qty}
                            </td>

                            <td className="border px-3 py-2 text-right">
                              ₹{item.kotRate}
                            </td>

                            <td className="border px-3 py-2 text-right">
                              ₹{item.amount}
                            </td>

                            <td className="border px-3 py-2 text-center">
                              <span
                                className={`inline-flex rounded px-2 py-1 text-xs font-semibold ${
                                  item.chk === "Y"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {item.chk}
                              </span>
                            </td>

                            <td className="border px-3 py-2 text-center">
                              {item.rankId}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Bills Table */}

              <div className="xl:col-span-3">
                <div className="overflow-hidden rounded-lg border shadow-sm">
                  <div className="max-h-[520px] overflow-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-blue-500 text-white">
                        <tr>
                          <th className="border px-3 py-2 text-left">Bill</th>

                          <th className="border px-3 py-2">Amount</th>

                          <th className="border px-3 py-2">Mode</th>
                        </tr>
                      </thead>

                      <tbody>
                        {bills.map((bill: any) => (
                          <tr
                            key={bill.billNo}
                            onClick={() => {
                              setAmount(bill.billAmount);
                            }}
                            className="cursor-pointer transition hover:bg-blue-50"
                          >
                            <td className="border px-3 py-2 text-center">
                              {bill.billNo}
                            </td>

                            <td className="border px-3 py-2 text-right">
                              ₹{bill.billAmount}
                            </td>

                            <td className="border px-3 py-2 text-center">
                              {bill.paymentMode}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Footer */}
        <div className="sticky bottom-0 z-20 mt-4 flex items-center justify-between border-t bg-white px-5 py-3 shadow-[0_-2px_8px_rgba(0,0,0,0.08)]">
          <div className="flex items-center gap-6">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Rank By
            </span>

            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
              <input
                type="radio"
                name="rankBy"
                value="kotno"
                checked={rankByType === "kotno"}
                onChange={(e) => setRankByType(e.target.value)}
                className="h-4 w-4 text-blue-600"
              />
              KOT NO
            </label>

            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
              <input
                type="radio"
                name="rankBy"
                value="ksmid"
                checked={rankByType === "ksmid"}
                onChange={(e) => setRankByType(e.target.value)}
                className="h-4 w-4 text-blue-600"
              />
              KSMID
            </label>
          </div>

          <div className="flex items-center gap-6">
            {groupDetails.map((group) => (
              <div key={group.groupwise} className="text-sm text-gray-600">
                <span className="font-medium">{group.groupwise} :</span>
                <span className="ml-2 text-lg font-bold text-green-600">
                  ₹{group.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }
