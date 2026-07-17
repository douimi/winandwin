import { AppLangProvider, AppLanguageToggle } from '@/lib/i18n/app-lang-context'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  // Clean light auth shell that matches the dashboard's pro look.
  // No floating emojis, no dark gradient — just a soft radial wash so the
  // surface doesn't read as a blank slab.
  return (
    <AppLangProvider>
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
        {/* Soft top-right primary glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-32 h-[480px] w-[480px] rounded-full bg-primary/10 blur-3xl"
        />
        {/* Soft bottom-left sky glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 -left-32 h-[520px] w-[520px] rounded-full bg-sky-200/40 blur-3xl"
        />

        {/* Floating FR/EN toggle — top-right, so both sign-in and sign-up
            can be flipped without hunting for a control. */}
        <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
          <AppLanguageToggle />
        </div>

        <div className="relative z-10 w-full max-w-5xl">{children}</div>
      </div>
    </AppLangProvider>
  )
}
