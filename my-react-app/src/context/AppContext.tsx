import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { getUserPermissionAccessList } from "../api/services/products.service";
import toast from "react-hot-toast";

interface AppContextType {
  appData: any | null;
  userRights: any[];
  setAppData: (data: any) => Promise<void>;
  clearAppData: () => void;
  refreshUserRights: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [appData, setAppDataState] = useState<any | null>(() => {
    const stored = localStorage.getItem("appData");
    return stored ? JSON.parse(stored) : null;
  });

  const [userRights, setUserRights] = useState<any[]>(() => {
    const stored = localStorage.getItem("userRights");
    return stored ? JSON.parse(stored) : [];
  });

  const fetchUserRights = async (
    branchcode: string,
    usercode: number
  ) => {
    try {
      console.log("Calling User Rights API", {
        branchcode,
        usercode,
      });

      const response = await getUserPermissionAccessList(
        branchcode,
        usercode
      );

      console.log("User Rights API Response:", response);

      const rights = response?.data || response || [];

      setUserRights(rights);

      localStorage.setItem(
        "userRights",
        JSON.stringify(rights)
      );

    } catch (error: any) {
      console.error("Failed to fetch user rights:", error);

      setUserRights([]);

      localStorage.removeItem("userRights");

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch user rights"
      );
    }
  };

  const setAppData = async (data: any) => {
    console.log("LOGIN RESPONSE:", data);

    setAppDataState(data);

    localStorage.setItem("appData", JSON.stringify(data));

    // DIRECTLY SET USER RIGHTS FROM LOGIN RESPONSE
    if (data?.userRights) {
      setUserRights(data.userRights);

      localStorage.setItem(
        "userRights",
        JSON.stringify(data.userRights)
      );
    }

    // FETCH LATEST RIGHTS API
    const branchcode = data?.user?.branch_code;

    const usercode = data?.user?.userCode;

    console.log("branchcode:", branchcode);
    console.log("usercode:", usercode);

    if (branchcode && usercode) {
      await fetchUserRights(
        branchcode,
        Number(usercode)
      );
    } else {
      console.error(
        "branchcode or usercode missing"
      );
    }
  };

  const refreshUserRights = async () => {
    if (!appData?.user) return;

    await fetchUserRights(
      appData.user.branch_code,
      Number(appData.user.userCode)
    );
  };

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

// CUSTOM HOOK
export const useAppContext = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error(
      "useAppContext must be used within AppProvider"
    );
  }

  return context;
};