export default function AuthLayout({ children }: { children: React.ReactNode }) {
  // Clean light auth shell that matches the dashboard's pro look.
  // No floating emojis, no dark gradient — just a soft radial wash so the
  // surface doesn't read as a blank slab.
  return (
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

      <div className="relative z-10 w-full max-w-5xl">{children}</div>
    </div>
  )
}
