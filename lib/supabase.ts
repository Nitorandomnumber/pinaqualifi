// ==============================================================================
// SUPABASE REST CLIENT — bastos_logs table (READ ONLY)
// ESP32 handles all writes/uploads to Supabase directly.
// The phone display only READS past records for viewing.
// Uses fetch() directly against the PostgREST API (no SDK dependency)
// ==============================================================================

const SUPABASE_URL = 'https://bqblzvgwkvdkanobntgn.supabase.co'
const SUPABASE_KEY = 'sb_publishable_cKKlFv0eCaArfywT-fqzaQ_QEXrLLbm'
const TABLE = 'bastos_logs'

export interface BastosLog {
  id?: number
  created_at?: string
  grade: string
  quality_score: string
  red_val: string
  green_val: string
  blue_val: string
  cleanliness: string
}

/**
 * Fetch past records from bastos_logs, ordered by most recent first.
 * Returns up to `limit` rows (default 100).
 */
export async function fetchPastRecords(limit = 100): Promise<BastosLog[]> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/${TABLE}?order=created_at.desc&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      },
    )

    if (!res.ok) {
      console.error('Supabase fetch error:', res.status, await res.text())
      return []
    }

    return (await res.json()) as BastosLog[]
  } catch (err) {
    console.error('Supabase fetch failed:', err)
    return []
  }
}
