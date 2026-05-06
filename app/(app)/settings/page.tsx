import { requireSession } from "@/lib/auth-guards";

export default async function SettingsPage() {
  const session = await requireSession();

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-500">Full Name</label>
            <div className="font-medium">{session.user.fullName}</div>
          </div>
          <div>
            <label className="text-sm text-gray-500">Email</label>
            <div className="font-medium">{session.user.email}</div>
          </div>
          <div>
            <label className="text-sm text-gray-500">Role</label>
            <div className="font-medium">{(session.user as any).role}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
