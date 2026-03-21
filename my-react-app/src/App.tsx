import { Toaster } from "react-hot-toast";
import LandingPage from "./screens/LandingPage";
import { ItemProvider } from "./context/ItemContext";
import { ActiveOLTProvider } from "./context/ActiveOLTContext";

export default function App() {
  return (
  <>
  <ActiveOLTProvider>
  <ItemProvider>
   <Toaster position="top-right" />
   <LandingPage/>
   </ItemProvider>
   </ActiveOLTProvider>
   </>)
}