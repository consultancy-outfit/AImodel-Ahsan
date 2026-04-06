"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User, Mail, Shield, Calendar, CheckCircle, Loader2,
  Settings, LogOut, Sparkles, Activity,
} from "lucide-react";
import { getProfile, getToken, removeToken, type AuthUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/auth/login");
      return;
    }
    getProfile()
      .then(setUser)
      .catch(() => setError("Failed to load profile. Please try again."))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center animate-pulse">
            <Loader2 className="w-6 h-6 animate-spin text-white" />
          </div>
          <p className="text-sm text-slate-500">Loading your profile…</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-3 text-center px-4">
        <span className="text-5xl">⚠️</span>
        <p className="text-slate-300 font-medium">{error ?? "Profile not found."}</p>
        <button
          onClick={() => router.push("/auth/login")}
          className="mt-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
        >
          Go to login
        </button>
      </div>
    );
  }

  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const joinDate = (user as AuthUser & { createdAt?: string }).createdAt
    ? new Date((user as AuthUser & { createdAt?: string }).createdAt!).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const isAdmin = user.role === "admin";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* ── Hero gradient bg ── */}
      <div className="relative h-52 bg-gradient-to-br from-purple-900/40 via-slate-900 to-blue-900/30 overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-10 -left-10 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 right-10 w-64 h-64 bg-blue-600/15 rounded-full blur-3xl" />
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <button
            onClick={() => { removeToken(); router.push("/auth/login"); }}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-400 bg-slate-800/60 hover:bg-red-500/10 border border-slate-700 hover:border-red-500/30 px-3 py-1.5 rounded-full transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4">
        {/* ── Avatar overlapping hero ── */}
        <div className="-mt-16 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div className="flex items-end gap-5">
            {/* Avatar */}
            <div className="relative">
              <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-4xl font-bold text-white ring-4 ring-slate-950 shadow-2xl shadow-purple-900/40">
                {initials}
              </div>
              {user.isActive && (
                <span className="absolute -bottom-1.5 -right-1.5 w-5 h-5 bg-green-400 rounded-full ring-2 ring-slate-950 flex items-center justify-center">
                  <span className="w-2 h-2 bg-green-900 rounded-full" />
                </span>
              )}
            </div>
            {/* Name + badges */}
            <div className="pb-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-2xl font-bold text-white">{user.name}</h1>
                {isAdmin && (
                  <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 uppercase tracking-wider">
                    <Sparkles className="w-2.5 h-2.5" />
                    Admin
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-400">{user.email}</p>
            </div>
          </div>

        </div>

        {/* ── Quick stat chips ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          <StatCard
            icon={<Shield className="w-4 h-4 text-purple-400" />}
            label="Role"
            value={<span className="capitalize">{user.role}</span>}
            accent="purple"
          />
          <StatCard
            icon={<Activity className="w-4 h-4 text-green-400" />}
            label="Status"
            value={user.isActive ? "Active" : "Inactive"}
            accent={user.isActive ? "green" : "red"}
          />
          {joinDate && (
            <StatCard
              icon={<Calendar className="w-4 h-4 text-blue-400" />}
              label="Joined"
              value={joinDate}
              accent="blue"
            />
          )}
        </div>

        {/* ── Details card ── */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden mb-8 shadow-xl shadow-black/30">
          {/* Card header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-800/80">
            <div className="w-1 h-4 rounded-full bg-gradient-to-b from-purple-400 to-blue-500" />
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Account Information</h2>
          </div>

          <div className="divide-y divide-slate-800/60">
            <DetailRow
              icon={<User className="w-4 h-4" />}
              label="Full Name"
              value={user.name}
              iconColor="text-purple-400"
              iconBg="bg-purple-500/10"
            />
            <DetailRow
              icon={<Mail className="w-4 h-4" />}
              label="Email Address"
              value={user.email}
              iconColor="text-blue-400"
              iconBg="bg-blue-500/10"
            />
            <DetailRow
              icon={<Shield className="w-4 h-4" />}
              label="Role"
              value={
                <span className={cn(
                  "text-xs font-semibold px-2.5 py-1 rounded-full capitalize",
                  isAdmin
                    ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                    : "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                )}>
                  {user.role}
                </span>
              }
              iconColor="text-orange-400"
              iconBg="bg-orange-500/10"
            />
            <DetailRow
              icon={<CheckCircle className="w-4 h-4" />}
              label="Account Status"
              value={
                <span className={cn(
                  "flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full",
                  user.isActive
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-red-500/20 text-red-400 border border-red-500/30"
                )}>
                  <span className={cn("w-1.5 h-1.5 rounded-full", user.isActive ? "bg-green-400 animate-pulse" : "bg-red-400")} />
                  {user.isActive ? "Active" : "Inactive"}
                </span>
              }
              iconColor="text-green-400"
              iconBg="bg-green-500/10"
            />
            {joinDate && (
              <DetailRow
                icon={<Calendar className="w-4 h-4" />}
                label="Member Since"
                value={joinDate}
                iconColor="text-sky-400"
                iconBg="bg-sky-500/10"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Stat Card ──────────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  accent: "purple" | "green" | "red" | "blue";
}) {
  const border: Record<string, string> = {
    purple: "border-purple-500/20 hover:border-purple-500/40",
    green:  "border-green-500/20 hover:border-green-500/40",
    red:    "border-red-500/20 hover:border-red-500/40",
    blue:   "border-blue-500/20 hover:border-blue-500/40",
  };
  return (
    <div className={cn(
      "bg-slate-900/70 border rounded-xl px-4 py-3 transition-colors",
      border[accent]
    )}>
      <div className="flex items-center gap-1.5 mb-1.5">{icon}
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-sm font-semibold text-slate-200">{value}</p>
    </div>
  );
}

// ── Detail Row ─────────────────────────────────────────────────────────────────

function DetailRow({
  icon,
  label,
  value,
  iconColor,
  iconBg,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  iconColor: string;
  iconBg: string;
}) {
  return (
    <div className="flex items-center gap-4 px-6 py-4 group hover:bg-slate-800/30 transition-colors">
      <span className={cn("shrink-0 w-8 h-8 rounded-lg flex items-center justify-center", iconBg, iconColor)}>
        {icon}
      </span>
      <span className="text-sm text-slate-500 w-36 shrink-0">{label}</span>
      <span className="text-sm text-slate-200 font-medium">{value}</span>
    </div>
  );
}
