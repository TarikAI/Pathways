"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  User,
  Shield,
  GraduationCap,
  Check,
  Mail,
  X,
} from "lucide-react";

interface UserData {
  id: string;
  email: string;
  fullName: string;
  role: string;
  phone: string | null;
  avatarUrl: string | null;
  emailVerified: Date | null;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    studentInternships: number;
    academicInternships: number;
    fieldInternships: number;
  };
}

interface CreateUserData {
  email: string;
  password: string;
  fullName: string;
  role: string;
}

interface UpdateUserData {
  email?: string;
  fullName?: string;
  role?: string;
  password?: string;
}

const roles = [
  { value: "STUDENT", label: "Student", icon: User },
  { value: "ACADEMIC_SUPERVISOR", label: "Academic Supervisor", icon: GraduationCap },
  { value: "FIELD_SUPERVISOR", label: "Field Supervisor", icon: GraduationCap },
  { value: "ADMIN", label: "Admin", icon: Shield },
];

export default function AdminUsersPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [formData, setFormData] = useState<CreateUserData>({
    email: "",
    password: "",
    fullName: "",
    role: "STUDENT",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    fetchUsers();
  }, [status, router]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create user");
      }

      setSuccess("User created successfully!");
      setShowCreateModal(false);
      setFormData({ email: "", password: "", fullName: "", role: "STUDENT" });
      fetchUsers();

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create user";
      setError(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setActionLoading(true);
    setError("");
    setSuccess("");

    try {
      const updateData: UpdateUserData = {};
      if (formData.fullName) updateData.fullName = formData.fullName;
      if (formData.email) updateData.email = formData.email;
      if (formData.role) updateData.role = formData.role;
      if (formData.password) updateData.password = formData.password;

      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update user");
      }

      setSuccess("User updated successfully!");
      setShowEditModal(false);
      setSelectedUser(null);
      setFormData({ email: "", password: "", fullName: "", role: "STUDENT" });
      fetchUsers();

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update user";
      setError(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    setActionLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete user");
      }

      setSuccess("User deleted successfully!");
      setShowDeleteConfirm(false);
      setUserToDelete(null);
      fetchUsers();

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete user";
      setError(message);
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = (user: UserData) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      password: "",
      fullName: user.fullName,
      role: user.role,
    });
    setShowEditModal(true);
    setError("");
  };

  const openDeleteConfirm = (user: UserData) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
    setError("");
  };

  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-purple-100 text-purple-800";
      case "ACADEMIC_SUPERVISOR":
        return "bg-blue-100 text-blue-800";
      case "FIELD_SUPERVISOR":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleLabel = (role: string) => {
    return role.replace("_", " ");
  };

  if (status === "loading" || loading) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-brand-teal border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-brand-navy">Manage Users</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">Create, edit, and manage user accounts</p>
        </div>
        <button
          onClick={() => {
            setShowCreateModal(true);
            setFormData({ email: "", password: "", fullName: "", role: "STUDENT" });
            setError("");
          }}
          className="btn btn-primary text-sm sm:text-base"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Add User</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-4 p-3 sm:p-4 bg-green-50 text-green-800 rounded-xl flex items-center gap-2 text-sm">
          <Check size={16} />
          {success}
        </div>
      )}
      {error && !showCreateModal && !showEditModal && (
        <div className="mb-4 p-3 sm:p-4 bg-red-50 text-red-800 rounded-xl text-sm">{error}</div>
      )}

      {/* Search */}
      <div className="mb-6 relative">
        <Search size={16} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search users..."
          className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 text-sm bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
        />
      </div>

      {/* Users Table - Card Layout on Mobile, Table on Desktop */}
      <div className="card overflow-hidden p-0">
        {/* Mobile Card Layout */}
        <div className="md:hidden space-y-3 p-4">
          {filteredUsers.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              {searchQuery ? "No users found matching your search" : "No users found"}
            </div>
          ) : (
            filteredUsers.map((u) => {
              const isOwnAccount = u.id === session?.user?.id;
              return (
                <div key={u.id} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ${
                        u.role === "ADMIN"
                          ? "bg-purple-500"
                          : u.role === "ACADEMIC_SUPERVISOR"
                          ? "bg-blue-500"
                          : u.role === "FIELD_SUPERVISOR"
                          ? "bg-green-500"
                          : "bg-gray-500"
                      }`}
                    >
                      {u.avatarUrl ? (
                        <img
                          src={u.avatarUrl}
                          alt={u.fullName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        u.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-800 text-base truncate">{u.fullName}</div>
                      <div className="text-sm text-gray-500 truncate flex items-center gap-1">
                        <Mail size={12} />
                        <span className="truncate">{u.email}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(u.role)}`}
                    >
                      {getRoleLabel(u.role)}
                    </span>
                    {u._count.studentInternships + u._count.academicInternships + u._count.fieldInternships > 0 && (
                      <span className="text-xs text-gray-500">
                        {u._count.studentInternships + u._count.academicInternships + u._count.fieldInternships} internship{u._count.studentInternships + u._count.academicInternships + u._count.fieldInternships !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-end gap-1 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => openEditModal(u)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-brand-teal"
                      title="Edit user"
                    >
                      <Edit size={18} />
                    </button>
                    {!isOwnAccount && (
                      <button
                        onClick={() => openDeleteConfirm(u)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors text-gray-600 hover:text-red-600"
                        title="Delete user"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop Table Layout */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 font-semibold text-sm text-gray-600">User</th>
                <th className="p-4 font-semibold text-sm text-gray-600">Role</th>
                <th className="p-4 font-semibold text-sm text-gray-600 hidden lg:table-cell">Internships</th>
                <th className="p-4 font-semibold text-sm text-gray-600 hidden xl:table-cell">Joined</th>
                <th className="p-4 font-semibold text-sm text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    {searchQuery ? "No users found matching your search" : "No users found"}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isOwnAccount = u.id === session?.user?.id;
                  return (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 ${
                              u.role === "ADMIN"
                                ? "bg-purple-500"
                                : u.role === "ACADEMIC_SUPERVISOR"
                                ? "bg-blue-500"
                                : u.role === "FIELD_SUPERVISOR"
                                ? "bg-green-500"
                                : "bg-gray-500"
                            }`}
                          >
                            {u.avatarUrl ? (
                              <img
                                src={u.avatarUrl}
                                alt={u.fullName}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              u.fullName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-gray-800 truncate">{u.fullName}</div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Mail size={12} className="flex-shrink-0" />
                              <span className="truncate">{u.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getRoleBadgeColor(
                            u.role
                          )}`}
                        >
                          {getRoleLabel(u.role)}
                        </span>
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        <div className="flex gap-2 text-sm text-gray-600">
                          <span title="As Student">{u._count.studentInternships}S</span>
                          <span title="As Academic">{u._count.academicInternships}A</span>
                          <span title="As Field">{u._count.fieldInternships}F</span>
                        </div>
                      </td>
                      <td className="p-4 text-gray-500 text-sm hidden xl:table-cell whitespace-nowrap">
                        {formatDistanceToNow(new Date(u.createdAt), { addSuffix: true })}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(u)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-brand-teal"
                            title="Edit user"
                          >
                            <Edit size={16} />
                          </button>
                          {!isOwnAccount && (
                            <button
                              onClick={() => openDeleteConfirm(u)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors text-gray-600 hover:text-red-600"
                              title="Delete user"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="sticky top-0 bg-white p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold text-brand-navy">Create New User</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setError("");
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="p-4 sm:p-6 space-y-4">
              {error && <div className="p-3 bg-red-50 text-red-800 rounded-lg text-sm">{error}</div>}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent text-base"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent text-base"
                  placeholder="user@example.com"
                  inputMode="email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent text-base"
                  placeholder="Min. 6 characters"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent text-base bg-white"
                >
                  {roles.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setError("");
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-base font-medium"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 px-4 py-3 bg-brand-teal text-white rounded-lg hover:bg-brand-navy transition-colors disabled:opacity-50 text-base font-medium"
                >
                  {actionLoading ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="sticky top-0 bg-white p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-brand-navy">Edit User</h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{selectedUser.fullName}</p>
              </div>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedUser(null);
                  setError("");
                }}
                className="p-2 hover:bg-gray-100 rounded-lg flex-shrink-0"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdateUser} className="p-4 sm:p-6 space-y-4">
              {error && <div className="p-3 bg-red-50 text-red-800 rounded-lg text-sm">{error}</div>}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent text-base"
                  inputMode="email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password (optional)</label>
                <input
                  type="password"
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent text-base"
                  placeholder="Leave blank to keep current"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  disabled={selectedUser.id === session?.user?.id}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent disabled:bg-gray-100 text-base bg-white"
                >
                  {roles.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
                {selectedUser.id === session?.user?.id && (
                  <p className="text-xs text-gray-500 mt-1">You cannot change your own role</p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                    setError("");
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-base font-medium"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 px-4 py-3 bg-brand-teal text-white rounded-lg hover:bg-brand-navy transition-colors disabled:opacity-50 text-base font-medium"
                >
                  {actionLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && userToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md animate-slide-up">
            <div className="p-4 sm:p-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="text-red-600" size={24} />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-center text-gray-900 mb-2">Delete User?</h2>
              <p className="text-center text-gray-600 mb-6 text-sm sm:text-base">
                Are you sure you want to delete <strong>{userToDelete.fullName}</strong>? This action cannot be undone.
              </p>
              {error && <div className="p-3 bg-red-50 text-red-800 rounded-lg text-sm mb-4">{error}</div>}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setUserToDelete(null);
                    setError("");
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-base font-medium"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-base font-medium"
                >
                  {actionLoading ? "Deleting..." : "Delete User"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
