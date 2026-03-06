// src/context/ActiveOLTContext.tsx
import React, { createContext, useContext, useState } from "react";

interface ActiveOLTContextType {
  activeOltCode: string;
  activeOltName: string;
  setActiveOLT: (code: string, name: string) => void;
}

const ActiveOLTContext = createContext<ActiveOLTContextType>({
  activeOltCode: "",
  activeOltName: "",
  setActiveOLT: () => {},
});

export const ActiveOLTProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeOltCode, setActiveOltCode] = useState<string>(
    localStorage.getItem("activeOltCode") || ""
  );
  const [activeOltName, setActiveOltName] = useState<string>(
    localStorage.getItem("activeOltName") || ""
  );

  const setActiveOLT = (code: string, name: string) => {
    setActiveOltCode(code);
    setActiveOltName(name);
    localStorage.setItem("activeOltCode", code);
    localStorage.setItem("activeOltName", name);
  };

  return (
    <ActiveOLTContext.Provider value={{ activeOltCode, activeOltName, setActiveOLT }}>
      {children}
    </ActiveOLTContext.Provider>
  );
};

export const useActiveOLT = () => useContext(ActiveOLTContext);