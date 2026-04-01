import  { createContext, useContext, useState, type ReactNode } from "react";

interface AppContextType {
  appData: any | null;
  setAppData: (data: any) => void;
  clearAppData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [appData, setAppDataState] = useState<any | null>(null);

  const setAppData = (data: any) => {
    setAppDataState(data);
    localStorage.setItem("appData", JSON.stringify(data)); // persist
  };

  const clearAppData = () => {
    setAppDataState(null);
    localStorage.removeItem("appData");
  };

  return (
    <AppContext.Provider value={{ appData, setAppData, clearAppData }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom Hook
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
};