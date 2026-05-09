"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Bell,
  Settings,
  Users,
  Briefcase,
  BookOpen,
  History,
  X
} from "lucide-react";
import { useSidebar } from "./SidebarContext";
import { useEffect } from "react";

export default function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const { isSidebarOpen, closeSidebar } = useSidebar();

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen]);

  const navItems = [
    ...(role === "STUDENT" ? [
      { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
      { label: "Internships", href: "/internships", icon: Briefcase },
      { label: "My Internship", href: "/student/internship", icon: BookOpen },
      { label: "My Applications", href: "/student/applications", icon: FileText },
      { label: "Evaluations", href: "/student/evaluations", icon: FileText },
    ] : []),
    ...(role === "ACADEMIC_SUPERVISOR" || role === "FIELD_SUPERVISOR" ? [
      { label: "Dashboard", href: "/supervisor/dashboard", icon: LayoutDashboard },
      { label: "Programs", href: "/supervisor/programs", icon: BookOpen },
      { label: "Applications", href: "/supervisor/applications", icon: FileText },
      { label: "Students", href: "/supervisor/students", icon: Users },
      { label: "Reports", href: "/supervisor/reports", icon: FileText },
      ...(role === "FIELD_SUPERVISOR" ? [
        { label: "Evaluations", href: "/supervisor/evaluations", icon: FileText },
      ] : []),
    ] : []),
    ...(role === "ADMIN" ? [
      { label: "Users", href: "/admin/users", icon: Users },
      { label: "Programs", href: "/admin/programs", icon: Briefcase },
      { label: "Audit Logs", href: "/admin/audit", icon: History },
    ] : []),
    { label: "Messages", href: "/messages", icon: MessageSquare },
    { label: "Notifications", href: "/notifications", icon: Bell },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-brand-navy text-white flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          h-screen
        `}
      >
        {/* Close button for mobile */}
        <button
          onClick={closeSidebar}
          className="lg:hidden absolute top-4 right-4 p-2 rounded-lg hover:bg-brand-teal/50 transition-colors"
          aria-label="Close sidebar"
        >
          <X size={24} />
        </button>

        <nav className="flex-1 py-6 flex flex-col mt-12 lg:mt-0">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeSidebar}
                className={`flex items-center gap-3 px-6 py-3 transition-colors ${
                  isActive
                    ? "bg-brand-teal text-white border-l-4 border-brand-sky"
                    : "text-brand-sky hover:bg-brand-teal/50 hover:text-white border-l-4 border-transparent"
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
