/**
 * Cloudflare DNS-over-HTTPS (DoH) client.
 * API: https://cloudflare-dns.com/dns-query
 * Works from the browser — no CORS issues, no backend needed.
 */

const DOH_URL = 'https://cloudflare-dns.com/dns-query'

// DNS record type numbers
const RECORD_TYPES: Record<string, number> = {
  A: 1,
  NS: 2,
  CNAME: 5,
  SOA: 6,
  MX: 15,
  TXT: 16,
  AAAA: 28,
}

export interface DoHRecord {
  name: string
  type: number
  TTL: number
  data: string
}

export interface DoHResponse {
  Status: number // 0 = NOERROR, 2 = SERVFAIL, 3 = NXDOMAIN
  TC: boolean
  RD: boolean
  RA: boolean
  AD: boolean
  CD: boolean
  Question: Array<{ name: string; type: number }>
  Answer?: DoHRecord[]
  Authority?: DoHRecord[]
  Comment?: string
}

/**
 * Query Cloudflare DNS-over-HTTPS.
 * @param name Domain name to query
 * @param type DNS record type (e.g. 'A', 'MX', 'TXT')
 */
export async function queryDNS(name: string, type: string): Promise<DoHResponse> {
  const typeNum = RECORD_TYPES[type.toUpperCase()] ?? type
  const url = new URL(DOH_URL)
  url.searchParams.set('name', name)
  url.searchParams.set('type', String(typeNum))

  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/dns-json' },
  })

  if (!res.ok) {
    throw new Error(`DNS query failed: HTTP ${res.status}`)
  }

  return res.json() as Promise<DoHResponse>
}

/**
 * Check if DoH status means NXDOMAIN (no records found).
 */
export function isNXDomain(response: DoHResponse): boolean {
  return response.Status === 3
}

/**
 * Clean a DNS name by removing trailing dot.
 */
export function cleanName(name: string): string {
  return name.endsWith('.') ? name.slice(0, -1) : name
}

/**
 * Parse TXT record data (may be quoted, may be multiple strings joined).
 */
export function parseTXTData(data: string): string {
  // Remove surrounding quotes and join multi-part strings
  return data.replace(/^"|"$/g, '').replace(/""/g, '').replace(/" "/g, '')
}
