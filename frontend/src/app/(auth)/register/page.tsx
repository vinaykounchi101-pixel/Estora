'use client';

/**
 * User Registration Page
 * Creates user account via POST /api/v1/auth/register and logs user into session.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/use-auth';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Container } from '@/components/ui/container';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { AlertCircle, Lock, Mail, User, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const errors: {
      fullName?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (fullName && fullName.length > 100) {
      errors.fullName = 'Full name must not exceed 100 characters.';
    }

    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
    } else if (password.length > 128) {
      errors.password = 'Password must not exceed 128 characters.';
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
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
      await register({
        email: email.trim(),
        password,
        full_name: fullName.trim() || null,
      });
      router.push('/dashboard');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Registration failed. Please check your inputs.';
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
                <User className="w-5 h-5" />
              </div>
              <CardTitle className="font-serif text-2xl font-medium text-text">
                Create an Account
              </CardTitle>
              <p className="text-xs text-text-muted">
                Save property valuations, track asset estimates over time, and explore model provenance.
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
                <FormField label="Full Name (Optional)" htmlFor="register-name" error={fieldErrors.fullName}>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                    <Input
                      id="register-name"
                      type="text"
                      autoComplete="name"
                      placeholder="Jane Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-9.5 text-xs"
                      disabled={isSubmitting}
                    />
                  </div>
                </FormField>

                <FormField label="Email Address" htmlFor="register-email" error={fieldErrors.email} required>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                    <Input
                      id="register-email"
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

                <FormField
                  label="Password"
                  htmlFor="register-password"
                  error={fieldErrors.password}
                  hint="Minimum 8 characters"
                  required
                >
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                    <Input
                      id="register-password"
                      type="password"
                      autoComplete="new-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9.5 text-xs"
                      disabled={isSubmitting}
                    />
                  </div>
                </FormField>

                <FormField
                  label="Confirm Password"
                  htmlFor="register-confirm-password"
                  error={fieldErrors.confirmPassword}
                  required
                >
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                    <Input
                      id="register-confirm-password"
                      type="password"
                      autoComplete="new-password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-9.5 text-xs"
                      disabled={isSubmitting}
                    />
                  </div>
                </FormField>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full justify-center gap-2 mt-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2 text-xs">
                      <span className="w-3.5 h-3.5 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                      Creating Account...
                    </span>
                  ) : (
                    <>
                      <span>Register Account</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-5 border-t border-border/80 text-center text-xs text-text-muted">
                <span>Already have an account? </span>
                <Link
                  href="/login"
                  className="font-medium text-text hover:underline inline-flex items-center gap-1"
                >
                  Sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
