import {
  ShieldAlert,
  LockKeyhole,
  Phone,
  Building2,
  LogOut,
} from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

const Expired = () => {
  const { clearAppData } = useAppContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    clearAppData();
    navigate("/", { replace: true });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-black px-4 py-3">
      {/* Animated Background */}
      {[...Array(10)].map((_, i) => (
        <span
          key={i}
          className="absolute h-2 w-2 rounded-full bg-red-500/20 animate-ping"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDuration: `${2 + Math.random() * 3}s`,
            animationDelay: `${Math.random() * 3}s`,
          }}
        />
      ))}

      {/* Glow */}
      <div className="absolute h-64 w-64 rounded-full bg-red-600/20 blur-[100px]" />

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-red-500/30 bg-white/10 p-5 text-center shadow-2xl backdrop-blur-xl">
        {/* Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-red-500/30 bg-red-500/20">
          <ShieldAlert size={42} className="text-red-400" />
        </div>

        {/* Badge */}
        <div className="mt-3 inline-flex rounded-full border border-red-500/40 bg-red-500/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-red-300">
          License Expired
        </div>

        {/* Title */}
        <h1 className="mt-4 text-2xl font-bold text-white">
          Access Restricted
        </h1>

        {/* Description */}
        <p className="mt-3 text-sm leading-6 text-gray-300">
          Your POS software license has expired.
          <br />
          Please contact your software vendor to renew your license.
        </p>

        {/* Support Card */}
        <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3">
          <h2 className="mb-3 text-base font-semibold text-white">
            Support Information
          </h2>

          <div className="space-y-3 text-left">
            <div className="flex items-center gap-3">
              <Building2 className="text-red-400" size={18} />
              <div>
                <p className="text-[11px] text-gray-400">Company</p>
                <p className="text-sm font-medium text-white">
                  Cogwave Software Technologies Pvt. Ltd.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="text-red-400" size={18} />
              <div>
                <p className="text-[11px] text-gray-400">Support Contact</p>
                <p className="text-sm font-medium text-white">
                  Mr. Murali
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-3">
              <div>
                <p className="text-[11px] text-gray-400">Mobile</p>
                <p className="text-sm font-semibold text-red-300">
                  +91 98450 55528
                </p>
              </div>

              <div>
                <p className="text-[11px] text-gray-400">Head Office</p>
                <p className="text-sm font-semibold text-red-300">
                  080-4171 0121
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Developer Option */}
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => {
              clearAppData();
              navigate("/adminpanel");
            }}
            className="flex items-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-sm font-medium text-yellow-300 transition-all duration-300 hover:bg-yellow-500/20"
          >
            <LockKeyhole size={15} />
            Developer Option
          </button>
        </div>

        {/* OK Button */}
        <button
          onClick={handleLogout}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 py-2.5 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:from-red-700 hover:to-red-800 active:scale-95"
        >
          <LogOut size={18} />
          OK
        </button>
      </div>
    </div>
  );
};

export default Expired;