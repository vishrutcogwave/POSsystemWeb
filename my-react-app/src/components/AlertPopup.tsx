import React from "react";
import { CheckCircle, XCircle } from "lucide-react";

interface Props {
  isOpen: boolean;
  message: string;
  type?: "success" | "error";
  onClose: () => void;
  onNavigate?: () => void;
}

const AlertPopup: React.FC<Props> = ({
  isOpen,
  message,
  type = "success",
  onClose,
  onNavigate,
}) => {
  if (!isOpen) return null;

  const isSuccess = type === "success";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl">
        {/* HEADER */}
        <div
          className={`flex items-center gap-3 px-5 py-4 ${
            isSuccess ? "bg-green-600" : "bg-red-600"
          } text-white`}
        >
          {isSuccess ? <CheckCircle size={22} /> : <XCircle size={22} />}

          <h2 className="text-lg font-semibold">
            {isSuccess ? "Success" : "Error"}
          </h2>
        </div>

        {/* BODY */}
        <div className="p-5 text-center">
          <p className="text-sm text-gray-700">{message}</p>

          {/* BUTTONS */}
        {onNavigate ? <div className="mt-5 flex gap-3">
            {/* Cancel */}
            <button
              onClick={onClose}
              className="w-1/2 rounded-lg border border-gray-300 bg-gray-100 py-2 font-medium text-gray-700 hover:bg-gray-200"
            >
              Cancel
            </button>

            {/* Go to Clearing Window */}
            <button
              onClick={onNavigate}
              className={`w-1/2 rounded-lg py-2 font-medium text-white ${
                isSuccess
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              GO TO CLEARING WINDOW
            </button>
          </div>:   <button
            onClick={onClose}
            className={`mt-5 w-full py-2 rounded-lg font-medium ${
              isSuccess
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-red-600 text-white hover:bg-red-700"
            }`}
          >
            OK
          </button>}
        
        </div>
      </div>
    </div>
  );
};

export default AlertPopup;