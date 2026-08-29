import React, { useState } from "react";
import SideBar from "../components/SideBar";
import { Outlet } from "react-router-dom";
import { Menu, X, AlertTriangle, RefreshCw, LogOut } from "lucide-react";
import { useApp } from "../context/AppContext";
import Loading from "../components/Loading";
import { useClerk } from "@clerk/clerk-react";

const Layout = () => {
  const { currentUser: user, loadingProfile, profileError, backendUrl, fetchProfile } = useApp();
  const { signOut } = useClerk();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    await fetchProfile();
    setIsRetrying(false);
  };

  if (loadingProfile) {
    return <Loading />;
  }

  if (profileError || !user) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-slate-100 p-6 md:p-8 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5 text-red-500">
            <AlertTriangle className="w-8 h-8" />
          </div>
          
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Connection Error</h2>
          <p className="text-slate-600 text-sm mb-6">
            We couldn't load your profile from the backend database.
          </p>
          
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 text-left text-xs font-mono text-slate-700 break-all space-y-2">
            <div>
              <span className="font-semibold text-slate-500">Error:</span> {profileError || "Profile failed to load (user not found in DB)"}
            </div>
            <div>
              <span className="font-semibold text-slate-500">Target URL:</span> {backendUrl}
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-8 text-left text-xs text-indigo-900 space-y-2">
            <p className="font-semibold">💡 Troubleshooting live deployment:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Ensure your backend server is deployed and running.</li>
              <li>Verify that you set <code className="bg-indigo-100 px-1 py-0.5 rounded font-semibold">VITE_BACKEND_URL</code> in your frontend Vercel environment variables (pointing to your live backend URL, not localhost).</li>
              <li>Make sure MongoDB, Inngest, and Clerk environment variables are set in your backend Vercel configuration.</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium text-sm disabled:opacity-50 cursor-pointer shadow-sm hover:shadow"
            >
              <RefreshCw className={`w-4 h-4 ${isRetrying ? "animate-spin" : ""}`} />
              {isRetrying ? "Retrying..." : "Retry Connection"}
            </button>
            <button
              onClick={signOut}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition font-medium text-sm cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-slate-500" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex h-screen">
      <SideBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}/>
      <div className="flex-1 bg-slate-50">
          <Outlet />
      </div>
      {
        sidebarOpen ?
        <X className="absolute top-3 right-3 p-2 z-100 bg-white rounded-md shadow w-10 h-10 text-gray-600 sm:hidden"
         onClick={()=>setSidebarOpen(false)}  />
        :
        <Menu className="absolute top-3 right-3 p-2 z-100 bg-white rounded-md shadow w-10 h-10 text-gray-600 sm:hidden"
         onClick={()=>setSidebarOpen(true)}  />
      }
    </div>
  );
};

export default Layout;
