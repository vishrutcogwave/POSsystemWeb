import React from "react";
import { CheckCircle, XCircle } from "lucide-react";

interface Props {
  isOpen: boolean;
  message: string;
  type?: "success" | "error";
  onClose: () => void;
}

const AlertPopup: React.FC<Props> = ({
  isOpen,
  message,
  type = "success",
  onClose,
}) => {
  if (!isOpen) return null;

  const isSuccess = type === "success";

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* HEADER */}
        <div
          className={`px-5 py-4 flex items-center gap-3 ${
            isSuccess ? "bg-green-600" : "bg-red-600"
          } text-white`}
        >
          {isSuccess ? (
            <CheckCircle size={22} />
          ) : (
            <XCircle size={22} />
          )}
          <h2 className="text-lg font-semibold">
            {isSuccess ? "Success" : "Error"}
          </h2>
        </div>

        {/* BODY */}
        <div className="p-5 text-center">
          <p className="text-gray-700 text-sm">{message}</p>

          {/* BUTTON */}
          <button
            onClick={onClose}
            className={`mt-5 w-full py-2 rounded-lg font-medium ${
              isSuccess
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-red-600 text-white hover:bg-red-700"
            }`}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertPopup;