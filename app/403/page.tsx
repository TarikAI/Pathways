import Link from "next/link";
import { ShieldX } from "lucide-react";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-brand-beige flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center">
        <div className="card">
          <ShieldX className="w-16 h-16 text-brand-teal mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-brand-navy mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You don&apos;t have permission to access this page.
          </p>
          <Link href="/dashboard" className="btn btn-primary">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
