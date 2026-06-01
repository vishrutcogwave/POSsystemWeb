// import { useState, useEffect, useRef } from "react";
// import {
//   LayoutGrid,
//   ChevronDown,
//   Monitor,
//   Settings,
//   Database,
//   Boxes,
//   FileBarChart,
//   LogOut,
//   Menu,
//   X,
//   FileText,
//   BarChart3,
//   ClipboardList,
//   Ban,
//   FileX,
//   Building2,
//   Receipt,
//   Store,
//   Package,
//   UserCog,
//   ShieldCheck,
//   Printer,
// } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import DayEntryPopup from "./DayEntryPopup";
// import { useAppContext } from "../context/AppContext";

// const DashboardHeader: React.FC = () => {
//   const [activeMenu, setActiveMenu] = useState<string | null>(null);
//   const [mobileOpen, setMobileOpen] = useState(false);
//   const [showDayPopup, setShowDayPopup] = useState(false);

//   const navigate = useNavigate();
//   const wrapperRef = useRef<HTMLDivElement>(null);
// const { userRights } = useAppContext();

// const hasMainMenuAccess = (menuName: string) => {
//   return userRights?.some(
//     (menu: any) =>
//       menu.menuName?.toLowerCase() === menuName.toLowerCase() &&
//       menu.menuPermission === true
//   );
// };

// const hasSubMenuAccess = (subMenuName: string) => {
//   return userRights?.some((menu: any) =>
//     menu.subMenus?.some(
//       (sub: any) =>
//         sub.subMenuName?.toLowerCase() ===
//           subMenuName.toLowerCase() &&
//         sub.isPermission === true
//     )
//   );
// };

// console.log("userRightsfromtheocntext",userRights);
//   // 🔥 POS dropdown items
//   const posDropdownItems = [
//     { name: "Touch Screen", icon: Monitor },
//     { name: "Day Close", icon: LogOut }, // or any icon you like
//   ];

//   // 🔥 POS Reports dropdown items WITH ICONS
//   const posReportItems = [
//     { name: "DailySales", icon: BarChart3 },
//     { name: "ItemSales", icon: FileText },
//     { name: "ChanceSheet", icon: ClipboardList },
//     { name: "VoidKot", icon: Ban },
//     { name: "Nckot", icon: FileX },
//     { name: "BillReprint", icon: FileText },

//   ];
//   // 🔥 MASTER DROPDOWN
// const masterItems = [
//   {
//     name: "Company Master",
//     icon: Building2,
//     permissionName: "Company Definition",
//   },
//   {
//     name: "Tax Master",
//     icon: Receipt,
//     permissionName: "Tax",
//   },
//   {
//     name: "Tax Description Master",
//     icon: Receipt,
//     permissionName: "Tax",
//   },
//   {
//     name: "Department Master",
//     icon: Boxes,
//     permissionName: "Department",
//   },
//   {
//     name: "Outlet Master",
//     icon: Store,
//     permissionName: "Outlet",
//   },
//   {
//     name: "Item Master",
//     icon: Package,
//     permissionName: "Item",
//   },
//   {
//     name: "Unit Master",
//     icon: Package,
//     permissionName: "Unit",
//   },
//   {
//     name: "Group Master",
//     icon: Package,
//     permissionName: "Group Master",
//   },
//   {
//     name: "Category Master",
//     icon: Package,
//     permissionName: "Category",
//   },
//   {
//     name: "Sub Category Master",
//     icon: Package,
//     permissionName: "Sub Category",
//   },
//   {
//     name: "Steward Master",
//     icon: UserCog,
//     permissionName: "Steward Definition",
//   },
//   {
//     name: "NC Department Master",
//     icon: ShieldCheck,
//     permissionName: "NC Department",
//   },
//   {
//     name: "Printing Master",
//     icon: Printer,
//     permissionName: "Printing Department",
//   },
//   {
//     name: "Table Master",
//     icon: LayoutGrid,
//     permissionName: "Table Definition",
//   },
//   {
//     name: "Property Master",
//     icon: Building2,
//     permissionName: "Company Definition",
//   },
//   {
//     name: "Branch Master",
//     icon: Store,
//     permissionName: "Outlet",
//   },
//   {
//     name: "User Master",
//     icon: UserCog,
//     permissionName: "User Rights",
//   },
//   {
//     name: "User Rights Master",
//     icon: ShieldCheck,
//     permissionName: "User Rights",
//   },
// ];
//   // 🔥 SUB MASTER DROPDOWN
// const subMasterItems = [
//   {
//     name: "Outlet Items Details",
//     icon: Package,
//     permissionName: "Outlet Items",
//   },
// ];

//   // 🔥 Navigation map
//   const routeMap: Record<string, string> = {
//     "Touch Screen": "/NewOrder",
//     DailySales: "/pos/dailysales",
//     ItemSales: "/pos/itemsales",
//     ChanceSheet: "/pos/chancesheet",
//     VoidKot: "/pos/voidkot",
//     Nckot: "/pos/nckot",
//     BillReprint: "/pos/billreprint",
//     "Company Master": "/master/company",
//     "Tax Master": "/master/tax",
//     "Tax Description Master": "/master/taxdescrip",
//     "Department Master": "/master/departmentmaster",
//     "Outlet Master": "/master/outletmaster",
//     "Outlet Items Details": "/submaster/outletitemsdetails",
//     "Item Master": "/master/itemmaster",
//       "Unit Master": "/master/unitmaster",
//         "Group Master": "/master/groupmaster",
//         "Category Master": "/master/categorymaster",
//         "Sub Category Master":
//   "/master/subcategorymaster",
//   "Steward Master":
//   "/master/stewardmaster",
//   "NC Department Master":
//   "/master/ncdepartmentmaster",
//     "Printing Master":
//     "/master/printingmaster",
//     "Table Master":
// "/master/tablemaster",
// "Property Master": "/master/propertymaster",
// "Branch Master": "/master/branchmaster",
// "User Master": "/master/usermaster",
// "User Rights Master":
// "/master/userrightsmaster",

//   };

//   const handleNavigation = (name: string) => {
//     if (name === "Day Close") {
//       setShowDayPopup(true);
//       setActiveMenu(null);
//       return;
//     }

//     if (routeMap[name]) {
//       navigate(routeMap[name]);
//     }

//     setActiveMenu(null);
//     setMobileOpen(false);
//   };

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     navigate("/");
//   };

//   const toggleMenu = (menu: string) => {
//     setActiveMenu((prev) => (prev === menu ? null : menu));
//   };

//   useEffect(() => {
//     const handleClickOutside = (e: MouseEvent) => {
//       if (
//         wrapperRef.current &&
//         !wrapperRef.current.contains(e.target as Node)
//       ) {
//         setActiveMenu(null);
//       }
//     };

//     const handleEsc = (e: KeyboardEvent) => {
//       if (e.key === "Escape") {
//         setActiveMenu(null);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     document.addEventListener("keydown", handleEsc);

//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//       document.removeEventListener("keydown", handleEsc);
//     };
//   }, []);

//   return (
//     <div ref={wrapperRef} className="w-full bg-gray-100 border-b shadow-sm">
//       {/* Top Title */}
//       <div className="px-4 sm:px-6 py-2 bg-gray-200 text-xs sm:text-sm font-semibold text-gray-800 border-b">
//         POINT OF SALE : COGWAVE SOFTWARE TECHNOLOGIES BANGALORE INDIA
//       </div>

//       {/* Main Menu */}
//       <div className="flex items-center justify-between px-4 sm:px-6 py-2 bg-gray-100 text-sm font-medium text-gray-800">
//         {/* LEFT */}
//         <div className="flex items-center gap-4">
//           {/* Mobile Toggle */}
//           <button
//             className="sm:hidden"
//             onClick={(e) => {
//               e.stopPropagation();
//               setMobileOpen(!mobileOpen);
//             }}
//           >
//             {mobileOpen ? <X size={22} /> : <Menu size={22} />}
//           </button>

//           {/* Desktop Menu */}
//           <div className="hidden sm:flex items-center gap-6">
//             {/* MASTER DROPDOWN */}
//            {hasMainMenuAccess("Master") && (
//   <div className="relative">
//     <button
//       onClick={() => toggleMenu("MASTER")}
//       className="flex items-center gap-2 hover:text-blue-600"
//     >
//       <Settings size={16} className="text-blue-600" />
//       Master
//       <ChevronDown size={14} />
//     </button>

//     {activeMenu === "MASTER" && (
//       <div className="absolute left-0 mt-2 w-52 bg-white border rounded shadow-md z-50 max-h-96 overflow-y-auto">
//         {masterItems
//           .filter((item) =>
//             hasSubMenuAccess(item.permissionName)
//           )
//           .map((item, index) => {
//             const Icon = item.icon;

//             return (
//               <div
//                 key={index}
//                 onClick={() => handleNavigation(item.name)}
//                 className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50 cursor-pointer"
//               >
//                 <Icon size={16} />
//                 {item.name}
//               </div>
//             );
//           })}
//       </div>
//     )}
//   </div>
// )}
//             {/* SUB MASTER DROPDOWN */}
//           {hasMainMenuAccess("Sub Master") && (
//   <div className="relative">
//     <button
//       onClick={() => toggleMenu("SUB_MASTER")}
//       className="flex items-center gap-2 hover:text-purple-600"
//     >
//       <Database size={16} className="text-purple-600" />
//       Sub Master
//       <ChevronDown size={14} />
//     </button>

//     {activeMenu === "SUB_MASTER" && (
//       <div className="absolute left-0 mt-2 w-56 bg-white border rounded shadow-md z-50">
//         {subMasterItems
//           .filter((item) =>
//             hasSubMenuAccess(item.permissionName)
//           )
//           .map((item, index) => {
//             const Icon = item.icon;

//             return (
//               <div
//                 key={index}
//                 onClick={() => handleNavigation(item.name)}
//                 className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50 cursor-pointer"
//               >
//                 <Icon size={16} />
//                 {item.name}
//               </div>
//             );
//           })}
//       </div>
//     )}
//   </div>
// )}
//             {/* <button className="flex items-center gap-2 hover:text-green-600">
//               <Boxes size={16} className="text-green-600" />
//               Inventory
//             </button> */}

//             {/* POS Dropdown */}
//             <div className="relative">
//               <button
//                 onClick={() => toggleMenu("POS")}
//                 className="flex items-center gap-2 hover:text-orange-600"
//               >
//                 <LayoutGrid size={16} className="text-orange-600" />
//                 POS
//                 <ChevronDown size={14} />
//               </button>

//               {activeMenu === "POS" && (
//                 <div className="absolute left-0 mt-2 w-52 bg-white border rounded shadow-md z-50 max-h-96 overflow-y-auto">
//                   {posDropdownItems.map((item, index) => {
//                     const Icon = item.icon;
//                     return (
//                       <div
//                         key={index}
//                         onClick={() => handleNavigation(item.name)}
//                         className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50 cursor-pointer"
//                       >
//                         <Icon size={16} />
//                         {item.name}
//                       </div>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>

//             {/* POS REPORTS DROPDOWN */}
//             <div className="relative">
//               <button
//                 onClick={() => toggleMenu("POS_REPORTS")}
//                 className="flex items-center gap-2 hover:text-red-600"
//               >
//                 <FileBarChart size={16} className="text-red-600" />
//                 POS Reports
//                 <ChevronDown size={14} />
//               </button>

//               {activeMenu === "POS_REPORTS" && (
//                 <div className="absolute left-0 mt-2 w-52 bg-white border rounded shadow-md z-50 max-h-96 overflow-y-auto">
//                   {posReportItems.map((item, index) => {
//                     const Icon = item.icon;
//                     return (
//                       <div
//                         key={index}
//                         onClick={() => handleNavigation(item.name)}
//                         className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50 cursor-pointer"
//                       >
//                         <Icon size={16} />
//                         {item.name}
//                       </div>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>
//             {/*
//             <button className="flex items-center gap-2 hover:text-indigo-600">
//               <FileBarChart size={16} className="text-indigo-600" />
//               Inventory Reports
//             </button>

//             <button className="flex items-center gap-2 hover:text-teal-600">
//               <Wrench size={16} className="text-teal-600" />
//               Utility
//             </button> */}
//           </div>
//         </div>

//         {/* LOGOUT */}
//         <button
//           onClick={handleLogout}
//           className="flex items-center gap-2 px-3 py-1.5 bg-red-500 text-white rounded hover:bg-red-600"
//         >
//           <LogOut size={16} />
//           <span className="hidden sm:inline">Logout</span>
//         </button>
//       </div>

//       {/* MOBILE MENU */}
//       {mobileOpen && (
//         <div className="sm:hidden flex flex-col gap-3 px-4 py-3 bg-white border-t shadow-md text-sm">
//           {/* MASTER MOBILE */}
//         {hasMainMenuAccess("Master") && (
//   <div>
//     <button
//       onClick={() => toggleMenu("MASTER")}
//       className="flex justify-between w-full"
//     >
//       Master <ChevronDown size={16} />
//     </button>

//     {activeMenu === "MASTER" && (
//       <div className="ml-4 mt-2 flex flex-col gap-2">
//         {masterItems
//           .filter((item) =>
//             hasSubMenuAccess(item.permissionName)
//           )
//           .map((item, i) => {
//             const Icon = item.icon;

//             return (
//               <button
//                 key={i}
//                 onClick={() => handleNavigation(item.name)}
//                 className="flex items-center gap-2"
//               >
//                 <Icon size={16} />
//                 {item.name}
//               </button>
//             );
//           })}
//       </div>
//     )}
//   </div>
// )}
//           {/* SUB MASTER */}
//          {hasMainMenuAccess("Sub Master") && (
//   <div>
//     <button
//       onClick={() => toggleMenu("SUB_MASTER")}
//       className="flex justify-between w-full"
//     >
//       Sub Master <ChevronDown size={16} />
//     </button>

//     {activeMenu === "SUB_MASTER" && (
//       <div className="ml-4 mt-2 flex flex-col gap-2">
//         {subMasterItems
//           .filter((item) =>
//             hasSubMenuAccess(item.permissionName)
//           )
//           .map((item, i) => {
//             const Icon = item.icon;

//             return (
//               <button
//                 key={i}
//                 onClick={() => handleNavigation(item.name)}
//                 className="flex items-center gap-2"
//               >
//                 <Icon size={16} />
//                 {item.name}
//               </button>
//             );
//           })}
//       </div>
//     )}
//   </div>
// )}

//           {/* <button className="flex items-center gap-2">
//             <Boxes size={16} /> Inventory
//           </button> */}

//           {/* POS */}
//           <div>
//             <button
//               onClick={() => toggleMenu("POS")}
//               className="flex justify-between w-full"
//             >
//               POS <ChevronDown size={16} />
//             </button>

//             {activeMenu === "POS" && (
//               <div className="ml-4 mt-2">
//                 {posDropdownItems.map((item, i) => {
//                   const Icon = item.icon;
//                   return (
//                     <button
//                       key={i}
//                       onClick={() => handleNavigation(item.name)}
//                       className="flex items-center gap-2"
//                     >
//                       <Icon size={16} />
//                       {item.name}
//                     </button>
//                   );
//                 })}
//               </div>
//             )}
//           </div>

//           {/* POS REPORTS */}
//           <div>
//             <button
//               onClick={() => toggleMenu("POS_REPORTS")}
//               className="flex justify-between w-full"
//             >
//               POS Reports <ChevronDown size={16} />
//             </button>

//             {activeMenu === "POS_REPORTS" && (
//               <div className="ml-4 mt-2 flex flex-col gap-2">
//                 {posReportItems.map((item, i) => {
//                   const Icon = item.icon;
//                   return (
//                     <button
//                       key={i}
//                       onClick={() => handleNavigation(item.name)}
//                       className="flex items-center gap-2"
//                     >
//                       <Icon size={16} />
//                       {item.name}
//                     </button>
//                   );
//                 })}
//               </div>
//             )}
//           </div>
//           {/*
//           <button>Inventory Reports</button>
//           <button>Utility</button> */}
//         </div>
//       )}
//       <DayEntryPopup
//         isOpen={showDayPopup}
//         onClose={() => setShowDayPopup(false)}
//       />
//     </div>
//   );
// };

// export default DashboardHeader;

import { useState, useEffect, useRef } from "react";
import {
  LayoutGrid,
  ChevronDown,
  Monitor,
  Settings,
  Database,
  Boxes,
  FileBarChart,
  LogOut,
  Menu,
  X,
  FileText,
  BarChart3,
  ClipboardList,
  Ban,
  FileX,
  Building2,
  Receipt,
  Store,
  Package,
  UserCog,
  ShieldCheck,
  Printer,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DayEntryPopup from "./DayEntryPopup";
import { useAppContext } from "../context/AppContext";

const DashboardHeader: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showDayPopup, setShowDayPopup] = useState(false);

  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { userRights } = useAppContext();

  const hasMainMenuAccess = (menuName: string) => {
    return userRights?.some(
      (menu: any) =>
        menu.menuName?.toLowerCase() === menuName.toLowerCase() &&
        menu.menuPermission === true,
    );
  };

  const hasSubMenuAccess = (subMenuName: string) => {
    return userRights?.some((menu: any) =>
      menu.subMenus?.some(
        (sub: any) =>
          sub.subMenuName?.toLowerCase() === subMenuName.toLowerCase() &&
          sub.isPermission === true,
      ),
    );
  };

  console.log("userRightsfromtheocntext", userRights);
  // 🔥 POS dropdown items
  const posDropdownItems = [
    {
      name: "Touch Screen",
      icon: Monitor,
      permissionName: "Touch Screen",
    },
    {
      name: "Day Close",
      icon: LogOut,
      permissionName: "Day Wise Shift Entry",
    },
  ];

  // 🔥 POS Reports dropdown items WITH ICONS
  const posReportItems = [
    {
      name: "DailySales",
      icon: BarChart3,
      permissionName: "Daily Sales Report",
    },
    {
      name: "ItemSales",
      icon: FileText,
      permissionName: "Item Rate List",
    },
    {
      name: "ChanceSheet",
      icon: ClipboardList,
      permissionName: "Costing Report",
    },
    {
      name: "VoidKot",
      icon: Ban,
      permissionName: "Bill Reprint",
    },
    {
      name: "Nckot",
      icon: FileX,
      permissionName: "Bill Reprint",
    },
    {
      name: "BillReprint",
      icon: FileText,
      permissionName: "Bill Reprint",
    },
    {
      name: "KotCancellation",
      icon: Ban,
      permissionName: "Bill Reprint",
    },

    {
      name: "BillCancellation",
      icon: Ban,
      permissionName: "Bill Reprint",
    },

    {
      name: "DailysaleCategorywise",
      icon: BarChart3,
      permissionName: "Daily Sales Report",
    },
    {
  name: "KotRegister",
  icon: ClipboardList,
  permissionName: "Daily Sales Report",
},
  ];
  // 🔥 MASTER DROPDOWN
  const masterItems = [
    {
      name: "Company Master",
      icon: Building2,
      permissionName: "Company Definition",
    },
    {
      name: "Tax Master",
      icon: Receipt,
      permissionName: "Tax",
    },
    {
      name: "Tax Description Master",
      icon: Receipt,
      permissionName: "Tax",
    },
    {
      name: "Department Master",
      icon: Boxes,
      permissionName: "Department",
    },
    {
      name: "Outlet Master",
      icon: Store,
      permissionName: "Outlet",
    },
    {
      name: "Item Master",
      icon: Package,
      permissionName: "Item",
    },
    {
      name: "Unit Master",
      icon: Package,
      permissionName: "Unit",
    },
    {
      name: "Group Master",
      icon: Package,
      permissionName: "Group Master",
    },
    {
      name: "Category Master",
      icon: Package,
      permissionName: "Category",
    },
    {
      name: "Sub Category Master",
      icon: Package,
      permissionName: "Sub Category",
    },
    {
      name: "Steward Master",
      icon: UserCog,
      permissionName: "Steward Definition",
    },
    {
      name: "NC Department Master",
      icon: ShieldCheck,
      permissionName: "NC Department",
    },
    {
      name: "Printing Master",
      icon: Printer,
      permissionName: "Printing Department",
    },
    {
      name: "Table Master",
      icon: LayoutGrid,
      permissionName: "Table Definition",
    },
    {
      name: "Property Master",
      icon: Building2,
      permissionName: "Property Master",
    },
    {
      name: "Branch Master",
      icon: Store,
      permissionName: "Branch Master",
    },
    {
      name: "User Master",
      icon: UserCog,
      permissionName: "User Master",
    },
    {
      name: "User Rights Master",
      icon: ShieldCheck,
      permissionName:"User Rights Master",
    },
    
  ];
  // 🔥 SUB MASTER DROPDOWN
  const subMasterItems = [
    {
      name: "Outlet Items Details",
      icon: Package,
      permissionName: "Outlet Items",
    },
  ];

  // 🔥 Navigation map
  const routeMap: Record<string, string> = {
    KotRegister: "/pos/kotregister",
    "Touch Screen": "/NewOrder",
    DailySales: "/pos/dailysales",
    ItemSales: "/pos/itemsales",
    ChanceSheet: "/pos/chancesheet",
    VoidKot: "/pos/voidkot",
    Nckot: "/pos/nckot",
    BillReprint: "/pos/billreprint",
    "Company Master": "/master/company",
    "Tax Master": "/master/tax",
    "Tax Description Master": "/master/taxdescrip",
    "Department Master": "/master/departmentmaster",
    "Outlet Master": "/master/outletmaster",
    "Outlet Items Details": "/submaster/outletitemsdetails",
    "Item Master": "/master/itemmaster",
    "Unit Master": "/master/unitmaster",
    "Group Master": "/master/groupmaster",
    "Category Master": "/master/categorymaster",
    "Sub Category Master": "/master/subcategorymaster",
    "Steward Master": "/master/stewardmaster",
    "NC Department Master": "/master/ncdepartmentmaster",
    "Printing Master": "/master/printingmaster",
    "Table Master": "/master/tablemaster",
    "Property Master": "/master/propertymaster",
    "Branch Master": "/master/branchmaster",
    "User Master": "/master/usermaster",
    "User Rights Master": "/master/userrightsmaster",
    KotCancellation: "/pos/kotcancellation",
    BillCancellation: "/pos/billcancellation",
    DailysaleCategorywise: "/pos/dailysalecategorywise",
  };

  const handleNavigation = (name: string) => {
    if (name === "Day Close") {
      setShowDayPopup(true);
      setActiveMenu(null);
      return;
    }

    if (routeMap[name]) {
      navigate(routeMap[name]);
    }

    setActiveMenu(null);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const toggleMenu = (menu: string) => {
    setActiveMenu((prev) => (prev === menu ? null : menu));
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setActiveMenu(null);
      }
    };

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="w-full bg-gray-100 border-b shadow-sm">
      {/* Top Title */}
      <div className="px-4 sm:px-6 py-2 bg-gray-200 text-xs sm:text-sm font-semibold text-gray-800 border-b">
        POINT OF SALE : COGWAVE SOFTWARE TECHNOLOGIES BANGALORE INDIA
      </div>

      {/* Main Menu */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-2 bg-gray-100 text-sm font-medium text-gray-800">
        {/* LEFT */}
        <div className="flex items-center gap-4">
          {/* Mobile Toggle */}
          <button
            className="sm:hidden"
            onClick={(e) => {
              e.stopPropagation();
              setMobileOpen(!mobileOpen);
            }}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Desktop Menu */}
          <div className="hidden sm:flex items-center gap-6">
            {/* MASTER DROPDOWN */}
            {hasMainMenuAccess("Master") && (
              <div className="relative">
                <button
                  onClick={() => toggleMenu("MASTER")}
                  className="flex items-center gap-2 hover:text-blue-600"
                >
                  <Settings size={16} className="text-blue-600" />
                  Master
                  <ChevronDown size={14} />
                </button>

                {activeMenu === "MASTER" && (
                  <div className="absolute left-0 mt-2 w-52 bg-white border rounded shadow-md z-50 max-h-96 overflow-y-auto">
                    {masterItems
                      .filter((item) => hasSubMenuAccess(item.permissionName))
                      .map((item, index) => {
                        const Icon = item.icon;

                        return (
                          <div
                            key={index}
                            onClick={() => handleNavigation(item.name)}
                            className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50 cursor-pointer"
                          >
                            <Icon size={16} />
                            {item.name}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}
            {/* SUB MASTER DROPDOWN */}
            {hasMainMenuAccess("Sub Master") && (
              <div className="relative">
                <button
                  onClick={() => toggleMenu("SUB_MASTER")}
                  className="flex items-center gap-2 hover:text-purple-600"
                >
                  <Database size={16} className="text-purple-600" />
                  Sub Master
                  <ChevronDown size={14} />
                </button>

                {activeMenu === "SUB_MASTER" && (
                  <div className="absolute left-0 mt-2 w-56 bg-white border rounded shadow-md z-50">
                    {subMasterItems
                      .filter((item) => hasSubMenuAccess(item.permissionName))
                      .map((item, index) => {
                        const Icon = item.icon;

                        return (
                          <div
                            key={index}
                            onClick={() => handleNavigation(item.name)}
                            className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50 cursor-pointer"
                          >
                            <Icon size={16} />
                            {item.name}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}
            {/* <button className="flex items-center gap-2 hover:text-green-600">
              <Boxes size={16} className="text-green-600" />
              Inventory
            </button> */}

            {/* POS Dropdown */}
            {hasMainMenuAccess("POS") && (
              <div className="relative">
                <button
                  onClick={() => toggleMenu("POS")}
                  className="flex items-center gap-2 hover:text-orange-600"
                >
                  <LayoutGrid size={16} className="text-orange-600" />
                  POS
                  <ChevronDown size={14} />
                </button>

                {activeMenu === "POS" && (
                  <div className="absolute left-0 mt-2 w-52 bg-white border rounded shadow-md z-50 max-h-96 overflow-y-auto">
                    {posDropdownItems
                      .filter((item) => hasSubMenuAccess(item.permissionName))
                      .map((item, index) => {
                        const Icon = item.icon;

                        return (
                          <div
                            key={index}
                            onClick={() => handleNavigation(item.name)}
                            className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50 cursor-pointer"
                          >
                            <Icon size={16} />
                            {item.name}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}

            {/* POS REPORTS DROPDOWN */}
            {hasMainMenuAccess("POS Reports") && (
              <div className="relative">
                <button
                  onClick={() => toggleMenu("POS_REPORTS")}
                  className="flex items-center gap-2 hover:text-red-600"
                >
                  <FileBarChart size={16} className="text-red-600" />
                  POS Reports
                  <ChevronDown size={14} />
                </button>

                {activeMenu === "POS_REPORTS" && (
                  <div className="absolute left-0 mt-2 w-52 bg-white border rounded shadow-md z-50 max-h-96 overflow-y-auto">
                    {posReportItems
                      .filter((item) => hasSubMenuAccess(item.permissionName))
                      .map((item, index) => {
                        const Icon = item.icon;

                        return (
                          <div
                            key={index}
                            onClick={() => handleNavigation(item.name)}
                            className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50 cursor-pointer"
                          >
                            <Icon size={16} />
                            {item.name}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}
            {/* 
            <button className="flex items-center gap-2 hover:text-indigo-600">
              <FileBarChart size={16} className="text-indigo-600" />
              Inventory Reports
            </button>

            <button className="flex items-center gap-2 hover:text-teal-600">
              <Wrench size={16} className="text-teal-600" />
              Utility
            </button> */}
          </div>
        </div>

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-1.5 bg-red-500 text-white rounded hover:bg-red-600"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="sm:hidden flex flex-col gap-3 px-4 py-3 bg-white border-t shadow-md text-sm">
          {/* MASTER MOBILE */}
          {hasMainMenuAccess("Master") && (
            <div>
              <button
                onClick={() => toggleMenu("MASTER")}
                className="flex justify-between w-full"
              >
                Master <ChevronDown size={16} />
              </button>

              {activeMenu === "MASTER" && (
                <div className="ml-4 mt-2 flex flex-col gap-2">
                  {masterItems
                    .filter((item) => hasSubMenuAccess(item.permissionName))
                    .map((item, i) => {
                      const Icon = item.icon;

                      return (
                        <button
                          key={i}
                          onClick={() => handleNavigation(item.name)}
                          className="flex items-center gap-2"
                        >
                          <Icon size={16} />
                          {item.name}
                        </button>
                      );
                    })}
                </div>
              )}
            </div>
          )}
          {/* SUB MASTER */}
          {hasMainMenuAccess("Sub Master") && (
            <div>
              <button
                onClick={() => toggleMenu("SUB_MASTER")}
                className="flex justify-between w-full"
              >
                Sub Master <ChevronDown size={16} />
              </button>

              {activeMenu === "SUB_MASTER" && (
                <div className="ml-4 mt-2 flex flex-col gap-2">
                  {subMasterItems
                    .filter((item) => hasSubMenuAccess(item.permissionName))
                    .map((item, i) => {
                      const Icon = item.icon;

                      return (
                        <button
                          key={i}
                          onClick={() => handleNavigation(item.name)}
                          className="flex items-center gap-2"
                        >
                          <Icon size={16} />
                          {item.name}
                        </button>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* <button className="flex items-center gap-2">
            <Boxes size={16} /> Inventory
          </button> */}

          {/* POS */}
          {hasMainMenuAccess("POS") && (
            <div>
              <button
                onClick={() => toggleMenu("POS")}
                className="flex justify-between w-full"
              >
                POS <ChevronDown size={16} />
              </button>

              {activeMenu === "POS" && (
                <div className="ml-4 mt-2 flex flex-col gap-2">
                  {posDropdownItems
                    .filter((item) => hasSubMenuAccess(item.permissionName))
                    .map((item, i) => {
                      const Icon = item.icon;

                      return (
                        <button
                          key={i}
                          onClick={() => handleNavigation(item.name)}
                          className="flex items-center gap-2"
                        >
                          <Icon size={16} />
                          {item.name}
                        </button>
                      );
                    })}
                </div>
              )}
            </div>
          )}
          {/* POS REPORTS */}
          {hasMainMenuAccess("POS Reports") && (
            <div>
              <button
                onClick={() => toggleMenu("POS_REPORTS")}
                className="flex justify-between w-full"
              >
                POS Reports <ChevronDown size={16} />
              </button>

              {activeMenu === "POS_REPORTS" && (
                <div className="ml-4 mt-2 flex flex-col gap-2">
                  {posReportItems
                    .filter((item) => hasSubMenuAccess(item.permissionName))
                    .map((item, i) => {
                      const Icon = item.icon;

                      return (
                        <button
                          key={i}
                          onClick={() => handleNavigation(item.name)}
                          className="flex items-center gap-2"
                        >
                          <Icon size={16} />
                          {item.name}
                        </button>
                      );
                    })}
                </div>
              )}
            </div>
          )}
          {/* 
          <button>Inventory Reports</button>
          <button>Utility</button> */}
        </div>
      )}
      <DayEntryPopup
        isOpen={showDayPopup}
        onClose={() => setShowDayPopup(false)}
      />
    </div>
  );
};

export default DashboardHeader;
