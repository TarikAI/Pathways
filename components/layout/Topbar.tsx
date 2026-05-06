"use client";

import { Bell, Search, User, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function Topbar({ user }: { user: any }) {
  return (
    <header className="h-16 bg-brand-white shadow-sm flex items-center justify-between px-8 border-b border-black/5 shrink-0">
      <div className="flex items-center bg-brand-beige rounded-lg px-3 py-2 w-64 border border-transparent focus-within:border-brand-teal transition-colors">
        <Search size={18} className="text-brand-navy/50 mr-2" />
        <input 
          type="text" 
          placeholder="Search..." 
          className="bg-transparent border-none outline-none text-sm w-full"
        />
      </div>

      <div className="flex items-center gap-6">
        <button className="relative text-brand-navy hover:text-brand-teal transition-colors">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="flex items-center gap-3 border-l pl-6 border-gray-200">
          <div className="w-8 h-8 rounded-full bg-brand-sky text-brand-navy flex items-center justify-center font-bold text-sm">
            {user?.fullName?.charAt(0) || <User size={16} />}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-brand-navy leading-none mb-1">{user?.fullName}</span>
            <span className="text-xs text-brand-navy/60 leading-none">{user?.role?.replace("_", " ")}</span>
          </div>
          <button 
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="ml-4 text-gray-400 hover:text-red-500 transition-colors"
            title="Sign out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
