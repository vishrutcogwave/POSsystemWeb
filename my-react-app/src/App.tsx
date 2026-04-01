import { Toaster } from "react-hot-toast";
import LandingPage from "./screens/LandingPage";
import { ItemProvider } from "./context/ItemContext";
import { ActiveOLTProvider } from "./context/ActiveOLTContext";
import { AppProvider } from "./context/AppContext";

export default function App() {
  return (
  <>
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