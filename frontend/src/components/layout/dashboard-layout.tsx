'use client';

/**
 * Authenticated User Dashboard Layout Shell
 * Provides consistent navigation, breadcrumbs, user status, and route protection.
 */

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RouteGuard } from '@/lib/auth/route-guard';
import { useAuth } from '@/lib/auth/use-auth';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Container } from '@/components/ui/container';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  Calculator,
  History,
  BarChart3,
  Bookmark,
  Settings,
  Shield,
} from 'lucide-react';

const DASHBOARD_NAV = [
  { href: '/dashboard', label: 'Portfolio Overview', icon: LayoutDashboard },
  { href: '/predict', label: 'Valuation Studio', icon: Calculator },
  { href: '/predictions', label: 'Valuation History', icon: History },
  { href: '/analytics', label: 'Activity Analytics', icon: BarChart3 },
  { href: '/properties', label: 'Saved Properties', icon: Bookmark },
  { href: '/settings', label: 'Account Settings', icon: Settings },
];

export function DashboardLayout({
  children,
  title,
  subtitle,
  action,
  requireAuth = true,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  requireAuth?: boolean;
}) {
  const pathname = usePathname();
  const { user, isAdmin } = useAuth();

  const shell = (
    <div className="flex min-h-screen flex-col bg-background text-text transition-colors">
      <Header />

        <div className="border-b border-border bg-surface-raised/40">
          <Container className="py-6 sm:py-8 space-y-6">
            {/* Top Bar with Title, User Info, and Optional CTA */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <h1 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-text">
                    {title}
                  </h1>
                  {isAdmin && (
                    <Link href="/admin/dashboard">
                      <Badge variant="outline" className="gap-1 border-primary/40 text-primary text-[10px]">
                        <Shield className="w-3 h-3" />
                        <span>Admin Portal</span>
                      </Badge>
                    </Link>
                  )}
                </div>
                {subtitle && <p className="text-xs sm:text-sm text-text-muted">{subtitle}</p>}
              </div>

              {action && <div className="shrink-0">{action}</div>}
            </div>

            {/* Dashboard Secondary Navigation Tabs */}
            <nav className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-t border-border/60 pt-4">
              {DASHBOARD_NAV.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus ${
                      isActive
                        ? 'bg-surface text-text shadow-xs border border-border/80'
                        : 'text-text-muted hover:text-text hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </Container>
        </div>

        {/* Content Body */}
        <main className="flex-1 py-8 sm:py-12">
          <Container>{children}</Container>
        </main>

        <Footer />
      </div>
    );

  if (requireAuth) {
    return <RouteGuard>{shell}</RouteGuard>;
  }

  return shell;
}
