import { Toaster } from "react-hot-toast";
import LandingPage from "./screens/LandingPage";
import { ItemProvider } from "./context/ItemContext";

export default function App() {
  return (
  <>
  <ItemProvider>
   <Toaster position="top-right" />
   <LandingPage/>;
   </ItemProvider>
   </>)
}