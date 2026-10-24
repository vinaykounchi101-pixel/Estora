'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Container } from '@/components/ui/container';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/use-auth';
import {
  Menu,
  X,
  Sparkles,
  User,
  LogOut,
  Settings,
  Shield,
  LayoutDashboard,
  Calculator,
  History,
} from 'lucide-react';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    await logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/85 backdrop-blur-md transition-colors">
      <Container className="flex h-[76px] items-center justify-between">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded-sm"
        >
          <span className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-text">
            ESTORA
          </span>
          <span className="hidden sm:inline-flex items-center text-[10px] font-sans font-medium tracking-widest uppercase text-text-muted/80 border-l border-border pl-3">
            Real Estate Intelligence
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-7">
          {isAuthenticated ? (
            <>
              <Link
                href="/dashboard"
                className={`nav-link-editorial text-sm font-sans transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded-sm ${
                  pathname === '/dashboard' ? 'text-text font-medium' : 'text-text-muted hover:text-text'
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/predict"
                className={`nav-link-editorial text-sm font-sans transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded-sm ${
                  pathname === '/predict' ? 'text-text font-medium' : 'text-text-muted hover:text-text'
                }`}
              >
                Valuation Studio
              </Link>
              <Link
                href="/predictions"
                className={`nav-link-editorial text-sm font-sans transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded-sm ${
                  pathname === '/predictions' ? 'text-text font-medium' : 'text-text-muted hover:text-text'
                }`}
              >
                History
              </Link>
              <Link
                href="/analytics"
                className={`nav-link-editorial text-sm font-sans transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded-sm ${
                  pathname === '/analytics' ? 'text-text font-medium' : 'text-text-muted hover:text-text'
                }`}
              >
                Analytics
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/#capabilities"
                className="nav-link-editorial text-sm font-sans text-text-muted hover:text-text transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded-sm"
              >
                Capabilities
              </Link>
              <Link
                href="/#how-it-works"
                className="nav-link-editorial text-sm font-sans text-text-muted hover:text-text transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded-sm"
              >
                How It Works
              </Link>
              <Link
                href="/methodology"
                className="nav-link-editorial text-sm font-sans text-text-muted hover:text-text transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded-sm"
              >
                Methodology
              </Link>
              <Link
                href="/about"
                className="nav-link-editorial text-sm font-sans text-text-muted hover:text-text transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded-sm"
              >
                About
              </Link>
            </>
          )}
        </nav>

        {/* Actions / User Menu */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-md border border-border bg-surface text-text hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus text-xs font-medium"
                aria-label="User account menu"
                aria-expanded={userMenuOpen}
              >
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-serif text-xs font-bold">
                  {user?.full_name ? user.full_name[0].toUpperCase() : user?.email[0].toUpperCase()}
                </div>
                <span className="hidden sm:inline-block max-w-[120px] truncate">
                  {user?.full_name || user?.email}
                </span>
              </button>

              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserMenuOpen(false)}
                    aria-hidden="true"
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-lg border border-border bg-surface p-2 shadow-xl z-50 text-xs space-y-1">
                    <div className="px-3 py-2 border-b border-border/80">
                      <p className="font-medium text-text truncate">{user?.full_name || 'Estora User'}</p>
                      <p className="text-[11px] text-text-muted truncate">{user?.email}</p>
                    </div>

                    <Link
                      href="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-text transition-colors"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-text-muted" />
                      <span>Portfolio Dashboard</span>
                    </Link>

                    <Link
                      href="/predict"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-text transition-colors"
                    >
                      <Calculator className="w-3.5 h-3.5 text-text-muted" />
                      <span>Valuation Studio</span>
                    </Link>

                    <Link
                      href="/predictions"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-text transition-colors"
                    >
                      <History className="w-3.5 h-3.5 text-text-muted" />
                      <span>Valuation History</span>
                    </Link>

                    <Link
                      href="/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-text transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5 text-text-muted" />
                      <span>Account Settings</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-md bg-primary/5 text-primary hover:bg-primary/10 transition-colors font-medium"
                      >
                        <Shield className="w-3.5 h-3.5" />
                        <span>Administrator Portal</span>
                      </Link>
                    )}

                    <div className="pt-1 border-t border-border/80">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="hidden sm:inline-flex">
                <Button size="sm" variant="ghost" className="text-xs">
                  Sign In
                </Button>
              </Link>
              <Link href="/predict">
                <Button size="sm" variant="primary" className="gap-1.5 shadow-sm text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-sage dark:text-[#B17D58]" />
                  <span>Valuation Studio</span>
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-full border border-border text-text hover:bg-black/5 dark:hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </Container>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-surface px-6 py-5 space-y-4">
          <nav className="flex flex-col space-y-3">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-text hover:text-primary transition-colors flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4 text-text-muted" />
                  <span>Portfolio Dashboard</span>
                </Link>
                <Link
                  href="/predict"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-text hover:text-primary transition-colors flex items-center gap-2"
                >
                  <Calculator className="w-4 h-4 text-text-muted" />
                  <span>Valuation Studio</span>
                </Link>
                <Link
                  href="/predictions"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-text hover:text-primary transition-colors flex items-center gap-2"
                >
                  <History className="w-4 h-4 text-text-muted" />
                  <span>Valuation History</span>
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-text hover:text-primary transition-colors flex items-center gap-2"
                >
                  <Settings className="w-4 h-4 text-text-muted" />
                  <span>Account Settings</span>
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-sm font-medium text-primary hover:underline flex items-center gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Administrator Portal</span>
                  </Link>
                )}
                <div className="pt-2 border-t border-border">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 text-sm text-red-600 dark:text-red-400 py-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/#capabilities"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-text-muted hover:text-text"
                >
                  Capabilities
                </Link>
                <Link
                  href="/methodology"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-text-muted hover:text-text"
                >
                  Methodology
                </Link>
                <Link
                  href="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-text-muted hover:text-text"
                >
                  About Estora
                </Link>
                <div className="pt-3 border-t border-border flex flex-col gap-2">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full justify-center">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="primary" size="sm" className="w-full justify-center">
                      Create an Account
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
