import { useEffect, useState } from "react";
import Header from "../components/Header";
import Loader from "../components/Loader";
import toast from "react-hot-toast";

import { useAppContext } from "../context/AppContext";

import {
  getUserPermissionAccessList,
  insertUserPermissionAccessMaster,
  getUserDetailsList,
} from "../api/services/products.service";
import { useNavigate } from "react-router-dom";
export default function UserRightsMaster() {
  const { appData } = useAppContext();
const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [menuData, setMenuData] = useState<any>(null);

  const [users, setUsers] = useState<any[]>([]);

  const [selectedUser, setSelectedUser] = useState<any>(null);

  /* =========================
      FETCH USERS
  ========================= */

const fetchUsers = async () => {
  try {
    setLoading(true);

    const res = await getUserDetailsList(
      appData?.user?.branch_code,
    );

    if (res?.success) {
      setUsers(res.data || []);
    }
  } catch (err: any) {
    console.error(err);

    toast.error(
      err?.data?.message ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to fetch users ❌",
    );
  } finally {
    setLoading(false);
  }
};
  useEffect(() => {
    fetchUsers();
  }, []);

  /* =========================
      FETCH USER RIGHTS
  ========================= */

  // const fetchUserRights = async (userCode: number) => {
  //   try {
  //     setLoading(true);

  //     const res = await getUserPermissionAccessList(
  //       appData?.user?.branch_code,
  //       userCode,
  //     );

  //     if (res?.success) {
  //       setMenuData(res.data);
  //     } else {
  //       toast.error(res?.message || "Failed to fetch ❌");
  //     }
  //   } catch (err: any) {
  //     console.error(err);

  //     toast.error(
  //       err?.data?.message ||
  //         err?.response?.data?.message ||
  //         err?.message ||
  //         "Something went wrong ❌",
  //     );
  //   } finally {
  //     setLoading(false);
  //   }
  // };


  const fetchUserRights = async (userCode: number) => {
  try {
    setLoading(true);

    // FIND SELECTED USER
    const selected = users.find(
      (u) => Number(u.userCode) === Number(userCode)
    );

    if (!selected) {
      toast.error("User not found ❌");
      return;
    }

    const roleId = selected.roleId;

    console.log("Fetching Rights With:", {
      branchcode: appData?.user?.branch_code,
      userCode,
      roleId,
    });

    // SEND 3 PARAMS
    const res = await getUserPermissionAccessList(
      appData?.user?.branch_code,
      userCode,
      roleId
    );

    if (res?.success) {
      setMenuData(res.data);
    } else {
      toast.error(res?.message || "Failed to fetch ❌");
    }
  } catch (err: any) {
    console.error(err);

    toast.error(
      err?.data?.message ||
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong ❌",
    );
  } finally {
    setLoading(false);
  }
};

  /* =========================
      USER CHANGE
  ========================= */

  const handleUserChange = async (e: any) => {
    const userCode = Number(e.target.value);

    const user = users.find((u) => u.userCode === userCode);

    setSelectedUser(user);

    if (userCode) {
      fetchUserRights(userCode);
    }
  };

  /* =========================
      MENU TOGGLE
  ========================= */

  const handleMenuPermissionToggle = (mainMenuId: number) => {
    setMenuData((prev: any) => ({
      ...prev,

      menus: prev.menus.map((menu: any) => {
        if (menu.mainMenuId !== mainMenuId) return menu;

        const updatedPermission = !menu.menuPermission;

        return {
          ...menu,

          menuPermission: updatedPermission,

          subMenus: menu.subMenus.map((sub: any) => ({
            ...sub,

            isPermission: updatedPermission,
          })),
        };
      }),
    }));
  };

  /* =========================
      SUB MENU TOGGLE
  ========================= */

  const handleSubMenuToggle = (mainMenuId: number, subMenuId: number) => {
    setMenuData((prev: any) => ({
      ...prev,

      menus: prev.menus.map((menu: any) => {
        if (menu.mainMenuId !== mainMenuId) return menu;

        const updatedSubMenus = menu.subMenus.map((sub: any) =>
          sub.subMenuId === subMenuId
            ? {
                ...sub,

                isPermission: !sub.isPermission,
              }
            : sub,
        );

        const hasPermission = updatedSubMenus.some(
          (sub: any) => sub.isPermission,
        );

        return {
          ...menu,

          menuPermission: hasPermission,

          subMenus: updatedSubMenus,
        };
      }),
    }));
  };

  /* =========================
      SAVE
  ========================= */

  const handleSave = async () => {
    try {
      setLoading(true);

      const payload = menuData.menus.flatMap((menu: any) =>
        menu.subMenus.map((sub: any) => ({
          userCode: selectedUser?.userCode,

          userName: selectedUser?.userName,

          roleId: selectedUser?.roleId,

          roleName: menuData.roleName,

          mainMenuId: menu.mainMenuId,

          menuName: menu.menuName,

          menuPermission: menu.menuPermission,

          subMenuId: sub.subMenuId,

          subMenuName: sub.subMenuName,

          isPermission: sub.isPermission,

          branchCode: menuData.branchCode,
        })),
      );

      const res = await insertUserPermissionAccessMaster(payload);

      if (res?.success) {
        toast.success("User Rights Saved Successfully ✅");

        fetchUserRights(selectedUser?.userCode);
      } else {
        toast.error(res?.message || "Save failed ❌");
      }
    } catch (err: any) {
      console.error(err);

      toast.error(
        err?.data?.message ||
          err?.response?.data?.message ||
          err?.message ||
          "Something went wrong ❌",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header showNeworderButton={false} />

      <div className="h-[calc(100vh-100px)] overflow-y-auto bg-gray-50 p-4 md:p-6 pb-24">
        {loading && <Loader />}

        {/* HEADER */}

        <div className="bg-white rounded-xl shadow p-4 md:p-6 mb-6">

  {/* HEADER TOP */}
  <div className="flex items-center justify-between mb-5">
    
    <h2 className="text-xl font-semibold">
      User Rights Master
    </h2>

    {/* ADD MENU BUTTON */}
  <button
  type="button"
  onClick={() =>
    navigate("/user-menu-submenu-creation")
  }
  className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg"
>
  Add Menu / Submenu
</button>

  </div>
          {/* USER DROPDOWN */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Select User
              </label>

              <select
                value={selectedUser?.userCode || ""}
                onChange={handleUserChange}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">Select User</option>

             {users
  .filter(
    (user) =>
      user.userName?.toLowerCase() !== ""
  )
  .map((user) => (
    <option
      key={user.userCode}
      value={user.userCode}
    >
      {user.userCode} - {user.userName}
    </option>
  ))}
              </select>
            </div>
          </div>
        </div>

        {/* RIGHTS */}

        {menuData && (
          <div className="bg-white rounded-xl shadow p-4 md:p-6">
            <div className="space-y-6">
              {menuData?.menus?.map((menu: any) => {
                return (
                  <div key={menu.mainMenuId} className="border rounded-xl">
                    {/* MENU */}

                    <div className="flex items-center justify-between px-4 py-4 bg-gray-100 rounded-t-xl">
                      <h3 className="font-semibold text-base">
                        {menu.menuName}
                      </h3>

                      {/* MENU TOGGLE */}

                      <button
                        type="button"
                        onClick={() =>
                          handleMenuPermissionToggle(menu.mainMenuId)
                        }
                        className={`relative inline-flex h-5 w-10 items-center rounded-full transition ${
                          menu.menuPermission ? "bg-green-500" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 transform rounded-full bg-white transition ${
                            menu.menuPermission
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>

                    {/* SUB MENUS */}

                    <div className="divide-y">
                      {menu.subMenus.map((sub: any) => (
                        <div
                          key={sub.subMenuId}
                          className="flex items-center justify-between px-4 py-3"
                        >
                          <span className="text-sm">{sub.subMenuName}</span>

                          {/* SUB MENU TOGGLE */}

                          <button
                            type="button"
                            onClick={() =>
                              handleSubMenuToggle(
                                menu.mainMenuId,
                                sub.subMenuId,
                              )
                            }
                            className={`relative inline-flex h-5 w-10 items-center rounded-full transition ${
                              sub.isPermission ? "bg-green-500" : "bg-gray-300"
                            }`}
                          >
                            <span
                              className={`inline-block h-3 w-3 transform rounded-full bg-white transition ${
                                sub.isPermission
                                  ? "translate-x-6"
                                  : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SAVE BUTTON */}

     

      <div className="flex justify-end mt-6">
              <button
                onClick={handleSave}
                disabled={!selectedUser}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg"
              >
                Save Rights
              </button>
            </div>
      </div>
    </>
  );
}
