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
          data,
        },
      ];
    } else {
      printData = [
        {
          type: "html",
          format: "plain",
          data: `
            <div style="font-family: monospace; font-size: 12px;">
              ${data.replace(/\n/g, "<br/>")}
            </div>
          `,
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
    };

    /* ---------------- THERMAL FORMAT ---------------- */
const formatThermal = (c: any) => {
  const width = 42; // 🔥 FULL WIDTH (80mm)

  /* -------- HELPERS -------- */

  const centerText = (text: string) => {
    const spaces = Math.max(0, Math.floor((width - text.length) / 2));
    return " ".repeat(spaces) + text + "\n";
  };

  const splitText = (text: string, max = width) => {
    const words = text.split(" ");
    let lines: string[] = [];
    let line = "";

    words.forEach((w) => {
      if ((line + w).length > max) {
        lines.push(line.trim());
        line = w + " ";
      } else {
        line += w + " ";
      }
    });

    if (line) lines.push(line.trim());
    return lines;
  };

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

  let d = "";

  d += "\x1B\x40"; // reset

  /* -------- COMPANY HEADER (CENTER) -------- */
  d += "\x1B\x61\x00";

  if (c.company) {
    d += "\x1B\x45\x01";

    splitText(c.company.company_Name || "").forEach((l) => {
      d += centerText(l);
    });

    d += "\x1B\x45\x00";

    if (c.company.address1) {
      splitText(c.company.address1).forEach((l) => {
        d += centerText(l);
      });
    }

    if (c.company.address2) {
      splitText(c.company.address2).forEach((l) => {
        d += centerText(l);
      });
    }

    if (c.company.phone_number) {
      d += centerText("Ph: " + c.company.phone_number);
    }

    if (c.company.tin_no) {
      d += centerText("GSTIN: " + c.company.tin_no);
    }
  }

  d += "-".repeat(width) + "\n";

  /* -------- BILL INFO -------- */
  d += line2Col(
    `Bill : ${billNo.billNo}`,
    `Outlet : ${c.outlet}`
  );

  d += line2Col(
    `Table : ${c.table}-${c.subTable}`,
    `Waiter : ${c.waiter}`
  );

  d += `Pax : ${c.pax}\n`;

  d += "-".repeat(width) + "\n";

  /* -------- HEADER -------- */
  d += "Item Name              Qty   Rate    Amount\n";
  d += "-".repeat(width) + "\n";

  /* -------- ITEMS -------- */
  if (c.taxType === "groupedtax") {
    const groupMap: Record<number, any[]> = {};

    c.items.forEach((item: any) => {
      const grp = item.grpCode || 0;
      if (!groupMap[grp]) groupMap[grp] = [];
      groupMap[grp].push(item);
    });

    Object.keys(groupMap).forEach((grp) => {
      const grpNum = Number(grp);
      const groupItems = groupMap[grpNum];

      const groupInfo = c.taxes.find(
        (t: any) => t.groupCode === grpNum
      );

      d += "\n";
      d += `*** ${groupInfo?.groupName || "OTHERS"} ***\n`;
      d += "-".repeat(width) + "\n";

      groupItems.forEach((i: any) => {
        const parts = i.food.split(" ");
        const first = parts.slice(0, 2).join(" ");
        const second = parts.slice(2).join(" ");

        d += formatRow(first, i.qty, i.price, i.price * i.qty);

        if (second) d += second + "\n";
      });

      d += "-".repeat(width) + "\n";

      if (groupInfo) {
        d +=
          "Sub Total".padEnd(33, " ") +
          (groupInfo.taxableAmount || 0)
            .toFixed(2)
            .padStart(9, " ") +
          "\n";

        // ✅ CGST
        if (groupInfo.cgst && groupInfo.cgst > 0) {
          const percent =
            groupInfo.cgstPercent ||
            groupInfo.cgst_per ||
            groupInfo.cgstRate ||
            0;

          d +=
            `CGST ${percent}%`.padEnd(33, " ") +
            groupInfo.cgst.toFixed(2).padStart(9, " ") +
            "\n";
        }

        // ✅ SGST
        if (groupInfo.sgst && groupInfo.sgst > 0) {
          const percent =
            groupInfo.sgstPercent ||
            groupInfo.sgst_per ||
            groupInfo.sgstRate ||
            0;

          d +=
            `SGST ${percent}%`.padEnd(33, " ") +
            groupInfo.sgst.toFixed(2).padStart(9, " ") +
            "\n";
        }
      }

      d += "-".repeat(width) + "\n";
    });
  } else {
    c.items.forEach((i: any) => {
      const parts = i.food.split(" ");
      const first = parts.slice(0, 2).join(" ");
      const second = parts.slice(2).join(" ");

      d += formatRow(first, i.qty, i.price, i.price * i.qty);

      if (second) d += second + "\n";
    });

    d += "-".repeat(width) + "\n";

    c.taxes.forEach((t: any) => {
      if (!t.taxAmount || t.taxAmount === 0) return;

      const percent =
        t.taxPercent ||
        t.percentage ||
        t.tax_per ||
        t.rate ||
        "";

      const name = percent
        ? `${t.taxName} ${percent}%`
        : t.taxName;

      d +=
        name.padEnd(33, " ") +
        t.taxAmount.toFixed(2).padStart(9, " ") +
        "\n";
    });
  }

  /* -------- TOTAL -------- */
  d += "-".repeat(width) + "\n";

  d += "\x1B\x45\x01";
  d +=
    "TOTAL".padEnd(33, " ") +
    c.grandTotal.toFixed(2).padStart(9, " ") +
    "\n";
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