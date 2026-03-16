import { useState } from "react";

const orderItems = [
  { name: "Chicken Biryani", qty: 2 },
  { name: "Butter Naan", qty: 1 },
];

export default function OrderAutoPrint() {
  const [printing, setPrinting] = useState(false);

  const handlePrint = () => {
    setPrinting(true);

    // Prepare print content
    const printContent = orderItems.map(item => `${item.qty} x ${item.name}`).join("\n");

    // Open a new window for printing
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`<pre>${printContent}</pre>`);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    } else {
      alert("Failed to open print window. Check your browser settings.");
    }

    setPrinting(false);
  };

  return (
    <div>
      <button onClick={handlePrint} disabled={printing}>
        {printing ? "Printing..." : "Print Order"}
      </button>
    </div>
  );
}