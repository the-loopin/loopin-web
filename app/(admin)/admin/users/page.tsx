"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteShell, PageHeader, Panel } from "@/app/site";
import { getAdminUsers, updateUserRole, deleteUser, UserItem } from "@/lib/api";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Track specific row operations during API processing
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchUsers = async (page: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAdminUsers(page, 10);
      setUsers(data.content || []);
      setTotalPages(data.totalPages || 0);
      setCurrentPage(data.number || 0);
    } catch (err: any) {
      console.error(err);
      setError("An error occurred while loading users from the database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!confirm(`Are you sure you want to change this user's role to "${newRole}"?`)) return;

    try {
      setActionLoadingId(userId);
      await updateUserRole(userId, newRole as "USER" | "ADMIN");
      
      // Optimistic UI update
      setUsers((prevUsers) =>
        prevUsers.map((u) => (String(u.id) === userId ? { ...u, role: newRole as "USER" | "ADMIN" } : u))
      );
    } catch (err) {
      alert("Could not update user role. Please try again.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

    try {
      setActionLoadingId(userId);
      await deleteUser(userId);
      
      // Remove deleted item from modern state instantly
      setUsers((prevUsers) => prevUsers.filter((u) => String(u.id) !== userId));
    } catch (err) {
      alert("Could not delete user. Please try again.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Assign classes dynamically based on roles
  const getRoleBadgeClass = (role: string) => {
    switch (role.toUpperCase()) {
      case "ADMIN":
        return "bg-rose-500/10 text-rose-500 border border-rose-500/20";
      case "MODERATOR":
        return "bg-purple-500/10 text-purple-500 border border-purple-500/20";
      default:
        return "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";
    }
  };

  return (
    <SiteShell>
      <div className="mb-6">
        <Link 
          href="/admin" 
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-accent)] hover:opacity-80 transition-opacity"
        >
          <span className="text-base">←</span> Back to Dashboard
        </Link>
      </div>

      <PageHeader
        title="User Management"
        subtitle="Manage active platform users, change their roles, or remove them directly from the database."
      />

      <div className="space-y-6 mt-8">
        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            {error}
          </div>
        )}

        <Panel>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--line)] bg-[var(--color-background)]/50 text-xs uppercase font-bold tracking-wider text-[var(--color-muted)]">
                  <th className="py-4 px-6">ID / Account</th>
                  <th className="py-4 px-6">User Details</th>
                  <th className="py-4 px-6">Current Role</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)] text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-[var(--color-muted)] font-medium">
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-2 border-t-transparent border-[var(--color-accent)] rounded-full animate-spin"></div>
                        Loading database...
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-[var(--color-muted)] font-medium">
                      No user records found in the system.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-[var(--color-background)]/40 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-mono text-xs font-semibold text-[var(--color-muted)] bg-[var(--color-background)] px-2 py-1 rounded inline-block max-w-[120px] truncate">
                          {user.id}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-[var(--color-ink)] text-base">
                          {user.name || "No Username"}
                        </div>
                        <div className="text-xs text-[var(--color-muted)] font-medium mt-0.5">
                          {user.email}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold tracking-wide uppercase ${getRoleBadgeClass(user.role || "")}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-3">
                          {/* Role Selection */}
                          <select
                            disabled={actionLoadingId === String(user.id)}
                            value={user.role}
                            onChange={(e) => handleRoleChange(String(user.id), e.target.value)}
                            className="bg-[var(--color-background)] border border-[var(--line)] text-xs font-medium rounded-lg px-3 py-1.5 text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)] disabled:opacity-50 transition-all cursor-pointer"
                          >
                            <option value="USER">User</option>
                            <option value="MODERATOR">Moderator</option>
                            <option value="ADMIN">Admin</option>
                          </select>

                          {/* Delete Button */}
                          <button
                            disabled={actionLoadingId === String(user.id)}
                            onClick={() => handleDeleteUser(String(user.id))}
                            className="px-3 py-1.5 text-xs font-bold rounded-lg text-rose-500 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all disabled:opacity-50"
                          >
                            {actionLoadingId === String(user.id) ? "Please wait..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* DYNAMIC PAGINATION PANEL */}
          {!loading && totalPages > 1 && (
            <div className="p-4 bg-[var(--color-background)]/30 flex items-center justify-between border-t border-[var(--line)]">
              <span className="text-xs font-medium text-[var(--color-muted)]">
                Page <strong className="text-[var(--color-ink)]">{currentPage + 1}</strong> of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                  disabled={currentPage === 0}
                  className="px-4 py-1.5 text-xs font-semibold border border-[var(--line)] rounded-lg hover:bg-[var(--color-background)] text-[var(--color-ink)] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
                  disabled={currentPage >= totalPages - 1}
                  className="px-4 py-1.5 text-xs font-semibold border border-[var(--line)] rounded-lg hover:bg-[var(--color-background)] text-[var(--color-ink)] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </Panel>
      </div>
    </SiteShell>
  );
}