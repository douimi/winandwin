const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8787'

export async function fetchGameConfig(slug: string) {
  const res = await fetch(`${API_BASE}/api/v1/play/${slug}`)
  const json = await res.json()
  if (!json.success) throw new Error(json.error?.message || 'Failed to load game')
  return json.data
}

export async function spinGame(
  slug: string,
  fingerprintId: string,
  completedActions: string[],
  testMode = false,
  playerName?: string,
  playerEmail?: string,
  hardwareId?: string,
) {
  const url = `${API_BASE}/api/v1/play/${slug}/spin${testMode ? '?testmode=unlimited' : ''}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fingerprintId, hardwareId, completedActions, playerName, playerEmail }),
  })
  const json = await res.json()
  if (!json.success) throw new Error(json.error?.message || 'Failed to play')
  return json.data
}

export async function fetchPlayerState(slug: string, fingerprintId: string, hardwareId?: string) {
  let url = `${API_BASE}/api/v1/play/${slug}/state?fingerprintId=${encodeURIComponent(fingerprintId)}`
  if (hardwareId) url += `&hardwareId=${encodeURIComponent(hardwareId)}`
  const res = await fetch(url)
  const json = await res.json()
  if (!json.success) return null
  return json.data
}
