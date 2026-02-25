import { User, Lock, ChevronDown, Shield } from "lucide-react";
import bgimg from "../assets/authBG.png"
import { Settings, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
export default function AuthPage() {
  const [branch, setBranch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
const [baseUrl, setBaseUrl] = useState("");
const navi=useNavigate()

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

const handelNavigate = () =>{
navi("/NewOrder")
}

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#0B0F19] text-white">
      
      {/* LEFT SIDE (Image Section) */}
      <div className="relative hidden lg:flex lg:w-2/3">
        <img
          src={bgimg}
          alt="background"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-600/20 rounded-xl">
              <Shield className="text-blue-500" />
            </div>
            <span className="tracking-widest text-blue-400 text-sm">
              ENTERPRISE GRADE POS
            </span>
          </div>

          <h1 className="text-5xl font-bold leading-tight">
            Seamless <br />
            <span className="text-blue-500">Management.</span>
          </h1>

          <p className="mt-6 text-gray-300 max-w-md">
            A comprehensive solution for modern hospitality.
            Streamline your operations with our intuitive cloud-based platform.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE (Form Section) */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md bg-[#111827]/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-gray-800">
          
          <p className="text-center text-xs tracking-widest text-blue-400 mb-8">
            POWERED BY COGWAVE
          </p>

          {/* Username */}
          <div className="mb-6">
            <label className="text-xs text-gray-400 tracking-wider">
              USER IDENTITY
            </label>
            <div className="mt-2 flex items-center bg-[#1F2937] rounded-xl px-4 py-3 border border-gray-700 focus-within:border-blue-500">
              <User size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="Username / ID"
                className="bg-transparent outline-none ml-3 w-full text-sm"
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="text-xs text-gray-400 tracking-wider">
              SECURE PASSWORD
            </label>
            <div className="mt-2 flex items-center bg-[#1F2937] rounded-xl px-4 py-3 border border-gray-700 focus-within:border-blue-500">
              <Lock size={18} className="text-gray-400" />
              <input
                type="password"
                placeholder="••••••••"
                className="bg-transparent outline-none ml-3 w-full text-sm"
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
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full bg-[#1F2937] rounded-xl px-4 py-3 border border-gray-700 text-sm appearance-none focus:border-blue-500 outline-none"
              >
                <option value="">Select Location</option>
                <option value="branch1">Branch 1</option>
                <option value="branch2">Branch 2</option>
              </select>
              <ChevronDown
                size={18}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
          </div>

        <div className="flex items-center gap-4">
  
  {/* Main Button */}
  <button onClick={handelNavigate} className="flex-1 bg-blue-600 hover:bg-blue-700 transition-all duration-300 py-3 rounded-xl font-semibold tracking-wide shadow-lg">
    AUTHORIZE & SIGN IN
  </button>

  {/* Settings Button */}
  <button  onClick={() => setIsOpen(true)} className="w-14 h-14 flex items-center justify-center rounded-xl bg-[#1F2937] border border-gray-700 hover:border-blue-500 transition-all duration-300">
    <Settings size={20} className="text-gray-400" />
  </button>

</div>
        </div>
      </div>
      {isOpen && (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
    <div className="w-full max-w-md bg-[#111827] border border-gray-700 rounded-2xl p-6 shadow-2xl">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">System Settings</h2>
        <button onClick={() => setIsOpen(false)}>
          <X className="text-gray-400 hover:text-white" />
        </button>
      </div>

      {/* Base URL Input */}
      <div className="mb-6">
        <label className="text-sm text-gray-400">Base URL</label>
        <input
          type="text"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          placeholder="https://api.example.com"
          className="mt-2 w-full bg-[#1F2937] border border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
        />
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-semibold transition-all"
      >
        Save Settings
      </button>
    </div>
  </div>
)}
    </div>
  );
}