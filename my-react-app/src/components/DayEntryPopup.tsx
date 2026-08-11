import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { dayClose, dayOpen, getOpenDayDetails } from "../api/services/products.service";
import AlertPopup from "./AlertPopup";
import Loader from "./Loader";
import { useNavigate } from "react-router-dom";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const DayEntryPopup: React.FC<Props> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
const [alertMsg, setAlertMsg] = useState("");
const [alertType, setAlertType] = useState<"success" | "error">("success");
const navigate=useNavigate()
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // YYYY-MM-DD
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toTimeString().slice(0, 5); // HH:mm
  };

  const [date, setDate] = useState(getCurrentDate());
  const [time, setTime] = useState(getCurrentTime());
  const [data, setData] = useState<any>({});
  const { appData } = useAppContext();
  const [errorpopup,seterrorpopup] = useState("")
  console.log("appData", appData);

const fetchData = async () => {
  try {
    
    setLoading(true);

    const data = await getOpenDayDetails(
      appData?.user?.userCode,
      appData?.user?.branch_code
    );

    setData(data);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};
const init = async () => {
  setDate(getCurrentDate());
  setTime(getCurrentTime());

  try {
    setLoading(true);

    const res = await getOpenDayDetails(
      appData?.user?.userCode,
      appData?.user?.branch_code
    );

    setData(res);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    if (!isOpen) return;

    init();
    fetchData();
  }, [isOpen]);
const getISTDateTime = () => {
  const now = new Date();

  // Add 5 hours 30 minutes
  const ist = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));

  return ist.toISOString().slice(0, 19);
};


// Output: "2026-07-23T10:15:30"
// Output: "2026-07-23T10:15:30Z"

// const handleDayClose = async () => {
   
//   const shiftDate = data?.shiftDate?.split("T")[0];
//   const today = new Date().toISOString().split("T")[0];

//   console.log("date", shiftDate, today);

//   // ✅ block if same or past date
//   if (today <= shiftDate) {
//     return;
//   }

//   try {
//     const payload = {
//       userId: appData?.user?.userCode,
//       systemTime: getISODateTime(),
//       posEntryDate: data?.shiftDate,
//       branchCode: appData?.user?.branch_code,
//     };

//     const res = await dayClose(payload);

//     setAlertMsg(res?.message || "Success");
//     setAlertType("success");
//     setAlertOpen(true);

//     fetchData();
//   } catch (err: any) {
//     setAlertMsg(err?.response?.data?.message || "Something went wrong");
//     setAlertType("error");
//     setAlertOpen(true);
//   }
// };

const handleDayClose = async () => {
  try {
    setLoading(true);

    const payload = {
      userId: appData?.user?.userCode,
      systemTime: getISTDateTime(),
      posEntryDate: data?.shiftDate,
      branchCode: appData?.user?.branch_code,
    };

    const res = await dayClose(payload);

    setAlertMsg(res?.message || "Success");
    setAlertType("success");

    await fetchData();
  } catch (err: any) {
    seterrorpopup(err?.response?.data?.popupStatus)
    setAlertMsg(err?.response?.data?.message || "Something went wrong");
    setAlertType("error");
    setAlertOpen(true);

  } finally {
    setLoading(false);
  }
};

const handleDayOpen = async () => {
  try {
    setLoading(true);

    const payload = {
      userId: appData?.user?.userCode,
      systemTime: getISTDateTime(),
      systemDate: getISTDateTime(),
      branchCode: appData?.user?.branch_code,
    };

    console.log("DayOpen Payload:", payload);

    const res = await dayOpen(payload);

    setAlertMsg(res?.message || "Day Opened Successfully");
    setAlertType("success");

    await fetchData();
  } catch (err: any) {
    setAlertMsg(err?.response?.data?.message || "Something went wrong");
    setAlertType("error");
    setAlertOpen(true);
  } finally {
    setLoading(false);
  }
};
const handleOK = () => {
  setAlertOpen(false); // close alert
  onClose(); // close main popup
};
const onNavigate = () => {
  
  navigate(errorpopup)
};
  if (!isOpen) return null;


  return (
    <>
    {loading && <Loader />}
    <div className="fixed inset-0 bg-black/40 flex justify-center items-end sm:items-center z-50">
      {/* MODAL (same pattern as your InvoicePopup) */}
      <div className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-xl bg-white">
        {/* HEADER */}
        <div className="bg-[#0576B2] text-white px-5 py-4 flex justify-between items-center">
          <div>
            <div className="text-xs opacity-80">SCHEDULE</div>
            <div className="text-lg font-semibold">Day Entry</div>
          </div>
          <button onClick={onClose} className="text-xl">
            ✕
          </button>
        </div>

        {/* BODY */}
        <div className="p-5 space-y-4">
          {/* DATE */}
          <div>
            <label className="text-xs text-gray-500 font-medium">DATE</label>
            <div className="mt-1 relative">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          {/* TIME */}
          <div>
            <label className="text-xs text-gray-500 font-medium">TIME</label>
            <div className="mt-1 relative">
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          {/* BUTTONS */}
          <div className="flex gap-3 pt-3">
            <button
            onClick={handleDayClose}
              disabled={data?.openDayResponse?.success === false}
              className={`flex-1 py-2 rounded-lg font-medium transition 
    ${
      data?.openDayResponse?.success === false
        ? "border border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed"
        : "border border-red-300 text-red-500 hover:bg-red-50"
    }`}
            >
              ⮐ Day Close
            </button>

            <button
            onClick={handleDayOpen}
              disabled={data?.openDayResponse?.success}
              className={`flex-1 py-2 rounded-lg font-medium shadow-md transition
    ${
      data?.openDayResponse?.success
        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
        : "bg-[#0576B2] text-white hover:bg-blue-700"
    }`}
            >
              ⮕ Day Start
            </button>
          </div>
        </div>
      </div>
      <AlertPopup
  isOpen={alertOpen}
  message={alertMsg}
  type={alertType}
  onClose={handleOK}
  onNavigate={onNavigate}
/>
    </div>
    </>
  );
};

export default DayEntryPopup;
