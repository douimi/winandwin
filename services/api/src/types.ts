import type { Database } from '@winandwin/db'

export interface AppEnv {
  Bindings: {
    ENVIRONMENT: string
    DATABASE_URL: string
    ADMIN_API_KEY: string
    RESEND_API_KEY?: string
    ALLOWED_ORIGINS?: string
    // GAME_CONFIG_CACHE: KVNamespace
    // GAME_SESSION: DurableObjectNamespace
  }
  Variables: {
    db: Database
    merchantId?: string
    userId?: string
    requestId: string
  }
}
