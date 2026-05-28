import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getUserPermissionAccessList } from "../api/services/products.service";

interface AppContextType {
  appData: any | null;
  userRights: any[];
  setAppData: (data: any) => void;
  clearAppData: () => void;
  refreshUserRights: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [appData, setAppDataState] = useState<any | null>(() => {
    const stored = localStorage.getItem("appData");
    return stored ? JSON.parse(stored) : null;
  });

  const [userRights, setUserRights] = useState<any[]>(() => {
    const stored = localStorage.getItem("userRights");
    return stored ? JSON.parse(stored) : [];
  });

  const setAppData = (data: any) => {
    setAppDataState(data);
    localStorage.setItem("appData", JSON.stringify(data));
  };

  const fetchUserRights = async (
    branchcode: string,
    usercode: number
  ) => {
    try {
      const response = await getUserPermissionAccessList(
        branchcode,
        usercode
      );

      const rights = response?.data || response || [];

      setUserRights(rights);

      localStorage.setItem("userRights", JSON.stringify(rights));
    } catch (error) {
      console.error("Failed to fetch user rights:", error);
      setUserRights([]);
      localStorage.removeItem("userRights");
    }
  };

  const refreshUserRights = async () => {
    if (!appData) return;

    await fetchUserRights(
      appData.branchcode,
      Number(appData.usercode)
    );
  };

  useEffect(() => {
    if (appData?.branchcode && appData?.usercode) {
      fetchUserRights(
        appData.branchcode,
        Number(appData.usercode)
      );
    }
  }, [appData]);

  const clearAppData = () => {
    setAppDataState(null);
    setUserRights([]);

    localStorage.removeItem("appData");
    localStorage.removeItem("userRights");
  };

  return (
    <AppContext.Provider
      value={{
        appData,
        userRights,
        setAppData,
        clearAppData,
        refreshUserRights,
      }}
    >
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