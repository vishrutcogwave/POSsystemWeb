import { useEffect } from "react";
import * as JSPM from "jsprintmanager";
import toast, { Toaster } from "react-hot-toast";

import LandingPage from "./screens/LandingPage";
import { ItemProvider } from "./context/ItemContext";
import { ActiveOLTProvider } from "./context/ActiveOLTContext";
import { AppProvider } from "./context/AppContext";
import CursorEffect from "./components/CursorEffect";

export default function App() {
useEffect(() => {
  JSPM.JSPrintManager.auto_reconnect = true;

  JSPM.JSPrintManager.start();

  setTimeout(() => {
    if (JSPM.JSPrintManager.websocket_status === JSPM.WSStatus.Open) {
      toast.success("🖨️ JSPrintManager Connected");
    } else {
      toast.error(
        "❌ JSPrintManager is not running. Please start the JSPrintManager desktop application."
      );
    }
  }, 1500);
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