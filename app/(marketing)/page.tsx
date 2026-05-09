"use client";

import Link from "next/link";
import { ArrowRight, Users, FileText, BarChart3, MessageSquare, CheckCircle2, Briefcase, GraduationCap, Building, User, LogOut, ChevronDown } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!mounted) {
    return null; // Avoid hydration mismatch
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
    setShowMenu(false);
  };

  const userAvatar = session?.user ? (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-3 border-l pl-6 border-gray-200 hover:bg-gray-50 rounded-lg py-2 px-3 transition-colors"
      >
        <div className="w-10 h-10 rounded-full bg-brand-sky text-brand-navy flex items-center justify-center font-bold">
          {session.user.fullName?.charAt(0) || <User size={18} />}
        </div>
        <div className="flex flex-col items-start">
          <span className="text-sm font-semibold text-brand-navy leading-none mb-1">
            {session.user.fullName}
          </span>
          <span className="text-xs text-brand-navy/60 leading-none">
            {session.user.role?.replace("_", " ")}
          </span>
        </div>
        <ChevronDown size={16} className="text-gray-400" />
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            onClick={() => setShowMenu(false)}
          >
            <Briefcase size={16} />
            Dashboard
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
  ) : (
    <>
      <Link href="/login" className="text-gray-600 hover:text-brand-navy transition-colors text-sm font-medium">
        Sign In
      </Link>
      <Link href="/register" className="btn bg-brand-teal text-white hover:bg-brand-navy transition-colors text-sm">
        Get Started
      </Link>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="h-40 flex items-center justify-between px-6 md:px-10 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3">
          {!logoError ? (
            <img
              src="/logo-bg.jpg"
              alt="Pathways"
              width={350}
              height={150}
              className="h-[150px] w-auto object-contain"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className="w-16 h-16 bg-brand-navy text-brand-teal rounded-lg flex items-center justify-center font-bold text-3xl">
              P
            </div>
          )}
        </div>
        <nav className="flex gap-4 md:gap-6 items-center">
          {userAvatar}
        </nav>
      </header>

      <main>
        <section className="py-20 md:py-32 px-6 bg-gradient-to-b from-brand-beige/30 to-white">
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-block px-4 py-1.5 bg-brand-teal/10 text-brand-teal rounded-full text-sm font-medium mb-6">
              Cooperative Training Management Platform
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-brand-navy mb-6 leading-tight">
              Streamline Your <span className="text-brand-teal">Internship</span> Experience
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-10">
              Connect students, academic advisors, and field supervisors in one unified platform. Track progress, submit reports, and ensure successful cooperative training outcomes.
            </p>
            {status === "authenticated" ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.push("/dashboard")}
                  className="btn bg-brand-teal hover:bg-brand-navy text-white px-8 py-4 text-lg"
                >
                  Go to Dashboard <ArrowRight className="ml-2 inline w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register" className="btn bg-brand-teal hover:bg-brand-navy text-white px-8 py-4 text-lg">
                  Get Started Free <ArrowRight className="ml-2 inline w-5 h-5" />
                </Link>
                <Link href="/login" className="btn btn-outline px-8 py-4 text-lg">
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </section>

        <section className="py-20 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-navy text-center mb-4">
              Built for Everyone
            </h2>
            <p className="text-gray-600 text-center mb-16 max-w-2xl mx-auto">
              Pathways brings together all stakeholders in the cooperative training ecosystem
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="card group hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-brand-sky/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand-teal/20 transition-colors">
                  <GraduationCap className="w-7 h-7 text-brand-navy" />
                </div>
                <h3 className="text-xl font-bold text-brand-navy mb-2">For Students</h3>
                <p className="text-gray-600 mb-4">
                  Discover opportunities, track your internship progress, submit weekly reports, and receive evaluations from your supervisors.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-brand-teal" /> Browse training programs</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-brand-teal" /> Submit weekly reports</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-brand-teal" /> Track evaluations</li>
                </ul>
              </div>

              <div className="card group hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-brand-sky/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand-teal/20 transition-colors">
                  <Users className="w-7 h-7 text-brand-navy" />
                </div>
                <h3 className="text-xl font-bold text-brand-navy mb-2">For Academic Supervisors</h3>
                <p className="text-gray-600 mb-4">
                  Create training programs, review applications, monitor student progress, and cosign field supervisor evaluations.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-brand-teal" /> Publish programs</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-brand-teal" /> Review reports</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-brand-teal" /> Cosign evaluations</li>
                </ul>
              </div>

              <div className="card group hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-brand-sky/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand-teal/20 transition-colors">
                  <Building className="w-7 h-7 text-brand-navy" />
                </div>
                <h3 className="text-xl font-bold text-brand-navy mb-2">For Field Supervisors</h3>
                <p className="text-gray-600 mb-4">
                  Review student applications, assign academic supervisors, submit weekly evaluations, and communicate with the team.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-brand-teal" /> Approve applications</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-brand-teal" /> Submit evaluations</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-brand-teal" /> Message team</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-6 bg-brand-navy text-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
              Everything You Need
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-brand-teal rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h3 className="font-semibold mb-2">Program Management</h3>
                <p className="text-gray-300 text-sm">Create and manage training programs with application tracking</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-brand-teal rounded-xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="font-semibold mb-2">Weekly Reports</h3>
                <p className="text-gray-300 text-sm">Students submit progress reports for supervisor review</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-brand-teal rounded-xl flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="font-semibold mb-2">Evaluations</h3>
                <p className="text-gray-300 text-sm">Comprehensive scoring with academic cosign workflow</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-brand-teal rounded-xl flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="font-semibold mb-2">Team Messaging</h3>
                <p className="text-gray-300 text-sm">Built-in chat for seamless communication</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-6 bg-brand-beige/30">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-navy mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-600 mb-10">
              Join hundreds of students, academic advisors, and field supervisors using Pathways to streamline cooperative training.
            </p>
            {status === "authenticated" ? (
              <button
                onClick={() => router.push("/dashboard")}
                className="btn bg-brand-teal hover:bg-brand-navy text-white px-8 py-4 text-lg"
              >
                Go to Dashboard <ArrowRight className="ml-2 inline w-5 h-5" />
              </button>
            ) : (
              <Link href="/register" className="btn bg-brand-teal hover:bg-brand-navy text-white px-8 py-4 text-lg">
                Create Your Account <ArrowRight className="ml-2 inline w-5 h-5" />
              </Link>
            )}
          </div>
        </section>
      </main>

      <footer className="py-8 px-6 bg-brand-navy text-white border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center text-gray-400 text-sm">
          <p>&copy; 2026 Pathways. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
