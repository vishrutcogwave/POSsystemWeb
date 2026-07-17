import * as JSPM from "jsprintmanager";
import { getBillConfiguration } from "./products.service";
const getClientPrinter = async (
  printerName: string | null,
  ipAddress: string
) => {
  const isMobile =
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (isMobile) {
    console.log("Using Network Printer");
    console.log("Printer IP:", ipAddress);

    return new JSPM.NetworkPrinter(
      9100,
      ipAddress || "" // fallback
    );
  }

  if (printerName?.trim()) {
    return new JSPM.InstalledPrinter(printerName);
  }

  return new JSPM.DefaultPrinter();
};
const formatThermal = (c: any) => {
  const WIDTH = 48;
  const line = "-".repeat(WIDTH);

 

  const wrap = (text: string, width = 43) => {
    const words = text.split(" ");
    const lines: string[] = [];
    let current = "";

    for (const word of words) {
      if ((current + word).length > width) {
        lines.push(current.trim());
        current = word + " ";
      } else {
        current += word + " ";
      }
    }

    if (current.trim()) lines.push(current.trim());

    return lines;
  };

  const item = (qty: number, name: string) => {
    const lines = wrap(name);

    let out = "";

    lines.forEach((l, i) => {
      if (i === 0) {
        out += `${String(qty).padStart(3)}  ${l}\n`;
      } else {
        out += "     " + l + "\n";
      }
    });

    return out;
  };

  let d = "";

  // Reset
  d += "\x1B\x40";

  // Font A
  d += "\x1BM\x00";

// Center Align
d += "\x1B\x61\x01";

// Title - Double Size + Bold
d += "\x1B\x45\x01";
d += "\x1D\x21\x11";
d += (c.title || "KITCHEN ORDER") + "\n";

// Normal Size
d += "\x1D\x21\x00";

// Outlet
d += (localStorage.getItem("activeOltName") || "RESTAURANT") + "\n";

// Bold Off
d += "\x1B\x45\x00";

// Divider
d += line + "\n";

  // Left Align
  d += "\x1B\x61\x00";

  d += `KOT      : ${c.kotId}\n`;
  d += `TABLE    : ${c.table}-${c.subTable}\n`;
  d += `WAITER   : ${c.waiter}\n`;
  d += `PAX      : ${c.pax}\n`;
  d += `TIME     : ${new Date().toLocaleString()}\n`;

  d += line + "\n";

  // Header
  d += "\x1B\x45\x01";
  d += "QTY  ITEM\n";
  d += "\x1B\x45\x00";

  d += line + "\n";

  c.items.forEach((i: any) => {
    d += "\x1B\x45\x01";
    d += item(i.qty, i.name);
    d += "\x1B\x45\x00";

    if (i.instructions?.length) {
      i.instructions.forEach((x: string) => {
        d += `     * ${x}\n`;
      });
    }

    d += "\n";
  });

  d += line + "\n";

  const total = c.items.reduce(
    (sum: number, i: any) => sum + Number(i.qty),
    0
  );

  d += "\x1B\x45\x01";
  d += `TOTAL ITEMS : ${total}\n`;
  d += "\x1B\x45\x00";

  d += line + "\n";

  d += "\n\n\n";

  // Cut Paper
  d += "\x1D\x56\x41\x10";

  return d;
};
const formatHTML = (c: any) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<style>
@page{
    size: A4;
    margin:10mm;
}

body{
    font-family: Consolas, monospace;
    font-size:16px;
    margin:0;
    padding:0;
}

.container{
    width:100%;
}

.center{
    text-align:center;
    font-weight:bold;
    font-size:22px;
    margin-bottom:5px;
}

.line{
    border-top:2px dashed #000;
    margin:8px 0;
}

.header{
    margin:3px 0;
}

table{
    width:100%;
    border-collapse:collapse;
}

th{
    text-align:left;
    border-bottom:1px solid #000;
    padding:4px 0;
}

td{
    padding:4px 0;
    vertical-align:top;
}

.qty{
    width:60px;
    font-weight:bold;
}

.note{
    padding-left:30px;
    font-style:italic;
    font-size:14px;
}

.footer{
    margin-top:10px;
    font-weight:bold;
    font-size:18px;
}
</style>
</head>

<body>

<div class="container">

<div class="center">${c.title}</div>
<div class="center">${localStorage.getItem("activeOltName")}</div>

<div class="line"></div>

<div class="header"><b>KOT :</b> ${c.kotId}</div>
<div class="header"><b>Table :</b> ${c.table}-${c.subTable}</div>
<div class="header"><b>Waiter :</b> ${c.waiter}</div>
<div class="header"><b>Pax :</b> ${c.pax}</div>
<div class="header"><b>Time :</b> ${new Date().toLocaleTimeString()}</div>

<div class="line"></div>

<table>
<tr>
<th style="width:60px">Qty</th>
<th>Item</th>
</tr>

${c.items
  .map(
    (i: any) => `
<tr>
<td class="qty">${i.qty}</td>
<td>${i.name}</td>
</tr>

${(i.instructions || [])
  .map(
    (x: string) => `
<tr>
<td></td>
<td class="note">• ${x}</td>
</tr>`
  )
  .join("")}
`
  )
  .join("")}

</table>

<div class="line"></div>

<div class="footer">
Total Items : ${c.items.reduce((s: number, i: any) => s + i.qty, 0)}
</div>

</div>

</body>
</html>
`;



export const printKOT = async (
  printerName: string | null,
  content: any,
   ipAddress: string,
  isThermal?: boolean,
  
) => {
  try {
    console.log("========== PRINT START ==========");

    console.log("User Agent:", navigator.userAgent);

    console.log(
      "Current WS Status:",
      JSPM.JSPrintManager.websocket_status
    );

    if (
      JSPM.JSPrintManager.websocket_status !==
      JSPM.WSStatus.Open
    ) {
      console.error("❌ WebSocket is NOT OPEN");
      throw new Error("JSPrintManager is not running");
    }

    console.log("✅ WebSocket Connected");

    const cpj = new JSPM.ClientPrintJob();

    console.log("✅ ClientPrintJob Created");

cpj.clientPrinter = await getClientPrinter(printerName,ipAddress);

    const data = isThermal
      ? formatThermal(content)
      : formatHTML(content);

    console.log("Data Length:", data.length);

    if (isThermal) {
      console.log("Thermal Mode");

      cpj.printerCommands = data;

      console.log("✅ ESC/POS Commands Assigned");
    } else {
      console.log("HTML Mode");

      cpj.files.push(
        new JSPM.PrintFile(
          data,
          JSPM.FileSourceType.Text,
          "receipt.htm",
          1
        )
      );

      console.log("✅ HTML File Added");
    }

    console.log("Calling sendToClient()...");

    try {
      await cpj.sendToClient();

      console.log("✅ sendToClient SUCCESS");
    } catch (e: any) {
      console.error("❌ sendToClient FAILED", e);
      throw e;
    }

    console.log("✅ Print Completed Successfully");

    return {
      success: true,
      printer: printerName ?? "Default Printer",
    };
  } catch (err: any) {
    console.error("========== PRINT ERROR ==========");
    console.error("Message:", err?.message || "Unknown Error");
    console.error("Stack:", err?.stack || "No Stack");
    console.error("Full Error Object:", err);

    return {
      success: false,
      printer: printerName,
      message: err?.message || "Printing failed",
    };
  }
};
export const printBill = async (
  billData: any,
  billNo: any,
  companyInfo: any,
  ipAddress:string
) => {
   
  console.log("inside the print", billData, billNo, companyInfo);

  try {
if (
  JSPM.JSPrintManager.websocket_status !==
  JSPM.WSStatus.Open
) {
  throw new Error("JSPrintManager is not running");
}

// Use default printer
let printerName: string | null = null;

// If you already store the selected printer name,
// assign it here instead of null.

const isThermal = true;
    const cart = billData.cart;
    const tax = billData.tax;

    const content = {
      company: companyInfo || null, // ✅ FROM PARAM
      outlet: cart.outletName,
      table: cart.table,
      subTable: cart.subTable,
      waiter: cart.waiterName,
      pax: cart.pax,
      items: cart.food,
      total: tax.totalAmount,
      taxes: tax.taxList,
      taxType: tax.taxType,
      grandTotal: tax.grandTotal,
      roundOff: tax.roundOff, // ✅ ADD THIS
        discount: tax.discount || 0,
  discountIn: tax.discountIn || "amt",
    };

    
    const formatThermal = (c: any) => {
  const width = 42;

  /* -------- HELPERS -------- */
  const line2Col = (left: string, right: string) => {
    const space = width - left.length - right.length;
    return left + " ".repeat(Math.max(1, space)) + right + "\n";
  };

  const formatRow = (
    name: string,
    qty: number,
    rate: number,
    amt: number,
  ) => {
    const nameCol = name.substring(0, 22).padEnd(22, " ");
    const qtyCol = String(qty).padStart(4, " ");
    const rateCol = String(rate).padStart(7, " ");
    const amtCol = amt.toFixed(2).padStart(9, " ");

    return `${nameCol}${qtyCol}${rateCol}${amtCol}\n`;
  };

  const mergeItems = (items: any[]) => {
    const map = new Map();
    items.forEach((item) => {
      const key = `${item.id}_${item.food}`;
      if (map.has(key)) {
        map.get(key).qty += item.qty;
      } else {
        map.set(key, { ...item });
      }
    });
    return Array.from(map.values());
  };

  /* ✅ BOLD */
  const boldOn = "\x1B\x45\x01";
  const boldOff = "\x1B\x45\x00";

  let d = "";

  d += "\x1B\x40"; // reset

  /* -------- COMPANY HEADER (UNCHANGED) -------- */
  if (c.company) {
    d += "\x1B\x61\x01"; // center align

    const printCenter = (text: string, bold = false) => {
      if (!text) return;

      const clean = text.trim();

      if (bold) d += boldOn;

      let line = "";
      clean.split(" ").forEach((word: string) => {
        if ((line + word).length > width) {
          d += line.trim() + "\n";
          line = word + " ";
        } else {
          line += word + " ";
        }
      });

      if (line) d += line.trim() + "\n";

      if (bold) d += boldOff;
    };

    printCenter(c.company.company_Name || "", true);
    printCenter(c.company.address1 || "");
    printCenter(c.company.address2 || "");

    if (c.company.phone_number) {
      printCenter(`Ph: ${c.company.phone_number}`);
    }

    if (c.company.tin_no) {
      printCenter(`GSTIN: ${c.company.tin_no}`);
    }

    d += "\x1B\x61\x00"; // back to left
  }

  d += "-".repeat(width) + "\n";

  /* -------- BILL INFO -------- */
  d += line2Col(`Bill : ${billNo.billNo}`, `Outlet : ${c.outlet}`);
  d += line2Col(`Table : ${c.table}-${c.subTable}`, `Waiter : ${c.waiter}`);
  d += `Pax : ${c.pax}\n`;

  d += "-".repeat(width) + "\n";

  /* -------- HEADER (BOLD) -------- */
  d += boldOn;
  d += "Item Name              Qty   Rate    Amount\n";
  d += boldOff;

  d += "-".repeat(width) + "\n";


  /* -------- ON BILL TAX -------- */
if (c.taxType?.toLowerCase() === "onbilltax") {
  const mergedItems = mergeItems(c.items);

  mergedItems.forEach((i: any) => {
    d += formatRow(
      i.food,
      i.qty,
      i.price,
      i.price * i.qty
    );
  });

  d += "-".repeat(width) + "\n";
console.log("bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",billData);

c.taxes.forEach((t: any) => {
  let amount = Number(t.taxAmount || 0);

  if ((t.taxName || "").toUpperCase().includes("CGST")) {
    amount = Number(tax.cgstAmt || 0);
  } else if ((t.taxName || "").toUpperCase().includes("SGST")) {
    amount = Number(tax.sgstAmt || 0);
  }

  // Don't print zero-value taxes
  if (amount <= 0) return;

  d += line2Col(
    t.taxName,
    amount.toFixed(2)
  );
});
}
  /* -------- GROUPED TAX -------- */
  if (c.taxType?.toLowerCase() === "groupedtax") {
    const groupMap: Record<number, any[]> = {};

    mergeItems(c.items).forEach((item: any) => {
      const grp = item.grpCode || 0;
      if (!groupMap[grp]) groupMap[grp] = [];
      groupMap[grp].push(item);
    });

    Object.keys(groupMap).forEach((grp) => {
      const grpNum = Number(grp);
      const groupItems = groupMap[grpNum];

      const groupTaxes = c.taxes.filter((t: any) => t.groupCode === grpNum);

      d += "\n";

      /* ✅ GROUP NAME BOLD */
      d += boldOn;
      d += `*** ${groupTaxes[0]?.groupName || "OTHERS"} ***\n`;
      d += boldOff;

      d += "-".repeat(width) + "\n";

      /* ITEMS */
      groupItems.forEach((i: any) => {
        d += formatRow(i.food, i.qty, i.price, i.price * i.qty);
      });

      d += "-".repeat(width) + "\n";

      /* TAX */
   groupTaxes.forEach((tax: any) => {
  /* ✅ SPLIT TAX NAME DYNAMICALLY */
  const taxParts = (tax.taxName || "")
    .split("+")
    .map((x: string) => x.trim());

  // Show CGST only if amount > 0
  if (Number(tax.cgst || 0) > 0) {
    d += line2Col(
      taxParts.length >= 2 ? taxParts[0] : "CGST",
      Number(tax.cgst || 0).toFixed(2)
    );
  }

  // Show SGST only if amount > 0
  if (Number(tax.sgst || 0) > 0) {
    d += line2Col(
      taxParts.length >= 2 ? taxParts[1] : "SGST",
      Number(tax.sgst || 0).toFixed(2)
    );
  }

  d += "-".repeat(width) + "\n";

  /* ✅ SUBTOTAL BOLD */
  const foodTotal = groupItems.reduce(
    (sum: number, item: any) =>
      sum + Number(item.qty) * Number(item.price),
    0
  );

  const subtotal =
    foodTotal +
    Number(tax.cgst || 0) +
    Number(tax.sgst || 0);

  d += boldOn;
  d += line2Col("Subtotal", subtotal.toFixed(2));
  d += boldOff;
});
    });
  }

  /* -------- TOTAL -------- */
 /* -------- TOTAL -------- */
/* -------- TOTAL -------- */
d += "-".repeat(width) + "\n";
d += "-".repeat(width) + "\n";

d += boldOn;

/* ✅ DISCOUNT */
if ((c.discount || 0) > 0) {
  let discountLabel = "Discount";

  if (c.discountIn === "amt") {
    discountLabel += " (Rs.)";
    d += line2Col(discountLabel, `-${c.discount.toFixed(2)}`);
  } else if (c.discountIn === "per") {
    discountLabel += " (%)";
    d += line2Col(discountLabel, `-${c.discount}%`);
  }
}

/* ✅ ROUND OFF */
const roundOff = c.roundOff || 0;
if (roundOff !== 0) {
  d += line2Col("Round Off", roundOff.toFixed(2));
}

/* ✅ GRAND TOTAL */
d += line2Col("GRAND TOTAL", c.grandTotal.toFixed(2));

d += boldOff;

  d += "\n\n\n";
  d += "\x1D\x56\x41\x10";

  return d;
};
    
    const finalData = isThermal
      ? formatThermal(content)
      : "<div>HTML PRINT</div>";
let printCount = 1;

try {
  const branchCode =
    billData?.cart?.branchCode ||
    localStorage.getItem("branch") ||
    "DEROY";

  const billConfig = await getBillConfiguration(branchCode);

  if (
    billConfig?.success &&
    billConfig?.data?.length > 0
  ) {
    printCount = Number(
      billConfig.data[0].reqBill || 1
    );
  }
} catch (err) {
  console.error("Bill Configuration Error", err);
}
const cpj = new JSPM.ClientPrintJob();

cpj.clientPrinter = await getClientPrinter(printerName,ipAddress);

cpj.printerCommands = finalData;

let result: {
  success: boolean;
  printer: string;
  message?: string;
} = {
  success: true,
  printer: printerName ?? "Default Printer",
};

for (let i = 0; i < printCount; i++) {
  try {
    console.log(`Printing Bill Copy ${i + 1}`);

    await cpj.sendToClient();

    console.log(`Bill Copy ${i + 1} Printed`);
  } catch (e: any) {
    console.error("Print Failed", e);

result = {
  success: false,
  printer: printerName ?? "Default Printer",
  message: e?.message || "Printing failed",
};

    break;
  }
}

return result;
  } catch (err: any) {
    return {
      success: false,
      message: err.message,
    };
  }
};
























export const reprintBill = async (
  apiData: any,
  formData: any,
  companyInfo: any,
  ipAddress?:string
) => {

  console.log(apiData,"apidta");
  console.log("repppppppppppppppppppppp",apiData.tax);
  
  try {
if (
  JSPM.JSPrintManager.websocket_status !==
  JSPM.WSStatus.Open
) {
  throw new Error("JSPrintManager is not running");
}

// Use default printer
let printerName: string | null = null;

// If you store the selected printer name in your settings,
// assign it here instead of null.

// Assuming you're printing to a thermal printer
    const cart = apiData?.cart || {};
    const tax = apiData?.tax || {};

    const content = {
      company: companyInfo,
      outlet: cart.outletName,
      table: cart.table,
      subTable: cart.subTable,
      waiter: cart.waiterName,
      pax: cart.pax,
      items: cart.food || [],
      total: tax.totalAmount || 0,
      taxes: tax.taxList || [],
      taxType: cart.taxType || "groupedtax",
      grandTotal: tax.grandTotal || 0,
      roundOff: tax.roundOff || 0,
    };


const formatThermal = (c: any) => {
  const width = 42;

  /* ALIGN HELPERS */
  const line2Col = (l: string, r: string = "") => {
    const space = width - l.length - r.length;
    return l + " ".repeat(Math.max(1, space)) + r;
  };

const centerBlock = (text: string) => {
  const LEFT_FIX = 2; // adjust 1–3 if needed

  return (
    text
      .split("\n")
      .map((line) => {
        const padding = Math.max(
          0,
          Math.floor((width - line.length) / 2),
        );
        return " ".repeat(padding + LEFT_FIX) + line;
      })
      .join("\n") + "\n"
  );
};

  const formatRow = (
    name: string,
    qty: number,
    rate: number,
    amt: number,
  ) => {
    return (
      name.substring(0, 22).padEnd(22) +
      String(qty).padStart(4) +
      String(rate).padStart(7) +
      amt.toFixed(2).padStart(9)
    );
  };

const mergeItems = (items: any[]) => {
  const map = new Map();

  (items || []).forEach((i) => {
    const key = `${i.id}_${i.food}`;

    if (map.has(key)) {
      const existing = map.get(key);

      existing.qty += Number(i.qty || i.origQty || 0);
    } else {
      map.set(key, {
        ...i,
        qty: Number(i.qty || i.origQty || 0),
        price: Number(i.price || 0),
      });
    }
  });

  return [...map.values()];
};

  /* ✅ BOLD */
  const boldOn = "\x1B\x45\x01";
  const boldOff = "\x1B\x45\x00";

  let d = "";
  d += "\x1B\x40";

  const line = "-".repeat(width);

  /* ===== COMPANY (CENTER ONLY HERE) ===== */
  let companyBlock = "";
  if (c.company) {
    const name = c.company.company_Name || "";
const padding = Math.max(0, Math.floor((width - name.length) / 2));

companyBlock +=
  " ".repeat(padding) +
  boldOn +
  name +
  boldOff +
  "\n";
    companyBlock += c.company.address1 + "\n";
    companyBlock += c.company.address2 + "\n";

    if (c.company.phone_number)
      companyBlock += `Ph: ${c.company.phone_number}\n`;

    if (c.company.tin_no)
      companyBlock += `GSTIN: ${c.company.tin_no}\n`;
  }

  d += centerBlock(companyBlock);
  d += line + "\n";

  /* ===== GST ===== */
  if (formData.guestGST) {
    let gstBlock = "";

    gstBlock +=
   gstBlock += `Guest : ${formData.guestName || "-"}\n`;
gstBlock += `GSTIN : ${formData.gstNo || "-"}\n`;

    gstBlock += line2Col(`State : ${formData.stateCode || "-"}`) + "\n";
    gstBlock += line2Col(`Address : ${formData.address || "-"}`) + "\n";

    gstBlock += line + "\n";

    d += gstBlock; // ❌ removed center
  }

  /* ===== BILL INFO ===== */
  let billBlock = "";

  billBlock +=
    line2Col(`Bill : ${formData.billNo}`, `Outlet : ${c.outlet}`) + "\n";

  billBlock +=
    line2Col(`Table : ${c.table}-${c.subTable}`, `Waiter : ${c.waiter}`) +
    "\n";

  billBlock += line2Col(`Pax : ${c.pax}`) + "\n";

  billBlock += line + "\n";

  d += billBlock; // ❌ removed center

  /* ===== HEADER ===== */
  let headerBlock = "";
  headerBlock +=
    boldOn +
    "Item Name              Qty   Rate    Amount" +
    boldOff +
    "\n";
  headerBlock += line + "\n";

  d += headerBlock;

d += line + "\n";

if (c.taxType?.toLowerCase() === "onbilltax") {
  const mergedItems = mergeItems(c.items);

  mergedItems.forEach((i: any) => {
    const qty = Number(i.qty || i.origQty || 0);
    const rate = Number(i.price || 0);

    d += formatRow(
      i.food,
      qty,
      rate,
      qty * rate
    ) + "\n";
  });

  d += line + "\n";

  // Print taxes using cgstAmt and sgstAmt from apiData.tax
c.taxes.forEach((t: any) => {
  let amount = Number(t.taxAmount || 0);

  if (t.taxName.toUpperCase().includes("CGST")) {
    amount = Number(tax.cgstAmt || 0);
  } else if (t.taxName.toUpperCase().includes("SGST")) {
    amount = Number(tax.sgstAmt || 0);
  }

  // Skip if tax amount is 0
  if (amount <= 0) return;

  d += line2Col(
    t.taxName,
    amount.toFixed(2)
  ) + "\n";
});

  d += line + "\n";
}

  /* ===== GROUPED ITEMS (UNCHANGED LOGIC) ===== */
  if (c.taxType?.toLowerCase() === "groupedtax") {
    const groupMap: Record<number, any[]> = {};

    mergeItems(c.items).forEach((item: any) => {
      const grp = item.grpCode || 0;
      if (!groupMap[grp]) groupMap[grp] = [];
      groupMap[grp].push(item);
    });

    Object.keys(groupMap).forEach((grp) => {
      let grpBlock = "";

      const grpNum = Number(grp);
      const groupItems = groupMap[grpNum];

      const groupTaxes = c.taxes.filter(
        (t: any) => t.groupCode === grpNum,
      );

      grpBlock += "\n";

      /* ✅ LEFT ALIGNED GROUP NAME */
      const groupName = `*** ${
        groupTaxes[0]?.groupName || "OTHERS"
      } ***`;

      grpBlock += boldOn + groupName.padEnd(width) + boldOff + "\n";
      grpBlock += line + "\n";

      groupItems.forEach((i: any) => {
        grpBlock +=
          formatRow(i.food, i.qty, i.price, i.price * i.qty) + "\n";
      });

      grpBlock += line + "\n";

   groupTaxes.forEach((t: any) => {
  const half = (t.taxper || 0) / 2;

  // Show CGST only if percentage or amount is greater than 0
  if (half > 0 || Number(t.cgst || 0) > 0) {
    grpBlock +=
      line2Col(`CGST ${half}%`, Number(t.cgst || 0).toFixed(2)) + "\n";
  }

  // Show SGST only if percentage or amount is greater than 0
  if (half > 0 || Number(t.sgst || 0) > 0) {
    grpBlock +=
      line2Col(`SGST ${half}%`, Number(t.sgst || 0).toFixed(2)) + "\n";
  }

  grpBlock += line + "\n";

  // Food total for this group
  const foodTotal = groupItems.reduce(
    (sum: number, item: any) =>
      sum + Number(item.qty || 0) * Number(item.price || 0),
    0
  );

  // Manual subtotal = Food + CGST + SGST
  const subtotal =
    foodTotal +
    Number(t.cgst || 0) +
    Number(t.sgst || 0);

  grpBlock +=
    boldOn +
    line2Col("Subtotal", subtotal.toFixed(2)) +
    boldOff +
    "\n";
});

      d += grpBlock; // ❌ removed center
    });
  }

  /* ===== TOTAL ===== */
  /* ===== TOTAL ===== */
let totalBlock = "";

/* ✅ DISCOUNT (SHOW ONLY IF > 0) */
/* ✅ DISCOUNT (SHOW ONLY IF > 0) */
if ((tax.discount || 0) > 0) {
  let discountLabel = "Discount";

  if (tax.discountIn === "amt") {
    discountLabel +=" (Rs.)";
  } else if (tax.discountIn === "per") {
    discountLabel += " (%)";
  }

  totalBlock +=
    line2Col(discountLabel, `-${tax.discount.toFixed(2)}`) + "\n";
}
/* ROUND OFF */
if (c.roundOff !== 0) {
  totalBlock += line2Col("Round Off", c.roundOff.toFixed(2)) + "\n";
}

/* GRAND TOTAL */
totalBlock +=
  boldOn +
  line2Col("GRAND TOTAL", c.grandTotal.toFixed(2)) +
  boldOff +
  "\n";

d += totalBlock;
  d += "\n\n\n";
  d += "\x1D\x56\x41\x10";

  return d;
};
const data = formatThermal(content);

console.log("=========== ESC/POS ===========");
console.log(data);
const cpj = new JSPM.ClientPrintJob();

cpj.clientPrinter = await getClientPrinter(printerName,ipAddress || "");

cpj.printerCommands = data;

try {
  await cpj.sendToClient();

  return {
    success: true,
    printer: printerName ?? "Default Printer",
  };
} catch (e: any) {
  return {
    success: false,
    printer: printerName ?? "Default Printer",
    message: e?.message || "Printing failed",
  };
}
  } catch (err: any) {
    return {
      success: false,
      message: err.message,
    };
  }
};


export const newprintBill = async (
  res: any,
  companyInfo: any,
  ipAddress:string,
) => {
  console.log("========== NEW PRINT BILL ==========");
  console.log("Response:", res);
  console.log("Company:", companyInfo);

  try {
    if (
      JSPM.JSPrintManager.websocket_status !==
      JSPM.WSStatus.Open
    ) {
      throw new Error("JSPrintManager is not running");
    }

    let printerName: string | null = null;

    const tax = res.tax || {};

    const content = {
      company: companyInfo || null,

      billNo: res.fnBillResponse?.billNo || "",

      outlet: res.outletName,
      table: res.kotTblNo,
      subTable: res.subTable,
      waiter: res.waiterName,
      pax: res.pax,

      items: (res.food || []).map((i: any) => ({
        id: i.itemCode,
        food: i.food,
        qty: Number(i.origQty || 0),
        price:   i.itemRate,
        grpCode: i.grpCode,
        comment: i.comment || "",
      })),

      total: tax.totalAmount || 0,
      taxes: tax.taxList || [],
      taxType: res.taxType,
      grandTotal: tax.grandTotal || 0,
      roundOff: tax.roundOff || 0,
      discount: tax.discount || 0,
      discountIn: tax.discountIn || "amt",
    };

    console.log("========== CONTENT ==========");
    console.log(content);

    const formatThermal = (c: any) => {
      const width = 42;

      const line2Col = (left: string, right: string) => {
        const space = width - left.length - right.length;
        return (
          left +
          " ".repeat(Math.max(1, space)) +
          right +
          "\n"
        );
      };

  const formatRow = (
  name: string,
  qty: number,
  rate: number,
  amt: number,
) => {
  const nameCol = name
    .substring(0, 22)
    .padEnd(22);

  const qtyCol = String(qty).padStart(4);

  const rateCol = String(rate).padStart(7);

  const amtCol = amt
    .toFixed(2)
    .padStart(9);

  return (
    boldOn +
    nameCol +
    boldOff +
    qtyCol +
    rateCol +
    amtCol +
    "\n"
  );
};

      const mergeItems = (items: any[]) => {
        const map = new Map();

        (items || []).forEach((item) => {
          const key =
            item.id + "_" + item.food;

          if (map.has(key)) {
            map.get(key).qty += item.qty;
          } else {
            map.set(key, {
              ...item,
            });
          }
        });

        return Array.from(map.values());
      };

      const boldOn = "\x1B\x45\x01";
      const boldOff = "\x1B\x45\x00";

      let d = "";

      d += "\x1B\x40";

      if (c.company) {
        d += "\x1B\x61\x01";

        const printCenter = (
          text: string,
          bold = false,
        ) => {
          if (!text) return;

          if (bold) d += boldOn;

          let line = "";

          text
            .trim()
            .split(" ")
            .forEach((word: string) => {
              if (
                (line + word).length >
                width
              ) {
                d +=
                  line.trim() + "\n";
                line = word + " ";
              } else {
                line += word + " ";
              }
            });

          if (line)
            d += line.trim() + "\n";

          if (bold) d += boldOff;
        };

        printCenter(
          c.company.company_Name,
          true,
        );
        printCenter(c.company.address1);
        printCenter(c.company.address2);

        if (c.company.phone_number)
          printCenter(
            "Ph : " +
              c.company.phone_number,
          );

        if (c.company.tin_no)
          printCenter(
            "GSTIN : " +
              c.company.tin_no,
          );

        d += "\x1B\x61\x00";
      }

      d += "-".repeat(width) + "\n";

      d += line2Col(
        "Bill : " + c.billNo,
        "Outlet : " + c.outlet,
      );

      d += line2Col(
        "Table : " +
          c.table +
          "-" +
          c.subTable,
        "Waiter : " + c.waiter,
      );

      d +=
        "Pax : " +
        c.pax +
        "\n";

      d += "-".repeat(width) + "\n";

      d += boldOn;
      d +=
        "Item Name              Qty   Rate    Amount\n";
      d += boldOff;
      d += "-".repeat(width) + "\n";



if (c.taxType?.toLowerCase() === "onbilltax") {
  const mergedItems = mergeItems(c.items);

  mergedItems.forEach((i: any) => {
    d += formatRow(
      i.food,
      i.qty,
      i.price,
      i.price * i.qty
    );
  });

  d += "-".repeat(width) + "\n";

  (c.taxes || []).forEach((t: any) => {
    d += line2Col(
      t.taxName,
      (t.taxAmount || 0).toFixed(2)
    );
  });
}
if (c.taxType?.toLowerCase() === "groupedtax") {

  const groupMap: Record<number, any[]> = {};

  mergeItems(c.items).forEach((item: any) => {
    const grp = item.grpCode || 0;

    if (!groupMap[grp]) groupMap[grp] = [];

    groupMap[grp].push(item);
  });

  Object.keys(groupMap).forEach((grp) => {

    const grpNum = Number(grp);

    const groupItems = groupMap[grpNum];

    const groupTaxes =
      (c.taxes || []).filter(
        (t: any) => t.groupCode === grpNum
      );

    d += "\n";

    d += boldOn;
    d += `*** ${groupTaxes[0]?.groupName || "OTHERS"} ***\n`;
    d += boldOff;

    d += "-".repeat(width) + "\n";

    groupItems.forEach((i: any) => {
      d += formatRow(
        i.food,
        i.qty,
        i.price,
        i.price * i.qty
      );
    });

    d += "-".repeat(width) + "\n";

    groupTaxes.forEach((tax: any) => {

      const taxParts =
        (tax.taxName || "")
          .split("+")
          .map((x: string) => x.trim());

      if (taxParts.length >= 2) {

        d += line2Col(
          taxParts[0],
          (tax.cgst || 0).toFixed(2)
        );

        d += line2Col(
          taxParts[1],
          (tax.sgst || 0).toFixed(2)
        );

      } else {

        d += line2Col(
          "CGST",
          (tax.cgst || 0).toFixed(2)
        );

        d += line2Col(
          "SGST",
          (tax.sgst || 0).toFixed(2)
        );

      }

      d += "-".repeat(width) + "\n";

      d += boldOn;
      d += line2Col(
        "Subtotal",
        (tax.total || 0).toFixed(2)
      );
      d += boldOff;

    });

  });

}

d += "-".repeat(width) + "\n";
d += "-".repeat(width) + "\n";

d += boldOn;

if ((c.discount || 0) > 0) {

  let label = "Discount";

  if (c.discountIn === "amt")
    label += " (Rs.)";

  if (c.discountIn === "per")
    label += " (%)";

  d += line2Col(
    label,
    `-${c.discount.toFixed(2)}`
  );

}

if ((c.roundOff || 0) !== 0) {

  d += line2Col(
    "Round Off",
    c.roundOff.toFixed(2)
  );

}

d += line2Col(
  "GRAND TOTAL",
  c.grandTotal.toFixed(2)
);

d += boldOff;

d += "-".repeat(width) + "\n";

d += "\x1B\x61\x01"; // Center Align

d += boldOn;
d += "THANK YOU FOR VISITING!\n";
d += boldOff;

d += "Please Visit Again\n";

d += "\x1B\x61\x00"; // Left Align

d += "\n\n\n";

d += "\x1D\x56\x41\x10";

return d;

}; // formatThermal END

const data = formatThermal(content);

console.log("=========== ESC/POS ===========");
console.log(data);

const cpj = new JSPM.ClientPrintJob();

cpj.clientPrinter = await getClientPrinter(printerName,ipAddress);

cpj.printerCommands = data;

console.log("Sending to printer...");
console.log("Printer:", cpj.clientPrinter);

try {
  await cpj.sendToClient();

  console.log("Print Success");

  return {
    success: true,
    printer: printerName ?? "Default Printer",
  };
} catch (e: any) {
  console.error("Print Failed", e);

  return {
    success: false,
    printer: printerName ?? "Default Printer",
    message: e?.message || "Printing Failed",
  };
}
} catch (err: any) {

  console.error(err);

  return {
    success: false,
    printer: null,
    message: err?.message || "Printing Failed",
  };

}

};





