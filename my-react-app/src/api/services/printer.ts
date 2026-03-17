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