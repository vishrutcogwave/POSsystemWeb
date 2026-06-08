// import React, {
//   useEffect,
//   useState,
// } from "react";

// import toast from "react-hot-toast";

// import Loader from "./Loader";

// import {
//   cancelBill,
//   getBillDetails,
//   getOutletList,
// } from "../api/services/products.service";

// import { useAppContext } from "../context/AppContext";

// interface Props {
//   isOpen: boolean;
//   onClose: () => void;
// }

// const BillCancellationPopup: React.FC<Props> = ({
//   isOpen,
//   onClose,
// }) => {
//   const { appData } =
//     useAppContext();

//   const [loading, setLoading] =
//     useState(false);

//   const [outlets, setOutlets] =
//     useState<any[]>([]);

//   const [bills, setBills] =
//     useState<any[]>([]);

//   const [selectedOutlet,
//     setSelectedOutlet] =
//     useState("");

//   const [selectedBill,
//     setSelectedBill] =
//     useState<any>(null);

//   const [reason, setReason] =
//     useState("");

//   const getToday = () => {
//     return new Date()
//       .toISOString()
//       .split("T")[0];
//   };

//   const [fromDate,
//     setFromDate] =
//     useState(getToday());

//   const [toDate,
//     setToDate] =
//     useState(getToday());

// const fetchOutlets =
//   async () => {
//     try {
//       const res =
//         await getOutletList(
//           appData?.user
//             ?.branch_code
//         );

//       console.log(
//         "Outlet Response",
//         res
//       );

//       if (res?.success) {
//         setOutlets(
//           res?.data || []
//         );
//       }
//     } catch (err: any) {
//       console.error(err);

//       toast.error(
//         err?.response?.data
//           ?.message ||
//           "Failed to load outlets"
//       );
//     }
//   };


//   const fetchBills =
//     async () => {
//       if (!selectedOutlet) {
//         toast.error(
//           "Select outlet"
//         );

//         return;
//       }

//       try {
//         setLoading(true);

//         const res =
//           await getBillDetails(
//             Number(
//               selectedOutlet
//             ),
//             appData?.user
//               ?.branch_code,
//             fromDate.replaceAll(
//               "-",
//               "/"
//             ),
//             toDate.replaceAll(
//               "-",
//               "/"
//             )
//           );

//         setBills(res || []);
//       } catch (err: any) {
//         toast.error(
//           err?.response?.data
//             ?.message ||
//             "Failed to fetch bills"
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//   const handleCancelBill =
//     async () => {
//       if (!selectedBill) {
//         toast.error(
//           "Select bill"
//         );

//         return;
//       }

//       if (!reason.trim()) {
//         toast.error(
//           "Enter reason"
//         );

//         return;
//       }

//       try {
//         setLoading(true);

//         const payload = {
//           outlet: Number(
//             selectedOutlet
//           ),

//           billNo:
//             selectedBill
//               ?.ksmBillNo,

//           branch:
//             appData?.user
//               ?.branch_code,

//           billDate:
//             selectedBill
//               ?.ksmBillDate,

//           userId:
//             appData?.user
//               ?.userCode,

//           reason,
//         };

//         const res =
//           await cancelBill(
//             payload
//           );

//         toast.success(
//           res?.message ||
//             "Bill Cancelled Successfully"
//         );

//         fetchBills();

//         setReason("");

//         setSelectedBill(
//           null
//         );
//       } catch (err: any) {
//         toast.error(
//           err?.response?.data
//             ?.message ||
//             "Failed to cancel bill"
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//   useEffect(() => {
//     if (!isOpen) return;

//     fetchOutlets();

//     setBills([]);

//     setSelectedBill(null);

//     setReason("");
//   }, [isOpen]);

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-3">

//       {loading &&
//         <Loader />}

//       <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden">

//         {/* HEADER */}

//         <div className="bg-[#0576B2] text-white px-5 py-4 flex justify-between items-center">

//           <div>
//             <div className="text-xs opacity-80">
//               POS
//             </div>

//             <div className="text-lg font-semibold">
//               Bill Cancellation
//             </div>
//           </div>

//           <button
//             onClick={onClose}
//             className="text-xl"
//           >
//             ✕
//           </button>
//         </div>

//         {/* FILTERS */}

//         <div className="p-5 grid grid-cols-1 md:grid-cols-4 gap-4">

//           {/* OUTLET */}

//           <div>
//             <label className="text-xs text-gray-500 font-medium">
//               OUTLET
//             </label>

//             <select
//               value={
//                 selectedOutlet
//               }
//               onChange={(e) =>
//                 setSelectedOutlet(
//                   e.target.value
//                 )
//               }
//               className="mt-1 w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400"
//             >
//               <option value="">
//                 Select Outlet
//               </option>

//               {outlets.map(
//                 (o: any) => (
//                   <option
//                     key={
//                       o.oltCode
//                     }
//                     value={
//                       o.oltCode
//                     }
//                   >
//                     {o.oltName}
//                   </option>
//                 )
//               )}
//             </select>
//           </div>

//           {/* FROM DATE */}

//           <div>
//             <label className="text-xs text-gray-500 font-medium">
//               FROM DATE
//             </label>

//             <input
//               type="date"
//               value={fromDate}
//               onChange={(e) =>
//                 setFromDate(
//                   e.target.value
//                 )
//               }
//               className="mt-1 w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400"
//             />
//           </div>

//           {/* TO DATE */}

//           <div>
//             <label className="text-xs text-gray-500 font-medium">
//               TO DATE
//             </label>

//             <input
//               type="date"
//               value={toDate}
//               onChange={(e) =>
//                 setToDate(
//                   e.target.value
//                 )
//               }
//               className="mt-1 w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400"
//             />
//           </div>

//           {/* GET BUTTON */}

//           <div className="flex items-end">
//             <button
//               onClick={
//                 fetchBills
//               }
//               className="w-full bg-[#0576B2] hover:bg-blue-700 text-white py-2 rounded-lg font-medium"
//             >
//               Get Bills
//             </button>
//           </div>
//         </div>

//         {/* TABLE */}

//         <div className="px-5 overflow-auto max-h-[350px]">

//           <table className="w-full border-collapse">

//             <thead className="sticky top-0 bg-gray-100 z-10">

//               <tr className="text-sm">

//                 <th className="border px-3 py-2">
//                   Select
//                 </th>

//                 <th className="border px-3 py-2">
//                   Bill No
//                 </th>

//                 <th className="border px-3 py-2">
//                   Table
//                 </th>

//                 <th className="border px-3 py-2">
//                   Amount
//                 </th>

//                 <th className="border px-3 py-2">
//                   Tax
//                 </th>

//                 <th className="border px-3 py-2">
//                   Discount
//                 </th>

//                 <th className="border px-3 py-2">
//                   Settled
//                 </th>

//                 <th className="border px-3 py-2">
//                   Bill Date
//                 </th>
//               </tr>
//             </thead>

//             <tbody>

//               {bills.length > 0 ? (
//                 bills.map(
//                   (
//                     item: any,
//                     index
//                   ) => (
//                     <tr
//                       key={index}
//                       className="text-sm hover:bg-blue-50"
//                     >

//                       <td className="border px-3 py-2 text-center">

//                         <input
//                           type="radio"
//                           checked={
//                             selectedBill?.kotId ===
//                             item?.kotId
//                           }
//                           onChange={() =>
//                             setSelectedBill(
//                               item
//                             )
//                           }
//                         />
//                       </td>

//                       <td className="border px-3 py-2">
//                         {
//                           item?.ksmBillNo
//                         }
//                       </td>

//                       <td className="border px-3 py-2">
//                         {
//                           item?.ksmTblNo
//                         }
//                       </td>

//                       <td className="border px-3 py-2">
//                         {
//                           item?.ksmBillAmount
//                         }
//                       </td>

//                       <td className="border px-3 py-2">
//                         {
//                           item?.ksmBillTaxAmt
//                         }
//                       </td>

//                       <td className="border px-3 py-2">
//                         {
//                           item?.ksmBillDiscount
//                         }
//                       </td>

//                       <td className="border px-3 py-2">

//                         {item?.ksmBillSettled
//                           ? "Yes"
//                           : "No"}
//                       </td>

//                       <td className="border px-3 py-2">

//                         {item?.ksmBillDate
//                           ?.split(
//                             "T"
//                           )[0]}
//                       </td>
//                     </tr>
//                   )
//                 )
//               ) : (
//                 <tr>
//                   <td
//                     colSpan={8}
//                     className="border px-3 py-5 text-center text-gray-500"
//                   >
//                     No Bills Found
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* REASON */}

//         <div className="p-5">

//           <label className="text-xs text-gray-500 font-medium">
//             CANCELLATION REASON
//           </label>

//           <textarea
//             value={reason}
//             onChange={(e) =>
//               setReason(
//                 e.target.value
//               )
//             }
//             rows={3}
//             placeholder="Enter cancellation reason"
//             className="mt-1 w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-400"
//           />

//           {/* BUTTONS */}

//           <div className="flex justify-end gap-3 mt-4">

//             <button
//               onClick={onClose}
//               className="px-5 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
//             >
//               Close
//             </button>

//             <button
//               onClick={
//                 handleCancelBill
//               }
//               className="px-5 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium"
//             >
//               Cancel Bill
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BillCancellationPopup;


import React, {
  useEffect,
  useState,
} from "react";

import toast from "react-hot-toast";

import Loader from "./Loader";

import {
  cancelBill,
  getBillDetails,
  getOutletList,
} from "../api/services/products.service";

import { useAppContext } from "../context/AppContext";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const BillCancellationPopup: React.FC<Props> = ({
  isOpen,
  onClose,
}) => {
  const { appData } =
    useAppContext();

  const [loading, setLoading] =
    useState(false);

  const [outlets, setOutlets] =
    useState<any[]>([]);

  const [bills, setBills] =
    useState<any[]>([]);

  const [selectedOutlet,
    setSelectedOutlet] =
    useState("");

  const [selectedBill,
    setSelectedBill] =
    useState<any>(null);

  const [reason, setReason] =
    useState("");

  const getToday = () => {
    return new Date()
      .toISOString()
      .split("T")[0];
  };

  const [fromDate,
    setFromDate] =
    useState(getToday());

  const [toDate,
    setToDate] =
    useState(getToday());

  // ================= FETCH OUTLETS =================

  const fetchOutlets =
    async () => {
      try {
        const res =
          await getOutletList(
            appData?.user
              ?.branch_code
          );

        console.log(
          "Outlet Response",
          res
        );

        if (res?.success) {
          const outletData =
            res?.data || [];

          setOutlets(
            outletData
          );

          // AUTO SELECT FIRST OUTLET

          if (
            outletData.length > 0
          ) {
            setSelectedOutlet(
              outletData[0]
                ?.oltCode?.toString()
            );
          }
        }
      } catch (err: any) {
        console.error(err);

        toast.error(
          err?.response?.data
            ?.message ||
            "Failed to load outlets"
        );
      }
    };

  // ================= FETCH BILLS =================

  const fetchBills =
    async () => {
      if (!selectedOutlet)
        return;

      try {
        setLoading(true);

        const res =
          await getBillDetails(
            Number(
              selectedOutlet
            ),

            appData?.user
              ?.branch_code,

            fromDate.replaceAll(
              "-",
              "/"
            ),

            toDate.replaceAll(
              "-",
              "/"
            )
          );

        console.log(
          "Bills Response",
          res
        );

        setBills(res || []);
      } catch (err: any) {
        toast.error(
          err?.response?.data
            ?.message ||
            "Failed to fetch bills"
        );
      } finally {
        setLoading(false);
      }
    };

  // ================= CANCEL BILL =================

  const handleCancelBill =
    async () => {
      if (!selectedBill) {
        toast.error(
          "Select bill"
        );

        return;
      }

      if (!reason.trim()) {
        toast.error(
          "Enter reason"
        );

        return;
      }

      try {
        setLoading(true);

        const payload = {
          outlet: Number(
            selectedOutlet
          ),

          billNo:
            selectedBill
              ?.ksmBillNo,

          branch:
            appData?.user
              ?.branch_code,

          billDate:
            selectedBill
              ?.ksmBillDate,

          userId:
            appData?.user
              ?.userCode,

          reason,
        };

        console.log(
          "Cancel Payload",
          payload
        );

        const res =
          await cancelBill(
            payload
          );

        toast.success(
          res?.message ||
            "Bill Cancelled Successfully"
        );

        fetchBills();

        setSelectedBill(
          null
        );

        setReason("");
      } catch (err: any) {
        toast.error(
          err?.response?.data
            ?.message ||
            "Failed to cancel bill"
        );
      } finally {
        setLoading(false);
      }
    };

  // ================= INITIAL =================

  useEffect(() => {
    if (!isOpen) return;

    fetchOutlets();

    setBills([]);

    setSelectedBill(
      null
    );

    setReason("");
  }, [isOpen]);

  // ================= AUTO FETCH =================

  useEffect(() => {
    if (
      isOpen &&
      selectedOutlet &&
      fromDate &&
      toDate
    ) {
      fetchBills();
    }
  }, [
    selectedOutlet,
    fromDate,
    toDate,
    isOpen,
  ]);

  if (!isOpen) return null;

return (
  <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-2 sm:p-4">

    {loading && <Loader />}

    <div className="w-full max-w-4xl h-[92vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">

      {/* HEADER */}

      <div className="bg-[#0576B2] text-white px-4 sm:px-5 py-3 sm:py-4 flex justify-between items-center">

        <div>
          <div className="text-[10px] sm:text-xs opacity-80">
            POS
          </div>

          <div className="text-base sm:text-lg font-semibold">
            Bill Cancellation
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-lg sm:text-xl"
        >
          ✕
        </button>
      </div>

      {/* FILTERS */}

      <div className="p-3 sm:p-5 grid grid-cols-1 sm:grid-cols-3 gap-3">

        {/* OUTLET */}

        <div>
          <label className="text-[11px] sm:text-xs text-gray-500 font-medium">
            OUTLET
          </label>

          <select
            value={selectedOutlet}
            onChange={(e) =>
              setSelectedOutlet(
                e.target.value
              )
            }
            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
          >
            {outlets.map(
              (o: any) => (
                <option
                  key={o.oltCode}
                  value={o.oltCode}
                >
                  {o.oltName}
                </option>
              )
            )}
          </select>
        </div>

        {/* FROM DATE */}

        <div>
          <label className="text-[11px] sm:text-xs text-gray-500 font-medium">
            FROM DATE
          </label>

          <input
            type="date"
            value={fromDate}
            onChange={(e) =>
              setFromDate(
                e.target.value
              )
            }
            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* TO DATE */}

        <div>
          <label className="text-[11px] sm:text-xs text-gray-500 font-medium">
            TO DATE
          </label>

          <input
            type="date"
            value={toDate}
            onChange={(e) =>
              setToDate(
                e.target.value
              )
            }
            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      {/* TABLE */}

      <div className="flex-1 overflow-auto border-t border-b">

        <table className="min-w-[900px] w-full border-collapse">

          <thead className="sticky top-0 bg-gray-100 z-10">

            <tr className="text-xs sm:text-sm">

              <th className="border px-2 py-2 whitespace-nowrap">
                Select
              </th>

              <th className="border px-2 py-2 whitespace-nowrap">
                Bill No
              </th>

              <th className="border px-2 py-2 whitespace-nowrap">
                Table
              </th>

              <th className="border px-2 py-2 whitespace-nowrap">
                Amount
              </th>

              <th className="border px-2 py-2 whitespace-nowrap">
                Tax
              </th>

              <th className="border px-2 py-2 whitespace-nowrap">
                Discount
              </th>

              <th className="border px-2 py-2 whitespace-nowrap">
                Settled
              </th>

              <th className="border px-2 py-2 whitespace-nowrap">
                Cancelled
              </th>

              <th className="border px-2 py-2 whitespace-nowrap">
                Bill Date
              </th>
            </tr>
          </thead>

          <tbody>

            {bills.length > 0 ? (
              bills.map(
                (
                  item: any,
                  index
                ) => (
                  <tr
                    key={index}
                    className={`text-xs sm:text-sm hover:bg-blue-50 ${
                      selectedBill?.kotId ===
                      item?.kotId
                        ? "bg-blue-100"
                        : ""
                    }`}
                  >

                    <td className="border px-2 py-2 text-center whitespace-nowrap">

                      <input
                        type="radio"
                        checked={
                          selectedBill?.kotId ===
                          item?.kotId
                        }
                        onChange={() =>
                          setSelectedBill(
                            item
                          )
                        }
                      />
                    </td>

                    <td className="border px-2 py-2 whitespace-nowrap">
                      {item?.ksmBillNo}
                    </td>

                    <td className="border px-2 py-2 whitespace-nowrap">
                      {item?.ksmTblNo}
                    </td>

                    <td className="border px-2 py-2 whitespace-nowrap">
                      ₹
                      {item?.ksmBillAmount}
                    </td>

                    <td className="border px-2 py-2 whitespace-nowrap">
                      ₹
                      {item?.ksmBillTaxAmt}
                    </td>

                    <td className="border px-2 py-2 whitespace-nowrap">
                      ₹
                      {item?.ksmBillDiscount}
                    </td>

                    <td className="border px-2 py-2 whitespace-nowrap">
                      {item?.ksmBillSettled
                        ? "Yes"
                        : "No"}
                    </td>

                    <td className="border px-2 py-2 whitespace-nowrap">
                      {item?.ksmBillCancled
                        ? "Yes"
                        : "No"}
                    </td>

                    <td className="border px-2 py-2 whitespace-nowrap">
                      {item?.ksmBillDate?.split(
                        "T"
                      )[0]}
                    </td>
                  </tr>
                )
              )
            ) : (
              <tr>
                <td
                  colSpan={9}
                  className="border px-3 py-5 text-center text-gray-500 text-sm"
                >
                  No Bills Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* REASON */}

      <div className="p-3 sm:p-5">

        <label className="text-[11px] sm:text-xs text-gray-500 font-medium">
          CANCELLATION REASON
        </label>

        <textarea
          value={reason}
          onChange={(e) =>
            setReason(
              e.target.value
            )
          }
          rows={2}
          placeholder="Enter cancellation reason"
          className="mt-1 w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-400"
        />

        {/* BUTTONS */}

        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-4">

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
          >
            Close
          </button>

          <button
            onClick={
              handleCancelBill
            }
            className="w-full sm:w-auto px-5 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium"
          >
            Cancel Bill
          </button>
        </div>
      </div>
    </div>
  </div>
);

};

export default BillCancellationPopup;
