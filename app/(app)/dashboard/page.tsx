import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user?.role;

  if (role === "STUDENT") {
    redirect("/student/dashboard");
  } else if (role === "ACADEMIC_SUPERVISOR" || role === "FIELD_SUPERVISOR") {
    redirect("/supervisor/dashboard");
  } else if (role === "ADMIN") {
    redirect("/admin/users");
  }

  // Fallback welcome page
  return (
    <div className="min-h-screen bg-brand-beige p-8">
      <div className="max-w-2xl mx-auto">
        <div className="card text-center py-12">
          <h1 className="text-3xl font-bold text-brand-navy mb-4">Welcome to Pathways</h1>
          <p className="text-gray-600">Your cooperative training platform</p>
        </div>
      </div>
    </div>
  );
}
