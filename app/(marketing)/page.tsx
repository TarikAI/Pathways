import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-brand-beige">
      <header className="h-20 flex items-center justify-between px-10 bg-brand-navy text-white">
        <div className="text-2xl font-bold tracking-widest text-brand-sky">PATHWAYS</div>
        <nav className="flex gap-6 items-center">
          <Link href="/login" className="hover:text-brand-sky transition-colors">Sign In</Link>
          <Link href="/register" className="btn bg-brand-teal text-white hover:opacity-90">
            Get Started
          </Link>
        </nav>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-5xl md:text-7xl font-extrabold text-brand-navy mb-6 tracking-tight">
          Modernizing <span className="text-brand-teal">Cooperative</span> Training
        </h1>
        <p className="text-xl md:text-2xl text-brand-navy/70 max-w-3xl mb-10">
          The all-in-one platform connecting students, academic advisors, and field supervisors to ensure successful internships.
        </p>
        <Link href="/login" className="btn btn-primary text-lg px-8 py-4">
          Access the Platform <ArrowRight className="ml-2" />
        </Link>
      </main>
    </div>
  );
}
