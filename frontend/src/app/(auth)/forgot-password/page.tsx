import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Container } from '@/components/ui/container';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Info, ArrowLeft, Mail, ShieldAlert } from 'lucide-react';

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-text transition-colors">
      <Header />

      <main className="flex-1 flex items-center justify-center py-12 sm:py-20">
        <Container className="max-w-md">
          <Card className="border border-border shadow-md bg-surface p-6 sm:p-8">
            <CardHeader className="text-center p-0 mb-6 space-y-2">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-1">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <CardTitle className="font-serif text-2xl font-medium text-text">
                Password Recovery
              </CardTitle>
              <p className="text-xs text-text-muted">
                Platform specification notice regarding automated credential reset.
              </p>
            </CardHeader>

            <CardContent className="p-0 space-y-5">
              <div className="p-4 rounded-md border border-amber-500/20 bg-amber-500/5 text-xs text-text space-y-2.5 leading-relaxed">
                <div className="flex items-center gap-2 font-medium text-amber-700 dark:text-amber-400">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>Automated Reset Deferred (SRS FR-AUTH-006)</span>
                </div>
                <p className="text-text-muted text-[11px] leading-relaxed">
                  In accordance with Estora MVP software specifications, automated email-based self-service
                  password resets are currently deferred to avoid unverified external third-party mailer dependencies.
                </p>
              </div>

              <div className="space-y-3 text-xs text-text-muted leading-relaxed">
                <p>
                  To request a credential reset or restore account access on a local or staging deployment, please
                  contact the system administrator directly:
                </p>
                <div className="p-3 rounded-md bg-surface-raised border border-border/80 flex items-center gap-3">
                  <Mail className="w-4 h-4 text-primary shrink-0" />
                  <code className="font-mono text-xs text-text font-medium select-all">
                    admin@estora.internal
                  </code>
                </div>
                <p className="text-[11px] text-text-muted/80">
                  Note: The address above represents the internal administrative account defined in project seed records.
                </p>
              </div>

              <div className="pt-4 border-t border-border/80 flex justify-center">
                <Link href="/login" className="w-full">
                  <Button variant="outline" className="w-full justify-center gap-2 text-xs">
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Return to Sign In</span>
                  </Button>
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
