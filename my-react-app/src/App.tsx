import { useEffect, useState } from "react";
import * as JSPM from "jsprintmanager";
import { Toaster } from "react-hot-toast";

import LandingPage from "./screens/LandingPage";
import { ItemProvider } from "./context/ItemContext";
import { ActiveOLTProvider } from "./context/ActiveOLTContext";
import { AppProvider } from "./context/AppContext";
import CursorEffect from "./components/CursorEffect";

export default function App() {
  const [printerReady, setPrinterReady] = useState(false);
  const [printerSkipped, setPrinterSkipped] = useState(false);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let checkTimer: ReturnType<typeof setInterval> | null = null;
    let startupTimer: ReturnType<typeof setInterval> | null = null;

    let isReconnecting = false;
    let isMounted = true;

    // ---------------------------------------
    // START JSPM
    // ---------------------------------------

    const startJSPM = () => {
      try {
        const status =
          JSPM.JSPrintManager.websocket_status;

        console.log("JSPM Status:", status);

        if (status === JSPM.WSStatus.Open) {
          console.log("✅ JSPM already connected");

          if (isMounted) {
            setPrinterReady(true);
            setConnecting(false);
          }

          return true;
        }

        console.log("🔄 Starting JSPrintManager...");

        JSPM.JSPrintManager.start();

        return false;
      } catch (error) {
        console.error("JSPM start error:", error);

        if (isMounted) {
          setPrinterReady(false);
          setConnecting(false);
        }

        return false;
      }
    };

    // ---------------------------------------
    // RECONNECT JSPM
    // ---------------------------------------

    const reconnectJSPM = () => {
      // User selected Skip Printer
      if (printerSkipped) {
        return;
      }

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

          if (isMounted) {
            setPrinterReady(true);
            setConnecting(false);
          }

          isReconnecting = false;
          return;
        }

        JSPM.JSPrintManager.start();

        reconnectTimer = setTimeout(() => {
          if (!isMounted) {
            isReconnecting = false;
            return;
          }

          const newStatus =
            JSPM.JSPrintManager.websocket_status;

          if (newStatus === JSPM.WSStatus.Open) {
            console.log("✅ JSPM reconnected");

            setPrinterReady(true);
          } else {
            console.warn(
              "⚠️ JSPM still disconnected"
            );

            // Don't hide LandingPage if it is
            // already open.
            setPrinterReady((current) => current);
          }

          setConnecting(false);
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

    // ---------------------------------------
    // INITIAL JSPM SETUP
    // ---------------------------------------

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

    // ---------------------------------------
    // INITIAL CONNECTION CHECK
    // ---------------------------------------

    let startupCount = 0;

    startupTimer = setInterval(() => {
      startupCount++;

      const status =
        JSPM.JSPrintManager.websocket_status;

      console.log(
        `JSPM startup check ${startupCount}:`,
        status
      );

      if (status === JSPM.WSStatus.Open) {
        console.log("✅ JSPM Connected");

        if (isMounted) {
          setPrinterReady(true);
          setConnecting(false);
        }

        if (startupTimer) {
          clearInterval(startupTimer);
          startupTimer = null;
        }

        return;
      }

      // After 10 seconds, the user can choose
      // Connect Printer or Skip Printer.
      if (startupCount >= 10) {
        console.warn(
          "⚠️ JSPM not connected"
        );

        if (isMounted) {
          setPrinterReady(false);
          setConnecting(false);
        }

        if (startupTimer) {
          clearInterval(startupTimer);
          startupTimer = null;
        }
      }
    }, 1000);

    // ---------------------------------------
    // BACKGROUND CONNECTION CHECK
    // ---------------------------------------

    checkTimer = setInterval(() => {
      if (printerSkipped) {
        return;
      }

      const status =
        JSPM.JSPrintManager.websocket_status;

      console.log(
        "JSPM background check:",
        status
      );

      if (status === JSPM.WSStatus.Open) {
        if (isMounted) {
          setPrinterReady(true);
        }

        return;
      }

      // If POS is already open, DON'T hide it.
      // Just reconnect silently.
      console.warn(
        "⚠️ JSPM disconnected → reconnecting"
      );

      reconnectJSPM();
    }, 5000);

    // ---------------------------------------
    // MOBILE RETURN FROM BACKGROUND
    // ---------------------------------------

    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "visible"
      ) {
        console.log(
          "📱 Mobile browser returned"
        );

        if (!printerSkipped) {
          setTimeout(() => {
            reconnectJSPM();
          }, 500);
        }
      }
    };

    // ---------------------------------------
    // NETWORK ONLINE
    // ---------------------------------------

    const handleOnline = () => {
      console.log(
        "🌐 Network connection restored"
      );

      if (!printerSkipped) {
        setTimeout(() => {
          reconnectJSPM();
        }, 1000);
      }
    };

    // ---------------------------------------
    // EVENTS
    // ---------------------------------------

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    window.addEventListener(
      "online",
      handleOnline
    );

    // ---------------------------------------
    // CLEANUP
    // ---------------------------------------

    return () => {
      isMounted = false;

      if (checkTimer) {
        clearInterval(checkTimer);
      }

      if (startupTimer) {
        clearInterval(startupTimer);
      }

      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );

      window.removeEventListener(
        "online",
        handleOnline
      );
    };
  }, [printerSkipped]);

  // ---------------------------------------
  // CONNECT PRINTER BUTTON
  // ---------------------------------------

  const handleConnectPrinter = () => {
    if (connecting) {
      return;
    }

    setConnecting(true);

    console.log(
      "🔌 Manual printer connection..."
    );

    try {
      JSPM.JSPrintManager.start();

      setTimeout(() => {
        const status =
          JSPM.JSPrintManager.websocket_status;

        if (status === JSPM.WSStatus.Open) {
          console.log(
            "✅ Printer connected"
          );

          setPrinterReady(true);
        } else {
          console.warn(
            "❌ Printer connection failed"
          );

          setPrinterReady(false);
        }

        setConnecting(false);
      }, 2000);
    } catch (error) {
      console.error(
        "Manual printer connection error:",
        error
      );

      setConnecting(false);
      setPrinterReady(false);
    }
  };

  // ---------------------------------------
  // SKIP PRINTER
  // ---------------------------------------

  const handleSkipPrinter = () => {
    console.log(
      "⏭️ Printer setup skipped"
    );

    setPrinterSkipped(true);
    setPrinterReady(true);
    setConnecting(false);
  };

  // ---------------------------------------
  // SHOW LANDING PAGE
  // ---------------------------------------

  const showApp =
    printerReady || printerSkipped;

  return (
    <>
      <CursorEffect />

      <AppProvider>
        <ActiveOLTProvider>
          <ItemProvider>
            <Toaster position="top-right" />

            {!showApp ? (
              <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
                <div className="flex items-center gap-3">

                  {/* CONNECT */}
                  <button
                    type="button"
                    onClick={handleConnectPrinter}
                    disabled={connecting}
                    className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {connecting
                      ? "Connecting..."
                      : "Connect Printer"}
                  </button>

                  {/* SKIP */}
                  <button
                    type="button"
                    onClick={handleSkipPrinter}
                    disabled={connecting}
                    className="rounded-lg border border-gray-300 bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Skip Printer
                  </button>

                </div>
              </div>
            ) : (
              <LandingPage />
            )}
          </ItemProvider>
        </ActiveOLTProvider>
      </AppProvider>
    </>
  );
}