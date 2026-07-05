"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearAuthToken, getAuthRole, getAuthToken } from "@/lib/auth/session";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" },
  { href: "/profile", label: "Profile" },
  { href: "/admin", label: "Admin" },
];

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const hasToken = Boolean(getAuthToken());
  const role = getAuthRole();

  function logout() {
    clearAuthToken();
    router.push("/login");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <Link className="text-xl font-bold tracking-normal text-white" href="/">
            Loopin
          </Link>
          <nav className="flex flex-wrap items-center gap-1">
            {navItems.map((item) => (
              <Link
                className={`rounded-md px-3 py-2 text-sm font-medium ${
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                    ? "bg-cyan-400 text-slate-950"
                    : "text-slate-300 hover:bg-white/10"
                }`}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {role ? <span className="text-xs uppercase text-slate-400">{role}</span> : null}
            {hasToken ? (
              <button className="secondary-button" onClick={logout} type="button">
                Logout
              </button>
            ) : (
              <Link className="primary-link" href="/login">
                Login
              </Link>
            )}
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
    </main>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 border-b border-white/10 pb-6 md:flex-row md:items-end">
      <div>
        <h1 className="text-3xl font-semibold text-white">{title}</h1>
        {subtitle ? <p className="mt-2 max-w-2xl text-sm text-slate-400">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Panel({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
      {title ? <h2 className="mb-4 text-lg font-semibold text-white">{title}</h2> : null}
      {children}
    </section>
  );
}

export function Input({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-1 text-sm text-slate-300">
      {label}
      <input
        className="h-10 rounded-md border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none focus:border-cyan-400"
        required={required}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

export function Textarea({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label className="grid gap-1 text-sm text-slate-300">
      {label}
      <textarea
        className="min-h-28 rounded-md border border-white/10 bg-slate-950 p-3 text-sm text-white outline-none focus:border-cyan-400"
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

export function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1 text-sm text-slate-300">
      {label}
      <select
        className="h-10 rounded-md border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none focus:border-cyan-400"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option || "Any"}
          </option>
        ))}
      </select>
    </label>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-white/15 bg-slate-900/40 p-6 text-sm text-slate-400">
      {children}
    </div>
  );
}

export function ErrorMessage({ message }: { message: string }) {
  if (!message) return null;
  return <p className="rounded-md border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">{message}</p>;
}
