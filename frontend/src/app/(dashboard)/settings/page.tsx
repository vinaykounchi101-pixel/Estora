'use client';

/**
 * Account Settings Page
 * Updates profile credentials and metadata via GET/PATCH /api/v1/users/me.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/use-auth';
import { useToast } from '@/components/ui/toast';
import { apiClient } from '@/lib/api/client';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FormField } from '@/components/ui/form-field';
import {
  User,
  Mail,
  Lock,
  Shield,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Save,
} from 'lucide-react';

export default function SettingsPage() {
  const { user, token, updateUser } = useAuth();
  const toast = useToast();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (fullName && fullName.length > 100) {
      errors.fullName = 'Full name must not exceed 100 characters.';
    }

    if (!email.trim()) {
      errors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Enter a valid email address.';
    }

    if (newPassword) {
      if (newPassword.length < 8) {
        errors.newPassword = 'New password must be at least 8 characters.';
      } else if (newPassword.length > 128) {
        errors.newPassword = 'New password must not exceed 128 characters.';
      }

      if (newPassword !== confirmPassword) {
        errors.confirmPassword = 'Passwords do not match.';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validate() || !token) return;

    setIsSaving(true);
    try {
      const updatePayload: { full_name?: string; email?: string; password?: string } = {};

      if (fullName.trim() !== (user?.full_name || '')) {
        updatePayload.full_name = fullName.trim() || undefined;
      }

      if (email.trim().toLowerCase() !== (user?.email || '').toLowerCase()) {
        updatePayload.email = email.trim();
      }

      if (newPassword) {
        updatePayload.password = newPassword;
      }

      if (Object.keys(updatePayload).length === 0) {
        toast.info('No changes detected.');
        setIsSaving(false);
        return;
      }

      const updated = await apiClient.users.updateMe(updatePayload, { authToken: token });
      updateUser(updated);
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Account profile updated successfully.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile settings.';
      setGeneralError(msg);
      toast.error('Profile update failed.');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '—';
    try {
      return new Date(isoString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <DashboardLayout
      title="Account Settings"
      subtitle="Manage your profile credentials, display name, and session metadata."
    >
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Profile Details Form */}
        <Card className="border border-border bg-surface p-6 sm:p-8 shadow-xs">
          <CardHeader className="p-0 mb-6 border-b border-border/80 pb-4">
            <CardTitle className="font-serif text-xl font-medium text-text">
              Profile Information
            </CardTitle>
            <p className="text-xs text-text-muted">
              Update your registered account credentials and display name.
            </p>
          </CardHeader>

          <CardContent className="p-0 space-y-6">
            {generalError && (
              <div
                role="alert"
                className="p-3.5 rounded-md border border-red-500/30 bg-red-500/10 text-xs text-red-600 dark:text-red-400 flex items-start gap-2.5 leading-relaxed"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{generalError}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-5" noValidate>
              <FormField
                label="Full Display Name"
                htmlFor="profile-name"
                error={fieldErrors.fullName}
                hint="Max 100 characters"
              >
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                  <Input
                    id="profile-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-9.5 text-xs"
                    disabled={isSaving}
                  />
                </div>
              </FormField>

              <FormField
                label="Email Address"
                htmlFor="profile-email"
                error={fieldErrors.email}
                required
              >
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                  <Input
                    id="profile-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9.5 text-xs"
                    disabled={isSaving}
                  />
                </div>
              </FormField>

              <div className="pt-4 border-t border-border/80 space-y-4">
                <div className="space-y-1">
                  <h4 className="font-serif text-sm font-medium text-text">Change Password</h4>
                  <p className="text-[11px] text-text-muted">
                    Leave blank if you do not wish to update your login password.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    label="New Password"
                    htmlFor="profile-password"
                    error={fieldErrors.newPassword}
                    hint="Min 8 characters"
                  >
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                      <Input
                        id="profile-password"
                        type="password"
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="pl-9.5 text-xs"
                        disabled={isSaving}
                      />
                    </div>
                  </FormField>

                  <FormField
                    label="Confirm New Password"
                    htmlFor="profile-confirm-password"
                    error={fieldErrors.confirmPassword}
                  >
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                      <Input
                        id="profile-confirm-password"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-9.5 text-xs"
                        disabled={isSaving}
                      />
                    </div>
                  </FormField>
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <Button type="submit" variant="primary" className="gap-2 text-xs" disabled={isSaving}>
                  {isSaving ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                      Saving Changes...
                    </span>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Profile Changes</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Account Metadata Card */}
        <Card className="border border-border bg-surface p-6 sm:p-8 space-y-4">
          <div className="border-b border-border/80 pb-3">
            <h3 className="font-serif text-lg font-medium text-text">Account Metadata & Scope</h3>
            <p className="text-xs text-text-muted">System records and role privileges.</p>
          </div>

          <div className="divide-y divide-border/60 text-xs text-text">
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-text-muted">Account Role:</span>
              <Badge variant="outline" className="capitalize text-[11px]">
                {user?.role?.replace('_', ' ') || 'authenticated user'}
              </Badge>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-text-muted">Member Since:</span>
              <span>{formatDate(user?.created_at)}</span>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-text-muted">Account Status:</span>
              <span className="inline-flex items-center gap-1.5 text-xs text-[#47765A] dark:text-[#C4CEB8]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Active & Verified</span>
              </span>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-text-muted">User UUID:</span>
              <span className="font-mono text-[11px] text-text-muted select-all">{user?.id || '—'}</span>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
