import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  CalendarDays,
  MapPin,
  Users,
} from "lucide-react";

import { GoogleIdentityButton } from "./GoogleIdentityButton";

type AuthMode = "login" | "register";

export function GoogleAuthPage({
  mode,
  warning,
}: {
  mode: AuthMode;
  warning?: string;
}) {
  const isRegister = mode === "register";

  const accentTextClass = isRegister
    ? "text-[#FF8A3D]"
    : "text-[#FF4FA3]";

  const accentGlowClass = isRegister
    ? "bg-[#FF8A3D]/10"
    : "bg-[#FF4FA3]/10";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070A0F] px-4 py-8 text-white">
      <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-purple-600/15 blur-[140px]" />

      <div
        className={`absolute bottom-0 right-1/4 h-96 w-96 rounded-full blur-[140px] ${accentGlowClass}`}
      />

      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.035] shadow-2xl backdrop-blur-xl lg:grid-cols-[1.2fr_0.8fr]">
        <section className="hidden border-r border-white/10 p-12 lg:flex lg:flex-col lg:justify-between">
          <Link
            href="/"
            className="flex items-center gap-4 text-2xl font-extrabold tracking-tight"
          >
            <Image
              src="/logo.png"
              alt="Loopin"
              width={64}
              height={64}
              className="rounded-lg"
              priority
            />

            <span className="text-3xl font-black tracking-tight">
              Loopin
            </span>
          </Link>

          <div className="max-w-xl">
            <p
              className={`mb-4 text-sm font-semibold uppercase tracking-[0.25em] ${accentTextClass}`}
            >
              Go together
            </p>

            <h1 className="text-5xl font-black leading-tight">
              Find events.
              <br />
              Join groups.
              <br />
              Meet your people.
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-slate-400">
              Discover local events and coordinate with people who share
              your interests.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Feature
              icon={<CalendarDays size={18} />}
              label="Events"
              accentClass={accentTextClass}
            />

            <Feature
              icon={<Users size={18} />}
              label="Groups"
              accentClass={accentTextClass}
            />

            <Feature
              icon={<MapPin size={18} />}
              label="Nearby"
              accentClass={accentTextClass}
            />
          </div>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-sm">
            <Link
              href="/"
              className="mb-10 flex items-center gap-3 text-2xl font-extrabold tracking-tight lg:hidden"
            >
              <Image
                src="/logo.png"
                alt="Loopin"
                width={48}
                height={48}
                className="rounded-lg"
                priority
              />

              <span>Loopin</span>
            </Link>

            <p
              className={`text-sm font-semibold ${accentTextClass}`}
            >
              {isRegister
                ? "Create your account"
                : "Welcome back"}
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              {isRegister
                ? "Join Loopin"
                : "Sign in to Loopin"}
            </h2>

            <p className="mb-8 mt-3 text-sm leading-6 text-slate-400">
              {isRegister
                ? "Create your profile with your Google account and start discovering local events."
                : "Continue with your Google account to access your events, groups and messages."}
            </p>

            {warning ? (
              <p className="mb-5 rounded-xl border border-[#FF4FA3]/35 bg-[#FF4FA3]/10 p-3 text-sm text-pink-100">
                {warning}
              </p>
            ) : null}

            <GoogleIdentityButton mode={mode} />

            <p className="mt-6 text-center text-sm text-slate-400">
              {isRegister
                ? "Already have an account?"
                : "New to Loopin?"}{" "}

              <Link
                className={`font-semibold transition-opacity hover:opacity-80 hover:underline ${accentTextClass}`}
                href={isRegister ? "/login" : "/register"}
              >
                {isRegister
                  ? "Sign in"
                  : "Create account"}
              </Link>
            </p>

            <p className="mt-8 text-center text-xs leading-5 text-slate-500">
              By continuing, you agree to Loopin&apos;s Terms
              of Service and Privacy Policy.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function Feature({
  icon,
  label,
  accentClass,
}: {
  icon: ReactNode;
  label: string;
  accentClass: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-slate-300 transition-colors hover:border-white/20 hover:bg-white/[0.07]">
      <span className={accentClass}>
        {icon}
      </span>

      {label}
    </div>
  );
}
