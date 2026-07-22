'use client'

import { LandingLangProvider } from '../_landing/lang-context'
import { LegalPage, type LegalPageProps } from './legal-page'

// Server → client boundary. The three legal routes are static server
// components; this thin client wrapper mounts the landing lang provider
// so LegalPage can consume the FR/EN toggle via useLanding().
export function LegalShell(props: LegalPageProps) {
  return (
    <LandingLangProvider>
      <LegalPage {...props} />
    </LandingLangProvider>
  )
}
