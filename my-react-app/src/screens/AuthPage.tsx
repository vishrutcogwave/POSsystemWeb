import { User, Lock, ChevronDown, Shield } from "lucide-react";
import bgimg from "../assets/authBG.png";
import { Settings, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/services/auth.service";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import { getBranchesByUser } from "../api/services/products.service";
import type { LoginRequest } from "../types/types";
type Branch = {
  branch_code: string;
  branch_name: string;
};
export default function AuthPage() {
  const [branch, setBranch] = useState<Branch | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [baseUrl, setBaseUrl] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const savedUrl = localStorage.getItem("baseUrl");
    if (savedUrl) {
      setBaseUrl(savedUrl);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("baseUrl", baseUrl);
    setIsOpen(false);
  };

const handleLoadBranches = async () => {
  if (!username) {
    toast.error("Enter username first");
    return;
  }

  try {
    setLoading(true); // show full loader

    const data = await getBranchesByUser(username);

    setBranches(data);

    toast.success("Branches loaded");
  } catch (error) {
    toast.error("Failed to load branches");
  } finally {
    setLoading(false); // hide loader
  }
};

  const handleLogin = async () => {
    if (!username || !password) {
      toast.error("Please enter username and password");
      return;
    }

    try {
      setLoading(true);
      const payload: LoginRequest = {
        username: username,
        password: password,
        branch_code: branch?.branch_code || "",
      };
      const data = await login(payload);

      console.log("Token:", data.token);

      toast.success("Login successful");

      navigate("/dashboard", { replace: true });
    } catch (error) {
      toast.error("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#0B0F19] text-white">
      {loading && <Loader />}

      {/* LEFT SIDE */}
      <div className="relative hidden lg:flex lg:w-2/3">
        <img
          src={bgimg}
          alt="background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-600/20 rounded-xl">
              <Shield className="text-[#0576B2]" />
            </div>
            <span className="tracking-widest text-[#0576B2] text-sm">
              ENTERPRISE GRADE POS
            </span>
          </div>

          <h1 className="text-5xl font-bold leading-tight">
            Seamless <br />
            <span className="text-[#0576B2]">Management.</span>
          </h1>

          <p className="mt-6 text-gray-300 max-w-md">
            A comprehensive solution for modern hospitality.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md bg-[#111827]/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-gray-800">
          <p className="text-center text-xs tracking-widest text-[#0576B2] mb-8">
            POWERED BY COGWAVE
          </p>

          {/* Username */}
          <div className="mb-4">
            <label className="text-xs text-gray-400 tracking-wider">
              USER IDENTITY
            </label>

            <div className="mt-2 flex items-center bg-[#1F2937] rounded-xl px-4 py-3 border border-gray-700">
              <User size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="Username / ID"
                className="bg-transparent outline-none ml-3 w-full text-sm"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <button
              onClick={handleLoadBranches}
              className="mt-2 text-xs bg-[#0576B2] px-3 py-1 rounded-lg hover:bg-[#0576B2]"
            >
              Load Branch
            </button>
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="text-xs text-gray-400 tracking-wider">
              SECURE PASSWORD
            </label>
            <div className="mt-2 flex items-center bg-[#1F2937] rounded-xl px-4 py-3 border border-gray-700">
              <Lock size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="••••••••"
                className="bg-transparent outline-none ml-3 w-full text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Branch */}
          <div className="mb-8">
            <label className="text-xs text-gray-400 tracking-wider">
              OPERATING BRANCH
            </label>

            <div className="mt-2 relative">
              <select
                value={branch?.branch_code || ""}
                onChange={(e) => {
                  const selected = branches.find(
                    (b) => b.branch_code === e.target.value,
                  );
                  setBranch(selected || null);
                }}
                className="w-full bg-[#1F2937] rounded-xl px-4 py-3 border border-gray-700 text-sm appearance-none"
              >
                <option value="">Select Location</option>

                {branches.map((b: any) => (
                  <option key={b.branch_code} value={b.branch_code}>
                    {b.branch_name}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={18}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleLogin}
              className="flex-1 bg-[#0576B2] hover:bg-[#0576B2] py-3 rounded-xl font-semibold"
            >
              AUTHORIZE & SIGN IN
            </button>

            <button
              onClick={() => setIsOpen(true)}
              className="w-14 h-14 flex items-center justify-center rounded-xl bg-[#1F2937] border border-gray-700"
            >
              <Settings size={20} className="text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="w-full max-w-md bg-[#111827] border border-gray-700 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">System Settings</h2>
              <button onClick={() => setIsOpen(false)}>
                <X className="text-gray-400" />
              </button>
            </div>

            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.example.com"
              className="w-full bg-[#1F2937] border border-gray-700 rounded-xl px-4 py-3 mb-4"
            />

            <button
              onClick={handleSave}
              className="w-full bg-[#0576B2] hover:bg-[#0576B2] py-3 rounded-xl"
            >
              Save Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
