// Small server-side helpers for feature-flagging optional auth providers.
// Kept in its own module (not in auth.ts) so it can be imported into
// server components + client-boundary props without pulling the whole
// better-auth singleton into that graph.

export function isGoogleAuthEnabled(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
}
