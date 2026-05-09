import { requireSession } from "@/lib/auth-guards";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import AppLayoutWrapper from "@/components/layout/AppLayoutWrapper";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();

  return (
    <AppLayoutWrapper>
      <div className="flex min-h-screen bg-brand-beige">
        <Sidebar role={session.user.role} />
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            {children}
          </main>
        </div>
      </div>
    </AppLayoutWrapper>
  );
}
