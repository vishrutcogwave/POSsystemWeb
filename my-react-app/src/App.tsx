import { Toaster } from "react-hot-toast";
import LandingPage from "./screens/LandingPage";
import { ItemProvider } from "./context/ItemContext";
import { ActiveOLTProvider } from "./context/ActiveOLTContext";
import { AppProvider } from "./context/AppContext";
import CursorEffect from "./components/CursorEffect";

export default function App() {
  return (
  <>
    <CursorEffect />
    <AppProvider>
  <ActiveOLTProvider>
  <ItemProvider>
   <Toaster position="top-right" />
   <LandingPage/>
   </ItemProvider>
   </ActiveOLTProvider>
   </AppProvider>
   </>)
}