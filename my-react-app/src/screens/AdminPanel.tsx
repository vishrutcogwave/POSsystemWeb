import { useEffect, useState } from "react";
import {
  ShieldCheck,
  Menu,
  X,
  Lock,
} from "lucide-react";

import License from "../components/License";
import { useAppContext } from "../context/AppContext";
import {
  getAdminAccessMaster,
} from "../api/services/products.service";

type MenuType = "license";

export default function AdminPanel() {
  const { appData } = useAppContext();

  const [selectedMenu, setSelectedMenu] =
    useState<MenuType>("license");

  const [mobileMenu, setMobileMenu] = useState(false);

  // ================= ADMIN PASSWORD LOCK =================

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [adminPassword, setAdminPassword] = useState("");
  const [_adminUserId, setAdminUserId] = useState(0);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // ================= GET ADMIN ACCESS =================

  useEffect(() => {
    const loadAdminAccess = async () => {
      if (!appData?.user?.branch_code) return;

      try {
        setPasswordLoading(true);
        setError("");

        const res = await getAdminAccessMaster(
          appData.user.branch_code
        );

        console.log("Admin Access Response:", res);

        if (res.success && res.data) {
          setAdminUserId(res.data.secoundUserId);
          setAdminPassword(res.data.adminPassword);
        } else {
          setAdminUserId(0);
          setAdminPassword("");

          setError(
            res.message || "Admin access details not found"
          );
        }
      } catch (error: any) {
        console.error(
          "Error loading admin access:",
          error
        );

        setAdminUserId(0);
        setAdminPassword("");

        setError(
          error?.response?.data?.message ||
            "Failed to load admin access"
        );
      } finally {
        setPasswordLoading(false);
      }
    };

    loadAdminAccess();
  }, [appData?.user?.branch_code]);

  // ================= UNLOCK =================

  const handleUnlock = () => {
    if (passwordLoading) {
      return;
    }

    if (!adminPassword) {
      setError("Admin password is not configured");
      return;
    }

    if (password === adminPassword) {
      setIsUnlocked(true);
      setError("");
      setPassword("");
    } else {
      setError("Incorrect password");
      setPassword("");
    }
  };

  // ================= MENUS =================

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
  ];

  return (
    <div className="h-[calc(100vh-64px)] flex bg-[#EEF3F8]">

      {/* ================================================= */}
      {/* PASSWORD POPUP */}
      {/* ================================================= */}

      {!isUnlocked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">

          <div className="w-[90%] max-w-sm rounded-2xl bg-white p-6 shadow-2xl">

            {/* Icon */}

            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#0576B2]/10">

                <Lock
                  className="text-[#0576B2]"
                  size={32}
                />

              </div>
            </div>

            {/* Title */}

            <h2 className="text-center text-2xl font-bold text-gray-800">
              Admin Access
            </h2>

            <p className="mt-2 text-center text-gray-500">
              Enter admin password to continue
            </p>

            {/* Password */}

            <input
              type="password"
              placeholder={
                passwordLoading
                  ? "Loading..."
                  : "Enter Password"
              }
              value={password}
              disabled={passwordLoading}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleUnlock();
                }
              }}
              className="mt-6 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#0576B2] focus:ring-2 focus:ring-[#0576B2]/20 disabled:bg-gray-100"
              autoFocus
            />

            {/* Error */}

            {error && (
              <p className="mt-3 text-center text-sm text-red-500">
                {error}
              </p>
            )}

            {/* Unlock */}

            <button
              onClick={handleUnlock}
              disabled={
                passwordLoading || !password
              }
              className="mt-6 w-full rounded-lg bg-[#0576B2] py-3 font-semibold text-white transition hover:bg-[#046191] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {passwordLoading
                ? "Loading..."
                : "Unlock"}
            </button>

          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* MAIN CONTENT */}
      {/* ================================================= */}

      {isUnlocked && (
        <>
          {/* Mobile Overlay */}

          {mobileMenu && (
            <div
              className="fixed inset-0 z-30 bg-black/40 md:hidden"
              onClick={() =>
                setMobileMenu(false)
              }
            />
          )}

          {/* ================================================= */}
          {/* SIDEBAR */}
          {/* ================================================= */}

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

            {/* Sidebar Header */}

            <div className="flex h-16 items-center justify-between border-b bg-[#0576B2] px-5 text-white">

              <h2 className="text-xl font-semibold">
                Admin Panel
              </h2>

              <button
                className="md:hidden"
                onClick={() =>
                  setMobileMenu(false)
                }
              >
                <X size={22} />
              </button>

            </div>

            {/* Menu */}

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
                    className={`
                      w-full flex items-center gap-4
                      px-5 py-3 transition
                      ${
                        selectedMenu === menu.id
                          ? "bg-[#0576B2] text-white border-r-4 border-blue-900"
                          : "text-gray-700 hover:bg-blue-50 hover:text-[#0576B2]"
                      }
                    `}
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

          {/* ================================================= */}
          {/* RIGHT SIDE */}
          {/* ================================================= */}

          <div className="flex flex-1 flex-col overflow-hidden">

            {/* Mobile Header */}

            <header className="flex h-16 items-center bg-[#0576B2] px-4 text-white shadow md:hidden">

              <button
                onClick={() =>
                  setMobileMenu(true)
                }
              >
                <Menu size={24} />
              </button>

              <h1 className="ml-4 text-lg font-semibold">
                Admin Panel
              </h1>

            </header>

            {/* Desktop Header */}

            <header className="hidden h-16 items-center justify-between border-b bg-white px-6 shadow-sm md:flex">

              <h1 className="text-2xl font-semibold text-[#0576B2]">
                {
                  menus.find(
                    (m) =>
                      m.id === selectedMenu
                  )?.name
                }
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

              {selectedMenu === "license" && (
                <License />
              )}

            </main>

          </div>
        </>
      )}

    </div>
  );
}