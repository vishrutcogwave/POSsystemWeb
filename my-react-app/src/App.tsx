import { useEffect } from "react";
import * as JSPM from "jsprintmanager";
import  { Toaster } from "react-hot-toast";

import LandingPage from "./screens/LandingPage";
import { ItemProvider } from "./context/ItemContext";
import { ActiveOLTProvider } from "./context/ActiveOLTContext";
import { AppProvider } from "./context/AppContext";
import CursorEffect from "./components/CursorEffect";

export default function App() {
useEffect(() => {
  JSPM.JSPrintManager.auto_reconnect = true;

  JSPM.JSPrintManager.start();

  const timer = setInterval(() => {
    const status = JSPM.JSPrintManager.websocket_status;

    alert(`JSPM Status: ${status}`);

    if (status === JSPM.WSStatus.Open) {
          alert(`JSPM Status: ${status}`);
      alert("✅ JSPrintManager Connected");
      clearInterval(timer);
    } else {
      alert("❌ JSPrintManager Not Connected");
    }
  }, 3000); // Check every 3 seconds

  return () => clearInterval(timer);
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