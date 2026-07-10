"use client";

import { useEffect, useState } from "react";
import { deleteAdminUser, getAdminUsers, updateAdminUserRole, UserItem } from "@/lib/api/loopin";
import { EmptyState, ErrorMessage, PageHeader, Panel, Select, SiteShell } from "../../../site";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [error, setError] = useState("");

  async function loadUsers() {
    setError("");
    try {
      setUsers(await getAdminUsers());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load users.");
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadUsers();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function changeRole(userId: number, role: string) {
    try {
      await updateAdminUserRole(String(userId), role);
      await loadUsers();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update role.");
    }
  }

  async function deleteUser(userId: number) {
    try {
      await deleteAdminUser(String(userId));
      await loadUsers();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not delete user.");
    }
  }

  return (
    <SiteShell>
      <PageHeader title="Admin users" />
      <ErrorMessage message={error} />
      <Panel>
        {users.length ? (
          <div className="grid gap-3">
            {users.map((user) => (
              <article className="grid gap-3 rounded-md border border-white/10 bg-surface p-4 md:grid-cols-[1fr_180px_auto]" key={user.id}>
                <div>
                  <p className="font-semibold text-white">{user.name ?? user.email}</p>
                  <p className="text-sm text-slate-400">{user.email}</p>
                </div>
                <Select label="Role" value={user.role} options={["USER", "ADMIN"]} onChange={(role) => void changeRole(user.id, role)} />
                <button className="secondary-button self-end" onClick={() => void deleteUser(user.id)} type="button">Delete</button>
              </article>
            ))}
          </div>
        ) : <EmptyState>No users loaded.</EmptyState>}
      </Panel>
    </SiteShell>
  );
}
