import { requireRole } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import type { User } from "@prisma/client";

export default async function AdminUsersPage() {
  const session = await requireRole(["ADMIN"]);

  const users = await db.user.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Users</h1>
        <button className="btn btn-primary">Add User</button>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 font-semibold text-sm text-gray-600">Name</th>
              <th className="p-4 font-semibold text-sm text-gray-600">Email</th>
              <th className="p-4 font-semibold text-sm text-gray-600">Role</th>
              <th className="p-4 font-semibold text-sm text-gray-600">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u: User) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="p-4 font-medium">{u.fullName}</td>
                <td className="p-4 text-gray-600">{u.email}</td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-brand-sky text-brand-navy text-xs rounded-full font-medium">
                    {u.role}
                  </span>
                </td>
                <td className="p-4 text-gray-500 text-sm">{u.createdAt.toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
