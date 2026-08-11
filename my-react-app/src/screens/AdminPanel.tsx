import { useState } from "react";
import {
  ShieldCheck,
  ReceiptText,
  Menu,
  X,
  Lock,
} from "lucide-react";

import License from "../components/License";
import BillAdjustment from "./BillAdjustment";

type MenuType = "license" | "billadjustment";

const ADMIN_PASSWORD = "Cogwave@123"; // Change this

export default function AdminPanel() {
  const [selectedMenu, setSelectedMenu] =
    useState<MenuType>("license");

  const [mobileMenu, setMobileMenu] = useState(false);

  // Password Lock
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleUnlock = () => {
    if (password === ADMIN_PASSWORD) {
      setIsUnlocked(true);
      setError("");
      setPassword("");
    } else {
      setError("Incorrect password");
      setPassword("");
    }
  };

  const menus: {
    id: MenuType;
    name: string;
    icon: any;
  }[] = [
    {
      id: "license",
      name: "License",
      icon: ShieldCheck,
    },
    {
      id: "billadjustment",
      name: "Bill Adjustment",
      icon: ReceiptText,
    },
  ];

  return (
    <div className="h-[calc(100vh-64px)] flex bg-[#EEF3F8]">

      {/* Password Popup */}
      {!isUnlocked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-[90%] max-w-sm rounded-2xl bg-white p-6 shadow-2xl">

            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-[#0576B2]/10 flex items-center justify-center">
                <Lock className="text-[#0576B2]" size={32} />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-center text-gray-800">
              Admin Access
            </h2>

            <p className="text-center text-gray-500 mt-2">
              Enter admin password to continue
            </p>

            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleUnlock();
                }
              }}
              className="mt-6 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#0576B2] focus:ring-2 focus:ring-[#0576B2]/20"
              autoFocus
            />

            {error && (
              <p className="mt-3 text-center text-sm text-red-500">
                {error}
              </p>
            )}

            <button
              onClick={handleUnlock}
              className="mt-6 w-full rounded-lg bg-[#0576B2] py-3 font-semibold text-white transition hover:bg-[#046191]"
            >
              Unlock
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      {isUnlocked && (
        <>
          {/* Mobile Overlay */}
          {mobileMenu && (
            <div
              className="fixed inset-0 bg-black/40 z-30 md:hidden"
              onClick={() => setMobileMenu(false)}
            />
          )}

          {/* Sidebar */}
          <aside
            className={`
              fixed md:static top-0 left-0 h-full w-72
              bg-white border-r shadow-sm z-40
              transform transition-transform duration-300
              ${
                mobileMenu
                  ? "translate-x-0"
                  : "-translate-x-full md:translate-x-0"
              }
            `}
          >
            <div className="h-16 flex items-center justify-between px-5 border-b bg-[#0576B2] text-white">
              <h2 className="text-xl font-semibold">
                Admin Panel
              </h2>

              <button
                className="md:hidden"
                onClick={() => setMobileMenu(false)}
              >
                <X size={22} />
              </button>
            </div>

            <div className="py-2">
              {menus.map((menu) => {
                const Icon = menu.icon;

                return (
                  <button
                    key={menu.id}
                    onClick={() => {
                      setSelectedMenu(menu.id);
                      setMobileMenu(false);
                    }}
                    className={`w-full flex items-center gap-4 px-5 py-3 transition
                      ${
                        selectedMenu === menu.id
                          ? "bg-[#0576B2] text-white border-r-4 border-blue-900"
                          : "text-gray-700 hover:bg-blue-50 hover:text-[#0576B2]"
                      }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">
                      {menu.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Right Side */}
          <div className="flex-1 flex flex-col overflow-hidden">

            {/* Mobile Header */}
            <header className="md:hidden h-16 bg-[#0576B2] text-white flex items-center px-4 shadow">
              <button onClick={() => setMobileMenu(true)}>
                <Menu size={24} />
              </button>

              <h1 className="ml-4 text-lg font-semibold">
                Admin Panel
              </h1>
            </header>

            {/* Desktop Header */}
            <header className="hidden md:flex h-16 bg-white border-b items-center justify-between px-6 shadow-sm">
              <h1 className="text-2xl font-semibold text-[#0576B2]">
                {menus.find((m) => m.id === selectedMenu)?.name}
              </h1>

              <button
                onClick={() => {
                  setIsUnlocked(false);
                  setPassword("");
                  setError("");
                }}
                className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
              >
                Lock
              </button>
            </header>

            {/* Content */}
            <main className="flex-1 overflow-auto p-4 md:p-6">

              {selectedMenu === "license" && <License />}

              {selectedMenu === "billadjustment" && (
                <BillAdjustment />
              )}

            </main>
          </div>
        </>
      )}
    </div>
  );
}