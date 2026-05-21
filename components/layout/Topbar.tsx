"use client";

import Image from "next/image";
import { Bell, Search, User, LogOut, ChevronDown, Menu, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useSidebar } from "./SidebarContext";

export default function Topbar() {
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!session?.user) return;

    const fetchUnread = async () => {
      try {
        const res = await fetch("/api/notifications?unreadOnly=true&limit=1");
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.unreadCount || 0);
        }
      } catch {
        // Silently fail - notification count is not critical
        setUnreadCount(0);
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [session]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  if (!session?.user) return null;

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
    setShowMenu(false);
  };

  return (
    <header className="h-40 bg-brand-white shadow-sm flex items-center justify-between px-4 md:px-8 border-b border-black/5 shrink-0">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Toggle sidebar"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <Image
          src="/logo-bg.jpg"
          alt="Pathways"
          width={350}
          height={150}
          className="h-[150px] w-auto object-contain"
          priority
        />
        <div className="hidden md:flex items-center bg-brand-beige rounded-lg px-3 py-2 w-64 border border-transparent focus-within:border-brand-teal transition-colors">
          <Search size={18} className="text-brand-navy/50 mr-2" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent border-none outline-none text-sm w-full"
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 items-end">
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-3 hover:bg-gray-50 rounded-lg py-2 px-3 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-brand-sky text-brand-navy flex items-center justify-center font-bold">
              {session.user.fullName?.charAt(0) || <User size={18} />}
            </div>
            <div className="hidden md:flex flex-col items-start">
              <span className="text-sm font-semibold text-brand-navy leading-none mb-1">
                {session.user.fullName}
              </span>
              <span className="text-xs text-brand-navy/60 leading-none">
                {session.user.role?.replace("_", " ")}
              </span>
            </div>
            <ChevronDown size={16} className="hidden md:block text-gray-400" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
              <Link
                href="/notifications"
                className="flex items-center justify-between gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setShowMenu(false)}
              >
                <div className="flex items-center gap-3">
                  <Bell size={16} />
                  Notifications
                </div>
                {unreadCount > 0 && (
                  <span className="min-w-[1.25rem] h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-medium">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
              <Link
                href="/settings"
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setShowMenu(false)}
              >
                <User size={16} />
                Settings
              </Link>
              <hr className="my-2 border-gray-100" />
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          )}
        </div>

        <Link
          href="/notifications"
          className="hidden md:block relative text-brand-navy hover:text-brand-teal transition-colors"
          title="Notifications"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 bg-red-500 rounded-full border-2 border-white text-white text-xs flex items-center justify-center font-medium">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
