import { queryDNS, parseTXTData, cleanName } from '@/lib/doh'
import type { TXTResult, TXTRecord } from '@/types'

function detectTXTType(val: string): TXTRecord['type'] {
  const lower = val.toLowerCase()
  if (lower.startsWith('v=spf1')) return 'spf'
  if (lower.startsWith('v=dkim1')) return 'dkim'
  if (lower.startsWith('v=dmarc1')) return 'dmarc'
  if (lower.includes('google-site-verification')) return 'google'
  if (lower.includes('ms=') || lower.includes('microsoft')) return 'microsoft'
  return 'generic'
}

export const txtService = {
  async lookup(domain: string): Promise<TXTResult> {
    const startTime = performance.now()
    const response = await queryDNS(domain, 'TXT')
    const queryTime = Math.round(performance.now() - startTime)

    if (response.Status === 3) {
      throw new Error(`Domain "${domain}" does not exist (NXDOMAIN).`)
    }

    if (response.Status !== 0) {
      throw new Error(`TXT lookup failed with status code ${response.Status}.`)
    }

    const answers = response.Answer || []
    const records: TXTRecord[] = answers.map((rec) => {
      const parsedValue = parseTXTData(rec.data)
      return {
        host: cleanName(rec.name),
        value: parsedValue,
        ttl: rec.TTL,
        type: detectTXTType(parsedValue),
      }
    })

    return {
      domain,
      records,
      queryTime,
      status: records.length > 0 ? 'pass' : 'not-found',
    }
  },
}
