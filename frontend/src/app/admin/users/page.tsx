'use client';

/**
 * Platform User Registry (Admin Only)
 * Retrieves paginated list of all platform users via GET /api/v1/admin/users.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth/use-auth';
import { apiClient } from '@/lib/api/client';
import { UserRead } from '@/types/auth';
import { AdminLayout } from '@/components/layout/admin-layout';
import { TableContainer, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Users, ChevronLeft, ChevronRight, AlertTriangle, RotateCcw, CheckCircle2, Shield } from 'lucide-react';

const PAGE_SIZE = 15;

export default function AdminUsersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<UserRead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const fetchUsers = useCallback(async (pageIndex: number) => {
    if (!token) return;

    setIsLoading(true);
    setError(null);
    try {
      const skip = pageIndex * PAGE_SIZE;
      const data = await apiClient.admin.listUsers(
        { skip, limit: PAGE_SIZE + 1 },
        { authToken: token }
      );

      if (data.length > PAGE_SIZE) {
        setHasMore(true);
        setUsers(data.slice(0, PAGE_SIZE));
      } else {
        setHasMore(false);
        setUsers(data);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to retrieve user registry.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUsers(page);
  }, [fetchUsers, page]);

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <AdminLayout
      title="User Registry"
      subtitle="Complete list of registered platform accounts, role tiers, and authentication status."
    >
      <div className="space-y-6">
        {error && (
          <div
            role="alert"
            className="p-4 rounded-md border border-red-500/30 bg-red-500/10 text-xs text-red-600 dark:text-red-400 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchUsers(page)}
              className="gap-1.5 text-xs border-red-500/40"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-7 h-7 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <span className="text-xs uppercase tracking-widest text-text-muted font-medium">
              Loading Registered Accounts...
            </span>
          </div>
        ) : users.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No Users Registered"
            description="The platform database does not currently have any registered user accounts."
          />
        ) : (
          <div className="space-y-4">
            <TableContainer>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email Address</TableHead>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Role Tier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead>Account UUID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium text-text">
                        {u.email}
                      </TableCell>
                      <TableCell className="text-xs text-text-muted">
                        {u.full_name || '—'}
                      </TableCell>
                      <TableCell>
                        {u.role === 'admin' ? (
                          <Badge variant="outline" className="gap-1 text-[10px] border-primary text-primary">
                            <Shield className="w-2.5 h-2.5" />
                            <span>Administrator</span>
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] text-text-muted border-border">
                            Authenticated User
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {u.is_active ? (
                          <span className="inline-flex items-center gap-1.5 text-xs text-[#47765A] dark:text-[#C4CEB8]">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="text-xs text-text-muted">Inactive</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-text-muted font-mono whitespace-nowrap">
                        {formatDate(u.created_at)}
                      </TableCell>
                      <TableCell className="font-mono text-[11px] text-text-muted select-all">
                        {u.id}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-text-muted">Page {page + 1}</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0 || isLoading}
                  className="gap-1 text-xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!hasMore || isLoading}
                  className="gap-1 text-xs"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
