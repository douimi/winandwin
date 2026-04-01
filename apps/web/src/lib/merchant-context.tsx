'use client'

import { createContext, useContext } from 'react'

interface MerchantContextValue {
  merchantId: string
  merchantTier: string
}

const MerchantContext = createContext<MerchantContextValue | null>(null)

export function MerchantProvider({
  merchantId,
  merchantTier,
  children,
}: {
  merchantId: string
  merchantTier?: string
  children: React.ReactNode
}) {
  return (
    <MerchantContext.Provider value={{ merchantId, merchantTier: merchantTier ?? 'free' }}>
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

export function useMerchantTier(): string {
  const ctx = useContext(MerchantContext)
  if (!ctx) {
    throw new Error('useMerchantTier must be used within a MerchantProvider')
  }
  return ctx.merchantTier
}
