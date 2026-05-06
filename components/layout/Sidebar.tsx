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
  Briefcase
} from "lucide-react";

export default function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();

  const navItems = [
    ...(role === "STUDENT" ? [
      { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
      { label: "Internship", href: "/student/internship", icon: Briefcase },
      { label: "Reports", href: "/student/reports", icon: FileText },
    ] : []),
    ...(role === "ACADEMIC_SUPERVISOR" || role === "FIELD_SUPERVISOR" ? [
      { label: "Dashboard", href: "/supervisor/dashboard", icon: LayoutDashboard },
      { label: "Students", href: "/supervisor/students", icon: Users },
      { label: "Reports", href: "/supervisor/reports", icon: FileText },
    ] : []),
    ...(role === "ADMIN" ? [
      { label: "Users", href: "/admin/users", icon: Users },
      { label: "Programs", href: "/admin/programs", icon: Briefcase },
    ] : []),
    { label: "Messages", href: "/messages", icon: MessageSquare },
    { label: "Notifications", href: "/notifications", icon: Bell },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-brand-navy text-white flex flex-col h-screen">
      <div className="p-6 border-b border-white/10 flex items-center gap-3">
        <div className="font-bold text-2xl tracking-wider text-brand-sky">PATHWAYS</div>
      </div>
      <nav className="flex-1 py-6 flex flex-col">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-3 px-6 py-3 transition-colors ${
                isActive ? "bg-brand-teal text-white border-l-4 border-brand-sky" : "text-brand-sky hover:bg-brand-teal/50 hover:text-white border-l-4 border-transparent"
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
