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
  console.log("license_url before:", JSPM.JSPrintManager.license_url);
  const baseURL = localStorage.getItem("baseUrl") || "";
  console.log("baseURL",baseURL);
  
JSPM.JSPrintManager.license_url = `${baseURL}api/POS/jspm`;

console.log("license_url after:", JSPM.JSPrintManager.license_url);

console.log(JSPM.JSPrintManager);

JSPM.JSPrintManager.start();
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