"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { FileText, Search, Filter, User as UserIcon } from "lucide-react";

interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
}

export default function AdminAuditPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState({
    action: "",
    entity: "",
    userId: "",
  });

  const pageSize = 50;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (session?.user?.role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }

    fetchLogs();
  }, [status, session, router, page, filters]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: pageSize.toString(),
        offset: (page * pageSize).toString(),
        ...(filters.action && { action: filters.action }),
        ...(filters.entity && { entity: filters.entity }),
        ...(filters.userId && { userId: filters.userId }),
      });

      const res = await fetch(`/api/audit?${params}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
        setTotal(data.total);
      }
    } catch (err) {
      console.error("Failed to fetch audit logs", err);
    } finally {
      setLoading(false);
    }
  };

  const actionColors: Record<string, string> = {
    CREATE: "bg-green-100 text-green-800",
    UPDATE: "bg-blue-100 text-blue-800",
    DELETE: "bg-red-100 text-red-800",
    APPROVE: "bg-green-100 text-green-800",
    REJECT: "bg-red-100 text-red-800",
    SUBMIT: "bg-yellow-100 text-yellow-800",
    LOGIN: "bg-gray-100 text-gray-800",
    default: "bg-gray-100 text-gray-800",
  };

  const getActionColor = (action: string) => {
    for (const key of Object.keys(actionColors)) {
      if (action.includes(key)) return actionColors[key];
    }
    return actionColors.default;
  };

  const formatAction = (action: string) => action.replace(/_/g, " ").toLowerCase();

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-brand-navy mb-6">Audit Logs</h1>

      <div className="card mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Filter by action..."
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value })}
              onKeyPress={(e) => e.key === "Enter" && setPage(0)}
              className="bg-transparent border-none outline-none flex-1 text-sm"
            />
          </div>
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
            <Filter size={18} className="text-gray-400" />
            <select
              value={filters.entity}
              onChange={(e) => setFilters({ ...filters, entity: e.target.value })}
              className="bg-transparent border-none outline-none text-sm"
            >
              <option value="">All Entities</option>
              <option value="User">User</option>
              <option value="Internship">Internship</option>
              <option value="Report">Report</option>
              <option value="Evaluation">Evaluation</option>
              <option value="Message">Message</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading audit logs...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            No audit logs found.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="p-4 font-semibold text-sm text-gray-600">Timestamp</th>
                    <th className="p-4 font-semibold text-sm text-gray-600">User</th>
                    <th className="p-4 font-semibold text-sm text-gray-600">Action</th>
                    <th className="p-4 font-semibold text-sm text-gray-600">Entity</th>
                    <th className="p-4 font-semibold text-sm text-gray-600">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="p-4 text-sm text-gray-500 whitespace-nowrap">
                        {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <UserIcon size={16} className="text-gray-400" />
                          <div>
                            <p className="font-medium text-sm">{log.user.fullName}</p>
                            <p className="text-xs text-gray-500">{log.user.role.replace("_", " ")}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}
                        >
                          {formatAction(log.action)}
                        </span>
                      </td>
                      <td className="p-4 text-sm">
                        <span className="font-medium">{log.entity}</span>
                      </td>
                      <td className="p-4 text-sm text-gray-500 max-w-xs truncate">
                        {log.entityId}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between p-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Showing {page * pageSize + 1} to {Math.min((page + 1) * pageSize, total)} of {total} logs
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="btn btn-outline text-sm py-1 px-3 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={(page + 1) * pageSize >= total}
                  className="btn btn-outline text-sm py-1 px-3 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
