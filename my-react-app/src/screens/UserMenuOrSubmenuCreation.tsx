// // import { useEffect, useState } from "react";
// // import Header from "../components/Header";
// // import Loader from "../components/Loader";
// // import toast from "react-hot-toast";

// // import { useAppContext } from "../context/AppContext";

// // import {
// //   getMainMenuList,
// //   saveMenuWithSubMenu,
// // } from "../api/services/products.service";
// // import { useNavigate } from "react-router-dom";

// // export default function UserMenuOrSubmenuCreation() {
// //   const { appData } = useAppContext();
// // const navigate = useNavigate();
// //   const [loading, setLoading] = useState(false);

// //   const [mainMenus, setMainMenus] = useState<any[]>([]);

// //   const [formData, setFormData] = useState({
// //     mainMenuId: 0,
// //     menuName: "",
// //     menuPermission: true,
// //     subMenuId: 0,
// //     subMenuName: "",
// //     subMenuPermission: true,
// //     isExistingMainMenu: true,
// //   });

// //   /* =========================
// //       FETCH MAIN MENUS
// //   ========================= */

// //   const fetchMainMenus = async () => {
// //     try {
// //       setLoading(true);

// //       const res = await getMainMenuList(
// //         appData?.user?.branch_code
// //       );

// //       if (res?.success) {
// //         setMainMenus(res.data || []);
// //       }
// //     } catch (err: any) {
// //       console.error(err);

// //       toast.error(
// //         err?.response?.data?.message ||
// //           err?.message ||
// //           "Failed to fetch menus ❌"
// //       );
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     fetchMainMenus();
// //   }, []);

// //   /* =========================
// //       SAVE
// //   ========================= */

// //   const handleSave = async () => {
// //     try {
// //       setLoading(true);

// //       const payload = {
// //         mainMenuId: formData.mainMenuId,
// //         menuName: formData.menuName,
// //         menuPermission: formData.menuPermission,
// //         subMenuId: 0,
// //         subMenuName: formData.subMenuName,
// //         subMenuPermission:
// //           formData.subMenuPermission,
// //         branchCode: appData?.user?.branch_code,
// //         isExistingMainMenu:
// //           formData.isExistingMainMenu,
// //       };

// //       const res = await saveMenuWithSubMenu(
// //         payload
// //       );

// //       if (res?.success) {
// //         toast.success(
// //           "Menu/Submenu Created Successfully ✅"
// //         );

// //         setFormData({
// //           mainMenuId: 0,
// //           menuName: "",
// //           menuPermission: true,
// //           subMenuId: 0,
// //           subMenuName: "",
// //           subMenuPermission: true,
// //           isExistingMainMenu: true,
// //         });

// //         fetchMainMenus();
// //       } else {
// //         toast.error(
// //           res?.message || "Save failed ❌"
// //         );
// //       }
// //     } catch (err: any) {
// //       console.error(err);

// //       toast.error(
// //         err?.response?.data?.message ||
// //           err?.message ||
// //           "Something went wrong ❌"
// //       );
// //     } finally {
// //       setLoading(false);
// //     }
// //   };
// // return (
// //   <>
// //     <Header showNeworderButton={false} />

// //     <div className="h-[calc(100vh-100px)] overflow-y-auto p-4 md:p-6 space-y-6 bg-gray-50">

// //       {loading && <Loader />}

// //       {/* ================= FORM ================= */}

// //       <div className="bg-white rounded-xl shadow p-4 md:p-6">

// //         <h2 className="text-lg font-semibold mb-4">
// //           User Menu / Submenu Creation
// //         </h2>

// //         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

// //           {/* EXISTING MENU */}

// //           <div className="flex flex-col">
// //             <label className="text-sm text-gray-600 mb-1">
// //               Existing Menu
// //             </label>

// //             <select
// //               value={String(
// //                 formData.isExistingMainMenu
// //               )}
// //               onChange={(e) =>
// //                 setFormData({
// //                   ...formData,
// //                   isExistingMainMenu:
// //                     e.target.value === "true",
// //                 })
// //               }
// //               className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
// //             >
// //               <option value="true">
// //                 Yes
// //               </option>

// //               <option value="false">
// //                 No
// //               </option>
// //             </select>
// //           </div>

// //           {/* MENU */}

// //           {formData.isExistingMainMenu ? (
// //             <div className="flex flex-col">
// //               <label className="text-sm text-gray-600 mb-1">
// //                 Select Menu
// //               </label>

// //               <select
// //                 value={formData.mainMenuId}
// //                 onChange={(e) => {
// //                   const selected =
// //                     mainMenus.find(
// //                       (m) =>
// //                         m.mainMenuId ===
// //                         Number(e.target.value)
// //                     );

// //                   setFormData({
// //                     ...formData,
// //                     mainMenuId: Number(
// //                       e.target.value
// //                     ),
// //                     menuName:
// //                       selected?.menuName || "",
// //                   });
// //                 }}
// //                 className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
// //               >
// //                 <option value={0}>
// //                   Select Menu
// //                 </option>

// //                 {mainMenus.map((menu) => (
// //                   <option
// //                     key={menu.mainMenuId}
// //                     value={menu.mainMenuId}
// //                   >
// //                     {menu.menuName}
// //                   </option>
// //                 ))}
// //               </select>
// //             </div>
// //           ) : (
// //             <div className="flex flex-col">
// //               <label className="text-sm text-gray-600 mb-1">
// //                 Menu Name
// //               </label>

// //               <input
// //                 type="text"
// //                 value={formData.menuName}
// //                 onChange={(e) =>
// //                   setFormData({
// //                     ...formData,
// //                     menuName:
// //                       e.target.value,
// //                   })
// //                 }
// //                 className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
// //                 placeholder="Enter Menu Name"
// //               />
// //             </div>
// //           )}

// //           {/* SUB MENU */}

// //           <div className="flex flex-col">
// //             <label className="text-sm text-gray-600 mb-1">
// //               Submenu Name
// //             </label>

// //             <input
// //               type="text"
// //               value={formData.subMenuName}
// //               onChange={(e) =>
// //                 setFormData({
// //                   ...formData,
// //                   subMenuName:
// //                     e.target.value,
// //                 })
// //               }
// //               className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
// //               placeholder="Enter Submenu Name"
// //             />
// //           </div>

// //           {/* MENU PERMISSION */}

// //           <div className="flex flex-col">
// //             <label className="text-sm text-gray-600 mb-1">
// //               Menu Permission
// //             </label>

// //             <select
// //               value={String(
// //                 formData.menuPermission
// //               )}
// //               onChange={(e) =>
// //                 setFormData({
// //                   ...formData,
// //                   menuPermission:
// //                     e.target.value === "true",
// //                 })
// //               }
// //               className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
// //             >
// //               <option value="true">
// //                 True
// //               </option>

// //               <option value="false">
// //                 False
// //               </option>
// //             </select>
// //           </div>

// //           {/* SUBMENU PERMISSION */}

// //           <div className="flex flex-col">
// //             <label className="text-sm text-gray-600 mb-1">
// //               Submenu Permission
// //             </label>

// //             <select
// //               value={String(
// //                 formData.subMenuPermission
// //               )}
// //               onChange={(e) =>
// //                 setFormData({
// //                   ...formData,
// //                   subMenuPermission:
// //                     e.target.value === "true",
// //                 })
// //               }
// //               className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
// //             >
// //               <option value="true">
// //                 True
// //               </option>

// //               <option value="false">
// //                 False
// //               </option>
// //             </select>
// //           </div>

// //         </div>

// //         {/* BUTTONS */}

// //       <div className="flex justify-end gap-3 mt-6">

// //   {/* BACK */}

// //   <button
// //     onClick={() => navigate(-1)}
// //     className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
// //   >
// //     Back
// //   </button>

// //   {/* CLEAR */}

// //   <button
// //     onClick={() => {
// //       setFormData({
// //         mainMenuId: 0,
// //         menuName: "",
// //         menuPermission: true,
// //         subMenuId: 0,
// //         subMenuName: "",
// //         subMenuPermission: true,
// //         isExistingMainMenu: true,
// //       });
// //     }}
// //     className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
// //   >
// //     Clear
// //   </button>

// //   {/* SAVE */}

// //   <button
// //     onClick={handleSave}
// //     className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
// //   >
// //     Save
// //   </button>

// // </div>
// //       </div>
// //     </div>
// //   </>
// // );
// // }

// import { useEffect, useState } from "react";
// import Header from "../components/Header";
// import Loader from "../components/Loader";
// import toast from "react-hot-toast";

// import { useAppContext } from "../context/AppContext";

// import {
//   getMainMenuList,
//   saveMenuWithSubMenu,
//   deleteMainMenuDetail,
//   deleteSubMenuDetail,
// } from "../api/services/products.service";

// import { useNavigate } from "react-router-dom";

// export default function UserMenuOrSubmenuCreation() {

//   const { appData, userRights } =
//     useAppContext();

//   const navigate = useNavigate();

//   const [loading, setLoading] =
//     useState(false);

//   const [mainMenus, setMainMenus] =
//     useState<any[]>([]);

//   const [menuList, setMenuList] =
//     useState<any[]>([]);

//   const [formData, setFormData] =
//     useState({
//       mainMenuId: 0,
//       menuName: "",
//       menuPermission: true,
//       subMenuId: 0,
//       subMenuName: "",
//       subMenuPermission: true,
//       isExistingMainMenu: true,
//     });

//   /* =========================
//       FETCH MAIN MENUS
//   ========================= */

//   const fetchMainMenus = async () => {
//     try {
//       setLoading(true);

//       const res = await getMainMenuList(
//         appData?.user?.branch_code
//       );

//       if (res?.success) {
//         setMainMenus(res.data || []);
//       }
//     } catch (err: any) {
//       console.error(err);

//       toast.error(
//         err?.response?.data?.message ||
//           err?.message ||
//           "Failed to fetch menus ❌"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* =========================
//       LOAD MENU LIST
//   ========================= */

//   const loadMenuList = () => {
//     setMenuList(userRights || []);
//   };

//   useEffect(() => {
//     fetchMainMenus();
//   }, []);

//   useEffect(() => {
//     loadMenuList();
//   }, [userRights]);

//   /* =========================
//       SAVE
//   ========================= */

//   const handleSave = async () => {
//     try {
//       setLoading(true);

//       const payload = {
//         mainMenuId: formData.mainMenuId,
//         menuName: formData.menuName,
//         menuPermission:
//           formData.menuPermission,
//         subMenuId: 0,
//         subMenuName:
//           formData.subMenuName,
//         subMenuPermission:
//           formData.subMenuPermission,
//         branchCode:
//           appData?.user?.branch_code,
//         isExistingMainMenu:
//           formData.isExistingMainMenu,
//       };

//       const res =
//         await saveMenuWithSubMenu(
//           payload
//         );

//       if (res?.success) {
//         toast.success(
//           "Menu/Submenu Created Successfully ✅"
//         );

//         setFormData({
//           mainMenuId: 0,
//           menuName: "",
//           menuPermission: true,
//           subMenuId: 0,
//           subMenuName: "",
//           subMenuPermission: true,
//           isExistingMainMenu: true,
//         });

//         fetchMainMenus();
//       } else {
//         toast.error(
//           res?.message ||
//             "Save failed ❌"
//         );
//       }
//     } catch (err: any) {
//       console.error(err);

//       toast.error(
//         err?.response?.data?.message ||
//           err?.message ||
//           "Something went wrong ❌"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* =========================
//       DELETE MAIN MENU
//   ========================= */

//   const handleDeleteMainMenu =
//     async (mainMenuId: number) => {
//       try {
//         const confirmDelete =
//           window.confirm(
//             "Delete this main menu?"
//           );

//         if (!confirmDelete) return;

//         setLoading(true);

//         const res =
//           await deleteMainMenuDetail(
//             mainMenuId,
//             appData?.user?.branch_code
//           );

//         if (res?.success) {
//           toast.success(
//             "Main Menu Deleted ✅"
//           );

//           window.location.reload();
//         } else {
//           toast.error(
//             res?.message ||
//               "Delete failed ❌"
//           );
//         }
//       } catch (err: any) {
//         toast.error(
//           err?.response?.data?.message ||
//             err?.message ||
//             "Delete failed ❌"
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//   /* =========================
//       DELETE SUBMENU
//   ========================= */

//   const handleDeleteSubMenu =
//     async (subMenuId: number) => {
//       try {
//         const confirmDelete =
//           window.confirm(
//             "Delete this submenu?"
//           );

//         if (!confirmDelete) return;

//         setLoading(true);

//         const res =
//           await deleteSubMenuDetail(
//             subMenuId,
//             appData?.user?.branch_code
//           );

//         if (res?.success) {
//           toast.success(
//             "Submenu Deleted ✅"
//           );

//           window.location.reload();
//         } else {
//           toast.error(
//             res?.message ||
//               "Delete failed ❌"
//           );
//         }
//       } catch (err: any) {
//         toast.error(
//           err?.response?.data?.message ||
//             err?.message ||
//             "Delete failed ❌"
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//   return (
//     <>
//       <Header
//         showNeworderButton={false}
//       />

//       <div className="h-[calc(100vh-100px)] overflow-y-auto p-4 md:p-6 space-y-6 bg-gray-50">

//         {loading && <Loader />}

//         {/* ================= FORM ================= */}

//         <div className="bg-white rounded-xl shadow p-4 md:p-6">

//           <h2 className="text-lg font-semibold mb-4">
//             User Menu / Submenu Creation
//           </h2>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

//             {/* EXISTING MENU */}

//             <div className="flex flex-col">
//               <label className="text-sm text-gray-600 mb-1">
//                 Existing Menu
//               </label>

//               <select
//                 value={String(
//                   formData.isExistingMainMenu
//                 )}
//                 onChange={(e) =>
//                   setFormData({
//                     ...formData,
//                     isExistingMainMenu:
//                       e.target.value ===
//                       "true",
//                   })
//                 }
//                 className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
//               >
//                 <option value="true">
//                   Yes
//                 </option>

//                 <option value="false">
//                   No
//                 </option>
//               </select>
//             </div>

//             {/* MENU */}

//             {formData.isExistingMainMenu ? (
//               <div className="flex flex-col">
//                 <label className="text-sm text-gray-600 mb-1">
//                   Select Menu
//                 </label>

//                 <select
//                   value={
//                     formData.mainMenuId
//                   }
//                   onChange={(e) => {
//                     const selected =
//                       mainMenus.find(
//                         (m) =>
//                           m.mainMenuId ===
//                           Number(
//                             e.target.value
//                           )
//                       );

//                     setFormData({
//                       ...formData,
//                       mainMenuId:
//                         Number(
//                           e.target.value
//                         ),
//                       menuName:
//                         selected?.menuName ||
//                         "",
//                     });
//                   }}
//                   className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
//                 >
//                   <option value={0}>
//                     Select Menu
//                   </option>

//                   {mainMenus.map(
//                     (menu) => (
//                       <option
//                         key={
//                           menu.mainMenuId
//                         }
//                         value={
//                           menu.mainMenuId
//                         }
//                       >
//                         {menu.menuName}
//                       </option>
//                     )
//                   )}
//                 </select>
//               </div>
//             ) : (
//               <div className="flex flex-col">
//                 <label className="text-sm text-gray-600 mb-1">
//                   Menu Name
//                 </label>

//                 <input
//                   type="text"
//                   value={
//                     formData.menuName
//                   }
//                   onChange={(e) =>
//                     setFormData({
//                       ...formData,
//                       menuName:
//                         e.target.value,
//                     })
//                   }
//                   className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
//                   placeholder="Enter Menu Name"
//                 />
//               </div>
//             )}

//             {/* SUB MENU */}

//             <div className="flex flex-col">
//               <label className="text-sm text-gray-600 mb-1">
//                 Submenu Name
//               </label>

//               <input
//                 type="text"
//                 value={
//                   formData.subMenuName
//                 }
//                 onChange={(e) =>
//                   setFormData({
//                     ...formData,
//                     subMenuName:
//                       e.target.value,
//                   })
//                 }
//                 className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
//                 placeholder="Enter Submenu Name"
//               />
//             </div>

//             {/* MENU PERMISSION */}

//             <div className="flex flex-col">
//               <label className="text-sm text-gray-600 mb-1">
//                 Menu Permission
//               </label>

//               <select
//                 value={String(
//                   formData.menuPermission
//                 )}
//                 onChange={(e) =>
//                   setFormData({
//                     ...formData,
//                     menuPermission:
//                       e.target.value ===
//                       "true",
//                   })
//                 }
//                 className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
//               >
//                 <option value="true">
//                   True
//                 </option>

//                 <option value="false">
//                   False
//                 </option>
//               </select>
//             </div>

//             {/* SUBMENU PERMISSION */}

//             <div className="flex flex-col">
//               <label className="text-sm text-gray-600 mb-1">
//                 Submenu Permission
//               </label>

//               <select
//                 value={String(
//                   formData.subMenuPermission
//                 )}
//                 onChange={(e) =>
//                   setFormData({
//                     ...formData,
//                     subMenuPermission:
//                       e.target.value ===
//                       "true",
//                   })
//                 }
//                 className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
//               >
//                 <option value="true">
//                   True
//                 </option>

//                 <option value="false">
//                   False
//                 </option>
//               </select>
//             </div>

//           </div>

//           {/* BUTTONS */}

//           <div className="flex justify-end gap-3 mt-6">

//             <button
//               onClick={() =>
//                 navigate(-1)
//               }
//               className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
//             >
//               Back
//             </button>

//             <button
//               onClick={() => {
//                 setFormData({
//                   mainMenuId: 0,
//                   menuName: "",
//                   menuPermission: true,
//                   subMenuId: 0,
//                   subMenuName: "",
//                   subMenuPermission: true,
//                   isExistingMainMenu: true,
//                 });
//               }}
//               className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
//             >
//               Clear
//             </button>

//             <button
//               onClick={handleSave}
//               className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
//             >
//               Save
//             </button>

//           </div>
//         </div>

//         {/* ================= MENU LIST ================= */}

//         <div className="bg-white rounded-xl shadow p-4 md:p-6">

//           <h2 className="text-lg font-semibold mb-4">
//             Menu & Submenu List
//           </h2>

//           <div className="space-y-5">

//             {menuList.map(
//               (menu: any) => (
//                 <div
//                   key={
//                     menu.mainMenuId
//                   }
//                   className="border rounded-xl overflow-hidden"
//                 >

//                   {/* MAIN MENU */}

//                   <div className="flex items-center justify-between bg-gray-100 px-4 py-3">

//                     <div>
//                       <h3 className="font-semibold text-base">
//                         {menu.menuName}
//                       </h3>

//                       <p className="text-xs text-gray-500">
//                         Menu ID :
//                         {" "}
//                         {
//                           menu.mainMenuId
//                         }
//                       </p>
//                     </div>

//                     <button
//                       onClick={() =>
//                         handleDeleteMainMenu(
//                           menu.mainMenuId
//                         )
//                       }
//                       className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm"
//                     >
//                       Delete Menu
//                     </button>
//                   </div>

//                   {/* SUBMENUS */}

//                   <div className="divide-y">

//                     {menu.subMenus?.map(
//                       (sub: any) => (
//                         <div
//                           key={
//                             sub.subMenuId
//                           }
//                           className="flex items-center justify-between px-4 py-3"
//                         >

//                           <div>
//                             <p className="text-sm font-medium">
//                               {
//                                 sub.subMenuName
//                               }
//                             </p>

//                             <p className="text-xs text-gray-500">
//                               Submenu ID :
//                               {" "}
//                               {
//                                 sub.subMenuId
//                               }
//                             </p>
//                           </div>

//                           <button
//                             onClick={() =>
//                               handleDeleteSubMenu(
//                                 sub.subMenuId
//                               )
//                             }
//                             className="bg-red-400 hover:bg-red-500 text-white px-3 py-1 rounded-lg text-sm"
//                           >
//                             Delete Submenu
//                           </button>

//                         </div>
//                       )
//                     )}

//                   </div>
//                 </div>
//               )
//             )}

//           </div>
//         </div>

//       </div>
//     </>
//   );
// }



import { useEffect, useState } from "react";
import Header from "../components/Header";
import Loader from "../components/Loader";
import toast from "react-hot-toast";

import { useAppContext } from "../context/AppContext";

import {
  getMainMenuList,
  saveMenuWithSubMenu,
  deleteMainMenuDetail,
  deleteSubMenuDetail,
  getUserPermissionAccessList,
} from "../api/services/products.service";

import { useNavigate } from "react-router-dom";

export default function UserMenuOrSubmenuCreation() {

  const { appData } = useAppContext();

  const navigate = useNavigate();

  const [loading, setLoading] =
    useState(false);

  const [mainMenus, setMainMenus] =
    useState<any[]>([]);

  const [menuList, setMenuList] =
    useState<any[]>([]);

  const [formData, setFormData] =
    useState({
      mainMenuId: 0,
      menuName: "",
      menuPermission: true,
      subMenuId: 0,
      subMenuName: "",
      subMenuPermission: true,
      isExistingMainMenu: true,
    });

  /* =========================
      FETCH MAIN MENUS
  ========================= */

  const fetchMainMenus = async () => {
    try {

      setLoading(true);

      const res = await getMainMenuList(
        appData?.user?.branch_code
      );

      if (res?.success) {
        setMainMenus(res.data || []);
      }

    } catch (err: any) {

      console.error(err);

      toast.error(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to fetch menus ❌"
      );

    } finally {

      setLoading(false);

    }
  };

  /* =========================
      FETCH MENU LIST
  ========================= */

  const fetchMenuList = async () => {
    try {

      setLoading(true);

      const res =
        await getUserPermissionAccessList(
          appData?.user?.branch_code,
          1,
          1
        );

      if (res?.success) {

        setMenuList(
          res?.data?.menus || []
        );

      } else {

        toast.error(
          res?.message ||
          "Failed to fetch menu list ❌"
        );
      }

    } catch (err: any) {

      console.error(err);

      toast.error(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to fetch menu list ❌"
      );

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    fetchMainMenus();
    fetchMenuList();
  }, []);

  /* =========================
      SAVE
  ========================= */

  const handleSave = async () => {
    try {

      setLoading(true);

      const payload = {
        mainMenuId: formData.mainMenuId,
        menuName: formData.menuName,
        menuPermission:
          formData.menuPermission,
        subMenuId: 0,
        subMenuName:
          formData.subMenuName,
        subMenuPermission:
          formData.subMenuPermission,
        branchCode:
          appData?.user?.branch_code,
        isExistingMainMenu:
          formData.isExistingMainMenu,
      };

      const res =
        await saveMenuWithSubMenu(
          payload
        );

      if (res?.success) {

        toast.success(
          "Menu/Submenu Created Successfully ✅"
        );

        setFormData({
          mainMenuId: 0,
          menuName: "",
          menuPermission: true,
          subMenuId: 0,
          subMenuName: "",
          subMenuPermission: true,
          isExistingMainMenu: true,
        });

        fetchMainMenus();
        fetchMenuList();

      } else {

        toast.error(
          res?.message ||
          "Save failed ❌"
        );
      }

    } catch (err: any) {

      console.error(err);

      toast.error(
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong ❌"
      );

    } finally {

      setLoading(false);

    }
  };

  /* =========================
      DELETE MAIN MENU
  ========================= */

  const handleDeleteMainMenu =
    async (mainMenuId: number) => {

      try {

        const confirmDelete =
          window.confirm(
            "Delete this main menu?"
          );

        if (!confirmDelete) return;

        setLoading(true);

        const res =
          await deleteMainMenuDetail(
            mainMenuId,
            appData?.user?.branch_code
          );

        if (res?.success) {

          toast.success(
            "Main Menu Deleted ✅"
          );

          fetchMenuList();
          fetchMainMenus();

        } else {

          toast.error(
            res?.message ||
            "Delete failed ❌"
          );
        }

      } catch (err: any) {

        toast.error(
          err?.response?.data?.message ||
          err?.message ||
          "Delete failed ❌"
        );

      } finally {

        setLoading(false);

      }
    };

  /* =========================
      DELETE SUBMENU
  ========================= */

  const handleDeleteSubMenu =
    async (subMenuId: number) => {

      try {

        const confirmDelete =
          window.confirm(
            "Delete this submenu?"
          );

        if (!confirmDelete) return;

        setLoading(true);

        const res =
          await deleteSubMenuDetail(
            subMenuId,
            appData?.user?.branch_code
          );

        if (res?.success) {

          toast.success(
            "Submenu Deleted ✅"
          );

          fetchMenuList();

        } else {

          toast.error(
            res?.message ||
            "Delete failed ❌"
          );
        }

      } catch (err: any) {

        toast.error(
          err?.response?.data?.message ||
          err?.message ||
          "Delete failed ❌"
        );

      } finally {

        setLoading(false);

      }
    };

  return (
    <>
      <Header showNeworderButton={false} />

      <div className="h-[calc(100vh-100px)] overflow-y-auto p-4 md:p-6 space-y-6 bg-gray-50">

        {loading && <Loader />}

        {/* ================= FORM ================= */}

        <div className="bg-white rounded-xl shadow p-4 md:p-6">

          <h2 className="text-lg font-semibold mb-4">
            User Menu / Submenu Creation
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* EXISTING MENU */}

            <div className="flex flex-col">

              <label className="text-sm text-gray-600 mb-1">
                Existing Menu
              </label>

              <select
                value={String(
                  formData.isExistingMainMenu
                )}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    isExistingMainMenu:
                      e.target.value === "true",
                  })
                }
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="true">
                  Yes
                </option>

                <option value="false">
                  No
                </option>

              </select>

            </div>

            {/* MENU */}

            {formData.isExistingMainMenu ? (

              <div className="flex flex-col">

                <label className="text-sm text-gray-600 mb-1">
                  Select Menu
                </label>

                <select
                  value={formData.mainMenuId}
                  onChange={(e) => {

                    const selected =
                      mainMenus.find(
                        (m) =>
                          m.mainMenuId ===
                          Number(e.target.value)
                      );

                    setFormData({
                      ...formData,
                      mainMenuId: Number(
                        e.target.value
                      ),
                      menuName:
                        selected?.menuName || "",
                    });
                  }}
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                >

                  <option value={0}>
                    Select Menu
                  </option>

                  {mainMenus.map((menu) => (

                    <option
                      key={menu.mainMenuId}
                      value={menu.mainMenuId}
                    >
                      {menu.menuName}
                    </option>

                  ))}

                </select>

              </div>

            ) : (

              <div className="flex flex-col">

                <label className="text-sm text-gray-600 mb-1">
                  Menu Name
                </label>

                <input
                  type="text"
                  value={formData.menuName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      menuName:
                        e.target.value,
                    })
                  }
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Enter Menu Name"
                />

              </div>

            )}

            {/* SUB MENU */}

            <div className="flex flex-col">

              <label className="text-sm text-gray-600 mb-1">
                Submenu Name
              </label>

              <input
                type="text"
                value={formData.subMenuName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    subMenuName:
                      e.target.value,
                  })
                }
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter Submenu Name"
              />

            </div>

            {/* MENU PERMISSION */}

            <div className="flex flex-col">

              <label className="text-sm text-gray-600 mb-1">
                Menu Permission
              </label>

              <select
                value={String(
                  formData.menuPermission
                )}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    menuPermission:
                      e.target.value === "true",
                  })
                }
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >

                <option value="true">
                  True
                </option>

                <option value="false">
                  False
                </option>

              </select>

            </div>

            {/* SUBMENU PERMISSION */}

            <div className="flex flex-col">

              <label className="text-sm text-gray-600 mb-1">
                Submenu Permission
              </label>

              <select
                value={String(
                  formData.subMenuPermission
                )}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    subMenuPermission:
                      e.target.value === "true",
                  })
                }
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >

                <option value="true">
                  True
                </option>

                <option value="false">
                  False
                </option>

              </select>

            </div>

          </div>

          {/* BUTTONS */}

          <div className="flex justify-end gap-3 mt-6">

            <button
              onClick={() => navigate(-1)}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
            >
              Back
            </button>

            <button
              onClick={() => {
                setFormData({
                  mainMenuId: 0,
                  menuName: "",
                  menuPermission: true,
                  subMenuId: 0,
                  subMenuName: "",
                  subMenuPermission: true,
                  isExistingMainMenu: true,
                });
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
            >
              Clear
            </button>

            <button
              onClick={handleSave}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
            >
              Save
            </button>

          </div>
        </div>

        {/* ================= MENU LIST ================= */}

        <div className="bg-white rounded-xl shadow p-4 md:p-6">

          <h2 className="text-lg font-semibold mb-4">
            Menu & Submenu List
          </h2>

          <div className="space-y-5">

            {menuList.map((menu: any) => (

              <div
                key={menu.mainMenuId}
                className="border rounded-xl overflow-hidden"
              >

                {/* MAIN MENU */}

                <div className="flex items-center justify-between bg-gray-100 px-4 py-3">

                  <div>

                    <h3 className="font-semibold text-base">
                      {menu.menuName}
                    </h3>

                    <p className="text-xs text-gray-500">
                      Menu ID : {menu.mainMenuId}
                    </p>

                  </div>

                  <button
                    onClick={() =>
                      handleDeleteMainMenu(
                        menu.mainMenuId
                      )
                    }
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm"
                  >
                    Delete Menu
                  </button>

                </div>

                {/* SUB MENUS */}

                <div className="divide-y">

                  {menu.subMenus?.map(
                    (sub: any) => (

                      <div
                        key={sub.subMenuId}
                        className="flex items-center justify-between px-4 py-3"
                      >

                        <div>

                          <p className="text-sm font-medium">
                            {sub.subMenuName}
                          </p>

                          <p className="text-xs text-gray-500">
                            Submenu ID : {sub.subMenuId}
                          </p>

                        </div>

                        <button
                          onClick={() =>
                            handleDeleteSubMenu(
                              sub.subMenuId
                            )
                          }
                          className="bg-red-400 hover:bg-red-500 text-white px-3 py-1 rounded-lg text-sm"
                        >
                          Delete Submenu
                        </button>

                      </div>

                    )
                  )}

                </div>

              </div>

            ))}

          </div>
        </div>

      </div>
    </>
  );
}