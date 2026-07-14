"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearAuthToken, getAuthRole, getAuthToken } from "@/lib/auth/session";
import { useEffect, useRef, useState } from "react";
import { Bell, User, LogOut, Settings, HelpCircle, Flag, Users, Award, Sun, Moon, ChevronDown } from "lucide-react";
import { RollText } from "@/components/ui/RollText";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [hasToken, setHasToken] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(true);

  // Use useEffect to prevent server/client mismatch during hydration
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasToken(Boolean(getAuthToken()));
    setRole(getAuthRole());

    const savedTheme = localStorage.getItem('theme');
    const prefersDark = savedTheme === 'dark' || (!savedTheme && true);
    setIsDark(prefersDark);
  }, [pathname]);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const [notifications, setNotifications] = useState([
    { id: 1, text: "A new event matching your interests 'Neon Startup Night' was created.", type: "info" },
    { id: 2, text: "Maya requested to join your group 'Focus builders'.", type: "request", group: "Focus builders", user: "Maya" }
  ]);

  function logout() {
    clearAuthToken();
    setHasToken(false);
    setRole(null);
    setShowProfile(false);
    router.push("/login");
  }

  const handleAccept = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    alert("Accepted join request!");
  };

  const handleReject = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    alert("Rejected join request!");
  };

  return (
    <main className="prototype-shell min-h-screen">
      <nav className="topbar">
        <Link className="brand-lockup" href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Loopin" />
          <span>Loopin</span>
        </Link>
        <div className="nav-links">
          <Link href="/" className={`group ${pathname === "/" ? "active" : ""}`}>
            <RollText text="Home" />
          </Link>
          <Link href="/events" className={`group ${pathname === "/events" ? "active" : ""}`}>
            <RollText text="Events" />
          </Link>
          <Link href="/activities" className={`group ${pathname === "/activities" ? "active" : ""}`}>
            <RollText text="Activities" />
          </Link>
          {role === "ADMIN" && (
            <Link href="/admin" className={`group ${pathname.startsWith("/admin") ? "active" : ""}`}>
              <RollText text="Admin" />
            </Link>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>

          <button
            className="icon-button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Notifications Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              className="icon-button"
              onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
              aria-label="Notifications"
            >
              <Bell size={18} />
              {notifications.length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  width: '8px',
                  height: '8px',
                  background: 'var(--orange)',
                  borderRadius: '50%'
                }} />
              )}
            </button>
            {showNotifications && (
              <div className="dropdown-menu notification-dropdown">
                <div className="dropdown-header">Notifications</div>
                {notifications.length === 0 ? (
                  <div className="notification-item">No new notifications</div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className="notification-item">
                      <p className="mb-2">{n.text}</p>
                      {n.type === "request" && (
                        <div className="notification-actions">
                          <button className="notification-btn-accept" onClick={() => handleAccept(n.id)}>Accept</button>
                          <button className="notification-btn-reject" onClick={() => handleReject(n.id)}>Reject</button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              className="icon-button"
              onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
              aria-label="Profile menu"
            >
              <User size={18} />
            </button>
            {showProfile && (
              <div className="dropdown-menu">
                {hasToken ? (
                  <>
                    <div className="dropdown-header">
                      Role: {role || "USER"}
                    </div>
                    <button className="dropdown-item group" onClick={() => { router.push("/profile"); setShowProfile(false); }}>
                      <User size={16} /> <RollText text="View Profile" />
                    </button>
                    <button className="dropdown-item group" onClick={() => { router.push("/profile/my-badges"); setShowProfile(false); }}>
                      <Award size={16} /> <RollText text="View Badges" />
                    </button>
                    <button className="dropdown-item group" onClick={() => { router.push("/profile#groups"); setShowProfile(false); }}>
                      <Users size={16} /> <RollText text="Groups" />
                    </button>
                    <button className="dropdown-item group" onClick={() => { router.push("/profile#settings"); setShowProfile(false); }}>
                      <Settings size={16} /> <RollText text="Settings" />
                    </button>
                    <button className="dropdown-item group" onClick={() => { router.push("/help"); setShowProfile(false); }}>
                      <HelpCircle size={16} /> <RollText text="Help" />
                    </button>
                    <button className="dropdown-item group" onClick={() => { router.push("/report"); setShowProfile(false); }}>
                      <Flag size={16} /> <RollText text="Report" />
                    </button>
                    <button className="dropdown-item group" onClick={logout}>
                      <LogOut size={16} /> <RollText text="Log out" />
                    </button>
                  </>
                ) : (
                  <>
                    <button className="dropdown-item group" onClick={() => { router.push("/login"); setShowProfile(false); }}>
                      <RollText text="Log in" />
                    </button>
                    <button className="dropdown-item group" onClick={() => { router.push("/register"); setShowProfile(false); }}>
                      <RollText text="Register" />
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>
      <div className="main-content-wrapper pt-2 pb-8">{children}</div>
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
    <div className="mb-6 flex flex-col justify-between gap-4 border-b border-[var(--line)] pb-6 md:flex-row md:items-end">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--color-ink)]">{title}</h1>
        {subtitle ? <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Panel({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <section className="rounded-lg border border-[var(--line)] bg-[color-mix(in_srgb,var(--color-ink)_4%,transparent)] p-5">
      {title ? <h2 className="mb-4 text-lg font-semibold text-[var(--color-ink)]">{title}</h2> : null}
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
    <label className="grid gap-1 text-sm text-[var(--muted)]">
      {label}
      <input
        className="h-10 rounded-md border border-[var(--line)] bg-[var(--color-paper)] px-3 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-teal)] transition-colors"
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
    <label className="grid gap-1 text-sm text-[var(--muted)]">
      {label}
      <textarea
        className="min-h-28 rounded-md border border-[var(--line)] bg-[var(--color-paper)] p-3 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-teal)] transition-colors"
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
  const [open, setOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement | null>(null);

  function formatOptionLabel(option: string) {
    if (option === "") return "Any";
    if (option === "true") return "Free";
    if (option === "false") return "Paid";

    return option
      .toLowerCase()
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!selectRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = formatOptionLabel(value);

  return (
    <div className="custom-select-field" ref={selectRef}>
      <span>{label}</span>
      <button
        className="custom-select-trigger"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
        }}
      >
        <strong>{selectedLabel}</strong>
        <ChevronDown size={16} />
      </button>
      {open ? (
        <div className="custom-select-menu" role="listbox">
          {options.map((option) => {
            const selected = option === value;
            return (
              <button
                className={selected ? "is-selected" : ""}
                key={option}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
              >
                {formatOptionLabel(option)}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-[var(--line)] bg-[color-mix(in_srgb,var(--color-ink)_3%,transparent)] p-6 text-sm text-[var(--muted)]">
      {children}
    </div>
  );
}

export function ErrorMessage({ message }: { message: string }) {
  if (!message) return null;
  return <p className="rounded-md border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-500 dark:text-red-200">{message}</p>;
}
