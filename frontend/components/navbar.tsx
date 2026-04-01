"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Zap, ChevronDown, Menu, X, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { removeToken, getToken, getProfile } from "@/lib/auth";

const NAV_LINKS = [
  { label: "Chat Hub", href: "/hub" },
  { label: "Marketplace", href: "/marketplace" },
  { label: "Discover New", href: "/discover" },
  { label: "Agents", href: "/agents" },
] as const;

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Spanish", flag: "🇪🇸" },
  { code: "fr", label: "French", flag: "🇫🇷" },
  { code: "de", label: "German", flag: "🇩🇪" },
  { code: "ja", label: "Japanese", flag: "🇯🇵" },
  { code: "ar", label: "Arabic", flag: "🇸🇦" },
] as const;

type LanguageCode = (typeof LANGUAGES)[number]["code"];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [userName, setUserName] = useState('');
  const [selectedLang, setSelectedLang] = useState<LanguageCode>("en");
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentLang = LANGUAGES.find((l) => l.code === selectedLang) ?? LANGUAGES[0];

  useEffect(() => {
    async function checkAuth() {
      const token = getToken()
      if (!token) {
        setAuthed(false)
        setUserName('')
        return
      }
      setAuthed(true)
      // Try to get real profile, fall back to cached localStorage data
      try {
        const user = await getProfile()
        setUserName(user.name)
        // Update localStorage cache
        localStorage.setItem('nexusai_user', JSON.stringify(user))
      } catch {
        // Backend might be down — use cached data
        const userStr = localStorage.getItem('nexusai_user')
        if (userStr) {
          try {
            const u = JSON.parse(userStr) as { name: string }
            setUserName(u.name)
          } catch { /* ignore */ }
        }
      }
    }
    void checkAuth()
    window.addEventListener('storage', () => void checkAuth())
    return () => window.removeEventListener('storage', () => void checkAuth())
  }, []);

  function handleSignOut() {
    removeToken()
    localStorage.removeItem('nexusai_user');
    setAuthed(false);
    setUserName('');
    router.push('/');
  }

  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800">
      <nav className="h-14 max-w-screen-xl mx-auto px-4 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-1.5 shrink-0 text-slate-100 font-semibold text-lg hover:opacity-90 transition-opacity"
        >
          <Zap className="h-5 w-5 text-blue-500" />
          <span>NexusAI</span>
        </Link>

        {/* Desktop Nav links */}
        <ul className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ label, href }) => {
            const isActive = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium transition-colors inline-block",
                    isActive
                      ? "text-slate-100 border-b-2 border-blue-500"
                      : "text-slate-400 hover:text-slate-100 border-b-2 border-transparent"
                  )}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Right-side controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Desktop Language selector */}
          <div className="hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger
                className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="text-base leading-none">{currentLang.flag}</span>
                <span className="hidden sm:inline text-sm">{currentLang.label}</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-70" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="bg-slate-900 border border-slate-700 text-slate-100 min-w-[150px]"
                align="end"
              >
                {LANGUAGES.map(({ code, label, flag }) => (
                  <DropdownMenuItem
                    key={code}
                    className={cn(
                      "cursor-pointer gap-2 focus:bg-slate-800 focus:text-slate-100",
                      selectedLang === code && "text-blue-400"
                    )}
                    onClick={() => setSelectedLang(code)}
                  >
                    <span className="text-base">{flag}</span>
                    <span>{label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Desktop Auth controls */}
          <div className="hidden md:flex items-center gap-2">
            {authed ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 rounded-full bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-sm font-medium text-slate-100 transition-colors focus-visible:outline-none">
                  <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold text-white">
                    {userName ? userName[0].toUpperCase() : 'U'}
                  </div>
                  <span className="hidden sm:inline max-w-[100px] truncate">{userName || 'Account'}</span>
                  <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-slate-900 border border-slate-700 text-slate-100 min-w-[160px]" align="end">
                  <DropdownMenuItem
                    className="cursor-pointer gap-2 focus:bg-slate-800 focus:text-slate-100"
                    onClick={() => router.push('/auth/profile')}
                  >
                    <User className="h-4 w-4" /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer gap-2 focus:bg-slate-800 text-red-400 focus:text-red-400"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-800" asChild>
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white" asChild>
                  <Link href="/auth/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Hamburger button — mobile only */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden absolute top-14 left-0 right-0 bg-slate-900 border-b border-slate-800 z-40 p-4 flex flex-col gap-2">
          {/* Nav links */}
          {NAV_LINKS.map(({ label, href }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                  isActive
                    ? "bg-blue-500/10 text-blue-400"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                )}
              >
                {label}
              </Link>
            );
          })}

          {/* Language selector row */}
          <div className="pt-2 border-t border-slate-800">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 px-1">Language</p>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map(({ code, flag, label }) => (
                <button
                  key={code}
                  onClick={() => setSelectedLang(code)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors",
                    selectedLang === code
                      ? "bg-blue-500/20 text-blue-400 border border-blue-500/40"
                      : "bg-slate-800 text-slate-400 hover:text-white border border-transparent"
                  )}
                >
                  <span>{flag}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Auth Section */}
          <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
            {authed ? (
              <>
                <div className="flex items-center gap-2 px-3 py-2">
                  <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold text-white">
                    {userName ? userName[0].toUpperCase() : 'U'}
                  </div>
                  <span className="text-sm font-medium text-slate-100 truncate">{userName || 'Account'}</span>
                </div>
                <Button
                  variant="ghost"
                  className="justify-start text-slate-300 hover:text-white hover:bg-slate-800 gap-2"
                  onClick={() => { router.push('/auth/profile'); setMobileOpen(false); }}
                >
                  <User className="h-4 w-4" /> Profile
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start text-red-400 hover:text-red-300 hover:bg-slate-800 gap-2"
                  onClick={() => { handleSignOut(); setMobileOpen(false); }}
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="justify-start text-slate-300 hover:text-white hover:bg-slate-800"
                  asChild
                >
                  <Link href="/auth/login" onClick={() => setMobileOpen(false)}>
                    Sign In
                  </Link>
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-500 text-white"
                  asChild
                >
                  <Link href="/auth/register" onClick={() => setMobileOpen(false)}>
                    Get Started
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
