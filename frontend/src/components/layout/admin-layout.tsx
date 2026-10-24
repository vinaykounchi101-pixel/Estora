'use client';

/**
 * Platform Administrator Portal Layout Shell
 * Strictly protected for the 'admin' role via RouteGuard.
 */

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RouteGuard } from '@/lib/auth/route-guard';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Container } from '@/components/ui/container';
import { Badge } from '@/components/ui/badge';
import {
  ShieldAlert,
  Users,
  Database,
  Cpu,
  FileSpreadsheet,
  FileText,
  Activity,
  ArrowLeft,
} from 'lucide-react';

const ADMIN_NAV = [
  { href: '/admin/dashboard', label: 'System Overview', icon: Activity },
  { href: '/admin/users', label: 'User Registry', icon: Users },
  { href: '/admin/predictions', label: 'Valuation Audit Log', icon: Database },
  { href: '/admin/models', label: 'Model Registry', icon: Cpu },
  { href: '/admin/datasets', label: 'Dataset Provenance', icon: FileSpreadsheet },
  { href: '/admin/reports', label: 'Evaluation Reports', icon: FileText },
];

export function AdminLayout({
  children,
  title,
  subtitle,
  action,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <RouteGuard requireAdmin>
      <div className="flex min-h-screen flex-col bg-background text-text transition-colors">
        <Header />

        <div className="border-b border-border bg-surface-raised/40">
          <Container className="py-6 sm:py-8 space-y-6">
            {/* Admin Header with Breadcrumbs and Role Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <Link href="/dashboard" className="text-xs text-text-muted hover:text-text flex items-center gap-1 transition-colors">
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>User Dashboard</span>
                  </Link>
                  <span className="text-border">/</span>
                  <Badge variant="outline" className="gap-1 border-primary text-primary text-[10px]">
                    <ShieldAlert className="w-3 h-3" />
                    <span>Administrator Mode</span>
                  </Badge>
                </div>
                <h1 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-text">
                  {title}
                </h1>
                {subtitle && <p className="text-xs sm:text-sm text-text-muted">{subtitle}</p>}
              </div>

              {action && <div className="shrink-0">{action}</div>}
            </div>

            {/* Admin Navigation Tabs */}
            <nav className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-t border-border/60 pt-4">
              {ADMIN_NAV.map((item) => {
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
    </RouteGuard>
  );
}
