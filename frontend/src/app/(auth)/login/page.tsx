'use client';

/**
 * User Login Page
 * Validates credentials via POST /api/v1/auth/login and establishes user session.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/use-auth';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Container } from '@/components/ui/container';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { AlertCircle, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const errors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      // Sanitize redirect URL to ensure it is internal
      const destination = redirectUrl.startsWith('/') && !redirectUrl.startsWith('//')
        ? redirectUrl
        : '/dashboard';
      router.push(destination);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Invalid credentials or connection failure.';
      setGeneralError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-text transition-colors">
      <Header />

      <main className="flex-1 flex items-center justify-center py-12 sm:py-20">
        <Container className="max-w-md">
          <Card className="border border-border shadow-md bg-surface p-6 sm:p-8">
            <CardHeader className="text-center p-0 mb-6 space-y-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-1">
                <Lock className="w-5 h-5" />
              </div>
              <CardTitle className="font-serif text-2xl font-medium text-text">
                Sign In to Estora
              </CardTitle>
              <p className="text-xs text-text-muted">
                Access your property valuation history, portfolio analytics, and decision reports.
              </p>
            </CardHeader>

            <CardContent className="p-0">
              {generalError && (
                <div
                  role="alert"
                  className="mb-5 p-3.5 rounded-md border border-red-500/30 bg-red-500/10 text-xs text-red-600 dark:text-red-400 flex items-start gap-2.5 leading-relaxed"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{generalError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <FormField label="Email Address" htmlFor="login-email" error={fieldErrors.email} required>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                    <Input
                      id="login-email"
                      type="email"
                      autoComplete="email"
                      placeholder="name@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9.5 text-xs"
                      disabled={isSubmitting}
                    />
                  </div>
                </FormField>

                <FormField label="Password" htmlFor="login-password" error={fieldErrors.password} required>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                    <Input
                      id="login-password"
                      type="password"
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9.5 text-xs"
                      disabled={isSubmitting}
                    />
                  </div>
                </FormField>

                <div className="flex items-center justify-end">
                  <Link
                    href="/forgot-password"
                    className="text-xs text-text-muted hover:text-text hover:underline transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full justify-center gap-2 mt-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2 text-xs">
                      <span className="w-3.5 h-3.5 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                      Authenticating...
                    </span>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-5 border-t border-border/80 text-center text-xs text-text-muted">
                <span>Do not have an account? </span>
                <Link
                  href="/register"
                  className="font-medium text-text hover:underline inline-flex items-center gap-1"
                >
                  Create an account
                </Link>
              </div>

              <div className="mt-6 p-3 rounded-md bg-surface-raised/40 border border-border/60 text-[11px] text-text-muted/80 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-sage shrink-0" />
                <span>Default admin: admin@estora.internal (seed password per SRS)</span>
              </div>
            </CardContent>
          </Card>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
