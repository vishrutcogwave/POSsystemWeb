import qz from "qz-tray";
import { KJUR } from "jsrsasign";
qz.api.setPromiseType((resolver: any) => new Promise(resolver));
let privateKey: string | null = null;

let certLoaded = false;

export const initQZ = async () => {
  if (certLoaded) return;

  const res = await fetch(
    `${BASE_URL}/keys/digital-certificate.txt?nocache=${Date.now()}`,
  );

  const cert = await res.text();

  qz.security.setCertificatePromise((resolve: (arg0: string) => any) =>
    resolve(cert),
  );

  certLoaded = true;

  console.log("✅ CERT READY BEFORE CONNECT");
};
/* ---------------- CERTIFICATE ---------------- */
const BASE_URL = window.location.origin; // ✅ THIS, not localStorage
console.log("BASE_URL", BASE_URL);

qz.security.setCertificatePromise(
  async (resolve: (value: string) => void, reject: (reason?: any) => void) => {
    try {
      const res = await fetch(
        `${BASE_URL}/keys/digital-certificate.txt?nocache=${Date.now()}`,
      );

      if (!res.ok) {
        throw new Error("Certificate fetch failed");
      }

      const cert = await res.text();

      console.log("CERT LOADED:", cert.substring(0, 50));

      resolve(cert);
    } catch (err) {
      console.error("CERT ERROR:", err);
      reject(err);
    }
  },
);

/* ---------------- SIGNATURE ---------------- */

qz.security.setSignatureAlgorithm("SHA512");

qz.security.setSignaturePromise((toSign: any) => {
  return async (
    resolve: (arg0: string) => void,
    reject: (arg0: unknown) => void,
  ) => {
    try {
      if (!privateKey) {
        const res = await fetch(
          `${BASE_URL}/keys/private-key.txt?nocache=${Date.now()}`,
        );

        if (!res.ok) {
          throw new Error("Private key fetch failed");
        }

        privateKey = await res.text();

        console.log("PRIVATE KEY LOADED:", privateKey.substring(0, 30));
      }

      const sig = new KJUR.crypto.Signature({
        alg: "SHA512withRSA",
      });

      sig.init(privateKey);
      sig.updateString(toSign);

      const hex = sig.sign();

      const b64 = btoa(
        hex
          .match(/\w{2}/g)!
          .map((a: string) => String.fromCharCode(parseInt(a, 16)))
          .join(""),
      );

      resolve(b64);
    } catch (err) {
      reject(err);
    }
  };
});

/* ---------------- CONNECT ---------------- */

export const connectPrinter = async () => {
  await initQZ(); // ✅ IMPORTANT

  if (!qz.websocket.isActive()) {
    await qz.websocket.connect();
  }
};

/* ---------------- PRINT ---------------- */
export const printKOT = async (
  printerName: string | null,
  data: string,
  isThermal: boolean,
) => {
  debugger

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
  companyInfo: any,
) => {
  debugger
  console.log("inside the print", billData, billNo, companyInfo);

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
        discount: tax.discount || 0,
  discountIn: tax.discountIn || "amt",
    };

    /* ---------------- THERMAL FORMAT ---------------- */
    // const formatThermal = (c: any) => {
    //   const width = 42;

    //   /* -------- HELPERS -------- */
    //   const line2Col = (left: string, right: string) => {
    //     const space = width - left.length - right.length;
    //     return left + " ".repeat(Math.max(1, space)) + right + "\n";
    //   };

    //   const formatRow = (
    //     name: string,
    //     qty: number,
    //     rate: number,
    //     amt: number,
    //   ) => {
    //     const nameCol = name.substring(0, 22).padEnd(22, " ");
    //     const qtyCol = String(qty).padStart(4, " ");
    //     const rateCol = String(rate).padStart(7, " ");
    //     const amtCol = amt.toFixed(2).padStart(9, " ");

    //     return `${nameCol}${qtyCol}${rateCol}${amtCol}\n`;
    //   };

    //   const mergeItems = (items: any[]) => {
    //     const map = new Map();
    //     items.forEach((item) => {
    //       const key = `${item.id}_${item.food}`;
    //       if (map.has(key)) {
    //         map.get(key).qty += item.qty;
    //       } else {
    //         map.set(key, { ...item });
    //       }
    //     });
    //     return Array.from(map.values());
    //   };

    //   let d = "";

    //   d += "\x1B\x40"; // reset

    //   /* -------- COMPANY HEADER (FIXED) -------- */
    //   if (c.company) {
    //     d += "\x1B\x61\x01"; // center align

    //     const printCenter = (text: string, bold = false) => {
    //       if (!text) return;

    //       const clean = text.trim();

    //       if (bold) d += "\x1B\x45\x01";

    //       let line = "";
    //       clean.split(" ").forEach((word: string) => {
    //         if ((line + word).length > width) {
    //           d += line.trim() + "\n";
    //           line = word + " ";
    //         } else {
    //           line += word + " ";
    //         }
    //       });

    //       if (line) d += line.trim() + "\n";

    //       if (bold) d += "\x1B\x45\x00";
    //     };

    //     printCenter(c.company.company_Name || "", true);
    //     printCenter(c.company.address1 || "");
    //     printCenter(c.company.address2 || "");

    //     if (c.company.phone_number) {
    //       printCenter(`Ph: ${c.company.phone_number}`);
    //     }

    //     if (c.company.tin_no) {
    //       printCenter(`GSTIN: ${c.company.tin_no}`);
    //     }

    //     d += "\x1B\x61\x00"; // back to left
    //   }

    //   d += "-".repeat(width) + "\n";

    //   /* -------- BILL INFO -------- */
    //   d += line2Col(`Bill : ${billNo.billNo}`, `Outlet : ${c.outlet}`);
    //   d += line2Col(`Table : ${c.table}-${c.subTable}`, `Waiter : ${c.waiter}`);
    //   d += `Pax : ${c.pax}\n`;

    //   d += "-".repeat(width) + "\n";

    //   /* -------- HEADER -------- */
    //   d += "Item Name              Qty   Rate    Amount\n";
    //   d += "-".repeat(width) + "\n";

    //   /* -------- GROUPED TAX -------- */
    //   if (c.taxType?.toLowerCase() === "groupedtax") {
    //     const groupMap: Record<number, any[]> = {};

    //     mergeItems(c.items).forEach((item: any) => {
    //       const grp = item.grpCode || 0;
    //       if (!groupMap[grp]) groupMap[grp] = [];
    //       groupMap[grp].push(item);
    //     });

    //     Object.keys(groupMap).forEach((grp) => {
    //       const grpNum = Number(grp);
    //       const groupItems = groupMap[grpNum];

    //       const groupTaxes = c.taxes.filter((t: any) => t.groupCode === grpNum);

    //       d += "\n";
    //       d += `*** ${groupTaxes[0]?.groupName || "OTHERS"} ***\n`;
    //       d += "-".repeat(width) + "\n";

    //       /* ITEMS */
    //       groupItems.forEach((i: any) => {
    //         d += formatRow(i.food, i.qty, i.price, i.price * i.qty);
    //       });

    //       d += "-".repeat(width) + "\n";

    //       /* TAX */
    //       groupTaxes.forEach((tax: any) => {
    //         const halfPer = (tax.taxper || 0) / 2;

    //         // Subtotal (before tax)

    //         // CGST
    //         d += line2Col(`CGST ${halfPer}%`, (tax.cgst || 0).toFixed(2));

    //         // SGST
    //         d += line2Col(`SGST ${halfPer}%`, (tax.sgst || 0).toFixed(2));

    //         // Subtotal After Tax

    //         d += "-".repeat(width) + "\n";
    //         d += line2Col("Subtotal", (tax.total || 0).toFixed(2));
    //       });
    //     });
    //   }

    //   /* -------- TOTAL -------- */
    //   d += "-".repeat(width) + "\n";

    //   d += "-".repeat(width) + "\n";

    //   // GRAND TOTAL ONLY
    //   d += "\x1B\x45\x01";
    //   // Round Off (only if not 0)
    //   const roundOff = c.roundOff || 0;

    //   if (roundOff !== 0) {
    //     d += line2Col("Round Off", roundOff.toFixed(2));
    //   }
    //   d += line2Col("GRAND TOTAL", c.grandTotal.toFixed(2));
    //   d += "\x1B\x45\x00";

    //   d += "\n\n\n";
    //   d += "\x1D\x56\x41\x10";

    //   return d;
    // };
    
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

if (taxParts.length >= 2) {
  d += line2Col(taxParts[0], (tax.cgst || 0).toFixed(2));
  d += line2Col(taxParts[1], (tax.sgst || 0).toFixed(2));
} else {
  // fallback
  d += line2Col("CGST", (tax.cgst || 0).toFixed(2));
  d += line2Col("SGST", (tax.sgst || 0).toFixed(2));
}

        d += "-".repeat(width) + "\n";

        /* ✅ SUBTOTAL BOLD */
        d += boldOn;
        d += line2Col("Subtotal", (tax.total || 0).toFixed(2));
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

    const result = await printKOT(printerName, finalData, isThermal);

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
) => {

  console.log(apiData,"apidta");
  
  try {
    await connectPrinter();

    let printerName = await qz.printers.getDefault();
    if (!printerName) throw new Error("No printer found");

    const isThermal =
      printerName.toLowerCase().includes("pos") ||
      printerName.toLowerCase().includes("thermal");

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
    items.forEach((i) => {
      const key = `${i.id}_${i.food}`;
      if (map.has(key)) map.get(key).qty += i.qty;
      else map.set(key, { ...i });
    });
    return Array.from(map.values());
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

        grpBlock +=
          line2Col(`CGST ${half}%`, (t.cgst || 0).toFixed(2)) + "\n";

        grpBlock +=
          line2Col(`SGST ${half}%`, (t.sgst || 0).toFixed(2)) + "\n";

        grpBlock += line + "\n";

        grpBlock +=
          boldOn +
          line2Col("Subtotal", (t.total || 0).toFixed(2)) +
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
    const finalData = isThermal
      ? formatThermal(content)
      : "<div>HTML PRINT</div>";

    return await printKOT(printerName, finalData, isThermal);
  } catch (err: any) {
    return {
      success: false,
      message: err.message,
    };
  }
};
