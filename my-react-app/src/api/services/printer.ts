import qz from "qz-tray";
import { KJUR } from "jsrsasign";

let privateKey: string | null = null;

/* ---------------- CERTIFICATE ---------------- */

qz.security.setCertificatePromise((resolve: ((value: string) => string | PromiseLike<string>) | null | undefined, reject: ((reason: any) => PromiseLike<never>) | null | undefined) => {
  fetch("/keys/digital-certificate.txt")
    .then((res) => res.text())
    .then(resolve)
    .catch(reject);
});

/* ---------------- SIGNATURE ---------------- */

qz.security.setSignatureAlgorithm("SHA512");

qz.security.setSignaturePromise((toSign: any) => {
  return async (resolve: (arg0: string) => void, reject: (arg0: unknown) => void) => {
    try {

      if (!privateKey) {
        const key = await fetch("/keys/private-key.pem");
        privateKey = await key.text();
      }

      const sig = new KJUR.crypto.Signature({
        alg: "SHA512withRSA",
      });

      sig.init(privateKey);
      sig.updateString(toSign);

      const hex = sig.sign();

      const b64 = btoa(
        hex.match(/\w{2}/g)!
          .map((a: string) => String.fromCharCode(parseInt(a, 16)))
          .join("")
      );

      resolve(b64);

    } catch (err) {
      reject(err);
    }
  };
});

/* ---------------- CONNECT ---------------- */

export const connectPrinter = async () => {
  if (!qz.websocket.isActive()) {
    await qz.websocket.connect();
  }
};

/* ---------------- PRINT ---------------- */
export const printKOT = async (
  printerName: string | null,
  data: string,
  isThermal: boolean
) => {
  try {
    await connectPrinter();

    if (!qz.websocket.isActive()) {
      throw new Error("QZ Tray not running");
    }

    const allPrinters = await qz.printers.find();

    if (!printerName || printerName.trim() === "") {
  printerName = await qz.printers.getDefault();
}

    if (!printerName) {
      throw new Error("No default printer found");
    }

    // ✅ CHECK PRINTER EXISTS
    if (!allPrinters.includes(printerName)) {
      throw new Error("Printer not installed / offline");
    }

    const config = qz.configs.create(printerName);

    let printData;

    if (isThermal) {
      printData = [
        {
          type: "raw",
          format: "plain",
           data: data,
        },
      ];
    } else {
      printData = [
        {
          type: "html",
          format: "plain",
            data: data,
        },
      ];
    }

    await qz.print(config, printData);

    return {
      success: true,
      printer: printerName,
    };

  } catch (err: any) {
    console.error(`❌ PRINT ERROR (${printerName}):`, err);

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
  companyInfo: any
) => {
  try {
    await connectPrinter();

    let printerName = await qz.printers.getDefault();

    if (!printerName) {
      throw new Error("No printer found");
    }

    const isThermal =
      printerName.toLowerCase().includes("pos") ||
      printerName.toLowerCase().includes("thermal");

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
    };

    /* ---------------- THERMAL FORMAT ---------------- */
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
    amt: number
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

  let d = "";

  d += "\x1B\x40"; // reset

  /* -------- COMPANY HEADER (FIXED) -------- */
  if (c.company) {
    d += "\x1B\x61\x01"; // center align

    const printCenter = (text: string, bold = false) => {
      if (!text) return;

      const clean = text.trim();

      if (bold) d += "\x1B\x45\x01";

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

      if (bold) d += "\x1B\x45\x00";
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
  d += line2Col(
    `Table : ${c.table}-${c.subTable}`,
    `Waiter : ${c.waiter}`
  );
  d += `Pax : ${c.pax}\n`;

  d += "-".repeat(width) + "\n";

  /* -------- HEADER -------- */
  d += "Item Name              Qty   Rate    Amount\n";
  d += "-".repeat(width) + "\n";

  /* -------- GROUPED TAX -------- */
  if (c.taxType === "groupedtax") {
    const groupMap: Record<number, any[]> = {};

    mergeItems(c.items).forEach((item: any) => {
      const grp = item.grpCode || 0;
      if (!groupMap[grp]) groupMap[grp] = [];
      groupMap[grp].push(item);
    });

    Object.keys(groupMap).forEach((grp) => {
      const grpNum = Number(grp);
      const groupItems = groupMap[grpNum];

      const groupTaxes = c.taxes.filter(
        (t: any) => t.groupCode === grpNum
      );

      d += "\n";
      d += `*** ${groupTaxes[0]?.groupName || "OTHERS"} ***\n`;
      d += "-".repeat(width) + "\n";

      /* ITEMS */
      groupItems.forEach((i: any) => {
        d += formatRow(i.food, i.qty, i.price, i.price * i.qty);
      });

      d += "-".repeat(width) + "\n";

      /* TAX */
    groupTaxes.forEach((tax: any) => {
  const halfPer = (tax.taxper || 0) / 2;

  // Subtotal (before tax)


  // CGST
  d += line2Col(
    `CGST ${halfPer}%`,
    (tax.cgst || 0).toFixed(2)
  );

  // SGST
  d += line2Col(
    `SGST ${halfPer}%`,
    (tax.sgst || 0).toFixed(2)
  );

  // Subtotal After Tax

  d += "-".repeat(width) + "\n";
    d += line2Col(
    "Subtotal",
    (tax.total || 0).toFixed(2)
  );

});
    });
  }

  /* -------- TOTAL -------- */
  d += "-".repeat(width) + "\n";

d += "-".repeat(width) + "\n";

// GRAND TOTAL ONLY
d += "\x1B\x45\x01";
// Round Off (only if not 0)
const roundOff = c.roundOff || 0;

if (roundOff !== 0) {
  d += line2Col("Round Off", roundOff.toFixed(2));
}
d += line2Col("GRAND TOTAL", c.grandTotal.toFixed(2));
d += "\x1B\x45\x00";


  d += "\n\n\n";
  d += "\x1D\x56\x41\x10";

  return d;
};
    const finalData = isThermal
      ? formatThermal(content)
      : "<div>HTML PRINT</div>";

    const result = await printKOT(printerName, finalData, isThermal);

    return result;

  } catch (err: any) {
    return {
      success: false,
      message: err.message,
    };
  }
};