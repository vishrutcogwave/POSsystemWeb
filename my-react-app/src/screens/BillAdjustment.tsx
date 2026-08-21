  import { useEffect, useState } from "react";
  import { useAppContext } from "../context/AppContext";
  import { Lock } from "lucide-react";
  import {
    getAdjustmentLoadData,
    getCalculateRankAmount,
    getOutletList,
    getSecoundUserAccessMaster,
    newBiddingCheck,
    saveBidChanges,
    updateSecoundUserAccessDetail,
  } from "../api/services/products.service";
  import toast from "react-hot-toast";
  import Loader from "../components/Loader";

  export default function BillAdjustment() {
    const { appData } = useAppContext();

const [isUnlocked, setIsUnlocked] = useState(false);
const [password, setPassword] = useState("");
const [passwordError, setPasswordError] = useState("");
const [secondUserId, setSecondUserId] = useState(0);
const [secondUserPassword, setSecondUserPassword] = useState("");
const [passwordLoading, setPasswordLoading] = useState(false);

const [showChangePin, setShowChangePin] = useState(false);

const [oldPin, setOldPin] = useState("");
const [newPin, setNewPin] = useState("");
const [confirmPin, setConfirmPin] = useState("");

const [changePinError, setChangePinError] = useState("");
const [changingPin, setChangingPin] = useState(false);

useEffect(() => {
  const loadSecondUserAccess = async () => {
    if (!appData?.user?.branch_code) return;

    try {
      setPasswordLoading(true);

      const res = await getSecoundUserAccessMaster(
        appData.user.branch_code
      );

      if (res.success && res.data) {
        setSecondUserId(res.data.secoundUserId);
        setSecondUserPassword(res.data.secondUserPassword);
      } else {
        setSecondUserId(0);
        setSecondUserPassword("");
        setPasswordError(
          res.message || "Second user access details not found"
        );
      }
    } catch (error: any) {
      console.error("Error loading second user access:", error);

      setPasswordError(
        error?.response?.data?.message ||
          "Failed to load access details"
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  loadSecondUserAccess();
}, [appData?.user?.branch_code]);
const handleChangePin = async () => {
  setChangePinError("");

  // Old PIN validation
  if (!oldPin) {
    setChangePinError("Please enter old PIN");
    return;
  }

  if (oldPin !== secondUserPassword) {
    setChangePinError("Old PIN is incorrect");
    return;
  }

  // New PIN validation
  if (!newPin) {
    setChangePinError("Please enter new PIN");
    return;
  }

  if (newPin.length < 4) {
    setChangePinError("PIN must be at least 4 characters");
    return;
  }

  // Confirm PIN
  if (newPin !== confirmPin) {
    setChangePinError("New PIN and confirm PIN do not match");
    return;
  }

  if (newPin === oldPin) {
    setChangePinError("New PIN must be different from old PIN");
    return;
  }

  try {
    setChangingPin(true);

    const res = await updateSecoundUserAccessDetail({
      secoundUserId: secondUserId,
      secondUserPassword: newPin,
      branchCode: appData.user.branch_code,
    });

    if (!res.success) {
      setChangePinError(
        res.message || "Failed to update PIN"
      );
      return;
    }

    // Update local password after successful API call
    setSecondUserPassword(newPin);

    toast.success(
      res.message || "PIN changed successfully"
    );

    // Clear fields
    setOldPin("");
    setNewPin("");
    setConfirmPin("");
    setChangePinError("");

    // Go back to login popup
    setShowChangePin(false);

  } catch (error: any) {
    setChangePinError(
      error?.response?.data?.message ||
        "Failed to update PIN"
    );
  } finally {
    setChangingPin(false);
  }
};
const handleUnlock = () => {
  if (passwordLoading) {
    return;
  }

  if (!secondUserPassword) {
    setPasswordError("Second user password is not configured");
    return;
  }

  if (password === secondUserPassword) {
    setIsUnlocked(true);
    setPassword("");
    setPasswordError("");
  } else {
    setPasswordError("Incorrect password");
    setPassword("");
  }
};
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

  if (
    isUnlocked &&
    appData?.user?.branch_code
  ) {
    loadOutlets();
  }
}, [isUnlocked, appData?.user?.branch_code]);
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
    {/* PASSWORD POPUP */}
{!isUnlocked && (
  <>
    {/* MAIN PIN POPUP */}
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[90%] max-w-sm rounded-2xl bg-white p-6 shadow-2xl">

        {/* Icon */}
        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#0576B2]/10">
            <Lock
              size={32}
              className="text-[#0576B2]"
            />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-center text-2xl font-bold text-gray-800">
          Bill Adjustment
        </h2>

        <p className="mt-2 text-center text-gray-500">
          Enter PIN to continue
        </p>

        {/* PIN */}
        <input
          type="password"
          placeholder={
            passwordLoading
              ? "Loading..."
              : "Enter PIN"
          }
          value={password}
          disabled={passwordLoading}
          autoFocus
          onChange={(e) => {
            setPassword(e.target.value);
            setPasswordError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleUnlock();
            }
          }}
          className="mt-6 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#0576B2] focus:ring-2 focus:ring-[#0576B2]/20 disabled:bg-gray-100"
        />

        {/* Error */}
        {passwordError && (
          <p className="mt-3 text-center text-sm text-red-500">
            {passwordError}
          </p>
        )}

        {/* Unlock */}
        <button
          onClick={handleUnlock}
          disabled={passwordLoading || !password}
          className="mt-6 w-full rounded-lg bg-[#0576B2] py-3 font-semibold text-white hover:bg-[#046191] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {passwordLoading ? "Loading..." : "Unlock"}
        </button>

        {/* Change PIN */}
        <button
          type="button"
          onClick={() => {
            setShowChangePin(true);

            setPassword("");
            setPasswordError("");

            setOldPin("");
            setNewPin("");
            setConfirmPin("");
            setChangePinError("");
          }}
          disabled={passwordLoading}
          className="mt-4 w-full text-sm font-semibold text-[#0576B2] hover:underline disabled:cursor-not-allowed disabled:opacity-50"
        >
          Change PIN
        </button>

      </div>
    </div>

    {/* CHANGE PIN POPUP */}
    {showChangePin && (
      <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm">

        <div className="w-[90%] max-w-sm rounded-2xl bg-white p-6 shadow-2xl">

          {/* Icon */}
          <div className="mb-4 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0576B2]/10">
              <Lock
                size={28}
                className="text-[#0576B2]"
              />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-center text-xl font-bold text-gray-800">
            Change PIN
          </h2>

          <p className="mt-1 text-center text-sm text-gray-500">
            Update your Bill Adjustment PIN
          </p>

          {/* Old PIN */}
          <div className="mt-5">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Old PIN
            </label>

            <input
              type="password"
              value={oldPin}
              placeholder="Enter old PIN"
              onChange={(e) => {
                setOldPin(e.target.value);
                setChangePinError("");
              }}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#0576B2] focus:ring-2 focus:ring-[#0576B2]/20"
            />
          </div>

          {/* New PIN */}
          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              New PIN
            </label>

            <input
              type="password"
              value={newPin}
              placeholder="Enter new PIN"
              onChange={(e) => {
                setNewPin(e.target.value);
                setChangePinError("");
              }}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#0576B2] focus:ring-2 focus:ring-[#0576B2]/20"
            />
          </div>

          {/* Confirm PIN */}
          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Confirm New PIN
            </label>

            <input
              type="password"
              value={confirmPin}
              placeholder="Confirm new PIN"
              onChange={(e) => {
                setConfirmPin(e.target.value);
                setChangePinError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleChangePin();
                }
              }}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#0576B2] focus:ring-2 focus:ring-[#0576B2]/20"
            />
          </div>

          {/* Error */}
          {changePinError && (
            <p className="mt-3 text-center text-sm text-red-500">
              {changePinError}
            </p>
          )}

          {/* Update PIN */}
          <button
            onClick={handleChangePin}
            disabled={changingPin}
            className="mt-5 w-full rounded-lg bg-[#0576B2] py-3 font-semibold text-white hover:bg-[#046191] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {changingPin ? "Updating..." : "Update PIN"}
          </button>

          {/* Cancel */}
          <button
            type="button"
            onClick={() => {
              setShowChangePin(false);

              setOldPin("");
              setNewPin("");
              setConfirmPin("");
              setChangePinError("");
            }}
            disabled={changingPin}
            className="mt-3 w-full py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>

        </div>
      </div>
    )}
  </>
)}

    {/* BILL ADJUSTMENT CONTENT */}
    {isUnlocked && (
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
              <button
                  onClick={handleAdjust}
                  className="h-10 px-5 rounded-md bg-orange-500 text-white hover:bg-orange-600 whitespace-nowrap"
                >
                  Refresh
                </button>
                {/* Save */}
                <button onClick={handleSave} className="h-10 px-5 rounded-md bg-green-600 text-white hover:bg-green-700 whitespace-nowrap">
                  Save
                </button>

                {/* Refresh */}
               
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
           {/* Footer */}
        <div className="sticky bottom-0 z-20 mt-4 flex items-center justify-between border-t bg-white px-5 py-3 shadow-[0_-2px_8px_rgba(0,0,0,0.08)]">

          {/* your existing footer */}

        </div>

      </>
    )}
  </>
);
  }
