// import { useEffect } from "react";
// import * as JSPM from "jsprintmanager";
// import { Toaster } from "react-hot-toast";

// import LandingPage from "./screens/LandingPage";
// import { ItemProvider } from "./context/ItemContext";
// import { ActiveOLTProvider } from "./context/ActiveOLTContext";
// import { AppProvider } from "./context/AppContext";
// import CursorEffect from "./components/CursorEffect";

// export default function App() {
// useEffect(() => {
// const initJSPM = async () => {
//   try {
//     const baseURL = localStorage.getItem("baseUrl") || "";

//     console.log("Base URL:", baseURL);

//     JSPM.JSPrintManager.license_url = `${baseURL}api/POS/jspm`;

//     console.log("License URL:", JSPM.JSPrintManager.license_url);

//     // Verify license endpoint
//     try {
//       const res = await fetch(JSPM.JSPrintManager.license_url);
//       const txt = await res.text();

//       console.log("========== LICENSE API ==========");
//       console.log("Status:", res.status);
//       console.log("Response:", txt);
//       console.log("=================================");
//     } catch (e: any) {
//       console.error("License API ERROR:", e);
//     }

//     console.log("Starting JSPrintManager...");

//     console.log("JSPM.JSPrintManager:", JSPM.JSPrintManager);

//     try {
//       console.log(
//         "JSPM.JSPrintManager JSON:",
//         JSON.stringify(JSPM.JSPrintManager, null, 2)
//       );
//     } catch {
//       console.log(
//         "JSPM.JSPrintManager Keys:",
//         Object.keys(JSPM.JSPrintManager)
//       );
//     }

//     JSPM.JSPrintManager.start();

//     console.log("After start:", JSPM.JSPrintManager);

//     try {
//       console.log(
//         "After start JSON:",
//         JSON.stringify(JSPM.JSPrintManager, null, 2)
//       );
//     } catch {
//       console.log("WebSocket Status:", JSPM.JSPrintManager.websocket_status);
//       console.log("WS Open:", JSPM.WSStatus.Open);
//       console.log("WS Closed:", JSPM.WSStatus.Closed);
//     }

//     let count = 0;

//     const timer = setInterval(() => {
//       count++;

//       const status = JSPM.JSPrintManager.websocket_status;

//       console.log(
//         `Check #${count} | WS Status = ${status}`
//       );

//       if (status === JSPM.WSStatus.Open) {
//         console.log("✅ JSPrintManager Connected");
//         clearInterval(timer);
//       }

//       if (count >= 15) {
//         console.warn("❌ Timed out waiting for JSPrintManager");
//         clearInterval(timer);
//       }
//     }, 1000);
//   } catch (err: any) {
//     console.error("App Init Error:", err);
//   }
// };
//   initJSPM();
// }, []);

//   return (
//     <>
//       <CursorEffect />

//       <AppProvider>
//         <ActiveOLTProvider>
//           <ItemProvider>
//             <Toaster position="top-right" />
//             <LandingPage />
//           </ItemProvider>
//         </ActiveOLTProvider>
//       </AppProvider>
//     </>
//   );
// }



import { useEffect } from "react";
import * as JSPM from "jsprintmanager";
import { Toaster } from "react-hot-toast";

import LandingPage from "./screens/LandingPage";
import { ItemProvider } from "./context/ItemContext";
import { ActiveOLTProvider } from "./context/ActiveOLTContext";
import { AppProvider } from "./context/AppContext";
import CursorEffect from "./components/CursorEffect";

export default function App() {
useEffect(() => {
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let checkTimer: ReturnType<typeof setInterval> | null = null;
  let isReconnecting = false;

  const startJSPM = () => {
    try {
      const status = JSPM.JSPrintManager.websocket_status;

      console.log("JSPM Status:", status);

      if (status === JSPM.WSStatus.Open) {
        console.log("✅ JSPM already connected");
        return;
      }

      console.log("🔄 Starting JSPrintManager...");

      JSPM.JSPrintManager.start();

    } catch (error) {
      console.error("JSPM start error:", error);
    }
  };

  const reconnectJSPM = () => {
    if (isReconnecting) {
      return;
    }

    isReconnecting = true;

    console.log("🔄 JSPM reconnecting...");

    try {
      const status =
        JSPM.JSPrintManager.websocket_status;

      if (status === JSPM.WSStatus.Open) {
        console.log("✅ JSPM already connected");
        isReconnecting = false;
        return;
      }

      JSPM.JSPrintManager.start();

      reconnectTimer = setTimeout(() => {
        const newStatus =
          JSPM.JSPrintManager.websocket_status;

        if (newStatus === JSPM.WSStatus.Open) {
          console.log("✅ JSPM reconnected");
        } else {
          console.warn(
            "⚠️ JSPM still disconnected"
          );
        }

        isReconnecting = false;
      }, 2000);

    } catch (error) {
      console.error(
        "JSPM reconnect error:",
        error
      );

      isReconnecting = false;
    }
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      console.log(
        "📱 Mobile browser returned to foreground"
      );

      setTimeout(() => {
        reconnectJSPM();
      }, 500);
    }
  };

  const handleFocus = () => {
    console.log("📱 Browser focused");

    setTimeout(() => {
      reconnectJSPM();
    }, 500);
  };

  const handleOnline = () => {
    console.log("🌐 Network connection restored");

    setTimeout(() => {
      reconnectJSPM();
    }, 1000);
  };

  const handleOffline = () => {
    console.warn("❌ Network disconnected");
  };

  // -----------------------------
  // INITIAL START
  // -----------------------------

  const initJSPM = () => {
    try {
      const baseURL =
        localStorage.getItem("baseUrl") || "";

      console.log("Base URL:", baseURL);

      JSPM.JSPrintManager.license_url =
        `${baseURL}api/POS/jspm`;

      console.log(
        "License URL:",
        JSPM.JSPrintManager.license_url
      );

      startJSPM();

    } catch (error) {
      console.error(
        "JSPM initialization error:",
        error
      );
    }
  };

  initJSPM();

  // -----------------------------
  // CHECK EVERY 5 SECONDS
  // -----------------------------

  checkTimer = setInterval(() => {
    const status =
      JSPM.JSPrintManager.websocket_status;

    console.log(
      "JSPM background check:",
      status
    );

    if (status !== JSPM.WSStatus.Open) {
      console.warn(
        "⚠️ JSPM disconnected → reconnecting"
      );

      reconnectJSPM();
    }
  }, 5000);

  // -----------------------------
  // MOBILE EVENTS
  // -----------------------------

  document.addEventListener(
    "visibilitychange",
    handleVisibilityChange
  );

  window.addEventListener(
    "focus",
    handleFocus
  );

  window.addEventListener(
    "online",
    handleOnline
  );

  window.addEventListener(
    "offline",
    handleOffline
  );

  // -----------------------------
  // CLEANUP
  // -----------------------------

  return () => {
    if (checkTimer) {
      clearInterval(checkTimer);
    }

    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
    }

    document.removeEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    window.removeEventListener(
      "focus",
      handleFocus
    );

    window.removeEventListener(
      "online",
      handleOnline
    );

    window.removeEventListener(
      "offline",
      handleOffline
    );
  };

}, []);
  return (
    <>
      <CursorEffect />

      <AppProvider>
        <ActiveOLTProvider>
          <ItemProvider>
            <Toaster position="top-right" />
            <LandingPage />
          </ItemProvider>
        </ActiveOLTProvider>
      </AppProvider>
    </>
  );
}