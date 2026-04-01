'use client'

/**
 * Overlay shown on top of a blurred preview when a feature is tier-locked.
 *
 * Usage:
 *   <ProFeatureLock locked={!hasFeature(tier, 'analytics.funnel')} label="Advanced Analytics">
 *     <FunnelChart ... />
 *   </ProFeatureLock>
 */
export function ProFeatureLock({
  locked,
  label,
  children,
}: {
  locked: boolean
  label?: string
  children: React.ReactNode
}) {
  if (!locked) return <>{children}</>

  return (
    <div className="relative">
      <div className="pointer-events-none select-none opacity-30 blur-[2px]">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl">{'🔒'}</span>
        {label && <p className="mt-1 text-sm font-medium">{label}</p>}
        <a
          href="/dashboard/upgrade"
          className="mt-1 text-xs font-medium text-primary hover:underline"
        >
          Upgrade to Pro {'->'}
        </a>
      </div>
    </div>
  )
}
