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

export const printKOT = async (printerName: string, data: string) => {
  await connectPrinter();

  const config = qz.configs.create(printerName);

  const printData = [
    {
      type: "raw",
      format: "plain",
      data: data,
    },
  ];

  await qz.print(config, printData);
};