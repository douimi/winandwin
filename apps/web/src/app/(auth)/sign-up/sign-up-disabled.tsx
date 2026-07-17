'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@winandwin/ui'
import { CheckCircle2, MailPlus, MessageCircle, Sparkles } from 'lucide-react'
import { whatsAppUrl } from '@/app/_landing/text'
import { useApp } from '@/lib/i18n/app-lang-context'

// Rendered by /sign-up when the `public_signup_enabled` platform flag is
// off. Same shell as the regular sign-up form so the top-right FR/EN
// toggle, brand mark and soft glow stay consistent — only the primary
// action changes from "create an account" to "contact us".
export function SignUpDisabled() {
  const { txt, lang } = useApp()

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center">
      <a href="/" className="mb-6 flex flex-col items-center gap-2">
        <img src="/logo.png" alt="Win & Win" className="h-48 w-auto" />
      </a>

      <Card className="w-full shadow-lg">
        <CardHeader className="pb-3 text-center">
          <div className="mx-auto mb-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            <Sparkles className="h-3 w-3" />
            {txt.signupDisabledBadge}
          </div>
          <CardTitle className="text-2xl font-semibold tracking-tight">
            {txt.signupDisabledTitle}
          </CardTitle>
          <p className="mt-2 text-sm text-muted-foreground">
            {txt.signupDisabledBody}
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Primary — WhatsApp: emerald so it visually reads as the fast path */}
          <a
            href={whatsAppUrl(lang)}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-emerald-500 hover:shadow-lg"
          >
            <MessageCircle className="h-4 w-4 fill-current" strokeWidth={0} />
            {txt.signupDisabledWhatsApp}
          </a>

          {/* Secondary — landing contact form */}
          <a
            href="/#contact"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-semibold text-foreground transition-all hover:-translate-y-0.5 hover:bg-accent"
          >
            <MailPlus className="h-4 w-4" />
            {txt.signupDisabledContactForm}
          </a>

          {/* Value-prop bullets — reassures visitors while they read */}
          <ul className="mt-2 space-y-2 rounded-xl border border-border bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
              {txt.signupDisabledLead1}
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
              {txt.signupDisabledLead2}
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
              {txt.signupDisabledLead3}
            </li>
          </ul>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {txt.signupDisabledHaveAccount}{' '}
            <a
              href="/sign-in"
              className="font-semibold text-primary transition-colors hover:underline"
            >
              {txt.signupDisabledSignIn}
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
