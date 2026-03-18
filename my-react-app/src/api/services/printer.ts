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

export const printBill = async (billData: any,billNo:any) => {
  try {
    await connectPrinter();

    let printerName = await qz.printers.getDefault();

    if (!printerName) {
      throw new Error("No printer found");
    }

    const isThermal =
      printerName.toLowerCase().includes("pos") ||
      printerName.toLowerCase().includes("thermal");

    /* -------- FORMAT DATA -------- */
    const cart = billData.cart;
    const tax = billData.tax;

    const content = {
      title: "TAX INVOICE",
      outlet: cart.outletName,
      table: cart.table,
      subTable: cart.subTable,
      waiter: cart.waiterName,
      pax: cart.pax,
      items: cart.food,
      total: tax.totalAmount,
      taxes: tax.taxList,
      grandTotal: tax.grandTotal,
    };

    /* -------- THERMAL FORMAT -------- */
    const formatThermal = (c: any) => {
      let d = "";

      d += "\x1B\x40";
      d += "\x1B\x61\x01";
      d += "\x1B\x45\x01";
      d += c.title + "\n";
      d += "\x1B\x45\x00";

      d += "-------------------------------\n";
      d += "\x1B\x61\x00";
        d += `Bill : ${billNo.billNo}\n`;
      d += `Outlet : ${c.outlet}\n`;
      d += `Table  : ${c.table}-${c.subTable}\n`;
      d += `Waiter : ${c.waiter}\n`;
      d += `Pax    : ${c.pax}\n`;

      d += "-------------------------------\n";

      c.items.forEach((i: any) => {
        const name = i.food.substring(0, 20);
        const qty = String(i.qty).padEnd(3, " ");
        const amt = (i.price * i.qty).toFixed(2);

        d += `${qty} ${name.padEnd(20, " ")} ${amt}\n`;
      });

      d += "-------------------------------\n";

      d += `Subtotal : ${c.total.toFixed(2)}\n`;

      c.taxes.forEach((t: any) => {
        d += `${t.taxName} : ${t.taxAmount.toFixed(2)}\n`;
      });

      d += "-------------------------------\n";

      d += "\x1B\x45\x01";
      d += `TOTAL : ${c.grandTotal.toFixed(2)}\n`;
      d += "\x1B\x45\x00";

      d += "\n\n\n";
      d += "\x1D\x56\x41\x10";

      return d;
    };

    /* -------- HTML FORMAT -------- */
    const formatHTML = (c: any) => `
      <div style="font-family: monospace; width:260px;">
        <h3 style="text-align:center">${c.title}</h3>
        <hr/>
        <div>Outlet: ${c.outlet}</div>
        <div>Table: ${c.table}-${c.subTable}</div>
        <div>Waiter: ${c.waiter}</div>
        <div>Pax: ${c.pax}</div>
        <hr/>

        ${c.items
          .map(
            (i: any) => `
          <div style="display:flex; justify-content:space-between;">
            <span>${i.qty} x ${i.food}</span>
            <span>${(i.price * i.qty).toFixed(2)}</span>
          </div>`
          )
          .join("")}

        <hr/>
        <div>Subtotal: ${c.total.toFixed(2)}</div>

        ${c.taxes
          .map(
            (t: any) => `
          <div style="display:flex; justify-content:space-between;">
            <span>${t.taxName}</span>
            <span>${t.taxAmount.toFixed(2)}</span>
          </div>`
          )
          .join("")}

        <hr/>
        <h3>Total: ${c.grandTotal.toFixed(2)}</h3>
      </div>
    `;

    const finalData = isThermal
      ? formatThermal(content)
      : formatHTML(content);

    const result = await printKOT(printerName, finalData, isThermal);

    return result;
  } catch (err: any) {
    return {
      success: false,
      message: err.message,
    };
  }
};