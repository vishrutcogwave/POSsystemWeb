import React from "react";

interface PaymentCardProps {
  title: string;
  value: string | number;
  valueColor?: string;
}

const PaymentCard: React.FC<PaymentCardProps> = ({
  title,
  value,
  valueColor = "text-gray-800",
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 hover:shadow-md transition-all duration-300">
      <p className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold">
        {title}
      </p>

      <h3 className={`mt-2 text-2xl font-bold ${valueColor}`}>
        {value}
      </h3>
    </div>
  );
};

export default PaymentCard;