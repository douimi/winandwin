'use client'

import { createContext, useContext } from 'react'

interface MerchantContextValue {
  merchantId: string
}

const MerchantContext = createContext<MerchantContextValue | null>(null)

export function MerchantProvider({
  merchantId,
  children,
}: {
  merchantId: string
  children: React.ReactNode
}) {
  return (
    <MerchantContext.Provider value={{ merchantId }}>
      {children}
    </MerchantContext.Provider>
  )
}

export function useMerchantId(): string {
  const ctx = useContext(MerchantContext)
  if (!ctx) {
    throw new Error('useMerchantId must be used within a MerchantProvider')
  }
  return ctx.merchantId
}
